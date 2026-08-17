import React from 'react';
import { X, Flame, BookOpen, Volume2, Moon, Sun, Sparkles, Award, ShieldCheck, Heart, ExternalLink } from 'lucide-react';
import { UserProfile, AppSettings, TabType } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  settings: AppSettings;
  onToggleDarkMode: () => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenSearch: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  settings,
  onToggleDarkMode,
  onNavigateTab,
  onOpenSearch,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Drawer Content */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-[300px] sm:w-[320px] h-full shadow-2xl flex flex-col z-10 transition-colors overflow-y-auto ${
            settings.darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-white text-slate-800'
          }`}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="text-2xl font-extrabold text-[#345c43] dark:text-[#7ba983]"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                WordUp
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                v2.1
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Snapshot Card */}
          <div className="p-5">
            <div
              onClick={() => {
                onNavigateTab('profile');
                onClose();
              }}
              className={`p-4 rounded-3xl cursor-pointer transition-all ${
                settings.darkMode
                  ? 'bg-slate-800/80 hover:bg-slate-800'
                  : 'bg-[#f4f9f6] hover:bg-[#eaf3ed] border border-[#e2efe5]'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {profile.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {profile.role}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Flame className="w-4 h-4 fill-amber-500" />
                  <span>{profile.activeStreak} Günlük Seri</span>
                </div>
                <span className="text-[#345c43] dark:text-emerald-400">
                  {profile.wordsLearned} Kelime
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-4 space-y-1">
            <button
              onClick={() => {
                onNavigateTab('home');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
                settings.darkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#345c43] dark:text-[#7ba983]" />
              <span>Günün Kelimesi</span>
            </button>

            <button
              onClick={() => {
                onOpenSearch();
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
                settings.darkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#345c43] dark:text-[#7ba983]" />
              <span>Sözlükte Ara</span>
            </button>

            <button
              onClick={() => {
                onNavigateTab('games');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
                settings.darkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-900'
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>Kelime Oyunları</span>
            </button>

            <button
              onClick={() => {
                onNavigateTab('lists');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
                settings.darkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-900'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Kayıtlı Kelime Listelerim</span>
            </button>

            <div className="pt-3 pb-1 border-t border-slate-100 dark:border-slate-800 my-2" />

            {/* Quick Dark Mode toggle in drawer */}
            <button
              onClick={onToggleDarkMode}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
                settings.darkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                {settings.darkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-500" />
                )}
                <span>Tema: {settings.darkMode ? 'Koyu' : 'Açık'}</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Değiştir</span>
            </button>
          </div>

          {/* Footer Info */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-400">
              WordUp İngilizce - Türkçe Kelime Öğrenme
            </p>
            <p className="text-[10px] text-slate-400/80 mt-0.5">
              Uygulama Sürümü 2.1.0
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
