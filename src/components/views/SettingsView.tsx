import React, { useState } from 'react';
import { Moon, Bell, Languages, UserCheck, LogOut, ChevronRight, Check } from 'lucide-react';
import { AppSettings } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  darkMode?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  darkMode,
}) => {
  const [showLangModal, setShowLangModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Title Header matching Screen 1 */}
      <div className="px-1 pt-1">
        <h1 className="text-2xl font-extrabold text-[#345c43] dark:text-[#7ba983] tracking-tight">
          Ayarlar
        </h1>
        <p className="text-xs font-bold text-[#345c43] dark:text-[#7ba983] opacity-80 mt-1 leading-relaxed">
          Uygulama tercihlerinizi ve hesap ayrıntılarınızı yönetin.
        </p>
      </div>

      {/* Main Settings Menu Card matching Screen 1 */}
      <div
        id="settings-menu-card"
        className={`rounded-[28px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border overflow-hidden transition-colors ${
          darkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100/80'
        }`}
      >
        {/* 1. Dark Mode Item */}
        <div
          id="setting-dark-mode"
          onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
          className="flex items-center justify-between p-4.5 px-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#e2eff2] dark:bg-slate-800 text-[#345c43] dark:text-[#7ba983] flex items-center justify-center">
              <Moon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#345c43] dark:text-[#7ba983]">
                Karanlık Mod
              </h3>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Göz yorgunluğunu azaltın
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="relative">
            <div className={`w-11 h-6 rounded-full transition-colors ${
              settings.darkMode ? 'bg-[#345c43]' : 'bg-slate-200 dark:bg-slate-700'
            }`}>
              <motion.div
                animate={{ x: settings.darkMode ? 20 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-5 h-5 rounded-full bg-white shadow-sm mt-0.5"
              />
            </div>
          </div>
        </div>

        {/* 2. Notifications Item with Checkbox */}
        <div
          id="setting-notifications"
          onClick={() => onUpdateSettings({ notifications: !settings.notifications })}
          className="flex items-center justify-between p-4.5 px-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#e2eff2] dark:bg-slate-800 text-[#345c43] dark:text-[#7ba983] flex items-center justify-center">
              <Bell className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#345c43] dark:text-[#7ba983]">
                Bildirimler
              </h3>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Günlük hatırlatıcılar ve seri uyarıları
              </p>
            </div>
          </div>

          {/* Blue Checkbox matching Screen 1 */}
          <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
            settings.notifications
              ? 'bg-blue-600 text-white'
              : 'border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
          }`}>
            {settings.notifications && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </div>

        {/* 3. Language Direction */}
        <div
          id="setting-language"
          onClick={() => setShowLangModal(true)}
          className="flex items-center justify-between p-4.5 px-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#e2eff2] dark:bg-slate-800 text-[#345c43] dark:text-[#7ba983] flex items-center justify-center">
              <Languages className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#345c43] dark:text-[#7ba983]">
                Dil Yönü
              </h3>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {currentLangLabel}
              </p>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-[#345c43] dark:text-[#7ba983]" />
        </div>

        {/* 4. Account */}
        <div
          id="setting-account"
          onClick={() => setShowAccountModal(true)}
          className="flex items-center justify-between p-4.5 px-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#e2eff2] dark:bg-slate-800 text-[#345c43] dark:text-[#7ba983] flex items-center justify-center">
              <UserCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#345c43] dark:text-[#7ba983]">
                Hesap
              </h3>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                E-posta, şifre, abonelik
              </p>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-[#345c43] dark:text-[#7ba983]" />
        </div>

        {/* 5. Logout */}
        <div
          id="setting-logout"
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center justify-between p-4.5 px-5 cursor-pointer hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
              <LogOut className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                Çıkış Yap
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* App Version matching Screen 1 */}
      <div className="text-center pt-8 pb-4">
        <p className="text-xs font-bold text-[#345c43] dark:text-[#7ba983]">
          Uygulama Sürümü 2.1.0
        </p>
      </div>

      {/* Language Modal */}
      <AnimatePresence>
        {showLangModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLangModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-sm rounded-[28px] p-6 shadow-2xl z-10 ${
                darkMode ? 'bg-[#1e293b] text-white' : 'bg-white text-slate-800'
              }`}
            >
              <h3 className="font-bold text-base mb-4">Dil Yönünü Seçin</h3>
              <div className="space-y-2">
                {languageOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onUpdateSettings({ languageDirection: opt.id });
                      setShowLangModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-colors ${
                      settings.languageDirection === opt.id
                        ? 'bg-[#345c43] text-white shadow-sm'
                        : darkMode
                        ? 'hover:bg-slate-800 text-slate-300'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {settings.languageDirection === opt.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Account Info Modal */}
      <AnimatePresence>
        {showAccountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAccountModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-sm rounded-[28px] p-6 shadow-2xl z-10 ${
                darkMode ? 'bg-[#1e293b] text-white' : 'bg-white text-slate-800'
              }`}
            >
              <h3 className="font-bold text-base mb-3">Hesap Ayrıntıları</h3>
              <div className="space-y-3 text-xs mb-5">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">E-posta</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{settings.email}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Abonelik Planı</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{settings.subscription} (Aktif)</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Günlük Hedef</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{settings.dailyGoal} kelime / gün</span>
                </div>
              </div>
              <button
                onClick={() => setShowAccountModal(false)}
                className="w-full py-3 rounded-2xl bg-[#345c43] text-white font-bold text-xs shadow-md"
              >
                Kapat
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-sm rounded-[28px] p-6 shadow-2xl z-10 text-center ${
                darkMode ? 'bg-[#1e293b] text-white' : 'bg-white text-slate-800'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-500 mx-auto flex items-center justify-center mb-3">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base mb-1">WordUp'tan Çıkış Yapılsın mı?</h3>
              <p className="text-xs text-slate-500 mb-5">
                Çevrimdışı seriniz ve öğrenme ilerlemeniz bu cihazda kayıtlı kalmaya devam edecektir.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  İptal
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
                >
                  Çıkış Yap
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
