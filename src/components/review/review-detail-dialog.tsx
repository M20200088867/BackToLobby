"use client";

import Image from "next/image";
import Link from "next/link";
import { User as UserIcon, Gamepad2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StarRating } from "./star-rating";
import { LikeButton } from "./like-button";
import { timeAgo } from "@/lib/utils";
import type { Review } from "@/types";

interface ReviewDetailDialogProps {
  review: Review;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewDetailDialog({
  review,
  open,
  onOpenChange,
}: ReviewDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-white/10 rounded-3xl max-w-lg max-h-[85vh] overflow-y-auto bg-background/80 backdrop-blur-2xl">
        <DialogHeader className="pb-2">
          {/* User info */}
          <div className="flex items-center gap-3">
            {review.user?.avatar_url ? (
              <Link
                href={`/user/${review.user.username}`}
                onClick={() => onOpenChange(false)}
              >
                <Image
                  src={review.user.avatar_url}
                  alt={review.user.username}
                  width={40}
                  height={40}
                  className="rounded-full object-cover hover:ring-2 hover:ring-primary/50 transition-all"
                />
              </Link>
            ) : (
              <Link
                href={review.user ? `/user/${review.user.username}` : "#"}
                onClick={() => onOpenChange(false)}
              >
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:ring-2 hover:ring-primary/50 transition-all">
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base">
                {review.user ? (
                  <Link
                    href={`/user/${review.user.username}`}
                    className="hover:underline"
                    onClick={() => onOpenChange(false)}
                  >
                    {review.user.username}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Unknown user</span>
                )}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <span>{timeAgo(review.created_at)}</span>
                {review.platform_played && (
                  <>
                    <span>&middot;</span>
                    <span>{review.platform_played}</span>
                  </>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Game info */}
        {review.game && (
          <Link
            href={`/game/${review.game.slug}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/[0.08] transition-colors"
            onClick={() => onOpenChange(false)}
          >
            {review.game.cover_url ? (
              <Image
                src={review.game.cover_url}
                alt={review.game.title}
                width={40}
                height={53}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-[53px] rounded-lg bg-white/10 flex items-center justify-center">
                <Gamepad2 className="h-5 w-5 text-muted-foreground/50" />
              </div>
            )}
            <span className="text-sm font-medium text-primary truncate">
              {review.game.title}
            </span>
          </Link>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} size="md" />
          <span className="text-sm text-muted-foreground">
            {review.rating}/5
          </span>
        </div>

        {/* Full comment */}
        {review.comment && (
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">
            {review.comment}
          </p>
        )}

        {/* Footer: like button */}
        <div className="flex items-center justify-end pt-2 border-t border-white/5">
          <LikeButton reviewId={review.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
