import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  X,
  Flame,
  BookOpen,
  Moon,
  Sun,
  Sparkles,
  Award,
  Heart,
} from 'lucide-react-native';
import { UserProfile, AppSettings, TabType } from '../../types';
import { HapticsService } from '../../utils/haptics';
import { Colors, getTheme } from '../../theme/colors';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  settings: AppSettings;
  onToggleDarkMode: () => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenSearch: () => void;
}

const { width } = Dimensions.get('window');

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  settings,
  onToggleDarkMode,
  onNavigateTab,
  onOpenSearch,
}) => {
  const theme = getTheme(settings.darkMode);

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={[styles.drawerCard, { backgroundColor: settings.darkMode ? '#0f172a' : '#ffffff' }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
            <View style={styles.brandRow}>
              <Text style={[styles.logoText, { color: settings.darkMode ? Colors.primaryAccent : Colors.primary }]}>
                WordMem
              </Text>
              <View style={[styles.verBadge, { backgroundColor: settings.darkMode ? '#334155' : '#d8ebee' }]}>
                <Text style={[styles.verText, { color: settings.darkMode ? Colors.primaryAccent : Colors.primaryDark }]}>
                  v1.0
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.drawerScroll}>
            {/* User Snapshot Card */}
            <TouchableOpacity
              onPress={() => {
                HapticsService.selection();
                onNavigateTab('profile');
                onClose();
              }}
              activeOpacity={0.85}
              style={[
                styles.profileSnapshot,
                {
                  backgroundColor: settings.darkMode ? '#1e293b' : '#f8fafc',
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <View style={styles.userRow}>
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                <View style={styles.userTexts}>
                  <Text style={[styles.profileName, { color: theme.textPrimary }]}>
                    {profile.name}
                  </Text>
                  <Text style={[styles.profileRole, { color: theme.textMuted }]}>
                    {profile.role}
                  </Text>
                </View>
              </View>

              <View style={[styles.statsDivider, { borderTopColor: theme.cardBorder }]}>
                <View style={styles.streakInline}>
                  <Flame size={15} color="#f59e0b" fill="#f59e0b" />
                  <Text style={styles.streakInlineText}>{profile.activeStreak} Günlük Seri</Text>
                </View>
                <Text style={[styles.wordsLearnedInline, { color: settings.darkMode ? Colors.primaryAccent : Colors.primary }]}>
                  {profile.wordsLearned} Kelime
                </Text>
              </View>
            </TouchableOpacity>

            {/* Nav Links */}
            <View style={styles.linksContainer}>
              <TouchableOpacity
                onPress={() => {
                  HapticsService.selection();
                  onNavigateTab('home');
                  onClose();
                }}
                style={[styles.navLink, { backgroundColor: settings.darkMode ? '#1e293b' : '#f8fafc' }]}
              >
                <Sparkles size={18} color={settings.darkMode ? Colors.primaryAccent : Colors.primary} />
                <Text style={[styles.navLinkText, { color: theme.textPrimary }]}>Günün Kelimesi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  HapticsService.selection();
                  onClose();
                  onOpenSearch();
                }}
                style={[styles.navLink, { backgroundColor: settings.darkMode ? '#1e293b' : '#f8fafc' }]}
              >
                <BookOpen size={18} color={settings.darkMode ? Colors.primaryAccent : Colors.primary} />
                <Text style={[styles.navLinkText, { color: theme.textPrimary }]}>Sözlükte Ara</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  HapticsService.selection();
                  onNavigateTab('games');
                  onClose();
                }}
                style={[styles.navLink, { backgroundColor: settings.darkMode ? '#1e293b' : '#f8fafc' }]}
              >
                <Award size={18} color="#f59e0b" />
                <Text style={[styles.navLinkText, { color: theme.textPrimary }]}>Kelime Oyunları</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  HapticsService.selection();
                  onNavigateTab('lists');
                  onClose();
                }}
                style={[styles.navLink, { backgroundColor: settings.darkMode ? '#1e293b' : '#f8fafc' }]}
              >
                <Heart size={18} color="#ef4444" />
                <Text style={[styles.navLinkText, { color: theme.textPrimary }]}>Kayıtlı Listelerim</Text>
              </TouchableOpacity>

              {/* Theme Toggle */}
              <TouchableOpacity
                onPress={() => {
                  HapticsService.selection();
                  onToggleDarkMode();
                }}
                style={[styles.themeToggleBtn, { backgroundColor: settings.darkMode ? '#1e293b' : '#f8fafc' }]}
              >
                <View style={styles.themeLeft}>
                  {settings.darkMode ? (
                    <Sun size={18} color="#fbbf24" />
                  ) : (
                    <Moon size={18} color="#6366f1" />
                  )}
                  <Text style={[styles.navLinkText, { color: theme.textPrimary }]}>
                    Tema: {settings.darkMode ? 'Koyu Mod' : 'Açık Mod'}
                  </Text>
                </View>
                <Text style={[styles.themeActionText, { color: settings.darkMode ? Colors.primaryAccent : Colors.primary }]}>
                  Değiştir
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Drawer Footer */}
          <View style={[styles.footer, { borderTopColor: theme.cardBorder }]}>
            <Text style={[styles.footerTitle, { color: theme.textMuted }]}>
              WordMem İngilizce - Türkçe Sözlük & Kelime
            </Text>
            <Text style={[styles.footerVer, { color: theme.textMuted }]}>
              Sürüm 1.0.0 (Android)
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    flexDirection: 'row',
  },
  backdropTouchable: {
    flex: 1,
  },
  drawerCard: {
    width: width * 0.78,
    maxWidth: 320,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    paddingTop: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
  },
  verBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verText: {
    fontSize: 9,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  drawerScroll: {
    padding: 16,
  },
  profileSnapshot: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  userTexts: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '900',
  },
  profileRole: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  statsDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  streakInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakInlineText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#d97706',
  },
  wordsLearnedInline: {
    fontSize: 11,
    fontWeight: '800',
  },
  linksContainer: {
    gap: 10,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 16,
  },
  navLinkText: {
    fontSize: 13,
    fontWeight: '800',
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 16,
    marginTop: 6,
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeActionText: {
    fontSize: 11,
    fontWeight: '800',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerVer: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
});
