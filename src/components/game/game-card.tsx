"use client";

import Image from "next/image";
import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import type { Game } from "@/types";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/game/${game.slug}`} className="group block">
      <div className="glass relative aspect-[3/4] overflow-hidden rounded-2xl transition-transform duration-300 group-hover:scale-[1.03]">
        {game.cover_url ? (
          <Image
            src={game.cover_url}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Gamepad2 className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Text content */}
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
          <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight">
            {game.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {game.release_year && (
              <span className="text-xs text-white/60">{game.release_year}</span>
            )}
            {game.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/70"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
