import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, RotateCcw, Skull } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CategoryName } from "../backend.d";
import { useActor } from "../hooks/useActor";
import {
  GRID_SIZE,
  formatTime,
  generateGrid,
  getCellsBetween,
} from "../lib/wordSearch";
import CompletionModal from "./CompletionModal";
import WordList from "./WordList";
import WordSearchGrid from "./WordSearchGrid";

interface GameScreenProps {
  categoryName: CategoryName;
  onBack: () => void;
  onChangeCategory: () => void;
}

export default function GameScreen({
  categoryName,
  onBack,
  onChangeCategory,
}: GameScreenProps) {
  const { actor, isFetching } = useActor();

  const { data: puzzle, isLoading } = useQuery({
    queryKey: ["puzzle", categoryName],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPuzzle(categoryName);
    },
    enabled: !!actor && !isFetching,
  });

  const [grid, setGrid] = useState<string[][]>([]);
  const [placedWordCells, setPlacedWordCells] = useState<
    Map<string, Array<{ row: number; col: number }>>
  >(new Map());
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [selectingCells, setSelectingCells] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize puzzle when data loads
  useEffect(() => {
    if (!puzzle) return;
    initPuzzle(puzzle.words);
  }, [puzzle]);

  const initPuzzle = useCallback((words: string[]) => {
    const { grid: newGrid, placedWords } = generateGrid(words);
    setGrid(newGrid);

    const cellMap = new Map<string, Array<{ row: number; col: number }>>();
    for (const pw of placedWords) {
      cellMap.set(pw.word, pw.cells);
    }
    setPlacedWordCells(cellMap);
    setFoundWords(new Set());
    setFoundCells(new Set());
    setSelectingCells(new Set());
    setIsDragging(false);
    setDragStart(null);
    setElapsedSeconds(0);
    setGameStarted(false);
    setCompleted(false);
  }, []);

  // Timer
  useEffect(() => {
    if (gameStarted && !completed) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, completed]);

  const startGame = useCallback(() => {
    if (!gameStarted) setGameStarted(true);
  }, [gameStarted]);

  const handleCellMouseDown = useCallback(
    (row: number, col: number) => {
      startGame();
      setIsDragging(true);
      setDragStart({ row, col });
      setSelectingCells(new Set([`${row},${col}`]));
    },
    [startGame],
  );

  const handleCellMouseEnter = useCallback(
    (row: number, col: number) => {
      if (!isDragging || !dragStart) return;
      const cells = getCellsBetween(dragStart.row, dragStart.col, row, col);
      if (!cells) return;
      setSelectingCells(new Set(cells.map((c) => `${c.row},${c.col}`)));
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(
    (row: number, col: number) => {
      if (!isDragging || !dragStart || grid.length === 0) {
        setIsDragging(false);
        setDragStart(null);
        setSelectingCells(new Set());
        return;
      }

      const cells = getCellsBetween(dragStart.row, dragStart.col, row, col);

      if (cells && cells.length > 0) {
        const selected = cells.map((c) => grid[c.row][c.col]).join("");
        const reversed = selected.split("").reverse().join("");

        let matchedWord: string | null = null;
        for (const [word] of placedWordCells) {
          if (
            !foundWords.has(word) &&
            (selected === word || reversed === word)
          ) {
            matchedWord = word;
            break;
          }
        }

        if (matchedWord) {
          const wordCells = placedWordCells.get(matchedWord)!;
          const newFoundCells = new Set(foundCells);
          for (const c of wordCells) {
            newFoundCells.add(`${c.row},${c.col}`);
          }
          const newFoundWords = new Set(foundWords);
          newFoundWords.add(matchedWord);

          setFoundCells(newFoundCells);
          setFoundWords(newFoundWords);

          // Check completion
          if (puzzle && newFoundWords.size >= puzzle.words.length) {
            setCompleted(true);
          }
        }
      }

      setIsDragging(false);
      setDragStart(null);
      setSelectingCells(new Set());
    },
    [
      isDragging,
      dragStart,
      grid,
      placedWordCells,
      foundWords,
      foundCells,
      puzzle,
    ],
  );

  const handleGlobalMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      setSelectingCells(new Set());
    }
  }, [isDragging]);

  // Touch support
  const handleTouchStart = useCallback(
    (row: number, col: number) => {
      handleCellMouseDown(row, col);
    },
    [handleCellMouseDown],
  );

  const handleTouchMove = useCallback(
    (
      e: React.TouchEvent,
      getCell: (x: number, y: number) => { row: number; col: number } | null,
    ) => {
      e.preventDefault();
      const touch = e.touches[0];
      const cell = getCell(touch.clientX, touch.clientY);
      if (cell) handleCellMouseEnter(cell.row, cell.col);
    },
    [handleCellMouseEnter],
  );

  const handleTouchEnd = useCallback(
    (
      getCell: (x: number, y: number) => { row: number; col: number } | null,
      e: React.TouchEvent,
    ) => {
      const touch = e.changedTouches[0];
      const cell = getCell(touch.clientX, touch.clientY);
      if (cell) {
        handleMouseUp(cell.row, cell.col);
      } else {
        setIsDragging(false);
        setDragStart(null);
        setSelectingCells(new Set());
      }
    },
    [handleMouseUp],
  );

  const handleNewGame = useCallback(() => {
    if (puzzle) initPuzzle(puzzle.words);
  }, [puzzle, initPuzzle]);

  const allWords =
    puzzle?.words?.map((w) => w.toUpperCase().replace(/\s+/g, "")) ?? [];

  return (
    <div
      className="min-h-screen relative no-select"
      onMouseUp={handleGlobalMouseUp}
    >
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 10% 20%, oklch(0.18 0.05 22 / 0.3) 0%, transparent 40%),
            radial-gradient(ellipse at 90% 80%, oklch(0.15 0.04 145 / 0.2) 0%, transparent 40%),
            oklch(0.1 0.01 20)
          `,
        }}
      />

      {/* Header Bar */}
      <header className="relative z-10 border-b border-border px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          data-ocid="game.back_button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-body transition-colors duration-200 px-3 py-1.5 rounded"
          style={{
            color: "oklch(0.55 0.02 50)",
            border: "1px solid oklch(0.25 0.02 20)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "oklch(0.88 0.02 50)";
            e.currentTarget.style.borderColor = "oklch(0.45 0.15 22)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "oklch(0.55 0.02 50)";
            e.currentTarget.style.borderColor = "oklch(0.25 0.02 20)";
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Categories
        </button>

        {/* Title + Timer */}
        <div className="flex flex-col items-center">
          <span
            className="font-horror text-xl font-bold horror-glow"
            style={{ color: "oklch(0.88 0.02 50)" }}
          >
            {categoryName}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Clock
              className="w-3 h-3"
              style={{ color: "oklch(0.62 0.2 145)" }}
            />
            <span
              className="font-mono-horror text-sm"
              style={{ color: "oklch(0.62 0.2 145)" }}
            >
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* New Game button */}
        <button
          type="button"
          data-ocid="game.new_game_button"
          onClick={handleNewGame}
          className="flex items-center gap-2 text-sm font-body transition-all duration-200 px-3 py-1.5 rounded"
          style={{
            color: "oklch(0.88 0.02 50)",
            background: "oklch(0.52 0.22 22 / 0.15)",
            border: "1px solid oklch(0.52 0.22 22 / 0.4)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "oklch(0.52 0.22 22 / 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "oklch(0.52 0.22 22 / 0.15)";
          }}
        >
          <RotateCcw className="w-4 h-4" />
          New Game
        </button>
      </header>

      {/* Game area */}
      <main className="relative z-10 flex flex-col lg:flex-row gap-6 p-4 max-w-6xl mx-auto">
        {isLoading || grid.length === 0 ? (
          <GameLoadingSkeleton />
        ) : (
          <>
            {/* Word Search Grid */}
            <div className="flex-1 flex flex-col items-center">
              <WordSearchGrid
                grid={grid}
                foundCells={foundCells}
                selectingCells={selectingCells}
                gridSize={GRID_SIZE}
                onCellMouseDown={handleCellMouseDown}
                onCellMouseEnter={handleCellMouseEnter}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />

              {/* Progress bar */}
              <div className="mt-4 w-full max-w-lg">
                <div
                  className="flex justify-between text-xs font-mono-horror mb-1.5"
                  style={{ color: "oklch(0.45 0.02 50)" }}
                >
                  <span>
                    Found: {foundWords.size}/{allWords.length}
                  </span>
                  <span>
                    {Math.round(
                      (foundWords.size / Math.max(allWords.length, 1)) * 100,
                    )}
                    %
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.18 0.01 20)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "oklch(0.52 0.22 22)" }}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(foundWords.size / Math.max(allWords.length, 1)) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* Word List Sidebar */}
            <aside className="lg:w-56 xl:w-64">
              <WordList words={allWords} foundWords={foundWords} />
            </aside>
          </>
        )}
      </main>

      {/* Completion Modal */}
      <AnimatePresence>
        {completed && (
          <CompletionModal
            categoryName={categoryName}
            timeTaken={elapsedSeconds}
            foundWords={foundWords.size}
            totalWords={allWords.length}
            onPlayAgain={handleNewGame}
            onChooseCategory={onChangeCategory}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function GameLoadingSkeleton() {
  return (
    <div
      className="flex-1 flex flex-col items-center gap-4"
      data-ocid="game.loading_state"
    >
      <div className="flex items-center gap-2 mb-4">
        <Skull
          className="w-5 h-5 animate-pulse"
          style={{ color: "oklch(0.52 0.22 22)" }}
        />
        <span
          className="font-serif-horror italic"
          style={{ color: "oklch(0.45 0.02 50)" }}
        >
          Summoning the darkness...
        </span>
      </div>
      <div
        className="w-full max-w-lg aspect-square rounded animate-pulse"
        style={{ background: "oklch(0.13 0.015 20)" }}
      />
    </div>
  );
}
