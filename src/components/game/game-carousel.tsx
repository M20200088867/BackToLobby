"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { Game } from "@/types";
import { GameCard } from "./game-card";

interface GameCarouselProps {
  games: Game[];
}

export function GameCarousel({ games }: GameCarouselProps) {
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
  }, [updateScrollState, games]);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(":scope > div > div")?.offsetWidth ?? 200;
    const distance = cardWidth * 3;
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="group/carousel relative">
      <motion.div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-snap-x"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {games.map((game) => (
          <motion.div
            key={game.igdb_id || game.id}
            className="w-40 md:w-44 lg:w-48 shrink-0 snap-start"
            variants={staggerItem}
          >
            <GameCard game={game} />
          </motion.div>
        ))}
      </motion.div>

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
  );
}
