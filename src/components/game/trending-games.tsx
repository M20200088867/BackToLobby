"use client";

import { useQuery } from "@tanstack/react-query";
import { Gamepad2 } from "lucide-react";
import type { IGDBGame } from "@/types/igdb";
import { transformIGDBGames } from "@/lib/igdb-transforms";
import { GameCarousel } from "./game-carousel";
import { GameCardSkeleton } from "./game-card-skeleton";

async function fetchPopularGames() {
  const res = await fetch("/api/igdb", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "popular", limit: 20 }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (data.error === "not_configured") return null;
    throw new Error("Failed to fetch popular games");
  }

  const raw: IGDBGame[] = await res.json();
  return transformIGDBGames(raw);
}

export function TrendingGames() {
  const { data: games, isLoading } = useQuery({
    queryKey: ["igdb-popular"],
    queryFn: fetchPopularGames,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Not configured — show placeholder cards
  if (!isLoading && games === null) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="glass aspect-[3/4] w-40 md:w-44 lg:w-48 shrink-0 rounded-2xl flex items-center justify-center"
          >
            <Gamepad2 className="h-8 w-8 text-muted-foreground/50" />
          </div>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-40 md:w-44 lg:w-48 shrink-0">
            <GameCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (!games || games.length === 0) return null;

  return <GameCarousel games={games} />;
}
