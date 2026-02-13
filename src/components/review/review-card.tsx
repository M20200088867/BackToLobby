"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User as UserIcon } from "lucide-react";
import { StarRating } from "./star-rating";
import { LikeButton } from "./like-button";
import { ReviewDetailDialog } from "./review-detail-dialog";
import { timeAgo } from "@/lib/utils";
import type { Review } from "@/types";

interface ReviewCardProps {
  review: Review;
  showGame?: boolean;
}

export function ReviewCard({ review, showGame = false }: ReviewCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <div
        className="glass p-5 rounded-2xl space-y-3 cursor-pointer hover:bg-white/[0.08] transition-colors"
        onClick={() => setDetailOpen(true)}
      >
        {/* Header: user + game info */}
        <div className="flex items-center gap-3">
          {review.user ? (
            <Link
              href={`/user/${review.user.username}`}
              onClick={(e) => e.stopPropagation()}
            >
              {review.user.avatar_url ? (
                <Image
                  src={review.user.avatar_url}
                  alt={review.user.username}
                  width={36}
                  height={36}
                  className="rounded-full object-cover hover:ring-2 hover:ring-primary/50 transition-all"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:ring-2 hover:ring-primary/50 transition-all">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </Link>
          ) : (
            <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {review.user ? (
                <Link
                  href={`/user/${review.user.username}`}
                  className="text-sm font-medium hover:underline truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {review.user.username}
                </Link>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  Unknown user
                </span>
              )}
              {showGame && review.game && (
                <>
                  <span className="text-muted-foreground/50 text-xs">reviewed</span>
                  <Link
                    href={`/game/${review.game.slug}`}
                    className="text-sm font-medium text-primary hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {review.game.title}
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StarRating value={review.rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                {timeAgo(review.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Comment */}
        {review.comment && (
          <p className="text-sm text-foreground/80 line-clamp-4">
            {review.comment}
          </p>
        )}

        {/* Footer: platform + like */}
        <div
          className="flex items-center justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {review.platform_played ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">
              {review.platform_played}
            </span>
          ) : (
            <span />
          )}
          <LikeButton reviewId={review.id} />
        </div>
      </div>

      <ReviewDetailDialog
        review={review}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
