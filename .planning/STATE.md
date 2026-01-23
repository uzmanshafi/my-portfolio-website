# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-22)

**Core value:** The portfolio must beautifully showcase work and be effortlessly updatable through the admin dashboard — if updating content feels like a chore, the system has failed.
**Current focus:** Phase 5 - Public Portfolio

## Current Position

Phase: 5 of 6 (Public Portfolio)
Plan: 5 of 7 complete in current phase (05-01, 05-02, 05-03, 05-04, 05-05)
Status: In progress
Last activity: 2026-01-23 - Completed 05-05-PLAN.md

Progress: [█████████░] 91% (21/23 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 21
- Average duration: 9.4 min
- Total execution time: 3.2 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 2 | 12 min | 6 min |
| 2 | 2 | 7 min | 3.5 min |
| 3 | 7 | 114 min | 16.3 min |
| 4 | 5 | 20 min | 4 min |
| 5 | 5 | 41 min | 8.2 min |

**Recent Trend:**
- Last 5 plans: 05-05 (8 min), 05-04 (9 min), 05-02 (10 min), 05-03 (6 min), 05-01 (8 min)
- Trend: Building public portfolio sections

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Phase structure: 6 phases following research recommendations (Foundation -> Auth -> Data Layer -> GitHub -> Public -> Polish)
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
- UnsavedChangesContext: Global dirty state tracking for sidebar navigation
- DashboardShell: Client wrapper pattern for server layout with providers
- GitHub token encryption: jose AES-256-GCM with key from AUTH_SECRET
- Octokit throttling: Retry twice on rate limit, no retry on secondary limit
- GitHub module: Barrel export at @/lib/github
- GitHub OAuth scopes: read:user user:email repo for private repo access
- GitHub connection singleton: Fixed ID "github-connection" for single admin
- OAuth token capture: linkAccount event fires after OAuth callback
- Repo browser filtering: Client-side filter after fetching 100 repos (GitHub search API limitations)
- Repo pagination: Load More pattern with 12 repos per page
- customizedFields tracking: Store array of field names edited on synced projects for sync protection
- Vercel Cron sync: Daily 4 AM UTC via /api/cron/sync-github with CRON_SECRET auth
- Per-field reset: Reset to GitHub buttons for customized title/description fields
- Public data layer: Direct Prisma queries in src/lib/data/ (not server actions) for read-only operations
- ISR revalidation: 60 seconds for portfolio page freshness/performance balance
- AboutSection: Two-column desktop layout (image left, text right), gradient placeholder for missing images
- HeroSection: CSS-only geometric shapes for decoration, inline hover styles for CSS variable transitions
- Bento grid sizing: Card sizes via className prop from parent, 8-position repeating pattern
- Featured projects: Prioritized for large card treatment in first 3 grid positions

### Pending Todos

None yet.

### Blockers/Concerns

User must configure Supabase environment variables and create storage bucket before file uploads work.
User must configure GitHub OAuth app and add AUTH_GITHUB_ID/AUTH_GITHUB_SECRET before GitHub integration works.
User must set CRON_SECRET environment variable for background sync to work.

## Session Continuity

Last session: 2026-01-23T16:43:29Z
Stopped at: Completed 05-05-PLAN.md
Resume file: None

---
*State initialized: 2026-01-22*
*Last updated: 2026-01-23*
