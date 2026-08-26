import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Play, LayoutGrid, Link2, Shuffle, LucideIcon } from 'lucide-react-native';
import { GameId } from '../../types';
import { WordGuessGame } from '../games/WordGuessGame';
import { WordMatchGame } from '../games/WordMatchGame';
import { ScrambleGame } from '../games/ScrambleGame';
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

  useEffect(() => {
    if (onActiveGameChange) {
      onActiveGameChange(activeGame !== null);
    }
  }, [activeGame, onActiveGameChange]);

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
              {/* Card Header: Icon */}
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: darkMode ? '#334155' : '#d8ebee' }]}>
                  <Icon size={22} color={darkMode ? Colors.primaryAccent : Colors.primary} strokeWidth={2.2} />
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
    marginBottom: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
