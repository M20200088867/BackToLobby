# Dev Log

Session-to-session context for Claude. **Newest first.** Update before every push.

---

## 2026-03-06 — Workflow Rebuild

**What changed:**
- Removed dead code: `card.tsx`, `sheet.tsx`, unused `cacheGame()`, unused `fadeIn` variant
- Created dev workflow infrastructure: DEVLOG.md, `/learn` skill, `/prd` skill, PRD template
- Updated CLAUDE.md with Development Workflow section and corrected Project Overview
- Added `.claude/commands/` and `docs/prds/` to project structure

**Why:** The front-end is stable (v0.7.0). Shifted focus to giving the non-technical founder a repeatable workflow: session context (DEVLOG), codebase education (`/learn`), and formalized feature development (`/prd`).

**Files touched:**
- Deleted: `src/components/ui/card.tsx`, `src/components/ui/sheet.tsx`
- Edited: `src/lib/motion.ts`, `src/lib/supabase/game-cache.ts`, `CLAUDE.md`
- Created: `DEVLOG.md`, `.claude/commands/learn.md`, `.claude/commands/prd.md`, `docs/prds/_template.md`
