import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import {
  Moon,
  Bell,
  Languages,
  UserCheck,
  LogOut,
  ChevronRight,
  Check,
  X,
} from 'lucide-react-native';
import { AppSettings } from '../../types';
import { HapticsService } from '../../utils/haptics';
import { Colors, getTheme } from '../../theme/colors';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  darkMode?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const languageOptions: { id: AppSettings['languageDirection']; label: string }[] = [
    { id: 'EN_TR', label: 'İngilizce → Türkçe (EN -> TR)' },
    { id: 'TR_EN', label: 'Türkçe → İngilizce (TR -> EN)' },
    { id: 'EN_ES', label: 'İngilizce → İspanyolca (EN -> ES)' },
    { id: 'EN_DE', label: 'İngilizce → Almanca (EN -> DE)' },
    { id: 'EN_FR', label: 'İngilizce → Fransızca (EN -> FR)' },
  ];

  const currentLangLabel =
    settings.languageDirection === 'EN_TR'
      ? 'Mevcut: EN -> TR'
      : settings.languageDirection === 'TR_EN'
      ? 'Mevcut: TR -> EN'
      : settings.languageDirection === 'EN_ES'
      ? 'Mevcut: EN -> ES'
      : settings.languageDirection === 'EN_DE'
      ? 'Mevcut: EN -> DE'
      : 'Mevcut: EN -> FR';

  const handleLogout = () => {
    HapticsService.light();
    Alert.alert(
      "WordMem'den Çıkış Yapılsın mı?",
      'Çevrimdışı seriniz ve öğrenme ilerlemeniz bu cihazda kayıtlı kalmaya devam edecektir.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => HapticsService.medium(),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Title Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
          Ayarlar
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Uygulama tercihlerinizi ve hesap ayrıntılarınızı yönetin.
        </Text>
      </View>

      {/* Main Settings Menu Card */}
      <View style={[styles.menuCard, { backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderColor: theme.cardBorder }]}>
        {/* 1. Dark Mode Switch */}
        <View style={[styles.menuItem, { borderBottomColor: theme.cardBorder }]}>
          <View style={styles.itemLeft}>
            <View style={[styles.iconWrap, { backgroundColor: darkMode ? '#334155' : '#e2eff2' }]}>
              <Moon size={18} color={darkMode ? Colors.primaryAccent : Colors.primary} strokeWidth={2.2} />
            </View>
            <View>
              <Text style={[styles.itemTitle, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                Karanlık Mod
              </Text>
              <Text style={[styles.itemSub, { color: theme.textMuted }]}>
                Göz yorgunluğunu azaltın
              </Text>
            </View>
          </View>

          <Switch
            value={settings.darkMode}
            onValueChange={(val) => {
              HapticsService.selection();
              onUpdateSettings({ darkMode: val });
            }}
            trackColor={{ false: '#cbd5e1', true: Colors.primary }}
            thumbColor="#ffffff"
          />
        </View>

        {/* 2. Notifications Switch */}
        <View style={[styles.menuItem, { borderBottomColor: theme.cardBorder }]}>
          <View style={styles.itemLeft}>
            <View style={[styles.iconWrap, { backgroundColor: darkMode ? '#334155' : '#e2eff2' }]}>
              <Bell size={18} color={darkMode ? Colors.primaryAccent : Colors.primary} strokeWidth={2.2} />
            </View>
            <View>
              <Text style={[styles.itemTitle, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                Bildirimler
              </Text>
              <Text style={[styles.itemSub, { color: theme.textMuted }]}>
                Günlük hatırlatıcılar ve seri uyarıları
              </Text>
            </View>
          </View>

          <Switch
            value={settings.notifications}
            onValueChange={(val) => {
              HapticsService.selection();
              onUpdateSettings({ notifications: val });
            }}
            trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
            thumbColor="#ffffff"
          />
        </View>

        {/* 3. Language Direction Picker */}
        <TouchableOpacity
          onPress={() => {
            HapticsService.selection();
            setShowLangModal(true);
          }}
          activeOpacity={0.7}
          style={[styles.menuItem, { borderBottomColor: theme.cardBorder }]}
        >
          <View style={styles.itemLeft}>
            <View style={[styles.iconWrap, { backgroundColor: darkMode ? '#334155' : '#e2eff2' }]}>
              <Languages size={18} color={darkMode ? Colors.primaryAccent : Colors.primary} strokeWidth={2.2} />
            </View>
            <View>
              <Text style={[styles.itemTitle, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                Dil Yönü
              </Text>
              <Text style={[styles.itemSub, { color: theme.textMuted }]}>
                {currentLangLabel}
              </Text>
            </View>
          </View>

          <ChevronRight size={20} color={darkMode ? Colors.primaryAccent : Colors.primary} />
        </TouchableOpacity>

        {/* 4. Account Details */}
        <TouchableOpacity
          onPress={() => {
            HapticsService.selection();
            setShowAccountModal(true);
          }}
          activeOpacity={0.7}
          style={[styles.menuItem, { borderBottomColor: theme.cardBorder }]}
        >
          <View style={styles.itemLeft}>
            <View style={[styles.iconWrap, { backgroundColor: darkMode ? '#334155' : '#e2eff2' }]}>
              <UserCheck size={18} color={darkMode ? Colors.primaryAccent : Colors.primary} strokeWidth={2.2} />
            </View>
            <View>
              <Text style={[styles.itemTitle, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                Hesap
              </Text>
              <Text style={[styles.itemSub, { color: theme.textMuted }]}>
                E-posta, şifre, abonelik
              </Text>
            </View>
          </View>

          <ChevronRight size={20} color={darkMode ? Colors.primaryAccent : Colors.primary} />
        </TouchableOpacity>

        {/* 5. Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.7}
          style={styles.menuItem}
        >
          <View style={styles.itemLeft}>
            <View style={[styles.iconWrap, { backgroundColor: darkMode ? '#450a0a' : '#ffe4e6' }]}>
              <LogOut size={18} color="#ef4444" strokeWidth={2.2} />
            </View>
            <View>
              <Text style={[styles.itemTitle, { color: '#ef4444' }]}>
                Çıkış Yap
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* App Version Info */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
          WordMem Mobil v1.0.0
        </Text>
      </View>

      {/* Language Selection Modal */}
      <Modal visible={showLangModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: darkMode ? '#1e293b' : '#ffffff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Dil Yönünü Seçin</Text>
              <TouchableOpacity onPress={() => setShowLangModal(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsList}>
              {languageOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => {
                    HapticsService.selection();
                    onUpdateSettings({ languageDirection: opt.id });
                    setShowLangModal(false);
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.langOptionBtn,
                    settings.languageDirection === opt.id
                      ? { backgroundColor: Colors.primary }
                      : { backgroundColor: darkMode ? '#334155' : '#f1f5f9' },
                  ]}
                >
                  <Text
                    style={[
                      styles.langOptionText,
                      {
                        color:
                          settings.languageDirection === opt.id
                            ? '#ffffff'
                            : theme.textPrimary,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {settings.languageDirection === opt.id && (
                    <Check size={16} color="#ffffff" strokeWidth={2.6} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Account Info Modal */}
      <Modal visible={showAccountModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: darkMode ? '#1e293b' : '#ffffff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Hesap Ayrıntıları</Text>
              <TouchableOpacity onPress={() => setShowAccountModal(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.accountInfoList}>
              <View style={[styles.accountBox, { backgroundColor: darkMode ? '#334155' : '#f8fafc' }]}>
                <Text style={styles.accountLabel}>E-posta</Text>
                <Text style={[styles.accountValue, { color: theme.textPrimary }]}>{settings.email}</Text>
              </View>

              <View style={[styles.accountBox, { backgroundColor: darkMode ? '#334155' : '#f8fafc' }]}>
                <Text style={styles.accountLabel}>Abonelik Planı</Text>
                <Text style={[styles.accountValue, { color: '#10b981' }]}>{settings.subscription} (Aktif)</Text>
              </View>

              <View style={[styles.accountBox, { backgroundColor: darkMode ? '#334155' : '#f8fafc' }]}>
                <Text style={styles.accountLabel}>Günlük Hedef</Text>
                <Text style={[styles.accountValue, { color: theme.textPrimary }]}>{settings.dailyGoal} Kelime / Gün</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowAccountModal(false)}
              style={[styles.closeAccountBtn, { backgroundColor: Colors.primary }]}
            >
              <Text style={styles.closeAccountText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  menuCard: {
    borderRadius: 26,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  itemSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 26,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  optionsList: {
    gap: 8,
  },
  langOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
  },
  langOptionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  accountInfoList: {
    gap: 10,
    marginBottom: 16,
  },
  accountBox: {
    padding: 12,
    borderRadius: 14,
  },
  accountLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  accountValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  closeAccountBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeAccountText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
