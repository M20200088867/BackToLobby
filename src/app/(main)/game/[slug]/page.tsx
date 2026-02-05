import { notFound } from "next/navigation";
import { getGameBySlug, isIGDBConfigured } from "@/lib/igdb";
import { transformIGDBGame } from "@/lib/igdb-transforms";
import { GamePageContent } from "@/components/game/game-page-content";
import { Gamepad2 } from "lucide-react";

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

  return (
    <GamePageContent
      game={game}
      summary={rawGame.summary}
    />
  );
}
