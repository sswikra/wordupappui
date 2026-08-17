import React, { useState } from 'react';
import { X, Volume2, Heart, Plus, Check, Sparkles, BookOpen, Layers } from 'lucide-react';
import { Word, WordList } from '../types';
import { playPronunciation } from '../utils/speech';
import { motion, AnimatePresence } from 'motion/react';

interface WordDetailModalProps {
  word: Word | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (wordId: string) => void;
  userLists: WordList[];
  onAddWordToList: (wordId: string, listId: string) => void;
  darkMode?: boolean;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  word,
  isOpen,
  onClose,
  onToggleFavorite,
  userLists,
  onAddWordToList,
  darkMode,
}) => {
  const [showAddToListDropdown, setShowAddToListDropdown] = useState(false);
  const [addedToListSuccess, setAddedToListSuccess] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizRevealed, setQuizRevealed] = useState(false);

  if (!isOpen || !word) return null;

  const handlePronounce = () => {
    playPronunciation(word.word);
  };

  const handleListSelect = (listId: string) => {
    onAddWordToList(word.id, listId);
    setAddedToListSuccess(listId);
    setTimeout(() => {
      setAddedToListSuccess(null);
      setShowAddToListDropdown(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          className={`relative w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl p-6 transition-colors max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-[#1e293b] text-slate-100' : 'bg-white text-slate-800'
          }`}
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                darkMode ? 'bg-slate-800 text-emerald-300' : 'bg-[#d8ebee] text-[#1c472a]'
              }`}>
                {word.partOfSpeech}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                darkMode ? 'bg-slate-800 text-amber-300' : 'bg-[#fef3e2] text-[#844710]'
              }`}>
                Seviye {word.level}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="modal-favorite-btn"
                onClick={() => onToggleFavorite(word.id)}
                className={`p-2.5 rounded-full transition-transform active:scale-90 ${
                  word.isFavorite
                    ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                    : darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
                aria-label="Toggle favorite"
              >
                <Heart className={`w-5 h-5 ${word.isFavorite ? 'fill-rose-500' : ''}`} />
              </button>
              <button
                id="modal-close-btn"
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${
                  darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Word Heading & Audio */}
          <div className="text-center pt-6 pb-4">
            <div className="flex items-center justify-center gap-3">
              <h2
                className="text-4xl font-black tracking-tight text-[#c46210] dark:text-[#f39c12]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {word.word}
              </h2>
              <button
                id="modal-speaker-btn"
                onClick={handlePronounce}
                className="w-11 h-11 rounded-full bg-[#c89b3c] hover:bg-[#b88c32] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
                aria-label="Listen pronunciation"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm font-mono font-bold text-[#345c43] dark:text-[#7ba983] mt-1">
              {word.phonetic}
            </p>
          </div>

          {/* Translation Section */}
          <div className={`p-4 rounded-2xl mb-4 text-center ${
            darkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-[#eaf4ec] border border-[#cbe3d0]'
          }`}>
            <span className="text-xs uppercase font-extrabold tracking-wider text-[#345c43] dark:text-[#7ba983] block mb-1">
              Türkçe Anlamı
            </span>
            <div className="text-2xl font-black text-[#345c43] dark:text-[#7ba983]">
              {word.translation}
            </div>
          </div>

          {/* English Definition */}
          {word.definition && (
            <div className="mb-4 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-100 border border-slate-200/80">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#c46210] dark:text-[#c46210] block mb-1">
                Tanım
              </span>
              <p className="text-sm leading-relaxed text-black dark:text-black font-semibold">
                {word.definition}
              </p>
            </div>
          )}

          {/* Example Sentence */}
          <div className="p-4 rounded-2xl mb-4 bg-slate-100 dark:bg-slate-100 border border-slate-200/80">
            <span className="text-xs uppercase font-extrabold tracking-wider text-[#c46210] dark:text-[#c46210] block mb-1">
              Örnek Cümle
            </span>
            <p className="text-sm italic font-serif-display text-black dark:text-black mb-1.5 leading-relaxed font-semibold">
              "{word.example}"
            </p>
            {word.exampleTranslation && (
              <p className="text-xs text-black dark:text-black font-semibold">
                "{word.exampleTranslation}"
              </p>
            )}
          </div>

          {/* Synonyms */}
          {word.synonyms && word.synonyms.length > 0 && (
            <div className="mb-5">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#c46210] dark:text-[#f39c12] block mb-1.5">
                Eş Anlamlılar
              </span>
              <div className="flex flex-wrap gap-1.5">
                {word.synonyms.map((syn) => (
                  <span
                    key={syn}
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                      darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-900'
                    }`}
                  >
                    {syn}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Quiz Interactive Section */}
          <div className={`p-4 rounded-2xl mb-5 border ${
            darkMode ? 'bg-indigo-950/30 border-indigo-900/50' : 'bg-indigo-50/70 border-indigo-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span>Hafıza Testi</span>
              </div>
              <button
                onClick={() => {
                  setQuizMode(!quizMode);
                  setQuizRevealed(false);
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {quizMode ? 'Testi Kapat' : 'Kartı Dene'}
              </button>
            </div>

            {quizMode && (
              <div className="mt-3 text-center">
                <p className="text-xs text-slate-500 mb-2">
                  <strong className="text-slate-800 dark:text-slate-200 font-bold">{word.word}</strong> kelimesinin Türkçe anlamı nedir?
                </p>
                {quizRevealed ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-2.5 bg-emerald-100/80 dark:bg-emerald-950/60 rounded-xl text-emerald-800 dark:text-emerald-300 font-bold text-sm"
                  >
                    ✓ {word.translation}
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setQuizRevealed(true)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-transform active:scale-98"
                  >
                    Cevabı Görmek İçin Dokunun
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="relative pt-2">
            <button
              id="modal-add-to-list-btn"
              onClick={() => setShowAddToListDropdown(!showAddToListDropdown)}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#345c43] hover:bg-[#2c4e39] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98"
            >
              <Layers className="w-4 h-4" />
              <span>Listeye Ekle</span>
            </button>

            {/* List selector dropdown */}
            {showAddToListDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute bottom-full mb-2 left-0 right-0 p-2 rounded-2xl shadow-xl border z-20 ${
                  darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-slate-400 px-3 py-1.5 uppercase">
                  Bir liste seçin:
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {userLists.map((list) => {
                    const isAdded = addedToListSuccess === list.id;
                    return (
                      <button
                        key={list.id}
                        onClick={() => handleListSelect(list.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                          darkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{list.title}</span>
                        {isAdded ? (
                          <span className="text-emerald-500 flex items-center gap-1 font-bold">
                            <Check className="w-3.5 h-3.5" /> Eklendi
                          </span>
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
