import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { ArrowLeft, RotateCcw, HelpCircle, Heart, Check } from 'lucide-react-native';
import { HANGMAN_WORDS } from '../../data/mockData';
import { playPronunciation } from '../../utils/speech';
import { HapticsService } from '../../utils/haptics';
import { StorageService } from '../../utils/storage';
import { GameScoreBoard } from './GameScoreBoard';
import { Colors, getTheme } from '../../theme/colors';

interface HangmanGameProps {
  onBack: () => void;
  onGameComplete?: (won: boolean) => void;
  darkMode?: boolean;
}

const { width } = Dimensions.get('window');

export const HangmanGame: React.FC<HangmanGameProps> = ({
  onBack,
  onGameComplete,
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);
  const [index, setIndex] = useState(0);
  const current = HANGMAN_WORDS[index];
  const word = current.word.toUpperCase();

  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [fullGuess, setFullGuess] = useState('');
  const [guessMessage, setGuessMessage] = useState<string | null>(null);

  // Score
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const maxMistakes = 6;
  const mistakes = guessedLetters.filter((l) => !word.includes(l)).length;
  const isWon = word.split('').every((l) => guessedLetters.includes(l));
  const isLost = mistakes >= maxMistakes;

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    StorageService.getHighScore('hangman').then(setHighScore);
  }, []);

  const handleGuess = (letter: string) => {
    if (guessedLetters.includes(letter) || isWon || isLost) return;

    HapticsService.light();
    const nextGuessed = [...guessedLetters, letter];
    setGuessedLetters(nextGuessed);

    const nextMistakes = nextGuessed.filter((l) => !word.includes(l)).length;
    const nextWon = word.split('').every((l) => nextGuessed.includes(l));

    if (nextWon) {
      HapticsService.success();
      const pointsWon = Math.max(15, (maxMistakes - nextMistakes) * 10 + 20);
      const newScore = score + pointsWon;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        StorageService.saveHighScore('hangman', newScore);
      }
      playPronunciation(word);
      if (onGameComplete) onGameComplete(true);
    } else if (nextMistakes >= maxMistakes) {
      HapticsService.error();
      if (onGameComplete) onGameComplete(false);
    }
  };

  const handleFullWordSubmit = () => {
    if (!fullGuess.trim() || isWon || isLost) return;

    const cleanGuess = fullGuess.trim().toUpperCase();
    if (cleanGuess === word) {
      HapticsService.success();
      const allLetters = Array.from(new Set(word.split('')));
      setGuessedLetters((prev) => Array.from(new Set([...prev, ...allLetters])));
      const pointsWon = (maxMistakes - mistakes) * 10 + 30;
      const newScore = score + pointsWon;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        StorageService.saveHighScore('hangman', newScore);
      }
      playPronunciation(word);
      if (onGameComplete) onGameComplete(true);
      setFullGuess('');
    } else {
      HapticsService.error();
      const unusedWrongLetter = alphabet.find((l) => !word.includes(l) && !guessedLetters.includes(l)) || '#';
      setGuessedLetters((prev) => [...prev, unusedWrongLetter]);
      setGuessMessage('Yanlış tahmin! 1 can kaybettiniz.');
      setTimeout(() => setGuessMessage(null), 2000);
      setFullGuess('');
    }
  };

  const resetGame = () => {
    HapticsService.selection();
    const nextIdx = (index + 1) % HANGMAN_WORDS.length;
    setIndex(nextIdx);
    setGuessedLetters([]);
    setShowHint(false);
    setFullGuess('');
    setGuessMessage(null);
  };

  const strokeColor = darkMode ? '#94a3b8' : '#334155';
  const figureColor = darkMode ? '#f87171' : '#dc2626';

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
          Adam Asmaca
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

      {/* Score */}
      <GameScoreBoard currentScore={score} highScore={highScore} darkMode={darkMode} />

      {/* Lives / Mistakes Tracker */}
      <View style={[styles.livesCard, { backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderColor: theme.cardBorder }]}>
        <View style={styles.livesRow}>
          {Array(maxMistakes)
            .fill(null)
            .map((_, i) => (
              <Heart
                key={i}
                size={20}
                color="#ef4444"
                fill={i < maxMistakes - mistakes ? '#ef4444' : 'transparent'}
              />
            ))}
        </View>
        <Text style={[styles.livesText, { color: darkMode ? '#f87171' : '#dc2626' }]}>
          {maxMistakes - mistakes} Can Kaldı
        </Text>
      </View>

      {/* Hangman SVG Drawing */}
      <View style={[styles.drawingContainer, { backgroundColor: darkMode ? '#1e293b' : '#f8fafc' }]}>
        <Svg height="140" width="160" viewBox="0 0 160 140">
          {/* Gallows */}
          <Line x1="20" y1="130" x2="80" y2="130" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <Line x1="40" y1="130" x2="40" y2="20" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <Line x1="40" y1="20" x2="110" y2="20" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <Line x1="110" y1="20" x2="110" y2="38" stroke={strokeColor} strokeWidth="2" />

          {/* 1. Head */}
          {mistakes >= 1 && <Circle cx="110" cy="48" r="10" stroke={figureColor} strokeWidth="2.5" fill="none" />}
          {/* 2. Body */}
          {mistakes >= 2 && <Line x1="110" y1="58" x2="110" y2="90" stroke={figureColor} strokeWidth="2.5" strokeLinecap="round" />}
          {/* 3. Left Arm */}
          {mistakes >= 3 && <Line x1="110" y1="68" x2="95" y2="80" stroke={figureColor} strokeWidth="2.5" strokeLinecap="round" />}
          {/* 4. Right Arm */}
          {mistakes >= 4 && <Line x1="110" y1="68" x2="125" y2="80" stroke={figureColor} strokeWidth="2.5" strokeLinecap="round" />}
          {/* 5. Left Leg */}
          {mistakes >= 5 && <Line x1="110" y1="90" x2="96" y2="112" stroke={figureColor} strokeWidth="2.5" strokeLinecap="round" />}
          {/* 6. Right Leg */}
          {mistakes >= 6 && <Line x1="110" y1="90" x2="124" y2="112" stroke={figureColor} strokeWidth="2.5" strokeLinecap="round" />}
        </Svg>
      </View>

      {/* Hint Box */}
      {showHint && (
        <View style={[styles.hintCard, { backgroundColor: darkMode ? '#1e293b' : '#fffbeb', borderColor: '#fde68a' }]}>
          <Text style={[styles.hintTitle, { color: '#b45309' }]}>💡 Kategori & İpucu:</Text>
          <Text style={[styles.hintText, { color: darkMode ? '#fcd34d' : '#92400e' }]}>
            {current.category} — {current.hint} ({current.tr})
          </Text>
        </View>
      )}

      {/* Message */}
      {guessMessage ? (
        <View style={styles.errorMsg}>
          <Text style={styles.errorMsgText}>{guessMessage}</Text>
        </View>
      ) : null}

      {/* Word Letters Display */}
      <View style={styles.wordDisplay}>
        {word.split('').map((letter, i) => {
          const isRevealed = guessedLetters.includes(letter) || isLost;

          return (
            <View
              key={i}
              style={[
                styles.letterUnderline,
                { borderBottomColor: darkMode ? '#7ba983' : Colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.wordLetter,
                  {
                    color: isLost && !guessedLetters.includes(letter)
                      ? '#ef4444'
                      : darkMode
                      ? '#f8fafc'
                      : '#0f172a',
                  },
                ]}
              >
                {isRevealed ? letter : ''}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Win/Lose Card */}
      {(isWon || isLost) && (
        <View
          style={[
            styles.resultCard,
            {
              backgroundColor: isWon ? '#ecfdf5' : '#fff1f2',
              borderColor: isWon ? '#6ee7b7' : '#fecdd3',
            },
          ]}
        >
          <Text style={[styles.resultTitle, { color: isWon ? '#065f46' : '#9f1239' }]}>
            {isWon ? '🎉 Tebrikler! Adamı Kurtardınız!' : '💀 Maalesef Kaybettiniz!'}
          </Text>
          <Text style={[styles.resultSub, { color: isWon ? '#047857' : '#be123c' }]}>
            Kelime: <Text style={{ fontWeight: '900' }}>{word}</Text> ({current.tr})
          </Text>
          <TouchableOpacity
            onPress={resetGame}
            style={[styles.nextBtn, { backgroundColor: isWon ? '#10b981' : '#e11d48' }]}
          >
            <Text style={styles.nextBtnText}>Sıradaki Kelime</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Full Word Guess Input */}
      {!isWon && !isLost && (
        <View style={styles.fullGuessRow}>
          <TextInput
            value={fullGuess}
            onChangeText={setFullGuess}
            placeholder="Tüm kelimeyi tahmin et..."
            placeholderTextColor={darkMode ? '#64748b' : '#94a3b8'}
            autoCapitalize="characters"
            style={[
              styles.fullGuessInput,
              {
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                borderColor: theme.cardBorder,
                color: theme.textPrimary,
              },
            ]}
          />
          <TouchableOpacity
            onPress={handleFullWordSubmit}
            style={[styles.fullGuessBtn, { backgroundColor: Colors.primary }]}
          >
            <Check size={18} color="#ffffff" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      )}

      {/* Alphabet Keyboard */}
      <View style={styles.keypad}>
        {alphabet.map((letter) => {
          const isGuessed = guessedLetters.includes(letter);

          return (
            <TouchableOpacity
              key={letter}
              onPress={() => handleGuess(letter)}
              disabled={isGuessed || isWon || isLost}
              activeOpacity={0.7}
              style={[
                styles.keyBtn,
                {
                  backgroundColor: isGuessed
                    ? darkMode
                      ? '#334155'
                      : '#cbd5e1'
                    : darkMode
                    ? '#1e293b'
                    : '#ffffff',
                  borderColor: isGuessed ? 'transparent' : darkMode ? '#334155' : '#e2e8f0',
                  opacity: isGuessed ? 0.35 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.keyBtnText,
                  {
                    color: isGuessed
                      ? '#94a3b8'
                      : darkMode
                      ? '#f8fafc'
                      : '#0f172a',
                  },
                ]}
              >
                {letter}
              </Text>
            </TouchableOpacity>
          );
        })}
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
  livesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  livesRow: {
    flexDirection: 'row',
    gap: 4,
  },
  livesText: {
    fontSize: 12,
    fontWeight: '800',
  },
  drawingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 6,
  },
  hintCard: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 8,
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
  errorMsg: {
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 4,
  },
  errorMsgText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700',
  },
  wordDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 16,
  },
  letterUnderline: {
    width: 28,
    height: 36,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordLetter: {
    fontSize: 22,
    fontWeight: '900',
  },
  resultCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 10,
    gap: 6,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  resultSub: {
    fontSize: 13,
  },
  nextBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 14,
    marginTop: 4,
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  fullGuessRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  fullGuessInput: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: '700',
  },
  fullGuessBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginTop: 10,
  },
  keyBtn: {
    width: (width - 74) / 7,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
