# Portfolio Website Redesign

## What This Is

A complete redesign of a personal developer portfolio website, transforming it from a static HTML site into a modern full-stack application with an admin dashboard. The portfolio showcases projects (pulled from GitHub), skills, bio, and contact information — all managed through a custom CMS interface.

## Core Value

The portfolio must beautifully showcase work and be effortlessly updatable through the admin dashboard — if updating content feels like a chore, the system has failed.

## Current Milestone: v1.1 Polish

**Goal:** Optimize user experience with instant updates, better error handling, loading states, SEO, and tech icons.

**Target features:**
- Instant cache revalidation after admin saves
- Branded error boundaries with retry
- Loading skeletons with shimmer effect
- SEO metadata with Open Graph and JSON-LD
- Programming language icons with visual picker

## Requirements

### Validated

<!-- v1.0 complete — 51 requirements shipped -->

- ✓ Authentication (login, session persistence, logout) — v1.0
- ✓ Admin Dashboard (navigation, CRUD for all content, visual feedback) — v1.0
- ✓ Bio/About Management (text editing, image upload, instant reflection) — v1.0
- ✓ Skills Management (add, remove, reorder, categorize) — v1.0
- ✓ Projects Management (CRUD, reorder, visibility toggle) — v1.0
- ✓ Resume Management (upload, replace, download) — v1.0
- ✓ Contact/Social Management (email, social links, copy functionality) — v1.0
- ✓ GitHub Integration (OAuth, repo browser, sync, customization) — v1.0
- ✓ Public Portfolio Display (hero, about, skills, projects, contact) — v1.0
- ✓ Visual Design (dark palette, bento grid, glassmorphism, grain, icons) — v1.0
- ✓ Animations (scroll triggers, text reveal, 3D tilt, transitions, a11y) — v1.0
- ✓ Technical Foundation (Next.js 15, PostgreSQL, Prisma, Motion, Auth.js) — v1.0

### Active

<!-- v1.1 scope — building toward these -->

**Cache Revalidation:**
- [ ] Instant public page updates after admin saves
- [ ] Visual feedback confirming content is live

**Error Handling:**
- [ ] Branded error page for data fetch failures
- [ ] Retry button and error logging

**Loading States:**
- [ ] Skeleton loading matching page layout
- [ ] Shimmer animation effect

**SEO Metadata:**
- [ ] Open Graph and Twitter Card tags
- [ ] JSON-LD Person schema

**Programming Language Icons:**
- [ ] Tech-specific icons for skills
- [ ] Visual icon picker in admin

### Out of Scope

- Blog/articles section — not requested, adds complexity
- Multiple user accounts — single admin only
- Comments/guestbook — portfolio is one-way showcase
- E-commerce/payments — not a store
- Contact form with backend — existing email copy is sufficient
- Dark/light mode toggle — committing to dark theme
- Multi-language support — English only
- Per-section Suspense — requires data layer refactor, defer to v1.2
- Dynamic OG image generation — static image sufficient
- Original brand colors for icons — monochrome matches design

## Context

**Current State (v1.0 complete):**
- Next.js 15.5+ with App Router, fully deployed
- PostgreSQL with Prisma 7, all models implemented
- Auth.js v5 with credentials provider
- Admin dashboard with full CRUD for all content
- GitHub OAuth integration with repo sync
- Public portfolio with bento grid, glassmorphism, animations
- Motion for React with scroll triggers and 3D tilt
- ISR caching with 60-second revalidation

**v1.1 Focus:**
- Polish and optimization (not new features)
- Better developer experience (instant updates)
- Better user experience (loading states, error handling)
- Better discoverability (SEO)
- Better skill display (tech icons)

## Constraints

- **Tech Stack**: Next.js, Prisma, PostgreSQL, Motion for React — established
- **Icons**: Lucide for UI + devicons-react for tech logos
- **Hosting**: Render.com (deployment config ready)
- **Auth**: Admin-only, single user
- **Design**: Dark warm palette, consistent with v1.0

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js over static HTML | Need server-side for admin dashboard and API routes | ✓ Good |
| PostgreSQL over SQLite | Production-ready, works well with Render/Railway | ✓ Good |
| Prisma as ORM | Type-safe, excellent DX, migrations built-in | ✓ Good |
| Motion for React | Physics-based, React-native, great API | ✓ Good |
| Single admin user | Portfolio is personal, no need for multi-user | ✓ Good |
| GitHub API integration | Pull real repo data rather than manual entry | ✓ Good |
| devicons-react for tech icons | 150+ tech icons, tree-shakeable, TS-first | — Pending |
| Page-level loading.tsx | Simpler than granular Suspense, no refactor needed | — Pending |
| Static OG image | Simpler than dynamic generation, sufficient for portfolio | — Pending |

---
*Last updated: 2026-01-25 after v1.1 milestone initialization*
