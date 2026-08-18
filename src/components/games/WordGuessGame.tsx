import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { ArrowLeft, RotateCcw, HelpCircle, Delete } from 'lucide-react-native';
import { GUESS_WORDS_POOL } from '../../data/mockData';
import { playPronunciation } from '../../utils/speech';
import { HapticsService } from '../../utils/haptics';
import { StorageService } from '../../utils/storage';
import { GameScoreBoard } from './GameScoreBoard';
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
  const [targetIndex, setTargetIndex] = useState(0);
  const target = GUESS_WORDS_POOL[targetIndex];
  const solution = target.word.toUpperCase(); // 5 letters

  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [message, setMessage] = useState('');

  // Score
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const maxAttempts = 6;

  useEffect(() => {
    StorageService.getHighScore('guess').then(setHighScore);
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

    const nextGuesses = [...guesses, currentGuess];
    setGuesses(nextGuesses);
    setCurrentGuess('');

    if (currentGuess === solution) {
      HapticsService.success();
      setHasWon(true);
      setIsGameOver(true);
      const pointsWon = Math.max(20, (7 - nextGuesses.length) * 20);
      const newScore = score + pointsWon;
      setScore(newScore);

      if (newScore > highScore) {
        setHighScore(newScore);
        StorageService.saveHighScore('guess', newScore);
      }

      playPronunciation(solution);
      if (onGameComplete) onGameComplete(true);
    } else if (nextGuesses.length >= maxAttempts) {
      HapticsService.error();
      setIsGameOver(true);
      if (onGameComplete) onGameComplete(false);
    } else {
      HapticsService.medium();
    }
  };

  const resetGame = () => {
    HapticsService.selection();
    const nextIdx = (targetIndex + 1) % GUESS_WORDS_POOL.length;
    setTargetIndex(nextIdx);
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

      {/* Score Board */}
      <GameScoreBoard currentScore={score} highScore={highScore} darkMode={darkMode} />

      {/* Hint Banner */}
      {showHint && (
        <View style={[styles.hintCard, { backgroundColor: darkMode ? '#1e293b' : '#fffbeb', borderColor: '#fde68a' }]}>
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

      {/* Game Result Banner */}
      {isGameOver && (
        <View
          style={[
            styles.resultCard,
            {
              backgroundColor: hasWon ? '#ecfdf5' : '#fff1f2',
              borderColor: hasWon ? '#6ee7b7' : '#fecdd3',
            },
          ]}
        >
          <Text style={[styles.resultTitle, { color: hasWon ? '#065f46' : '#9f1239' }]}>
            {hasWon ? '🎉 Tebrikler, Doğru Bildiniz!' : '😔 Deneme Hakkınız Bitti!'}
          </Text>
          <Text style={[styles.resultSub, { color: hasWon ? '#047857' : '#be123c' }]}>
            Doğru Kelime: <Text style={{ fontWeight: '900' }}>{solution}</Text> ({target.tr})
          </Text>
          <TouchableOpacity
            onPress={resetGame}
            style={[styles.nextBtn, { backgroundColor: hasWon ? '#10b981' : '#e11d48' }]}
          >
            <Text style={styles.nextBtnText}>Sıradaki Kelimeye Geç</Text>
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
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  resultSub: {
    fontSize: 13,
    marginBottom: 12,
  },
  nextBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 12,
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
