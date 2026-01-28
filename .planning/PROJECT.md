# Portfolio Website Redesign

## What This Is

A complete redesign of a personal developer portfolio website, transforming it from a static HTML site into a modern full-stack application with an admin dashboard. The portfolio showcases projects (pulled from GitHub), skills with tech-specific icons, bio, and contact information — all managed through a custom CMS interface with instant updates and SEO optimization.

## Core Value

The portfolio must beautifully showcase work and be effortlessly updatable through the admin dashboard — if updating content feels like a chore, the system has failed.

## Current State (v1.1 shipped)

- Next.js 15.5+ with App Router, fully deployed on Render.com
- PostgreSQL with Prisma 7, all models implemented
- Auth.js v5 with credentials provider
- Admin dashboard with full CRUD for all content
- GitHub OAuth integration with repository browser and automatic sync
- Public portfolio with bento grid, glassmorphism, Motion animations
- Instant cache revalidation with toast feedback
- Branded error boundaries with retry
- Shimmer skeleton loading states
- SEO metadata with OG/Twitter tags and JSON-LD
- 118 tech icons with searchable picker

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

<!-- v1.1 complete — 19 requirements shipped -->

- ✓ Cache Revalidation (instant updates, toast feedback, revalidatePath) — v1.1
- ✓ Error Handling (branded boundaries, retry button, structured logging) — v1.1
- ✓ Loading States (shimmer skeletons, layout match, accessibility) — v1.1
- ✓ SEO Metadata (OG/Twitter tags, JSON-LD Person schema, 1200x630 image) — v1.1
- ✓ Programming Language Icons (118 devicons, picker modal, auto-suggest) — v1.1

### Active

<!-- Next milestone scope — TBD -->

(Run `/gsd:new-milestone` to define v1.2 scope)

### Out of Scope

- Blog/articles section — not requested, adds complexity
- Multiple user accounts — single admin only
- Comments/guestbook — portfolio is one-way showcase
- E-commerce/payments — not a store
- Contact form with backend — existing email copy is sufficient
- Dark/light mode toggle — committing to dark theme
- Multi-language support — English only
- Per-section Suspense — requires data layer refactor, defer to future
- Dynamic OG image generation — static image sufficient
- Original brand colors for icons — monochrome matches design

## Context

**Codebase:**
- 25,491 lines of TypeScript
- Next.js 15.5+ with App Router
- PostgreSQL with Prisma 7
- Auth.js v5 (credentials + GitHub OAuth)
- Motion for React (animations)
- devicons-react (118 tech icons)
- Deployed on Render.com

**Milestones shipped:**
- v1.0 MVP (2026-01-24) — 6 phases, 27 plans
- v1.1 Polish (2026-01-28) — 5 phases, 12 plans

## Constraints

- **Tech Stack**: Next.js, Prisma, PostgreSQL, Motion for React — established
- **Icons**: Lucide for UI + devicons-react for tech logos
- **Hosting**: Render.com (deployment config ready)
- **Auth**: Admin-only, single user
- **Design**: Dark warm palette (#160f09, #f3e9e2, #6655b8)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js over static HTML | Need server-side for admin dashboard and API routes | ✓ Good |
| PostgreSQL over SQLite | Production-ready, works well with Render/Railway | ✓ Good |
| Prisma as ORM | Type-safe, excellent DX, migrations built-in | ✓ Good |
| Motion for React | Physics-based, React-native, great API | ✓ Good |
| Single admin user | Portfolio is personal, no need for multi-user | ✓ Good |
| GitHub API integration | Pull real repo data rather than manual entry | ✓ Good |
| devicons-react for tech icons | 150+ tech icons, tree-shakeable, TS-first | ✓ Good |
| Page-level loading.tsx | Simpler than granular Suspense, no refactor needed | ✓ Good |
| Static OG image | Simpler than dynamic generation, sufficient for portfolio | ✓ Good |
| Instant revalidation | revalidatePath("/") on all mutations for instant updates | ✓ Good |
| Dual icon system | iconType + iconId allows devicon OR lucide per skill | ✓ Good |
| Shimmer skeletons | background-attachment: fixed for synchronized animation | ✓ Good |

---
*Last updated: 2026-01-28 after v1.1 milestone*
