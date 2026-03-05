# BackToLobby

A social platform for video game discovery and tracking — Letterboxd for games.

Users maintain a gaming diary, rate titles (1–5 stars with half-stars), write Markdown reviews, and discover trending games. The visual design is Apple Liquid Glass: glassmorphism on a clean white background with cherry red accents.

---

## Features

- **Game discovery** — search any game via IGDB (Cmd+K palette or `/search` page)
- **Reviews & ratings** — 1–5 star ratings with half-stars, Markdown comments
- **Likes** — like individual reviews
- **User profiles** — bio, avatar, social handles (Steam, PSN, Xbox), full review history
- **Price comparison** — cheapest current deals via CheapShark
- **Infinite scroll** — recent activity feed with lazy loading
- **Dark/light mode** — light is the default, glass effects work on both

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animations | Framer Motion |
| Backend | Supabase (PostgreSQL + Auth) |
| Data fetching | TanStack Query v5 |
| Game data | IGDB API |
| Price data | CheapShark API |
| Package manager | pnpm |

---

## Development

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm type-check   # TypeScript check
pnpm lint         # ESLint
pnpm build        # Production build
```

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
IGDB_CLIENT_ID=
IGDB_CLIENT_SECRET=
```

---

## Deployment

Two-branch model:

| Branch | Environment | URL |
|---|---|---|
| `main` | Preview (staging) | Vercel preview URL |
| `production` | Production (live) | backtolobby.vercel.app |

CI runs type-check + lint on every push to `main` and every PR to `production`.

To deploy to production: ask Claude to open a PR from `main` → `production`, review the summary, then approve.
