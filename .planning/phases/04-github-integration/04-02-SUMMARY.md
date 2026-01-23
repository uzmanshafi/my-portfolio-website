---
phase: 04-github-integration
plan: 02
subsystem: auth
tags: [github, oauth, next-auth, encryption]

# Dependency graph
requires:
  - phase: 04-01
    provides: GitHub module with encryption, Octokit client, GitHubConnection schema
provides:
  - GitHub OAuth provider in Auth.js
  - GitHub connection server actions
  - GitHub settings dashboard page
affects: [04-03, 04-04, 04-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "OAuth linkAccount event for token storage"
    - "Singleton pattern with fixed ID for GitHub connection"
    - "Server action auth check before database access"

key-files:
  created:
    - src/lib/actions/github.ts
    - src/app/backstage/dashboard/github/page.tsx
    - src/app/backstage/dashboard/github/github-settings.tsx
  modified:
    - src/lib/auth.ts
    - src/lib/auth.config.ts
    - src/components/admin/sidebar.tsx

key-decisions:
  - "GitHub OAuth scopes: read:user user:email repo for private repo access"
  - "linkAccount event for token capture (fires after OAuth callback)"
  - "Singleton connection with fixed ID 'github-connection'"
  - "Page reload after disconnect to refresh server state"

patterns-established:
  - "OAuth token capture via linkAccount event callback"
  - "Dynamic import in Auth.js events for server actions"

# Metrics
duration: 4min
completed: 2026-01-23
---

# Phase 4 Plan 2: GitHub OAuth Provider Summary

**GitHub OAuth flow with repo scope, encrypted token storage, and dashboard connection management UI**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-23T05:18:38Z
- **Completed:** 2026-01-23T05:22:32Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- GitHub OAuth provider configured in Auth.js with read:user, user:email, repo scopes
- Server actions for connection management (get, store, disconnect, getToken)
- Dashboard page at /backstage/dashboard/github with connect/disconnect UI
- Sidebar navigation includes GitHub link

## Task Commits

Each task was committed atomically:

1. **Task 1: Add GitHub OAuth provider to Auth.js** - `279e3fe` (feat)
2. **Task 2: Create GitHub connection server actions** - `90b45da` (feat)
3. **Task 3: Create GitHub settings page and UI** - `b23185a` (feat)

## Files Created/Modified
- `src/lib/auth.config.ts` - Added GitHub provider stub for Edge compatibility
- `src/lib/auth.ts` - Full GitHub OAuth config with token capture and linkAccount event
- `src/lib/actions/github.ts` - Server actions: getGitHubConnection, storeGitHubConnection, disconnectGitHub, getGitHubAccessToken
- `src/app/backstage/dashboard/github/page.tsx` - Server component loading connection status
- `src/app/backstage/dashboard/github/github-settings.tsx` - Client component with connect/disconnect buttons
- `src/components/admin/sidebar.tsx` - Added GitHub nav item

## Decisions Made
- **OAuth scopes:** Using read:user, user:email, repo to access private repositories
- **linkAccount event:** Token captured when GitHub account linked to existing session (after credentials login)
- **Singleton pattern:** Fixed ID "github-connection" for single admin's connection
- **Page reload on disconnect:** Ensures server-fetched connection status refreshes

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Regenerated Prisma client for GitHubConnection model**
- **Found during:** Task 2 (server actions creation)
- **Issue:** Prisma client didn't have GitHubConnection type (schema added in 04-01)
- **Fix:** Ran `npx prisma generate` to regenerate client
- **Files modified:** src/generated/prisma/
- **Verification:** TypeScript compilation passed
- **Committed in:** Part of Task 2 commit (generated files not committed)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix necessary for compilation. No scope creep.

## Issues Encountered
None

## User Setup Required

**External services require manual configuration.** GitHub OAuth requires:
- Create OAuth App at GitHub Settings -> Developer settings -> OAuth Apps
- Set callback URL: http://localhost:3000/api/auth/callback/github
- Add environment variables:
  - `AUTH_GITHUB_ID` - Client ID from OAuth App
  - `AUTH_GITHUB_SECRET` - Client secret from OAuth App

## Next Phase Readiness
- GitHub OAuth provider ready for use
- Connection management UI complete
- Next plan (04-03) will add repository fetching and selection
- Requires GitHub OAuth app credentials configured before testing

---
*Phase: 04-github-integration*
*Completed: 2026-01-23*
