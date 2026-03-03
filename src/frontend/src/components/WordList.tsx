import { CheckCircle2, Circle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface WordListProps {
  words: string[];
  foundWords: Set<string>;
}

export default function WordList({ words, foundWords }: WordListProps) {
  const sortedWords = [...words].sort((a, b) => {
    const aFound = foundWords.has(a);
    const bFound = foundWords.has(b);
    if (aFound && !bFound) return 1;
    if (!aFound && bFound) return -1;
    return a.localeCompare(b);
  });

  return (
    <div
      data-ocid="game.list"
      className="rounded border p-4 h-full"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.13 0.015 20), oklch(0.11 0.01 20))",
        borderColor: "oklch(0.22 0.02 20)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3
          className="font-horror text-base font-bold"
          style={{ color: "oklch(0.85 0.02 50)" }}
        >
          Words to Find
        </h3>
        <span
          className="text-xs font-mono-horror px-2 py-0.5 rounded"
          style={{
            background: "oklch(0.52 0.22 22 / 0.2)",
            color: "oklch(0.72 0.22 22)",
            border: "1px solid oklch(0.52 0.22 22 / 0.3)",
          }}
        >
          {foundWords.size}/{words.length}
        </span>
      </div>

      <div className="space-y-1.5 max-h-96 lg:max-h-none overflow-y-auto">
        <AnimatePresence>
          {sortedWords.map((word) => {
            const isFound = foundWords.has(word);
            return (
              <motion.div
                key={word}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 px-2 py-1.5 rounded"
                style={{
                  background: isFound
                    ? "oklch(0.52 0.22 22 / 0.1)"
                    : "transparent",
                  border: `1px solid ${isFound ? "oklch(0.52 0.22 22 / 0.2)" : "transparent"}`,
                }}
              >
                {isFound ? (
                  <CheckCircle2
                    className="w-3.5 h-3.5 flex-shrink-0 animate-ghost-pulse"
                    style={{ color: "oklch(0.52 0.22 22)" }}
                  />
                ) : (
                  <Circle
                    className="w-3.5 h-3.5 flex-shrink-0"
                    style={{ color: "oklch(0.3 0.02 50)" }}
                  />
                )}
                <span
                  className="font-mono-horror text-xs font-medium uppercase tracking-wider"
                  style={{
                    color: isFound
                      ? "oklch(0.62 0.2 22)"
                      : "oklch(0.65 0.02 50)",
                    textDecoration: isFound ? "line-through" : "none",
                    textDecorationColor: isFound
                      ? "oklch(0.52 0.22 22)"
                      : "transparent",
                    transition: "all 0.3s",
                  }}
                >
                  {word}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
