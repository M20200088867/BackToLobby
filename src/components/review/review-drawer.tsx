"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Gamepad2, Loader2, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StarRating } from "./star-rating";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/client";
import { useAuthContext } from "@/lib/auth-context";
import type { Game, Review, Platform } from "@/types";

const PLATFORMS: Platform[] = [
  "PC",
  "PS4",
  "PS5",
  "Xbox One",
  "Xbox Series",
  "Switch",
  "Steam Deck",
];

interface ReviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game: Game | null;
  existingReview: Review | null;
  isLoadingReview: boolean;
}

export function ReviewDrawer({
  open,
  onOpenChange,
  game,
  existingReview,
  isLoadingReview,
}: ReviewDrawerProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [platform, setPlatform] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const isEditMode = !!existingReview;

  // Sync form state with existing review
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment ?? "");
      setPlatform(existingReview.platform_played ?? "");
    } else {
      setRating(0);
      setComment("");
      setPlatform("");
    }
    setError(null);
  }, [existingReview, open]);

  async function resolveGameId(supabase: ReturnType<typeof createClient>, g: Game): Promise<number> {
    // Try to find existing game by igdb_id
    const { data: existing } = await supabase
      .from("games")
      .select("id")
      .eq("igdb_id", g.igdb_id)
      .single();

    if (existing) return existing.id;

    // Upsert the game
    const { data: inserted, error: insertError } = await supabase
      .from("games")
      .upsert(
        {
          igdb_id: g.igdb_id,
          title: g.title,
          cover_url: g.cover_url,
          slug: g.slug,
          genres: g.genres,
          developer: g.developer,
          release_year: g.release_year,
        },
        { onConflict: "igdb_id" }
      )
      .select("id")
      .single();

    if (insertError || !inserted) {
      throw new Error(insertError?.message ?? "Failed to save game");
    }

    return inserted.id;
  }

  async function handleSubmit() {
    if (!game || !user || rating === 0) return;
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const gameId = await resolveGameId(supabase, game);

      if (isEditMode && existingReview) {
        const { error: updateError } = await supabase
          .from("reviews")
          .update({
            rating,
            comment: comment || null,
            platform_played: platform || null,
          })
          .eq("id", existingReview.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("reviews").insert({
          user_id: user.id,
          game_id: gameId,
          rating,
          comment: comment || null,
          platform_played: platform || null,
        });

        if (insertError) throw insertError;
      }

      // Invalidate relevant caches
      await queryClient.invalidateQueries({ queryKey: ["reviews"] });

      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save review");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!existingReview || !isSupabaseConfigured()) return;

    setIsDeleting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("reviews")
        .delete()
        .eq("id", existingReview.id);

      if (deleteError) throw deleteError;

      await queryClient.invalidateQueries({ queryKey: ["reviews"] });

      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete review");
    } finally {
      setIsDeleting(false);
    }
  }

  if (!game) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="glass border-white/10 rounded-3xl max-w-lg max-h-[85vh] overflow-y-auto bg-background/80 backdrop-blur-2xl"
      >
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-4">
            {game.cover_url ? (
              <Image
                src={game.cover_url}
                alt={game.title}
                width={48}
                height={64}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-16 rounded-lg bg-white/10 flex items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-muted-foreground/50" />
              </div>
            )}
            <div>
              <DialogTitle className="text-lg">{game.title}</DialogTitle>
              <DialogDescription>
                {isEditMode ? "Edit your review" : "Log this game"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoadingReview ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Rating
              </label>
              <div className="flex items-center gap-3">
                <StarRating value={rating} onChange={setRating} size="lg" />
                {rating > 0 && (
                  <span className="text-sm text-muted-foreground">{rating}/5</span>
                )}
              </div>
            </div>

            {/* Platform */}
            <div className="space-y-2">
              <label
                htmlFor="platform-select"
                className="text-sm font-medium text-muted-foreground"
              >
                Platform
              </label>
              <select
                id="platform-select"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ colorScheme: "dark" }}
              >
                <option value="">Select platform...</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label
                htmlFor="review-comment"
                className="text-sm font-medium text-muted-foreground"
              >
                Review
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think?"
                rows={4}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSubmit}
                disabled={rating === 0 || isSaving}
                className="flex-1 rounded-xl bg-gradient-to-r from-[var(--gradient-purple)] to-[var(--gradient-blue)] hover:opacity-90"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isEditMode ? "Update" : "Save"}
              </Button>
              {isEditMode && (
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
