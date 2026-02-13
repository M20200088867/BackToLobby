"use client";

import Image from "next/image";
import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { StarRating } from "@/components/review/star-rating";
import { useUserReviews } from "@/hooks/use-user-reviews";
import { timeAgo } from "@/lib/utils";

interface UserReviewsListProps {
  userId: string;
}

function ReviewSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 animate-pulse">
      <div className="w-10 h-[53px] rounded-lg bg-white/10" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="h-3 bg-white/10 rounded w-1/4" />
      </div>
    </div>
  );
}

export function UserReviewsList({ userId }: UserReviewsListProps) {
  const { data: reviews, isLoading } = useUserReviews(userId);

  return (
    <div className="glass p-6 rounded-2xl">
      <h2 className="text-lg font-semibold mb-4">Reviews</h2>

      {isLoading ? (
        <div className="divide-y divide-white/5">
          {Array.from({ length: 3 }).map((_, i) => (
            <ReviewSkeleton key={i} />
          ))}
        </div>
      ) : !reviews || reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="divide-y divide-white/5">
          {reviews.map((review) => (
            <div key={review.id} className="flex items-center gap-4 py-3">
              {review.game ? (
                <Link href={`/game/${review.game.slug}`}>
                  {review.game.cover_url ? (
                    <Image
                      src={review.game.cover_url}
                      alt={review.game.title}
                      width={40}
                      height={53}
                      className="rounded-lg object-cover hover:ring-2 hover:ring-primary/50 transition-all"
                    />
                  ) : (
                    <div className="w-10 h-[53px] rounded-lg bg-white/10 flex items-center justify-center">
                      <Gamepad2 className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                  )}
                </Link>
              ) : (
                <div className="w-10 h-[53px] rounded-lg bg-white/10 flex items-center justify-center">
                  <Gamepad2 className="h-5 w-5 text-muted-foreground/50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {review.game ? (
                  <Link
                    href={`/game/${review.game.slug}`}
                    className="text-sm font-medium hover:underline truncate block"
                  >
                    {review.game.title}
                  </Link>
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">
                    Unknown game
                  </span>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRating value={review.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(review.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
