"use client";

import Image from "next/image";
import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { StarRating } from "@/components/review/star-rating";
import { useUserReviews } from "@/hooks/use-user-reviews";
import { timeAgo } from "@/lib/utils";
import type { User } from "@/types";

interface UserReviewsListProps {
  userId: string;
  isOwner: boolean;
  favoriteGame?: User["favorite_game"];
}

function HeroCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 animate-pulse space-y-3">
      <div className="h-3 bg-white/10 rounded w-1/3" />
      <div className="flex gap-3">
        <div className="w-16 h-[85px] rounded-xl bg-white/10 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-white/10 rounded w-2/3" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
          <div className="h-3 bg-white/10 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 animate-pulse">
      <div className="w-10 h-[53px] rounded-lg bg-white/10 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="h-3 bg-white/10 rounded w-1/4" />
      </div>
    </div>
  );
}

export function UserReviewsList({ userId, isOwner, favoriteGame }: UserReviewsListProps) {
  const { data: reviews, isLoading } = useUserReviews(userId);

  const hasReviews = reviews && reviews.length > 0;
  const lastReview = reviews?.[0] ?? null;

  // Find user's rating for the favorite game
  const favReview = favoriteGame
    ? reviews?.find((r) => r.game?.id === favoriteGame.id)
    : null;

  return (
    <div className="space-y-6">
      {/* Hero section — only if has reviews OR is owner (to show fav game placeholder) */}
      {(isLoading || hasReviews || favoriteGame || isOwner) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Favorite Game card */}
          {isLoading ? (
            <HeroCardSkeleton />
          ) : favoriteGame ? (
            <div className="glass rounded-2xl p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Favorite Game
              </p>
              <Link href={`/game/${favoriteGame.slug}`} className="flex gap-3 group">
                {favoriteGame.cover_url ? (
                  <Image
                    src={favoriteGame.cover_url}
                    alt={favoriteGame.title}
                    width={64}
                    height={85}
                    className="rounded-xl object-cover shrink-0 group-hover:ring-2 group-hover:ring-primary/50 transition-all"
                  />
                ) : (
                  <div className="w-16 h-[85px] rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Gamepad2 className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-sm leading-tight group-hover:underline line-clamp-2">
                    {favoriteGame.title}
                  </p>
                  {favReview && (
                    <div className="mt-1.5">
                      <StarRating value={favReview.rating} size="sm" />
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ) : isOwner && hasReviews ? (
            <div className="glass rounded-2xl p-4 border border-dashed border-white/10 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Favorite Game
              </p>
              <p className="text-sm text-muted-foreground">
                Set your favorite game in{" "}
                <button
                  className="text-primary hover:underline font-medium"
                  onClick={() => {
                    // Scroll to the profile edit button and click it
                    const editBtn = document.querySelector<HTMLButtonElement>(
                      "[data-profile-edit]"
                    );
                    editBtn?.click();
                  }}
                >
                  Edit Profile
                </button>
                .
              </p>
            </div>
          ) : null}

          {/* Last Review card */}
          {isLoading ? (
            <HeroCardSkeleton />
          ) : lastReview ? (
            <div className="glass rounded-2xl p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Last Review
              </p>
              {lastReview.game ? (
                <Link href={`/game/${lastReview.game.slug}`} className="flex gap-3 group">
                  {lastReview.game.cover_url ? (
                    <Image
                      src={lastReview.game.cover_url}
                      alt={lastReview.game.title}
                      width={64}
                      height={85}
                      className="rounded-xl object-cover shrink-0 group-hover:ring-2 group-hover:ring-primary/50 transition-all"
                    />
                  ) : (
                    <div className="w-16 h-[85px] rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Gamepad2 className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm leading-tight group-hover:underline line-clamp-2">
                      {lastReview.game.title}
                    </p>
                    <div className="mt-1.5">
                      <StarRating value={lastReview.rating} size="sm" />
                    </div>
                    {lastReview.comment && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3 leading-relaxed">
                        {lastReview.comment}
                      </p>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="text-sm text-muted-foreground">Unknown game</div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* All Reviews list */}
      <div className="glass p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">Reviews</h2>

        {isLoading ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: 3 }).map((_, i) => (
              <ReviewSkeleton key={i} />
            ))}
          </div>
        ) : !hasReviews ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {reviews.map((review) => (
              <div key={review.id} className="flex items-start gap-4 py-3">
                {review.game ? (
                  <Link href={`/game/${review.game.slug}`} className="shrink-0">
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
                  <div className="w-10 h-[53px] rounded-lg bg-white/10 flex items-center justify-center shrink-0">
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
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <StarRating value={review.rating} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(review.created_at)}
                    </span>
                    {review.platform_played && (
                      <span className="text-xs bg-white/10 rounded-full px-2 py-0.5 text-muted-foreground">
                        {review.platform_played}
                      </span>
                    )}
                  </div>
                  {review.comment && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
