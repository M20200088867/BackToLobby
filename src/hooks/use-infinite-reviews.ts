"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/types";

const PAGE_SIZE = 10;

export function useInfiniteRecentReviews() {
  const configured = isSupabaseConfigured();

  return useInfiniteQuery({
    queryKey: ["reviews", "recent", "infinite"],
    queryFn: async ({ pageParam = 0 }): Promise<Review[]> => {
      if (!configured) return [];

      try {
        const supabase = createClient();
        const from = pageParam * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await supabase
          .from("reviews")
          .select("*, user:users!reviews_user_id_fkey(id,username,avatar_url), game:games(id,igdb_id,title,cover_url,slug)")
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) {
          console.error(
            `Infinite reviews join failed [${error.code}]: ${error.message}. Details: ${error.details}. Hint: Ensure RLS policies allow SELECT on users and games tables.`
          );
          const { data: fallback, error: fbError } = await supabase
            .from("reviews")
            .select("*")
            .order("created_at", { ascending: false })
            .range(from, to);

          if (fbError) {
            console.error("Failed to fetch reviews:", fbError);
            return [];
          }
          return (fallback ?? []) as Review[];
        }

        return (data ?? []) as Review[];
      } catch (err) {
        console.error("Error fetching infinite reviews:", err);
        return [];
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
    enabled: configured,
  });
}
