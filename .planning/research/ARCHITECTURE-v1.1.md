# Architecture Research: v1.1 Polish Features

**Project:** Portfolio v1.1 Polish
**Researched:** 2026-01-25
**Confidence:** HIGH (verified against Next.js 15 official documentation)

## Current Architecture Summary

The portfolio uses Next.js 15 App Router with:
- Server Components for public pages (`src/app/page.tsx`)
- ISR with 60-second revalidation (`export const revalidate = 60`)
- Server Actions for admin CRUD (`src/lib/actions/*.ts`)
- Prisma for database queries
- Motion (Framer Motion) for animations

---

## Integration Map

### 1. Cache Revalidation

**Current State:**
- `revalidatePath()` already used in some actions (bio.ts, resume.ts, skills.ts, projects.ts, github.ts)
- Missing from: contact.ts, social-links.ts

**Existing files to modify:**

| File | Current State | Change Needed |
|------|---------------|---------------|
| `src/lib/actions/contact.ts` | No revalidation | Add `revalidatePath("/")` after updateContact |
| `src/lib/actions/social-links.ts` | No revalidation | Add `revalidatePath("/")` after all mutations |

**Pattern to follow (from existing bio.ts):**
```typescript
import { revalidatePath } from "next/cache";

// After successful mutation:
revalidatePath("/backstage/dashboard/[section]");
revalidatePath("/"); // Public homepage
```

**Data flow:**
```
Admin saves contact/social-links
  -> Server Action mutates database
  -> revalidatePath("/") invalidates ISR cache
  -> Next request to "/" fetches fresh data
```

**Important:** The public page uses ISR (`revalidate = 60`), so `revalidatePath("/")` will:
1. Immediately mark the Full Route Cache as stale
2. Next visit regenerates the page with fresh data

**New files:** None required

---

### 2. Error Boundaries (error.tsx)

**Current State:**
- No error.tsx files exist in the project
- Errors would bubble to Next.js default error page

**New files to create:**

| File | Purpose |
|------|---------|
| `src/app/error.tsx` | Root error boundary for public pages |
| `src/app/backstage/error.tsx` | Error boundary for admin section |

**Integration points:**

```
src/app/
  layout.tsx        <- Wraps everything
  error.tsx         <- NEW: Catches errors from page.tsx and children
  page.tsx          <- Server component, errors caught by error.tsx
  backstage/
    error.tsx       <- NEW: Catches admin-specific errors
    dashboard/
      [sections]    <- Errors bubble up to backstage/error.tsx
```

**Required component signature:**
```typescript
'use client' // REQUIRED - Error boundaries must be Client Components

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // error.message: Generic for server errors, original for client errors
  // error.digest: Hash for server-side log correlation
  // reset(): Re-renders the error boundary contents
}
```

**Data flow:**
```
Error thrown in page.tsx (Server Component)
  -> Error boundary catches it
  -> error.message is generic (security)
  -> error.digest maps to server logs
  -> reset() triggers full re-render attempt
```

**Styling consideration:** Match existing portfolio aesthetics using CSS variables (`--color-background`, `--color-text`, `--color-primary`).

---

### 3. Loading Skeletons (loading.tsx)

**Current State:**
- No loading.tsx files exist
- Page loads show blank content until ISR completes

**New files to create:**

| File | Purpose |
|------|---------|
| `src/app/loading.tsx` | Loading skeleton for public portfolio |

**Integration points:**

```
src/app/
  layout.tsx        <- Persists during navigation
  loading.tsx       <- NEW: Shows while page.tsx streams
  page.tsx          <- Async server component
```

**How it works:**
- Next.js automatically wraps `page.tsx` in `<Suspense fallback={<Loading />}>`
- `loading.tsx` renders immediately while `getPortfolioData()` fetches
- Content streams in progressively, replacing skeleton

**Skeleton structure should mirror page.tsx sections:**
```
- Hero section skeleton (name placeholder, title placeholder)
- About section skeleton
- Skills section skeleton (grid of card placeholders)
- Projects section skeleton
- Contact section skeleton
```

