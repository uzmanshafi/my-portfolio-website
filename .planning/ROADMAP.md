# Roadmap: Portfolio Website Redesign

## Milestones

- **v1.0 MVP** - Phases 1-6 (shipped 2026-01-24)
- **v1.1 Polish** - Phases 7-11 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-6) - SHIPPED 2026-01-24</summary>

### Phase 1: Foundation
**Goal**: Establish production-ready Next.js application with PostgreSQL database and type-safe data access layer
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md - Project scaffold with Next.js 15, Tailwind 4, and PostgreSQL Docker setup (2026-01-22)
- [x] 01-02-PLAN.md - Prisma 7 integration with pg adapter and portfolio data models (2026-01-22)

### Phase 2: Authentication
**Goal**: Admin can securely access dashboard with session persistence and proper authorization checks
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md - Auth.js v5 configuration with Credentials provider and password hashing (2026-01-22)
- [x] 02-02-PLAN.md - Route protection, login UI, and protected dashboard structure (2026-01-22)

### Phase 3: Data Layer + Admin CRUD
**Goal**: Admin can manage all portfolio content through intuitive dashboard forms with immediate persistence
**Plans**: 7 plans

Plans:
- [x] 03-01-PLAN.md - Infrastructure: packages, Supabase clients, sidebar navigation, shared hooks (2026-01-22)
- [x] 03-02-PLAN.md - Bio section: form editing, image cropper, Supabase upload (2026-01-22)
- [x] 03-03-PLAN.md - Skills section: CRUD, drag-and-drop within categories, category reordering (2026-01-22)
- [x] 03-04-PLAN.md - Projects section: CRUD, drag-and-drop, visibility toggle, image upload (2026-01-22)
- [x] 03-05-PLAN.md - Resume section: PDF upload and replacement (2026-01-22)
- [x] 03-06-PLAN.md - Contact section: email editing, social links CRUD with drag-and-drop (2026-01-22)
- [x] 03-07-PLAN.md - Dashboard home: stats overview, unsaved changes warning integration (2026-01-22)

### Phase 4: GitHub Integration
**Goal**: Admin can connect GitHub account, browse repositories, and sync selected projects with automatic metadata
**Plans**: 5 plans

Plans:
- [x] 04-01-PLAN.md - Schema + GitHub client infrastructure (GitHubConnection model, Octokit client, token encryption) (2026-01-23)
- [x] 04-02-PLAN.md - GitHub OAuth integration (Auth.js provider, connection UI, connect/disconnect flow) (2026-01-23)
- [x] 04-03-PLAN.md - Repository browser (paginated fetch, card grid, search/filter) (2026-01-23)
- [x] 04-04-PLAN.md - Project sync from GitHub (import repos as projects, GitHub badge, customization tracking) (2026-01-23)
- [x] 04-05-PLAN.md - Background sync + cron (Vercel cron endpoint, per-field reset, deleted repo handling) (2026-01-23)

### Phase 5: Public Portfolio
**Goal**: Public portfolio beautifully displays all content sections with responsive design and sophisticated visual styling
**Plans**: 7 plans

Plans:
- [x] 05-01-PLAN.md - Page layout foundation (single page structure, side navigation dots, section scaffold) (2026-01-23)
- [x] 05-02-PLAN.md - Hero section (geometric shapes, bio info, CTAs) (2026-01-23)
- [x] 05-03-PLAN.md - About section (bio text, profile image display) (2026-01-23)
- [x] 05-04-PLAN.md - Skills section (category groups, Lucide icons) (2026-01-23)
- [x] 05-05-PLAN.md - Projects bento grid (asymmetric layout, cards, hover effects) (2026-01-23)
- [x] 05-06-PLAN.md - Contact section (copyable email, social links, resume link) (2026-01-23)
- [x] 05-07-PLAN.md - Visual polish (glassmorphism, grain texture, gradient lines, ISR verification) (2026-01-23)

### Phase 6: Animation + Polish
**Goal**: Portfolio features smooth, physics-based animations and is production-ready for deployment
**Plans**: 4 plans

Plans:
- [x] 06-01-PLAN.md - Animation infrastructure (Motion package, reusable components, MotionProvider) (2026-01-24)
- [x] 06-02-PLAN.md - Hero entrance animations (geometric shapes scale-in, word-by-word text reveal) (2026-01-24)
- [x] 06-03-PLAN.md - Section scroll reveals and project card 3D tilt (2026-01-24)
- [x] 06-04-PLAN.md - Production deployment (Render.com config, health endpoint, verification) (2026-01-24)

</details>

### v1.1 Polish (In Progress)

**Milestone Goal:** Optimize user experience with instant updates, better error handling, loading states, SEO, and tech icons.

## Phase Details

### Phase 7: Cache Revalidation
**Goal**: Public portfolio updates instantly when admin saves content, with visual confirmation
**Depends on**: Phase 6
**Requirements**: CACH-01, CACH-02, CACH-03
**Success Criteria** (what must be TRUE):
  1. Admin saves content in dashboard, then immediately views public page and sees the change (no 60-second wait)
  2. Toast notification appears confirming "Content is now live" after successful save
  3. All server actions that modify bio, skills, projects, resume, or contact call revalidatePath
**Plans**: 1 plan

