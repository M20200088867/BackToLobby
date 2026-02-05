"use client";

import { ExternalLink, Tag, Loader2 } from "lucide-react";
import { useGamePrices } from "@/hooks/use-prices";

const STORE_NAMES: Record<string, string> = {
  "1": "Steam",
  "2": "GamersGate",
  "3": "GreenManGaming",
  "7": "GOG",
  "8": "Origin",
  "11": "Humble Bundle",
  "13": "Uplay",
  "21": "WinGameStore",
  "23": "GameBillet",
  "25": "Epic Games",
  "27": "Gamesplanet",
  "28": "Gamesload",
  "29": "2Game",
  "30": "IndieGala",
  "31": "Blizzard",
  "33": "DLGamer",
  "34": "Noctre",
  "35": "Dreamgame",
};

interface PriceCardProps {
  gameTitle: string;
}

export function PriceCard({ gameTitle }: PriceCardProps) {
  const { data: deals, isLoading } = useGamePrices(gameTitle);

  if (isLoading) {
    return (
      <div className="glass p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Best Deals</h3>
        </div>
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <div className="glass p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Best Deals</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          No deals available
        </p>
      </div>
    );
  }

  return (
    <div className="glass p-5 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Best Deals</h3>
      </div>
      <div className="space-y-3">
        {deals.slice(0, 5).map((deal) => {
          const salePrice = parseFloat(deal.salePrice);
          const normalPrice = parseFloat(deal.normalPrice);
          const savings =
            normalPrice > 0
              ? Math.round(((normalPrice - salePrice) / normalPrice) * 100)
              : 0;
          const storeName =
            deal.storeName || STORE_NAMES[deal.storeID] || "Store";

          return (
            <a
              key={deal.dealID}
              href={`https://www.cheapshark.com/redirect?dealID=${deal.dealID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{storeName}</span>
                {savings > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                    -{savings}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-sm font-semibold text-primary">
                    ${deal.salePrice}
                  </span>
                  {savings > 0 && (
                    <span className="text-xs text-muted-foreground line-through ml-2">
                      ${deal.normalPrice}
                    </span>
                  )}
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
