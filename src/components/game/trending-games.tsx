"use client";

import { useQuery } from "@tanstack/react-query";
import type { IGDBGame } from "@/types/igdb";
import { transformIGDBGames } from "@/lib/igdb-transforms";
import { GameGrid } from "./game-grid";

async function fetchPopularGames() {
  const res = await fetch("/api/igdb", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "popular", limit: 12 }),
  });

  if (!res.ok) throw new Error("Failed to fetch popular games");

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

  return <GameGrid games={games} isLoading={isLoading} skeletonCount={6} columns="6" />;
}
