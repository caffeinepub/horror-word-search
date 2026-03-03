import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Clock, Skull, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { CategoryName } from "../backend.d";
import { useActor } from "../hooks/useActor";
import LeaderboardPanel from "./LeaderboardPanel";

interface CategoryScreenProps {
  onCategorySelect: (category: string) => void;
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Slashers: "Blades in the dark. Masked killers. Nowhere to run.",
  Supernatural: "Beyond death, beyond reason. Evil has no end.",
  Zombies: "The dead walk. The living despair.",
  "Psychological Horror": "The mind unravels. Reality bends. Trust no one.",
  "Classic Monsters": "Ancient terrors reborn. Fangs. Claws. Darkness.",
  Demons: "Hell has come to claim its own.",
};

const CATEGORY_COLORS: Record<string, string> = {
  Slashers: "oklch(0.52 0.22 22)",
  Supernatural: "oklch(0.45 0.15 280)",
  Zombies: "oklch(0.55 0.18 145)",
  "Psychological Horror": "oklch(0.5 0.12 310)",
  "Classic Monsters": "oklch(0.55 0.2 55)",
  Demons: "oklch(0.48 0.25 22)",
};

const CATEGORY_ICONS: Record<string, string> = {
  Slashers: "🔪",
  Supernatural: "👻",
  Zombies: "🧟",
  "Psychological Horror": "🧠",
  "Classic Monsters": "🦇",
  Demons: "😈",
};

export default function CategoryScreen({
  onCategorySelect,
}: CategoryScreenProps) {
  const { actor, isFetching } = useActor();
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<string | null>(
    null,
  );

  const { data: categories, isLoading } = useQuery<CategoryName[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Atmospheric background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 10%, oklch(0.2 0.06 22 / 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 90%, oklch(0.15 0.04 280 / 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, oklch(0.08 0.01 20) 0%, oklch(0.06 0.01 20) 100%)
          `,
        }}
      />

      {/* Header */}
      <header className="relative z-10 pt-12 pb-8 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center mb-4"
        >
          <div className="flex items-center gap-3">
            <Skull
              className="w-8 h-8 text-blood-red-bright animate-pulse"
              strokeWidth={1.5}
            />
            <Skull
              className="w-8 h-8 text-blood-red-bright animate-pulse"
              strokeWidth={1.5}
              style={{ animationDelay: "0.5s" }}
            />
            <Skull
              className="w-8 h-8 text-blood-red-bright animate-pulse"
              strokeWidth={1.5}
              style={{ animationDelay: "1s" }}
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-horror text-5xl md:text-7xl font-black tracking-tight mb-3 horror-flicker horror-glow"
          style={{
            color: "oklch(0.88 0.02 50)",
            letterSpacing: "-0.02em",
          }}
        >
          <span className="text-blood">HORROR</span>
          <br />
          <span>WORD SEARCH</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="font-serif-horror text-lg md:text-xl text-fog italic"
          style={{ letterSpacing: "0.1em" }}
        >
          ☠ Find the hidden horrors ☠
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-6 mx-auto max-w-xs h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.52 0.22 22), transparent)",
          }}
        />
      </header>

      {/* Main content */}
      <main className="relative z-10 px-4 pb-16 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mb-8 text-center"
        >
          <p className="font-body text-sm uppercase tracking-widest text-muted-foreground">
            — Choose your nightmare —
          </p>
        </motion.div>

        {/* Category Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((id) => (
              <Skeleton
                key={id}
                className="h-40 rounded"
                style={{ background: "oklch(0.15 0.02 20)" }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {(categories || []).map((cat, index) => (
              <CategoryCard
                key={cat}
                category={cat}
                index={index}
                color={CATEGORY_COLORS[cat] || "oklch(0.52 0.22 22)"}
                description={
                  CATEGORY_DESCRIPTIONS[cat] || "Darkness awaits within."
                }
                icon={CATEGORY_ICONS[cat] || "💀"}
                onPlay={onCategorySelect}
                onLeaderboard={() =>
                  setSelectedLeaderboard(
                    selectedLeaderboard === cat ? null : cat,
                  )
                }
                showLeaderboard={selectedLeaderboard === cat}
              />
            ))}
          </div>
        )}

        {/* Leaderboard Panel */}
        <AnimatePresence>
          {selectedLeaderboard && (
            <motion.div
              key={selectedLeaderboard}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-12"
              data-ocid="leaderboard.panel"
            >
              <LeaderboardPanel categoryName={selectedLeaderboard} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground border-t border-border pt-6">
          <p className="font-body">
            © {new Date().getFullYear()}. Built with{" "}
            <span className="text-blood-red-bright">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ghost-green hover:text-ghost-green underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

interface CategoryCardProps {
  category: string;
  index: number;
  color: string;
  description: string;
  icon: string;
  onPlay: (cat: string) => void;
  onLeaderboard: () => void;
  showLeaderboard: boolean;
}

function CategoryCard({
  category,
  index,
  color,
  description,
  icon,
  onPlay,
  onLeaderboard,
  showLeaderboard,
}: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      data-ocid={`category.item.${index + 1}`}
      className="card-horror rounded relative overflow-hidden group cursor-pointer"
      onClick={() => onPlay(category)}
    >
      {/* Accent stripe via gradient, not border */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-70"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />

      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${color.replace(")", " / 0.12)")} 0%, transparent 70%)`,
        }}
      />

      <div className="relative p-6">
        {/* Icon */}
        <div className="text-4xl mb-3">{icon}</div>

        {/* Title */}
        <h2
          className="font-horror text-2xl font-bold mb-2 group-hover:text-blood-red-bright transition-colors duration-300"
          style={{ color: "oklch(0.85 0.02 50)" }}
        >
          {category}
        </h2>

        {/* Description */}
        <p
          className="font-serif-horror text-sm italic mb-4"
          style={{ color: "oklch(0.55 0.02 50)" }}
        >
          {description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-mono-horror uppercase tracking-wider transition-colors duration-200"
            style={{ color: "oklch(0.62 0.2 145)" }}
            onClick={(e) => {
              e.stopPropagation();
              onLeaderboard();
            }}
          >
            <Trophy className="w-3 h-3" />
            {showLeaderboard ? "Hide" : "Scores"}
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-body font-semibold uppercase tracking-widest px-3 py-1.5 rounded transition-all duration-200"
            style={{
              background: "oklch(0.52 0.22 22 / 0.2)",
              border: "1px solid oklch(0.52 0.22 22 / 0.4)",
              color: "oklch(0.85 0.02 50)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onPlay(category);
            }}
          >
            Play <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
