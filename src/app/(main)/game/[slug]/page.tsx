import { notFound } from "next/navigation";
import { getGameBySlug, isIGDBConfigured } from "@/lib/igdb";
import { transformIGDBGame } from "@/lib/igdb-transforms";
import { GamePageContent } from "@/components/game/game-page-content";
import { Gamepad2 } from "lucide-react";
import type { IGDBPlatform } from "@/types/igdb";

const PLATFORM_MAP: Record<string, string[]> = {
  "PC (Microsoft Windows)": ["steam", "epic"],
  "PlayStation 4": ["playstation"],
  "PlayStation 5": ["playstation"],
  "Xbox One": ["xbox"],
  "Xbox Series X|S": ["xbox"],
  "Nintendo Switch": ["nintendo"],
};

function extractStorePlatforms(platforms: IGDBPlatform[]): string[] {
  const set = new Set<string>();
  for (const p of platforms) {
    for (const store of PLATFORM_MAP[p.name] ?? []) {
      set.add(store);
    }
  }
  return Array.from(set);
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isIGDBConfigured()) {
    return (
      <div className="glass p-8 rounded-3xl space-y-4 text-center">
        <Gamepad2 className="h-12 w-12 text-muted-foreground/50 mx-auto" />
        <h1 className="text-2xl font-bold">
          {slug.replace(/-/g, " ")}
        </h1>
        <p className="text-muted-foreground">
          IGDB is not configured. Set IGDB_CLIENT_ID and IGDB_CLIENT_SECRET to
          enable game data.
        </p>
      </div>
    );
  }

  const rawGame = await getGameBySlug(slug);

  if (!rawGame) {
    notFound();
  }

  const game = transformIGDBGame(rawGame);
  const platforms = extractStorePlatforms(rawGame.platforms ?? []);

  return (
    <GamePageContent
      game={game}
      summary={rawGame.summary}
      platforms={platforms}
    />
  );
}
