---
phase: 04-github-integration
plan: 01
subsystem: api
tags: [octokit, github, prisma, jose, encryption]

# Dependency graph
requires:
  - phase: 03-data-layer-admin
    provides: Project model with basic GitHub fields (githubId, stars, forks, language)
provides:
  - GitHubConnection model for OAuth token storage
  - Extended Project model with sync tracking fields
  - Octokit client factory with rate limiting
  - Token encryption utilities using jose
affects: [04-02, 04-03, 04-04, 04-05, 04-06, 04-07]

# Tech tracking
tech-stack:
  added: [octokit]
  patterns: [token encryption with jose, Octokit client factory]

key-files:
  created:
    - src/lib/github/client.ts
    - src/lib/github/types.ts
    - src/lib/github/encryption.ts
    - src/lib/github/index.ts
  modified:
    - prisma/schema.prisma
    - package.json

key-decisions:
  - "Encryption key derived from AUTH_SECRET (first 32 chars, padded)"
  - "AES-256-GCM via jose EncryptJWT for token encryption"
  - "Octokit throttling: retry twice on rate limit"

patterns-established:
  - "GitHub module barrel export at @/lib/github"
  - "RepoListItem transformer for API response simplification"

# Metrics
duration: 8min
completed: 2026-01-23
---

# Phase 04 Plan 01: GitHub Infrastructure Summary

**GitHubConnection model, Octokit client with throttling, and jose-based token encryption for secure OAuth storage**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-23T10:40:00Z
- **Completed:** 2026-01-23T10:48:00Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- GitHubConnection model added to Prisma schema with accessToken, username, avatarUrl, connectedAt, lastSyncAt, syncError
- Project model extended with githubFullName, isGitHubSynced, customizedFields, lastSyncedAt fields
- createGitHubClient factory creates authenticated Octokit with throttling and rate limit retry
- encryptToken/decryptToken utilities using jose AES-256-GCM encryption

## Task Commits

Each task was committed atomically:

1. **Task 1: Install octokit and extend Prisma schema** - `2ffa5f9` (feat)
2. **Task 2: Create GitHub client factory and types** - `c755406` (feat)
3. **Task 3: Create token encryption utilities** - `7e533e4` (feat)

## Files Created/Modified
- `prisma/schema.prisma` - Added GitHubConnection model, extended Project with sync fields
- `package.json` - Added octokit dependency
- `src/lib/github/client.ts` - Octokit client factory with throttling
- `src/lib/github/types.ts` - GitHubUser, GitHubRepo, RepoListItem types and transformer
- `src/lib/github/encryption.ts` - Token encryption/decryption with jose
- `src/lib/github/index.ts` - Barrel export for github module

## Decisions Made
- Encryption key derived from AUTH_SECRET environment variable (first 32 chars, padded to 32 if shorter)
- Using jose EncryptJWT with dir/A256GCM algorithm for token encryption
- Octokit throttle callbacks retry twice on primary rate limit, never retry on secondary rate limit
- Added explicit TypeScript types to Octokit throttle callbacks to satisfy strict mode

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript implicit any errors in Octokit throttle callbacks**
- **Found during:** Task 2 (Create GitHub client factory)
- **Issue:** Octokit throttle callback parameters had implicit any types, TypeScript strict mode rejected them
- **Fix:** Added explicit type annotations: `retryAfter: number`, `_options: object`, `octokit: Octokit`, `retryCount: number`
- **Files modified:** src/lib/github/client.ts
- **Verification:** `npx tsc --noEmit` passes without errors
- **Committed in:** c755406 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** TypeScript type fix necessary for strict mode compliance. No scope creep.

## Issues Encountered
None - plan executed as specified with minor TypeScript adjustment.

## User Setup Required
None - no external service configuration required. AUTH_SECRET already configured from Phase 2.

## Next Phase Readiness
- GitHubConnection model ready for OAuth flow (04-02)
- Octokit client factory ready for API calls
- Token encryption ready for secure storage
- All GitHub utilities importable from @/lib/github

---
*Phase: 04-github-integration*
*Completed: 2026-01-23*
