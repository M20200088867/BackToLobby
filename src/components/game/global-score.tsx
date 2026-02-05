"use client";

import { Star } from "lucide-react";
import { useGameStats } from "@/hooks/use-game-stats";

interface GlobalScoreProps {
  gameIgdbId: number;
}

export function GlobalScore({ gameIgdbId }: GlobalScoreProps) {
  const { data: stats, isLoading } = useGameStats(gameIgdbId);

  // Show loading only during initial fetch, not background refetches
  if (isLoading && !stats) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 rounded-xl bg-white/10 animate-pulse" />
      </div>
    );
  }

  // No ratings yet (or no data)
  if (!stats || stats.averageRating === null) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Star className="h-5 w-5" />
        <span className="text-sm">No ratings yet</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/10">
        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
        <span className="text-lg font-bold">
          {stats.averageRating.toFixed(1)}
        </span>
      </div>
      <span className="text-sm text-muted-foreground">
        ({stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}
