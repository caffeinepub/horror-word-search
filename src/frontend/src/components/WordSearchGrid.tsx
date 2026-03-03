import { motion } from "motion/react";
import { useCallback, useRef } from "react";

interface WordSearchGridProps {
  grid: string[][];
  foundCells: Set<string>;
  selectingCells: Set<string>;
  gridSize: number;
  onCellMouseDown: (row: number, col: number) => void;
  onCellMouseEnter: (row: number, col: number) => void;
  onMouseUp: (row: number, col: number) => void;
  onTouchStart: (row: number, col: number) => void;
  onTouchMove: (
    e: React.TouchEvent,
    getCell: (x: number, y: number) => { row: number; col: number } | null,
  ) => void;
  onTouchEnd: (
    getCell: (x: number, y: number) => { row: number; col: number } | null,
    e: React.TouchEvent,
  ) => void;
}

export default function WordSearchGrid({
  grid,
  foundCells,
  selectingCells,
  gridSize,
  onCellMouseDown,
  onCellMouseEnter,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: WordSearchGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  const getCellFromPosition = useCallback(
    (x: number, y: number): { row: number; col: number } | null => {
      if (!gridRef.current) return null;
      const rect = gridRef.current.getBoundingClientRect();
      const cellSize = rect.width / gridSize;
      const col = Math.floor((x - rect.left) / cellSize);
      const row = Math.floor((y - rect.top) / cellSize);
      if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return null;
      return { row, col };
    },
    [gridSize],
  );

  if (grid.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      data-ocid="game.canvas_target"
      ref={gridRef}
      className="w-full max-w-lg rounded border select-none touch-none relative"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.14 0.02 25), oklch(0.11 0.01 20))",
        borderColor: "oklch(0.25 0.03 22 / 0.7)",
        boxShadow:
          "0 8px 40px oklch(0 0 0 / 0.6), inset 0 1px 0 oklch(1 0 0 / 0.03)",
        cursor: "crosshair",
      }}
      onTouchMove={(e) => onTouchMove(e, getCellFromPosition)}
      onTouchEnd={(e) => onTouchEnd(getCellFromPosition, e)}
    >
      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none rounded"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 60%, oklch(0 0 0 / 0.4) 100%)",
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: "1px",
          padding: "8px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {grid.flatMap((row, rowIdx) =>
          row.map((letter, colIdx) => {
            const key = `${rowIdx},${colIdx}`;
            const isFound = foundCells.has(key);
            const isSelecting = selectingCells.has(key);

            return (
              <GridCell
                key={key}
                letter={letter}
                isFound={isFound}
                isSelecting={isSelecting}
                onMouseDown={() => onCellMouseDown(rowIdx, colIdx)}
                onMouseEnter={() => onCellMouseEnter(rowIdx, colIdx)}
                onMouseUp={() => onMouseUp(rowIdx, colIdx)}
                onTouchStart={() => onTouchStart(rowIdx, colIdx)}
              />
            );
          }),
        )}
      </div>
    </motion.div>
  );
}

interface GridCellProps {
  letter: string;
  isFound: boolean;
  isSelecting: boolean;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  onMouseUp: () => void;
  onTouchStart: () => void;
}

function GridCell({
  letter,
  isFound,
  isSelecting,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onTouchStart,
}: GridCellProps) {
  const getStyle = () => {
    if (isFound) {
      return {
        background: "oklch(0.52 0.22 22 / 0.3)",
        color: "oklch(0.72 0.22 22)",
        textShadow: "0 0 8px oklch(0.52 0.22 22 / 0.7)",
        boxShadow: "inset 0 0 6px oklch(0.52 0.22 22 / 0.3)",
        border: "1px solid oklch(0.52 0.22 22 / 0.3)",
      };
    }
    if (isSelecting) {
      return {
        background: "oklch(0.62 0.2 145 / 0.2)",
        color: "oklch(0.75 0.18 145)",
        textShadow: "0 0 8px oklch(0.62 0.2 145 / 0.8)",
        border: "1px solid oklch(0.62 0.2 145 / 0.4)",
      };
    }
    return {
      background: "transparent",
      color: "oklch(0.72 0.02 50)",
      border: "1px solid transparent",
    };
  };

  const style = getStyle();

  return (
    <div
      style={{
        aspectRatio: "1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "2px",
        transition: "background 0.15s, color 0.15s, text-shadow 0.15s",
        fontSize: "clamp(0.55rem, 1.5vw, 0.85rem)",
        fontWeight: isFound ? "700" : "600",
        letterSpacing: "0.02em",
        cursor: "crosshair",
        ...style,
      }}
      className="font-mono-horror"
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
    >
      {letter}
    </div>
  );
}
