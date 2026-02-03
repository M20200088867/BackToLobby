# Product Requirements Document (PRD): BackToLobby

**Version:** 1.0
**Status:** Draft
**Type:** Web Application (MVP)

## 1. Product Vision
**BackToLobby** is a social platform for video game discovery and tracking, directly inspired by the simplicity and elegance of Letterboxd. The goal is to allow gamers to keep a gaming diary, rate titles, and see what is trending in the community, all wrapped in a premium interface with an "Apple Liquid Glass" aesthetic.

## 2. User Profile & Personas
* **The Completionist:** Wants to log every beaten game, rate it, and save it for posterity.
* **The Multi-platform Gamer:** Plays on PC, PS5, and Xbox and wants a centralized hub for their gamer identity.
* **The Critic:** Enjoys writing detailed reviews about their experiences.

## 3. Functional Specifications (Core Features)

### 3.1 Authentication & User Identity
* **Login:**
    * OAuth via **Google** (Standard).
    * OAuth via **Steam** (Crucial for future library import).
* **User Profile:**
    * Profile Picture and Cover Image (Customizable banner).
    * **Bio:** Short text for personal description.
    * **Platform Badges:** Text fields to manually input PSN ID, Xbox Gamertag, and Steam ID (public display).
    * **Stats:** Counters for rated games, and "Backlog" (Wishlist).

### 3.2 Game Diary (Logging & Reviews)
* **Review Action:** "Log Game" button accessible via search or game page.
* **Rating Fields:**
    * **Score:** 1 to 5 stars (supporting half-stars).
    * **Review:** Text field for critique (Markdown support).
    * **Platform Played:** Dropdown (PC, PS4, PS5, Xbox One, Xbox Series, Switch, Steam Deck).
    * **Date:** Completion date or current date.
* **Interaction:** Other users can "Like" reviews.

### 3.3 Home Page (Discovery)
* **Hero Section:** "Trending" Games (carousel based on recent review volume).
* **Recent Feed:** Infinite scroll of recent reviews from the global community.
* **Aesthetic:** Heavy use of high-resolution game covers with glassmorphism effects overlaid.

### 3.4 Game Detail View
* **Header:** Cover art, Title, Developer, Release Year.
* **Metadata:** Genres (RPG, FPS, Indie, etc.), Average Playtime (via API integration if available).
* **Live Pricing:** Card displaying current or base price on major stores (Steam, PS Store, MS Store) using aggregator APIs.
* **Global Score:** Arithmetic mean of user ratings on BackToLobby.
* **Review Section:** List of reviews for that specific game with filters.

## 4. Technical Requirements & Architecture

### 4.1 Recommended Tech Stack
* **Frontend:** Next.js 14+ (App Router), React, Lucide Icons.
* **Styling:** Tailwind CSS.
* **Backend/BaaS:** Supabase (PostgreSQL, Auth, Realtime).
* **State/Data Fetching:** TanStack Query (React Query).

### 4.2 API Integrations (External Data)
1.  **IGDB API (Twitch):** Primary source of truth for the game database (Covers, IDs, Genres, Developers).
    * *Note:* Must be implemented via server-side (Next.js API Routes) to protect API keys.
2.  **CheapShark or IsThereAnyDeal API:** To fetch current pricing and deals.
3.  **Steam Web API:** For social authentication.

### 4.3 Design System: "Apple Liquid Glass"
Development must strictly prioritize the following aesthetic:
* **Glassmorphism:** Extensive use of `backdrop-filter: blur(md/lg/xl)`, transparent backgrounds (`bg-white/10` or `bg-black/20`), and translucent borders (`border-white/10`).
* **Palette:** Deep dark background (Native Dark Mode) with vibrant/neon color accents (gradient mesh) that evoke gaming but maintain Apple-like sophistication.
* **Typography:** Clean Sans-serif fonts (Inter or San Francisco). Bold titles, legible body text.
* **Components:** Floating cards, soft diffused shadows (`shadow-2xl` with colors), expressive rounded corners (`rounded-2xl` or `3xl`).

## 5. Data Structure (Simplified Supabase Schema)

* `users`: id (uuid), username, avatar_url, bio, steam_id, psn_id, xbox_id, created_at.
* `games`: id (int8), igdb_id (unique), title, cover_url, slug, genres (array). *Table populated on-demand for caching.*
* `reviews`: id (uuid), user_id (fk), game_id (fk), rating (float), comment (text), platform_played, created_at.
* `likes`: user_id (fk), review_id (fk).

## 6. Development Milestones (Roadmap)
1.  **Setup:** Initialize Next.js + Supabase + Tailwind Configuration (Glass Theme).
2.  **Data Layer:** Create integration services with IGDB and UI components for "Game Card".
3.  **Auth & Profile:** Implement Login (Google/Steam) and editable profile page.
4.  **Core Loop:** Implement flow: Search Game -> Write Review -> Save to DB.
5.  **Game Page:** Dynamic game detail page with pricing.
6.  **Polish:** Visual refinement (animations, blur, responsiveness) and Home Page with Trending.