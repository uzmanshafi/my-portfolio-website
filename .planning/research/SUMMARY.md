# Project Research Summary

**Project:** Portfolio Website v1.1 Polish Features
**Domain:** Next.js App Router Performance Optimization
**Researched:** 2026-01-25
**Confidence:** HIGH

## Executive Summary

This research synthesizes the technical approach for adding 5 polish features to an existing Next.js 15 portfolio site: cache revalidation, error boundaries, loading skeletons, SEO metadata, and programming language icons. The portfolio is a full-stack application with public pages (ISR-cached) and an admin dashboard (authenticated), built on Next.js 15 + Prisma + PostgreSQL.

The recommended approach leverages Next.js 15's built-in conventions (error.tsx, loading.tsx, generateMetadata) to add production-grade polish with minimal stack additions. Only 2 new dependencies required: devicons-react for tech logos and schema-dts for typed JSON-LD. The critical architectural insight is that the current all-at-once data fetching pattern (getPortfolioData) creates trade-offs for granular loading states, requiring a decision between code simplicity and streaming benefits.

Key risks include bundle size explosion from improper icon imports, metadata placement bugs in Next.js 15.5+, and Suspense boundary placement errors. These are all well-documented with established mitigation patterns. Overall confidence is HIGH due to strong official documentation and existing codebase alignment with recommended patterns.

## Key Findings

### Recommended Stack Additions

The v1.1 polish features require minimal new dependencies. Most capabilities are built into Next.js 15:

**New production dependency:**
- **devicons-react** (v1.5.0) - Purpose-built for programming language icons, 150+ tech logos, tree-shakeable with individual imports, complements existing Lucide icons for UI elements

**New dev dependency:**
- **schema-dts** (v1.1.5) - TypeScript types for Schema.org JSON-LD, zero runtime overhead, enables typed structured data with IDE autocomplete

**No stack changes needed for:**
- Cache revalidation (already using revalidatePath)
- Error boundaries (built-in error.tsx convention)
- Loading skeletons (built-in loading.tsx convention)
- SEO metadata (built-in generateMetadata API)

The existing stack (Next.js 15.5, React 19, Prisma 7, Tailwind 4, Framer Motion, Lucide React) fully supports all polish features without replacement or major version changes.

### Expected Features

All 5 features are table stakes for production Next.js applications in 2026:

**Must have (table stakes):**
- **Instant cache updates** - Admin expects changes to appear immediately on public site, not after 60s ISR delay
- **Graceful error handling** - Failed data fetches show helpful UI instead of crashing the entire page
- **Loading feedback** - Visual skeletons during data fetch prevent blank white screens and improve perceived performance
- **Social sharing previews** - Open Graph and Twitter Cards for professional link sharing on LinkedIn/Twitter/Slack
- **Recognizable tech icons** - JavaScript logo, React logo, TypeScript logo instead of generic "code" icons

**Should have (competitive):**
- Section-level error boundaries (each section fails independently)
- Granular loading states (hero loads before projects)
- Dynamic OG image generation (personalized preview)
- Icon picker UI in admin (visual selection vs. text input)

**Defer (v2+):**
- Auto-retry with backoff for failed fetches
- Error reporting integration (Sentry)
- Skeleton animation staggering
- JSON-LD structured data beyond basic OpenGraph

### Architecture Approach

The portfolio uses Next.js 15 App Router with server-first rendering. Public pages are ISR-cached (60s revalidation), admin dashboard uses Server Actions for mutations. All features integrate with existing patterns:

**Integration points:**
1. **Cache revalidation** - Audit existing server actions (bio, skills, projects, resume, github) to ensure all call revalidatePath("/") for public page. Missing from contact.ts and social-links.ts
2. **Error boundaries** - Create error.tsx at app root and backstage routes, must be client components with "use client" directive
3. **Loading skeletons** - Create loading.tsx with skeleton UI matching page.tsx section structure (hero, about, skills, projects, contact)
4. **SEO metadata** - Extend existing generateMetadata in page.tsx with openGraph and twitter fields, add metadataBase to layout.tsx
5. **Programming icons** - Add devicons alongside Lucide in skill-card.tsx using prefix convention ("devicon:react" vs "lucide:code")

