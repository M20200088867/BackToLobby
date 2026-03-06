// Server-only: Pricing API client (CheapShark)
// DO NOT import this file from client components

const CHEAPSHARK_BASE = "https://www.cheapshark.com/api/1.0";

export interface GameDeal {
  storeID: string;
  storeName: string;
  salePrice: string;
  normalPrice: string;
  dealID: string;
}

export async function getGamePrices(
  gameTitle: string
): Promise<GameDeal[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(
      `${CHEAPSHARK_BASE}/deals?title=${encodeURIComponent(gameTitle)}&limit=5&sortBy=Price`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      return [];
    }

    return res.json();
  } catch {
    clearTimeout(timeout);
    return [];
  }
}
