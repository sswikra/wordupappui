import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Trophy } from 'lucide-react-native';
import { Colors, getTheme } from '../../theme/colors';

interface GameScoreBoardProps {
  currentScore: number;
  highScore: number;
  darkMode?: boolean;
}

export const GameScoreBoard: React.FC<GameScoreBoardProps> = ({
  currentScore,
  highScore,
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#1e293b' : '#f8fafc', borderColor: theme.cardBorder }]}>
      {/* Current Score Box - Amber/Orange */}
      <View
        style={[
          styles.scoreBox,
          {
            backgroundColor: darkMode ? 'rgba(196, 98, 16, 0.15)' : '#fff8f0',
            borderColor: darkMode ? 'rgba(196, 98, 16, 0.4)' : '#fde68a',
          },
        ]}
      >
        <View style={styles.labelRow}>
          <View style={[styles.iconBadge, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
            <Flame size={14} color="#f59e0b" strokeWidth={2.4} />
          </View>
          <Text style={[styles.labelText, { color: darkMode ? '#fcd34d' : '#b45309' }]}>
            Mevcut Skor
          </Text>
        </View>
        <Text style={[styles.scoreValue, { color: darkMode ? '#fbbf24' : '#c46210' }]}>
          {currentScore}
        </Text>
      </View>

      {/* High Score Box - Green/Olive */}
      <View
        style={[
          styles.scoreBox,
          {
            backgroundColor: darkMode ? 'rgba(52, 92, 67, 0.25)' : '#ecfdf5',
            borderColor: darkMode ? 'rgba(123, 169, 131, 0.4)' : '#a7f3d0',
          },
        ]}
      >
        <View style={styles.labelRow}>
          <View style={[styles.iconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <Trophy size={14} color={darkMode ? '#7ba983' : '#345c43'} strokeWidth={2.4} />
          </View>
          <Text style={[styles.labelText, { color: darkMode ? '#86efac' : '#15803d' }]}>
            En Yüksek
          </Text>
        </View>
        <Text style={[styles.scoreValue, { color: darkMode ? '#86efac' : '#345c43' }]}>
          {highScore}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 12,
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  scoreBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '900',
  },
});
