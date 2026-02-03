import { NextRequest, NextResponse } from "next/server";
import { searchGames, getPopularGames, isIGDBConfigured } from "@/lib/igdb";
import { cacheGames } from "@/lib/supabase/game-cache";

interface IGDBRequestBody {
  action?: "search" | "popular";
  query?: string;
  limit?: number;
}

export async function POST(request: NextRequest) {
  if (!isIGDBConfigured()) {
    return NextResponse.json(
      { error: "not_configured" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as IGDBRequestBody;
    const action = body.action ?? "search";

    let results;

    if (action === "popular") {
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
