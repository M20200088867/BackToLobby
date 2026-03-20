"use client";

import Image from "next/image";
import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { StarRating } from "./star-rating";
import { LikeButton } from "./like-button";
import { timeAgo } from "@/lib/utils";
import type { Review } from "@/types";

interface ReviewCarouselCardProps {
  review: Review;
  onClick: () => void;
}

export function ReviewCarouselCard({
  review,
  onClick,
}: ReviewCarouselCardProps) {
  return (
    <div
      className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-start glass p-4 cursor-pointer hover:bg-white/[0.08] transition-colors"
      onClick={onClick}
    >
      <div className="flex gap-3 h-full">
        {/* Cover image */}
        {review.game?.cover_url ? (
          <Link
            href={`/game/${review.game.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0"
          >
            <Image
              src={review.game.cover_url}
              alt={review.game.title}
              width={80}
              height={106}
              className="rounded-xl object-cover w-[80px] h-[106px]"
            />
          </Link>
        ) : (
          <div className="w-[80px] h-[106px] rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Gamepad2 className="h-6 w-6 text-muted-foreground/50" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Top: username + time */}
          <div>
            <div className="flex items-center justify-between gap-2">
              {review.user ? (
                <Link
                  href={`/user/${review.user.username}`}
                  className="text-xs font-medium hover:underline truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  @{review.user.username}
                </Link>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Unknown user
                </span>
              )}
              <span className="text-[11px] text-muted-foreground shrink-0">
                {timeAgo(review.created_at)}
              </span>
            </div>

            {/* Game title */}
            {review.game && (
              <Link
                href={`/game/${review.game.slug}`}
                className="text-sm font-semibold text-foreground hover:text-primary truncate block mt-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                {review.game.title}
              </Link>
            )}

            {/* Rating */}
            <div className="mt-1">
              <StarRating value={review.rating} size="sm" />
            </div>

            {/* Comment */}
            {review.comment && (
              <p className="text-xs text-foreground/70 line-clamp-2 mt-1">
                {review.comment}
              </p>
            )}
          </div>

          {/* Bottom: platform + like */}
          <div
            className="flex items-center justify-between mt-2"
            onClick={(e) => e.stopPropagation()}
          >
            {review.platform_played ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-muted-foreground">
                {review.platform_played}
              </span>
            ) : (
              <span />
            )}
            <LikeButton reviewId={review.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReviewCarouselCardSkeleton() {
  return (
    <div className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-start glass p-4">
      <div className="flex gap-3 animate-pulse">
        <div className="w-[80px] h-[106px] rounded-xl bg-white/10 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 rounded bg-white/10" />
            <div className="h-3 w-12 rounded bg-white/10" />
          </div>
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="h-3 w-24 rounded bg-white/10" />
          <div className="h-3 w-full rounded bg-white/10" />
          <div className="h-3 w-3/4 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}
