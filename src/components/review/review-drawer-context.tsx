"use client";

import { createContext, useContext, useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/client";
import { ReviewDrawer } from "./review-drawer";
import type { Game, Review } from "@/types";

interface ReviewDrawerContextValue {
  openReviewDrawer: (game: Game) => void;
  closeReviewDrawer: () => void;
}

const ReviewDrawerContext = createContext<ReviewDrawerContextValue | null>(null);

export function ReviewDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const { user, session, isLoading: isAuthLoading } = useAuthContext();
  const router = useRouter();

  // Use refs to always access the latest auth state
  const authRef = useRef({ user, session, isLoading: isAuthLoading });

  // Update refs on every render
  useEffect(() => {
    authRef.current = { user, session, isLoading: isAuthLoading };
  }, [user, session, isAuthLoading]);

  const openReviewDrawer = useCallback(
    async (targetGame: Game) => {
      // Read latest auth state from ref
      const { isLoading } = authRef.current;

      // If auth is still loading, wait for it to resolve (max 3 seconds)
      if (isLoading) {
        let waited = 0;
        const waitInterval = 100;
        const maxWait = 3000;

        while (waited < maxWait && authRef.current.isLoading) {
          await new Promise((resolve) => setTimeout(resolve, waitInterval));
          waited += waitInterval;
        }
      }

      // Re-read after potential wait
      const finalAuth = authRef.current;

      // If still loading after max wait, or no session, redirect to login
      if (finalAuth.isLoading || !finalAuth.session) {
        router.push("/login");
        return;
      }

      setGame(targetGame);
      setExistingReview(null);
      setIsOpen(true);

      // Try to fetch existing review
      if (isSupabaseConfigured() && finalAuth.user) {
        setIsLoadingReview(true);
        try {
          const supabase = createClient();
          // Resolve game's Supabase ID from igdb_id
          const { data: dbGame } = await supabase
            .from("games")
            .select("id")
            .eq("igdb_id", targetGame.igdb_id)
            .single();

          if (dbGame) {
            const { data: review } = await supabase
              .from("reviews")
              .select("*")
              .eq("user_id", finalAuth.user.id)
              .eq("game_id", dbGame.id)
              .single();

            if (review) {
              setExistingReview(review as Review);
            }
          }
        } catch {
          // No existing review found — that's fine
        } finally {
          setIsLoadingReview(false);
        }
      }
    },
    [router]
  );

  const closeReviewDrawer = useCallback(() => {
    setIsOpen(false);
    setGame(null);
    setExistingReview(null);
  }, []);

  // Clean up body pointer-events when dialog closes.
  // Radix UI Dialog sets pointer-events: none on body and may not clean it up
  // if close animation doesn't complete cleanly (e.g. due to re-renders from
  // query invalidation). We use a MutationObserver as the primary fix and a
  // belt-and-suspenders direct clear in the onOpenChange handler.
  useEffect(() => {
    if (isOpen) return;

    // Immediate clear when dialog closes
    document.body.style.pointerEvents = "";

    // Watch for Radix re-applying pointer-events: none after we cleared it
    const observer = new MutationObserver(() => {
      if (document.body.style.pointerEvents === "none") {
        document.body.style.pointerEvents = "";
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });

    // Stop observing after animations complete (500ms is generous)
    const timer = setTimeout(() => observer.disconnect(), 500);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [isOpen]);

  const contextValue = useMemo(
    () => ({ openReviewDrawer, closeReviewDrawer }),
    [openReviewDrawer, closeReviewDrawer]
  );

  return (
    <ReviewDrawerContext.Provider value={contextValue}>
      {children}
      <ReviewDrawer
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            document.body.style.pointerEvents = "";
            closeReviewDrawer();
          }
        }}
        game={game}
        existingReview={existingReview}
        isLoadingReview={isLoadingReview}
      />
    </ReviewDrawerContext.Provider>
  );
}

export function useReviewDrawer() {
  const ctx = useContext(ReviewDrawerContext);
  if (!ctx) {
    throw new Error("useReviewDrawer must be used within a ReviewDrawerProvider");
  }
  return ctx;
}
