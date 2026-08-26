import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Play, LayoutGrid, Link2, Shuffle, Trophy, LucideIcon } from 'lucide-react-native';
import { GameId } from '../../types';
import { WordGuessGame } from '../games/WordGuessGame';
import { WordMatchGame } from '../games/WordMatchGame';
import { ScrambleGame } from '../games/ScrambleGame';
import { StorageService } from '../../utils/storage';
import { HapticsService } from '../../utils/haptics';
import { Colors, getTheme } from '../../theme/colors';

interface GamesViewProps {
  darkMode?: boolean;
  onIncrementGamesPlayed?: () => void;
  onActiveGameChange?: (isActive: boolean) => void;
}

export const GamesView: React.FC<GamesViewProps> = ({
  darkMode = false,
  onIncrementGamesPlayed,
  onActiveGameChange,
}) => {
  const theme = getTheme(darkMode);
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [highScores, setHighScores] = useState<Record<GameId, number>>({
    guess: 0,
    match: 0,
    scramble: 0,
  });

  useEffect(() => {
    if (onActiveGameChange) {
      onActiveGameChange(activeGame !== null);
    }
  }, [activeGame, onActiveGameChange]);

  const loadHighScores = async () => {
    const guess = await StorageService.getHighScore('guess');
    const match = await StorageService.getHighScore('match');
    const scramble = await StorageService.getHighScore('scramble');
    setHighScores({ guess, match, scramble });
  };

  useEffect(() => {
    loadHighScores();
  }, [activeGame]);

  const handleGameFinish = (won: boolean) => {
    if (onIncrementGamesPlayed) {
      onIncrementGamesPlayed();
    }
  };

  const handleExitGame = () => {
    setActiveGame(null);
  };

  // If a game is currently active, render that specific game screen
  if (activeGame === 'guess') {
    return <WordGuessGame onBack={handleExitGame} onGameComplete={handleGameFinish} darkMode={darkMode} />;
  }
  if (activeGame === 'match') {
    return <WordMatchGame onBack={handleExitGame} onGameComplete={handleGameFinish} darkMode={darkMode} />;
  }
  if (activeGame === 'scramble') {
    return <ScrambleGame onBack={handleExitGame} onGameComplete={handleGameFinish} darkMode={darkMode} />;
  }

  const gamesList: {
    id: GameId;
    title: string;
    description: string;
    icon: LucideIcon;
  }[] = [
    {
      id: 'guess',
      title: 'Kelime Tahmini',
      description: '6 denemede 5 harfli kelimeyi tahmin edin.',
      icon: LayoutGrid,
    },
    {
      id: 'match',
      title: 'Kelime Eşleştirme',
      description: 'Kelimeleri doğru anlamlarıyla eşleştirin.',
      icon: Link2,
    },
    {
      id: 'scramble',
      title: 'Harf Karıştırma',
      description: 'Karışık harflerden kelimeleri bulun.',
      icon: Shuffle,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Title Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
          Mini Oyunlar
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Eğlenirken kelime dağarcığınızı geliştirin.
        </Text>
      </View>

      {/* Games List */}
      <View style={styles.list}>
        {gamesList.map((game) => {
          const Icon = game.icon;
          const score = highScores[game.id] || 0;

          return (
            <View
              key={game.id}
              style={[
                styles.gameCard,
                {
                  backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              {/* Card Header: Icon & High Score */}
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: darkMode ? '#334155' : '#d8ebee' }]}>
                  <Icon size={22} color={darkMode ? Colors.primaryAccent : Colors.primary} strokeWidth={2.2} />
                </View>

                <View
                  style={[
                    styles.highScoreBadge,
                    {
                      backgroundColor: darkMode ? 'rgba(52, 92, 67, 0.3)' : '#ecfdf5',
                      borderColor: darkMode ? 'rgba(123, 169, 131, 0.4)' : '#a7f3d0',
                    },
                  ]}
                >
                  <Trophy size={13} color={darkMode ? '#86efac' : Colors.primary} strokeWidth={2.4} />
                  <Text style={[styles.highScoreText, { color: darkMode ? '#86efac' : Colors.primary }]}>
                    En Yüksek: {score}
                  </Text>
                </View>
              </View>

              {/* Title & Description */}
              <View style={styles.infoSection}>
                <Text style={[styles.gameTitle, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                  {game.title}
                </Text>
                <Text style={[styles.gameDesc, { color: theme.textSecondary }]}>
                  {game.description}
                </Text>
              </View>

              {/* Play Button */}
              <TouchableOpacity
                onPress={() => {
                  HapticsService.selection();
                  setActiveGame(game.id);
                }}
                activeOpacity={0.85}
                style={[styles.playBtn, { backgroundColor: Colors.accentOrange }]}
              >
                <Play size={14} color="#ffffff" fill="#ffffff" />
                <Text style={styles.playBtnText}>Oyna</Text>
              </TouchableOpacity>
            </View>
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
    paddingBottom: 110,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  list: {
    gap: 14,
  },
  gameCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  highScoreText: {
    fontSize: 11,
    fontWeight: '800',
  },
  infoSection: {
    marginBottom: 14,
  },
  gameTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  gameDesc: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#c46210',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  playBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
