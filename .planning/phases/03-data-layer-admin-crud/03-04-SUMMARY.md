---
phase: 03-data-layer-admin-crud
plan: 04
subsystem: ui
tags: [react, dnd-kit, zod, react-hook-form, supabase, prisma]

# Dependency graph
requires:
  - phase: 03-01
    provides: "Prisma Project model, Supabase client setup, storage utilities"
provides:
  - "Projects CRUD server actions"
  - "Project validation schema"
  - "Sortable project item component"
  - "Project form modal with image upload"
  - "Projects management page with drag-drop"
affects: ["04-github-integration", "05-public-pages"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Optimistic updates with useOptimistic for instant feedback"
    - "DndContext with SortableContext for drag-and-drop lists"
    - "Supabase direct upload from client with public URLs"

key-files:
  created:
    - src/lib/validations/project.ts
    - src/lib/actions/projects.ts
    - src/components/admin/sortable-project-item.tsx
    - src/components/admin/project-form-modal.tsx
    - src/app/backstage/dashboard/projects/page.tsx
    - src/app/backstage/dashboard/projects/projects-manager.tsx
  modified: []

key-decisions:
  - "Image upload: Direct client-to-Supabase upload, then update project record"
  - "Visibility toggle: Inline optimistic update with revert on error"
  - "Project order: Global ordering (not per-category like skills)"

patterns-established:
  - "Form modals: react-hook-form with zodResolver, image preview state"
  - "Sortable items: Consistent layout with drag handle, actions, visibility indicator"

# Metrics
duration: 15min
completed: 2026-01-22
---

# Phase 3 Plan 4: Projects Section Summary

**Full projects CRUD with drag-and-drop reordering, visibility toggle, and Supabase image upload**

## Performance

- **Duration:** 15 min
- **Started:** 2026-01-22T14:33:20Z
- **Completed:** 2026-01-22T15:34:56Z
- **Tasks:** 3
- **Files created:** 6

## Accomplishments

- Created project validation schema with Zod for title, description, URLs, technologies
- Implemented 7 server actions: getProjects, createProject, updateProject, deleteProject, updateProjectsOrder, toggleProjectVisibility, updateProjectImage
- Built sortable project card with drag handle, thumbnail, links, featured badge, visibility indicator
- Created project form modal with image upload preview and react-hook-form validation
- Assembled projects management page with DndContext for drag-and-drop reordering
- Added optimistic updates for reorder and visibility toggle operations

## Task Commits

Each task was committed atomically:

1. **Task 1: Create project validation and server actions** - `f0839ec` (feat)
2. **Task 2: Create project form modal and sortable item** - `202aa6d` (feat)
3. **Task 3: Build projects management page** - `bf24d13` (feat)

## Files Created

- `src/lib/validations/project.ts` - Zod schema with ProjectFormData and ProjectFormInput types
- `src/lib/actions/projects.ts` - Server actions for CRUD, reorder, visibility toggle
- `src/components/admin/sortable-project-item.tsx` - Draggable project card with all controls
- `src/components/admin/project-form-modal.tsx` - Modal form with image upload to Supabase
- `src/app/backstage/dashboard/projects/page.tsx` - Server component fetching projects
- `src/app/backstage/dashboard/projects/projects-manager.tsx` - Client component with DndContext

## Decisions Made

- **Image upload flow:** Upload directly to Supabase from client, then call updateProjectImage to store URL in database. This avoids server-side file handling.
- **Form input types:** Created separate ProjectFormInput type for react-hook-form since Zod transforms optional URLs to undefined but form needs string values.
- **Order persistence:** Bulk update all project orders in a transaction to ensure consistency.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - TypeScript compilation passed on first verification for each task.

## User Setup Required

None - this plan uses existing Supabase storage bucket configured in 03-01. Users must have already configured NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.

## Next Phase Readiness

- Projects section fully functional for manual project management
- Ready for Phase 4 GitHub integration to sync repository data
- Public pages (Phase 5) can display projects using getProjects action

---
*Phase: 03-data-layer-admin-crud*
*Completed: 2026-01-22*
