"use client";

import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/client";

interface LikeData {
  count: number;
  isLiked: boolean;
}

export function useReviewLikes(reviewId: string, userId?: string) {
  return useQuery({
    queryKey: ["likes", reviewId, userId],
    queryFn: async (): Promise<LikeData> => {
      if (!isSupabaseConfigured()) {
        return { count: 0, isLiked: false };
      }

      const supabase = createClient();

      const { count, error } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("review_id", reviewId);

      if (error) throw error;

      let isLiked = false;
      if (userId) {
        const { data } = await supabase
          .from("likes")
          .select("user_id")
          .eq("review_id", reviewId)
          .eq("user_id", userId)
          .single();

        isLiked = !!data;
      }

      return { count: count ?? 0, isLiked };
    },
    staleTime: 30 * 1000,
  });
}
