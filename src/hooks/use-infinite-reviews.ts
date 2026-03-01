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
    queryFn: async ({ pageParam = 0, signal }): Promise<Review[]> => {
      if (!configured) return [];

      try {
        const supabase = createClient();
        const from = (pageParam as number) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        // Combine TanStack's cancellation signal with an 8s timeout.
        // Prevents the request from hanging forever on Supabase cold starts.
        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => timeoutController.abort(), 8000);
        const effectiveSignal =
          typeof AbortSignal.any === "function"
            ? AbortSignal.any([signal, timeoutController.signal])
            : timeoutController.signal;

        try {
          const { data, error } = await supabase
            .from("reviews")
            .select("*, user:users!reviews_user_id_fkey(id,username,avatar_url), game:games(id,igdb_id,title,cover_url,slug)")
            .order("created_at", { ascending: false })
            .range(from, to)
            .abortSignal(effectiveSignal);

          if (error) {
            // Silently ignore AbortErrors — the query was cancelled by
            // navigation or component unmount, not a real failure.
            if (effectiveSignal.aborted) return [];

            console.error(
              `Infinite reviews join failed [${error.code}]: ${error.message}. Details: ${error.details}. Hint: Ensure RLS policies allow SELECT on users and games tables.`
            );
            const { data: fallback, error: fbError } = await supabase
              .from("reviews")
              .select("*")
              .order("created_at", { ascending: false })
              .range(from, to)
              .abortSignal(effectiveSignal);

            if (fbError) {
              console.error("Failed to fetch reviews:", fbError);
              return [];
            }
            return (fallback ?? []) as Review[];
          }

          return (data ?? []) as Review[];
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return [];
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
    staleTime: 0,
    retry: 1,
    refetchInterval: 20_000,
  });
}
