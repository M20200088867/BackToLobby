"use client";

import { useQuery } from "@tanstack/react-query";

export interface GameDeal {
  storeID: string;
  storeName: string;
  salePrice: string;
  normalPrice: string;
  dealID: string;
}

export function useGamePrices(gameTitle: string) {
  return useQuery({
    queryKey: ["prices", gameTitle],
    queryFn: async (): Promise<GameDeal[]> => {
      if (!gameTitle) return [];

      const res = await fetch(
        `/api/prices?title=${encodeURIComponent(gameTitle)}`
      );

      if (!res.ok) return [];

      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!gameTitle,
  });
}
