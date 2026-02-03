"use client";

import { useQuery } from "@tanstack/react-query";
import { Gamepad2 } from "lucide-react";
import type { IGDBGame } from "@/types/igdb";
import { transformIGDBGames } from "@/lib/igdb-transforms";
import { GameGrid } from "./game-grid";

async function fetchPopularGames() {
  const res = await fetch("/api/igdb", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "popular", limit: 12 }),
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="glass aspect-[3/4] rounded-2xl flex items-center justify-center"
          >
            <Gamepad2 className="h-8 w-8 text-muted-foreground/50" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <GameGrid
      games={games ?? undefined}
      isLoading={isLoading}
      skeletonCount={6}
      columns="6"
    />
  );
}
