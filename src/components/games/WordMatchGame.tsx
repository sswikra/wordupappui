import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { ArrowLeft, RotateCcw, Sparkles, Timer } from 'lucide-react-native';
import { MATCH_PAIRS_POOL } from '../../data/mockData';
import { HapticsService } from '../../utils/haptics';
import { StorageService } from '../../utils/storage';
import { GameScoreBoard } from './GameScoreBoard';
import { Colors, getTheme } from '../../theme/colors';

interface WordMatchGameProps {
  onBack: () => void;
  onGameComplete?: (won: boolean) => void;
  darkMode?: boolean;
}

interface TileItem {
  id: string;
  text: string;
  pairId: string;
  type: 'EN' | 'TR';
  isMatched: boolean;
}

const { width } = Dimensions.get('window');

export const WordMatchGame: React.FC<WordMatchGameProps> = ({
  onBack,
  onGameComplete,
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);
  const [tiles, setTiles] = useState<TileItem[]>([]);
  const [selectedFirst, setSelectedFirst] = useState<TileItem | null>(null);
  const [selectedSecond, setSelectedSecond] = useState<TileItem | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Score
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    StorageService.getHighScore('match').then(setHighScore);
    initGame();
  }, []);

  // Timer
  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWon]);

  const initGame = () => {
    const shuffledPairs = [...MATCH_PAIRS_POOL].sort(() => 0.5 - Math.random()).slice(0, 5);

    const enTiles: TileItem[] = shuffledPairs.map((p, i) => ({
      id: `en-${i}`,
      text: p.en,
      pairId: `pair-${i}`,
      type: 'EN',
      isMatched: false,
    }));

    const trTiles: TileItem[] = shuffledPairs.map((p, i) => ({
      id: `tr-${i}`,
      text: p.tr,
      pairId: `pair-${i}`,
      type: 'TR',
      isMatched: false,
    }));

    const allTiles = [...enTiles, ...trTiles].sort(() => 0.5 - Math.random());
    setTiles(allTiles);
    setSelectedFirst(null);
    setSelectedSecond(null);
    setSeconds(0);
    setIsWon(false);
  };

  const handleTilePress = (tile: TileItem) => {
    if (tile.isMatched || selectedFirst?.id === tile.id || selectedSecond) return;

    HapticsService.light();

    if (!selectedFirst) {
      setSelectedFirst(tile);
    } else {
      setSelectedSecond(tile);

      // Check Match
      if (selectedFirst.pairId === tile.pairId && selectedFirst.type !== tile.type) {
        // Matched
        HapticsService.success();
        setTimeout(() => {
          setTiles((prev) => {
            const next = prev.map((t) =>
              t.pairId === tile.pairId ? { ...t, isMatched: true } : t
            );
            const allMatched = next.every((t) => t.isMatched);
            if (allMatched) {
              setIsWon(true);
              const timeBonus = Math.max(10, 60 - seconds);
              const updatedScore = score + 20 + timeBonus;
              setScore(updatedScore);
              if (updatedScore > highScore) {
                setHighScore(updatedScore);
                StorageService.saveHighScore('match', updatedScore);
              }
              if (onGameComplete) onGameComplete(true);
            }
            return next;
          });

          const updatedScore = score + 20;
          setScore(updatedScore);
          setSelectedFirst(null);
          setSelectedSecond(null);
        }, 350);
      } else {
        // Mismatch
        HapticsService.error();
        setTimeout(() => {
          setSelectedFirst(null);
          setSelectedSecond(null);
        }, 700);
      }
    }
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
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
          Kelime Eşleştirme
        </Text>

        <TouchableOpacity
          onPress={initGame}
          style={[styles.actionBtn, { backgroundColor: darkMode ? '#334155' : '#e2eff2' }]}
        >
          <RotateCcw size={18} color={darkMode ? '#7ba983' : Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Score and Timer Bar */}
      <GameScoreBoard currentScore={score} highScore={highScore} darkMode={darkMode} />

      <View style={[styles.timerCard, { backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderColor: theme.cardBorder }]}>
        <View style={styles.timerRow}>
          <Timer size={18} color={darkMode ? '#f59e0b' : Colors.accentOrange} />
          <Text style={[styles.timerText, { color: darkMode ? '#f8fafc' : '#1e293b' }]}>
            Süre: {formatTime(seconds)}
          </Text>
        </View>
        <Text style={[styles.matchedText, { color: darkMode ? '#86efac' : '#15803d' }]}>
          {tiles.filter((t) => t.isMatched).length / 2} / 5 Eşleşme
        </Text>
      </View>

      {/* Tiles 2-Column Grid */}
      <View style={styles.grid}>
        {tiles.map((tile) => {
          const isSelected = selectedFirst?.id === tile.id || selectedSecond?.id === tile.id;
          const isError =
            selectedFirst &&
            selectedSecond &&
            (selectedFirst.id === tile.id || selectedSecond.id === tile.id) &&
            selectedFirst.pairId !== selectedSecond.pairId;

          return (
            <TouchableOpacity
              key={tile.id}
              onPress={() => handleTilePress(tile)}
              disabled={tile.isMatched}
              activeOpacity={0.8}
              style={[
                styles.tile,
                {
                  backgroundColor: tile.isMatched
                    ? darkMode
                      ? '#0f172a'
                      : '#f1f5f9'
                    : isError
                    ? '#fee2e2'
                    : isSelected
                    ? darkMode
                      ? '#334155'
                      : '#d8ebee'
                    : darkMode
                    ? '#1e293b'
                    : '#ffffff',
                  borderColor: tile.isMatched
                    ? 'transparent'
                    : isError
                    ? '#ef4444'
                    : isSelected
                    ? darkMode
                      ? '#7ba983'
                      : Colors.primary
                    : darkMode
                    ? '#334155'
                    : '#e2e8f0',
                  opacity: tile.isMatched ? 0.35 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.tileText,
                  {
                    color: tile.isMatched
                      ? '#94a3b8'
                      : isError
                      ? '#b91c1c'
                      : isSelected
                      ? darkMode
                        ? '#7ba983'
                        : Colors.primaryDark
                      : darkMode
                      ? '#f8fafc'
                      : '#1e293b',
                    fontWeight: tile.type === 'EN' ? '900' : '700',
                  },
                ]}
              >
                {tile.text}
              </Text>
              <Text style={[styles.tileBadge, { color: darkMode ? '#64748b' : '#94a3b8' }]}>
                {tile.type === 'EN' ? 'EN' : 'TR'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Win Modal Banner */}
      {isWon && (
        <View style={[styles.winCard, { backgroundColor: '#ecfdf5', borderColor: '#6ee7b7' }]}>
          <Sparkles size={24} color="#10b981" />
          <Text style={styles.winTitle}>Tebrikler! Tüm Çiftleri Eşleştirdiniz!</Text>
          <Text style={styles.winSub}>Tamamlama Süresi: {formatTime(seconds)}</Text>
          <TouchableOpacity onPress={initGame} style={[styles.playAgainBtn, { backgroundColor: '#10b981' }]}>
            <Text style={styles.playAgainText}>Yeni Tur Oyna</Text>
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
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '800',
  },
  matchedText: {
    fontSize: 13,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  tile: {
    width: (width - 42) / 2,
    minHeight: 70,
    borderRadius: 18,
    borderWidth: 2,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  tileText: {
    fontSize: 15,
    textAlign: 'center',
  },
  tileBadge: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 4,
  },
  winCard: {
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 18,
    gap: 6,
  },
  winTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#065f46',
  },
  winSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 8,
  },
  playAgainBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  playAgainText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
