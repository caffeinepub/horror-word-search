import { useQuery } from "@tanstack/react-query";
import { Clock, Medal, Trophy } from "lucide-react";
import type { CategoryName, PuzzleTime } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { formatTime } from "../lib/wordSearch";

interface LeaderboardPanelProps {
  categoryName: CategoryName;
}

export default function LeaderboardPanel({
  categoryName,
}: LeaderboardPanelProps) {
  const { actor, isFetching } = useActor();

  const { data: entries, isLoading } = useQuery<PuzzleTime[]>({
    queryKey: ["leaderboard", categoryName],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard(categoryName);
    },
    enabled: !!actor && !isFetching,
  });

  const sorted = [...(entries || [])]
    .sort((a, b) => Number(a.timeTaken) - Number(b.timeTaken))
    .slice(0, 10);

  const rankColors = [
    "oklch(0.75 0.2 55)", // gold
    "oklch(0.7 0.05 50)", // silver
    "oklch(0.6 0.12 40)", // bronze
  ];

  return (
    <div
      className="rounded border p-6"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.12 0.02 20), oklch(0.1 0.01 20))",
        borderColor: "oklch(0.52 0.22 22 / 0.3)",
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <Trophy className="w-5 h-5" style={{ color: "oklch(0.75 0.2 55)" }} />
        <h3
          className="font-horror text-xl"
          style={{ color: "oklch(0.85 0.02 50)" }}
        >
          {categoryName} — Top Times
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {["s1", "s2", "s3", "s4", "s5"].map((id) => (
            <div
              key={id}
              className="h-8 rounded animate-pulse"
              style={{ background: "oklch(0.15 0.01 20)" }}
            />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-8">
          <p
            className="font-serif-horror italic"
            style={{ color: "oklch(0.45 0.02 50)" }}
          >
            No survivors have completed this puzzle yet...
          </p>
          <p
            className="text-xs mt-2 font-mono-horror"
            style={{ color: "oklch(0.35 0.02 50)" }}
          >
            Be the first to escape.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((entry, i) => {
            const seconds = Number(entry.timeTaken) / 1_000_000_000;
            const principalStr = entry.sessionId.toString();
            const shortId = `${principalStr.slice(0, 5)}...${principalStr.slice(-3)}`;

            return (
              <div
                key={principalStr}
                className="flex items-center gap-3 px-3 py-2 rounded"
                style={{
                  background:
                    i < 3
                      ? `${rankColors[i].replace(")", " / 0.08)")}`
                      : "transparent",
                  border: `1px solid ${i < 3 ? rankColors[i].replace(")", " / 0.2)") : "transparent"}`,
                }}
              >
                {/* Rank */}
                <div className="w-6 text-center">
                  {i === 0 ? (
                    <Medal
                      className="w-4 h-4 mx-auto"
                      style={{ color: rankColors[0] }}
                    />
                  ) : i === 1 ? (
                    <Medal
                      className="w-4 h-4 mx-auto"
                      style={{ color: rankColors[1] }}
                    />
                  ) : i === 2 ? (
                    <Medal
                      className="w-4 h-4 mx-auto"
                      style={{ color: rankColors[2] }}
                    />
                  ) : (
                    <span
                      className="text-xs font-mono-horror"
                      style={{ color: "oklch(0.45 0.02 50)" }}
                    >
                      {i + 1}
                    </span>
                  )}
                </div>

                {/* Principal ID */}
                <span
                  className="flex-1 text-xs font-mono-horror truncate"
                  style={{ color: "oklch(0.55 0.02 50)" }}
                >
                  {shortId}
                </span>

                {/* Time */}
                <div className="flex items-center gap-1.5">
                  <Clock
                    className="w-3 h-3"
                    style={{ color: "oklch(0.62 0.2 145)" }}
                  />
                  <span
                    className="font-mono-horror text-sm font-semibold"
                    style={{
                      color: i < 3 ? rankColors[i] : "oklch(0.7 0.02 50)",
                    }}
                  >
                    {formatTime(Math.floor(seconds))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
