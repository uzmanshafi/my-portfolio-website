# Phase 3: Data Layer + Admin CRUD - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin can manage all portfolio content through intuitive dashboard forms with immediate persistence. Covers 5 content sections: Bio, Skills, Projects, Resume, Contact. Each section needs CRUD operations, forms with validation, and feedback. Public portfolio display is Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Navigation
- Persistent left sidebar with section links (Bio, Skills, Projects, Resume, Contact)
- Mobile: hamburger menu that opens as overlay
- Dashboard home shows quick overview: stats summary (X projects, Y skills) + quick links
- Unsaved changes indicator: small dot next to section name in sidebar

### Form Behavior & Feedback
- Manual save button (explicit user action to persist)
- Toast notifications for save success/error (using sonner, already installed)
- Validation timing: on blur + on submit
- Unsaved changes warning modal when navigating away: "You have unsaved changes. Leave anyway?"

### Drag-and-Drop Reordering
- Drag handle icon on each skill/project item
- Reorder persists immediately on drop (optimistic update)
- Skills: reorderable within category only (can't drag across categories)
- Categories themselves are reorderable (admin controls category display order)
- Projects: globally reorderable

### File Uploads
- Storage: Supabase Storage (already using Supabase for future-proofing)
- Profile image: click to select + preview before saving
- Profile image processing: crop to square (1:1 aspect ratio with crop UI)
- Size limits: 5MB for images, 10MB for PDF resume
- Clear error messages when limits exceeded

### Claude's Discretion
- Exact sidebar styling and icons
- Form field layouts and spacing
- Crop UI implementation details
- Toast positioning and duration
- Loading skeleton designs

</decisions>

<specifics>
## Specific Ideas

- Dashboard should feel minimal and focused — each section on its own page, not cramped
- Reordering should feel instant (optimistic updates) even if server call takes time
- Supabase Storage chosen for cloud scalability and existing ecosystem familiarity

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-data-layer-admin-crud*
*Context gathered: 2026-01-22*
