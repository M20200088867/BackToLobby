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

## Workflow Rules

1. **After auth changes, always test the full flow:** login → redirect → verify session persists → refresh page → logout → verify session cleared. Do not mark auth work complete until this passes.

2. **When fixing bugs, run actual reproduction steps before marking complete.** Type checks passing ≠ bug fixed. Execute the exact steps that triggered the bug and show evidence it's resolved.

3. **For feature implementations, create acceptance criteria upfront and verify each one.** Don't mark a milestone complete until all criteria are demonstrated working.

4. **Test every feature visually in the browser before marking complete.** Type checks and builds passing is necessary but not sufficient.

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

3. **Auth uses Supabase Auth** with email/password. OAuth providers (Google, Steam) may be added later.

4. **Review flow uses centered Dialog modals** (not a drawer or page). Both the review writer and the review detail reader are centered glass-styled Dialog popups. Built with shadcn/ui Dialog component + glass styling.

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

### Required RLS Policies

- **users:** SELECT = public (needed for review joins to show usernames), INSERT/UPDATE = authenticated with `auth.uid() = id`
- **games:** SELECT = public (needed for review joins to show game info), INSERT/UPDATE = authenticated
- **reviews:** SELECT = public, INSERT/UPDATE/DELETE = authenticated with `auth.uid() = user_id`
- **likes:** SELECT = public, INSERT/DELETE = authenticated with `auth.uid() = user_id`

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

### Milestone 3: Auth & Profile — COMPLETED
- [x] `isSupabaseConfigured()` helper (`src/lib/supabase/helpers.ts`) for graceful degradation
- [x] Google avatar domain (`lh3.googleusercontent.com`) added to `next.config.ts` remotePatterns
- [x] `useAuth` hook (`src/hooks/use-auth.ts`): session management, profile fetching, Google OAuth, email/password auth, sign out
- [x] `AuthProvider` context (`src/lib/auth-context.tsx`) wrapping app via Providers component
- [x] Login page with email/password form + Google sign-in button, error/config banners, Suspense boundary for searchParams
- [x] Sign-up page (`src/app/(auth)/signup/page.tsx`): email/password registration with confirmation message
- [x] Email confirmation route (`src/app/(auth)/confirm/route.ts`): handles email verification OTP, creates user profile
- [x] `UserMenu` component (`src/components/layout/user-menu.tsx`): avatar dropdown with profile link + sign out
- [x] Navbar updated to client component with `<UserMenu />` integrated
- [x] `UserProfile` component (`src/components/user/user-profile.tsx`): cover, avatar, bio, platform badges, inline edit mode (owner only)
- [x] `UserNotFound` component (`src/components/user/user-not-found.tsx`)
- [x] User profile page (`src/app/(main)/user/[username]/page.tsx`): server component fetching profile + auth user, renders UserProfile or UserNotFound
- [x] Auth callback route enhanced with Supabase config guard
- [x] Browser Supabase client (`src/lib/supabase/client.ts`): fixed cookie handlers for session persistence
- [x] Graceful degradation: login shows info banner, navbar shows non-functional "Sign In", profile shows not-found when Supabase not configured
- [x] `pnpm type-check`, `pnpm lint`, `pnpm build` all pass clean

### Milestone 4: Core Loop — COMPLETED
- [x] `StarRating` component (`src/components/review/star-rating.tsx`): 1-5 with half-star support, hover preview, read-only mode, sm/md/lg sizes
- [x] `ReviewDrawer` component (`src/components/review/review-drawer.tsx`): slide-up Sheet with star rating, platform dropdown, textarea, submit/update/delete
- [x] `ReviewDrawerProvider` context (`src/components/review/review-drawer-context.tsx`): app-level context so any component can trigger the drawer, checks auth, fetches existing review for edit mode
- [x] `Providers` updated to wrap with `ReviewDrawerProvider` inside `AuthProvider`
- [x] `LogGameButton` component (`src/components/review/log-game-button.tsx`): card-overlay (circular "+") and standalone variants
- [x] `GameCard` restructured from `<Link>` wrapper to `<div>` with Link + LogGameButton overlay on hover
- [x] `useGameReviews` and `useRecentReviews` hooks (`src/hooks/use-reviews.ts`): direct Supabase queries with user/game joins
- [x] `ReviewCard` component (`src/components/review/review-card.tsx`): glass card with user, rating, comment, platform badge, time, like button
- [x] `ReviewCardSkeleton` component (`src/components/review/review-card-skeleton.tsx`)
- [x] `RecentReviews` component (`src/components/review/recent-reviews.tsx`): replaces home page skeleton placeholders
- [x] `GamePageContent` client component (`src/components/game/game-page-content.tsx`): cover, metadata, summary, LogGameButton, reviews list
- [x] Game detail page (`/game/[slug]`) upgraded from stub: server-side IGDB fetch + `GamePageContent`
- [x] `useReviewLikes` hook (`src/hooks/use-likes.ts`): count + isLiked state
- [x] `LikeButton` component (`src/components/review/like-button.tsx`): optimistic toggle with rollback, heart icon
- [x] `timeAgo()` utility added to `src/lib/utils.ts`
- [x] Review barrel export (`src/components/review/index.ts`)
- [x] `pnpm type-check`, `pnpm lint`, `pnpm build` all pass clean

