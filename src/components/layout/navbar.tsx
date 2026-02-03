import Link from "next/link";
import { Gamepad2, Search } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold"
        >
          <Gamepad2 className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-[var(--gradient-purple)] via-[var(--gradient-blue)] to-[var(--gradient-cyan)] bg-clip-text text-transparent">
            BackToLobby
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/search"
            className="glass flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-xl"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search games...</span>
            <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] text-muted-foreground">
              <span className="text-xs">&#8984;</span>K
            </kbd>
          </Link>
        </div>
      </div>
    </nav>
  );
}
