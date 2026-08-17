import React from 'react';
import { Flame, Trophy } from 'lucide-react';

interface GameScoreBoardProps {
  currentScore: number;
  highScore: number;
  darkMode?: boolean;
}

export const GameScoreBoard: React.FC<GameScoreBoardProps> = ({
  currentScore,
  highScore,
  darkMode,
}) => {
  return (
    <div
      id="game-scoreboard"
      className={`grid grid-cols-2 gap-2.5 my-2.5 p-2 rounded-2xl border transition-colors ${
        darkMode
          ? 'bg-slate-900/80 border-slate-800'
          : 'bg-slate-50/90 border-slate-200/80 shadow-xs'
      }`}
    >
      {/* Mevcut Skor - Sarı (Yellow) */}
      <div
        id="current-score-box"
        className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${
          darkMode
            ? 'bg-amber-950/40 border-amber-600/40 text-amber-300'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-[11px] font-bold tracking-tight">Mevcut Skor</span>
        </div>
        <span className="text-base font-black text-amber-600 dark:text-amber-300 tracking-tight">
          {currentScore}
        </span>
      </div>

      {/* En Yüksek Skor - Yeşil (Green) */}
      <div
        id="high-score-box"
        className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${
          darkMode
            ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-[#345c43] dark:text-[#7ba983] flex items-center justify-center">
            <Trophy className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-[11px] font-bold tracking-tight">En Yüksek</span>
        </div>
        <span className="text-base font-black text-[#345c43] dark:text-[#7ba983] tracking-tight">
          {highScore}
        </span>
      </div>
    </div>
  );
};
