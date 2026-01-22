# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-22)

**Core value:** The portfolio must beautifully showcase work and be effortlessly updatable through the admin dashboard — if updating content feels like a chore, the system has failed.
**Current focus:** Phase 3 - Data Layer

## Current Position

Phase: 3 of 6 (Data Layer + Admin CRUD)
Plan: 6 of 7 complete in current phase (03-01, 03-02, 03-03, 03-04, 03-05, 03-06)
Status: In progress
Last activity: 2026-01-22 — Completed 03-02-PLAN.md

Progress: [█████████░] 90%

## Performance Metrics

**Velocity:**
- Total plans completed: 10
- Average duration: 12.9 min
- Total execution time: 2.15 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 2 | 12 min | 6 min |
| 2 | 2 | 7 min | 3.5 min |
| 3 | 6 | 109 min | 18.2 min |

**Recent Trend:**
- Last 5 plans: 03-06 (8 min), 03-03 (15 min), 03-04 (15 min), 03-02 (62 min)
- Trend: Variable (03-02 longer due to Zod v4 compat fixes)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Phase structure: 6 phases following research recommendations (Foundation → Auth → Data Layer → GitHub → Public → Polish)
- Requirements coverage: All 51 v1 requirements mapped to phases with no orphans
- PostgreSQL port: Using 5434 to avoid conflicts with other local instances
- Design system: CSS variables defined in globals.css (--color-text, --color-background, --color-primary, --color-secondary, --color-accent)
- Prisma 7 config: URL in prisma.config.ts using env() helper, not schema.prisma
- Environment loading: .env.local (secrets) loaded before .env (defaults)
- Prisma client output: src/generated/prisma for @/ path alias imports
- Auth.js v5: JWT session strategy, split config pattern for Edge compatibility
- Password hashing: Argon2id with RFC 9106 recommended parameters
- Admin credentials: Environment-based (ADMIN_EMAIL, ADMIN_PASSWORD_HASH)
- Route protection: 404 rewrite for unauthenticated backstage access (hide admin routes)
- Layered defense: Middleware (Layer 1) + Dashboard layout session check (Layer 2)
- Server actions: Located in src/lib/actions/ directory
- Supabase clients: Server uses service role key for storage (not cookies), browser uses anon key
- ActionResult<T>: Standard type for server action responses
- Resume uploads: Single active resume at a time, new uploads deactivate previous
- File upload pattern: client validation -> signed URL -> direct upload -> database record
- Contact singleton: Uses findFirst/upsert pattern for single contact record
- Social links ordering: order field with bulk $transaction updates for reordering
- Dynamic Lucide icons: Store lowercase icon names, convert to PascalCase for lookup
- Skills grouped by category: GroupedSkills type (array of category + skills[])
- Category order persistence: Uses order ranges (1000 per category) for sorting
- Nested drag contexts: Outer SortableContext for categories, inner for skills
- Project image upload: Direct client-to-Supabase upload, then update project record
- Project ordering: Global order field (not per-category like skills)
- Bio singleton: Fixed ID "main" for single bio record with upsert pattern
- Signed URL uploads: Server generates URL, client uploads directly to Supabase
- Toast notifications: Toaster from sonner added to root layout

### Pending Todos

None yet.

### Blockers/Concerns

User must configure Supabase environment variables and create storage bucket before file uploads work.

## Session Continuity

Last session: 2026-01-22T15:35:10Z
Stopped at: Completed 03-02-PLAN.md
Resume file: None

---
*State initialized: 2026-01-22*
*Last updated: 2026-01-22*