### Milestone 5: Game Page — COMPLETED
- [x] `useGamePrices` hook (`src/hooks/use-prices.ts`): TanStack Query hook fetching from `/api/prices`, 5-minute staleTime
- [x] `PriceCard` component (`src/components/game/price-card.tsx`): glass card with store names, sale/normal prices, savings %, external links to CheapShark redirects
- [x] `useGameStats` hook (`src/hooks/use-game-stats.ts`): calculates average rating and total review count from Supabase
- [x] `GlobalScore` component (`src/components/game/global-score.tsx`): gradient pill with star icon showing average rating + review count
- [x] `ReviewFilters` component (`src/components/review/review-filters.tsx`): pill-style toggle buttons for "Newest" / "Highest Rated"
- [x] `useGameReviews` updated with `sortBy` parameter: supports "newest" (created_at desc) and "highest" (rating desc)
- [x] `GamePageContent` restructured: 3-column grid layout with reviews (2 cols) + PriceCard sidebar (1 col), GlobalScore in header
- [x] Review barrel export updated (`src/components/review/index.ts`)
- [x] `pnpm type-check`, `pnpm lint`, `pnpm build` all pass clean

### Milestone 6: Polish — COMPLETED
- [x] `ThemeToggle` component (`src/components/layout/theme-toggle.tsx`): Sun/Moon toggle with `useSyncExternalStore` hydration guard
- [x] Navbar updated with `ThemeToggle` between search and user menu
- [x] `motion.ts` shared motion variants: `pageVariants`, `staggerContainer`, `staggerItem`, `fadeIn`
- [x] `PageTransition` component (`src/components/layout/page-transition.tsx`): fade+slide on mount
- [x] Main layout wraps children in `<PageTransition>`
- [x] `GameCard` uses `motion.div` with `whileHover={{ scale: 1.03 }}`
- [x] `GameGrid` converted to client component with stagger animations on game cards
- [x] `RecentReviews` grid uses stagger animations
- [x] `CommandPalette` component (`src/components/search/command-palette.tsx`): `cmdk` + global Cmd+K shortcut, debounced IGDB search, glass styling, keyboard navigation, "View all results" link
- [x] Navbar search link replaced with `<CommandPalette />`
- [x] Search page accepts `?q=` query param from command palette, wrapped in `<Suspense>`
- [x] `GameCarousel` component (`src/components/game/game-carousel.tsx`): horizontal scroll with snap, prev/next chevrons, stagger animation
- [x] `.scrollbar-hide` and `.scroll-snap-x` CSS utilities added to `globals.css`
- [x] `TrendingGames` uses `GameCarousel` instead of `GameGrid`, fetches 20 games
- [x] `useInfiniteRecentReviews` hook (`src/hooks/use-infinite-reviews.ts`): `useInfiniteQuery` with 10-per-page pagination
- [x] `RecentReviews` uses infinite scroll with `IntersectionObserver` sentinel, loading spinner, end-of-feed message
- [x] Responsive refinements: navbar `gap-2 sm:gap-4`, hero text scaling, palette full-width on mobile
- [x] ESLint config updated to ignore `.claude/` directory
- [x] `pnpm type-check`, `pnpm lint`, `pnpm build` all pass clean

### Milestone 7: Fixes & Refinements — COMPLETED
- [x] shadcn/ui Dialog component added (`src/components/ui/dialog.tsx`)
- [x] Review data joins optimized: specific column selects (`user:users(id,username,avatar_url)`, `game:games(id,igdb_id,title,cover_url,slug)`) instead of `*`
- [x] Error logging improved: `console.error` with error code, details, and RLS policy hints
- [x] Likes hook optimized: parallel `Promise.all` for count + isLiked, `.maybeSingle()` instead of `.single()`
- [x] Review writer converted from bottom Sheet to centered Dialog modal with glass styling
- [x] Pointer-events fix: `MutationObserver` replaces fragile `setTimeout(300)`, belt-and-suspenders clear in `onOpenChange`
- [x] `ReviewDetailDialog` component (`src/components/review/review-detail-dialog.tsx`): full review read popup with user/game links
- [x] `ReviewCard` updated: click-to-expand opens detail dialog, avatar/username wrapped in `<Link>` to user profile, `stopPropagation` on interactive elements
- [x] `useUserReviews` hook (`src/hooks/use-user-reviews.ts`): fetch reviews by user ID with game join
- [x] `UserReviewsList` component (`src/components/user/user-reviews-list.tsx`): compact list with game covers, ratings, timestamps
- [x] User profile page shows `<UserReviewsList>` below `<UserProfile>`
- [x] Google OAuth removed: `signInWithGoogle` deleted from auth hook, Google button and divider removed from login page
- [x] CLAUDE.md updated: workflow rule #4, Required RLS Policies subsection, architecture note #4 updated
- [x] `pnpm type-check`, `pnpm lint`, `pnpm build` all pass clean
