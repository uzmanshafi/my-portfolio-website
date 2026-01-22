# Project Research Summary

**Project:** Portfolio Website with Admin Dashboard
**Domain:** Developer Portfolio + CMS
**Researched:** 2026-01-22
**Confidence:** HIGH

## Executive Summary

This project transforms a static HTML portfolio into a full-stack Next.js 15 application with a protected admin dashboard for content management and GitHub repository integration. The recommended approach follows a **server-first, client-islands** architecture using the App Router, with clear separation between the public portfolio (server-rendered, cached) and admin dashboard (interactive, mutation-heavy).

The technology stack centers on Next.js 15.5+, Prisma 7 with PostgreSQL, and Auth.js v5 for authentication. The stack is mature and well-documented, with high confidence across all major decisions. Key differentiators include GitHub API integration for dynamic project display and Framer Motion animations for polish.

The primary risks are security-related: middleware-only authentication has a known CVE bypass, and serverless database connections require pooling to avoid exhaustion. Both are well-documented and preventable with proper implementation. Secondary risks involve GitHub API rate limits and theme/animation hydration mismatches, all with established solutions.

## Key Findings

### Recommended Stack

The stack prioritizes developer experience, type safety, and production readiness. All recommended technologies are industry-standard with active maintenance.

**Core technologies:**
- **Next.js 15.5+**: Full-stack React framework with App Router, server components, and Turbopack
- **Prisma 7 + PostgreSQL**: Type-safe ORM with 3x faster queries and pure TypeScript runtime
- **Auth.js v5**: Authentication with Credentials provider and Argon2 password hashing
- **Tailwind CSS 4 + shadcn/ui**: Utility-first CSS with copy-paste component library
- **Framer Motion 12+**: Physics-based animations with React 19 support
- **TanStack Query 5 + Octokit**: Server state management and GitHub API client
- **dnd-kit 6**: Drag-and-drop for admin reordering (react-beautiful-dnd is deprecated)

**Critical versions:** Use `jose` (not `jsonwebtoken`) for Edge Runtime JWT. Use Argon2 (not bcrypt) for password hashing.

### Expected Features

**Must have (table stakes):**
- Responsive/mobile-first design
- About, Projects, Skills, Contact sections
- Secure admin authentication
- CRUD for bio, skills, projects
- Resume PDF management
- Social/professional links

**Should have (differentiators):**
- GitHub repository integration (dynamic project display)
- Dark theme (project specifies commitment to dark mode, no toggle)
- Smooth animations with Framer Motion
- Fast page loads (under 3 seconds)

**Defer (v2+):**
- Blog/writing section
- AI chatbot
- 3D/WebGL elements
- PWA features
- Analytics dashboard

### Architecture Approach

The architecture separates public and admin experiences using **route groups** (`(site)` and `(admin)`) with distinct layouts. Public pages are server-rendered with ISR caching. Admin pages use client components with Server Actions for mutations. A data access layer centralizes database queries with caching for public reads and fresh data for admin.

**Major components:**
1. **PostgreSQL + Prisma ORM** - Persistent storage with type-safe access
2. **Server Actions** - CRUD mutations with automatic revalidation
3. **API Routes** - GitHub API proxy only (keep token server-side)
4. **Route Groups** - Separate layouts for public vs admin
5. **Auth Middleware + Layout Checks** - Layered authentication (defense in depth)

### Critical Pitfalls

1. **Middleware-Only Authentication** - CVE-2025-29927 allows bypass. Implement auth checks at middleware, API route, AND data access layer levels.

2. **Prisma Connection Pool Exhaustion** - Serverless creates new connections per invocation. Use singleton pattern and connection pooler (Prisma Accelerate or PgBouncer).

3. **GitHub API Rate Limits** - 60 req/hour unauthenticated, 5000 authenticated. Cache responses, use ISR, store selected repos in database.

4. **Framer Motion SSR Errors** - Requires `"use client"` directive. Create wrapper components for server component compatibility.

5. **Auth.js v5 Breaking Changes** - Use `AUTH_SECRET` (not `NEXTAUTH_SECRET`), JWT sessions for Credentials provider, wrap app with `SessionProvider`.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation
**Rationale:** Database and auth are dependencies for all other features. Must be configured correctly from the start to avoid connection exhaustion and security vulnerabilities.
**Delivers:** Next.js project, Prisma schema, PostgreSQL database, project structure
**Addresses:** Table stakes infrastructure
**Avoids:** Connection pool exhaustion (configure pooler now), schema over-engineering

