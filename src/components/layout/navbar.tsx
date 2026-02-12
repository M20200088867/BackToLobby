"use client";

import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { CommandPalette } from "@/components/search/command-palette";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

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
        <div className="flex items-center gap-2 sm:gap-4">
          <CommandPalette />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
