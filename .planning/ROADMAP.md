# Roadmap: Portfolio Website Redesign

## Overview

This roadmap transforms a static HTML portfolio into a production-ready full-stack Next.js application with an authenticated admin dashboard. The journey progresses from foundational infrastructure through secure authentication, comprehensive content management, GitHub integration, polished public display, and additive animations. Each phase delivers a coherent, verifiable capability that builds toward effortless content updates and beautiful project showcasing.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Next.js project, database, and core infrastructure
- [ ] **Phase 2: Authentication** - Secure admin access with Auth.js v5
- [ ] **Phase 3: Data Layer + Admin CRUD** - Complete content management system
- [ ] **Phase 4: GitHub Integration** - Dynamic repository sync and display
- [ ] **Phase 5: Public Portfolio** - Server-rendered showcase with responsive design
- [ ] **Phase 6: Animation + Polish** - Motion design and production readiness

## Phase Details

### Phase 1: Foundation
**Goal**: Establish production-ready Next.js application with PostgreSQL database and type-safe data access layer
**Depends on**: Nothing (first phase)
**Requirements**: TECH-01, TECH-02, TECH-03
**Success Criteria** (what must be TRUE):
  1. Next.js 15+ application runs locally with App Router
  2. PostgreSQL database connects successfully with connection pooling configured
  3. Prisma schema defines all content models (bio, skills, projects, resume, contact)
  4. Database migrations can be generated and applied without errors
  5. Development environment is documented and reproducible
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Project scaffold with Next.js 15, Tailwind 4, and PostgreSQL Docker setup
- [ ] 01-02-PLAN.md — Prisma 7 integration with pg adapter and portfolio data models

### Phase 2: Authentication
**Goal**: Admin can securely access dashboard with session persistence and proper authorization checks
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, TECH-05
**Success Criteria** (what must be TRUE):
  1. Admin can log in with email and password using Auth.js v5
  2. Admin session persists across browser refresh and tab close/reopen
  3. Admin can log out from any page, clearing session completely
  4. Unauthenticated users are redirected when accessing admin routes
  5. Authentication uses layered defense (middleware + layout + data layer checks)
**Plans**: TBD

Plans:
- [ ] TBD during planning

**Research needed during planning**: No (Auth.js v5 has comprehensive documentation)

### Phase 3: Data Layer + Admin CRUD
**Goal**: Admin can manage all portfolio content through intuitive dashboard forms with immediate persistence
**Depends on**: Phase 2
**Requirements**: ADMN-01, ADMN-02, ADMN-03, BIO-01, BIO-02, BIO-03, SKIL-01, SKIL-02, SKIL-03, SKIL-04, PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-05, RESU-01, RESU-02, CONT-01, CONT-02
**Success Criteria** (what must be TRUE):
  1. Admin dashboard displays navigation to all content sections (Bio, Skills, Projects, Resume, Contact)
  2. Admin can edit bio text and update profile image with changes saved to database
  3. Admin can add, remove, reorder, and categorize skills through drag-and-drop interface
  4. Admin can create, edit, delete, reorder, and toggle visibility of projects
  5. Admin can upload and replace resume PDF file
  6. Admin can update contact email and manage social media links (add/edit/remove)
  7. All save operations provide visual feedback (loading states, success/error messages)
**Plans**: TBD

Plans:
- [ ] TBD during planning

**Research needed during planning**: No (standard CRUD with Server Actions)

### Phase 4: GitHub Integration
**Goal**: Admin can connect GitHub account, browse repositories, and sync selected projects with automatic metadata
**Depends on**: Phase 3
**Requirements**: GHUB-01, GHUB-02, GHUB-03, GHUB-04, GHUB-05
**Success Criteria** (what must be TRUE):
  1. Admin can authenticate with GitHub OAuth in dashboard
  2. Admin can view paginated list of their GitHub repositories
  3. Admin can select which repositories to feature on portfolio
  4. Selected repositories automatically pull name, description, stars, and primary language
  5. Admin can override/customize auto-pulled details for any GitHub-synced project
  6. GitHub data is cached to avoid rate limit exhaustion (5000 req/hour limit respected)
**Plans**: TBD

Plans:
- [ ] TBD during planning

**Research needed during planning**: Yes (caching strategy, rate limit handling, sync logic)

### Phase 5: Public Portfolio
**Goal**: Public portfolio beautifully displays all content sections with responsive design and sophisticated visual styling
**Depends on**: Phase 4
**Requirements**: PUBL-01, PUBL-02, PUBL-03, PUBL-04, PUBL-05, PUBL-06, PUBL-07, PUBL-08, RESU-03, CONT-03, DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05
**Success Criteria** (what must be TRUE):
  1. Portfolio displays hero section with introduction and call-to-action
  2. Portfolio displays bio/about section with profile image
  3. Portfolio displays skills organized by category with Lucide icons
  4. Portfolio displays projects in bento grid layout with hover effects
  5. Portfolio displays contact section with copyable email and social links
  6. Resume PDF is downloadable via prominent link
  7. All sections render responsively on mobile, tablet, and desktop (320px to 1920px+)
  8. Dark warm color palette is implemented throughout (#f3e9e2 text, #160f09 bg, #d3b196 primary, #326978 secondary, #6655b8 accent)
  9. Glassmorphism effects appear on cards and subtle grain texture on background
  10. Pages are server-rendered with ISR caching for fast load times
**Plans**: TBD

Plans:
- [ ] TBD during planning

**Research needed during planning**: No (standard React Server Components patterns)

### Phase 6: Animation + Polish
**Goal**: Portfolio features smooth, physics-based animations and is production-ready for deployment
**Depends on**: Phase 5
**Requirements**: TECH-04, ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05, TECH-06
**Success Criteria** (what must be TRUE):
  1. Scroll-triggered animations reveal content as user scrolls through page
  2. Hero section displays text reveal animations on page load
  3. Project cards exhibit 3D tilt effect on mouse hover
  4. Section transitions are smooth with physics-based easing
  5. Animations respect prefers-reduced-motion accessibility setting
  6. Application is deployed to production environment (Render.com or similar)
  7. Loading and error states are handled gracefully across all pages
**Plans**: TBD

Plans:
- [ ] TBD during planning

**Research needed during planning**: Yes (viewport-based animations, scroll triggers, Framer Motion SSR patterns)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/2 | Planned | - |
| 2. Authentication | 0/TBD | Not started | - |
| 3. Data Layer + Admin CRUD | 0/TBD | Not started | - |
| 4. GitHub Integration | 0/TBD | Not started | - |
| 5. Public Portfolio | 0/TBD | Not started | - |
| 6. Animation + Polish | 0/TBD | Not started | - |

---
*Roadmap created: 2026-01-22*
*Last updated: 2026-01-22*
