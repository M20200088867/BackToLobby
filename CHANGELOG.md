# Changelog

All notable changes are documented here in plain English.

---

## [Unreleased]

_Changes on `main` not yet deployed to production._

---

## [0.7.0] — 2026-03-05

### Avatar Upload & Profile Enhancements

- Added avatar image upload to the profile edit form — stored in Supabase Storage
- Added a "Favorite Game" prompt field on the profile
- Fixed avatar never appearing after upload due to a stale URL
- Fixed reviews staying empty on a cold DB reload (query invalidation timing)
- Fixed profile edits not syncing to the navbar after saving
- Fixed redirect not triggering when a user changes their username

---

## [0.6.0] — 2026-03-05

### Visual Redesign: Cherry Red + White Glassmorphism

- Replaced the dark purple palette with cherry red (`oklch(0.55 0.24 25)`) as the primary accent
- Made light mode the default experience (`defaultTheme="light"`)
- Switched card backgrounds to white glassmorphism (`bg-white/70 backdrop-blur-xl`) in light mode
- Added a subtle warm blush radial gradient in the page background
- Updated all buttons, highlights, and interactive elements to use the new accent

---

## [0.5.0] — 2026-03-03

### Review Joins & PGRST201 Fix

- Fixed `PGRST201` ambiguous FK error by explicitly specifying `!reviews_user_id_fkey` in all review queries
- Refactored all review data joins to use specific column selects instead of `*`

---

## [0.4.0] — 2026-03-03

### User Profiles

- Built `/user/[username]` profile page with bio, social handles (Steam, PSN, Xbox), and review history
- Added profile edit form (username, bio, avatar URL, cover image, game IDs)
- Added `UserNotFound` component for invalid usernames
- Navbar user menu links to the authenticated user's profile

---

## [0.3.0] — 2026-03-03

### Reviews & Likes

- Review dialog (centered glass modal) for writing reviews with star rating (1–5, half-stars) and Markdown comment
- `ReviewDrawerProvider` makes the dialog accessible from any component via context
- Like button with optimistic count updates
- `ReviewDetailDialog` for reading full reviews
- Infinite scroll on the recent-reviews feed (10 per page, IntersectionObserver)

---

## [0.2.0] — 2026-03-03

### Game Pages & Pricing

- Game detail page at `/game/[slug]` — cover, metadata, global rating, review list
- IGDB proxy at `/api/igdb` (server-side, protects API keys)
- CheapShark price comparison via `/api/prices` — lowest current deals per game
- `games` table used as a local cache; upserted on-demand when users interact with a game
- Popularity-sorted home feed via `getPopularGames()`

---

## [0.1.0] — 2026-03-03

### Foundation

- Next.js 16 App Router project with TypeScript strict mode and Tailwind v4
- Supabase Auth (email/password) with `onAuthStateChange` as single source of truth
- Middleware for session refresh via `@supabase/ssr`
- Database schema: `users`, `games`, `reviews`, `likes` with RLS policies
- Command palette (Cmd+K) and `/search` page backed by IGDB
- Navbar with theme toggle (dark/light) and user menu
