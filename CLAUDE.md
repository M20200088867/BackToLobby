# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BackToLobby** is a social platform for video game discovery and tracking — "Letterboxd for games." Users maintain a gaming diary, rate titles (1-5 stars with half-stars), write reviews (Markdown), and discover trending games. The aesthetic is "Apple Liquid Glass" — glassmorphism on a dark background with vibrant accents.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui (heavily customized with glassmorphism)
- **Animations:** Framer Motion (page transitions, micro-animations, glass effects)
- **Backend/BaaS:** Supabase (PostgreSQL, Auth, Realtime)
- **Data Fetching:** TanStack Query (React Query)
- **Icons:** Lucide React
- **Package Manager:** pnpm

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (Next.js)
pnpm build            # Production build
pnpm lint             # ESLint
pnpm type-check       # TypeScript type checking (tsc --noEmit)
```

## Architecture

### Directory Structure (App Router)

```
src/
├── app/                    # Next.js App Router pages & layouts
│   ├── (auth)/             # Auth route group (login, callback)
│   ├── (main)/             # Main app layout with nav
│   │   ├── page.tsx        # Home — hero carousel + global feed
│   │   ├── game/[slug]/    # Game detail page
│   │   ├── user/[username]/ # User profile page
│   │   └── search/         # Full-page search with filters
│   └── api/                # API routes (server-side proxy for external APIs)
│       ├── igdb/           # IGDB proxy (protects API keys)
│       └── prices/         # CheapShark/IsThereAnyDeal proxy
├── components/
│   ├── ui/                 # shadcn/ui base components (glass-themed)
│   ├── game/               # GameCard, GameHeader, PriceCard
│   ├── review/             # ReviewDrawer, ReviewCard, StarRating
│   ├── search/             # CommandPalette (Cmd+K), SearchFilters
│   └── layout/             # Navbar, Footer, MeshGradientBg
├── lib/
│   ├── supabase/           # Supabase client (browser + server), auth helpers
│   ├── igdb.ts             # IGDB API client (server-only)
│   ├── prices.ts           # Pricing API client (server-only)
│   └── utils.ts            # Shared utilities
├── hooks/                  # Custom React hooks (useDebounce, useReviews, etc.)
├── types/                  # TypeScript types/interfaces (Game, Review, User)
└── styles/                 # Global CSS, glass theme tokens
```

### Key Architectural Decisions

1. **External APIs are server-side only.** IGDB and pricing APIs must be called through Next.js API routes (`src/app/api/`) to protect API keys. Never import `igdb.ts` or `prices.ts` from client components.

2. **Games table is a cache.** The `games` table in Supabase is populated on-demand when users interact with a game. IGDB is the source of truth. When a game is searched/reviewed, upsert it into the local `games` table by `igdb_id`.

3. **Auth uses Supabase Auth** with OAuth providers (Google, Steam). Steam OAuth requires custom implementation since Supabase doesn't natively support it — handle via API route that completes the OpenID flow and creates/links the Supabase user.

4. **Review flow uses a slide-up drawer** (not a modal or page). The drawer appears over the game page, keeping context visible. Built with shadcn/ui Sheet component + glass styling.

5. **Search has two modes:** a Cmd+K command palette for quick access (global keyboard shortcut) and a full `/search` page for browsing with filters.

6. **Theme: dark default with light mode available.** Dark mode is the primary experience. Use `next-themes` for toggle. All glass effects must work on both themes.

7. **Global feed only (MVP).** No follow/follower system yet. Home page shows trending (by review volume) and a global recent reviews feed with infinite scroll.

8. **Self-hosted deployment** via Docker. Include Dockerfile and docker-compose.yml.

## Supabase Schema

```
users:    id (uuid PK), username, avatar_url, cover_url, bio, steam_id, psn_id, xbox_id, created_at
games:    id (int8 PK), igdb_id (unique), title, cover_url, slug, genres (text[]), developer, release_year, created_at
reviews:  id (uuid PK), user_id (FK→users), game_id (FK→games), rating (float 1-5), comment (text), platform_played, created_at
likes:    user_id (FK→users), review_id (FK→reviews), PRIMARY KEY (user_id, review_id)
```

## Design System: Glass Theme

All UI components follow the "Apple Liquid Glass" aesthetic:

- **Glass cards:** `bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl`
- **Background:** Deep dark with animated mesh gradients (use CSS `@property` or canvas)
- **Accent colors:** Vibrant gradients (purple → blue → cyan range), used sparingly for highlights and CTAs
- **Typography:** Inter font. Bold titles, clean body text.
- **Corners:** `rounded-2xl` or `rounded-3xl` for cards, `rounded-xl` for inputs/buttons
- **Shadows:** Colored diffused shadows (`shadow-purple-500/20`) on elevated elements

When creating new components, always extend the glass system. Never use opaque backgrounds on cards or containers.

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# IGDB (Twitch)
IGDB_CLIENT_ID=
IGDB_CLIENT_SECRET=

# Pricing API
CHEAPSHARK_API_KEY=

# Steam
STEAM_API_KEY=

# Google OAuth (configured in Supabase dashboard)
```

