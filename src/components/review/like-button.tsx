"use client";

import { Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth-context";
import { useReviewLikes } from "@/hooks/use-likes";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  reviewId: string;
}

export function LikeButton({ reviewId }: LikeButtonProps) {
  const { user, session } = useAuthContext();
  const { data } = useReviewLikes(reviewId, user?.id);
  const queryClient = useQueryClient();
  const router = useRouter();

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!isSupabaseConfigured() || !user) return;

      const supabase = createClient();

      if (data?.isLiked) {
        await supabase
          .from("likes")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("likes")
          .insert({ review_id: reviewId, user_id: user.id });
      }
    },
    onMutate: async () => {
      const queryKey = ["likes", reviewId, user?.id];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: { count: number; isLiked: boolean } | undefined) => {
        if (!old) return { count: 1, isLiked: true };
        return {
          count: old.isLiked ? old.count - 1 : old.count + 1,
          isLiked: !old.isLiked,
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["likes", reviewId, user?.id], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["likes", reviewId] });
    },
  });

  const count = data?.count ?? 0;
  const isLiked = data?.isLiked ?? false;

  function handleClick() {
    if (!session) {
      router.push("/login");
      return;
    }
    toggleLike.mutate();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex items-center gap-1.5 text-xs transition-colors",
        isLiked
          ? "text-red-400 hover:text-red-300"
          : "text-muted-foreground hover:text-foreground"
      )}
      aria-label={isLiked ? "Unlike review" : "Like review"}
    >
      <Heart
        className="h-4 w-4"
        fill={isLiked ? "currentColor" : "none"}
      />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
