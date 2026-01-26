# Phase 11: Programming Language Icons - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Skills display recognizable tech logos (Python, React, TypeScript, etc.) with an intuitive icon picker in admin. Icons appear consistently on both admin dashboard and public portfolio. Skills without a matching icon fall back to category-based Lucide icons.

</domain>

<decisions>
## Implementation Decisions

### Icon Library Scope
- Comprehensive dev ecosystem coverage (~150+ icons): languages, frameworks, databases, cloud services, tools
- Use full devicons-react library as-is (no curation)
- Pre-defined categories for organization: Languages, Frameworks, Databases, Cloud, DevOps, Tools

### Icon Picker UX
- Opens as modal/dialog overlay on top of skill form
- Search + category filter combined: type to search across all, click tabs to narrow by category
- Click to select immediately (no preview/confirm step)
- "No icon" or "Use default" option at top of picker to clear selection
- Keyboard navigation: arrow keys to navigate grid, Enter to select, Escape to close
- Responsive grid: more columns on wider screens, fewer on narrow
- Recent icons section: show last 5-10 selected icons at top for quick access
- Recent icons stored in localStorage (browser-only, no backend change)

### Visual Treatment
- Monochrome icons (inherit current text color) for design system cohesion
- Icon size same as skill name text
- No hover effects on public portfolio (skills are static, not interactive)
- Tooltip on hover in picker modal showing icon name ("React", "Python", etc.)

### Fallback Behavior
- Skills without tech icon show category-based Lucide icon (different icon per category)
- Auto-suggest matching icon when skill name matches available icon
- Fuzzy matching: "ReactJS", "React.js", "react" all match React icon
- Auto-select suggested icon (pre-selected, admin can change or confirm with one click)

### Claude's Discretion
- Exact category assignments for icons
- Fuzzy matching algorithm implementation
- Modal sizing and positioning
- Specific Lucide icons for each category fallback

</decisions>

<specifics>
## Specific Ideas

- devicons-react library already identified in PROJECT.md as the icon source
- Categories should feel logical: Languages (Python, JavaScript), Frameworks (React, Vue, Django), Databases (PostgreSQL, MongoDB), Cloud (AWS, GCP), DevOps (Docker, Kubernetes), Tools (Git, VS Code)
- Recent icons feature similar to emoji pickers in Slack/Discord

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-programming-language-icons*
*Context gathered: 2026-01-26*
