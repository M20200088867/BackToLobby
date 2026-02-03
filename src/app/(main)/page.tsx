import { Star, TrendingUp } from "lucide-react";
import { TrendingGames } from "@/components/game";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10" />
                <div className="space-y-1">
                  <div className="h-4 w-24 rounded bg-white/10" />
                  <div className="h-3 w-16 rounded bg-white/5" />
                </div>
              </div>
              <div className="h-3 w-full rounded bg-white/5" />
              <div className="h-3 w-3/4 rounded bg-white/5" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