**Implementation approach:**
```typescript
// src/app/loading.tsx
export default function Loading() {
  return (
    <main className="relative">
      <HeroSkeleton />
      <SectionDivider />
      <AboutSkeleton />
      {/* ... */}
    </main>
  );
}
```

**Optional component-level Suspense (for granular loading):**
```typescript
// In page.tsx, could wrap individual sections
<Suspense fallback={<SkillsSkeleton />}>
  <SkillsSection skills={skills} />
</Suspense>
```

**Recommendation:** Start with page-level `loading.tsx`. Component-level Suspense adds complexity and the portfolio data loads as a single `getPortfolioData()` call anyway.

---

### 4. SEO Metadata Enhancement

**Current State:**
- Root layout.tsx has static metadata (generic)
- page.tsx has `generateMetadata()` using bio data (already dynamic)

**Existing files to modify:**

| File | Current | Enhancement |
|------|---------|-------------|
| `src/app/layout.tsx` | Basic title/description | Add metadataBase, title template, viewport |
| `src/app/page.tsx` | Dynamic title/description only | Add OpenGraph, Twitter, robots |

**Current generateMetadata (page.tsx):**
```typescript
export async function generateMetadata(): Promise<Metadata> {
  const { bio } = await getPortfolioData();
  return {
    title: bio?.name ? `${bio.name} | Portfolio` : "Portfolio",
    description: bio?.headline || "Personal portfolio website",
  };
}
```

**Enhanced metadata pattern:**
```typescript
export async function generateMetadata(): Promise<Metadata> {
  const { bio } = await getPortfolioData();

  const title = bio?.name ? `${bio.name} | Portfolio` : "Portfolio";
  const description = bio?.headline || "Personal portfolio website";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_US",
      // siteName, images if available
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    // canonical URL if deploying to custom domain
  };
}
```

**Layout.tsx enhancements:**
```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: "Portfolio",
    template: "%s | Portfolio", // For child pages
  },
  description: "Personal portfolio website",
  // Add viewport, themeColor, icons
};
```

**File-based metadata to consider:**
```
src/app/
  favicon.ico         <- Already may exist
  opengraph-image.png <- NEW: Default OG image
  robots.txt          <- NEW: Crawling rules
  sitemap.xml         <- NEW: Site structure (or generate dynamically)
```

---

### 5. Programming Language Icons

**Current State:**
- Skills use Lucide icons (`src/app/components/portfolio/skill-card.tsx`)
- Icons stored as lowercase Lucide names in database (e.g., "code", "database")
- Admin enters icon name manually in text input

**Problem:** Lucide icons are generic (Code, Database, Server). Programming languages need specific logos (TypeScript, React, Python).

**Solution Options:**

| Option | Pros | Cons |
|--------|------|------|
| **devicons-react** | Purpose-built, active (v1.5.0), 200+ dev icons | New dependency, ~500KB |
| **react-icons (Di*)** | Already includes Devicons, huge library | Large bundle if not tree-shaking |
| **Simple Icons via SVG** | No dependency, exact brand colors | Manual SVG management |

**Recommended:** `devicons-react` - focused, actively maintained, tree-shakeable.

**Files to modify:**

| File | Change |
|------|--------|
| `src/app/components/portfolio/skill-card.tsx` | Support both Lucide (generic) and Devicons (languages) |
| `src/app/backstage/dashboard/skills/skills-manager.tsx` | Add icon picker UI |
| `src/lib/validations/skill.ts` | Update schema to include icon type |
| Database schema (optional) | Add `iconType` field to Skill model |

**Integration approach:**

Option A - Prefix Convention (simpler, no schema change):
```typescript
// Icon name: "devicon:typescript" or "lucide:code"
// skill-card.tsx parses prefix to choose icon library
const [library, iconName] = icon.includes(':')
  ? icon.split(':')
  : ['lucide', icon]; // Default to lucide for backwards compatibility
```

Option B - Separate Field (cleaner, requires migration):
```typescript
// Skill model adds: iconType: "lucide" | "devicon"
// skill-card.tsx checks iconType field
```

**Recommendation:** Option A (prefix convention) for v1.1 - no schema migration needed, backwards compatible.

