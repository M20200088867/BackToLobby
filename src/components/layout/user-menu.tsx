"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuthContext } from "@/lib/auth-context";

function AvatarFallback({ username }: { username: string }) {
  const initials = username.slice(0, 2).toUpperCase();
  return (
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--gradient-purple)] to-[var(--gradient-cyan)] flex items-center justify-center text-xs font-bold text-white">
      {initials}
    </div>
  );
}

export function UserMenu() {
  const { user, isLoading, session, signOut } = useAuthContext();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  if (isLoading) {
    return (
      <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
    );
  }

  if (!session || !user) {
    return (
      <Link
        href="/login"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full ring-2 ring-transparent hover:ring-white/20 transition-all"
      >
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.username}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <AvatarFallback username={user.username} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 glass border border-white/10 rounded-xl p-1 shadow-2xl z-50">
          <div className="px-3 py-2 border-b border-white/10">
            <p className="text-sm font-medium truncate">@{user.username}</p>
          </div>

          <Link
            href={`/user/${user.username}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
          >
            <UserIcon className="h-4 w-4" />
            Profile
          </Link>

          <button
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
