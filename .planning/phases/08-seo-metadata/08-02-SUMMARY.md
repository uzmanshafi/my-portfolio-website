---
phase: 08
plan: 02
subsystem: admin-dashboard
tags: [seo, image-cropper, admin-ui, supabase-storage]

dependency_graph:
  requires: ["08-01"]
  provides: ["admin-seo-section", "configurable-image-cropper"]
  affects: ["08-03"]

tech_stack:
  added: []
  patterns: ["configurable-cropper-props", "character-counter-inputs"]

key_files:
  created:
    - src/app/backstage/dashboard/seo/page.tsx
  modified:
    - src/components/admin/sidebar.tsx
    - src/components/admin/image-cropper.tsx
    - src/app/backstage/dashboard/seo/seo-manager.tsx

decisions:
  - id: og-image-folder
    choice: "og-images subfolder in portfolio-assets bucket"
    why: "Keeps OG images organized separately from profile images"

metrics:
  duration: "~8 min"
  completed: "2026-01-26"
---

# Phase 8 Plan 02: Admin SEO Section Summary

Admin dashboard SEO section with OG image upload (1200x630 cropping) and text field editing with character counters.

## What Changed

### Sidebar Navigation
Added SEO nav item with Settings icon, positioned after Contact and before GitHub. Routes to `/backstage/dashboard/seo`.

### ImageCropper Enhancement
Made aspect ratio and crop shape configurable via props:
- `aspect?: number` - defaults to 1 (square) for backward compatibility
- `cropShape?: "round" | "rect"` - defaults to "round" for profile images

Profile image cropping unchanged (uses defaults). OG images use `aspect={1200/630}` and `cropShape="rect"`.

### SEO Admin Page
Server component (`page.tsx`) fetches SEO settings and passes to client component. Follows bio/page.tsx pattern.

### SeoManager Client Component
Full-featured SEO editing form with:

**OG Image Upload:**
- Preview area showing 1200x630 aspect ratio
- ImageCropper integration with rectangular crop
- Upload to Supabase Storage (`og-images/` folder)
- Toast notification: "OG image now live"

**Text Fields:**
- SEO Title: max 60 characters with live counter
- SEO Description: max 160 characters with live counter
- Placeholder text shows fallback behavior
- maxLength enforced on inputs

**Form Behavior:**
- Dirty state tracking comparing to initial values
- useUnsavedChanges hook for navigation warning
- Disabled save button when no changes or saving
- Toast notification: "SEO settings now live"

## Files Changed

| File | Change |
|------|--------|
| src/components/admin/sidebar.tsx | Added SEO nav item with Settings icon |
| src/components/admin/image-cropper.tsx | Added aspect and cropShape props |
| src/app/backstage/dashboard/seo/page.tsx | Created server component |
| src/app/backstage/dashboard/seo/seo-manager.tsx | Full implementation (was placeholder) |

## Verification Results

- [x] SEO appears in sidebar navigation
- [x] ImageCropper accepts aspect prop
- [x] SEO admin page renders without errors
- [x] OG image uses 1200x630 aspect ratio cropping
- [x] seoTitle and seoDescription fields have character counters
- [x] Form calls updateSeoSettings and updateOgImage actions
- [x] TypeScript compiles: `npx tsc --noEmit`

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Message |
|------|---------|
| 423c754 | feat(08-02): add SEO to sidebar and configurable ImageCropper |
| 977c7ac | feat(08-02): create SEO admin page with OG image upload |

## Next Phase Readiness

**Phase 8 Plan 03 can proceed:**
- SEO settings are now editable via admin dashboard
- Next plan (08-03) will integrate SEO data into page metadata
- Homepage will use getSeoSettings for custom title/description/OG image
