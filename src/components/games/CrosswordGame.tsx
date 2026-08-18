import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { ArrowLeft, RotateCcw, Check, Sparkles } from 'lucide-react-native';
import { CROSSWORD_PUZZLES } from '../../data/mockData';
import { HapticsService } from '../../utils/haptics';
import { StorageService } from '../../utils/storage';
import { GameScoreBoard } from './GameScoreBoard';
import { Colors, getTheme } from '../../theme/colors';

interface CrosswordGameProps {
  onBack: () => void;
  onGameComplete?: (won: boolean) => void;
  darkMode?: boolean;
}

const { width } = Dimensions.get('window');
const GRID_SIZE = 5;
const CELL_SIZE = Math.min(52, (width - 80) / GRID_SIZE);

export const CrosswordGame: React.FC<CrosswordGameProps> = ({
  onBack,
  onGameComplete,
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);
  const puzzle = CROSSWORD_PUZZLES[0];
  const size = puzzle.size;

  const clueNumbersMap = useMemo(() => {
    const map: Record<string, number> = {};
    puzzle.acrossClues.forEach((clue) => {
      map[`${clue.row}-${clue.col}`] = clue.num;
    });
    puzzle.downClues.forEach((clue) => {
      if (!map[`${clue.row}-${clue.col}`]) {
        map[`${clue.row}-${clue.col}`] = clue.num;
      }
    });
    return map;
  }, [puzzle]);

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

  // Score
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    StorageService.getHighScore('crossword').then(setHighScore);
  }, []);

  const handleCellPress = (r: number, c: number) => {
    if (puzzle.grid[r][c] === '■') return;
    HapticsService.selection();
    setSelectedCell({ r, c });
  };

  const handleKeyInput = (char: string) => {
    if (!selectedCell || isCompleted) return;
    const { r, c } = selectedCell;
    if (puzzle.grid[r][c] === '■') return;

    HapticsService.light();
    const newGrid = grid.map((row, ri) =>
      row.map((col, ci) => (ri === r && ci === c ? char.toUpperCase() : col))
    );
    setGrid(newGrid);

    // Auto advance
    if (char && c < size - 1 && puzzle.grid[r][c + 1] !== '■') {
      setSelectedCell({ r, c: c + 1 });
    } else if (char && r < size - 1 && puzzle.grid[r + 1][c] !== '■') {
      setSelectedCell({ r: r + 1, c });
    }
  };

  const handleDelete = () => {
    if (!selectedCell || isCompleted) return;
    const { r, c } = selectedCell;
    if (puzzle.grid[r][c] === '■') return;

    HapticsService.light();
    const newGrid = grid.map((row, ri) =>
      row.map((col, ci) => (ri === r && ci === c ? '' : col))
    );
    setGrid(newGrid);
  };

  const handleCheck = () => {
    let allCorrect = true;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (puzzle.grid[r][c] !== '■') {
          if (grid[r][c] !== puzzle.grid[r][c]) {
            allCorrect = false;
          }
        }
      }
    }

    if (allCorrect) {
      HapticsService.success();
      setIsCompleted(true);
      setHasError(false);
      const newScore = score + 100;
      setScore(newScore);

      if (newScore > highScore) {
        setHighScore(newScore);
        StorageService.saveHighScore('crossword', newScore);
      }
      if (onGameComplete) onGameComplete(true);
    } else {
      HapticsService.error();
      setHasError(true);
      setTimeout(() => setHasError(false), 2500);
    }
  };

  const handleReset = () => {
    HapticsService.selection();
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
    setSelectedCell({ r: 0, c: 0 });
  };

  const alphabetRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={20} color={theme.textPrimary} />
          <Text style={[styles.backText, { color: theme.textPrimary }]}>Oyunlar</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
          Kare Bulmaca
        </Text>

        <TouchableOpacity
          onPress={handleReset}
          style={[styles.actionBtn, { backgroundColor: darkMode ? '#334155' : '#e2eff2' }]}
        >
          <RotateCcw size={18} color={darkMode ? '#7ba983' : Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Score */}
      <GameScoreBoard currentScore={score} highScore={highScore} darkMode={darkMode} />

      {/* 5x5 Crossword Grid with Row & Column Labels */}
      <View style={styles.gridWrapper}>
        {/* Column Numbers Header */}
        <View style={styles.colNumbersRow}>
          <View style={styles.cornerSpacer} />
          {Array(size)
            .fill(0)
            .map((_, c) => (
              <View key={c} style={styles.colNumberBox}>
                <Text style={[styles.axisNumberText, { color: darkMode ? '#94a3b8' : '#64748b' }]}>
                  {c + 1}
                </Text>
              </View>
            ))}
        </View>

        <View style={styles.gridAndRowsContainer}>
          {/* Row Numbers Column */}
          <View style={styles.rowNumbersCol}>
            {Array(size)
              .fill(0)
              .map((_, r) => (
                <View key={r} style={styles.rowNumberBox}>
                  <Text style={[styles.axisNumberText, { color: darkMode ? '#94a3b8' : '#64748b' }]}>
                    {r + 1}
                  </Text>
                </View>
              ))}
          </View>

          {/* Main Grid */}
          <View style={[styles.grid, { borderColor: darkMode ? '#334155' : '#cbd5e1' }]}>
            {grid.map((row, r) => (
              <View key={r} style={styles.gridRow}>
                {row.map((cell, c) => {
                  const isBlocked = puzzle.grid[r][c] === '■';
                  const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                  const clueNum = clueNumbersMap[`${r}-${c}`];

                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => handleCellPress(r, c)}
                      disabled={isBlocked}
                      activeOpacity={0.8}
                      style={[
                        styles.cell,
                        {
                          backgroundColor: isBlocked
                            ? darkMode
                              ? '#0f172a'
                              : '#1e293b'
                            : isSelected
                            ? '#fef08a'
                            : darkMode
                            ? '#1e293b'
                            : '#ffffff',
                          borderColor: isSelected
                            ? '#eab308'
                            : darkMode
                            ? '#334155'
                            : '#e2e8f0',
                        },
                      ]}
                    >
                      {!isBlocked && clueNum ? (
                        <Text
                          style={[
                            styles.cellClueNum,
                            {
                              color: isSelected
                                ? '#854d0e'
                                : darkMode
                                ? '#94a3b8'
                                : '#64748b',
                            },
                          ]}
                        >
                          {clueNum}
                        </Text>
                      ) : null}

                      {!isBlocked && (
                        <Text
                          style={[
                            styles.cellText,
                            {
                              color: isSelected
                                ? '#854d0e'
                                : isCompleted
                                ? '#10b981'
                                : darkMode
                                ? '#f8fafc'
                                : '#0f172a',
                            },
                          ]}
                        >
                          {cell}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Check & Success Feedback */}
      {isCompleted ? (
        <View style={[styles.successBanner, { backgroundColor: '#ecfdf5', borderColor: '#6ee7b7' }]}>
          <Sparkles size={20} color="#10b981" />
          <Text style={styles.successText}>Harika! Bulmacayı eksiksiz tamamladınız!</Text>
        </View>
      ) : hasError ? (
        <View style={[styles.errorBanner, { backgroundColor: '#fff1f2', borderColor: '#fecdd3' }]}>
          <Text style={styles.errorText}>Bazı harfler yanlış, lütfen kontrol edin!</Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleCheck}
          style={[styles.checkBtn, { backgroundColor: Colors.primary }]}
          activeOpacity={0.8}
        >
          <Check size={18} color="#ffffff" strokeWidth={2.4} />
          <Text style={styles.checkBtnText}>Bulmacayı Kontrol Et</Text>
        </TouchableOpacity>
      )}

      {/* Clues Tabs (Across & Down) */}
      <View style={[styles.cluesContainer, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
        <View style={styles.clueTabHeader}>
          <TouchableOpacity
            onPress={() => {
              HapticsService.selection();
              setClueTab('across');
            }}
            style={[
              styles.clueTabBtn,
              clueTab === 'across' && { backgroundColor: Colors.primary },
            ]}
          >
            <Text
              style={[
                styles.clueTabBtnText,
                { color: clueTab === 'across' ? '#ffffff' : theme.textSecondary },
              ]}
            >
              Yatay İpuçları ({puzzle.acrossClues.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              HapticsService.selection();
              setClueTab('down');
            }}
            style={[
              styles.clueTabBtn,
              clueTab === 'down' && { backgroundColor: Colors.primary },
            ]}
          >
            <Text
              style={[
                styles.clueTabBtnText,
                { color: clueTab === 'down' ? '#ffffff' : theme.textSecondary },
              ]}
            >
              Dikey İpuçları ({puzzle.downClues.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cluesList}>
          {(clueTab === 'across' ? puzzle.acrossClues : puzzle.downClues).map((clue) => (
            <TouchableOpacity
              key={clue.num}
              onPress={() => setSelectedCell({ r: clue.row, c: clue.col })}
              style={styles.clueItem}
            >
              <View style={[styles.clueBadge, { backgroundColor: darkMode ? '#334155' : '#e2eff2' }]}>
                <Text style={[styles.clueNum, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                  {clue.num}
                </Text>
              </View>
              <Text style={[styles.clueDesc, { color: theme.textPrimary }]}>
                {clue.text} ({clue.answer.length} harf)
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Keyboard */}
      <View style={styles.keypad}>
        {alphabetRows.map((row, rIdx) => (
          <View key={rIdx} style={styles.keypadRow}>
            {row.map((k) => (
              <TouchableOpacity
                key={k}
                onPress={() => {
                  if (k === '⌫') handleDelete();
                  else handleKeyInput(k);
                }}
                activeOpacity={0.7}
                style={[
                  styles.keypadBtn,
                  k === '⌫' && styles.delKey,
                  { backgroundColor: darkMode ? '#1e293b' : '#e2e8f0' },
                ]}
              >
                <Text
                  style={[
                    styles.keypadText,
                    { color: darkMode ? '#f8fafc' : '#1e293b' },
                  ]}
                >
                  {k}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridWrapper: {
    alignItems: 'center',
    marginVertical: 10,
  },
  colNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cornerSpacer: {
    width: 22,
    height: 18,
  },
  colNumberBox: {
    width: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridAndRowsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowNumbersCol: {
    width: 22,
    marginRight: 4,
    justifyContent: 'space-around',
  },
  rowNumberBox: {
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  axisNumberText: {
    fontSize: 12,
    fontWeight: '800',
  },
  grid: {
    borderWidth: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cellClueNum: {
    position: 'absolute',
    top: 2,
    left: 4,
    fontSize: 9,
    fontWeight: '900',
  },
  cellText: {
    fontSize: 20,
    fontWeight: '900',
  },
  checkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    marginVertical: 10,
  },
  checkBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 10,
  },
  successText: {
    color: '#065f46',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  errorBanner: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 10,
    alignItems: 'center',
  },
  errorText: {
    color: '#be123c',
    fontSize: 12,
    fontWeight: '800',
  },
  cluesContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    marginVertical: 10,
  },
  clueTabHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  clueTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  clueTabBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cluesList: {
    gap: 8,
  },
  clueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  clueBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clueNum: {
    fontSize: 11,
    fontWeight: '900',
  },
  clueDesc: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  keypad: {
    marginTop: 8,
    gap: 5,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  keypadBtn: {
    height: 40,
    minWidth: (width - 70) / 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delKey: {
    minWidth: (width - 70) / 6,
  },
  keypadText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
