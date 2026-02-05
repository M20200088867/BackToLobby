import { Star, TrendingUp } from "lucide-react";
import { TrendingGames } from "@/components/game";
import { RecentReviews } from "@/components/review/recent-reviews";

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center space-y-6 pt-12">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-[var(--gradient-purple)] via-[var(--gradient-blue)] to-[var(--gradient-cyan)] bg-clip-text text-transparent">
            BackToLobby
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your gaming diary. Rate, review, and discover the games that matter.
        </p>
      </section>

      {/* Trending */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Trending</h2>
        </div>
        <TrendingGames />
      </section>

      {/* Recent Reviews */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Recent Reviews</h2>
        </div>
        <RecentReviews />
      </section>
    </div>
  );
}
