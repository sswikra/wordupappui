import React, { useState, useEffect } from 'react';
import { RotateCcw, ArrowLeft, Trophy, HelpCircle, Delete } from 'lucide-react';
import { GUESS_WORDS_POOL } from '../../data/mockData';
import confetti from 'canvas-confetti';
import { playPronunciation } from '../../utils/speech';
import { GameScoreBoard } from './GameScoreBoard';

interface WordGuessGameProps {
  onBack: () => void;
  onGameComplete?: (won: boolean) => void;
  darkMode?: boolean;
}

export const WordGuessGame: React.FC<WordGuessGameProps> = ({ onBack, onGameComplete, darkMode }) => {
  const [targetIndex, setTargetIndex] = useState(0);
  const target = GUESS_WORDS_POOL[targetIndex];
  const solution = target.word; // 5 letter word

  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [message, setMessage] = useState('');

  // Scoring
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('wordup_highscore_guess');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const maxAttempts = 6;

  const handleKeyPress = (letter: string) => {
    if (isGameOver) return;
    if (currentGuess.length < 5) {
      setCurrentGuess((prev) => prev + letter.toUpperCase());
    }
  };

  const handleDelete = () => {
    if (isGameOver) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  };

  const handleEnter = () => {
    if (isGameOver) return;
    if (currentGuess.length !== 5) {
      setMessage('Word must be 5 letters');
      setTimeout(() => setMessage(''), 1500);
      return;
    }

    const nextGuesses = [...guesses, currentGuess];
    setGuesses(nextGuesses);
    setCurrentGuess('');

    if (currentGuess === solution) {
      setHasWon(true);
      setIsGameOver(true);
      const pointsWon = Math.max(20, (7 - nextGuesses.length) * 20);
      const newScore = score + pointsWon;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('wordup_highscore_guess', newScore.toString());
      }
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
      playPronunciation(solution);
      if (onGameComplete) onGameComplete(true);
    } else if (nextGuesses.length >= maxAttempts) {
      setIsGameOver(true);
      if (onGameComplete) onGameComplete(false);
    }
  };

  const resetGame = () => {
    const nextIdx = (targetIndex + 1) % GUESS_WORDS_POOL.length;
    setTargetIndex(nextIdx);
    setGuesses([]);
    setCurrentGuess('');
    setIsGameOver(false);
    setHasWon(false);
    setShowHint(false);
    setMessage('');
  };

  // Keyboard letter colors
  const getLetterStatus = (letter: string) => {
    let status = 'default';
    for (const g of guesses) {
      for (let i = 0; i < 5; i++) {
        if (g[i] === letter) {
          if (solution[i] === letter) {
            return 'correct';
          } else if (solution.includes(letter)) {
            status = 'present';
          } else if (status === 'default') {
            status = 'absent';
          }
        }
      }
    }
    return status;
  };

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
  ];

  return (
    <div className={`p-4 max-w-md mx-auto min-h-[600px] flex flex-col justify-between ${
      darkMode ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* Top Header */}
      <div>
        <div className="relative flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 min-h-[48px]">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white z-10"
          >
            <ArrowLeft className="w-4 h-4" /> Oyunlar
          </button>
          <div className="absolute inset-x-0 mx-auto text-center pointer-events-none">
            <h3 className="font-extrabold text-base text-[#c46210] dark:text-[#f39c12] pointer-events-auto">Kelime Tahmini</h3>
            <span className="text-[10px] uppercase tracking-wider text-[#7ba983] dark:text-[#7ba983] font-bold block pointer-events-auto">
              Günlük Mücadele • 5 Harfli Kelime
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
          <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 text-center animate-fadeIn font-semibold">
            <strong>İpucu:</strong> {target.hint} (TR: {target.tr})
          </div>
        )}

        {message && (
          <div className="mt-2 p-2 bg-rose-600 text-white font-bold rounded-xl text-xs text-center animate-bounce">
            {message}
          </div>
        )}
      </div>

      {/* 6-Row Guessing Grid */}
      <div className="grid grid-rows-6 gap-2 my-4 max-w-[280px] mx-auto w-full">
        {Array.from({ length: maxAttempts }).map((_, rowIndex) => {
          const isCurrentRow = rowIndex === guesses.length;
          const guessWord = guesses[rowIndex] || (isCurrentRow ? currentGuess : '');

          return (
            <div key={rowIndex} className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, colIndex) => {
                const char = guessWord[colIndex] || '';
                let cellBg = darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-300';
                let textColor = darkMode ? 'text-slate-100' : 'text-slate-950';

                if (rowIndex < guesses.length) {
                  if (solution[colIndex] === char) {
                    cellBg = 'bg-[#345c43] border-[#345c43] text-white';
                    textColor = 'text-white';
                  } else if (solution.includes(char)) {
                    cellBg = 'bg-[#c89b3c] border-[#c89b3c] text-white';
                    textColor = 'text-white';
                  } else {
                    cellBg = darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-200 border-slate-300 text-slate-700';
                    textColor = darkMode ? 'text-slate-400' : 'text-slate-700';
                  }
                }

                return (
                  <div
                    key={colIndex}
                    className={`aspect-square flex items-center justify-center font-black text-xl rounded-xl border-2 transition-all ${cellBg} ${textColor} ${
                      isCurrentRow && char ? 'scale-105 border-[#345c43]' : ''
                    }`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Win / Loss Banner */}
      {isGameOver && (
        <div className={`p-4 rounded-2xl mb-4 text-center ${
          hasWon ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-950 dark:text-emerald-100' : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-950 dark:text-rose-100'
        }`}>
          <h4 className="font-extrabold text-base mb-1">
            {hasWon ? '🎉 Harika! Doğru bildiniz!' : `Oyun Bitti! Kelime: "${solution}" idi`}
          </h4>
          <p className="text-xs text-slate-800 dark:text-slate-200 mb-3 font-medium">
            Türkçe Anlamı: <strong className="font-bold text-slate-950 dark:text-white">{target.tr}</strong>
          </p>
          <button
            onClick={resetGame}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#345c43] hover:bg-[#2a4c36] text-white font-bold text-xs shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Sıradaki Bulmaca
          </button>
        </div>
      )}

      {/* On-screen Keyboard */}
      <div className="space-y-1.5 select-none pb-2">
        {keyboardRows.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map((k) => {
              if (k === 'ENTER') {
                return (
                  <button
                    key={k}
                    onClick={handleEnter}
                    className="px-2.5 py-3 rounded-lg text-[11px] font-black bg-[#345c43] text-white hover:bg-[#2c4e39] active:scale-95 transition-all shadow-sm"
                  >
                    ENTER
                  </button>
                );
              }
              if (k === 'DEL') {
                return (
                  <button
                    key={k}
                    onClick={handleDelete}
                    className="px-2.5 py-3 rounded-lg text-[11px] font-black bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-slate-300 active:scale-95 transition-all shadow-sm flex items-center justify-center"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                );
              }

              const status = getLetterStatus(k);
              let keyBg = darkMode ? 'bg-slate-700/80 text-white' : 'bg-slate-200 text-slate-900 font-bold';
              if (status === 'correct') keyBg = 'bg-[#345c43] text-white font-black';
              else if (status === 'present') keyBg = 'bg-[#c89b3c] text-white font-black';
              else if (status === 'absent') keyBg = darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-300 text-slate-600 opacity-60 font-semibold';

              return (
                <button
                  key={k}
                  onClick={() => handleKeyPress(k)}
                  className={`w-8 sm:w-9 h-11 rounded-lg text-xs font-bold transition-transform active:scale-90 flex items-center justify-center shadow-sm ${keyBg}`}
                >
                  {k}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
