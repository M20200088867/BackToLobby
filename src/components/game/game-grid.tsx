import type { Game } from "@/types";
import { GameCard } from "./game-card";
import { GameCardSkeleton } from "./game-card-skeleton";

const columnClasses = {
  "2": "grid-cols-2",
  "3": "grid-cols-2 md:grid-cols-3",
  "4": "grid-cols-2 md:grid-cols-4",
  "6": "grid-cols-2 md:grid-cols-4 lg:grid-cols-6",
} as const;

interface GameGridProps {
  games?: Game[];
  isLoading?: boolean;
  skeletonCount?: number;
  columns?: keyof typeof columnClasses;
}

export function GameGrid({
  games,
  isLoading,
  skeletonCount = 6,
  columns = "6",
}: GameGridProps) {
  return (
    <div className={`grid ${columnClasses[columns]} gap-4`}>
      {isLoading
        ? Array.from({ length: skeletonCount }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))
        : games?.map((game) => (
            <GameCard key={game.igdb_id || game.id} game={game} />
          ))}
    </div>
  );
}
