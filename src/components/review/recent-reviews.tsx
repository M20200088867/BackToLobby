"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { useRecentReviews } from "@/hooks/use-reviews";
import {
  ReviewCarouselCard,
  ReviewCarouselCardSkeleton,
} from "./review-carousel-card";
import { GameReviewsDialog } from "./game-reviews-dialog";
import type { Review } from "@/types";

export function RecentReviews() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const { data: reviews, isLoading } = useRecentReviews(10);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    el.addEventListener("scroll", updateScrollState, { passive: true });

    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, reviews]);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth =
      el.querySelector<HTMLElement>(":scope > div > div")?.offsetWidth ?? 320;
    const distance = cardWidth * 2;
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <ReviewCarouselCardSkeleton key={i} />
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
    <div>
      <div className="group/carousel relative">
        <motion.div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-snap-x"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {reviews.map((review) => (
            <motion.div key={review.id} variants={staggerItem}>
              <ReviewCarouselCard
                review={review}
                onClick={() => setSelectedReview(review)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Left fade */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-20 z-[5] pointer-events-none bg-gradient-to-r from-[var(--background)] to-transparent transition-opacity duration-300 ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Right fade */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-20 z-[5] pointer-events-none bg-gradient-to-l from-[var(--background)] to-transparent transition-opacity duration-300 ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Prev button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 h-10 w-10 rounded-full glass flex items-center justify-center text-foreground opacity-0 group-hover/carousel:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Next button */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 h-10 w-10 rounded-full glass flex items-center justify-center text-foreground opacity-0 group-hover/carousel:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Game Reviews Dialog */}
      {selectedReview && (
        <GameReviewsDialog
          review={selectedReview}
          open={!!selectedReview}
          onOpenChange={(open) => {
            if (!open) setSelectedReview(null);
          }}
        />
      )}
    </div>
  );
}
