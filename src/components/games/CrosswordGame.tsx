import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Check, Sparkles, HelpCircle } from 'lucide-react';
import { CROSSWORD_PUZZLES } from '../../data/mockData';
import confetti from 'canvas-confetti';
import { GameScoreBoard } from './GameScoreBoard';

interface CrosswordGameProps {
  onBack: () => void;
  onGameComplete?: (won: boolean) => void;
  darkMode?: boolean;
}

export const CrosswordGame: React.FC<CrosswordGameProps> = ({ onBack, onGameComplete, darkMode }) => {
  const puzzle = CROSSWORD_PUZZLES[0];
  const size = puzzle.size;

  // 5x5 grid state
  const [grid, setGrid] = useState<string[][]>(() =>
    Array(size)
      .fill(null)
      .map((_, r) =>
        Array(size)
          .fill('')
          .map((_, c) => (puzzle.grid[r][c] === '■' ? '■' : ''))
      )
  );

  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>({ r: 0, c: 0 });
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [clueTab, setClueTab] = useState<'across' | 'down'>('across');

  // Scoring
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('wordup_highscore_crossword');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const handleCellChange = (r: number, c: number, char: string) => {
    if (puzzle.grid[r][c] === '■') return;
    const val = char.slice(-1).toUpperCase();
    const newGrid = grid.map((row, ri) =>
      row.map((col, ci) => (ri === r && ci === c ? val : col))
    );
    setGrid(newGrid);

    // Auto-advance cursor
    if (val && c < size - 1 && puzzle.grid[r][c + 1] !== '■') {
      setSelectedCell({ r, c: c + 1 });
    } else if (val && r < size - 1 && puzzle.grid[r + 1][c] !== '■') {
      setSelectedCell({ r: r + 1, c });
    }
  };

  const handleCheck = () => {
    let allCorrect = true;
    let correctLetters = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (puzzle.grid[r][c] !== '■') {
          if (grid[r][c] === puzzle.grid[r][c]) {
            correctLetters += 5;
          } else {
            allCorrect = false;
          }
        }
      }
    }

    if (allCorrect) {
      setIsCompleted(true);
      setHasError(false);
      const pointsWon = 100;
      const newScore = score + pointsWon;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('wordup_highscore_crossword', newScore.toString());
      }
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      if (onGameComplete) onGameComplete(true);
    } else {
      setHasError(true);
      setTimeout(() => setHasError(false), 2500);
    }
  };

  const handleReset = () => {
    setGrid(
      Array(size)
        .fill(null)
        .map((_, r) =>
          Array(size)
            .fill('')
            .map((_, c) => (puzzle.grid[r][c] === '■' ? '■' : ''))
        )
    );
    setIsCompleted(false);
    setHasError(false);
  };

  return (
    <div className={`p-4 max-w-md mx-auto min-h-[600px] flex flex-col justify-between ${
      darkMode ? 'text-white' : 'text-slate-800'
    }`}>
      <div>
        {/* Top Header */}
        <div className="relative flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 min-h-[48px]">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white z-10"
          >
            <ArrowLeft className="w-4 h-4" /> Oyunlar
          </button>
          <div className="absolute inset-x-0 mx-auto text-center pointer-events-none">
            <h3 className="font-extrabold text-base text-[#c46210] dark:text-[#f39c12] pointer-events-auto">Kare Bulmaca</h3>
            <span className="text-[10px] uppercase tracking-wider text-[#7ba983] dark:text-[#7ba983] font-bold block pointer-events-auto">
              Klasik 5x5 Bulmaca
            </span>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 z-10"
            title="Sıfırla"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Scoring Board */}
        <GameScoreBoard
          currentScore={score}
          highScore={highScore}
          darkMode={darkMode}
        />

        {/* 5x5 Grid */}
        <div className="my-6 max-w-[260px] mx-auto">
          <div className="grid grid-cols-5 gap-1.5 p-2 bg-slate-900 rounded-2xl shadow-lg">
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const isBlocked = puzzle.grid[r][c] === '■';
                const isSelected = selectedCell?.r === r && selectedCell?.c === c;

                if (isBlocked) {
                  return (
                    <div
                      key={`${r}-${c}`}
                      className="aspect-square bg-slate-800 rounded-lg"
                    />
                  );
                }

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => setSelectedCell({ r, c })}
                    className={`relative aspect-square rounded-lg flex items-center justify-center font-black text-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-300 text-slate-950 ring-2 ring-amber-500 scale-105 z-10'
                        : 'bg-white text-slate-950 hover:bg-slate-50'
                    }`}
                  >
                    {/* Clue number in cell corner */}
                    {r === 0 && c === 0 && <span className="absolute top-0.5 left-1 text-[9px] font-extrabold text-slate-500">1</span>}
                    {r === 0 && c === 1 && <span className="absolute top-0.5 left-1 text-[9px] font-extrabold text-slate-500">1D</span>}
                    {r === 0 && c === 3 && <span className="absolute top-0.5 left-1 text-[9px] font-extrabold text-slate-500">2D</span>}
                    {r === 2 && c === 1 && <span className="absolute top-0.5 left-1 text-[9px] font-extrabold text-slate-500">3</span>}
                    {r === 4 && c === 0 && <span className="absolute top-0.5 left-1 text-[9px] font-extrabold text-slate-500">4</span>}

                    <input
                      type="text"
                      maxLength={1}
                      value={cell}
                      onChange={(e) => handleCellChange(r, c, e.target.value)}
                      className="w-full h-full text-center bg-transparent font-black text-slate-950 focus:outline-none uppercase"
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Feedback Messages */}
        {hasError && (
          <div className="p-2.5 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 text-rose-900 dark:text-rose-200 text-xs font-bold rounded-xl text-center mb-3">
            Bazı harfler yanlış. Denemeye devam edin!
          </div>
        )}

        {isCompleted && (
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-900 dark:text-emerald-200 text-xs font-bold rounded-xl text-center mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Bulmaca Kusursuzca Tamamlandı! Harika İş!</span>
          </div>
        )}

        {/* Clues Section */}
        <div className="p-4 rounded-2xl border bg-white dark:bg-white border-slate-200 shadow-sm">
          <div className="flex gap-2 border-b border-slate-200 pb-2 mb-3">
            <button
              onClick={() => setClueTab('across')}
              className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                clueTab === 'across'
                  ? 'bg-[#345c43] text-white'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              Yatay (Across)
            </button>
            <button
              onClick={() => setClueTab('down')}
              className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                clueTab === 'down'
                  ? 'bg-[#345c43] text-white'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              Dikey (Down)
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {clueTab === 'across' ? (
              puzzle.acrossClues.map((c) => (
                <div key={c.num} className="leading-relaxed font-bold text-black dark:text-black">
                  <span className="font-extrabold text-[#c46210] dark:text-[#c46210] mr-1.5">{c.num}.</span>
                  <span className="text-black dark:text-black">{c.text}</span>
                </div>
              ))
            ) : (
              puzzle.downClues.map((c) => (
                <div key={c.num} className="leading-relaxed font-bold text-black dark:text-black">
                  <span className="font-extrabold text-[#c46210] dark:text-[#c46210] mr-1.5">{c.num}.</span>
                  <span className="text-black dark:text-black">{c.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4">
        <button
          onClick={handleCheck}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#345c43] hover:bg-[#2c4e39] text-white font-bold text-sm shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>Cevapları Kontrol Et</span>
        </button>
      </div>
    </div>
  );
};
