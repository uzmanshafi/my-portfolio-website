# Phase 4: GitHub Integration - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin can connect GitHub account, browse repositories, and sync selected projects with automatic metadata. Covers OAuth authentication with GitHub, repository browsing with search/filter, selecting repos to feature, auto-pulling core metadata, and customizing synced projects. Public portfolio display of GitHub projects is Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Repository Display
- Card grid layout for browsing repos (not compact list)
- Each card shows essential info only: name, description, stars, primary language
- Paginated loading (20-30 repos per page)
- Search by name plus filters (language, stars, visibility)

### Sync Behavior
- Background refresh (auto-sync periodically, e.g., daily)
- Auto-pull core fields only: name, description, stars, primary language
- Never overwrite admin-customized fields (once edited, stays locked to admin version)
- Auto-hide projects if source repo is deleted or made private on GitHub

### Selection Workflow
- Checkbox selection on repo cards + "Add Selected" button
- No limit on number of featured GitHub projects
- GitHub-synced projects mixed together with manual projects in one list (ordered by drag-and-drop)
- Toggle off to hide from portfolio (keeps link, can re-add later from GitHub list)

### Override/Customize
- All fields editable: name, description, image, links — everything customizable
- GitHub badge/icon visible on synced project cards (distinguishes from manual projects)
- Custom image upload OR pull repo's Open Graph/social preview image from GitHub
- Per-field "Reset to GitHub" option to restore individual customized fields

### Claude's Discretion
- Exact refresh frequency for background sync
- OAuth flow UI details
- Caching strategy for rate limit handling
- Loading states and error handling

</decisions>

<specifics>
## Specific Ideas

- Repos should feel browsable like the existing projects page — card grid with quick selection
- Once a field is customized, treat it as "admin's version" and don't touch it during sync
- GitHub projects should visually integrate with manual projects but have a clear badge

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-github-integration*
*Context gathered: 2026-01-22*