**Icon picker UI approach:**
- Create searchable dropdown with icon previews
- Show both Lucide (generic) and Devicons (languages) categories
- Store selected icon with library prefix

**Data flow:**
```
Admin selects icon from picker
  -> Stores "devicon:react" or "lucide:code" in database
  -> skill-card.tsx parses prefix
  -> Renders appropriate icon component
```

---

## Suggested Build Order

Based on dependencies and complexity:

| Order | Feature | Rationale |
|-------|---------|-----------|
| 1 | **Cache revalidation** | Smallest change, immediate benefit, 2 files |
| 2 | **SEO metadata** | Enhances existing generateMetadata, no new patterns |
| 3 | **Error boundaries** | New files but isolated, uses existing styling |
| 4 | **Loading skeletons** | New files, needs skeleton component design |
| 5 | **Programming icons** | Most complex: new dependency, UI picker, backwards compat |

**Rationale:**
1. Cache revalidation is a 2-line change per file - quick win
2. SEO metadata extends existing pattern in page.tsx
3. Error boundaries are self-contained client components
4. Loading skeletons require design work (matching page structure)
5. Programming icons require: npm install, new components, icon picker UI, backwards compatibility logic

---

## Dependencies Between Features

```
Cache Revalidation -----> Independent (do first)

SEO Metadata -----------> Independent (can parallelize)

Error Boundaries -------> Independent (can parallelize)

Loading Skeletons ------> Independent, but benefits from
                          error boundaries being in place
                          (loading shows, then error if fails)

Programming Icons ------> Independent, but largest scope
```

**Parallelization opportunity:** Features 1-4 are independent and could be done in parallel by different phases or developers. Feature 5 (icons) is self-contained but larger.

---

## File Summary

### Files to Modify

| File | Feature | Changes |
|------|---------|---------|
| `src/lib/actions/contact.ts` | Cache | Add revalidatePath("/") |
| `src/lib/actions/social-links.ts` | Cache | Add revalidatePath("/") to mutations |
| `src/app/layout.tsx` | SEO | Add metadataBase, title template |
| `src/app/page.tsx` | SEO | Enhance generateMetadata with OG/Twitter |
| `src/app/components/portfolio/skill-card.tsx` | Icons | Support devicons-react |
| `src/app/backstage/dashboard/skills/skills-manager.tsx` | Icons | Add icon picker UI |

### New Files to Create

| File | Feature | Purpose |
|------|---------|---------|
| `src/app/error.tsx` | Error | Root error boundary |
| `src/app/backstage/error.tsx` | Error | Admin error boundary |
| `src/app/loading.tsx` | Loading | Public page skeleton |
| `src/app/opengraph-image.png` | SEO | Default OG image (optional) |

---

## Risk Assessment

| Feature | Risk | Mitigation |
|---------|------|------------|
| Cache revalidation | LOW | Pattern already exists in codebase |
| SEO metadata | LOW | Extending existing generateMetadata |
| Error boundaries | LOW | Standard Next.js pattern |
| Loading skeletons | MEDIUM | Need to match page layout exactly |
| Programming icons | MEDIUM | New dependency, UI complexity |

---

## Sources

### Cache Revalidation
- [Next.js revalidatePath Documentation](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) - Official API reference
- [Next.js Caching and Revalidating Guide](https://nextjs.org/docs/app/getting-started/caching-and-revalidating) - Official caching guide

### Error Boundaries
- [Next.js error.js File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/error) - Official API reference
- [Next.js Error Handling](https://nextjs.org/docs/app/getting-started/error-handling) - Official guide

### Loading UI
- [Next.js loading.js File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/loading) - Official API reference
- [Next.js Loading UI and Streaming](https://nextjs.org/docs/14/app/building-your-application/routing/loading-ui-and-streaming) - Official guide

### SEO Metadata
- [Next.js generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - Official API reference
- [Next.js Metadata and OG Images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) - Official guide

### Programming Icons
- [devicons-react npm](https://www.npmjs.com/package/devicons-react) - Latest v1.5.0
- [react-icons](https://react-icons.github.io/react-icons/) - Includes Devicons
