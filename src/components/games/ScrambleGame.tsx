import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { SCRAMBLE_WORDS } from '../../data/mockData';
import confetti from 'canvas-confetti';
import { playPronunciation } from '../../utils/speech';
import { GameScoreBoard } from './GameScoreBoard';

interface ScrambleGameProps {
  onBack: () => void;
  onGameComplete?: (won: boolean) => void;
  darkMode?: boolean;
}

export const ScrambleGame: React.FC<ScrambleGameProps> = ({ onBack, onGameComplete, darkMode }) => {
  const [index, setIndex] = useState(0);
  const current = SCRAMBLE_WORDS[index];

  const [availableLetters, setAvailableLetters] = useState<string[]>(() =>
    current.scramble.split('')
  );
  const [userLetters, setUserLetters] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Scoring
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('wordup_highscore_scramble');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const handlePickLetter = (letterIndex: number) => {
    if (isCorrect) return;
    const letter = availableLetters[letterIndex];
    if (!letter) return;

    setUserLetters((prev) => [...prev, letter]);
    setAvailableLetters((prev) => {
      const copy = [...prev];
      copy.splice(letterIndex, 1);
      return copy;
    });
  };

  const handleRemoveLetter = (letterIndex: number) => {
    if (isCorrect) return;
    const letter = userLetters[letterIndex];
    if (!letter) return;

    setAvailableLetters((prev) => [...prev, letter]);
    setUserLetters((prev) => {
      const copy = [...prev];
      copy.splice(letterIndex, 1);
      return copy;
    });
  };

  const handleCheck = () => {
    const formed = userLetters.join('');
    if (formed === current.word) {
      setIsCorrect(true);
      setIsError(false);
      const pointsWon = 25;
      const newScore = score + pointsWon;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('wordup_highscore_scramble', newScore.toString());
      }
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      playPronunciation(current.word);
      if (onGameComplete) onGameComplete(true);
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 2000);
    }
  };

  const nextWord = () => {
    const nextIdx = (index + 1) % SCRAMBLE_WORDS.length;
    setIndex(nextIdx);
    setAvailableLetters(SCRAMBLE_WORDS[nextIdx].scramble.split(''));
    setUserLetters([]);
    setIsCorrect(false);
    setIsError(false);
    setShowHint(false);
  };

  return (
    <div className={`p-4 max-w-md mx-auto min-h-[600px] flex flex-col justify-between ${
      darkMode ? 'text-slate-100' : 'text-slate-900'
    }`}>
      <div>
        <div className="relative flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 min-h-[48px]">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white z-10"
          >
            <ArrowLeft className="w-4 h-4" /> Oyunlar
          </button>
          <div className="absolute inset-x-0 mx-auto text-center pointer-events-none">
            <h3 className="font-extrabold text-base text-[#c46210] dark:text-[#f39c12] pointer-events-auto">Harf Karıştırma</h3>
            <span className="text-[10px] uppercase tracking-wider text-[#7ba983] dark:text-[#7ba983] font-bold block pointer-events-auto">
              Kelime {index + 1} / {SCRAMBLE_WORDS.length}
            </span>
          </div>
          <button
            onClick={() => setShowHint(!showHint)}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 z-10"
            title="İpucu"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Scoring Board */}
        <GameScoreBoard
          currentScore={score}
          highScore={highScore}
          darkMode={darkMode}
        />

        {showHint && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200 text-center font-semibold">
            <strong>İpucu:</strong> {current.hint} (TR: {current.tr})
          </div>
        )}

        {/* Translation clue */}
        <div className="text-center my-6">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
            Türkçe Anlamı
          </span>
          <h2 className="text-2xl font-black text-[#7ba983] dark:text-[#7ba983]">
            {current.tr}
          </h2>
        </div>

        {/* Target Answer Slots */}
        <div className="flex justify-center gap-2 flex-wrap min-h-[56px] mb-6">
          {Array.from({ length: current.word.length }).map((_, i) => {
            const letter = userLetters[i] || '';
            let slotBorder = darkMode ? 'border-slate-700 bg-slate-800/90 text-slate-100' : 'border-slate-400 bg-white text-slate-950';
            if (isCorrect) slotBorder = 'border-emerald-500 bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200';
            else if (isError) slotBorder = 'border-rose-400 bg-rose-50 dark:bg-rose-950 text-rose-950 dark:text-rose-200';

            return (
              <button
                key={i}
                onClick={() => letter && handleRemoveLetter(i)}
                className={`w-11 h-12 rounded-xl border-2 font-black text-xl flex items-center justify-center transition-all shadow-sm ${slotBorder}`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Available Scrambled Letter Tiles */}
        <div className="text-center">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
            Harfleri sırasıyla yerleştirmek için dokunun:
          </span>
          <div className="flex justify-center gap-2 flex-wrap">
            {availableLetters.map((letter, i) => (
              <button
                key={i}
                onClick={() => handlePickLetter(i)}
                className="w-11 h-12 rounded-xl bg-[#345c43] hover:bg-[#284934] text-white font-black text-xl shadow-md active:scale-90 transition-transform flex items-center justify-center"
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Success Banner */}
        {isCorrect && (
          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 rounded-2xl text-center">
            <h4 className="font-extrabold text-emerald-900 dark:text-emerald-200 mb-1">
              🎉 Tebrikler! Doğru: "{current.word}"
            </h4>
            <p className="text-xs text-slate-800 dark:text-slate-200 mb-3 font-medium">
              {current.hint}
            </p>
            <button
              onClick={nextWord}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#345c43] text-white text-xs font-bold shadow-md hover:bg-[#284934]"
            >
              <span>Sıradaki Kelime</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {!isCorrect && (
        <div className="pt-6">
          <button
            onClick={handleCheck}
            disabled={userLetters.length !== current.word.length}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#345c43] hover:bg-[#2c4e39] disabled:opacity-50 text-white font-bold text-sm shadow-md transition-transform active:scale-98"
          >
            Kelimeyi Kontrol Et
          </button>
        </div>
      )}
    </div>
  );
};
