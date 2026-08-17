import React from 'react';
import { Search, Flame, Volume2, Plus, ArrowRight } from 'lucide-react';
import { Word, AppSettings } from '../../types';
import { playPronunciation } from '../../utils/speech';
import { motion } from 'motion/react';

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

export const HomeView: React.FC<HomeViewProps> = ({
  wordOfTheDay,
  suggestedWords,
  settings,
  streakCount,
  onOpenSearch,
  onOpenAddWord,
  onSelectWord,
  onViewAllSuggested,
  darkMode,
}) => {
  const handlePronounce = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    playPronunciation(word);
  };

  const dailyProgressPercent = Math.min(100, Math.round((settings.currentDayWordsCount / settings.dailyGoal) * 100));

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Streak Badge Pill matching Screen 5 */}
      <div className="flex justify-center pt-1">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#fff8f0] dark:bg-[#1e293b] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#c46210]/20 dark:border-slate-800"
        >
          <Flame className="w-4 h-4 fill-[#c46210] text-[#c46210] dark:fill-[#f39c12] dark:text-[#f39c12]" />
          <span className="text-xs font-bold text-[#c46210] dark:text-[#f39c12] tracking-tight">
            {streakCount} Günlük Seri!
          </span>
        </motion.div>
      </div>

      {/* Search Input Bar matching Screen 5 */}
      <div className="px-1">
        <button
          id="home-search-bar"
          onClick={onOpenSearch}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-full text-sm transition-all shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-left ${
            darkMode
              ? 'bg-[#1e293b] text-[#7ba983] border border-slate-800 hover:border-slate-700'
              : 'bg-[#e5eff3] text-[#345c43] border border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <Search className="w-5 h-5 text-[#345c43] dark:text-[#7ba983] shrink-0" />
          <span className="font-bold">İngilizce veya Türkçe kelime ara...</span>
        </button>
      </div>

      {/* WORD OF THE DAY Card matching Screen 5 */}
      <section aria-label="Word of the day">
        <div className="flex items-center justify-between px-1 mb-2.5">
          <span className="text-[11px] font-extrabold tracking-widest text-[#345c43] dark:text-[#7ba983] uppercase">
            GÜNÜN KELİMESİ
          </span>
        </div>

        <div
          id="word-of-the-day-card"
          onClick={() => onSelectWord(wordOfTheDay)}
          className={`relative p-7 rounded-[32px] cursor-pointer transition-all shadow-[0_4px_24px_rgba(0,0,0,0.04)] border ${
            darkMode
              ? 'bg-[#1e293b] border-slate-800 hover:border-slate-700'
              : 'bg-white border-slate-100/80 hover:shadow-md'
          }`}
        >
          {/* Top Row: Word Title */}
          <div className="text-center pt-1">
            <h1
              className="text-[44px] font-extrabold tracking-tight text-[#c46210] dark:text-[#f39c12] leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {wordOfTheDay.word}
            </h1>

            {/* Badges: Adj. Level C1 */}
            <div className="flex items-center justify-center gap-2 mt-2.5 mb-6">
              <span className={`text-xs font-bold px-3.5 py-1 rounded-full ${
                darkMode ? 'bg-slate-800 text-[#7ba983]' : 'bg-[#d8ebee] text-[#345c43]'
              }`}>
                {wordOfTheDay.partOfSpeech}
              </span>
              <span className={`text-xs font-bold px-3.5 py-1 rounded-full ${
                darkMode ? 'bg-slate-800 text-amber-300' : 'bg-[#d8ebee] text-[#345c43]'
              }`}>
                Seviye {wordOfTheDay.level}
              </span>
            </div>

            {/* Subtle Divider */}
            <div className="w-full max-w-[260px] mx-auto h-[1px] bg-slate-200 dark:bg-slate-700 mb-6" />

            {/* Turkish Translation in brand green */}
            <h2 className="text-[26px] font-extrabold text-[#345c43] dark:text-[#7ba983] mb-3 tracking-tight">
              {wordOfTheDay.translation}
            </h2>

            {/* Example sentence & speaker button */}
            <div className="relative pt-1 max-w-[280px] mx-auto min-h-[50px] flex items-center justify-center">
              <p className="text-sm font-serif-display italic text-black dark:text-black pr-12 leading-relaxed font-bold">
                "{wordOfTheDay.example}"
              </p>

              {/* Gold/Amber audio speaker button in bottom right */}
              <button
                id="word-of-the-day-speaker"
                onClick={(e) => handlePronounce(e, wordOfTheDay.word)}
                className="absolute right-0 bottom-0 w-11 h-11 rounded-full bg-[#c89b3c] hover:bg-[#b88c32] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
                aria-label="Play pronunciation"
              >
                <Volume2 className="w-5 h-5 fill-white stroke-[2]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SUGGESTED FOR YOU Section */}
      <section aria-label="Suggested for you">
        <div className="flex items-center justify-between px-1 mb-2.5">
          <span className="text-[11px] font-extrabold tracking-widest text-[#345c43] dark:text-[#7ba983] uppercase">
            SENİN İÇİN ÖNERİLENLER
          </span>
          <button
            onClick={onViewAllSuggested || onOpenSearch}
            className="text-xs font-bold text-[#345c43] dark:text-[#7ba983] hover:text-[#c46210] transition-colors"
          >
            Tümünü Gör
          </button>
        </div>

        {/* 2x2 Grid of cards */}
        <div className="grid grid-cols-2 gap-3">
          {suggestedWords.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectWord(item)}
              className={`p-5 rounded-[24px] cursor-pointer transition-all shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-center items-center text-center min-h-[105px] border ${
                darkMode
                  ? 'bg-[#1e293b] border-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-100/80 hover:shadow-md'
              }`}
            >
              <h3 className="text-lg font-extrabold text-[#c46210] dark:text-[#f39c12] tracking-tight mb-1">
                {item.word}
              </h3>
              <p className="text-xs font-bold text-[#345c43] dark:text-[#7ba983]">
                {item.translation}
              </p>
            </div>
          ))}

          {/* "+ Add Word" Card with dashed border */}
          <div
            id="home-add-word-card"
            onClick={onOpenAddWord}
            className={`p-5 rounded-[24px] cursor-pointer transition-all flex flex-col justify-center items-center text-center min-h-[105px] border-2 border-dashed ${
              darkMode
                ? 'border-[#345c43]/80 hover:border-[#7ba983] bg-slate-900/50'
                : 'border-[#345c43]/60 hover:border-[#345c43] bg-emerald-50/30 hover:bg-emerald-50/50'
            }`}
          >
            <div className="w-8 h-8 rounded-full border-2 border-current text-[#345c43] dark:text-[#7ba983] flex items-center justify-center mb-1">
              <Plus className="w-4 h-4 stroke-[2.8]" />
            </div>
            <span className="text-xs font-extrabold text-[#345c43] dark:text-[#7ba983]">
              Kelime Ekle
            </span>
          </div>
        </div>
      </section>

      {/* Daily Goal Progress Card */}
      <section aria-label="Daily goal">
        <div
          id="daily-goal-card"
          className={`p-5 rounded-[28px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border ${
            darkMode
              ? 'bg-[#1e293b] border-slate-800'
              : 'bg-white border-slate-100/80'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-extrabold text-[#345c43] dark:text-[#7ba983]">
              Günlük Hedef
            </h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#fdecd2] text-[#87450a] dark:bg-amber-950/80 dark:text-amber-300">
              {settings.currentDayWordsCount}/{settings.dailyGoal} Kelime
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dailyProgressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-[#345c43] dark:bg-[#5b8768] rounded-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
