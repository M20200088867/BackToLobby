"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { useInfiniteRecentReviews } from "@/hooks/use-infinite-reviews";
import { ReviewCard } from "./review-card";
import { ReviewCardSkeleton } from "./review-card-skeleton";

export function RecentReviews() {
  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteRecentReviews();

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }, (_, i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const reviews = data?.pages.flat() ?? [];

  if (reviews.length === 0) {
    return (
      <div className="glass p-8 rounded-2xl text-center">
        <p className="text-muted-foreground">
          No reviews yet. Be the first to log a game!
        </p>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {reviews.map((review) => (
          <motion.div key={review.id} variants={staggerItem}>
            <ReviewCard review={review} showGame />
          </motion.div>
        ))}
      </motion.div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!hasNextPage && reviews.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          You&apos;ve reached the end of the feed.
        </p>
      )}
    </div>
  );
}
