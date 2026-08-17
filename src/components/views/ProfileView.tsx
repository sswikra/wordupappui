import React from 'react';
import { BookOpen, Gamepad2, Flame, Star, TrendingUp } from 'lucide-react';
import { UserProfile } from '../../types';
import { motion } from 'motion/react';

interface ProfileViewProps {
  profile: UserProfile;
  darkMode?: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, darkMode }) => {
  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Avatar & User Header */}
      <div className="flex flex-col items-center justify-center pt-2 pb-1">
        <div className="relative">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover shadow-sm border-2 border-white dark:border-slate-800"
          />
          {/* Gold Star Badge on Avatar bottom right */}
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#c89b3c] border-2 border-white dark:border-slate-800 flex items-center justify-center text-white shadow-sm">
            <Star className="w-3.5 h-3.5 fill-white" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-[#345c43] dark:text-[#7ba983] mt-3 tracking-tight">
          {profile.name}
        </h1>
        <p className="text-xs font-bold text-[#345c43] dark:text-[#7ba983] opacity-80 mt-0.5">
          {profile.role}
        </p>
      </div>

      {/* Activity Card with Orange Bars */}
      <div
        id="profile-activity-card"
        className={`p-6 rounded-[28px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border ${
          darkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100/80'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-base font-extrabold text-[#345c43] dark:text-[#7ba983]">
              Aktivite
            </h2>
            <span className="text-[10px] font-extrabold text-[#345c43] dark:text-[#7ba983] opacity-75 uppercase tracking-wider block mt-0.5">
              BU HAFTA ÇALIŞILAN KELİMELER
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#c46210] dark:text-[#f39c12] font-black text-lg">
            <span>{profile.wordsThisWeek}</span>
            <TrendingUp className="w-4 h-4 text-[#c46210] dark:text-[#f39c12]" />
          </div>
        </div>

        {/* Weekly Day Activity Row: M T W T F S S with Orange Bars */}
        <div className="pt-6 pb-2 flex items-end justify-between px-2">
          {profile.weeklyActivity.map((day, idx) => {
            const maxCount = 50;
            const barHeight = Math.max(12, Math.round((day.count / maxCount) * 48));

            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="w-2.5 h-12 flex items-end justify-center rounded-full bg-amber-100/70 dark:bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${barHeight}px` }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    className={`w-full rounded-full ${
                      day.active
                        ? 'bg-[#c46210] dark:bg-[#f39c12]'
                        : 'bg-amber-200/60 dark:bg-slate-700'
                    }`}
                  />
                </div>
                <span className={`text-[11px] font-extrabold ${
                  day.active
                    ? 'text-[#c46210] dark:text-[#f39c12]'
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2 Stat Cards: Words Learned & Games Played */}
      <div className="grid grid-cols-2 gap-3">
        {/* Words Learned */}
        <div className={`p-5 rounded-[28px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border flex flex-col justify-between ${
          darkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100/80'
        }`}>
          <div className="w-10 h-10 rounded-2xl bg-[#e2eff2] dark:bg-slate-800 text-[#345c43] dark:text-[#7ba983] flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#345c43] dark:text-[#7ba983] tracking-tight block">
              {profile.wordsLearned.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Öğrenilen Kelimeler
            </span>
          </div>
        </div>

        {/* Games Played */}
        <div className={`p-5 rounded-[28px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border flex flex-col justify-between ${
          darkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100/80'
        }`}>
          <div className="w-10 h-10 rounded-2xl bg-[#e2eff2] dark:bg-slate-800 text-[#345c43] dark:text-[#7ba983] flex items-center justify-center mb-3">
            <Gamepad2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#345c43] dark:text-[#7ba983] tracking-tight block">
              {profile.gamesPlayed}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Oynanan Oyunlar
            </span>
          </div>
        </div>
      </div>

      {/* Gold Active Streak Card */}
      <div
        id="profile-streak-banner"
        className="p-6 rounded-[28px] bg-gradient-to-r from-[#c99b38] to-[#bd8c2e] text-white shadow-[0_4px_16px_rgba(201,155,56,0.25)] flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            {profile.activeStreak} Gün
          </h2>
          <p className="text-xs font-bold text-[#341d04] mt-0.5">
            Günlük Seri
          </p>
        </div>

        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Flame className="w-7 h-7 fill-white text-white opacity-90" />
        </div>
      </div>
    </div>
  );
};
