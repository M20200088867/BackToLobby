"use client";

import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/types";

export function useUserReviews(userId: string) {
  const configured = isSupabaseConfigured();

  return useQuery({
    queryKey: ["reviews", "user", userId],
    queryFn: async (): Promise<Review[]> => {
      if (!configured) return [];

      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("reviews")
          .select("*, game:games(id,igdb_id,title,cover_url,slug)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error(
            `User reviews join failed [${error.code}]: ${error.message}. Details: ${error.details}. Hint: Ensure RLS policies allow SELECT on games table.`
          );
          const { data: fallback, error: fbError } = await supabase
            .from("reviews")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (fbError) {
            console.error("Failed to fetch user reviews:", fbError);
            return [];
          }
          return (fallback ?? []) as Review[];
        }

        return (data ?? []) as Review[];
      } catch (err) {
        console.error("Error fetching user reviews:", err);
        return [];
      }
    },
    staleTime: 30 * 1000,
    enabled: configured && !!userId,
    placeholderData: [],
    retry: 1,
  });
}
