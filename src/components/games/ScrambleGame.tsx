import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Check,
  ArrowRight,
  SkipForward,
  Volume2,
  Lightbulb,
} from 'lucide-react-native';
import { getRandomScrambleWord, ScrambleWordItem } from '../../data/mockData';
import { playPronunciation } from '../../utils/speech';
import { HapticsService } from '../../utils/haptics';
import { StorageService } from '../../utils/storage';
import { GameScoreBoard } from './GameScoreBoard';
import { Colors, getTheme } from '../../theme/colors';

interface ScrambleGameProps {
  onBack: () => void;
  onGameComplete?: (won: boolean) => void;
  darkMode?: boolean;
}

interface SlotItem {
  id: string;
  char: string;
  isRevealed: boolean;
}

interface PoolItem {
  id: string;
  char: string;
}

const { width } = Dimensions.get('window');

const getScrambledPool = (word: string, fallbackScramble?: string): PoolItem[] => {
  let letters: string[];
  if (fallbackScramble && fallbackScramble.length === word.length) {
    letters = fallbackScramble.toUpperCase().split('');
  } else {
    letters = word.toUpperCase().split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    if (letters.join('') === word.toUpperCase() && letters.length > 1) {
      [letters[0], letters[1]] = [letters[1], letters[0]];
    }
  }
  return letters.map((char, index) => ({
    id: `${char}-${index}-${Math.random().toString(36).substring(2, 7)}`,
    char,
  }));
};

