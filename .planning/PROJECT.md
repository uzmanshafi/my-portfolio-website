# Portfolio Website Redesign

## What This Is

A complete redesign of a personal developer portfolio website, transforming it from a static HTML site into a modern full-stack application with an admin dashboard. The portfolio showcases projects (pulled from GitHub), skills, bio, and contact information — all managed through a custom CMS interface.

## Core Value

The portfolio must beautifully showcase work and be effortlessly updatable through the admin dashboard — if updating content feels like a chore, the system has failed.

## Requirements

### Validated

<!-- Inferred from existing codebase — these capabilities exist and work -->

- ✓ Portfolio displays projects with images and descriptions — existing
- ✓ About/bio section introduces the developer — existing
- ✓ Skills section shows technical competencies with icons — existing
- ✓ Contact section with copyable email — existing
- ✓ Resume download functionality — existing
- ✓ Social media links (GitHub, LinkedIn, etc.) — existing
- ✓ Responsive design across devices — existing
- ✓ Animations for visual engagement — existing

### Active

<!-- Current scope — building toward these -->

**Admin Dashboard:**
- [ ] Authenticated admin login to access dashboard
- [ ] Dashboard UI to manage all portfolio content
- [ ] Edit bio/about section from dashboard
- [ ] Manage skills list (add, remove, reorder)
- [ ] Upload and update resume/CV
- [ ] Update contact information
- [ ] Live preview of changes before publishing

**GitHub Integration:**
- [ ] Connect to GitHub API to fetch repository data
- [ ] Select which repositories to feature on portfolio
- [ ] Auto-pull repo details (name, description, stars, languages)
- [ ] Override/customize project details if needed
- [ ] Reorder projects via drag-and-drop

**Visual Redesign:**
- [ ] Implement new color scheme (dark warm palette with teal/purple accents)
- [ ] Bento grid layout for projects section
- [ ] Scroll-triggered animations throughout
- [ ] Subtle grain texture on background
- [ ] Glassmorphism effects on cards
- [ ] Text reveal animations on hero section
- [ ] 3D tilt effect on project card hover
- [ ] Smooth section transitions
- [ ] Lucide icons throughout (no emojis)

**Technical Foundation:**
- [ ] Next.js application architecture
- [ ] PostgreSQL database for content storage
- [ ] Prisma ORM for database access
- [ ] Framer Motion for animations
- [ ] API routes for admin operations
- [ ] Secure authentication for admin

### Out of Scope

- Blog/articles section — not requested, adds complexity
- Multiple user accounts — single admin only
- Comments/guestbook — portfolio is one-way showcase
- E-commerce/payments — not a store
- Contact form with backend — existing email copy is sufficient
- Dark/light mode toggle — committing to dark theme
- Multi-language support — English only for v1

## Context

**Existing Codebase:**
- Static single-page HTML site with Tailwind CSS
- Inline vanilla JavaScript for interactivity
- Deployed on Render.com as static site
- No database, no backend currently
- All content hardcoded in HTML

**Technical Concerns from Codebase Analysis:**
- Inline JS in HTML makes maintenance difficult
- No build scripts defined
- External CDN dependencies (fonts, icons)
- No testing infrastructure
- Manual content updates require code changes

**Design Direction:**
- Color palette:
  - Text: #f3e9e2 (warm off-white)
  - Background: #160f09 (deep brown-black)
  - Primary: #d3b196 (warm tan)
  - Secondary: #326978 (teal)
  - Accent: #6655b8 (purple)
- Sophisticated, editorial feel
- Smooth, physics-based animations
- Real SVG icons, no emojis

## Constraints

- **Tech Stack**: Next.js, Prisma, PostgreSQL, Framer Motion — agreed during planning
- **Icons**: Lucide icons only — consistent, professional SVG set
- **Hosting**: Must work with Render.com or similar (Vercel, Railway)
- **Auth**: Admin-only, single user — no public registration
- **Design Quality**: Use frontend-design skill for high-quality, distinctive UI

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js over static HTML | Need server-side for admin dashboard and API routes | — Pending |
| PostgreSQL over SQLite | Production-ready, works well with Render/Railway | — Pending |
| Prisma as ORM | Type-safe, excellent DX, migrations built-in | — Pending |
| Framer Motion for animations | Physics-based, React-native, great API | — Pending |
| Single admin user | Portfolio is personal, no need for multi-user | — Pending |
| GitHub API integration | Pull real repo data rather than manual entry | — Pending |

---
*Last updated: 2026-01-22 after initialization*
