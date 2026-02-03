import type { IGDBCompany, IGDBGame } from "@/types/igdb";
import type { Game } from "@/types";

type IGDBImageSize =
  | "cover_small"
  | "cover_big"
  | "screenshot_med"
  | "screenshot_big"
  | "screenshot_huge"
  | "720p"
  | "1080p";

export function igdbCoverUrl(
  imageId: string,
  size: IGDBImageSize = "cover_big"
): string {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

export function extractDeveloper(
  companies?: IGDBCompany[]
): string | null {
  const first = companies?.[0];
  return first?.company.name ?? null;
}

export function extractYear(
  timestamp?: number
): number | null {
  if (!timestamp) return null;
  return new Date(timestamp * 1000).getFullYear();
}

export function transformIGDBGame(raw: IGDBGame): Game {
  return {
    id: 0, // sentinel — DB assigns real ID on insert
    igdb_id: raw.id,
    title: raw.name,
    cover_url: raw.cover?.image_id
      ? igdbCoverUrl(raw.cover.image_id)
      : null,
    slug: raw.slug,
    genres: raw.genres?.map((g) => g.name) ?? [],
    developer: extractDeveloper(raw.involved_companies),
    release_year: extractYear(raw.first_release_date),
    created_at: new Date().toISOString(),
  };
}

export function transformIGDBGames(rawGames: IGDBGame[]): Game[] {
  return rawGames.map(transformIGDBGame);
}
