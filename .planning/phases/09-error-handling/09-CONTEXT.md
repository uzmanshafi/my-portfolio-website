# Phase 9: Error Handling - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Data fetch failures display a branded, recoverable error page instead of crashing. Covers database, storage, and external API failures. Both public portfolio and admin dashboard use the same visual design with context-appropriate messaging.

</domain>

<decisions>
## Implementation Decisions

### Error page layout
- Minimal centered design — icon + message + button, vertically centered, lots of whitespace
- Connection icon (Lucide Unplug or WifiOff) at top to suggest connectivity issue
- Friendly apologetic tone — "Oops! Something went wrong. We're working on it."
- Just retry button — no contact links or social fallbacks on error page

### Recovery behavior
- Full page reload on retry — window.location.reload(), simple and clears all state
- Immediate reload — no intermediate loading state when clicking retry
- Same error page on repeated failure — user can keep trying, no escalated messaging
- R key triggers retry (keyboard shortcut for power users)

### Error scope
- All data failures trigger error page — database, Supabase storage, external APIs
- Both public and admin use branded error page, but admin gets more technical details visible on page
- Any section failure shows full error page — no partial rendering with broken sections
- 404 uses same branded error page design (different message)

### Developer experience
- Structured error object in browser console — JSON with error type, message, timestamp, context
- Admin sees error details on page, public sees clean user-friendly page only
- Descriptive error names — DatabaseConnectionError, StorageFetchError, etc.
- Server-side structured logging — JSON format with timestamp, error type, context for Render logs

### Claude's Discretion
- Exact icon choice from Lucide connection family
- Error message copy refinement
- JSON structure for console/server logs
- Error boundary implementation details

</decisions>

<specifics>
## Specific Ideas

- Design system colors per success criteria: #160f09 background, #f3e9e2 text
- R key shortcut for retry is a nice touch for developers/power users testing the site

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-error-handling*
*Context gathered: 2026-01-26*
