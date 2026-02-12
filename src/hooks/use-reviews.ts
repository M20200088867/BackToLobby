"use client";

import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/types";

export type ReviewSortOption = "newest" | "highest";

export function useGameReviews(
  gameIgdbId: number,
  sortBy: ReviewSortOption = "newest"
) {
  const configured = isSupabaseConfigured();

  return useQuery({
    queryKey: ["reviews", "game", gameIgdbId, sortBy],
    queryFn: async (): Promise<Review[]> => {
      if (!configured) return [];

      try {
        const supabase = createClient();

        // Resolve games.id from igdb_id
        const { data: game, error: gameError } = await supabase
          .from("games")
          .select("id")
          .eq("igdb_id", gameIgdbId)
          .single();

        // If game not in local cache, return empty (no reviews possible)
        if (gameError || !game) return [];

        // Try with user join, fall back to without
        const { data, error } = await supabase
          .from("reviews")
          .select("*, user:users(*)")
          .eq("game_id", game.id)
          .order(sortBy === "highest" ? "rating" : "created_at", {
            ascending: false,
          });

        if (error) {
          console.warn(
            "Game reviews with join failed, retrying without:",
            error.message
          );
          const { data: fallback, error: fbError } = await supabase
            .from("reviews")
            .select("*")
            .eq("game_id", game.id)
            .order(sortBy === "highest" ? "rating" : "created_at", {
              ascending: false,
            });

          if (fbError) {
            console.error("Failed to fetch game reviews:", fbError);
            return [];
          }
          return (fallback ?? []) as Review[];
        }

        return (data ?? []) as Review[];
      } catch (err) {
        console.error("Error fetching game reviews:", err);
        return [];
      }
    },
    staleTime: 30 * 1000,
    enabled: configured,
    placeholderData: [],
    retry: 1,
  });
}

export function useRecentReviews(limit = 10) {
  const configured = isSupabaseConfigured();

  return useQuery({
    queryKey: ["reviews", "recent"],
    queryFn: async (): Promise<Review[]> => {
      if (!configured) return [];

      try {
        const supabase = createClient();

        // Try with user+game join
        const { data, error } = await supabase
          .from("reviews")
          .select("*, user:users(*), game:games(*)")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) {
          console.warn(
            "Recent reviews with join failed, retrying without:",
            error.message
          );
          const { data: fallback, error: fbError } = await supabase
            .from("reviews")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit);

          if (fbError) {
            console.error("Failed to fetch recent reviews:", fbError);
            return [];
          }
          return (fallback ?? []) as Review[];
        }

        return (data ?? []) as Review[];
      } catch (err) {
        console.error("Error fetching recent reviews:", err);
        return [];
      }
    },
    staleTime: 60 * 1000,
    enabled: configured,
    placeholderData: [],
    retry: 1,
  });
}
