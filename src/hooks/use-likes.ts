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

      const countPromise = supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("review_id", reviewId);

      const isLikedPromise = userId
        ? supabase
            .from("likes")
            .select("user_id")
            .eq("review_id", reviewId)
            .eq("user_id", userId)
            .maybeSingle()
        : Promise.resolve({ data: null });

      const [countResult, isLikedResult] = await Promise.all([
        countPromise,
        isLikedPromise,
      ]);

      if (countResult.error) throw countResult.error;

      return {
        count: countResult.count ?? 0,
        isLiked: !!isLikedResult.data,
      };
    },
    staleTime: 30 * 1000,
  });
}
