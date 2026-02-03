"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, AlertCircle } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { transformIGDBGames } from "@/lib/igdb-transforms";
import { GameGrid } from "@/components/game";
import type { IGDBGame } from "@/types/igdb";

async function searchIGDB(query: string) {
  const res = await fetch("/api/igdb", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "search", query }),
  });

  if (!res.ok) throw new Error("Search request failed");

  const raw: IGDBGame[] = await res.json();
  return transformIGDBGames(raw);
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const {
    data: games,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["igdb-search", debouncedQuery],
    queryFn: () => searchIGDB(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const showResults = debouncedQuery.length >= 2;

  return (
    <div className="space-y-8">
      {/* Search input */}
      <div className="glass p-4 rounded-2xl flex items-center gap-3">
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for games..."
          className="bg-transparent w-full text-lg outline-none placeholder:text-muted-foreground/50"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* States */}
      {!showResults && (
        <p className="text-muted-foreground text-center py-12">
          Type at least 2 characters to search IGDB.
        </p>
      )}

      {isError && showResults && (
        <div className="glass p-6 rounded-2xl flex items-center gap-3 border-destructive/30">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive">
            Search failed. Check that IGDB credentials are configured and try
            again.
          </p>
        </div>
      )}

      {showResults && !isError && (
        <>
          {!isLoading && games && games.length === 0 && (
            <p className="text-muted-foreground text-center py-12">
              No games found for &ldquo;{debouncedQuery}&rdquo;.
            </p>
          )}
          <GameGrid
            games={games}
            isLoading={isLoading}
            skeletonCount={8}
            columns="4"
          />
        </>
      )}
    </div>
  );
}