## External API Notes

- **IGDB:** Requires Twitch OAuth token (client credentials flow). Token expires — cache and refresh. Endpoint: `https://api.igdb.com/v4/`. Uses Apicalypse query syntax (POST with body like `fields name,cover.*; search "zelda"; limit 10;`).
- **CheapShark:** Free tier, no auth needed for basic queries. Maps games by name — match carefully against IGDB titles.
- **Steam Web API:** Used for OpenID authentication, not for game data in MVP.

## Development Progress

Tracks current state against PRD Section 6 milestones. Update this after each work session.

### Milestone 1: Setup — COMPLETED
- [x] Next.js 16 + TypeScript strict + Tailwind v4 + App Router scaffolded
- [x] shadcn/ui initialized (zinc base), components added: Button, Card, Input, Sheet
- [x] Dependencies installed: Supabase SSR, TanStack Query, Framer Motion, next-themes, Lucide
- [x] Glass theme CSS: custom properties (light+dark), `.glass` utility, `.mesh-gradient` background
- [x] Root layout with Inter font, Providers (QueryClient + ThemeProvider), suppressHydrationWarning
- [x] Main layout with Navbar (gradient logo, search link with Cmd+K hint) + mesh-gradient bg
- [x] Home page with hero, trending grid (placeholder), recent reviews grid (skeleton cards)
- [x] Supabase clients: browser (`lib/supabase/client.ts`), server (`lib/supabase/server.ts`), middleware helper
- [x] Root middleware for Supabase session refresh (defensive — skips when env vars missing)
- [x] IGDB client (`lib/igdb.ts`) with Twitch token caching, `searchGames()`, `getGameBySlug()`
- [x] CheapShark client (`lib/prices.ts`) with `getGamePrices()`
- [x] API routes: `/api/igdb` (POST, search proxy), `/api/prices` (GET, pricing proxy)
- [x] Stub pages: login, auth callback, game/[slug], user/[username], search
- [x] TypeScript types: User, Game, Review, Like, Platform (`src/types/index.ts`)
- [x] Docker deployment: multi-stage Dockerfile, docker-compose.yml, .dockerignore
- [x] next.config.ts: `output: "standalone"`, IGDB image domain whitelisted
- [x] .env.example with all required vars
- [x] `pnpm build`, `pnpm type-check`, `pnpm lint` all pass clean

### Milestone 2: Data Layer — COMPLETED
- [x] IGDB raw types (`src/types/igdb.ts`) and transform utilities (`src/lib/igdb-transforms.ts`)
- [x] `getPopularGames()` added to IGDB client, API route accepts `action: "search" | "popular"`
- [x] `GameCard` component with glass styling, cover image, gradient overlay, hover effects
- [x] `GameCardSkeleton` component with matching aspect ratio and pulse animation
- [x] `GameGrid` component with configurable columns (2/3/4/6), loading state support
- [x] `TrendingGames` client component with TanStack Query (5min staleTime)
- [x] Home page wired to `TrendingGames` replacing placeholder cards
- [x] Search page fully rewritten: debounced input, IGDB search via TanStack Query, loading/empty/error states
- [x] `useDebounce` hook (`src/hooks/use-debounce.ts`, 300ms default)
- [x] Game caching (`src/lib/supabase/game-cache.ts`): fire-and-forget upsert on `igdb_id` conflict
- [x] Graceful degradation: no crashes without env vars, caching silently skips without Supabase
- [x] `pnpm type-check`, `pnpm lint`, `pnpm build` all pass clean

### Milestone 3: Auth & Profile — NOT STARTED
- Set up Supabase project, create tables from schema
- Configure Google OAuth in Supabase dashboard
- Build login page with Google sign-in button
- Implement Steam OpenID flow via custom API route
- Build editable user profile page (avatar, cover, bio, platform badges)

### Milestone 4: Core Loop — NOT STARTED
- ReviewDrawer component (slide-up Sheet with star rating, markdown editor, platform dropdown)
- StarRating component (1-5 with half-star support)
- "Log Game" button on game pages and search results
- Save reviews to Supabase, display on game pages
- Like system on reviews

### Milestone 5: Game Page — NOT STARTED
- Full game detail page: cover art, metadata from IGDB, global score from reviews
- PriceCard component showing live deals from CheapShark
- Reviews section with filters (newest, highest rated)

### Milestone 6: Polish — NOT STARTED
- Framer Motion page transitions and micro-animations
- Command palette (Cmd+K) with instant IGDB search
- Home page trending carousel (based on review volume)
- Infinite scroll on global feed
- Responsive refinements
- Theme toggle (dark/light) in navbar
