import React, { useState, useMemo, useEffect } from 'react';
import { X, Volume2, Heart, Play, Sparkles, CheckCircle2, RotateCcw, RotateCw, ArrowLeft, Trash2, Shuffle, Award } from 'lucide-react';
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
  onUpdateWordMastery?: (wordId: string, mastery: number) => void;
  onDeleteList?: (listId: string) => void;
  darkMode?: boolean;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const ListDetailModal: React.FC<ListDetailModalProps> = ({
  list,
  isOpen,
  onClose,
  onSelectWord,
  onToggleFavorite,
  onUpdateListMastery,
  onUpdateWordMastery,
  onDeleteList,
  darkMode,
}) => {
  const [studyMode, setStudyMode] = useState(false);
  const [studyWords, setStudyWords] = useState<Word[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionScore, setSessionScore] = useState({ mastered: 0, review: 0 });
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [reviewedWordIds, setReviewedWordIds] = useState<string[]>([]);

  const [studyFilter, setStudyFilter] = useState<'unlearned' | 'all' | 'learned'>('unlearned');
  const [isShuffled, setIsShuffled] = useState(true);

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

  const unlearnedCount = useMemo(() => {
    return words.filter((w) => (w.mastery || 0) < 100).length;
  }, [words]);

  const learnedCount = useMemo(() => {
    return words.filter((w) => (w.mastery || 0) >= 100).length;
  }, [words]);

  useEffect(() => {
    if (unlearnedCount > 0) {
      setStudyFilter('unlearned');
    } else {
      setStudyFilter('all');
    }
  }, [list?.id, unlearnedCount]);

  const filteredWords = useMemo(() => {
    return searchWords(words, searchQuery);
  }, [words, searchQuery]);

  if (!isOpen || !list) return null;

  const startFlashcards = (filter = studyFilter, shuffle = isShuffled) => {
    let pool: Word[] = [];
    if (filter === 'unlearned') {
      pool = words.filter((w) => (w.mastery || 0) < 100);
      if (pool.length === 0) pool = words;
    } else if (filter === 'learned') {
      pool = words.filter((w) => (w.mastery || 0) >= 100);
      if (pool.length === 0) pool = words;
    } else {
      pool = words;
    }

    if (pool.length === 0) return;

    const finalDeck = shuffle ? shuffleArray(pool) : [...pool];
    setStudyWords(finalDeck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionScore({ mastered: 0, review: 0 });
    setReviewedWordIds([]);
    setIsSessionFinished(false);
    setStudyMode(true);
  };

  const handleReshuffleRemaining = () => {
    if (currentCardIndex >= studyWords.length - 1) return;
    const past = studyWords.slice(0, currentCardIndex);
    const remaining = studyWords.slice(currentCardIndex);
    const shuffledRemaining = shuffleArray(remaining);
    setStudyWords([...past, ...shuffledRemaining]);
    setIsFlipped(false);
  };

  const handleNextCard = (mastered: boolean) => {
    const currentWord = studyWords[currentCardIndex];
    if (!currentWord) return;

    if (mastered) {
      setSessionScore((prev) => ({ ...prev, mastered: prev.mastered + 1 }));
      if (onUpdateWordMastery) {
        onUpdateWordMastery(currentWord.id, 100);
      }
    } else {
      setSessionScore((prev) => ({ ...prev, review: prev.review + 1 }));
      setReviewedWordIds((prev) => (prev.includes(currentWord.id) ? prev : [...prev, currentWord.id]));
      if (onUpdateWordMastery) {
        onUpdateWordMastery(currentWord.id, 0);
      }
    }

    if (currentCardIndex < studyWords.length - 1) {
      setIsFlipped(false);
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      // Session finished
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      setIsSessionFinished(true);
    }
  };

  const handleStudyReviewedWordsOnly = () => {
    const pool = words.filter((w) => reviewedWordIds.includes(w.id) || (w.mastery || 0) < 100);
    if (pool.length === 0) {
      startFlashcards('all', isShuffled);
      return;
    }
    const finalDeck = isShuffled ? shuffleArray(pool) : pool;
    setStudyWords(finalDeck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionScore({ mastered: 0, review: 0 });
    setReviewedWordIds([]);
    setIsSessionFinished(false);
  };

  const currentWord = studyWords[currentCardIndex];

  const getFilterCardCount = () => {
    if (studyFilter === 'unlearned') return unlearnedCount || words.length;
    if (studyFilter === 'learned') return learnedCount || words.length;
    return words.length;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setStudyMode(false);
            setIsSessionFinished(false);
            onClose();
          }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          className={`relative w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl transition-colors flex flex-col max-h-[90vh] ${
            darkMode ? 'bg-[#1e293b] text-slate-100' : 'bg-white text-slate-800'
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {studyMode && (
                <button
                  onClick={() => {
                    setStudyMode(false);
                    setIsSessionFinished(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h3 className="font-extrabold text-lg text-slate-950 dark:text-white leading-tight">{list.title}</h3>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {words.length} Kelime • {learnedCount} Öğrenildi • %{Math.round(list.mastery || 0)} Hakimiyet
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {studyMode && !isSessionFinished && studyWords.length > 1 && (
                <button
                  onClick={handleReshuffleRemaining}
                  title="Kalanları Karıştır"
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              )}
              {onDeleteList && !studyMode && (
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
                  setIsSessionFinished(false);
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
            isSessionFinished ? (
              /* Completion Screen */
              <div className="p-6 flex-1 flex flex-col justify-between items-center text-center">
                <div className="my-auto">
                  <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 mb-4">
                    <Award className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    Tebrikler! 🎉
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">
                    "{list.title}" listesi için çalışma oturumunu başarıyla tamamladınız.
                  </p>

                  <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 max-w-sm mx-auto">
                    <div>
                      <span className="block text-xl font-black text-slate-800 dark:text-slate-200">
                        {studyWords.length}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Çalışılan</span>
                    </div>
                    <div>
                      <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400">
                        {sessionScore.mastered}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Öğrenildi</span>
                    </div>
                    <div>
                      <span className="block text-xl font-black text-amber-600 dark:text-amber-400">
                        {sessionScore.review}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Tekrar</span>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-2 pt-4">
                  {sessionScore.review > 0 && (
                    <button
                      onClick={handleStudyReviewedWordsOnly}
                      className="w-full py-3 rounded-2xl bg-[#c46210] hover:bg-[#b0550c] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Tekrar Edilecekleri Çalış ({sessionScore.review})</span>
                    </button>
                  )}
                  <button
                    onClick={() => startFlashcards('all', true)}
                    className="w-full py-3 rounded-2xl bg-[#345c43] hover:bg-[#284934] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Shuffle className="w-4 h-4" />
                    <span>Tümünü Karışık Yeniden Çalış</span>
                  </button>
                  <button
                    onClick={() => {
                      setStudyMode(false);
                      setIsSessionFinished(false);
                    }}
                    className="w-full py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
                  >
                    Listeye Geri Dön
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 flex-1 flex flex-col items-center justify-between">
                {/* Progress Bar */}
                <div className="w-full space-y-2 mb-4">
                  <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>Kart {currentCardIndex + 1} / {studyWords.length}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-600 dark:text-emerald-400">✓ {sessionScore.mastered}</span>
                      {sessionScore.review > 0 && (
                        <span className="text-amber-600 dark:text-amber-400">🔄 {sessionScore.review}</span>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#345c43] transition-all duration-300"
                      style={{ width: `${Math.round(((currentCardIndex + 1) / studyWords.length) * 100)}%` }}
                    />
                  </div>
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
                          {currentWord?.partOfSpeech} • Seviye {currentWord?.level}
                        </span>
                        <h2 className="text-3xl font-black text-[#c46210] dark:text-[#f39c12] mb-1">
                          {currentWord?.word}
                        </h2>
                        <p className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300 mb-4">
                          {currentWord?.phonetic}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playPronunciation(currentWord?.word);
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
                          {currentWord?.translation}
                        </h2>
                        <p className="text-xs italic font-bold text-slate-700 dark:text-slate-200 max-w-xs mx-auto mb-2">
                          "{currentWord?.example}"
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
            )
          ) : (
            /* Standard List View */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Study Scope & Options Bar */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
                {/* Scope chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setStudyFilter('unlearned')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                      studyFilter === 'unlearned'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    ⚡ Öğrenilmemiş ({unlearnedCount})
                  </button>
                  <button
                    onClick={() => setStudyFilter('all')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                      studyFilter === 'all'
                        ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-500'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    📚 Tümü ({words.length})
                  </button>
                  {learnedCount > 0 && (
                    <button
                      onClick={() => setStudyFilter('learned')}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                        studyFilter === 'learned'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-500'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      ✓ Öğrenilen ({learnedCount})
                    </button>
                  )}
                </div>

                {/* Shuffle toggle & Start flashcards button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsShuffled(!isShuffled)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors ${
                      isShuffled
                        ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-400'
                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>{isShuffled ? 'Karışık' : 'Sıralı'}</span>
                  </button>

                  <button
                    onClick={() => startFlashcards(studyFilter, isShuffled)}
                    disabled={words.length === 0}
                    className="flex-1 py-2 px-4 rounded-xl bg-[#345c43] hover:bg-[#2a4c36] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Kartlarla Çalış ({getFilterCardCount()})</span>
                  </button>
                </div>
              </div>

              {/* Search Filter */}
              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Listedeki kelimeleri filtrele..."
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold border focus:outline-none ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400'
                      : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500'
                  }`}
                />
              </div>

              {/* Words List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredWords.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <p className="text-xs">Bu listede henüz kelime yok.</p>
                    <p className="text-[11px] mt-1">Kelime eklemek için arama yapın veya "+ Kelime Ekle"ye dokunun!</p>
                  </div>
                ) : (
                  filteredWords.map((item) => {
                    const isLearned = (item.mastery || 0) >= 100;
                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectWord(item)}
                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                          darkMode
                            ? 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50'
                            : 'bg-[#f8fafc] hover:bg-white border border-slate-100 hover:shadow-sm'
                        } ${isLearned ? 'border-l-4 border-l-emerald-500' : ''}`}
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
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-sm text-[#c46210] dark:text-[#f39c12]">
                                {item.word}
                              </span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {item.partOfSpeech}
                              </span>
                              {isLearned && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Öğrenildi
                                </span>
                              )}
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
                    );
                  })
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
