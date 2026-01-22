# Phase 2: Authentication - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin can securely access dashboard with session persistence and proper authorization checks. Single admin user authenticated via email/password using Auth.js v5. No public signup, no password reset flow, no multi-user support.

</domain>

<decisions>
## Implementation Decisions

### Login Experience
- Split layout: form on one side, portfolio preview on the other
- Match dark theme colors (#160f09 bg, #f3e9e2 text)
- Error messages shown as toast/banner at top of form
- "Remember me" checkbox: checked = 7 days, unchecked = browser session only
- Button shows spinner during login (form disabled)
- Password visibility toggle (eye icon)
- After successful login: redirect to dashboard home (not intended page)

### Session Behavior
- With "Remember me": 7-day session
- Without "Remember me": browser session only (logged out when tabs closed)
- Sliding window: each activity resets the 7-day timer
- Session expiry mid-use: modal prompt to re-login (preserves context)

### Protected Routes
- Login page lives at `/backstage` (secret URL)
- All admin routes under `/backstage/*` (e.g., `/backstage/projects`, `/backstage/bio`)
- Unauthenticated access to `/backstage/*` returns 404 (pretend routes don't exist)
- No hints on public site that admin exists (completely hidden)

### Admin Identity
- Single admin only (no multi-user support)
- Credentials stored in environment variables (ADMIN_EMAIL, ADMIN_PASSWORD_HASH)
- No password change from dashboard (requires .env update and redeploy)
- No email change from dashboard (fixed in env)

### Claude's Discretion
- Exact split layout proportions
- Toast/banner positioning and animation
- Modal prompt design for session expiry
- Loading state implementation details

</decisions>

<specifics>
## Specific Ideas

- Portfolio preview on login page should give a glimpse of the public portfolio design
- The hidden admin approach prioritizes security through obscurity as an additional layer
- Keep it simple: single admin, env-based config, no self-service account management

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-authentication*
*Context gathered: 2026-01-22*
