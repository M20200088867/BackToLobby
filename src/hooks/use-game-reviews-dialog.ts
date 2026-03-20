"use client";

import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/types";

export function useGameReviewsForDialog(
  gameId: number | null,
  excludeReviewId: string | null
) {
  const configured = isSupabaseConfigured();

  return useQuery({
    queryKey: ["reviews", "game-dialog", gameId, excludeReviewId],
    queryFn: async (): Promise<Review[]> => {
      if (!configured || !gameId) return [];

      try {
        const supabase = createClient();

        let query = supabase
          .from("reviews")
          .select(
            "*, user:users!reviews_user_id_fkey(id,username,avatar_url)"
          )
          .eq("game_id", gameId)
          .order("created_at", { ascending: false })
          .limit(20);

        if (excludeReviewId) {
          query = query.neq("id", excludeReviewId);
        }

        const { data, error } = await query;

        if (error) {
          console.error(
            `Game reviews dialog join failed [${error.code}]: ${error.message}. Details: ${error.details}.`
          );
          // Fallback without user join
          let fallbackQuery = supabase
            .from("reviews")
            .select("*")
            .eq("game_id", gameId)
            .order("created_at", { ascending: false })
            .limit(20);

          if (excludeReviewId) {
            fallbackQuery = fallbackQuery.neq("id", excludeReviewId);
          }

          const { data: fallback, error: fbError } = await fallbackQuery;

          if (fbError) {
            console.error("Failed to fetch game reviews for dialog:", fbError);
            return [];
          }
          return (fallback ?? []) as Review[];
        }

        return (data ?? []) as Review[];
      } catch (err) {
        console.error("Error fetching game reviews for dialog:", err);
        return [];
      }
    },
    staleTime: 30 * 1000,
    enabled: !!gameId && configured,
    placeholderData: [],
    retry: 1,
  });
}
