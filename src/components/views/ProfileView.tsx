import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { BookOpen, Gamepad2, Flame, Star, TrendingUp, Award, Calendar, GraduationCap, Sun, Lock } from 'lucide-react-native';
import { User } from 'firebase/auth';
import { UserProfile } from '../../types';
import { Colors, getTheme } from '../../theme/colors';

interface ProfileViewProps {
  profile: UserProfile;
  darkMode?: boolean;
  currentUser?: User | null;
  onOpenAuth?: () => void;
}

const { width } = Dimensions.get('window');

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  darkMode = false,
  currentUser,
  onOpenAuth,
}) => {
  const theme = getTheme(darkMode);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'calendar':
        return <Calendar size={18} color="#f59e0b" />;
      case 'graduation':
        return <GraduationCap size={18} color="#10b981" />;
      case 'sun':
        return <Sun size={18} color="#f59e0b" />;
      case 'lock':
      default:
        return <Lock size={18} color="#94a3b8" />;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Avatar & User Header */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
          {/* Gold Star Badge on Avatar */}
          <View style={[styles.starBadge, { backgroundColor: Colors.accentGold }]}>
            <Star size={14} color="#ffffff" fill="#ffffff" />
          </View>
        </View>

        <Text style={[styles.userName, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
          {profile.name}
        </Text>
        <Text style={[styles.userRole, { color: theme.textSecondary }]}>
          {profile.role}
        </Text>
      </View>

      {/* 2. Activity Card with Orange Bar Chart */}
      <View style={[styles.activityCard, { backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderColor: theme.cardBorder }]}>
        <View style={styles.activityHeader}>
          <View>
            <Text style={[styles.activityTitle, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
              Aktivite
            </Text>
            <Text style={[styles.activitySubtitle, { color: theme.textMuted }]}>
              BU HAFTA ÇALIŞILAN KELİMELER
            </Text>
          </View>

          <View style={styles.streakCountRow}>
            <Text style={[styles.wordsThisWeekText, { color: darkMode ? '#fbbf24' : Colors.accentOrange }]}>
              {profile.wordsThisWeek}
            </Text>
            <TrendingUp size={18} color={darkMode ? '#fbbf24' : Colors.accentOrange} />
          </View>
        </View>

        {/* Weekly Day Activity Chart */}
        <View style={styles.chartRow}>
          {profile.weeklyActivity.map((day, idx) => {
            const maxCount = 50;
            const barHeight = Math.max(12, Math.round((day.count / maxCount) * 54));

            return (
              <View key={idx} style={styles.dayCol}>
                <View style={[styles.barTrack, { backgroundColor: darkMode ? '#334155' : '#fef3e2' }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: barHeight,
                        backgroundColor: day.active
                          ? darkMode
                            ? '#fbbf24'
                            : Colors.accentOrange
                          : darkMode
                          ? '#475569'
                          : '#fde68a',
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.dayLabel,
                    {
                      color: day.active
                        ? darkMode
                          ? '#fbbf24'
                          : Colors.accentOrange
                        : theme.textMuted,
                      fontWeight: day.active ? '900' : '600',
                    },
                  ]}
                >
                  {day.day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 3. 2 Stat Cards: Words Learned & Games Played */}
      <View style={styles.statsGrid}>
        {/* Words Learned */}
        <View style={[styles.statCard, { backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderColor: theme.cardBorder }]}>
          <View style={[styles.statIconBox, { backgroundColor: darkMode ? '#334155' : '#d8ebee' }]}>
            <BookOpen size={20} color={darkMode ? Colors.primaryAccent : Colors.primary} strokeWidth={2.2} />
          </View>
          <Text style={[styles.statValue, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
            {profile.wordsLearned.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Öğrenilen Kelimeler
          </Text>
        </View>

        {/* Games Played */}
        <View style={[styles.statCard, { backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderColor: theme.cardBorder }]}>
          <View style={[styles.statIconBox, { backgroundColor: darkMode ? '#334155' : '#d8ebee' }]}>
            <Gamepad2 size={20} color={darkMode ? Colors.primaryAccent : Colors.primary} strokeWidth={2.2} />
          </View>
          <Text style={[styles.statValue, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
            {profile.gamesPlayed}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Oynanan Oyunlar
          </Text>
        </View>
      </View>

      {/* 4. Gold Active Streak Banner */}
      <View style={[styles.streakBanner, { backgroundColor: Colors.accentGold }]}>
        <View>
          <Text style={styles.streakBannerDays}>
            {profile.activeStreak} Gün
          </Text>
          <Text style={styles.streakBannerSub}>
            Aktif Günlük Seri
          </Text>
        </View>

        <View style={styles.streakFlameCircle}>
          <Flame size={28} color="#ffffff" fill="#ffffff" />
        </View>
      </View>

      {/* 5. Rozetler / Badges */}
      <View style={styles.badgesSection}>
        <Text style={[styles.badgesTitle, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
          BAŞARILAR & ROZETLER
        </Text>
        <View style={styles.badgesList}>
          {profile.badges.map((b) => (
            <View
              key={b.id}
              style={[
                styles.badgeCard,
                {
                  backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                  borderColor: theme.cardBorder,
                  opacity: b.isUnlocked ? 1 : 0.6,
                },
              ]}
            >
              <View style={[styles.badgeIconWrap, { backgroundColor: darkMode ? '#334155' : '#f8fafc' }]}>
                {getBadgeIcon(b.icon)}
              </View>
              <View style={styles.badgeInfo}>
                <Text style={[styles.badgeName, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                  {b.title}
                </Text>
                <Text style={[styles.badgeDesc, { color: theme.textSecondary }]}>
                  {b.description}
                </Text>
              </View>
            </View>
          ))}
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  starBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  activityCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  activitySubtitle: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  streakCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wordsThisWeekText: {
    fontSize: 20,
    fontWeight: '900',
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 70,
    paddingHorizontal: 8,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  barTrack: {
    width: 12,
    height: 54,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  dayLabel: {
    fontSize: 11,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  streakBanner: {
    borderRadius: 26,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    shadowColor: '#c89b3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  streakBannerDays: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  streakBannerSub: {
    color: '#fef3e2',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  streakFlameCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesSection: {
    marginTop: 4,
  },
  badgesTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  badgesList: {
    gap: 10,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '800',
  },
  badgeDesc: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
