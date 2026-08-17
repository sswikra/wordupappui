import React, { useState } from 'react';
import { Play, Grid, LayoutGrid, Link2, Shuffle, User, ArrowLeft, Trophy } from 'lucide-react';
import { GameId } from '../../types';
import { WordGuessGame } from '../games/WordGuessGame';
import { CrosswordGame } from '../games/CrosswordGame';
import { WordMatchGame } from '../games/WordMatchGame';
import { ScrambleGame } from '../games/ScrambleGame';
import { HangmanGame } from '../games/HangmanGame';

interface GamesViewProps {
  darkMode?: boolean;
  onIncrementGamesPlayed?: () => void;
}

export const GamesView: React.FC<GamesViewProps> = ({ darkMode, onIncrementGamesPlayed }) => {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  const handleGameFinish = (won: boolean) => {
    if (onIncrementGamesPlayed) {
      onIncrementGamesPlayed();
    }
  };

  const getGameHighScore = (gameId: GameId): number => {
    const keyMap: Record<GameId, string> = {
      guess: 'wordup_highscore_guess',
      crosswords: 'wordup_highscore_crossword',
      match: 'wordup_highscore_match',
      scramble: 'wordup_highscore_scramble',
      hangman: 'wordup_highscore_hangman',
    };
    const saved = localStorage.getItem(keyMap[gameId]);
    return saved ? parseInt(saved, 10) || 0 : 0;
  };

  // If a game is actively running, show that specific playable game
  if (activeGame === 'guess') {
    return <WordGuessGame onBack={() => setActiveGame(null)} onGameComplete={handleGameFinish} darkMode={darkMode} />;
  }
  if (activeGame === 'crosswords') {
    return <CrosswordGame onBack={() => setActiveGame(null)} onGameComplete={handleGameFinish} darkMode={darkMode} />;
  }
  if (activeGame === 'match') {
    return <WordMatchGame onBack={() => setActiveGame(null)} onGameComplete={handleGameFinish} darkMode={darkMode} />;
  }
  if (activeGame === 'scramble') {
    return <ScrambleGame onBack={() => setActiveGame(null)} onGameComplete={handleGameFinish} darkMode={darkMode} />;
  }
  if (activeGame === 'hangman') {
    return <HangmanGame onBack={() => setActiveGame(null)} onGameComplete={handleGameFinish} darkMode={darkMode} />;
  }

  // Games Menu matching Screen 4
  const gamesList: {
    id: GameId;
    title: string;
    description: string;
    iconBg: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'guess',
      title: 'Kelime Tahmini',
      description: '6 denemede 5 harfli kelimeyi tahmin edin.',
      iconBg: 'bg-[#e2eff2] text-[#345c43]',
      icon: LayoutGrid,
    },
    {
      id: 'crosswords',
      title: 'Kare Bulmaca',
      description: 'İpuçlarıyla boşlukları doldurun.',
      iconBg: 'bg-[#e2eff2] text-[#345c43]',
      icon: Grid,
    },
    {
      id: 'match',
      title: 'Kelime Eşleştirme',
      description: 'Kelimeleri doğru anlamlarıyla eşleştirin.',
      iconBg: 'bg-[#e2eff2] text-[#345c43]',
      icon: Link2,
    },
    {
      id: 'scramble',
      title: 'Harf Karıştırma',
      description: 'Karışık harflerden kelimeleri bulun.',
      iconBg: 'bg-[#e2eff2] text-[#345c43]',
      icon: Shuffle,
    },
    {
      id: 'hangman',
      title: 'Adam Asmaca',
      description: 'Harfleri tahmin ederek adamı kurtarın.',
      iconBg: 'bg-[#e2eff2] text-[#345c43]',
      icon: User,
    },
  ];

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Title Header matching Screen 4 */}
      <div className="px-1 pt-1">
        <h1 className="text-2xl font-extrabold text-[#345c43] dark:text-[#7ba983] tracking-tight">
          Mini Oyunlar
        </h1>
        <p className="text-xs font-bold text-[#345c43] dark:text-[#7ba983] opacity-85 mt-1">
          Eğlenirken kelime dağarcığınızı geliştirin.
        </p>
      </div>

      {/* List of Game Cards matching Screen 4 */}
      <div className="space-y-3.5 pt-2">
        {gamesList.map((game) => {
          const Icon = game.icon;

          return (
            <div
              key={game.id}
              id={`game-card-${game.id}`}
              className={`p-5 rounded-[28px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border transition-all ${
                darkMode
                  ? 'bg-[#1e293b] border-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-100/80 hover:shadow-md'
              }`}
            >
              {/* Top Row: Circular Icon & High Score Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  darkMode ? 'bg-slate-800 text-[#7ba983]' : 'bg-[#d8ebee] text-[#345c43]'
                }`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>

                {/* En Yüksek Skor (Green Badge) */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                  darkMode
                    ? 'bg-emerald-950/50 border-emerald-700/50 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-200 text-[#345c43]'
                }`}>
                  <Trophy className="w-3.5 h-3.5 fill-current" />
                  <span>En Yüksek Skor: {getGameHighScore(game.id)}</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="mb-4">
                <h3 className="text-lg font-extrabold text-[#345c43] dark:text-[#7ba983] tracking-tight">
                  {game.title}
                </h3>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                  {game.description}
                </p>
              </div>

              {/* Play Button matching home orange */}
              <button
                id={`play-btn-${game.id}`}
                onClick={() => setActiveGame(game.id)}
                className="w-full py-3 rounded-2xl bg-[#c46210] hover:bg-[#b0550c] active:bg-[#994707] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_3px_10px_rgba(196,98,16,0.25)] active:scale-[0.99] transition-transform cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Oyna</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
