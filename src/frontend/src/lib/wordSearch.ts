export const GRID_SIZE = 15;

export type Direction = {
  dr: number;
  dc: number;
};

export type PlacedWord = {
  word: string;
  row: number;
  col: number;
  direction: Direction;
  cells: Array<{ row: number; col: number }>;
};

export type Cell = {
  letter: string;
  row: number;
  col: number;
};

export const DIRECTIONS: Direction[] = [
  { dr: 0, dc: 1 }, // right
  { dr: 0, dc: -1 }, // left
  { dr: 1, dc: 0 }, // down
  { dr: -1, dc: 0 }, // up
  { dr: 1, dc: 1 }, // down-right
  { dr: 1, dc: -1 }, // down-left
  { dr: -1, dc: 1 }, // up-right
  { dr: -1, dc: -1 }, // up-left
];

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateGrid(words: string[]): {
  grid: string[][];
  placedWords: PlacedWord[];
} {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(""),
  );

  const placedWords: PlacedWord[] = [];

  // Normalize words: uppercase, no spaces
  const normalizedWords = words
    .map((w) => w.toUpperCase().replace(/\s+/g, ""))
    .filter((w) => w.length > 0 && w.length <= GRID_SIZE);

  for (const word of normalizedWords) {
    let placed = false;
    const shuffledDirs = shuffle(DIRECTIONS);
    const maxAttempts = 100;

    for (let attempt = 0; attempt < maxAttempts && !placed; attempt++) {
      const dir = shuffledDirs[attempt % shuffledDirs.length];
      const row = getRandomInt(GRID_SIZE);
      const col = getRandomInt(GRID_SIZE);

      if (canPlace(grid, word, row, col, dir)) {
        placeWord(grid, word, row, col, dir);
        const cells = word.split("").map((_, i) => ({
          row: row + dir.dr * i,
          col: col + dir.dc * i,
        }));
        placedWords.push({ word, row, col, direction: dir, cells });
        placed = true;
      }
    }
  }

  // Fill remaining empty cells with random uppercase letters
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!grid[r][c]) {
        grid[r][c] = letters[getRandomInt(letters.length)];
      }
    }
  }

  return { grid, placedWords };
}

function canPlace(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dir: Direction,
): boolean {
  for (let i = 0; i < word.length; i++) {
    const r = row + dir.dr * i;
    const c = col + dir.dc * i;

    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;

    const existing = grid[r][c];
    if (existing !== "" && existing !== word[i]) return false;
  }
  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dir: Direction,
): void {
  for (let i = 0; i < word.length; i++) {
    const r = row + dir.dr * i;
    const c = col + dir.dc * i;
    grid[r][c] = word[i];
  }
}

export function getCellsBetween(
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
): Array<{ row: number; col: number }> | null {
  const dr = endRow - startRow;
  const dc = endCol - startCol;

  // Must be in a valid direction: horizontal, vertical, or diagonal
  const absR = Math.abs(dr);
  const absC = Math.abs(dc);

  if (dr !== 0 && dc !== 0 && absR !== absC) return null;

  const len = Math.max(absR, absC);
  if (len === 0) return [{ row: startRow, col: startCol }];

  const stepR = dr === 0 ? 0 : dr / absR;
  const stepC = dc === 0 ? 0 : dc / absC;

  const cells: Array<{ row: number; col: number }> = [];
  for (let i = 0; i <= len; i++) {
    cells.push({
      row: startRow + stepR * i,
      col: startCol + stepC * i,
    });
  }

  return cells;
}

export function getWordFromCells(
  grid: string[][],
  cells: Array<{ row: number; col: number }>,
): string {
  return cells.map(({ row, col }) => grid[row][col]).join("");
}

export function checkWordMatch(
  word: string,
  selectedCells: Array<{ row: number; col: number }>,
  grid: string[][],
): boolean {
  const selected = getWordFromCells(grid, selectedCells);
  const reversed = selected.split("").reverse().join("");
  return selected === word || reversed === word;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
