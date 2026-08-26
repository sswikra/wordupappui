import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { ArrowLeft, RotateCcw, Sparkles, HelpCircle, Check, ArrowRight } from 'lucide-react-native';
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

const { width } = Dimensions.get('window');

const getScrambledLetters = (word: string, fallbackScramble?: string): string[] => {
  if (fallbackScramble && fallbackScramble.length === word.length) {
    return fallbackScramble.toUpperCase().split('');
  }
  const letters = word.toUpperCase().split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  if (letters.join('') === word.toUpperCase() && letters.length > 1) {
    [letters[0], letters[1]] = [letters[1], letters[0]];
  }
  return letters;
};

export const ScrambleGame: React.FC<ScrambleGameProps> = ({
  onBack,
  onGameComplete,
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);
  const [current, setCurrent] = useState<ScrambleWordItem>(() => getRandomScrambleWord());

  const [availableLetters, setAvailableLetters] = useState<string[]>(() =>
    getScrambledLetters(current.word, current.scramble)
  );
  const [userLetters, setUserLetters] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
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
        setAvailableLetters(getScrambledLetters(freshWord.word, freshWord.scramble));
      }
    });
  }, []);

  const handlePickLetter = (letterIndex: number) => {
    if (isCorrect) return;
    const letter = availableLetters[letterIndex];
    if (!letter) return;

    HapticsService.light();
    setUserLetters((prev) => [...prev, letter]);
    setAvailableLetters((prev) => {
      const copy = [...prev];
      copy.splice(letterIndex, 1);
      return copy;
    });
  };

  const handleRemoveLetter = (letterIndex: number) => {
    if (isCorrect) return;
    const letter = userLetters[letterIndex];
    if (!letter) return;

    HapticsService.light();
    setAvailableLetters((prev) => [...prev, letter]);
    setUserLetters((prev) => {
      const copy = [...prev];
      copy.splice(letterIndex, 1);
      return copy;
    });
  };

  const handleCheck = () => {
    const formed = userLetters.join('');
    if (formed.toUpperCase() === current.word.toUpperCase()) {
      HapticsService.success();
      setIsCorrect(true);
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
    setAvailableLetters(getScrambledLetters(nextItem.word, nextItem.scramble));
    setUserLetters([]);
    setIsCorrect(false);
    setIsError(false);
    setShowHint(false);
  };

  const resetCurrent = () => {
    HapticsService.selection();
    setAvailableLetters(getScrambledLetters(current.word, current.scramble));
    setUserLetters([]);
    setIsCorrect(false);
    setIsError(false);
  };

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

      {/* Hint Box */}
      {showHint && (
        <View style={[styles.hintCard, { backgroundColor: darkMode ? '#1e293b' : '#fffbeb', borderColor: '#fde68a' }]}>
          <Text style={[styles.hintTitle, { color: '#b45309' }]}>💡 İpucu & Anlamı:</Text>
          <Text style={[styles.hintText, { color: darkMode ? '#fcd34d' : '#92400e' }]}>
            {current.hint} — ({current.tr})
          </Text>
        </View>
      )}

      {/* Target Word Slots */}
      <View style={styles.targetSection}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Harfleri Sıralayın ({userLetters.length} / {current.word.length}):
        </Text>
        <View style={styles.slotsRow}>
          {Array(current.word.length)
            .fill(null)
            .map((_, i) => {
              const letter = userLetters[i];
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleRemoveLetter(i)}
                  disabled={!letter || isCorrect}
                  activeOpacity={0.8}
                  style={[
                    styles.slotTile,
                    {
                      backgroundColor: isCorrect
                        ? '#10b981'
                        : isError
                        ? '#fee2e2'
                        : letter
                        ? darkMode
                          ? '#334155'
                          : '#d8ebee'
                        : darkMode
                        ? '#1e293b'
                        : '#f1f5f9',
                      borderColor: isCorrect
                        ? '#10b981'
                        : isError
                        ? '#ef4444'
                        : letter
                        ? darkMode
                          ? '#7ba983'
                          : Colors.primary
                        : darkMode
                        ? '#334155'
                        : '#cbd5e1',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.slotText,
                      {
                        color: isCorrect
                          ? '#ffffff'
                          : isError
                          ? '#b91c1c'
                          : letter
                          ? darkMode
                            ? '#7ba983'
                            : Colors.primaryDark
                          : 'transparent',
                      },
                    ]}
                  >
                    {letter || ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </View>
      </View>

      {/* Available Letters Pool */}
      <View style={styles.poolSection}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Kullanılabilir Harfler:
        </Text>
        <View style={styles.poolRow}>
          {availableLetters.map((letter, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handlePickLetter(i)}
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
                {letter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action / Check Button */}
      {isCorrect ? (
        <View style={[styles.correctCard, { backgroundColor: '#ecfdf5', borderColor: '#6ee7b7' }]}>
          <Sparkles size={22} color="#10b981" />
          <Text style={styles.correctTitle}>Harika! Doğru Kelime: {current.word}</Text>
          <Text style={styles.correctSub}>Türkçe Anlamı: {current.tr}</Text>
          <TouchableOpacity onPress={nextWord} style={[styles.nextBtn, { backgroundColor: '#10b981' }]}>
            <Text style={styles.nextBtnText}>Sıradaki Kelime</Text>
            <ArrowRight size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleCheck}
          disabled={userLetters.length !== current.word.length}
          activeOpacity={0.8}
          style={[
            styles.checkBtn,
            {
              backgroundColor:
                userLetters.length === current.word.length
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
  },
  slotText: {
    fontSize: 18,
    fontWeight: '900',
  },
  poolSection: {
    marginVertical: 14,
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
  checkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 20,
  },
  checkBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  correctCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  correctTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#065f46',
  },
  correctSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 8,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
