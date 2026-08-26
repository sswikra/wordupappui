import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Volume2, Heart, ArrowRight } from 'lucide-react';
import { Word } from '../types';
import { playPronunciation } from '../utils/speech';
import { searchWords } from '../utils/search';
import { motion, AnimatePresence } from 'motion/react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: Word[];
  onSelectWord: (word: Word) => void;
  onToggleFavorite: (wordId: string) => void;
  darkMode?: boolean;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  words,
  onSelectWord,
  onToggleFavorite,
  darkMode,
}) => {
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setLevelFilter('ALL');
    }
  }, [isOpen]);

  const filteredWords = useMemo(() => {
    if (!query.trim()) return [];
    return searchWords(words, query, { levelFilter });
  }, [words, query, levelFilter]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 sm:pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          className={`relative w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl transition-colors flex flex-col max-h-[80vh] ${
            darkMode ? 'bg-[#1e293b] text-slate-100' : 'bg-white text-slate-800'
          }`}
        >
          {/* Search Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className={`flex items-center px-4 py-3 rounded-2xl gap-3 ${
              darkMode ? 'bg-slate-800/90 text-slate-100' : 'bg-[#e2edf2] text-slate-950'
            }`}>
              <Search className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
              <input
                id="search-modal-input"
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="İngilizce veya Türkçe kelime ara..."
                className="w-full bg-transparent text-sm font-bold focus:outline-none placeholder:text-slate-500 text-slate-950 dark:text-slate-100"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filter Chips */}
            <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs no-scrollbar">
              {['TÜMÜ', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'FAVORİLER'].map((filter) => {
                const filterKey = filter === 'TÜMÜ' ? 'ALL' : filter === 'FAVORİLER' ? 'FAVORITES' : filter;
                const isActive = levelFilter === filterKey;
                return (
                  <button
                    key={filter}
                    onClick={() => setLevelFilter(filterKey)}
                    className={`px-3 py-1.5 rounded-full font-extrabold whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-[#345c43] text-white shadow-sm'
                        : darkMode
                        ? 'bg-slate-800 text-slate-300 hover:text-slate-100'
                        : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                    }`}
                  >
                    {filter === 'FAVORİLER' ? '❤️ Favoriler' : filter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {!query.trim() ? null : filteredWords.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <p className="text-sm font-bold">Eşleşen kelime bulunamadı</p>
                <p className="text-xs mt-1 font-medium">"Luminous", "Melody", "Aydınlık" gibi kelimeleri aramayı deneyin...</p>
              </div>
            ) : (
              filteredWords.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectWord(item);
                    onClose();
                  }}
                  className={`group flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all ${
                    darkMode
                      ? 'bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40'
                      : 'bg-[#f8fafc] hover:bg-white border border-slate-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playPronunciation(item.word);
                      }}
                      className="w-9 h-9 rounded-full bg-[#c89b3c]/20 hover:bg-[#c89b3c] text-[#8e6b1d] dark:text-[#f3c868] hover:text-white flex items-center justify-center transition-colors"
                      aria-label="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#c46210] dark:text-[#f39c12]">
                          {item.word}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#d8ebee] text-[#1c472a] dark:bg-slate-700 dark:text-emerald-300">
                          {item.partOfSpeech}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                          {item.level}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#1c472a] dark:text-emerald-300 mt-0.5">
                        {item.translation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item.id);
                      }}
                      className={`p-2 rounded-full ${
                        item.isFavorite
                          ? 'text-rose-500'
                          : 'text-slate-300 hover:text-slate-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-500' : ''}`} />
                    </button>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
