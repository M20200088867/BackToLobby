// Raw IGDB API response types

export interface IGDBCover {
  id: number;
  image_id: string;
}

export interface IGDBGenre {
  id: number;
  name: string;
}

export interface IGDBCompany {
  id: number;
  company: {
    id: number;
    name: string;
  };
}

export interface IGDBGame {
  id: number;
  name: string;
  slug: string;
  cover?: IGDBCover;
  genres?: IGDBGenre[];
  first_release_date?: number;
  involved_companies?: IGDBCompany[];
  summary?: string;
  aggregated_rating?: number;
  total_rating_count?: number;
}
