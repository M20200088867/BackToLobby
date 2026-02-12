"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Command } from "cmdk";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Gamepad2, Loader2, Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { transformIGDBGames } from "@/lib/igdb-transforms";
import type { IGDBGame } from "@/types/igdb";
import type { Game } from "@/types";

async function searchIGDB(query: string): Promise<Game[]> {
  const res = await fetch("/api/igdb", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "search", query }),
  });

  if (!res.ok) return [];

  const raw: IGDBGame[] = await res.json();
  return transformIGDBGames(raw);
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);

  const { data: games, isLoading } = useQuery({
    queryKey: ["palette-search", debouncedQuery],
    queryFn: () => searchIGDB(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 2 * 60 * 1000,
  });

  // Global keyboard shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSelect = useCallback(
    (slug: string) => {
      setOpen(false);
      setQuery("");
      router.push(`/game/${slug}`);
    },
    [router]
  );

  const handleViewAll = useCallback(() => {
    setOpen(false);
    const q = query.trim();
    setQuery("");
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }, [query, router]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="glass flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-xl"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search games...</span>
        <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] text-muted-foreground">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </button>

      {/* Dialog */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100]">
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setOpen(false);
                setQuery("");
              }}
            />

            {/* Palette */}
            <motion.div
              className="absolute inset-x-4 top-[15vh] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-full sm:max-w-lg"
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <Command
                shouldFilter={false}
                loop
                label="Search games"
                className="glass overflow-hidden rounded-2xl"
              >
                <div className="flex items-center gap-3 px-4 border-b border-white/10">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Command.Input
                    value={query}
                    onValueChange={setQuery}
                    placeholder="Search games..."
                    className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                    autoFocus
                  />
                  {isLoading && (
                    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
                  )}
                </div>

                <Command.List className="max-h-[300px] overflow-y-auto p-2">
                  {debouncedQuery.length >= 2 && !isLoading && (!games || games.length === 0) && (
                    <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                      No games found.
                    </Command.Empty>
                  )}

                  {games?.map((game) => (
                    <Command.Item
                      key={game.igdb_id || game.id}
                      value={game.slug}
                      onSelect={handleSelect}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer data-[selected=true]:bg-white/10 transition-colors"
                    >
                      <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-lg bg-white/5">
                        {game.cover_url ? (
                          <Image
                            src={game.cover_url}
                            alt={game.title}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Gamepad2 className="h-4 w-4 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {game.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {[game.release_year, ...game.genres.slice(0, 2)]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </Command.Item>
                  ))}

                  {games && games.length > 0 && (
                    <Command.Item
                      value="__view_all__"
                      onSelect={handleViewAll}
                      className="mt-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-xs text-muted-foreground data-[selected=true]:bg-white/10 transition-colors border-t border-white/5"
                    >
                      View all results
                    </Command.Item>
                  )}
                </Command.List>
              </Command>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
