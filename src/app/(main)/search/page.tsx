"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, AlertCircle, Info } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { transformIGDBGames } from "@/lib/igdb-transforms";
import { GameGrid } from "@/components/game";
import type { IGDBGame } from "@/types/igdb";

class NotConfiguredError extends Error {
  constructor() {
    super("IGDB not configured");
    this.name = "NotConfiguredError";
  }
}

async function searchIGDB(query: string) {
  const res = await fetch("/api/igdb", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "search", query }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (data.error === "not_configured") throw new NotConfiguredError();
    throw new Error("Search request failed");
  }

  const raw: IGDBGame[] = await res.json();
  return transformIGDBGames(raw);
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const {
    data: games,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["igdb-search", debouncedQuery],
    queryFn: () => searchIGDB(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    retry: (failureCount, err) => {
      if (err instanceof NotConfiguredError) return false;
      return failureCount < 2;
    },
  });

  const showResults = debouncedQuery.length >= 2;
  const isNotConfigured = error instanceof NotConfiguredError;
  const isError = !!error && !isNotConfigured;

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
      {!showResults && !isNotConfigured && (
        <p className="text-muted-foreground text-center py-12">
          Type at least 2 characters to search IGDB.
        </p>
      )}

      {isNotConfigured && (
        <div className="glass p-6 rounded-2xl flex items-center gap-3">
          <Info className="h-5 w-5 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            IGDB API credentials are not configured. Add{" "}
            <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">
              IGDB_CLIENT_ID
            </code>{" "}
            and{" "}
            <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">
              IGDB_CLIENT_SECRET
            </code>{" "}
            to your <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">.env.local</code> to
            enable search.
          </p>
        </div>
      )}

      {isError && showResults && (
        <div className="glass p-6 rounded-2xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive">
            Search failed. Please try again.
          </p>
        </div>
      )}

      {showResults && !isError && !isNotConfigured && (
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
