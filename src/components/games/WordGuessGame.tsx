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
  HelpCircle,
  Delete,
  Volume2,
  CheckCircle2,
  XCircle,
  Target,
  ArrowRight,
} from 'lucide-react-native';
import { getRandomGuessWord, GuessWordItem } from '../../data/mockData';
import { playPronunciation } from '../../utils/speech';
import { HapticsService } from '../../utils/haptics';
import { StorageService } from '../../utils/storage';
import { isValid5LetterWord } from '../../utils/wordValidation';
import { Colors, getTheme } from '../../theme/colors';

interface WordGuessGameProps {
  onBack: () => void;
  onGameComplete?: (won: boolean) => void;
  darkMode?: boolean;
}

const { width } = Dimensions.get('window');
const TILE_SIZE = Math.min(54, (width - 64) / 5);

export const WordGuessGame: React.FC<WordGuessGameProps> = ({
  onBack,
  onGameComplete,
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);
  const [target, setTarget] = useState<GuessWordItem>(() => getRandomGuessWord());
  const solution = target.word.toUpperCase(); // 5 letters

  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [message, setMessage] = useState('');

  const maxAttempts = 6;

  // Oyun ilk açıldığında daha önce oynanmamış taze bir kelime gelmesini güvenceye al
  useEffect(() => {
    StorageService.getPlayedGuessWords().then((played) => {
      if (played && played.length > 0 && played.includes(target.word.toUpperCase())) {
        const freshWord = getRandomGuessWord(played);
        setTarget(freshWord);
      }
    });
  }, []);

  const handleKeyPress = (letter: string) => {
    if (isGameOver) return;
    if (currentGuess.length < 5) {
      HapticsService.light();
      setCurrentGuess((prev) => prev + letter.toUpperCase());
    }
  };

  const handleDelete = () => {
    if (isGameOver) return;
    HapticsService.light();
    setCurrentGuess((prev) => prev.slice(0, -1));
  };

  const handleEnter = () => {
    if (isGameOver) return;
    if (currentGuess.length !== 5) {
      HapticsService.error();
      setMessage('Kelime 5 harfli olmalıdır');
      setTimeout(() => setMessage(''), 1500);
      return;
    }

    if (!isValid5LetterWord(currentGuess)) {
      HapticsService.error();
      setMessage('Anlamlı bir kelime giriniz');
      setTimeout(() => setMessage(''), 1800);
      return;
    }

    const nextGuesses = [...guesses, currentGuess];
    setGuesses(nextGuesses);
    setCurrentGuess('');

    if (currentGuess === solution) {
      HapticsService.success();
      setHasWon(true);
      setIsGameOver(true);
      playPronunciation(solution);
      StorageService.savePlayedGuessWord(solution);
      if (onGameComplete) onGameComplete(true);
    } else if (nextGuesses.length >= maxAttempts) {
      HapticsService.error();
      setIsGameOver(true);
      setHasWon(false);
      StorageService.savePlayedGuessWord(solution);
      if (onGameComplete) onGameComplete(false);
    } else {
      HapticsService.medium();
    }
  };

  const resetGame = async () => {
    HapticsService.selection();
    const played = await StorageService.getPlayedGuessWords();
    const nextWord = getRandomGuessWord([...played, solution]);
    setTarget(nextWord);
    setGuesses([]);
    setCurrentGuess('');
    setIsGameOver(false);
    setHasWon(false);
    setShowHint(false);
    setMessage('');
  };

  const getTileStatus = (rowIndex: number, colIndex: number) => {
    if (rowIndex < guesses.length) {
      const guessWord = guesses[rowIndex];
      const letter = guessWord[colIndex];
      if (letter === solution[colIndex]) {
        return 'correct';
      }
      if (solution.includes(letter)) {
        return 'present';
      }
      return 'absent';
    }
    return 'empty';
  };

  const getLetterStatus = (letter: string) => {
    let status = 'default';
    for (const g of guesses) {
      for (let i = 0; i < 5; i++) {
        if (g[i] === letter) {
          if (solution[i] === letter) {
            return 'correct';
          } else if (solution.includes(letter)) {
            status = 'present';
          } else if (status === 'default') {
            status = 'absent';
          }
        }
      }
    }
    return status;
  };

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={20} color={theme.textPrimary} />
          <Text style={[styles.backText, { color: theme.textPrimary }]}>Oyunlar</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
          Kelime Tahmini
        </Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowHint(!showHint)}
            style={[styles.actionBtn, { backgroundColor: darkMode ? '#334155' : '#e2eff2' }]}
          >
            <HelpCircle size={18} color={darkMode ? '#7ba983' : Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={resetGame}
            style={[styles.actionBtn, { backgroundColor: darkMode ? '#334155' : '#e2eff2' }]}
          >
            <RotateCcw size={18} color={darkMode ? '#7ba983' : Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Attempt Status Bar (Replaces old Score Board) */}
      <View
        style={[
          styles.attemptCard,
          {
            backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
            borderColor: theme.cardBorder,
          },
        ]}
      >
        <View style={styles.attemptInfo}>
          <View
            style={[
              styles.attemptIconCircle,
              {
                backgroundColor: isGameOver
                  ? hasWon
                    ? darkMode
                      ? 'rgba(16, 185, 129, 0.2)'
                      : '#d1fae5'
                    : darkMode
                    ? 'rgba(239, 68, 68, 0.2)'
                    : '#fee2e2'
                  : darkMode
                  ? 'rgba(196, 98, 16, 0.2)'
                  : '#fff8f0',
              },
            ]}
          >
            {isGameOver ? (
              hasWon ? (
                <CheckCircle2 size={18} color="#10b981" strokeWidth={2.4} />
              ) : (
                <XCircle size={18} color="#ef4444" strokeWidth={2.4} />
              )
            ) : (
              <Target size={18} color={darkMode ? '#fbbf24' : '#c46210'} strokeWidth={2.4} />
            )}
          </View>
          <View style={styles.attemptTextContainer}>
            <Text style={[styles.attemptTitle, { color: theme.textPrimary }]}>
              {isGameOver
                ? hasWon
                  ? `${guesses.length}. Tahminde Bulundu! 🎉`
                  : '6 Tahminde Bulunamadı'
                : `Tahmin: ${Math.min(guesses.length + 1, maxAttempts)} / ${maxAttempts}`}
            </Text>
            <Text style={[styles.attemptSub, { color: theme.textSecondary }]}>
              {isGameOver
                ? hasWon
                  ? 'Tebrikler, kelimeyi başarıyla çözdünüz!'
                  : 'Doğru cevap aşağıda gösterildi'
                : `${maxAttempts - guesses.length} tahmin hakkınız kaldı`}
            </Text>
          </View>
        </View>

        {/* 6 Step Progress Pills */}
        <View style={styles.stepPills}>
          {Array(maxAttempts)
            .fill(null)
            .map((_, i) => {
              const isGuessed = i < guesses.length;
              const isCurrent = i === guesses.length && !isGameOver;
              const isSuccessStep = isGameOver && hasWon && i === guesses.length - 1;

              return (
                <View
                  key={i}
                  style={[
                    styles.stepPill,
                    {
                      backgroundColor: isSuccessStep
                        ? '#10b981'
                        : isGuessed
                        ? darkMode
                          ? '#475569'
                          : '#94a3b8'
                        : isCurrent
                        ? darkMode
                          ? Colors.primaryAccent
                          : Colors.primary
                        : darkMode
                        ? '#334155'
                        : '#e2e8f0',
                    },
                  ]}
                />
              );
            })}
        </View>
      </View>

      {/* Hint Banner */}
      {showHint && (
        <View
          style={[
            styles.hintCard,
            {
              backgroundColor: darkMode ? '#1e293b' : '#fffbeb',
              borderColor: '#fde68a',
            },
          ]}
        >
          <Text style={[styles.hintTitle, { color: '#b45309' }]}>💡 İpucu:</Text>
          <Text style={[styles.hintText, { color: darkMode ? '#fcd34d' : '#92400e' }]}>
            {target.hint} ({target.tr})
          </Text>
        </View>
      )}

      {/* Message Toast */}
      {message ? (
        <View style={styles.messageBanner}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}

      {/* 5x6 Grid */}
      <View style={styles.gridContainer}>
        {Array(maxAttempts)
          .fill(null)
          .map((_, rowIndex) => {
            const isCurrentRow = rowIndex === guesses.length;
            const currentGuessArray = isCurrentRow ? currentGuess.padEnd(5, ' ').split('') : [];

            return (
              <View key={rowIndex} style={styles.gridRow}>
                {Array(5)
                  .fill(null)
                  .map((_, colIndex) => {
                    let letter = '';
                    let status = 'empty';

                    if (rowIndex < guesses.length) {
                      letter = guesses[rowIndex][colIndex] || '';
                      status = getTileStatus(rowIndex, colIndex);
                    } else if (isCurrentRow) {
                      letter = currentGuessArray[colIndex]?.trim() || '';
                    }

                    return (
                      <View
                        key={colIndex}
                        style={[
                          styles.tile,
                          {
                            backgroundColor:
                              status === 'correct'
                                ? '#10b981'
                                : status === 'present'
                                ? '#f59e0b'
                                : status === 'absent'
                                ? darkMode
                                  ? '#334155'
                                  : '#94a3b8'
                                : darkMode
                                ? '#1e293b'
                                : '#ffffff',
                            borderColor:
                              letter && status === 'empty'
                                ? darkMode
                                  ? '#7ba983'
                                  : Colors.primary
                                : status === 'empty'
                                ? darkMode
                                  ? '#334155'
                                  : '#cbd5e1'
                                : 'transparent',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.tileText,
                            {
                              color:
                                status !== 'empty'
                                  ? '#ffffff'
                                  : darkMode
                                  ? '#f8fafc'
                                  : '#0f172a',
                            },
                          ]}
                        >
                          {letter}
                        </Text>
                      </View>
                    );
                  })}
              </View>
            );
          })}
      </View>

      {/* Game Result Card */}
      {isGameOver && (
        <View
          style={[
            styles.resultCard,
            {
              backgroundColor: hasWon
                ? darkMode
                  ? 'rgba(6, 78, 59, 0.6)'
                  : '#ecfdf5'
                : darkMode
                ? 'rgba(136, 19, 55, 0.6)'
                : '#fff1f2',
              borderColor: hasWon
                ? darkMode
                  ? '#059669'
                  : '#a7f3d0'
                : darkMode
                ? '#be123c'
                : '#fecdd3',
            },
          ]}
        >
          <Text
            style={[
              styles.resultTitle,
              {
                color: hasWon
                  ? darkMode
                    ? '#6ee7b7'
                    : '#065f46'
                  : darkMode
                  ? '#fda4af'
                  : '#9f1239',
              },
            ]}
          >
            {hasWon
              ? `🎉 Harika! ${guesses.length}. Tahminde Buldunuz!`
              : '😔 6 Tahminde Bulunamadı!'}
          </Text>

          <View style={styles.solutionContainer}>
            <Text
              style={[
                styles.solutionLabel,
                {
                  color: hasWon
                    ? darkMode
                      ? '#a7f3d0'
                      : '#047857'
                    : darkMode
                    ? '#fecdd3'
                    : '#be123c',
                },
              ]}
            >
              {hasWon ? 'Doğru Kelime:' : 'Doğru Cevap:'}
            </Text>
            <View style={styles.solutionWordRow}>
              <Text
                style={[
                  styles.solutionWord,
                  {
                    color: hasWon
                      ? darkMode
                        ? '#ffffff'
                        : '#064e3b'
                      : darkMode
                      ? '#ffffff'
                        : '#881337',
                  },
                ]}
              >
                {solution}
              </Text>
              <TouchableOpacity
                onPress={() => playPronunciation(solution)}
                style={[
                  styles.audioBtn,
                  {
                    backgroundColor: hasWon
                      ? darkMode
                        ? 'rgba(255, 255, 255, 0.15)'
                        : '#d1fae5'
                      : darkMode
                      ? 'rgba(255, 255, 255, 0.15)'
                      : '#fee2e2',
                  },
                ]}
                activeOpacity={0.7}
              >
                <Volume2
                  size={16}
                  color={
                    hasWon
                      ? darkMode
                        ? '#ffffff'
                        : '#047857'
                      : darkMode
                      ? '#ffffff'
                      : '#be123c'
                  }
                />
              </TouchableOpacity>
            </View>
            <Text
              style={[
                styles.solutionTranslation,
                {
                  color: hasWon
                    ? darkMode
                      ? '#a7f3d0'
                      : '#047857'
                    : darkMode
                    ? '#fecdd3'
                    : '#be123c',
                },
              ]}
            >
              {target.tr}
            </Text>
          </View>

          <TouchableOpacity
            onPress={resetGame}
            style={[
              styles.nextBtn,
              {
                backgroundColor: hasWon ? '#10b981' : '#e11d48',
              },
            ]}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>Sıradaki Kelimeye Geç</Text>
            <ArrowRight size={16} color="#ffffff" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      )}

      {/* On-screen Keyboard */}
      <View style={styles.keyboard}>
        {keyboardRows.map((row, rIdx) => (
          <View key={rIdx} style={styles.keyboardRow}>
            {row.map((key) => {
              const isSpecial = key === 'ENTER' || key === 'DEL';
              const status = getLetterStatus(key);

              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => {
                    if (key === 'ENTER') handleEnter();
                    else if (key === 'DEL') handleDelete();
                    else handleKeyPress(key);
                  }}
                  activeOpacity={0.7}
                  style={[
                    styles.key,
                    isSpecial && styles.specialKey,
                    {
                      backgroundColor:
                        status === 'correct'
                          ? '#10b981'
                          : status === 'present'
                          ? '#f59e0b'
                          : status === 'absent'
                          ? darkMode
                            ? '#334155'
                            : '#94a3b8'
                          : darkMode
                          ? '#1e293b'
                          : '#e2e8f0',
                    },
                  ]}
                >
                  {key === 'DEL' ? (
                    <Delete size={18} color={darkMode ? '#ffffff' : '#334155'} />
                  ) : (
                    <Text
                      style={[
                        styles.keyText,
                        isSpecial && styles.specialKeyText,
                        {
                          color:
                            status !== 'default'
                              ? '#ffffff'
                              : darkMode
                              ? '#f8fafc'
                              : '#1e293b',
                        },
                      ]}
                    >
                      {key}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
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
  attemptCard: {
    marginVertical: 10,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  attemptInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  attemptIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attemptTextContainer: {
    flex: 1,
  },
  attemptTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  attemptSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  stepPills: {
    flexDirection: 'row',
    gap: 6,
  },
  stepPill: {
    flex: 1,
    height: 5,
    borderRadius: 3,
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
  messageBanner: {
    backgroundColor: '#0f172a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 10,
  },
  messageText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  gridContainer: {
    alignItems: 'center',
    gap: 6,
    marginVertical: 10,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    fontSize: 22,
    fontWeight: '900',
  },
  resultCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 12,
    gap: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  solutionContainer: {
    alignItems: 'center',
    gap: 4,
  },
  solutionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  solutionWordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  solutionWord: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  audioBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solutionTranslation: {
    fontSize: 14,
    fontWeight: '700',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 16,
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
  keyboard: {
    marginTop: 14,
    gap: 6,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  key: {
    height: 44,
    minWidth: (width - 70) / 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialKey: {
    minWidth: (width - 70) / 6.5,
  },
  keyText: {
    fontSize: 14,
    fontWeight: '800',
  },
  specialKeyText: {
    fontSize: 11,
  },
});
