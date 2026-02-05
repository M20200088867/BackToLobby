"use client";

import { useRecentReviews } from "@/hooks/use-reviews";
import { ReviewCard } from "./review-card";
import { ReviewCardSkeleton } from "./review-card-skeleton";

export function RecentReviews() {
  const { data: reviews, isLoading } = useRecentReviews();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }, (_, i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="glass p-8 rounded-2xl text-center">
        <p className="text-muted-foreground">
          No reviews yet. Be the first to log a game!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} showGame />
      ))}
    </div>
  );
}
