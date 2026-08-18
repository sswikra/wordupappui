import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Search, Flame, Volume2, Plus } from 'lucide-react-native';
import { Word, AppSettings } from '../../types';
import { playPronunciation } from '../../utils/speech';
import { HapticsService } from '../../utils/haptics';
import { Colors, getTheme } from '../../theme/colors';

interface HomeViewProps {
  wordOfTheDay: Word;
  suggestedWords: Word[];
  settings: AppSettings;
  streakCount: number;
  onOpenSearch: () => void;
  onOpenAddWord: () => void;
  onSelectWord: (word: Word) => void;
  onViewAllSuggested?: () => void;
  darkMode?: boolean;
}

const { width } = Dimensions.get('window');

export const HomeView: React.FC<HomeViewProps> = ({
  wordOfTheDay,
  suggestedWords,
  settings,
  streakCount,
  onOpenSearch,
  onOpenAddWord,
  onSelectWord,
  onViewAllSuggested,
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);

  const handlePronounce = (wordText: string) => {
    HapticsService.light();
    playPronunciation(wordText);
  };

  const dailyProgressPercent = Math.min(
    100,
    Math.round((settings.currentDayWordsCount / settings.dailyGoal) * 100)
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Daily Streak Pill */}
      <View style={styles.streakContainer}>
        <View
          style={[
            styles.streakPill,
            {
              backgroundColor: darkMode ? '#1e293b' : '#fff8f0',
              borderColor: darkMode ? '#334155' : 'rgba(196, 98, 16, 0.25)',
            },
          ]}
        >
          <Flame size={16} color={darkMode ? '#f59e0b' : Colors.accentOrange} strokeWidth={2.4} />
          <Text style={[styles.streakText, { color: darkMode ? '#fbbf24' : Colors.accentOrange }]}>
            {streakCount} Günlük Seri!
          </Text>
        </View>
      </View>

      {/* 2. Search Bar Trigger */}
      <TouchableOpacity
        onPress={() => {
          HapticsService.selection();
          onOpenSearch();
        }}
        activeOpacity={0.8}
        style={[
          styles.searchBar,
          {
            backgroundColor: darkMode ? '#1e293b' : '#e5eff3',
            borderColor: darkMode ? '#334155' : '#d1e3ec',
          },
        ]}
      >
        <Search size={18} color={darkMode ? Colors.primaryAccent : Colors.primary} strokeWidth={2.2} />
        <Text style={[styles.searchPlaceholder, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
          İngilizce veya Türkçe kelime ara...
        </Text>
      </TouchableOpacity>

      {/* 3. WORD OF THE DAY Card */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
          GÜNÜN KELİMESİ
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => {
          HapticsService.selection();
          onSelectWord(wordOfTheDay);
        }}
        activeOpacity={0.9}
        style={[
          styles.wotdCard,
          {
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            borderColor: theme.cardBorder,
          },
        ]}
      >
        <Text style={[styles.wotdWord, { color: darkMode ? '#fbbf24' : Colors.accentOrange }]}>
          {wordOfTheDay.word}
        </Text>

        {/* Badges: Part of Speech & Level */}
        <View style={styles.badgeRow}>
          <View style={[styles.posBadge, { backgroundColor: darkMode ? '#334155' : '#d8ebee' }]}>
            <Text style={[styles.posText, { color: darkMode ? Colors.primaryAccent : Colors.primaryDark }]}>
              {wordOfTheDay.partOfSpeech}
            </Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: darkMode ? '#334155' : '#fef3e2' }]}>
            <Text style={[styles.levelText, { color: darkMode ? '#fcd34d' : '#92400e' }]}>
              Seviye {wordOfTheDay.level}
            </Text>
          </View>
        </View>

        {/* Subtle Divider */}
        <View style={[styles.cardDivider, { backgroundColor: darkMode ? '#334155' : '#e2e8f0' }]} />

        {/* Turkish Translation */}
        <Text style={[styles.wotdTranslation, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
          {wordOfTheDay.translation}
        </Text>

        {/* Example Sentence & Pronounce Button */}
        <View style={styles.exampleRow}>
          <Text style={[styles.exampleText, { color: darkMode ? '#cbd5e1' : '#334155' }]}>
            "{wordOfTheDay.example}"
          </Text>

          <TouchableOpacity
            onPress={() => handlePronounce(wordOfTheDay.word)}
            activeOpacity={0.8}
            style={[styles.speakerBtn, { backgroundColor: Colors.accentGold }]}
            accessibilityLabel="Telaffuz et"
          >
            <Volume2 size={20} color="#ffffff" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* 4. SUGGESTED FOR YOU Grid */}
      <View style={[styles.sectionHeader, { marginTop: 18 }]}>
        <Text style={[styles.sectionTitle, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
          SENİN İÇİN ÖNERİLENLER
        </Text>
        <TouchableOpacity onPress={onViewAllSuggested || onOpenSearch}>
          <Text style={[styles.seeAllText, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
            Tümünü Gör
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid2x2}>
        {suggestedWords.slice(0, 3).map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              HapticsService.selection();
              onSelectWord(item);
            }}
            activeOpacity={0.85}
            style={[
              styles.suggestedCard,
              {
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <Text style={[styles.suggestedWord, { color: darkMode ? '#fbbf24' : Colors.accentOrange }]}>
              {item.word}
            </Text>
            <Text style={[styles.suggestedTr, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
              {item.translation}
            </Text>
          </TouchableOpacity>
        ))}

        {/* "+ Kelime Ekle" Shortcut Card */}
        <TouchableOpacity
          onPress={() => {
            HapticsService.selection();
            onOpenAddWord();
          }}
          activeOpacity={0.8}
          style={[
            styles.addWordCard,
            {
              backgroundColor: darkMode ? 'rgba(52, 92, 67, 0.15)' : '#ecfdf5',
              borderColor: darkMode ? 'rgba(123, 169, 131, 0.4)' : '#a7f3d0',
            },
          ]}
        >
          <View style={[styles.addIconCircle, { borderColor: darkMode ? Colors.primaryAccent : Colors.primary }]}>
            <Plus size={18} color={darkMode ? Colors.primaryAccent : Colors.primary} strokeWidth={2.8} />
          </View>
          <Text style={[styles.addCardText, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
            Kelime Ekle
          </Text>
        </TouchableOpacity>
      </View>

      {/* 5. Daily Goal Progress Card */}
      <View style={[styles.goalCard, { backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderColor: theme.cardBorder }]}>
        <View style={styles.goalHeader}>
          <Text style={[styles.goalTitle, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
            Günlük Hedef
          </Text>
          <View style={[styles.goalBadge, { backgroundColor: darkMode ? 'rgba(245, 158, 11, 0.2)' : '#fdecd2' }]}>
            <Text style={[styles.goalBadgeText, { color: darkMode ? '#fbbf24' : '#87450a' }]}>
              {settings.currentDayWordsCount}/{settings.dailyGoal} Kelime
            </Text>
          </View>
        </View>

        {/* Progress Track & Bar */}
        <View style={[styles.progressTrack, { backgroundColor: darkMode ? '#334155' : '#e2e8f0' }]}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${dailyProgressPercent}%`,
                backgroundColor: darkMode ? Colors.primaryAccent : Colors.primary,
              },
            ]}
          />
        </View>
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
  streakContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchPlaceholder: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
  },
  wotdCard: {
    borderRadius: 30,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  wotdWord: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  posBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  posText: {
    fontSize: 11,
    fontWeight: '800',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardDivider: {
    width: 220,
    height: 1,
    marginBottom: 16,
  },
  wotdTranslation: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 14,
  },
  exampleRow: {
    width: '100%',
    position: 'relative',
    minHeight: 48,
    justifyContent: 'center',
    paddingRight: 50,
  },
  exampleText: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 18,
  },
  speakerBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  suggestedCard: {
    width: (width - 42) / 2,
    minHeight: 95,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  suggestedWord: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 2,
  },
  suggestedTr: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  addWordCard: {
    width: (width - 42) / 2,
    minHeight: 95,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  addCardText: {
    fontSize: 12,
    fontWeight: '800',
  },
  goalCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
    marginTop: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  goalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
});
