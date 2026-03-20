"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { User as UserIcon, Gamepad2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StarRating } from "./star-rating";
import { LikeButton } from "./like-button";
import { useReviewDrawer } from "./review-drawer-context";
import { useGameReviewsForDialog } from "@/hooks/use-game-reviews-dialog";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { timeAgo } from "@/lib/utils";
import type { Review } from "@/types";

interface GameReviewsDialogProps {
  review: Review;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GameReviewsDialog({
  review,
  open,
  onOpenChange,
}: GameReviewsDialogProps) {
  const { openReviewDrawer } = useReviewDrawer();
  const { data: otherReviews, isLoading } = useGameReviewsForDialog(
    open ? review.game_id : null,
    review.id
  );

  const handleWriteReview = () => {
    if (!review.game) return;
    const game = review.game;
    onOpenChange(false);
    // Short delay to let dialog close before opening drawer
    setTimeout(() => openReviewDrawer(game), 150);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-white/10 rounded-3xl max-w-2xl max-h-[85vh] overflow-y-auto bg-background/80 backdrop-blur-2xl">
        {/* ── Primary review ── */}
        <DialogHeader className="pb-2">
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

        {/* Rating + Like */}
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} size="md" />
          <span className="text-sm text-muted-foreground">
            {review.rating}/5
          </span>
          <div className="ml-auto">
            <LikeButton reviewId={review.id} />
          </div>
        </div>

        {/* Full comment */}
        {review.comment && (
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">
            {review.comment}
          </p>
        )}

        {/* ── Other Reviews ── */}
        <div className="pt-4 border-t border-white/10">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">
            Other Reviews
          </h3>

          {isLoading && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && otherReviews && otherReviews.length > 0 && (
            <motion.div
              className="space-y-3"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {otherReviews.map((otherReview) => (
                <motion.div
                  key={otherReview.id}
                  variants={staggerItem}
                  className="flex gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/[0.08] transition-colors"
                >
                  {/* Avatar */}
                  {otherReview.user?.avatar_url ? (
                    <Link
                      href={`/user/${otherReview.user.username}`}
                      onClick={() => onOpenChange(false)}
                      className="shrink-0"
                    >
                      <Image
                        src={otherReview.user.avatar_url}
                        alt={otherReview.user.username}
                        width={32}
                        height={32}
                        className="rounded-full object-cover hover:ring-2 hover:ring-primary/50 transition-all"
                      />
                    </Link>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {otherReview.user ? (
                        <Link
                          href={`/user/${otherReview.user.username}`}
                          className="text-xs font-medium hover:underline truncate"
                          onClick={() => onOpenChange(false)}
                        >
                          {otherReview.user.username}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Unknown user
                        </span>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {timeAgo(otherReview.created_at)}
                      </span>
                    </div>
                    <div className="mt-0.5">
                      <StarRating value={otherReview.rating} size="sm" />
                    </div>
                    {otherReview.comment && (
                      <p className="text-xs text-foreground/70 line-clamp-3 mt-1">
                        {otherReview.comment}
                      </p>
                    )}
                    <div className="flex items-center justify-end mt-1">
                      <LikeButton reviewId={otherReview.id} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!isLoading && (!otherReviews || otherReviews.length === 0) && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-3">
                No other reviews yet — be the first to add yours
              </p>
              {review.game && (
                <Button
                  onClick={handleWriteReview}
                  className="bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white hover:opacity-90 rounded-xl"
                  size="sm"
                >
                  Write a review
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
