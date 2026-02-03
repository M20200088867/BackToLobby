export interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  steam_id: string | null;
  psn_id: string | null;
  xbox_id: string | null;
  created_at: string;
}

export interface Game {
  id: number;
  igdb_id: number;
  title: string;
  cover_url: string | null;
  slug: string;
  genres: string[];
  developer: string | null;
  release_year: number | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  game_id: number;
  rating: number;
  comment: string | null;
  platform_played: string | null;
  created_at: string;
  user?: User;
  game?: Game;
}

export interface Like {
  user_id: string;
  review_id: string;
}

export type Platform =
  | "PC"
  | "PS4"
  | "PS5"
  | "Xbox One"
  | "Xbox Series"
  | "Switch"
  | "Steam Deck";
