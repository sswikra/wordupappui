import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, HelpCircle } from 'lucide-react';
import { HANGMAN_WORDS } from '../../data/mockData';
import confetti from 'canvas-confetti';
import { playPronunciation } from '../../utils/speech';
import { GameScoreBoard } from './GameScoreBoard';

interface HangmanGameProps {
  onBack: () => void;
  onGameComplete?: (won: boolean) => void;
  darkMode?: boolean;
}

export const HangmanGame: React.FC<HangmanGameProps> = ({ onBack, onGameComplete, darkMode }) => {
  const [index, setIndex] = useState(0);
  const current = HANGMAN_WORDS[index];
  const word = current.word.toUpperCase();

  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [fullGuess, setFullGuess] = useState('');
  const [guessMessage, setGuessMessage] = useState<string | null>(null);

  // Scoring
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('wordup_highscore_hangman');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const maxMistakes = 6;
  const mistakes = guessedLetters.filter((l) => !word.includes(l)).length;
  const isWon = word.split('').every((l) => guessedLetters.includes(l));
  const isLost = mistakes >= maxMistakes;

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const handleGuess = (letter: string) => {
    if (guessedLetters.includes(letter) || isWon || isLost) return;

    const nextGuessed = [...guessedLetters, letter];
    setGuessedLetters(nextGuessed);

    const nextMistakes = nextGuessed.filter((l) => !word.includes(l)).length;
    const nextWon = word.split('').every((l) => nextGuessed.includes(l));

    if (nextWon) {
      const pointsWon = Math.max(15, (maxMistakes - nextMistakes) * 10 + 20);
      const newScore = score + pointsWon;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('wordup_highscore_hangman', newScore.toString());
      }
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
      playPronunciation(word);
      if (onGameComplete) onGameComplete(true);
    } else if (nextMistakes >= maxMistakes) {
      if (onGameComplete) onGameComplete(false);
    }
  };

  const handleFullWordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullGuess.trim() || isWon || isLost) return;

    const cleanGuess = fullGuess.trim().toUpperCase();
    if (cleanGuess === word) {
      const allLetters = Array.from(new Set(word.split('')));
      setGuessedLetters((prev) => Array.from(new Set([...prev, ...allLetters])));
      const pointsWon = (maxMistakes - mistakes) * 10 + 30;
      const newScore = score + pointsWon;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('wordup_highscore_hangman', newScore.toString());
      }
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
      playPronunciation(word);
      if (onGameComplete) onGameComplete(true);
      setFullGuess('');
    } else {
      const unusedWrongLetter = alphabet.find((l) => !word.includes(l) && !guessedLetters.includes(l)) || '#';
      setGuessedLetters((prev) => [...prev, unusedWrongLetter]);
      setGuessMessage('Yanlış tahmin! 1 can kaybettiniz.');
      setTimeout(() => setGuessMessage(null), 2000);
      setFullGuess('');
    }
  };

  const resetGame = () => {
    const nextIdx = (index + 1) % HANGMAN_WORDS.length;
    setIndex(nextIdx);
    setGuessedLetters([]);
    setShowHint(false);
    setFullGuess('');
    setGuessMessage(null);
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
            <h3 className="font-extrabold text-base text-[#c46210] dark:text-[#f39c12] pointer-events-auto">Adam Asmaca</h3>
            <span className="text-[10px] uppercase tracking-wider text-[#7ba983] dark:text-[#7ba983] font-bold block pointer-events-auto">
              Kategori: {current.category}
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

        {guessMessage && (
          <div className="mt-2 p-2 bg-rose-500 text-white text-xs font-bold rounded-xl text-center animate-bounce">
            {guessMessage}
          </div>
        )}

        {/* Visual Stickman Drawing */}
        <div className="my-4 flex justify-center">
          <svg width="140" height="120" viewBox="0 0 140 120" className="stroke-slate-800 dark:stroke-slate-200 fill-none stroke-[3] stroke-linecap-round stroke-linejoin-round">
            {/* Gallows Base */}
            <line x1="20" y1="110" x2="80" y2="110" />
            <line x1="40" y1="110" x2="40" y2="20" />
            <line x1="40" y1="20" x2="90" y2="20" />
            <line x1="90" y1="20" x2="90" y2="35" />

            {/* Stickman Parts based on mistakes */}
            {/* Head */}
            {mistakes >= 1 && <circle cx="90" cy="45" r="10" />}
            {/* Body */}
            {mistakes >= 2 && <line x1="90" y1="55" x2="90" y2="80" />}
            {/* Left Arm */}
            {mistakes >= 3 && <line x1="90" y1="62" x2="75" y2="72" />}
            {/* Right Arm */}
            {mistakes >= 4 && <line x1="90" y1="62" x2="105" y2="72" />}
            {/* Left Leg */}
            {mistakes >= 5 && <line x1="90" y1="80" x2="78" y2="100" />}
            {/* Right Leg */}
            {mistakes >= 6 && <line x1="90" y1="80" x2="102" y2="100" />}
          </svg>
        </div>

        {/* Word Display with Underlines */}
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          {word.split('').map((char, i) => {
            const revealed = guessedLetters.includes(char) || isLost;
            return (
              <div
                key={i}
                className={`w-9 h-11 border-b-4 flex items-center justify-center font-black text-xl ${
                  revealed ? 'border-[#345c43] text-slate-950 dark:text-white' : 'border-slate-400 dark:border-slate-600'
                } ${isLost && !guessedLetters.includes(char) ? 'text-rose-600' : ''}`}
              >
                {revealed ? char : ''}
              </div>
            );
          })}
        </div>

        {/* Full Word Guess Input and Button */}
        {!isWon && !isLost && (
          <form onSubmit={handleFullWordSubmit} className="flex gap-2 mb-4 max-w-[340px] mx-auto">
            <input
              type="text"
              value={fullGuess}
              onChange={(e) => setFullGuess(e.target.value)}
              placeholder="Kelimeyi yazın..."
              className={`flex-1 px-3.5 py-2 rounded-xl text-xs font-bold border focus:outline-none uppercase ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400'
                  : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500'
              }`}
            />
            <button
              type="submit"
              disabled={!fullGuess.trim()}
              className="px-3.5 py-2 rounded-xl bg-[#345c43] hover:bg-[#284934] disabled:opacity-50 text-white font-bold text-xs whitespace-nowrap shadow-sm active:scale-95 transition-transform"
            >
              Kelimeyi tahmin et
            </button>
          </form>
        )}

        {/* Game End Banner */}
        {(isWon || isLost) && (
          <div className={`p-4 rounded-2xl mb-4 text-center ${
            isWon ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300' : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300'
          }`}>
            <h4 className="font-extrabold text-base mb-1 text-slate-950 dark:text-slate-100">
              {isWon ? '🎉 Harika! Adamı kurtardınız!' : `Hakkınız bitti! Kelime: "${word}" idi`}
            </h4>
            <p className="text-xs text-slate-800 dark:text-slate-200 mb-3 font-medium">
              Türkçe Anlamı: <strong className="font-bold text-slate-950 dark:text-white">{current.tr}</strong>
            </p>
            <button
              onClick={resetGame}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#345c43] text-white text-xs font-bold shadow-md hover:bg-[#284934]"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Sıradaki Kelime
            </button>
          </div>
        )}

        {/* Letter Keypad */}
        <div className="flex flex-wrap justify-center gap-1.5 max-w-[340px] mx-auto select-none">
          {alphabet.map((letter) => {
            const isGuessed = guessedLetters.includes(letter);
            const isInWord = word.includes(letter);

            let btnBg = darkMode ? 'bg-slate-800 text-white font-bold' : 'bg-slate-200 text-slate-900 font-bold hover:bg-slate-300';
            if (isGuessed) {
              btnBg = isInWord
                ? 'bg-[#345c43] text-white opacity-40 cursor-default'
                : 'bg-rose-500/40 text-slate-700 dark:text-slate-300 opacity-40 cursor-default';
            }

            return (
              <button
                key={letter}
                disabled={isGuessed || isWon || isLost}
                onClick={() => handleGuess(letter)}
                className={`w-8 h-9 rounded-lg font-bold text-xs shadow-sm transition-transform active:scale-90 ${btnBg}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 pb-2">
        Kalan can: <strong className="text-rose-500">{maxMistakes - mistakes}</strong> / {maxMistakes}
      </div>
    </div>
  );
};
