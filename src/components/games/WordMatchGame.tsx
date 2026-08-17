import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Sparkles, Timer, Award } from 'lucide-react';
import { MATCH_PAIRS_POOL } from '../../data/mockData';
import confetti from 'canvas-confetti';
import { GameScoreBoard } from './GameScoreBoard';

interface WordMatchGameProps {
  onBack: () => void;
  onGameComplete?: (won: boolean) => void;
  darkMode?: boolean;
}

interface TileItem {
  id: string;
  text: string;
  pairId: string;
  type: 'EN' | 'TR';
  isMatched: boolean;
}

export const WordMatchGame: React.FC<WordMatchGameProps> = ({ onBack, onGameComplete, darkMode }) => {
  const [tiles, setTiles] = useState<TileItem[]>([]);
  const [selectedFirst, setSelectedFirst] = useState<TileItem | null>(null);
  const [selectedSecond, setSelectedSecond] = useState<TileItem | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Scoring
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('wordup_highscore_match');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const initGame = () => {
    // Pick 5 random pairs
    const shuffledPairs = [...MATCH_PAIRS_POOL].sort(() => 0.5 - Math.random()).slice(0, 5);

    const enTiles: TileItem[] = shuffledPairs.map((p, i) => ({
      id: `en-${i}`,
      text: p.en,
      pairId: `pair-${i}`,
      type: 'EN',
      isMatched: false,
    }));

    const trTiles: TileItem[] = shuffledPairs.map((p, i) => ({
      id: `tr-${i}`,
      text: p.tr,
      pairId: `pair-${i}`,
      type: 'TR',
      isMatched: false,
    }));

    // Shuffle tiles together
    const allTiles = [...enTiles, ...trTiles].sort(() => 0.5 - Math.random());
    setTiles(allTiles);
    setSelectedFirst(null);
    setSelectedSecond(null);
    setMatchedPairs([]);
    setMistakes(0);
    setSeconds(0);
    setIsWon(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Timer
  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWon]);

  const handleTileClick = (tile: TileItem) => {
    if (tile.isMatched || selectedFirst?.id === tile.id || selectedSecond) return;

    if (!selectedFirst) {
      setSelectedFirst(tile);
    } else {
      setSelectedSecond(tile);

      // Check if match
      if (selectedFirst.pairId === tile.pairId && selectedFirst.type !== tile.type) {
        // Matched!
        setTimeout(() => {
          setTiles((prev) =>
            prev.map((t) =>
              t.pairId === tile.pairId ? { ...t, isMatched: true } : t
            )
          );

          const updatedScore = score + 20;
          setScore(updatedScore);
          if (updatedScore > highScore) {
            setHighScore(updatedScore);
            localStorage.setItem('wordup_highscore_match', updatedScore.toString());
          }

          const nextMatched = [...matchedPairs, tile.pairId];
          setMatchedPairs(nextMatched);

          if (nextMatched.length === 5) {
            setIsWon(true);
            confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
            if (onGameComplete) {
              onGameComplete(true);
            }
          }

          setSelectedFirst(null);
          setSelectedSecond(null);
        }, 400);
      } else {
        // Mismatch
        setMistakes((m) => m + 1);
        setTimeout(() => {
          setSelectedFirst(null);
          setSelectedSecond(null);
        }, 800);
      }
    }
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
            <h3 className="font-extrabold text-base text-[#c46210] dark:text-[#f39c12] pointer-events-auto">Kelime Eşleştirme</h3>
            <span className="text-[10px] uppercase tracking-wider text-[#7ba983] dark:text-[#7ba983] font-bold block pointer-events-auto">
              Kelimeleri Anlamlarıyla Eşleştir
            </span>
          </div>
          <button
            onClick={initGame}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 z-10"
            title="Yeniden Başlat"
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

        {/* Stats bar */}
        <div className="flex items-center justify-between px-4 py-2 mt-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <Timer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="text-[#7ba983] dark:text-[#7ba983] font-extrabold">
            Eşleşen: {matchedPairs.length}/5
          </div>
          <div className="text-rose-600 dark:text-rose-400 font-extrabold">
            Hatalar: {mistakes}
          </div>
        </div>

        {/* Game Tiles Grid */}
        <div className="grid grid-cols-2 gap-3 my-6">
          {tiles.map((tile) => {
            const isSelected = selectedFirst?.id === tile.id || selectedSecond?.id === tile.id;
            const isError =
              selectedSecond &&
              (selectedFirst?.id === tile.id || selectedSecond.id === tile.id) &&
              (selectedFirst.pairId !== selectedSecond.pairId || selectedFirst.type === selectedSecond.type);

            let tileClasses = darkMode
              ? 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-750'
              : 'bg-white text-slate-950 border-slate-300 hover:bg-slate-50 hover:shadow-md';

            if (tile.isMatched) {
              tileClasses = 'bg-[#7ba983]/20 dark:bg-[#7ba983]/30 border-[#7ba983] text-[#345c43] dark:text-[#7ba983] opacity-60 scale-98 pointer-events-none font-extrabold';
            } else if (isError) {
              tileClasses = 'bg-rose-100 dark:bg-rose-950/80 border-rose-400 text-rose-950 dark:text-rose-200 animate-shake font-extrabold';
            } else if (isSelected) {
              tileClasses = 'bg-[#345c43] text-white border-[#345c43] shadow-md scale-105 ring-2 ring-[#345c43]/40 font-extrabold';
            }

            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                className={`p-4 rounded-2xl border-2 font-bold text-sm min-h-[70px] flex items-center justify-center text-center transition-all ${tileClasses}`}
              >
                <span>{tile.text}</span>
              </button>
            );
          })}
        </div>

        {isWon && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 rounded-2xl text-center animate-fadeIn">
            <h4 className="font-extrabold text-base text-emerald-900 dark:text-emerald-200 mb-1 flex items-center justify-center gap-1.5">
              <Sparkles className="w-5 h-5 text-amber-500" /> Harika Başarı!
            </h4>
            <p className="text-xs text-slate-800 dark:text-slate-200 mb-3 font-medium">
              5 kelime çiftini {seconds} saniyede ve sadece {mistakes} hata ile eşleştirdiniz.
            </p>
            <button
              onClick={initGame}
              className="px-4 py-2 rounded-xl bg-[#345c43] text-white text-xs font-bold shadow-md hover:bg-[#2a4c36]"
            >
              Tekrar Oyna
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-[11px] text-slate-400 pb-2">
        İngilizce bir kelimeye ve ardından Türkçe karşılığına dokunarak eşleştirin.
      </div>
    </div>
  );
};