Plans:
- [x] 07-01-PLAN.md - Add revalidatePath("/") to all mutations, update toast messages with "now live" feedback, migrate resume-manager to sonner (2026-01-25)

### Phase 8: SEO Metadata
**Goal**: Portfolio appears with rich previews when shared on social media and search results
**Depends on**: Phase 6 (no dependency on Phase 7)
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04
**Success Criteria** (what must be TRUE):
  1. Sharing portfolio URL on Twitter/X shows large image card with title and description
  2. Sharing portfolio URL on LinkedIn/Facebook shows Open Graph preview with image
  3. OG image displays at correct dimensions (1200x630) without cropping issues
  4. Google search results can display Person rich result with structured data
**Plans**: 3 plans

Plans:
- [x] 08-01-PLAN.md - Database model, validation schema, server actions, and portfolio data layer for SEO settings (2026-01-26)
- [x] 08-02-PLAN.md - Admin SEO section with sidebar navigation, OG image upload, and text field editing (2026-01-26)
- [x] 08-03-PLAN.md - Public metadata (generateMetadata with OG/Twitter tags) and JSON-LD structured data (2026-01-26)

### Phase 9: Error Handling
**Goal**: Data fetch failures display a branded, recoverable error page instead of crashing
**Depends on**: Phase 6 (no dependency on Phases 7-8)
**Requirements**: ERRR-01, ERRR-02, ERRR-03, ERRR-04
**Success Criteria** (what must be TRUE):
  1. When database connection fails, user sees branded error page (not Next.js default or white screen)
  2. Error page uses dark warm design system colors (#160f09 background, #f3e9e2 text)
  3. User can click "Try again" button to retry the failed request
  4. Developer can see useful error details in browser console for debugging
**Plans**: 2 plans

Plans:
- [x] 09-01-PLAN.md - Error boundaries for public portfolio (error.tsx, global-error.tsx) and admin dashboard (2026-01-26)
- [x] 09-02-PLAN.md - Data layer throw-on-error and enhanced 404 page design (2026-01-26)

### Phase 10: Loading States
**Goal**: Initial page load shows skeleton placeholders that match the page layout
**Depends on**: Phase 6 (no dependency on Phases 7-9)
**Requirements**: LOAD-01, LOAD-02, LOAD-03, LOAD-04
**Success Criteria** (what must be TRUE):
  1. During initial server render, skeleton shapes appear instead of blank/spinner
  2. Skeleton layout matches actual page sections (hero area, about area, skills grid, projects bento, contact)
  3. Skeleton uses design system accent color (not default gray) for placeholder elements
  4. Skeleton has visible shimmer/pulse animation indicating loading in progress
**Plans**: 2 plans

Plans:
- [x] 10-01-PLAN.md - CSS shimmer animation infrastructure and 6 skeleton components matching real layouts (2026-01-26)
- [x] 10-02-PLAN.md - Route-level loading.tsx composition with static geometric shapes (2026-01-26)

### Phase 11: Programming Language Icons
**Goal**: Skills display recognizable tech logos with an intuitive picker in admin
**Depends on**: Phase 6 (no dependency on Phases 7-10)
**Requirements**: ICON-01, ICON-02, ICON-03, ICON-04
**Success Criteria** (what must be TRUE):
  1. Skills like "Python", "React", "TypeScript" show their recognizable tech logos on public portfolio
  2. Same tech icons appear consistently in both admin skill editor and public portfolio
  3. Skills without a matching tech icon gracefully fall back to generic Lucide icon
  4. Admin can browse searchable grid of available icons when editing a skill
  5. Icon selection persists to database and survives page refresh
**Plans**: 4 plans

Plans:
- [ ] 11-01-PLAN.md - Install devicons-react, create static icon registry with categories/aliases, migrate Skill schema
- [ ] 11-02-PLAN.md - Create TechIcon component, icon matcher for auto-suggest, recent icons localStorage hook
- [ ] 11-03-PLAN.md - Build icon picker modal with search, category tabs, keyboard navigation
- [ ] 11-04-PLAN.md - Integrate icon picker into skill form, update public skill card to use TechIcon

## Progress

**Execution Order:**
Phases execute in numeric order: 7 -> 8 -> 9 -> 10 -> 11

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-01-22 |
| 2. Authentication | v1.0 | 2/2 | Complete | 2026-01-22 |
| 3. Data Layer + Admin CRUD | v1.0 | 7/7 | Complete | 2026-01-22 |
| 4. GitHub Integration | v1.0 | 5/5 | Complete | 2026-01-23 |
| 5. Public Portfolio | v1.0 | 7/7 | Complete | 2026-01-23 |
| 6. Animation + Polish | v1.0 | 4/4 | Complete | 2026-01-24 |
| 7. Cache Revalidation | v1.1 | 1/1 | Complete | 2026-01-25 |
| 8. SEO Metadata | v1.1 | 3/3 | Complete | 2026-01-26 |
| 9. Error Handling | v1.1 | 2/2 | Complete | 2026-01-26 |
| 10. Loading States | v1.1 | 2/2 | Complete | 2026-01-26 |
| 11. Programming Language Icons | v1.1 | 0/4 | Planned | - |

---
*Roadmap created: 2026-01-22*
*Last updated: 2026-01-27 (Phase 11 planned)*
