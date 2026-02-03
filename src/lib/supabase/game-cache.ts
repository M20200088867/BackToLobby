// Server-only: game caching via Supabase
// DO NOT import this file from client components

import { createClient } from "@supabase/supabase-js";
import type { IGDBGame } from "@/types/igdb";
import { extractDeveloper, extractYear, igdbCoverUrl } from "@/lib/igdb-transforms";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

export async function cacheGame(raw: IGDBGame): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin.from("games").upsert(
    {
      igdb_id: raw.id,
      title: raw.name,
      cover_url: raw.cover?.image_id
        ? igdbCoverUrl(raw.cover.image_id)
        : null,
      slug: raw.slug,
      genres: raw.genres?.map((g) => g.name) ?? [],
      developer: extractDeveloper(raw.involved_companies),
      release_year: extractYear(raw.first_release_date),
    },
    { onConflict: "igdb_id" }
  );
}

export async function cacheGames(rawGames: IGDBGame[]): Promise<void> {
  if (!rawGames || rawGames.length === 0) return;

  const admin = createAdminClient();
  if (!admin) return;

  const rows = rawGames.map((raw) => ({
    igdb_id: raw.id,
    title: raw.name,
    cover_url: raw.cover?.image_id
      ? igdbCoverUrl(raw.cover.image_id)
      : null,
    slug: raw.slug,
    genres: raw.genres?.map((g) => g.name) ?? [],
    developer: extractDeveloper(raw.involved_companies),
    release_year: extractYear(raw.first_release_date),
  }));

  await admin.from("games").upsert(rows, { onConflict: "igdb_id" });
}
