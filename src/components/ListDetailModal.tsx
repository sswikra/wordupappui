import React, { useState, useMemo } from 'react';
import { X, Volume2, Heart, Play, Sparkles, CheckCircle2, RotateCcw, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { WordList, Word } from '../types';
import { playPronunciation } from '../utils/speech';
import { searchWords } from '../utils/search';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface ListDetailModalProps {
  list: WordList | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectWord: (word: Word) => void;
  onToggleFavorite: (wordId: string) => void;
  onUpdateListMastery: (listId: string, delta: number) => void;
  onDeleteList?: (listId: string) => void;
  darkMode?: boolean;
}

export const ListDetailModal: React.FC<ListDetailModalProps> = ({
  list,
  isOpen,
  onClose,
  onSelectWord,
  onToggleFavorite,
  onUpdateListMastery,
  onDeleteList,
  darkMode,
}) => {
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionScore, setSessionScore] = useState({ mastered: 0, review: 0 });

  const words = React.useMemo(() => {
    const raw = list?.words || [];
    const seen = new Set<string>();
    return raw.filter((w) => {
      if (!w || !w.id) return false;
      if (seen.has(w.id)) return false;
      seen.add(w.id);
      return true;
    });
  }, [list?.words]);

  const filteredWords = useMemo(() => {
    return searchWords(words, searchQuery);
  }, [words, searchQuery]);

  if (!isOpen || !list) return null;

  const startFlashcards = () => {
    if (words.length === 0) return;
    setStudyMode(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionScore({ mastered: 0, review: 0 });
  };

  const handleNextCard = (mastered: boolean) => {
    if (mastered) {
      setSessionScore((prev) => ({ ...prev, mastered: prev.mastered + 1 }));
      onUpdateListMastery(list.id, 2);
    } else {
      setSessionScore((prev) => ({ ...prev, review: prev.review + 1 }));
    }

    if (currentCardIndex < words.length - 1) {
      setIsFlipped(false);
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      // Session finished
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  };

  const isSessionComplete = currentCardIndex >= words.length - 1 && (sessionScore.mastered + sessionScore.review === words.length);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setStudyMode(false);
            onClose();
          }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          className={`relative w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl transition-colors flex flex-col max-h-[88vh] ${
            darkMode ? 'bg-[#1e293b] text-slate-100' : 'bg-white text-slate-800'
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {studyMode && (
                <button
                  onClick={() => setStudyMode(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h3 className="font-extrabold text-lg text-slate-950 dark:text-white leading-tight">{list.title}</h3>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {words.length} Kelime • %{list.mastery} Hakimiyet
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onDeleteList && (
                <button
                  type="button"
                  title="Listeyi Sil"
                  onClick={() => {
                    onDeleteList(list.id);
                    setStudyMode(false);
                    onClose();
                  }}
                  className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5 stroke-[2]" />
                </button>
              )}
              <button
                onClick={() => {
                  setStudyMode(false);
                  onClose();
                }}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Flashcard Study Mode */}
          {studyMode ? (
            <div className="p-6 flex-1 flex flex-col items-center justify-between">
              {/* Progress Bar */}
              <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-4">
                <span>Kart {currentCardIndex + 1} / {words.length}</span>
                <span>Öğrenilen: {sessionScore.mastered}</span>
              </div>

              {/* Flippable Flashcard */}
              <div className="w-full my-auto perspective-1000">
                <motion.div
                  onClick={() => setIsFlipped(!isFlipped)}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.4 }}
                  className={`w-full min-h-[220px] p-6 rounded-3xl cursor-pointer flex flex-col items-center justify-center text-center relative border-2 shadow-lg transition-all ${
                    darkMode
                      ? 'bg-slate-800/90 border-slate-700 hover:border-slate-600'
                      : 'bg-[#f4f9f6] border-[#345c43]/30 hover:border-[#345c43]/50'
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {!isFlipped ? (
                    /* Front of card (English) */
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-2">
                        {words[currentCardIndex]?.partOfSpeech} • Seviye {words[currentCardIndex]?.level}
                      </span>
                      <h2 className="text-3xl font-black text-[#c46210] dark:text-[#f39c12] mb-1">
                        {words[currentCardIndex]?.word}
                      </h2>
                      <p className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300 mb-4">
                        {words[currentCardIndex]?.phonetic}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playPronunciation(words[currentCardIndex]?.word);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#c89b3c] text-white text-xs font-bold shadow-sm"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Dinle
                      </button>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-4">
                        (Türkçe anlamı için dokunun)
                      </span>
                    </div>
                  ) : (
                    /* Back of card (Turkish Translation) */
                    <div style={{ transform: 'rotateY(180deg)' }}>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#345c43] dark:text-[#7ba983] block mb-2">
                        Türkçe Anlamı
                      </span>
                      <h2 className="text-3xl font-black text-[#345c43] dark:text-[#7ba983] mb-2">
                        {words[currentCardIndex]?.translation}
                      </h2>
                      <p className="text-xs italic font-bold text-black dark:text-black max-w-xs mx-auto mb-2">
                        "{words[currentCardIndex]?.example}"
                      </p>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2">
                        (Geri çevirmek için dokunun)
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Study Action Buttons */}
              <div className="w-full grid grid-cols-2 gap-3 pt-6">
                <button
                  onClick={() => handleNextCard(false)}
                  className="py-3 px-4 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-extrabold text-xs flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Tekrar Et</span>
                </button>
                <button
                  onClick={() => handleNextCard(true)}
                  className="py-3 px-4 rounded-2xl bg-[#345c43] hover:bg-[#284934] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Öğrenildi</span>
                </button>
              </div>
            </div>
          ) : (
            /* Standard List View */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* List Action Bar */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Listedeki kelimeleri filtrele..."
                  className={`flex-1 px-3.5 py-2 rounded-xl text-xs font-bold border focus:outline-none ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400'
                      : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500'
                  }`}
                />
                <button
                  onClick={startFlashcards}
                  disabled={words.length === 0}
                  className="py-2 px-4 rounded-xl bg-[#345c43] hover:bg-[#2a4c36] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Kartlarla Çalış</span>
                </button>
              </div>

              {/* Words List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredWords.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <p className="text-xs">Bu listede henüz kelime yok.</p>
                    <p className="text-[11px] mt-1">Kelime eklemek için arama yapın veya "+ Kelime Ekle"ye dokunun!</p>
                  </div>
                ) : (
                  filteredWords.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectWord(item)}
                      className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                        darkMode
                          ? 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50'
                          : 'bg-[#f8fafc] hover:bg-white border border-slate-100 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playPronunciation(item.word);
                          }}
                          className="w-8 h-8 rounded-full bg-[#c89b3c]/15 text-[#c89b3c] hover:bg-[#c89b3c] hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-[#c46210] dark:text-[#f39c12]">
                              {item.word}
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {item.partOfSpeech}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-[#345c43] dark:text-[#7ba983]">
                            {item.translation}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(item.id);
                          }}
                          className={`p-1.5 rounded-full ${
                            item.isFavorite
                              ? 'text-rose-500'
                              : 'text-slate-300 hover:text-slate-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-500' : ''}`} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
