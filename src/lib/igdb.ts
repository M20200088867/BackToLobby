// Server-only: IGDB API client
// DO NOT import this file from client components

const IGDB_BASE_URL = "https://api.igdb.com/v4";

let cachedToken: { token: string; expiresAt: number } | null = null;

export function isIGDBConfigured(): boolean {
  return !!(process.env.IGDB_CLIENT_ID && process.env.IGDB_CLIENT_SECRET);
}

export async function getIGDBToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  if (!isIGDBConfigured()) {
    throw new Error("IGDB credentials not configured");
  }

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.IGDB_CLIENT_ID!,
      client_secret: process.env.IGDB_CLIENT_SECRET!,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to get IGDB token: ${res.statusText}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 60_000,
  };

  return cachedToken.token;
}

async function igdbFetch(endpoint: string, body: string) {
  const token = await getIGDBToken();

  const res = await fetch(`${IGDB_BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": process.env.IGDB_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`IGDB ${endpoint} failed: ${res.statusText}`);
  }

  return res.json();
}

export async function searchGames(query: string, limit = 20) {
  return igdbFetch(
    "games",
    `search "${query}"; fields name,slug,cover.image_id,genres.name,first_release_date,involved_companies.company.name; limit ${limit};`
  );
}

export async function getGameBySlug(slug: string) {
  const results = await igdbFetch(
    "games",
    `where slug = "${slug}"; fields name,slug,cover.image_id,genres.name,summary,first_release_date,involved_companies.company.name,aggregated_rating; limit 1;`
  );
  return results[0] ?? null;
}

export async function getPopularGames(limit = 12) {
  return igdbFetch(
    "games",
    `fields name,slug,cover.image_id,genres.name,first_release_date,involved_companies.company.name,total_rating_count; where total_rating_count > 50 & cover != null; sort total_rating_count desc; limit ${limit};`
  );
}