export const ScrambleGame: React.FC<ScrambleGameProps> = ({
  onBack,
  onGameComplete,
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);
  const [current, setCurrent] = useState<ScrambleWordItem>(() => getRandomScrambleWord());
  const solution = current.word.toUpperCase().split('');
  const wordLength = solution.length;

  const [availableLetters, setAvailableLetters] = useState<PoolItem[]>(() =>
    getScrambledPool(current.word, current.scramble)
  );
  const [slots, setSlots] = useState<(SlotItem | null)[]>(() =>
    Array(current.word.length).fill(null)
  );

  const [isCorrect, setIsCorrect] = useState(false);
  const [isPassed, setIsPassed] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Score
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    StorageService.getHighScore('scramble').then(setHighScore);
    // Açılışta daha önce oynanmamış taze bir kelime seç
    StorageService.getPlayedScrambleWords().then((played) => {
      if (played && played.length > 0 && played.includes(current.word.toUpperCase())) {
        const freshWord = getRandomScrambleWord(played);
        setCurrent(freshWord);
        setAvailableLetters(getScrambledPool(freshWord.word, freshWord.scramble));
        setSlots(Array(freshWord.word.length).fill(null));
      }
    });
  }, []);

  const handlePickLetter = (poolIndex: number) => {
    if (isCorrect || isPassed) return;
    const poolItem = availableLetters[poolIndex];
    if (!poolItem) return;

    // İlk boş yuvayı bul
    const emptyIndex = slots.findIndex((s) => s === null);
    if (emptyIndex === -1) return;

    HapticsService.light();

    const newSlots = [...slots];
    newSlots[emptyIndex] = {
      id: poolItem.id,
      char: poolItem.char,
      isRevealed: false,
    };
    setSlots(newSlots);

    setAvailableLetters((prev) => {
      const copy = [...prev];
      copy.splice(poolIndex, 1);
      return copy;
    });
  };

  const handleRemoveLetter = (slotIndex: number) => {
    if (isCorrect || isPassed) return;
    const slot = slots[slotIndex];
    if (!slot || slot.isRevealed) return; // İpucu ile açılan harf geri alınamaz

    HapticsService.light();

    setAvailableLetters((prev) => [...prev, { id: slot.id, char: slot.char }]);
    setSlots((prev) => {
      const copy = [...prev];
      copy[slotIndex] = null;
      return copy;
    });
  };

  const triggerSuccess = () => {
    HapticsService.success();
    setIsCorrect(true);
    setIsPassed(false);
    setIsError(false);

    const pointsWon = 25;
    const newScore = score + pointsWon;
    setScore(newScore);

    if (newScore > highScore) {
      setHighScore(newScore);
      StorageService.saveHighScore('scramble', newScore);
    }

    playPronunciation(current.word);
    StorageService.savePlayedScrambleWord(current.word);
    if (onGameComplete) onGameComplete(true);
  };

  const handleRevealLetter = () => {
    if (isCorrect || isPassed) return;

    // Henüz ipucuyla açılmamış yuva indekslerini tespit et
    const unrevealedIndices: number[] = [];
    for (let i = 0; i < wordLength; i++) {
      if (!slots[i] || !slots[i]?.isRevealed) {
        unrevealedIndices.push(i);
      }
    }

    if (unrevealedIndices.length === 0) return;

    // Rastgele bir açılmamış indeks seç
    const targetIdx = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
    const neededChar = solution[targetIdx];

    HapticsService.medium();

    const newSlots = [...slots];
    let newPool = [...availableLetters];

    const currentSlot = newSlots[targetIdx];

    if (currentSlot && currentSlot.char === neededChar) {
      // Slot zaten doğru harfi içeriyor, ipucu olarak kilitle
      newSlots[targetIdx] = {
        ...currentSlot,
        isRevealed: true,
      };
    } else {
      // Hedef slotta başka bir kullanıcı harfi varsa havuza iade et
      if (currentSlot && !currentSlot.isRevealed) {
        newPool.push({ id: currentSlot.id, char: currentSlot.char });
      }

      // Havuzda aranan harfi ara
      const poolMatchIdx = newPool.findIndex((item) => item.char === neededChar);

      if (poolMatchIdx !== -1) {
        const [takenItem] = newPool.splice(poolMatchIdx, 1);
        newSlots[targetIdx] = {
          id: takenItem.id,
          char: neededChar,
          isRevealed: true,
        };
      } else {
        // Havuzda yoksa başka bir kilitli olmayan kullanıcı yuvasında ara
        const otherSlotIdx = newSlots.findIndex(
          (s, idx) => idx !== targetIdx && s !== null && !s.isRevealed && s.char === neededChar
        );
        if (otherSlotIdx !== -1) {
          const otherSlot = newSlots[otherSlotIdx]!;
          newSlots[otherSlotIdx] = null;
          newSlots[targetIdx] = {
            id: otherSlot.id,
            char: neededChar,
            isRevealed: true,
          };
        } else {
          newSlots[targetIdx] = {
            id: `hint-${targetIdx}-${Date.now()}`,
            char: neededChar,
            isRevealed: true,
          };
        }
      }
    }

    setSlots(newSlots);
    setAvailableLetters(newPool);

    // Eğer tüm harfler dolduysa ve doğruysa otomatik tamamla
    const isAllFilled = newSlots.every((s) => s !== null);
    if (isAllFilled) {
      const formed = newSlots.map((s) => s?.char || '').join('');
      if (formed.toUpperCase() === current.word.toUpperCase()) {
        triggerSuccess();
      }
    }
  };

  const handlePass = () => {
    if (isCorrect || isPassed) return;

    HapticsService.medium();
    setIsPassed(true);
    setIsCorrect(false);
    setIsError(false);

    // Doğru kelimenin tüm harflerini yuvalara yerleştir
    const revealedAll: SlotItem[] = solution.map((char, index) => ({
      id: `pass-${char}-${index}`,
      char,
      isRevealed: true,
    }));
    setSlots(revealedAll);
    setAvailableLetters([]);

    playPronunciation(current.word);
    StorageService.savePlayedScrambleWord(current.word);
    if (onGameComplete) onGameComplete(false);
  };

  const handleCheck = () => {
    if (isCorrect || isPassed) return;
    const isAllFilled = slots.every((s) => s !== null);
    if (!isAllFilled) return;

    const formed = slots.map((s) => s?.char || '').join('');
    if (formed.toUpperCase() === current.word.toUpperCase()) {
      triggerSuccess();
    } else {
      HapticsService.error();
      setIsError(true);
      setTimeout(() => setIsError(false), 2000);
    }
  };

  const nextWord = async () => {
    HapticsService.selection();
    const played = await StorageService.getPlayedScrambleWords();
    const nextItem = getRandomScrambleWord([...played, current.word]);
    setCurrent(nextItem);
    setAvailableLetters(getScrambledPool(nextItem.word, nextItem.scramble));
    setSlots(Array(nextItem.word.length).fill(null));
    setIsCorrect(false);
    setIsPassed(false);
    setIsError(false);
    setShowHint(false);
  };

  const resetCurrent = () => {
    if (isCorrect || isPassed) return;
    HapticsService.selection();

    // İpucu olmayan kullanıcı harflerini havuza geri aktar
    const newSlots = [...slots];
    const returnedToPool: PoolItem[] = [];

    for (let i = 0; i < wordLength; i++) {
      const slot = newSlots[i];
      if (slot && !slot.isRevealed) {
        returnedToPool.push({ id: slot.id, char: slot.char });
        newSlots[i] = null;
      }
    }

    // Havuzdaki harfleri karıştır
    const allAvailable = [...availableLetters, ...returnedToPool];
    for (let i = allAvailable.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allAvailable[i], allAvailable[j]] = [allAvailable[j], allAvailable[i]];
    }

    setSlots(newSlots);
    setAvailableLetters(allAvailable);
    setIsError(false);
  };

  const filledCount = slots.filter((s) => s !== null).length;
  const unrevealedCount = slots.filter((s) => !s || !s.isRevealed).length;
  const isGameOver = isCorrect || isPassed;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={20} color={theme.textPrimary} />
          <Text style={[styles.backText, { color: theme.textPrimary }]}>Oyunlar</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
          Harf Karıştırma
        </Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowHint(!showHint)}
            style={[styles.actionBtn, { backgroundColor: darkMode ? '#334155' : '#e2eff2' }]}
          >
            <HelpCircle size={18} color={darkMode ? '#7ba983' : Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={resetCurrent}
            style={[styles.actionBtn, { backgroundColor: darkMode ? '#334155' : '#e2eff2' }]}
          >
            <RotateCcw size={18} color={darkMode ? '#7ba983' : Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Score Board */}
      <GameScoreBoard currentScore={score} highScore={highScore} darkMode={darkMode} />

      {/* Hint Box (Tanım & Anlam) */}
      {showHint && (
        <View style={[styles.hintCard, { backgroundColor: darkMode ? '#1e293b' : '#fffbeb', borderColor: '#fde68a' }]}>
          <Text style={[styles.hintTitle, { color: '#b45309' }]}>💡 Kelime Anlamı & İpucu:</Text>
          <Text style={[styles.hintText, { color: darkMode ? '#fcd34d' : '#92400e' }]}>
            {current.hint} — ({current.tr})
          </Text>
        </View>
      )}

      {/* Target Word Slots */}
      <View style={styles.targetSection}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Harfleri Sıralayın ({filledCount} / {wordLength}):
        </Text>
        <View style={styles.slotsRow}>
          {slots.map((slot, i) => {
            const isRevealed = slot?.isRevealed;
            const hasLetter = slot !== null;
            const letter = slot?.char || '';

            return (
              <TouchableOpacity
                key={i}
                onPress={() => handleRemoveLetter(i)}
                disabled={!hasLetter || isRevealed || isGameOver}
                activeOpacity={0.8}
                style={[
                  styles.slotTile,
                  {
                    backgroundColor: isCorrect
                      ? '#10b981'
                      : isPassed
                      ? darkMode ? '#78350f' : '#fef3c7'
                      : isError
                      ? '#fee2e2'
                      : isRevealed
                      ? darkMode ? '#1e3a5f' : '#e0f2fe'
                      : hasLetter
                      ? darkMode ? '#334155' : '#d8ebee'
                      : darkMode ? '#1e293b' : '#f1f5f9',
                    borderColor: isCorrect
                      ? '#10b981'
                      : isPassed
                      ? '#f59e0b'
                      : isError
                      ? '#ef4444'
                      : isRevealed
                      ? '#38bdf8'
                      : hasLetter
                      ? darkMode ? '#7ba983' : Colors.primary
                      : darkMode ? '#334155' : '#cbd5e1',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.slotText,
                    {
                      color: isCorrect
                        ? '#ffffff'
                        : isPassed
                        ? darkMode ? '#fbbf24' : '#b45309'
                        : isError
                        ? '#b91c1c'
                        : isRevealed
                        ? darkMode ? '#38bdf8' : '#0284c7'
                        : hasLetter
                        ? darkMode ? '#7ba983' : Colors.primaryDark
                        : 'transparent',
                    },
                  ]}
                >
                  {letter}
                </Text>
                {isRevealed && !isGameOver && (
                  <View style={styles.hintBadge}>
                    <Sparkles size={8} color="#0284c7" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Available Letters Pool */}
      <View style={styles.poolSection}>
        <View style={styles.poolHeaderRow}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            Kullanılabilir Harfler:
          </Text>
          {availableLetters.length === 0 && !isGameOver && (
            <Text style={[styles.poolEmptyNote, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
              Tüm harfler yerleştirildi 👍
            </Text>
          )}
        </View>
        <View style={styles.poolRow}>
          {availableLetters.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handlePickLetter(i)}
              disabled={isGameOver}
              activeOpacity={0.7}
              style={[
                styles.poolTile,
                {
                  backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                  borderColor: darkMode ? '#334155' : '#cbd5e1',
                },
              ]}
            >
              <Text style={[styles.poolText, { color: darkMode ? '#f8fafc' : '#0f172a' }]}>
                {item.char}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action Section */}
      {!isGameOver && (
        <View style={styles.actionControls}>
          {/* Helper Buttons: Harf Aç (İpucu) & Pas */}
          <View style={styles.helperActionsRow}>
            <TouchableOpacity
              onPress={handleRevealLetter}
              disabled={unrevealedCount === 0}
              activeOpacity={0.75}
              style={[
                styles.helperBtn,
                {
                  backgroundColor: darkMode ? '#1e293b' : '#f0fdf4',
                  borderColor: darkMode ? '#334155' : '#bbf7d0',
                  opacity: unrevealedCount === 0 ? 0.5 : 1,
                },
              ]}
            >
              <Lightbulb size={18} color={darkMode ? '#38bdf8' : '#0284c7'} strokeWidth={2.2} />
              <Text style={[styles.helperBtnText, { color: darkMode ? '#38bdf8' : '#0284c7' }]}>
                Harf Aç
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePass}
              activeOpacity={0.75}
              style={[
                styles.helperBtn,
                {
                  backgroundColor: darkMode ? '#1e293b' : '#fff1f2',
                  borderColor: darkMode ? '#334155' : '#fecdd3',
                },
              ]}
            >
              <SkipForward size={18} color={darkMode ? '#fda4af' : '#e11d48'} strokeWidth={2.2} />
              <Text style={[styles.helperBtnText, { color: darkMode ? '#fda4af' : '#e11d48' }]}>
                Pas Geç
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Check Button */}
          <TouchableOpacity
            onPress={handleCheck}
            disabled={filledCount !== wordLength}
            activeOpacity={0.8}
            style={[
              styles.checkBtn,
              {
                backgroundColor:
                  filledCount === wordLength
                    ? Colors.primary
                    : darkMode
                    ? '#334155'
                    : '#cbd5e1',
              },
            ]}
          >
            <Check size={18} color="#ffffff" strokeWidth={2.4} />
            <Text style={styles.checkBtnText}>Kelimeyi Kontrol Et</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Correct / Victory Card */}
      {isCorrect && (
        <View
          style={[
            styles.resultCard,
            {
              backgroundColor: darkMode ? 'rgba(6, 78, 59, 0.4)' : '#ecfdf5',
              borderColor: darkMode ? '#059669' : '#6ee7b7',
            },
          ]}
        >
          <View style={styles.resultBadge}>
            <Sparkles size={20} color="#10b981" />
          </View>
          <Text style={[styles.resultTitle, { color: darkMode ? '#6ee7b7' : '#065f46' }]}>
            Harika! Doğru Bildiniz (+25 Puan)
          </Text>

          <View style={styles.solutionRow}>
            <Text style={[styles.solutionWord, { color: darkMode ? '#ffffff' : '#064e3b' }]}>
              {current.word}
            </Text>
            <TouchableOpacity
              onPress={() => playPronunciation(current.word)}
              style={[
                styles.audioBtn,
                { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : '#d1fae5' },
              ]}
              activeOpacity={0.7}
            >
              <Volume2 size={18} color={darkMode ? '#ffffff' : '#047857'} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.solutionTr, { color: darkMode ? '#a7f3d0' : '#047857' }]}>
            Türkçe Anlamı: {current.tr}
          </Text>

          {current.hint ? (
            <Text style={[styles.solutionHint, { color: darkMode ? '#94a3b8' : '#64748b' }]}>
              "{current.hint}"
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={nextWord}
            style={[styles.nextBtn, { backgroundColor: '#10b981' }]}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>Sıradaki Kelime</Text>
            <ArrowRight size={16} color="#ffffff" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      )}

      {/* Passed Result Card */}
      {isPassed && (
        <View
          style={[
            styles.resultCard,
            {
              backgroundColor: darkMode ? 'rgba(136, 19, 55, 0.35)' : '#fff1f2',
              borderColor: darkMode ? '#be123c' : '#fecdd3',
            },
          ]}
        >
          <View
            style={[
              styles.resultBadge,
              { backgroundColor: darkMode ? '#881337' : '#ffe4e6' },
            ]}
          >
            <SkipForward size={20} color="#e11d48" />
          </View>
          <Text style={[styles.resultTitle, { color: darkMode ? '#fda4af' : '#9f1239' }]}>
            Pas Geçildi — Doğru Cevap
          </Text>

          <View style={styles.solutionRow}>
            <Text style={[styles.solutionWord, { color: darkMode ? '#ffffff' : '#881337' }]}>
              {current.word}
            </Text>
            <TouchableOpacity
              onPress={() => playPronunciation(current.word)}
              style={[
                styles.audioBtn,
                { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : '#fee2e2' },
              ]}
              activeOpacity={0.7}
            >
              <Volume2 size={18} color={darkMode ? '#ffffff' : '#be123c'} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.solutionTr, { color: darkMode ? '#fecdd3' : '#be123c' }]}>
            Türkçe Anlamı: {current.tr}
          </Text>

          {current.hint ? (
            <Text style={[styles.solutionHint, { color: darkMode ? '#94a3b8' : '#64748b' }]}>
              "{current.hint}"
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={nextWord}
            style={[styles.nextBtn, { backgroundColor: '#c46210' }]}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>Sıradaki Kelimeye Geç</Text>
            <ArrowRight size={16} color="#ffffff" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintCard: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  hintText: {
    fontSize: 13,
    fontWeight: '600',
  },
  targetSection: {
    marginVertical: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  slotTile: {
    width: 44,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  slotText: {
    fontSize: 18,
    fontWeight: '900',
  },
  hintBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poolSection: {
    marginVertical: 14,
  },
  poolHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  poolEmptyNote: {
    fontSize: 11,
    fontWeight: '700',
  },
  poolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  poolTile: {
    width: 46,
    height: 50,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  poolText: {
    fontSize: 20,
    fontWeight: '900',
  },
  actionControls: {
    marginTop: 14,
    gap: 10,
  },
  helperActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  helperBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  helperBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  checkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  checkBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  resultCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 18,
    gap: 8,
  },
  resultBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  solutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  solutionWord: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  audioBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solutionTr: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  solutionHint: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
