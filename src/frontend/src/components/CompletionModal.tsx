import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, List, RotateCcw, Skull, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import type { CategoryName } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { formatTime } from "../lib/wordSearch";

interface CompletionModalProps {
  categoryName: CategoryName;
  timeTaken: number; // seconds
  foundWords: number;
  totalWords: number;
  onPlayAgain: () => void;
  onChooseCategory: () => void;
}

export default function CompletionModal({
  categoryName,
  timeTaken,
  foundWords,
  totalWords,
  onPlayAgain,
  onChooseCategory,
}: CompletionModalProps) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      // Convert seconds to nanoseconds (bigint)
      const timeTakenNs = BigInt(timeTaken) * BigInt(1_000_000_000);
      await actor.submitPuzzleTime(categoryName, timeTakenNs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["leaderboard", categoryName],
      });
    },
  });

  const submitMutate = submitMutation.mutate;
  // Auto-submit on mount
  useEffect(() => {
    submitMutate();
  }, [submitMutate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 0.8)" }}
      data-ocid="completion.dialog"
    >
      {/* Backdrop blur effect */}
      <div className="absolute inset-0 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.5, type: "spring", damping: 20 }}
        className="relative max-w-md w-full rounded"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.025 22), oklch(0.11 0.015 20) 50%, oklch(0.13 0.02 280))",
          border: "1px solid oklch(0.52 0.22 22 / 0.5)",
          boxShadow:
            "0 20px 80px oklch(0.52 0.22 22 / 0.3), 0 8px 30px oklch(0 0 0 / 0.6)",
          padding: "2rem",
        }}
      >
        {/* Decorative top line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.52 0.22 22 / 0.8), transparent)",
          }}
        />

        {/* Skull icons */}
        <div className="flex justify-center gap-3 mb-5">
          {[0, 0.3, 0.6].map((delay) => (
            <motion.div
              key={delay}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.4, delay, type: "spring" }}
            >
              <Skull
                className="w-8 h-8"
                style={{ color: "oklch(0.65 0.22 22)" }}
                strokeWidth={1.5}
              />
            </motion.div>
          ))}
        </div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-horror text-3xl md:text-4xl text-center mb-1 horror-glow"
          style={{ color: "oklch(0.88 0.02 50)" }}
        >
          You Survived!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center font-serif-horror italic mb-6"
          style={{ color: "oklch(0.55 0.02 50)" }}
        >
          All {totalWords} horrors have been found in{" "}
          <span
            className="font-semibold"
            style={{ color: "oklch(0.85 0.02 50)" }}
          >
            {categoryName}
          </span>
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          {/* Time */}
          <div
            className="rounded p-4 flex flex-col items-center gap-1"
            style={{
              background: "oklch(0.52 0.22 22 / 0.12)",
              border: "1px solid oklch(0.52 0.22 22 / 0.25)",
            }}
          >
            <Clock
              className="w-5 h-5 mb-1"
              style={{ color: "oklch(0.62 0.2 145)" }}
            />
            <span
              className="font-mono-horror text-2xl font-bold"
              style={{ color: "oklch(0.85 0.02 50)" }}
            >
              {formatTime(timeTaken)}
            </span>
            <span
              className="text-xs font-body uppercase tracking-wider"
              style={{ color: "oklch(0.45 0.02 50)" }}
            >
              Time
            </span>
          </div>

          {/* Words found */}
          <div
            className="rounded p-4 flex flex-col items-center gap-1"
            style={{
              background: "oklch(0.62 0.2 145 / 0.08)",
              border: "1px solid oklch(0.62 0.2 145 / 0.2)",
            }}
          >
            <Trophy
              className="w-5 h-5 mb-1"
              style={{ color: "oklch(0.75 0.2 55)" }}
            />
            <span
              className="font-mono-horror text-2xl font-bold"
              style={{ color: "oklch(0.85 0.02 50)" }}
            >
              {foundWords}/{totalWords}
            </span>
            <span
              className="text-xs font-body uppercase tracking-wider"
              style={{ color: "oklch(0.45 0.02 50)" }}
            >
              Words
            </span>
          </div>
        </motion.div>

        {/* Submit status */}
        {submitMutation.isPending && (
          <p
            className="text-center text-xs font-mono-horror mb-4"
            style={{ color: "oklch(0.45 0.02 50)" }}
          >
            Recording your escape time...
          </p>
        )}
        {submitMutation.isSuccess && (
          <p
            className="text-center text-xs font-mono-horror mb-4"
            style={{ color: "oklch(0.62 0.2 145)" }}
          >
            ✓ Time recorded on leaderboard
          </p>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <button
            type="button"
            data-ocid="completion.play_again_button"
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded font-body font-semibold text-sm uppercase tracking-wider transition-all duration-200"
            style={{
              background: "oklch(0.52 0.22 22)",
              color: "oklch(0.95 0.01 20)",
              border: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "oklch(0.6 0.26 22)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "oklch(0.52 0.22 22)";
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>

          <button
            type="button"
            data-ocid="completion.cancel_button"
            onClick={onChooseCategory}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded font-body font-semibold text-sm uppercase tracking-wider transition-all duration-200"
            style={{
              background: "transparent",
              color: "oklch(0.75 0.02 50)",
              border: "1px solid oklch(0.3 0.02 20)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "oklch(0.52 0.22 22 / 0.5)";
              e.currentTarget.style.color = "oklch(0.88 0.02 50)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "oklch(0.3 0.02 20)";
              e.currentTarget.style.color = "oklch(0.75 0.02 50)";
            }}
          >
            <List className="w-4 h-4" />
            Categories
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
