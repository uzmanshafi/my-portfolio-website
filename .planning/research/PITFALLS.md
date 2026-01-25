# Domain Pitfalls

**Domain:** Next.js Portfolio with Admin Dashboard + GitHub Integration
**Researched:** 2026-01-22 (v1.0), 2026-01-25 (v1.1 Polish Features)
**Confidence:** HIGH (verified with official sources and multiple authoritative references)

---

# PART 1: v1.0 Foundation Pitfalls

Critical pitfalls from initial project setup (retained for reference).

## Critical Pitfalls

### Pitfall 1: Middleware-Only Authentication

**What goes wrong:** Relying solely on Next.js middleware for authentication allows attackers to bypass security checks entirely. CVE-2025-29927 demonstrated that middleware can be bypassed through header manipulation (`x-middleware-subrequest`), allowing unauthenticated access to admin panels.

**Prevention:** Multi-layer auth (middleware + API route + data access layer).

**Sources:**
- [CVE-2025-29927 Analysis (JFrog)](https://jfrog.com/blog/cve-2025-29927-next-js-authorization-bypass/)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)

---

### Pitfall 2: GitHub API Rate Limit Exhaustion

**What goes wrong:** GitHub API has strict rate limits (60 requests/hour unauthenticated, 5,000/hour authenticated). Portfolio sites that fetch repository data on every page load quickly hit these limits.

**Prevention:** Store selected repos in database, sync via admin action or cron job.

**Sources:**
- [Octokit Throttling Plugin](https://github.com/octokit/plugin-throttling.js/)

---

### Pitfall 3: Prisma Connection Pool Exhaustion in Serverless

**What goes wrong:** Each serverless function invocation creates a new database connection. Under load, this exhausts the PostgreSQL connection limit.

**Prevention:** Singleton pattern + connection pooler (PgBouncer, Supabase Pooler).

**Sources:**
- [Prisma Vercel Deployment Guide](https://www.prisma.io/docs/orm/prisma-client/deployment/serverless/deploy-to-vercel)

---

### Pitfall 4: Dark Mode Hydration Mismatch

**What goes wrong:** Server renders page with one theme, client switches to user's preferred theme. React detects mismatch.

**Prevention:** This project uses dark theme only (no toggle), avoiding the issue entirely.

---

### Pitfall 5: Framer Motion SSR Compatibility

**What goes wrong:** Framer Motion components fail to animate or throw errors in Next.js because they require client-side rendering.

**Prevention:** Use `"use client"` directive, import from `motion/react` for React 19.

**Sources:**
- [Framer Motion Performance Guide](https://motion.dev/docs/performance)

---

# PART 2: v1.1 Polish Features Pitfalls

New pitfalls specific to adding polish features to the existing Next.js 15 App Router portfolio.

## Critical Pitfalls

These mistakes cause significant bugs, broken functionality, or require substantial rework.

---

### Pitfall 6: Importing All Lucide Icons Destroys Bundle Size

**Affects:** Tech icons feature

**What goes wrong:** The current codebase uses `import * as icons from "lucide-react"` in `social-link.tsx` and `sortable-skill-item.tsx`. This imports the ENTIRE icon library (~1000+ icons) into the bundle, adding hundreds of KB to the client bundle even though only a few icons are used.

**Warning signs:**
- Bundle analyzer shows lucide-react as largest dependency
- Initial page load > 500KB JavaScript
- Lighthouse performance score drops
- Build output shows large chunk sizes

**Prevention:**
- For static icons: Import icons individually (`import { Github, Linkedin } from "lucide-react"`)
- For dynamic icons (from CMS/DB): Use `next/dynamic` with `lucide-react/dynamicIconImports`
- Add `transpilePackages: ['lucide-react']` to `next.config.js` for dynamic imports
- Use `React.memo` on dynamic icon components to prevent re-renders

**Existing code needing attention:**
```typescript
// BAD (current): src/app/components/portfolio/social-link.tsx
import * as icons from "lucide-react";

// GOOD: Use dynamic imports for CMS-driven icons
import dynamic from 'next/dynamic';
import { dynamicIconImports } from 'lucide-react';
```

**Sources:**
- [Lucide React Guide](https://lucide.dev/guide/packages/lucide-react)
- [GitHub Issue #1576 - Dynamic Import Performance](https://github.com/lucide-icons/lucide/issues/1576)

---

### Pitfall 7: Error Boundary Missing `"use client"` Directive

**Affects:** Error boundaries (error.tsx)

**What goes wrong:** Creating `error.tsx` without the `"use client"` directive causes a build error or runtime failure. Error boundaries MUST be client components because they use React's error boundary mechanism which requires client-side state.

**Warning signs:**
- Build error: "Error boundary must be a Client Component"
- Runtime error about useState/useEffect in server component
- Error page never displays, app crashes instead

**Prevention:**
- ALWAYS add `"use client"` as the first line of error.tsx
- Include both `error` and `reset` props in the component signature
- Test error boundaries in development by throwing test errors

**Correct pattern:**
```typescript
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Component implementation
}
```

**Sources:**
- [Next.js error.js API Reference](https://nextjs.org/docs/app/api-reference/file-conventions/error)

---

### Pitfall 8: Error Boundary Placement Cannot Catch Same-Segment Layout Errors

**Affects:** Error boundaries (error.tsx)

**What goes wrong:** Placing `error.tsx` in a route segment expecting it to catch errors from that segment's `layout.tsx`. Error boundaries do NOT catch errors from the layout or template in the same segment.

**Warning signs:**
- Layout throws error but error.tsx UI never appears
- App shows white screen or Next.js default error page
- Error boundary works for page.tsx but not layout.tsx

**Prevention:**
- Create `error.tsx` in the PARENT segment to catch layout errors
- Use `global-error.tsx` at app root to catch root layout errors
- `global-error.tsx` MUST include its own `<html>` and `<body>` tags

**Example structure:**
```
app/
  global-error.tsx    <- catches root layout.tsx errors
  layout.tsx
  error.tsx           <- catches page.tsx errors only
  page.tsx
  backstage/
    error.tsx         <- catches backstage/page.tsx, NOT backstage/layout.tsx
    layout.tsx
    page.tsx
```

**Sources:**
- [Next.js Error Handling Guide](https://nextjs.org/docs/app/getting-started/error-handling)

---

### Pitfall 9: revalidatePath Only Invalidates, Doesn't Regenerate Immediately

**Affects:** Cache revalidation

**What goes wrong:** Expecting `revalidatePath("/")` to immediately regenerate the page. In reality, it only invalidates the cache entry. The actual regeneration happens on the NEXT request to that path.

**Warning signs:**
- Admin updates content, visits public page, still sees old content
- Cache seems "stuck" even after revalidation call
- Works on second refresh but not first

**Prevention:**
- Understand the two-phase behavior: invalidate now, regenerate on next request
- After server action completes, the client needs to refresh/navigate to see changes
- Consider using `revalidateTag` for more granular control
- For immediate feedback, use optimistic updates on client

**Current codebase pattern (correct):**
```typescript
// src/lib/actions/bio.ts
revalidatePath("/backstage/dashboard/bio");
revalidatePath("/"); // Public homepage - regenerates on NEXT visit
```

**Sources:**
- [Next.js revalidatePath API](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Vercel Blog - Common App Router Mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)

---

### Pitfall 10: Suspense Boundary Placement Outside Data-Fetching Component

**Affects:** Loading skeletons (loading.tsx, Suspense)

**What goes wrong:** Placing Suspense inside a component that does the data fetching, or wrapping a component that receives already-fetched data as props. Suspense must wrap the component that initiates the async work.

**Warning signs:**
- Loading skeleton never appears
- Page hangs with blank screen during data fetch
- Suspense fallback shows once but never again

**Prevention:**
- Suspense must be ABOVE the async component in the tree
- The data fetch must happen INSIDE the suspended component
- Don't pass fetched data as props to a Suspense-wrapped component

**Bad pattern:**
```typescript
// Data fetched here, then passed down - Suspense won't work
async function Page() {
  const data = await fetchData(); // fetch outside Suspense
  return (
    <Suspense fallback={<Skeleton />}>
      <DataDisplay data={data} /> {/* Already has data, won't suspend */}
    </Suspense>
  );
}
```

**Good pattern:**
```typescript
// Component does its own fetching inside Suspense boundary
function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <DataDisplay /> {/* Fetches data internally, triggers Suspense */}
    </Suspense>
  );
}

async function DataDisplay() {
  const data = await fetchData(); // fetch inside - Suspense works
  return <div>{data}</div>;
}
```

**Sources:**
- [freeCodeCamp - Next.js 15 Streaming Handbook](https://www.freecodecamp.org/news/the-nextjs-15-streaming-handbook/)

---

### Pitfall 11: Metadata Streaming Bug (Next.js 15.1+)

**Affects:** SEO metadata (generateMetadata)

**What goes wrong:** In Next.js 15.1+, there's a known issue where dynamically generated metadata can appear in `<body>` instead of `<head>`, or migrate outside the head during client-side navigation. This severely impacts SEO.

**Warning signs:**
- View page source shows meta tags at bottom of body
- SEO tools report missing/malformed metadata
- Metadata correct on hard refresh but wrong after navigation
- Google Search Console shows indexing issues

**Prevention:**
- Use static `metadata` export for SEO-critical pages (homepage, landing pages)
- Only use `generateMetadata` when dynamic metadata is truly necessary
- Test metadata placement with View Source (not DevTools, which normalizes DOM)
- Validate with Facebook Sharing Debugger and Twitter Card Validator

**Current codebase (potentially affected):**
```typescript
// src/app/page.tsx - uses generateMetadata
export async function generateMetadata(): Promise<Metadata> {
  const { bio } = await getPortfolioData();
  return {
    title: bio?.name ? `${bio.name} | Portfolio` : "Portfolio",
    description: bio?.headline || "Personal portfolio website",
  };
}
```

**Safe pattern for critical pages:**
```typescript
// Static metadata - guaranteed in <head>
export const metadata: Metadata = {
  title: "Your Name | Portfolio",
  description: "Personal portfolio website",
  openGraph: {
    title: "Your Name | Portfolio",
    description: "Personal portfolio website",
    type: "website",
  },
};
```

**Sources:**
- [GitHub Discussion #84518](https://github.com/vercel/next.js/discussions/84518)
- [Neural Covenant - Metadata Streaming Controversy](https://neuralcovenant.com/2025/06/the-metadata-streaming-controversy-in-next.js-15.1-/)

---

## Moderate Pitfalls

These cause delays, confusion, or technical debt but are recoverable.

---

### Pitfall 12: Single loading.tsx Blocks Entire Page

**Affects:** Loading skeletons

**What goes wrong:** Using a single `loading.tsx` at the route level causes the ENTIRE page to show the skeleton until ALL data is loaded. This negates the benefits of streaming and parallel data fetching.

**Warning signs:**
- Entire page shows skeleton even for fast-loading sections
- Slow component blocks display of ready components
- No progressive content appearance

**Prevention:**
- Use granular Suspense boundaries around individual sections
- Keep `loading.tsx` lightweight (instant load)
- Wrap each independent data-fetching section separately

**Example for current portfolio structure:**
```typescript
// Instead of one loading.tsx for entire page:
<main>
  <Suspense fallback={<HeroSkeleton />}>
    <HeroSection />
  </Suspense>
  <Suspense fallback={<ProjectsSkeleton />}>
    <ProjectsSection /> {/* Can load independently */}
  </Suspense>
  <Suspense fallback={<ContactSkeleton />}>
    <ContactSection /> {/* Can load independently */}
  </Suspense>
</main>
```

**Sources:**
- [Dev.to - Complete Next.js Streaming Guide](https://dev.to/boopykiki/a-complete-nextjs-streaming-guide-loadingtsx-suspense-and-performance-9g9)

---

### Pitfall 13: Missing Key Prop on Suspense with Dynamic Routes

**Affects:** Loading skeletons

**What goes wrong:** When URL params change (e.g., search params, dynamic segments), Suspense doesn't re-trigger the fallback because React thinks it's the same boundary.

**Warning signs:**
- Changing URL params shows stale content instead of loading state
- Navigation feels "laggy" - content doesn't update smoothly
- Loading skeleton shows on first load but never again

**Prevention:**
- Add `key` prop to Suspense that changes with params
- Use stringified params as key

**Pattern:**
```typescript
export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = use(searchParams);
  return (
    <Suspense key={params.q || 'default'} fallback={<Skeleton />}>
      <Results query={params.q} />
    </Suspense>
  );
}
```

**Sources:**
- [Hashnode - Mastering Loading States](https://rishibakshi.hashnode.dev/mastering-loading-states-in-nextjs-effective-use-of-suspense-and-loadingtsx)

---

### Pitfall 14: revalidatePath Misses Public Page After Admin Update

**Affects:** Cache revalidation

**What goes wrong:** Current codebase revalidates dashboard pages but some actions may miss the public homepage, leaving stale content visible to visitors.

**Warning signs:**
- Admin makes change, dashboard reflects it, public site doesn't
- Inconsistent cache state between routes
- Changes appear after ISR timer (60s) but not immediately

**Prevention:**
- Audit ALL server actions to ensure public routes are revalidated
- Create a helper function for consistent revalidation patterns
- Consider using `revalidateTag` for related data groups

**Current pattern check:**
```typescript
// src/lib/actions/bio.ts - GOOD: revalidates both
revalidatePath("/backstage/dashboard/bio");
revalidatePath("/"); // Public homepage

// Check other actions (skills.ts, projects.ts) do the same
```

**Sources:**
- [Medium - Revalidate Path vs Tag](https://anjitpariyar.medium.com/revalidate-path-vs-revalidate-tag-vs-revalidate-time-next-js-v15-app-router-89db505c2f3f)

---

### Pitfall 15: Open Graph URL Property Causes Metadata Placement Bug

**Affects:** SEO metadata

**What goes wrong:** Adding `url` or `type: "website"` to openGraph metadata can cause all meta tags to render in `<body>` instead of `<head>`.

**Warning signs:**
- Adding openGraph.url breaks metadata placement
- Social sharing previews stop working
- View source shows meta tags after body content

**Prevention:**
- Avoid `url` in openGraph for now (known bug)
- Test thoroughly after any metadata changes
- Use canonical link separately if needed

**Problematic pattern:**
```typescript
// May cause issues in Next.js 15.5+
export const metadata = {
  openGraph: {
    url: "https://example.com", // This can trigger the bug
    type: "website", // This too
  },
};
```

**Sources:**
- [GitHub Issue #83267](https://github.com/vercel/next.js/issues/83267)

---

### Pitfall 16: Motion/Framer Motion Exit Animations Broken with App Router

**Affects:** Loading skeletons, animations (existing MotionProvider)

**What goes wrong:** AnimatePresence exit animations don't work reliably with Next.js App Router. Components unmount before exit animations complete due to router context changes.

**Warning signs:**
- Exit animations never play
- Skeleton-to-content transitions are jarring
- AnimatePresence works in isolation but fails in app

**Prevention:**
- Don't rely on exit animations for critical UX
- Use CSS transitions for fade-out effects instead
- Consider `next-view-transitions` library as alternative
- Use `template.tsx` for page-level transitions

**Current codebase impact:**
The existing MotionProvider uses `reducedMotion="user"` which is fine, but adding AnimatePresence for skeleton->content transitions may not work as expected.

**Sources:**
- [GitHub Issue #49279 - Framer Motion Shared Layout](https://github.com/vercel/next.js/issues/49279)
- [Motion Issue #2411 - Exit Not Working](https://github.com/framer/motion/issues/2411)

---

## Minor Pitfalls

These cause annoyance but are easily fixable.

---

### Pitfall 17: Exposing Detailed Error Messages in Production

**Affects:** Error boundaries

**What goes wrong:** Error messages that are helpful in development get sanitized in production. Developers may be confused when error.tsx shows generic messages.

**Warning signs:**
- Different error messages in dev vs prod
- Can't debug production errors from UI alone

**Prevention:**
- Use `error.digest` to correlate with server logs
- Log errors in useEffect for monitoring
- Design error UI to be helpful without exposing internals

```typescript
"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log to error monitoring service
    console.error('Error:', error.digest, error.message);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong</h2>
      {error.digest && <p>Error ID: {error.digest}</p>}
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

**Sources:**
- [Next.js Error Handling Best Practices](https://devanddeliver.com/blog/frontend/next-js-15-error-handling-best-practices-for-code-and-routes)

---

### Pitfall 18: Client Components Cannot Export Metadata

**Affects:** SEO metadata

**What goes wrong:** Trying to export `metadata` or `generateMetadata` from a client component fails silently or throws an error.

**Warning signs:**
- Metadata export ignored
- Build warning about metadata in client component
- Page has no metadata despite export

**Prevention:**
- Keep page.tsx as server component for metadata
- Use layout.tsx to add metadata for routes that need client-side page.tsx
- Structure: metadata in layout/page (server), interactivity in child components (client)

**Sources:**
- [Next.js generateMetadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

---

### Pitfall 19: Using redirect() Inside try/catch Blocks

**Affects:** Error boundaries, server actions

**What goes wrong:** `redirect()` works by throwing an error. If used inside try/catch, the catch block intercepts it and the redirect never happens.

**Warning signs:**
- Redirect doesn't happen after successful action
- Redirect error appears in catch block logs

**Prevention:**
- Call redirect OUTSIDE try/catch blocks
- Call redirect only after try block completes successfully

```typescript
export async function createPost(formData: FormData) {
  let postId: string;

  try {
    const post = await db.post.create({ ... });
    postId = post.id;
  } catch (error) {
    return { error: "Failed to create post" };
  }

  // redirect AFTER try/catch
  redirect(`/posts/${postId}`);
}
```

**Sources:**
- [Next.js Error Handling Learn](https://nextjs.org/learn/dashboard-app/error-handling)

---

## Integration-Specific Pitfalls (v1.1)

Pitfalls related to integrating polish features with the existing portfolio codebase.

---

### Pitfall 20: ISR revalidate Conflicts with Server Action revalidatePath

**Affects:** Cache revalidation + existing ISR

**What goes wrong:** The homepage has `export const revalidate = 60` (ISR). When server actions call `revalidatePath("/")`, there can be confusion about which takes precedence and when content actually updates.

**Warning signs:**
- Content updates inconsistently
- Sometimes instant, sometimes delayed by up to 60s
- Hard to reproduce timing issues

**Prevention:**
- Understand: `revalidatePath` immediately invalidates, ISR timer is backup
- `revalidatePath` + next visit = fresh content (doesn't wait for timer)
- Test both flows: immediate admin update AND ISR timer regeneration
- Consider removing ISR timer if on-demand revalidation is sufficient

**Current codebase:**
```typescript
// src/app/page.tsx
export const revalidate = 60; // ISR backup

// src/lib/actions/bio.ts
revalidatePath("/"); // On-demand revalidation
```

**Sources:**
- [Next.js ISR Guide](https://nextjs.org/docs/app/guides/incremental-static-regeneration)

---

### Pitfall 21: Loading State Not Visible Due to Fast Prisma Queries

**Affects:** Loading skeletons + existing Prisma setup

**What goes wrong:** Portfolio data loads so fast that loading skeletons flash briefly or never appear, making the feature seem broken or unnecessary.

**Warning signs:**
- Skeleton appears for 50ms then disappears (jarring flash)
- QA reports "loading never shows" but code is correct
- Different behavior in dev vs prod

**Prevention:**
- Test with network throttling (Chrome DevTools)
- Add minimum display time to skeletons if flash is jarring
- Focus skeletons on genuinely slow operations (image loading, external APIs)
- Consider if loading UI is even needed for fast operations

---

### Pitfall 22: MotionProvider Already Wrapping App Conflicts with New Suspense Boundaries

**Affects:** Loading skeletons + existing MotionProvider

**What goes wrong:** Adding Suspense boundaries inside the MotionConfig can cause issues if animated components mount/unmount during streaming. The motion context may not be available during initial render.

**Warning signs:**
- Animation errors in console during page load
- Components render without animations initially
- Hydration mismatch errors

**Prevention:**
- Keep MotionProvider at root (current setup is correct)
- Ensure Suspense fallbacks don't rely on motion context
- Skeleton components should be static (no motion animations)
- Test streaming behavior with animations enabled

**Current structure (good):**
```typescript
// src/app/layout.tsx
<MotionProvider>
  {children}  {/* Suspense boundaries go inside children */}
</MotionProvider>
```

---

### Pitfall 23: getPortfolioData() Parallel Fetch Defeats Granular Suspense

**Affects:** Loading skeletons + existing data layer

**What goes wrong:** The current `getPortfolioData()` fetches ALL data in parallel with `Promise.all`. This is efficient but means you can't have granular Suspense boundaries - the entire page suspends or nothing does.

**Warning signs:**
- Can't show hero before projects load
- Single loading state for entire page
- Refactoring required for streaming benefits

**Prevention:**
- For granular streaming, each section needs its own data fetch
- Keep `getPortfolioData()` for cases where all data is needed at once
- Create section-specific fetchers: `getHeroData()`, `getProjectsData()`
- This is a trade-off: code simplicity vs streaming granularity

**Refactoring path:**
```typescript
// Current: all-at-once
const data = await getPortfolioData();

// For streaming: separate fetches
<Suspense fallback={<HeroSkeleton />}>
  <HeroSection /> {/* calls getHeroData() internally */}
</Suspense>
<Suspense fallback={<ProjectsSkeleton />}>
  <ProjectsSection /> {/* calls getProjectsData() internally */}
</Suspense>
```

---

## v1.1 Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| Tech icons | #6 Bundle size explosion | Use dynamic imports with transpilePackages |
| Error boundaries | #7, #8 Client directive and placement | Follow exact Next.js patterns |
| Loading skeletons | #10, #12, #23 Suspense placement and granularity | May need data layer refactor |
| SEO metadata | #11, #15 Metadata streaming bugs | Use static metadata for homepage |
| Cache revalidation | #9, #20 Timing and ISR interaction | Test both manual and timer flows |

---

## v1.1 Pre-Implementation Checklist

Before implementing each polish feature, verify:

- [ ] **Icons:** Plan for dynamic imports, add transpilePackages config
- [ ] **Error boundaries:** Prepare both error.tsx and global-error.tsx templates
- [ ] **Loading:** Decide granularity level - whole page vs. per-section
- [ ] **Metadata:** Decide static vs. dynamic based on streaming bug status
- [ ] **Revalidation:** Audit all server actions for consistent path coverage

---

## Sources Summary

**Official Documentation:**
- [Next.js revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Next.js error.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/error)
- [Next.js loading.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
- [Next.js generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Lucide React Guide](https://lucide.dev/guide/packages/lucide-react)

**GitHub Issues/Discussions:**
- [Metadata in body bug #83267](https://github.com/vercel/next.js/issues/83267)
- [Metadata streaming discussion #84518](https://github.com/vercel/next.js/discussions/84518)
- [Lucide dynamic import #1576](https://github.com/lucide-icons/lucide/issues/1576)
- [Framer Motion App Router #49279](https://github.com/vercel/next.js/issues/49279)

**Community Resources:**
- [Vercel Blog - Common App Router Mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)
- [freeCodeCamp - Next.js 15 Streaming Handbook](https://www.freecodecamp.org/news/the-nextjs-15-streaming-handbook/)

---

*Pitfalls research: v1.0 (2026-01-22), v1.1 Polish Features (2026-01-25)*
