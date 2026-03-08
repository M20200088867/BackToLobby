import { NextRequest, NextResponse } from "next/server";
import {
  searchGames,
  getPopularGames,
  getNewReleases,
  igdbFetchByIds,
  isIGDBConfigured,
} from "@/lib/igdb";
import { cacheGames } from "@/lib/supabase/game-cache";
import { createClient } from "@/lib/supabase/server";
import type { IGDBGame } from "@/types/igdb";

interface IGDBRequestBody {
  action?: "search" | "popular" | "trending";
  query?: string;
  limit?: number;
}

/** Day-of-year number (0-365), used to rotate the popular games offset daily */
function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Fetch games that are trending on the platform (recent reviews/likes),
 * then backfill remaining slots from IGDB (new releases, rotating popular).
 */
async function getTrendingGames(target = 20): Promise<IGDBGame[]> {
  // --- Tier 1: platform activity (last 7 days) ---
  let platformIgdbIds: number[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_trending_game_ids" as never);
    if (Array.isArray(data)) {
      platformIgdbIds = (data as { igdb_id: number }[]).map((r) => r.igdb_id);
    }
  } catch {
    // DB not available or function missing — skip
  }

  // --- Tier 2: IGDB backfill ---
  const remaining = target - platformIgdbIds.length;

  // Fire IGDB calls in parallel (only released games)
  const [newReleases, popular] = await Promise.all([
    getNewReleases(Math.min(8, remaining)).catch(() => [] as IGDBGame[]),
    getPopularGames(
      Math.min(20, remaining),
      // Rotate through popular games: offset shifts by 12 each day
      (dayOfYear() * 12) % 200
    ).catch(() => [] as IGDBGame[]),
  ]);

  const merged: IGDBGame[] = [];
  const seen = new Set<number>();

  // Platform-active games go first — fetch full IGDB data for them
  if (platformIgdbIds.length > 0) {
    try {
      const platformGames = await igdbFetchByIds(platformIgdbIds);
      for (const game of platformGames) {
        if (game.id && !seen.has(game.id)) {
          seen.add(game.id);
          merged.push(game);
        }
      }
    } catch {
      // ignore — will be backfilled below
    }
  }

  // Fill remaining slots from IGDB pools (new releases → rotating popular)
  for (const pool of [newReleases, popular]) {
    for (const game of pool) {
      if (merged.length >= target) break;
      if (game.id && !seen.has(game.id)) {
        seen.add(game.id);
        merged.push(game);
      }
    }
    if (merged.length >= target) break;
  }

  return merged;
}

export async function POST(request: NextRequest) {
  if (!isIGDBConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as IGDBRequestBody;
    const action = body.action ?? "search";

    let results;

    if (action === "trending") {
      results = await getTrendingGames(body.limit ?? 20);
    } else if (action === "popular") {
      results = await getPopularGames(body.limit);
    } else {
      if (!body.query) {
        return NextResponse.json(
          { error: "Missing query parameter" },
          { status: 400 }
        );
      }
      results = await searchGames(body.query, body.limit);
    }

    // Fire-and-forget: cache results in Supabase
    cacheGames(results).catch(() => {
      // Silently ignore cache failures
    });

    return NextResponse.json(results);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "IGDB request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
