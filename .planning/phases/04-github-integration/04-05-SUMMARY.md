---
phase: 04-github-integration
plan: 05
subsystem: github-sync
tags: [cron, sync, vercel, octokit, server-actions]
dependency-graph:
  requires: [04-04]
  provides: [background-sync, field-reset-ui]
  affects: []
tech-stack:
  added: []
  patterns: [vercel-cron, cron-secret-auth]
key-files:
  created:
    - src/app/api/cron/sync-github/route.ts
    - vercel.json
  modified:
    - src/lib/actions/github.ts
    - src/components/admin/project-form-modal.tsx
decisions:
  - Daily sync at 4 AM UTC via Vercel Cron
  - CRON_SECRET Bearer token authentication
  - Hidden (visible: false) for 404/403 repos
  - customizedFields respected during sync
metrics:
  duration: 2 min
  completed: 2026-01-23
---

# Phase 4 Plan 5: Background Sync & Per-field Reset Summary

**One-liner:** Vercel Cron daily sync respecting customizedFields with per-field reset UI

## What Was Built

### 1. Background Sync Actions (src/lib/actions/github.ts)

**syncGitHubProjects():**
- Fetches all projects where `isGitHubSynced: true`
- For each project, calls GitHub API to get current repo data
- Respects `customizedFields` array - skips updating title/description if in that array
- Always updates non-customizable fields: stars, forks, language
- On 404/403 error: sets `visible: false` to hide orphaned projects
- Records `lastSyncAt` and `syncError` on GitHubConnection

**resetProjectFieldToGitHub():**
- Takes projectId and field ('title' | 'description')
- Fetches current value from GitHub API
- Updates project with GitHub value
- Removes field from customizedFields array
- Revalidates projects page

### 2. Vercel Cron Endpoint (src/app/api/cron/sync-github/route.ts)

- GET endpoint protected by CRON_SECRET Bearer token
- Returns 401 for unauthorized requests
- Returns 500 if CRON_SECRET not configured
- Calls syncGitHubProjects() and returns JSON result:
  ```json
  { "success": true, "synced": 5, "hidden": 1 }
  ```

### 3. Cron Configuration (vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-github",
      "schedule": "0 4 * * *"
    }
  ]
}
```
Runs daily at 4:00 AM UTC.

### 4. Per-field Reset UI (project-form-modal.tsx)

- Reset buttons appear next to Title and Description fields
- Only shown for GitHub-synced projects with that field in customizedFields
- Calls resetProjectFieldToGitHub action
- Shows loading spinner during reset
- Toast notification on success/failure
- Updates form value to reflect restored GitHub value

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Daily 4 AM UTC sync | Low traffic time, once daily is sufficient for stars/forks updates |
| Bearer token auth | Standard pattern for Vercel Cron, protects from external access |
| Hide vs delete for 404/403 | Preserves project data in case repo is restored or made public again |
| Reset available for title/description only | These are the only fields tracked in customizedFields |

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

1. Generate CRON_SECRET:
   ```bash
   openssl rand -base64 32
   ```

2. Add to environment:
   - **Local:** Add `CRON_SECRET=your-secret` to `.env.local`
   - **Vercel:** Add to project environment variables

3. Deploy to Vercel - cron job starts automatically

4. Test locally:
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/sync-github
   ```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/actions/github.ts` | syncGitHubProjects + resetProjectFieldToGitHub actions |
| `src/app/api/cron/sync-github/route.ts` | Protected cron endpoint |
| `vercel.json` | Cron schedule configuration |
| `src/components/admin/project-form-modal.tsx` | Reset to GitHub buttons |

## Next Phase Readiness

Phase 4 (GitHub Integration) is now complete:
- [x] 04-01: GitHub OAuth connection
- [x] 04-02: Token encryption and client
- [x] 04-03: Repository browser UI
- [x] 04-04: Import repos as projects with customizedFields tracking
- [x] 04-05: Background sync and per-field reset

Ready to proceed to Phase 5 (Public Portfolio).