### Phase 2: Authentication
**Rationale:** Admin dashboard requires auth. Must implement layered auth before building any admin features.
**Delivers:** Login page, session management, route protection, admin layout
**Uses:** Auth.js v5, Prisma adapter, jose for Edge Runtime
**Avoids:** Middleware-only auth vulnerability (CVE-2025-29927)

### Phase 3: Data Layer + Admin CRUD
**Rationale:** Core functionality. Admin must manage content before public site can display it.
**Delivers:** Server actions for bio/skills/projects/resume, admin UI forms, data access layer
**Implements:** Server-first mutation pattern, data access layer
**Avoids:** Direct database access in components

### Phase 4: GitHub Integration
**Rationale:** Key differentiator. Depends on database (store selections) and auth (admin-only sync).
**Delivers:** GitHub repo fetching, admin repo selection, project sync from GitHub
**Uses:** Octokit, TanStack Query, API route proxy
**Avoids:** Rate limit exhaustion (cache responses, store in DB)

### Phase 5: Public Portfolio
**Rationale:** Can now display all content. Built on established data layer.
**Delivers:** Public layout, home page sections, project display, contact form
**Uses:** Server components, ISR caching, responsive design
**Implements:** Route group separation ((site) layout)

### Phase 6: Animation + Polish
**Rationale:** Additive enhancement. Core functionality must work first.
**Delivers:** Framer Motion animations, page transitions, loading/error states
**Uses:** Framer Motion wrappers, Suspense boundaries
**Avoids:** Hydration mismatches (use client wrapper components)

### Phase Ordering Rationale

- **Foundation before everything:** Database and project structure are dependencies for all features
- **Auth before admin:** All admin routes require authentication; building admin first would mean retrofitting security
- **Data layer before public site:** Need content to display; admin creates content
- **GitHub integration separate:** Complex external API with rate limit concerns; isolate risk
- **Animations last:** Purely additive; don't block core functionality

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (GitHub Integration):** Complex caching strategy, rate limit handling, sync logic
- **Phase 6 (Animation):** May need viewport-based animations, scroll triggers research

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Well-documented Next.js + Prisma setup
- **Phase 2 (Authentication):** Auth.js v5 has comprehensive docs
- **Phase 3 (Admin CRUD):** Standard CRUD patterns with Server Actions
- **Phase 5 (Public Portfolio):** Standard React Server Components

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified via official docs and npm; versions confirmed current |
| Features | MEDIUM-HIGH | Feature expectations from multiple sources; MVP scope clear |
| Architecture | HIGH | Patterns verified via Next.js docs, Prisma docs, Auth.js docs |
| Pitfalls | HIGH | Security pitfalls verified with CVE details; solutions documented |

**Overall confidence:** HIGH

### Gaps to Address

- **File upload strategy:** STACK.md mentions UploadThing (MEDIUM confidence). May want to evaluate direct S3 or local storage during Phase 3.
- **Contact form spam prevention:** FEATURES.md mentions honeypot or reCAPTCHA. Specific implementation needs decision during Phase 5.
- **Image hosting:** Not explicitly decided. Options: local public folder, Cloudinary, Vercel Image Optimization. Decide in Phase 1.

## Sources

### Primary (HIGH confidence)
- Next.js 15 Official Docs - project structure, authentication, image optimization
- Prisma 7 Official Docs - schema, client setup, serverless deployment
- Auth.js v5 Official Docs - migration guide, Prisma adapter, session management
- Framer Motion Official Docs - performance, React 19 compatibility
- CVE-2025-29927 Analysis (JFrog, ProjectDiscovery) - middleware auth bypass

### Secondary (MEDIUM confidence)
- Community tutorials on Next.js architecture patterns
- Blog posts on portfolio best practices and common mistakes
- GitHub API rate limiting documentation

### Tertiary (LOW confidence)
- UploadThing recommendation - needs validation if file uploads required

---
*Research completed: 2026-01-22*
*Ready for roadmap: yes*
