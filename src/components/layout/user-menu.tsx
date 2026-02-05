"use client";

import { useRef, useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
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

// Use useSyncExternalStore to safely check if we're on client
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function UserMenu() {
  const { user, isLoading, session, signOut } = useAuthContext();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const mounted = useIsMounted();
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  // Update menu position when button position changes or menu opens
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [open]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
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

  const dropdownMenu = (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: menuPosition.top,
        right: menuPosition.right,
      }}
      className="w-56 glass border border-white/10 rounded-xl p-1 shadow-2xl z-[100]"
    >
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
        onClick={async () => {
          setOpen(false);
          const { error } = await signOut();
          if (error) {
            console.error("Sign out failed:", error);
          }
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="rounded-full ring-2 ring-transparent hover:ring-white/20 transition-all"
        aria-expanded={open}
        aria-haspopup="true"
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

      {/* Render dropdown in portal to escape stacking context */}
      {open && mounted && createPortal(dropdownMenu, document.body)}
    </>
  );
}
