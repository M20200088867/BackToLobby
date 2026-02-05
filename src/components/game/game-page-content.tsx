"use client";

import { useState } from "react";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import { LogGameButton } from "@/components/review/log-game-button";
import { ReviewCard } from "@/components/review/review-card";
import { ReviewCardSkeleton } from "@/components/review/review-card-skeleton";
import { ReviewFilters } from "@/components/review/review-filters";
import { useGameReviews, type ReviewSortOption } from "@/hooks/use-reviews";
import { GlobalScore } from "@/components/game/global-score";
import { PriceCard } from "@/components/game/price-card";
import type { Game } from "@/types";

interface GamePageContentProps {
  game: Game;
  summary?: string;
}

export function GamePageContent({ game, summary }: GamePageContentProps) {
  const [reviewSort, setReviewSort] = useState<ReviewSortOption>("newest");
  const { data: reviews, isLoading } = useGameReviews(game.igdb_id, reviewSort);

  return (
    <div className="space-y-10">
      {/* Game Header */}
      <div className="glass p-6 md:p-8 rounded-3xl">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Cover */}
          <div className="relative w-48 aspect-[3/4] flex-shrink-0 rounded-2xl overflow-hidden mx-auto md:mx-0">
            {game.cover_url ? (
              <Image
                src={game.cover_url}
                alt={game.title}
                fill
                className="object-cover"
                sizes="192px"
                priority
              />
            ) : (
              <div className="w-full h-full bg-white/5 flex items-center justify-center">
                <Gamepad2 className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">{game.title}</h1>

            <GlobalScore gameIgdbId={game.igdb_id} />

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {game.developer && <span>{game.developer}</span>}
              {game.developer && game.release_year && (
                <span className="text-white/20">&bull;</span>
              )}
              {game.release_year && <span>{game.release_year}</span>}
            </div>

            {game.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {game.genres.map((genre) => (
                  <span
                    key={genre}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-muted-foreground"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {summary && (
              <p className="text-sm text-foreground/70 leading-relaxed">
                {summary}
              </p>
            )}

            <LogGameButton game={game} variant="standalone" />
          </div>
        </div>
      </div>

      {/* Content Grid: Reviews + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reviews Section */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Reviews</h2>
            <ReviewFilters value={reviewSort} onChange={setReviewSort} />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }, (_, i) => (
                <ReviewCardSkeleton key={i} />
              ))}
            </div>
          ) : !reviews || reviews.length === 0 ? (
            <div className="glass p-8 rounded-2xl text-center">
              <p className="text-muted-foreground">
                No reviews yet. Be the first to review this game!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          <PriceCard gameTitle={game.title} />
        </aside>
      </div>
    </div>
  );
}
