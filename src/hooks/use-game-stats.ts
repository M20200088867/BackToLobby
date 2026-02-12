"use client";

import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/client";

export interface GameStats {
  averageRating: number | null;
  totalReviews: number;
}

const DEFAULT_STATS: GameStats = { averageRating: null, totalReviews: 0 };

export function useGameStats(gameIgdbId: number) {
  const configured = isSupabaseConfigured();

  return useQuery({
    queryKey: ["game-stats", gameIgdbId],
    queryFn: async (): Promise<GameStats> => {
      if (!configured) {
        return DEFAULT_STATS;
      }

      try {
        const supabase = createClient();

        // Get game internal ID from igdb_id
        const { data: game, error: gameError } = await supabase
          .from("games")
          .select("id")
          .eq("igdb_id", gameIgdbId)
          .single();

        // If game doesn't exist in local DB (not cached), return default stats
        if (gameError || !game) {
          return DEFAULT_STATS;
        }

        // Get reviews and calculate average
        const { data: reviews, error: reviewsError } = await supabase
          .from("reviews")
          .select("rating")
          .eq("game_id", game.id);

        if (reviewsError || !reviews || reviews.length === 0) {
          return DEFAULT_STATS;
        }

        const sum = reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0);
        const averageRating = sum / reviews.length;

        return {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: reviews.length,
        };
      } catch (err) {
        console.error("Failed to fetch game stats:", err);
        return DEFAULT_STATS;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    // If Supabase isn't configured, don't keep retrying
    enabled: configured,
    // Return default immediately if disabled
    placeholderData: DEFAULT_STATS,
    // Reduce retries for faster feedback
    retry: 1,
  });
}
