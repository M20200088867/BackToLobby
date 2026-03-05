"use client";

import { useState } from "react";
import Image from "next/image";
import { Gamepad2, Loader2, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Game } from "@/types";

interface FavoriteGamePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game: Game;
  userId: string;
  onConfirmed: () => void;
}

export function FavoriteGamePrompt({
  open,
  onOpenChange,
  game,
  userId,
  onConfirmed,
}: FavoriteGamePromptProps) {
  const [saving, setSaving] = useState(false);

  async function handleSetFavorite() {
    setSaving(true);
    try {
      const supabase = createClient();
      // Resolve the game's DB id
      const { data: dbGame } = await supabase
        .from("games")
        .select("id")
        .eq("igdb_id", game.igdb_id)
        .single();

      if (!dbGame) return;

      await supabase
        .from("users")
        .update({ favorite_game_id: dbGame.id })
        .eq("id", userId);

      onConfirmed();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-white/10 rounded-3xl max-w-sm bg-background/80 backdrop-blur-2xl">
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="relative">
              {game.cover_url ? (
                <Image
                  src={game.cover_url}
                  alt={game.title}
                  width={72}
                  height={96}
                  className="rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-18 h-24 rounded-xl bg-white/10 flex items-center justify-center">
                  <Gamepad2 className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
              <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                <Star className="h-3.5 w-3.5 text-yellow-900 fill-yellow-900" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-base">Perfect score!</DialogTitle>
          <DialogDescription className="text-sm text-center">
            You gave <span className="font-medium text-foreground">{game.title}</span> a perfect
            score. Set it as your favorite game on your profile?
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 glass border-white/10 rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Not now
          </Button>
          <Button
            size="sm"
            className="flex-1 rounded-xl bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] hover:opacity-90"
            onClick={handleSetFavorite}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            Set as Favorite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
