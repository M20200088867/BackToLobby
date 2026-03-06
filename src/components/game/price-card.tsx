"use client";

import { Tag, Loader2, ArrowUpRight } from "lucide-react";
import { useGamePrices, type GameDeal } from "@/hooks/use-prices";

type PricedStoreRow = {
  kind: "priced";
  id: "steam" | "epic";
  name: string;
  deal: GameDeal | null;
  searchUrl: string;
};

type VisitStoreRow = {
  kind: "visit";
  id: "playstation" | "xbox" | "nintendo";
  name: string;
  visitUrl: string;
};

type StoreRow = PricedStoreRow | VisitStoreRow;

function buildStoreUrl(id: string, title: string): string {
  const enc = encodeURIComponent(title);
  switch (id) {
    case "steam":
      return `https://store.steampowered.com/search/?term=${enc}`;
    case "epic":
      return `https://store.epicgames.com/browse?q=${enc}`;
    case "playstation":
      return `https://store.playstation.com/search/${enc}`;
    case "xbox":
      return `https://www.xbox.com/games/store?Search=${enc}`;
    case "nintendo":
      return `https://www.nintendo.com/search/#q=${enc}&p=1&cat=gme`;
    default:
      return "#";
  }
}

interface PriceCardProps {
  gameTitle: string;
  platforms: string[];
}

export function PriceCard({ gameTitle, platforms }: PriceCardProps) {
  const needsPrices =
    platforms.includes("steam") || platforms.includes("epic");

  const { data: deals, isLoading } = useGamePrices(
    needsPrices ? gameTitle : ""
  );

  const steamDeal = deals?.find((d) => d.storeID === "1") ?? null;
  const epicDeal = deals?.find((d) => d.storeID === "25") ?? null;

  const rows: StoreRow[] = [];

  if (platforms.includes("steam")) {
    rows.push({
      kind: "priced",
      id: "steam",
      name: "Steam",
      deal: steamDeal,
      searchUrl: buildStoreUrl("steam", gameTitle),
    });
  }
  if (platforms.includes("epic")) {
    rows.push({
      kind: "priced",
      id: "epic",
      name: "Epic Games",
      deal: epicDeal,
      searchUrl: buildStoreUrl("epic", gameTitle),
    });
  }
  if (platforms.includes("playstation")) {
    rows.push({
      kind: "visit",
      id: "playstation",
      name: "PS Store",
      visitUrl: buildStoreUrl("playstation", gameTitle),
    });
  }
  if (platforms.includes("xbox")) {
    rows.push({
      kind: "visit",
      id: "xbox",
      name: "Xbox Store",
      visitUrl: buildStoreUrl("xbox", gameTitle),
    });
  }
  if (platforms.includes("nintendo")) {
    rows.push({
      kind: "visit",
      id: "nintendo",
      name: "Nintendo",
      visitUrl: buildStoreUrl("nintendo", gameTitle),
    });
  }

  return (
    <div className="glass p-5 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Today&apos;s Prices</h3>
      </div>

      {needsPrices && isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No store info available
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => {
            let href: string;
            let priceContent: React.ReactNode;

            if (row.kind === "priced") {
              const deal = row.deal;
              if (deal) {
                const salePrice = parseFloat(deal.salePrice);
                const normalPrice = parseFloat(deal.normalPrice);
                const savings =
                  normalPrice > 0
                    ? Math.round(
                        ((normalPrice - salePrice) / normalPrice) * 100
                      )
                    : 0;
                href = `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`;
                priceContent = (
                  <>
                    <span className="text-sm font-semibold text-primary">
                      ${deal.salePrice}
                    </span>
                    {savings > 0 && (
                      <span className="text-xs text-muted-foreground line-through">
                        ${deal.normalPrice}
                      </span>
                    )}
                  </>
                );
              } else {
                href = row.searchUrl;
                priceContent = (
                  <span className="text-sm text-muted-foreground">Visit</span>
                );
              }
            } else {
              href = row.visitUrl;
              priceContent = (
                <span className="text-sm text-muted-foreground">Visit</span>
              );
            }

            return (
              <a
                key={row.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
              >
                <span className="text-sm font-medium">{row.name}</span>
                <div className="flex items-center gap-2">
                  {priceContent}
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
