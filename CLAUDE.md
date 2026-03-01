# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BackToLobby** is a social platform for video game discovery and tracking — "Letterboxd for games." Users maintain a gaming diary, rate titles (1-5 stars with half-stars), write reviews (Markdown), and discover trending games. The aesthetic is "Apple Liquid Glass" — glassmorphism on a dark background with vibrant accents.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict mode, `noUncheckedIndexedAccess`)
- **Styling:** Tailwind CSS v4 + shadcn/ui (glass-themed)
- **Animations:** Framer Motion
- **Backend/BaaS:** Supabase (PostgreSQL, Auth) — `@supabase/ssr` 0.8.0
- **Data Fetching:** TanStack Query v5
- **Icons:** Lucide React
- **Package Manager:** pnpm

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # ESLint
pnpm type-check       # tsc --noEmit
```

No test framework is configured. Validation is: type-check + lint + visual browser testing.

## Workflow Rules

1. **After auth changes, always test the full flow:** login → redirect → verify session persists → refresh page → logout → verify session cleared. Do not mark auth work complete until this passes.

2. **When fixing bugs, run actual reproduction steps before marking complete.** Type checks passing ≠ bug fixed. Execute the exact steps that triggered the bug and show evidence it's resolved.

3. **For feature implementations, create acceptance criteria upfront and verify each one.** Don't mark a milestone complete until all criteria are demonstrated working.

4. **Test every feature visually in the browser before marking complete.** Type checks and builds passing is necessary but not sufficient.

## Architecture

### Directory Structure

```
src/
├── app/
│   ├── (auth)/             # login, signup, callback, confirm routes
│   ├── (main)/             # Navbar layout: home, game/[slug], user/[username], search
│   └── api/
│       ├── igdb/           # IGDB proxy (POST: action="search"|"popular")
│       └── prices/         # CheapShark proxy (GET: ?title=)
├── components/
│   ├── ui/                 # shadcn/ui: button, card, input, sheet, dialog
│   ├── game/               # GameCard, GameCarousel, GameGrid, PriceCard, GlobalScore, GamePageContent
│   ├── review/             # StarRating, ReviewCard, ReviewDrawer (Dialog), ReviewDetailDialog, LikeButton, LogGameButton
│   ├── search/             # CommandPalette (Cmd+K, uses cmdk)
│   ├── user/               # UserProfile, UserReviewsList, UserNotFound
│   ├── layout/             # Navbar, UserMenu, ThemeToggle, PageTransition
│   └── providers.tsx       # App providers (see Provider Composition below)
├── hooks/
│   ├── use-auth.ts         # Auth state + sign-in/up/out
│   ├── use-reviews.ts      # useGameReviews (sortBy) + useRecentReviews
│   ├── use-infinite-reviews.ts  # useInfiniteRecentReviews (10/page, IntersectionObserver)
│   ├── use-user-reviews.ts # Reviews by user_id with game join
│   ├── use-likes.ts        # Count + isLiked (parallel Promise.all, .maybeSingle())
│   ├── use-game-stats.ts   # Avg rating + review count
│   ├── use-prices.ts       # CheapShark via /api/prices
│   └── use-debounce.ts     # 300ms default
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client (singleton, createBrowserClient)
│   │   ├── server.ts       # Server client (async, Next.js cookies)
│   │   ├── middleware.ts   # updateSession() — called by src/middleware.ts
│   │   ├── game-cache.ts   # Fire-and-forget upsert (uses service role key)
│   │   └── helpers.ts      # isSupabaseConfigured() guard
│   ├── igdb.ts             # IGDB client: searchGames(), getGameBySlug(), getPopularGames() — SERVER ONLY
│   ├── igdb-transforms.ts  # Raw IGDB → local Game schema transforms
│   ├── prices.ts           # CheapShark client — SERVER ONLY
│   ├── auth-context.tsx    # AuthProvider context
│   ├── motion.ts           # Shared Framer Motion variants (pageVariants, staggerContainer, staggerItem, fadeIn)
│   └── utils.ts            # cn() + timeAgo()
├── types/
│   ├── index.ts            # User, Game, Review, Like, Platform
│   └── igdb.ts             # Raw IGDB API response types
└── middleware.ts            # Root: calls updateSession, skips when Supabase not configured
```

Path alias: `@/*` → `src/*`

### Key Architectural Decisions

1. **External APIs are server-side only.** IGDB and pricing APIs must be called through Next.js API routes (`src/app/api/`) to protect API keys. Never import `igdb.ts` or `prices.ts` from client components.

2. **Games table is a cache.** The `games` table in Supabase is populated on-demand when users interact with a game. IGDB is the source of truth. When a game is searched/reviewed, upsert it into the local `games` table by `igdb_id`. The cache uses the service role key for admin upsert.

3. **Auth uses Supabase Auth** with email/password only. `onAuthStateChange` is the single source of truth for session state — do not also call `getSession()` (causes race conditions). Handle `INITIAL_SESSION` with null session explicitly to set `isLoading=false` for unauthenticated users.

4. **Review flow uses centered Dialog modals** (not a drawer or page). Both the review writer (`ReviewDrawer`) and detail reader (`ReviewDetailDialog`) are centered glass-styled Dialog popups. `ReviewDrawerProvider` is app-level context so any component can trigger the dialog.

5. **Search has two modes:** a Cmd+K command palette (`cmdk`) for quick access and a full `/search` page. The palette links to `/search?q=` to hand off queries.

6. **Theme: dark default with light mode available.** Use `next-themes`. All glass effects must work on both themes.

7. **Graceful degradation.** All hooks and pages check `isSupabaseConfigured()` and return empty states rather than crashing when env vars are missing.

8. **Review data joins use specific column selects** (`user:users(id,username,avatar_url)`, `game:games(id,igdb_id,title,cover_url,slug)`) not `*`. Disambiguate the reviews→users FK with `!reviews_user_id_fkey` to avoid PGRST201 errors.

### Provider Composition Order

`src/components/providers.tsx` wraps the app in this order (outermost → innermost):
1. `ThemeProvider` (next-themes)
2. `QueryClientProvider` (TanStack Query)
3. `AuthProvider` (auth state context)
4. `ReviewDrawerProvider` (app-level review modal)

## Supabase Schema

```
users:    id (uuid PK), username, avatar_url, cover_url, bio, steam_id, psn_id, xbox_id, created_at
games:    id (int8 PK), igdb_id (unique), title, cover_url, slug, genres (text[]), developer, release_year, created_at
reviews:  id (uuid PK), user_id (FK→users), game_id (FK→games), rating (float 1-5), comment (text), platform_played, created_at
likes:    user_id (FK→users), review_id (FK→reviews), PRIMARY KEY (user_id, review_id)
```

### Required RLS Policies

- **users:** SELECT = public (needed for review joins), INSERT/UPDATE = authenticated with `auth.uid() = id`
- **games:** SELECT = public, INSERT/UPDATE = authenticated
- **reviews:** SELECT = public, INSERT/UPDATE/DELETE = authenticated with `auth.uid() = user_id`
- **likes:** SELECT = public, INSERT/DELETE = authenticated with `auth.uid() = user_id`

## Design System: Glass Theme

**Light mode is the primary experience.** Dark mode is secondary. `defaultTheme="light"` in providers.

- **Glass cards:** Light: `bg-white/70 backdrop-blur-xl border border-black/[0.06] rounded-2xl` — Dark: `bg-white/5 backdrop-blur-xl border border-white/[0.08] rounded-2xl`
- **Background:** Very subtle warm blush radial gradient (`oklch(0.92 0.04 20 / 0.3)`) in top-right corner on clean white/dark base
- **Accent color:** Cherry red (`--primary: oklch(0.55 0.24 25)` light / `oklch(0.62 0.24 25)` dark) — used for primary actions, logo, interactive highlights
- **Gradient tokens:** `--gradient-start` and `--gradient-end` (both cherry red shades). Use `from-[var(--gradient-start)] to-[var(--gradient-end)]` on gradient buttons
- **Typography:** Inter font
- **Corners:** `rounded-2xl`/`rounded-3xl` for cards, `rounded-xl` for inputs/buttons
- **Shadows:** `shadow-primary/10` on elevated elements

Never use opaque backgrounds on cards or containers. Custom CSS utilities `.scrollbar-hide` and `.scroll-snap-x` are in `globals.css`.

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# IGDB (Twitch client credentials)
IGDB_CLIENT_ID=
IGDB_CLIENT_SECRET=

# Steam (future use)
STEAM_API_KEY=
```

## External API Notes

- **IGDB:** Requires Twitch OAuth token (client credentials flow). Token is cached in-memory and refreshed on expiry. Endpoint: `https://api.igdb.com/v4/`. Uses Apicalypse query syntax (POST with body like `fields name,cover.*; search "zelda"; limit 10;`).
- **CheapShark:** Free tier, no auth required. Maps games by name — match carefully against IGDB titles.

## Deployment

Multi-stage Dockerfile (Node 22 Alpine) + `docker-compose.yml`. Next.js `output: "standalone"` is set in `next.config.ts`. Run with `docker compose up`.
