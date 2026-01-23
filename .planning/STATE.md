# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-22)

**Core value:** The portfolio must beautifully showcase work and be effortlessly updatable through the admin dashboard — if updating content feels like a chore, the system has failed.
**Current focus:** Phase 4 - GitHub Integration (COMPLETE)

## Current Position

Phase: 4 of 6 (GitHub Integration)
Plan: 5 of 5 complete in current phase (04-05)
Status: Phase complete
Last activity: 2026-01-23 - Completed 04-05-PLAN.md

Progress: [████████░░] 80% (16/20 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 16
- Average duration: 9.8 min
- Total execution time: 2.55 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 2 | 12 min | 6 min |
| 2 | 2 | 7 min | 3.5 min |
| 3 | 7 | 114 min | 16.3 min |
| 4 | 5 | 20 min | 4 min |

**Recent Trend:**
- Last 5 plans: 04-05 (2 min), 04-04 (3 min), 04-03 (3 min), 04-02 (4 min), 04-01 (8 min)
- Trend: Fast (GitHub integration with focused scope)

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

### Pending Todos

None yet.

### Blockers/Concerns

User must configure Supabase environment variables and create storage bucket before file uploads work.
User must configure GitHub OAuth app and add AUTH_GITHUB_ID/AUTH_GITHUB_SECRET before GitHub integration works.
User must set CRON_SECRET environment variable for background sync to work.

## Session Continuity

Last session: 2026-01-23T05:46:11Z
Stopped at: Completed 04-05-PLAN.md (Phase 4 complete)
Resume file: None

---
*State initialized: 2026-01-22*
*Last updated: 2026-01-23*
