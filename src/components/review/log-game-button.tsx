"use client";

import { Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReviewDrawer } from "./review-drawer-context";
import { isGameUnreleased } from "@/lib/utils";
import type { Game } from "@/types";

interface LogGameButtonProps {
  game: Game;
  variant?: "card-overlay" | "standalone";
}

export function LogGameButton({ game, variant = "standalone" }: LogGameButtonProps) {
  const { openReviewDrawer } = useReviewDrawer();
  const unreleased = isGameUnreleased(game);

  if (variant === "card-overlay") {
    if (unreleased) return null;

    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openReviewDrawer(game);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors"
        aria-label={`Log ${game.title}`}
      >
        <Plus className="h-4 w-4" />
      </button>
    );
  }

  if (unreleased) {
    return (
      <Button
        disabled
        className="rounded-xl opacity-60 cursor-not-allowed"
      >
        <Clock className="h-4 w-4 mr-2" />
        Not Yet Released
      </Button>
    );
  }

  return (
    <Button
      onClick={() => openReviewDrawer(game)}
      className="rounded-xl bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] hover:opacity-90"
    >
      <Plus className="h-4 w-4 mr-2" />
      Log Game
    </Button>
  );
}