**Current architecture strengths:**
- Server Actions already use revalidatePath pattern
- MotionProvider at root supports animations during streaming
- getPortfolioData() parallel fetch is efficient but limits granular Suspense

**Trade-off to consider:**
The current getPortfolioData() fetches all data with Promise.all, which is fast but prevents granular streaming (can't show hero before projects load). For whole-page loading.tsx this is fine. For per-section Suspense, would need to refactor to section-specific fetchers (getHeroData, getProjectsData, etc.).

### Critical Pitfalls

Research identified 23 pitfalls across 3 severity levels. Top 5 critical for v1.1:

1. **Importing all Lucide icons destroys bundle size** - Current codebase uses `import * as icons from "lucide-react"` in social-link.tsx and sortable-skill-item.tsx, importing 1000+ icons. Use individual imports or dynamic imports with transpilePackages config.

2. **Error boundaries must have "use client" directive** - Creating error.tsx without this causes build errors. Error boundaries require client-side state and must be explicitly marked.

3. **Metadata streaming bug in Next.js 15.1+** - Dynamic metadata can appear in body instead of head. For SEO-critical homepage, consider static metadata export instead of generateMetadata to guarantee correct placement.

4. **revalidatePath only invalidates, doesn't regenerate immediately** - Calling revalidatePath("/") marks cache as stale but regeneration happens on next request. Admin won't see changes until they navigate to public page.

5. **Suspense boundary must wrap async component** - Placing Suspense inside the component that fetches data, or wrapping components that receive already-fetched data as props, won't work. Suspense must be above the component initiating async work.

**Prevention strategies already in codebase:**
- Multi-layer auth (not middleware-only)
- GitHub API cached via server actions (not client-side fetch)
- Prisma singleton pattern (avoids connection exhaustion)
- Dark theme only (no hydration mismatch from theme toggle)
- Motion components use "use client" (SSR compatible)

## Implications for Roadmap

Based on research, recommended phase structure for v1.1 milestone:

### Phase 1: Cache Revalidation Fix
**Rationale:** Smallest change (2 files), immediate user-visible benefit, unblocks admin workflow. Currently admin changes take 60s to appear on public site.

**Delivers:** All admin mutations instantly invalidate public page cache

**Changes:**
- Add revalidatePath("/") to contact.ts server action
- Add revalidatePath("/") to all social-links.ts mutations

**Avoids:** Pitfall #14 (missed revalidation paths) and #20 (ISR timing confusion)

**Research needs:** SKIP - pattern already established in codebase

---

### Phase 2: SEO Metadata Enhancement
**Rationale:** Extends existing generateMetadata pattern, no new files or complex logic. High impact for social sharing (portfolio gets shared on LinkedIn when job searching).

**Delivers:** Open Graph and Twitter Card previews when portfolio URL shared

**Changes:**
- Extend generateMetadata in page.tsx with openGraph and twitter fields
- Add metadataBase to layout.tsx
- Install schema-dts as dev dependency (optional, for JSON-LD)
- Create static OG image (1200x630) in public/

**Avoids:** Pitfall #11 and #15 (metadata placement bugs) by using simple field additions without url/type properties

**Research needs:** SKIP - Next.js Metadata API well-documented

---

### Phase 3: Error Boundaries
**Rationale:** Self-contained client components, no dependencies on other features. Provides safety net for production failures. Isolated scope.

**Delivers:** Graceful error UI instead of white screen crashes

**Changes:**
- Create app/error.tsx (public pages)
- Create app/backstage/error.tsx (admin pages)
- Both must include "use client" directive
- Match existing dark theme design

**Avoids:** Pitfall #7 (missing use client) and #8 (layout error placement) by following exact Next.js patterns

**Research needs:** SKIP - standard Next.js file convention

---

### Phase 4: Loading Skeletons
**Rationale:** Requires design work to match page.tsx structure, but no new patterns. Benefits from error boundaries being in place (loading -> error flow).

**Delivers:** Visual feedback during initial page load instead of blank screen

**Changes:**
- Create app/loading.tsx with skeleton UI
- Design skeletons matching: hero, about, skills grid, projects bento, contact sections
- Use Tailwind for skeleton styling (pulse animation, bg-primary/10)

**Avoids:** Pitfall #10 (Suspense placement) and #12 (all-or-nothing loading) by starting with page-level loading.tsx, can refactor to granular Suspense later if needed

**Trade-off:** Current getPortfolioData() pattern supports whole-page loading well but would need refactoring for per-section streaming

**Research needs:** SKIP for whole-page approach; DEEP DIVE if choosing granular Suspense (requires data layer refactor)

---

### Phase 5: Programming Language Icons
**Rationale:** Largest scope (new dependency, UI changes, backwards compatibility), but independent. Visual polish, not critical functionality.

**Delivers:** React logo, TypeScript logo, etc. instead of generic code icons

**Changes:**
- npm install devicons-react
- Modify skill-card.tsx to support both Lucide and devicons using prefix convention
- Update admin skills UI to suggest icon names or add picker
- Add transpilePackages: ['lucide-react'] to next.config.js (for dynamic imports)

**Avoids:** Pitfall #6 (bundle size explosion) by using individual imports with dynamic mapping, not `import *`

**Research needs:** MEDIUM - Icon picker UI design needs UX consideration (text input vs. visual picker vs. autocomplete)

---

### Phase Ordering Rationale

**Why this order:**
1. **Cache revalidation first** - Fixes existing admin pain point with 2-line changes. Quick win builds momentum.
2. **SEO before loading** - Extends existing pattern, smaller scope than designing skeleton UI
3. **Error boundaries before loading** - Establishes error handling baseline so loading states can fail gracefully
4. **Loading before icons** - Loading is user-facing performance feature, icons are visual polish
5. **Icons last** - Most complex (new dependency, UI decisions), can be done in parallel with Phase 4 if desired

**Parallelization opportunity:**
- Phases 1-3 are independent and could run concurrently
- Phase 4 benefits from Phase 3 being complete (error boundaries catch loading failures)
- Phase 5 completely independent, can run anytime

**Dependencies between features:**
```
Cache Revalidation (Phase 1) -----> Independent
SEO Metadata (Phase 2) -----------> Independent
Error Boundaries (Phase 3) -------> Independent
Loading Skeletons (Phase 4) ------> Soft dependency on Phase 3
Programming Icons (Phase 5) ------> Independent
```

### Research Flags

**Phases with standard patterns (skip deep research):**
- Phase 1 (Cache) - Pattern already in codebase (bio.ts, resume.ts)
- Phase 2 (SEO) - Next.js Metadata API well-documented
- Phase 3 (Error) - Standard error.tsx file convention
- Phase 4 (Loading) - Standard loading.tsx if using whole-page approach

**Phase needing design decisions (not research):**
- Phase 5 (Icons) - Icon picker UI needs UX design: text input (simple), autocomplete (medium), visual grid picker (complex)

**Phase needing deeper research IF scope changes:**
- Phase 4 (Loading) - If pivoting from whole-page to granular Suspense, needs data layer refactor research. Current getPortfolioData() uses Promise.all which prevents streaming benefits.

**Known unknowns to validate during implementation:**
- Next.js 15.5+ metadata streaming bug status (GitHub issue #84518) - may affect Phase 2
- Loading skeleton flash on fast Prisma queries (Pitfall #21) - may need minimum display time or skip feature
- AnimatePresence exit animations don't work reliably with App Router (Pitfall #16) - affects skeleton-to-content transitions

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Only 2 new dependencies, both well-maintained. Verified Next.js 15 built-in support for 3/5 features. |
| Features | HIGH | All 5 features researched with official Next.js docs, patterns verified in current codebase. |
| Architecture | HIGH | Integration points identified, current architecture supports all features without major refactoring. |
| Pitfalls | HIGH | 23 pitfalls documented with prevention strategies. Mix of official docs and GitHub issue verification. |

**Overall confidence:** HIGH

### Gaps to Address

**During implementation:**
- **Icon picker UX decision** - Text input is simplest (Phase 5 quick), visual picker is best UX (Phase 5 extended). Recommend text input for v1.1, picker for v1.2.
- **Metadata bug workaround** - Next.js 15.1+ metadata streaming issue is open. Test actual behavior on current Next.js 15.5 version. If broken, use static metadata export instead of generateMetadata.
- **Loading skeleton necessity** - Portfolio data loads very fast (local Prisma). Test with network throttling to see if skeleton is even visible. May skip or simplify if flash is jarring.
- **Granular Suspense trade-off** - Current architecture supports whole-page loading well. Granular per-section loading requires data layer refactor (breaking getPortfolioData into section-specific fetchers). Recommend whole-page for v1.1, evaluate based on user feedback.

**Validation needed:**
- Bundle size impact of devicons-react - verify tree-shaking works as expected
- Error boundary styling matches dark theme aesthetic - design work needed
- OG image design - needs Figma work (1200x630, dark background, name + title)
- Skeleton animation timing - test reduced-motion preference compatibility

**Monitoring after launch:**
- Error boundary trigger frequency (should be rare)
- Cache revalidation timing (admin update to public appearance)
- Loading skeleton visibility duration (may be too fast to notice)
- Social sharing preview display (test on LinkedIn, Twitter, Slack)

## Sources

### Primary (HIGH confidence)

**Official Next.js Documentation:**
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-15)
- [revalidatePath API Reference](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [error.tsx File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/error)
- [loading.tsx File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
- [generateMetadata API Reference](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js Metadata and OG Images Guide](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [Next.js Error Handling Guide](https://nextjs.org/docs/app/getting-started/error-handling)
- [Next.js Caching and Revalidating](https://nextjs.org/docs/app/getting-started/caching-and-revalidating)

**Official Package Documentation:**
- [Lucide React Guide](https://lucide.dev/guide/packages/lucide-react)
- [devicons-react npm](https://www.npmjs.com/package/devicons-react)
- [schema-dts GitHub](https://github.com/google/schema-dts)
- [Prisma Vercel Deployment](https://www.prisma.io/docs/orm/prisma-client/deployment/serverless/deploy-to-vercel)
- [Framer Motion Performance](https://motion.dev/docs/performance)

### Secondary (MEDIUM confidence)

**GitHub Issues and Discussions:**
- [Next.js metadata streaming discussion #84518](https://github.com/vercel/next.js/discussions/84518) - Known bug affecting generateMetadata
- [Next.js metadata in body bug #83267](https://github.com/vercel/next.js/issues/83267) - Open Graph url property issue
- [Lucide dynamic import performance #1576](https://github.com/lucide-icons/lucide/issues/1576) - Bundle size optimization
- [Framer Motion App Router exit animations #49279](https://github.com/vercel/next.js/issues/49279) - AnimatePresence limitations

**Community Guides:**
- [Vercel Blog - Common App Router Mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)
- [freeCodeCamp - Next.js 15 Streaming Handbook](https://www.freecodecamp.org/news/the-nextjs-15-streaming-handbook/)
- [Medium - revalidatePath vs revalidateTag](https://anjitpariyar.medium.com/revalidate-path-vs-revalidate-tag-vs-revalidate-time-next-js-v15-app-router-89db505c2f3f)
- [Better Stack - Next.js Error Handling](https://betterstack.com/community/guides/scaling-nodejs/error-handling-nextjs/)

### Tertiary (Context from existing research)

**v1.0 Foundation Research (archived):**
- STACK.md - Original stack decisions (Next.js 15, Prisma 7, Auth.js, Tailwind 4)
- FEATURES.md - General portfolio feature landscape
- ARCHITECTURE.md - Server-first pattern with route groups
- PITFALLS.md - v1.0 pitfalls (middleware auth, GitHub rate limits, Prisma pooling)

---
*Research completed: 2026-01-25*
*Ready for roadmap: yes*
