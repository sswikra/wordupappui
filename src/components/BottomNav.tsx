import React from 'react';
import { Home, Gamepad2, ListOrdered, User, Settings } from 'lucide-react';
import { TabType } from '../types';
import { motion } from 'motion/react';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  darkMode?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onChangeTab, darkMode }) => {
  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Ana Sayfa', icon: Home },
    { id: 'games', label: 'Oyunlar', icon: Gamepad2 },
    { id: 'lists', label: 'Listeler', icon: ListOrdered },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  return (
    <nav
      id="app-bottom-nav"
      aria-label="Main Navigation"
      className={`fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-4 py-2.5 transition-colors duration-200 border-t ${
        darkMode
          ? 'bg-[#0f172a]/95 border-slate-800/80 backdrop-blur-lg'
          : 'bg-white/95 border-slate-100/90 backdrop-blur-lg'
      } rounded-t-[28px] shadow-[0_-8px_24px_rgba(0,0,0,0.04)]`}
    >
      <div className="flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className="relative flex flex-col items-center justify-center min-w-[62px] py-1 cursor-pointer transition-all duration-200"
            >
              {isActive ? (
                <motion.div
                  layoutId="activeTabPill"
                  className="flex flex-col items-center justify-center px-4 py-1.5 rounded-full bg-[#6e9671] text-white shadow-sm"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                  <span className="text-[11px] font-semibold tracking-tight mt-0.5 whitespace-nowrap">
                    {tab.label}
                  </span>
                </motion.div>
              ) : (
                <div className={`flex flex-col items-center justify-center px-2 py-1 transition-colors ${
                  darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}>
                  <Icon className="w-5 h-5 stroke-[2]" />
                  <span className="text-[11px] font-medium tracking-tight mt-0.5 whitespace-nowrap">
                    {tab.label}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
