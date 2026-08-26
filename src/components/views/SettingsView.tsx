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
  Cloud,
  RefreshCw,
  RotateCw,
  BookOpen,
  Trash2,
  Target,
} from 'lucide-react-native';
import { User } from 'firebase/auth';
import { AppSettings } from '../../types';
import { HapticsService } from '../../utils/haptics';
import { Colors, getTheme } from '../../theme/colors';
import { DailyGoalModal } from '../modals/DailyGoalModal';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  darkMode?: boolean;
  currentUser?: User | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onSyncCloud?: () => Promise<void>;
  onResetUserLists?: () => Promise<void> | void;
  onResetProfile?: () => Promise<void> | void;
  onResetAllData?: () => Promise<void> | void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  darkMode = false,
  currentUser,
  onOpenAuth,
  onLogout,
  onSyncCloud,
  onResetUserLists,
  onResetProfile,
  onResetAllData,
}) => {
  const theme = getTheme(darkMode);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncCloud = async () => {
    if (!onSyncCloud) return;
    try {
      HapticsService.medium();
      setIsSyncing(true);
      await onSyncCloud();
    } catch (e) {
      console.warn('Sync failed', e);
    } finally {
      setIsSyncing(false);
    }
  };

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

  const isGuest = !currentUser || currentUser.isAnonymous;

  const handleResetUserLists = () => {
    HapticsService.light();
    Alert.alert(
      'Listelerimi Sıfırla',
      'Favoriler, Tekrar Gözden Geçir ve Zorlandığım Kelimeler listelerinizdeki tüm kelimeler temizlenecek ve hakimiyet oranları %0 yapılacaktır. Emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Listeleri Sıfırla',
          style: 'destructive',
          onPress: async () => {
            HapticsService.medium();
            if (onResetUserLists) await onResetUserLists();
          },
        },
      ]
    );
  };

  const handleResetProfile = () => {
    HapticsService.light();
    Alert.alert(
      'Öğrenilen Kelimeleri & İlerlemeyi Sıfırla',
      'Öğrenilen kelimeler sayacı, bu haftaki çalışma grafiği, oynanan oyun sayısı ve aktif günlük seriniz 0\'a sıfırlanacaktır. Emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'İlerlemeyi Sıfırla',
          style: 'destructive',
          onPress: async () => {
            HapticsService.medium();
            if (onResetProfile) await onResetProfile();
          },
        },
      ]
    );
  };

  const handleResetAllData = () => {
    HapticsService.heavy();
    Alert.alert(
      'Tüm Verileri Sıfırla (Fabrika Ayarları)',
      'Tüm kelime listeleriniz, öğrenilen kelime istatistikleriniz, oyun rekorlarınız ve profil ilerlemeniz tamamen sıfırlanacaktır. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet, Tümünü Sıfırla',
          style: 'destructive',
          onPress: async () => {
            HapticsService.heavy();
            if (onResetAllData) await onResetAllData();
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    HapticsService.light();
    Alert.alert(
      "WordMem'den Çıkış Yapılsın mı?",
      'Hesabınızdan çıkış yapılacak ve misafir moduna dönülecektir. Buluttaki verileriniz hesabınızda güvende kalır.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            HapticsService.medium();
            if (onLogout) {
              onLogout();
            }
          },
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

      {/* Misafir Kullanıcı İçin Kayıt / Giriş Banner'ı */}
      {isGuest && (
        <TouchableOpacity
          onPress={() => {
            HapticsService.medium();
            if (onOpenAuth) onOpenAuth();
          }}
          activeOpacity={0.85}
          style={[
            styles.authBanner,
            {
              backgroundColor: darkMode ? '#1e293b' : '#ecfdf5',
              borderColor: Colors.primary,
            },
          ]}
        >
          <View style={styles.authBannerLeft}>
            <View style={[styles.authIconWrap, { backgroundColor: Colors.primary }]}>
              <UserCheck size={18} color="#ffffff" strokeWidth={2.4} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.authBannerTitle, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                Giriş Yap / Ücretsiz Kayıt Ol
              </Text>
              <Text style={[styles.authBannerSub, { color: theme.textSecondary }]}>
                Kelimelerinizi buluta yedekleyin
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={darkMode ? Colors.primaryAccent : Colors.primary} />
        </TouchableOpacity>
      )}

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

        {/* 4. Daily Word Goal Picker */}
        <TouchableOpacity
          onPress={() => {
            HapticsService.selection();
            setShowGoalModal(true);
          }}
          activeOpacity={0.7}
          style={[styles.menuItem, { borderBottomColor: theme.cardBorder }]}
        >
          <View style={styles.itemLeft}>
            <View style={[styles.iconWrap, { backgroundColor: darkMode ? 'rgba(123, 169, 131, 0.2)' : '#e2eff2' }]}>
              <Target size={18} color={darkMode ? Colors.primaryAccent : Colors.primary} strokeWidth={2.2} />
            </View>
            <View>
              <Text style={[styles.itemTitle, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                Günlük Kelime Hedefi
              </Text>
              <Text style={[styles.itemSub, { color: theme.textMuted }]}>
                Hedef: {settings.dailyGoal} kelime / gün
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
                backgroundColor: darkMode ? '#334155' : '#e2eff2',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '800',
                  color: darkMode ? Colors.primaryAccent : Colors.primary,
                }}
              >
                {settings.dailyGoal} Kelime
              </Text>
            </View>
            <ChevronRight size={20} color={darkMode ? Colors.primaryAccent : Colors.primary} />
          </View>
        </TouchableOpacity>

        {/* 5. Cloud Database Sync */}
        <TouchableOpacity
          onPress={handleSyncCloud}
          disabled={isSyncing}
          activeOpacity={0.7}
          style={[styles.menuItem, { borderBottomColor: theme.cardBorder }]}
        >
          <View style={styles.itemLeft}>
            <View style={[styles.iconWrap, { backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe' }]}>
              <Cloud size={18} color="#3b82f6" strokeWidth={2.2} />
            </View>
            <View>
              <Text style={[styles.itemTitle, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                {isSyncing ? 'Buluttan İndiriliyor...' : 'Bulut Veritabanı'}
              </Text>
              <Text style={[styles.itemSub, { color: theme.textMuted }]}>
                Firestore'daki en güncel kelimeleri ve listeleri senkronize et
              </Text>
            </View>
          </View>

          <RefreshCw
            size={18}
            color="#3b82f6"
            style={{ opacity: isSyncing ? 0.5 : 1 }}
          />
        </TouchableOpacity>

        {/* 5. Account Details */}
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
                {!isGuest ? (currentUser?.email || 'Giriş yapıldı') : 'Misafir Modu • Giriş Yap'}
              </Text>
            </View>
          </View>

          <ChevronRight size={20} color={darkMode ? Colors.primaryAccent : Colors.primary} />
        </TouchableOpacity>

        {/* 5. Logout or Login */}
        {!isGuest ? (
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
                <Text style={[styles.itemSub, { color: theme.textMuted }]}>
                  Oturumu kapat ve misafir moduna geç
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              HapticsService.medium();
              if (onOpenAuth) onOpenAuth();
            }}
            activeOpacity={0.7}
            style={styles.menuItem}
          >
            <View style={styles.itemLeft}>
              <View style={[styles.iconWrap, { backgroundColor: darkMode ? '#064e3b' : '#ecfdf5' }]}>
                <UserCheck size={18} color="#10b981" strokeWidth={2.2} />
              </View>
              <View>
                <Text style={[styles.itemTitle, { color: '#10b981' }]}>
                  Kayıt Ol / Giriş Yap
                </Text>
                <Text style={[styles.itemSub, { color: theme.textMuted }]}>
                  Kayıt olarak verilerinizi buluta yedekleyin
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Reset & Data Management Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
          VERİ & SIFIRLAMA YÖNETİMİ
        </Text>
      </View>

      <View style={[styles.menuCard, { backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderColor: theme.cardBorder, marginBottom: 14 }]}>
        {/* Reset User Lists */}
        <TouchableOpacity
          onPress={handleResetUserLists}
          activeOpacity={0.7}
          style={[styles.menuItem, { borderBottomColor: theme.cardBorder }]}
        >
          <View style={styles.itemLeft}>
            <View style={[styles.iconWrap, { backgroundColor: darkMode ? '#451a03' : '#fef3c7' }]}>
              <RotateCw size={18} color="#d97706" strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                Listelerimi Sıfırla
              </Text>
              <Text style={[styles.itemSub, { color: theme.textMuted }]}>
                Favoriler, Tekrar ve Zorlandığım listelerini temizler (%0 hakimiyet)
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={darkMode ? Colors.primaryAccent : Colors.primary} />
        </TouchableOpacity>

        {/* Reset Profile Progress */}
        <TouchableOpacity
          onPress={handleResetProfile}
          activeOpacity={0.7}
          style={[styles.menuItem, { borderBottomColor: theme.cardBorder }]}
        >
          <View style={styles.itemLeft}>
            <View style={[styles.iconWrap, { backgroundColor: darkMode ? '#3b1d54' : '#f3e8ff' }]}>
              <BookOpen size={18} color="#9333ea" strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                Öğrenilen Kelimeleri & İlerlemeyi Sıfırla
              </Text>
              <Text style={[styles.itemSub, { color: theme.textMuted }]}>
                Öğrenilen kelimeler sayacı, haftalık grafik ve seriyi 0 yapar
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={darkMode ? Colors.primaryAccent : Colors.primary} />
        </TouchableOpacity>

        {/* Reset All Data (Factory Reset) */}
        <TouchableOpacity
          onPress={handleResetAllData}
          activeOpacity={0.7}
          style={styles.menuItem}
        >
          <View style={styles.itemLeft}>
            <View style={[styles.iconWrap, { backgroundColor: darkMode ? '#450a0a' : '#fee2e2' }]}>
              <Trash2 size={18} color="#ef4444" strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: '#ef4444' }]}>
                Tüm Verileri Sıfırla (Fabrika Ayarları)
              </Text>
              <Text style={[styles.itemSub, { color: theme.textMuted }]}>
                Listeleri, kelime favorilerini ve tüm istatistikleri sıfırlar
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color="#ef4444" />
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

      {/* Daily Goal Selection Modal */}
      <DailyGoalModal
        isOpen={showGoalModal}
        currentGoal={settings.dailyGoal}
        onSaveGoal={(goal) => {
          onUpdateSettings({ dailyGoal: goal });
          setShowGoalModal(false);
        }}
        onClose={() => setShowGoalModal(false)}
        darkMode={darkMode}
      />
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
  sectionHeader: {
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  authBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  authBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  authIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  authBannerSub: {
    fontSize: 11,
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
