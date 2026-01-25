# Features Research: v1.1 Polish Features

**Domain:** Portfolio polish/optimization features
**Researched:** 2026-01-25
**Overall Confidence:** HIGH

---

## 1. Cache Revalidation

**Goal:** Instant public page updates after admin changes (currently 60s ISR delay).

### Table Stakes

| Behavior | Why Expected | Notes |
|----------|--------------|-------|
| Changes appear immediately after save | Admin expects to see updates on public site right away | Currently using `revalidatePath("/")` but ISR still delays |
| No waiting for cache timeout | 60-second delay feels broken to admin | Users refresh, don't see changes, think save failed |
| Works for all content types | Bio, skills, projects, contact, resume all need instant updates | Already calling revalidatePath in all actions |

### Differentiators

| Feature | Value Proposition | Complexity |
|---------|-------------------|------------|
| Visual confirmation that revalidation occurred | Admin sees "Public site updated" toast | Low |
| Pre-warming after revalidation | Fetch public page after revalidate to warm cache | Low |
| Selective revalidation by data type | Only revalidate sections that changed | Medium |

### Expected Behavior

1. **Admin saves content** -> Server action runs -> `revalidatePath("/")` called
2. **Next visit to public site** -> Fresh data served immediately (not stale ISR cache)
3. **Admin can verify** -> Navigate to public site, see changes

**Current Issue Analysis:**

The codebase already uses `revalidatePath("/")` in server actions (see `bio.ts`, line 85). However, `revalidatePath` marks cache as stale for the **next request**, not retroactively. Combined with `export const revalidate = 60` on `page.tsx`, the ISR behavior may still serve stale content from the Full Route Cache.

**Solution Options:**

1. **Remove time-based ISR** - Remove `export const revalidate = 60` from `page.tsx`, rely solely on on-demand revalidation
2. **Lower ISR window** - Reduce to `revalidate = 0` (effectively dynamic rendering) + on-demand revalidation
3. **Use `revalidatePath("/", "layout")`** - More aggressive, clears all child routes too

### UX Considerations

- Admin should not need to understand caching internals
- "Save" button should mean "changes are live"
- Consider adding subtle "Syncing to public site..." indicator during save
- Error handling if revalidation fails (rare but possible)

### Sources

- [Next.js revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) - Official documentation (HIGH confidence)
- [Next.js Caching Guide](https://nextjs.org/docs/app/guides/caching) - Caching layers explained (HIGH confidence)

---

## 2. Error Boundaries

**Goal:** Graceful handling of data fetch failures instead of blank/broken pages.

### Table Stakes

| Behavior | Why Expected | Notes |
|----------|--------------|-------|
| Failed section shows fallback UI, not crash | One broken API call shouldn't break entire portfolio | Expected in any production app |
| User sees helpful message | "Unable to load projects" vs white screen | Basic UX hygiene |
| Recovery option available | "Try again" button to retry failed fetch | Standard error boundary pattern |
| Rest of page remains functional | Layout and navigation still work | Error containment |

### Differentiators

| Feature | Value Proposition | Complexity |
|---------|-------------------|------------|
| Section-level error boundaries | Each section (projects, skills, etc.) fails independently | Medium |
| Graceful degradation content | Show cached/placeholder content on failure | Medium |
| Error reporting integration | Log errors to external service (Sentry, etc.) | Low |
| Auto-retry with backoff | Automatically retry failed fetches | Medium |

### Expected Behavior

**Scenario: Database connection fails**

1. Page load starts, layout renders
2. `getPortfolioData()` fails for projects
3. Projects section shows: "Unable to load projects right now. [Try Again]"
4. Other sections (bio, skills, contact) load normally if their data succeeded

**Scenario: Single section fails**

1. Hero loads (bio data OK)
2. Skills fetch fails -> Shows skeleton or "Skills unavailable"
3. Projects load (data OK)
4. Contact loads (data OK)

### Implementation Pattern (Next.js App Router)

```
app/
  error.tsx          # Root error boundary (catches page-level errors)
  global-error.tsx   # Catches errors in root layout (rare, must include <html>/<body>)
  page.tsx           # Main portfolio page
```

**Key Technical Details:**

- Error boundaries MUST be Client Components (`'use client'`)
- They receive `error` and `reset` props
- `reset()` function attempts re-render of the error boundary's contents
- Errors bubble up to nearest parent boundary
- Event handler errors require manual try-catch (not caught by boundaries)

### UX Considerations

- Error UI should match site design (dark warm theme, not jarring red)
- "Try again" should be obvious but not aggressive
- Consider showing last-known-good data while retrying
- Error messages should be human-readable, not technical
- Loading state after "Try again" to show something is happening

### Sources

- [Next.js Error Handling](https://nextjs.org/docs/app/getting-started/error-handling) - Official documentation (HIGH confidence)
- [Better Stack Error Handling Guide](https://betterstack.com/community/guides/scaling-nodejs/error-handling-nextjs/) - Patterns (MEDIUM confidence)

---

## 3. Loading Skeletons

**Goal:** Visual feedback during initial render instead of blank sections.

### Table Stakes

| Behavior | Why Expected | Notes |
|----------|--------------|-------|
| Skeleton matches actual content layout | Prevents layout shift (CLS) | Google Core Web Vital |
| Instant skeleton display on navigation | No blank white screen | Standard UX pattern |
| Smooth transition to real content | No jarring pop-in | Animation consideration |
| Works with streaming/Suspense | Skeleton shows while data fetches | Next.js App Router pattern |

### Differentiators

| Feature | Value Proposition | Complexity |
|---------|-------------------|------------|
| Section-specific skeletons | Projects grid skeleton vs skills list skeleton | Medium |
| Staggered reveal animation | Content fades in smoothly, not all at once | Low |
| Skeleton pulse animation | Subtle animation shows page is loading | Low |
| Progressive loading | Critical content first, secondary later | Medium |

### Expected Behavior

**Initial Page Load:**

1. Layout renders immediately (nav, background, section wrappers)
2. Each section shows skeleton matching its structure:
   - Hero: Name placeholder bar, title bar, headline bar
   - About: Image placeholder + text block placeholders
   - Skills: Grid of rectangular skill card placeholders
   - Projects: Bento grid with card-shaped placeholders
   - Contact: Icon + text placeholders
3. Real content streams in as data resolves
4. Skeleton fades out, real content fades in

**Navigation (if applicable):**

- Client-side navigation shows loading state immediately
- Prefetched routes may skip loading state entirely

### Implementation Approaches

**Option A: Route-level `loading.tsx`**
```
app/
  loading.tsx   # Shows for entire page during initial load
  page.tsx
```

**Option B: Component-level Suspense** (Recommended for this use case)
```tsx
<Suspense fallback={<ProjectsSkeleton />}>
  <ProjectsSection projects={projects} />
</Suspense>
```

**For this portfolio:**

The page fetches all data in `getPortfolioData()` then passes down. This means either:
1. All-or-nothing loading (single `loading.tsx`)
2. Refactor to fetch per-section for granular loading

Given current architecture, recommend starting with single `loading.tsx` that shows full-page skeleton, then optionally break out sections later.

### Skeleton Design Guidelines

- Use subtle background color: `rgba(211, 177, 150, 0.1)` (primary color at 10%)
- Rounded corners matching actual cards
- Pulse animation: CSS `animate-pulse` or custom
- Match grid layouts exactly (2/3/4/5 columns for skills, bento for projects)
- No text, just shapes approximating content

### UX Considerations

- Skeletons should feel intentional, not broken
- Animation speed: subtle (1-1.5s pulse cycle)
- Don't overdo skeleton detail (simple shapes > complex wireframes)
- Consider skeleton for above-the-fold only, lazy load rest
- Test on slow connections (Chrome DevTools throttling)

### Sources

- [Next.js loading.js Convention](https://nextjs.org/docs/app/api-reference/file-conventions/loading) - Official documentation (HIGH confidence)
- [Next.js Streaming Guide](https://nextjs.org/learn/dashboard-app/streaming) - Patterns (HIGH confidence)
- [freeCodeCamp Streaming Handbook](https://www.freecodecamp.org/news/the-nextjs-15-streaming-handbook/) - Detailed guide (MEDIUM confidence)

---

## 4. SEO Metadata

**Goal:** Open Graph and Twitter Cards for social sharing previews.

### Table Stakes

| Behavior | Why Expected | Notes |
|----------|--------------|-------|
| Shared link shows title and description | Basic social preview | LinkedIn, Twitter, Slack, iMessage |
| Preview image displays | Visual preview image (1200x630) | Most impactful for engagement |
| Correct site name shown | "Your Name - Portfolio" not "localhost:3000" | Professional appearance |
| Twitter-specific card format | Large image card for better engagement | Twitter has own meta tags |

### Differentiators

| Feature | Value Proposition | Complexity |
|---------|-------------------|------------|
| Dynamic OG image with name/title | Personalized preview per deployment | Medium |
| Meta description from bio headline | Content-aware description | Low |
| Canonical URL configuration | SEO best practice | Low |
| JSON-LD structured data | Rich snippets in Google | Medium |

### Expected Behavior

**When portfolio URL is shared on LinkedIn/Twitter/Slack:**

1. Platform fetches URL
2. Reads Open Graph meta tags
3. Displays:
   - **Title:** "Uzi - Full Stack Developer" (from bio.name + bio.title)
   - **Description:** "Building beautiful things" (from bio.headline)
   - **Image:** 1200x630 preview image (profile photo or custom OG image)
4. Link is clickable and leads to portfolio

### Required Meta Tags

```html
<!-- Open Graph (Facebook, LinkedIn, most platforms) -->
<meta property="og:title" content="Name - Title | Portfolio" />
<meta property="og:description" content="Headline from bio" />
<meta property="og:image" content="https://domain.com/og-image.png" />
<meta property="og:url" content="https://domain.com" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Portfolio" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Name - Title | Portfolio" />
<meta name="twitter:description" content="Headline from bio" />
<meta name="twitter:image" content="https://domain.com/og-image.png" />
```

### Implementation in Next.js

**Current state (from `page.tsx`):**
```tsx
export async function generateMetadata(): Promise<Metadata> {
  const { bio } = await getPortfolioData();
  return {
    title: bio?.name ? `${bio.name} | Portfolio` : "Portfolio",
    description: bio?.headline || "Personal portfolio website",
  };
}
```

**Needed additions:**
```tsx
export async function generateMetadata(): Promise<Metadata> {
  const { bio } = await getPortfolioData();

  return {
    title: bio?.name ? `${bio.name} | Portfolio` : "Portfolio",
    description: bio?.headline || "Personal portfolio website",
    metadataBase: new URL('https://your-domain.com'), // Required for OG images
    openGraph: {
      title: `${bio?.name || 'Developer'} - ${bio?.title || 'Portfolio'}`,
      description: bio?.headline || "Personal portfolio website",
      images: ['/og-image.png'], // or bio?.imageUrl for profile photo
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${bio?.name || 'Developer'} - ${bio?.title || 'Portfolio'}`,
      description: bio?.headline || "Personal portfolio website",
      images: ['/og-image.png'],
    },
  };
}
```

### Image Options

1. **Static OG image** - Design a 1200x630 image in Figma, place in `/public/og-image.png`
2. **Profile photo** - Use `bio.imageUrl` if suitable dimensions
3. **Dynamic generation** - Use `ImageResponse` from `next/og` to generate on-demand

**Recommendation:** Start with static image matching site design (dark background, name, title, maybe profile photo). Dynamic generation adds complexity for minimal benefit on a single-page portfolio.

### UX Considerations

- Test with actual sharing (not just validators)
- Image should be recognizable at small sizes (thumbnail)
- Text on image should be readable
- Don't put too much text on OG image (keep it simple)
- Consider how it looks in dark mode chat apps

### Validation Tools

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [opengraph.xyz](https://www.opengraph.xyz/) - General preview tool

### Sources

- [Next.js Metadata & OG Images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) - Official documentation (HIGH confidence)
- [Next.js generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - API reference (HIGH confidence)

---

## 5. Programming Language Icons

**Goal:** Tech-specific logos for skills section instead of generic Lucide icons.

### Table Stakes

| Behavior | Why Expected | Notes |
|----------|--------------|-------|
| Recognizable language logos | JavaScript = JS logo, Python = snake logo | Industry standard |
| Consistent icon style | All icons same visual weight/style | Professional appearance |
| Fallback for unknown tech | Generic icon if specific logo unavailable | Graceful degradation |
| Reasonable bundle size | Only load icons used, not entire library | Performance |

### Differentiators

| Feature | Value Proposition | Complexity |
|---------|-------------------|------------|
| Colored original logos | Full-color brand icons | Low |
| Admin can select from picker | Visual icon selection in dashboard | Medium |
| Automatic icon detection | Infer icon from skill name | Medium |
| Support monochrome mode | Icons adapt to site theme | Low |

### Library Options

| Library | Icons | Bundle Strategy | Notes |
|---------|-------|-----------------|-------|
| **@devicon/react** (Official) | 150+ | Individual imports required | Official devicon React package |
| **devicons-react** | 150+ | Tree-shakeable, individual imports | Community package, well-maintained |
| **react-icons (devicons subset)** | 40,000+ (all sets) | Tree-shakeable | Includes devicons + many others |
| **Simple Icons** | 3,000+ | Brand icons only | Good for company logos |

**Recommendation: `@devicon/react` or `devicons-react`**

Both are built on the comprehensive Devicon library specifically for dev tools and languages. Better coverage for tech stack than generic icon libraries.

### Expected Behavior

**Skills Section:**

1. Skill card shows technology-specific icon (not generic Lucide icon)
2. Icon is recognizable (React = React logo, TypeScript = TS logo)
3. Icons have consistent sizing and visual weight
4. Colors either match original brand OR adapt to site theme

### Implementation Approach

**Current system (from `skill-card.tsx`):**
```tsx
// Uses Lucide icons via string name lookup
const IconComponent = getIconComponent(icon); // "code" -> Code icon
```

**Proposed change:**
```tsx
// Add devicon support alongside Lucide fallback
import { ReactOriginal, TypescriptOriginal } from '@devicon/react';

// Mapping object for known technologies
const deviconMap: Record<string, React.ComponentType> = {
  'react': ReactOriginal,
  'typescript': TypescriptOriginal,
  // ... etc
};

function getIconComponent(iconName: string) {
  // Check devicon map first
  if (deviconMap[iconName.toLowerCase()]) {
    return deviconMap[iconName.toLowerCase()];
  }
  // Fall back to Lucide
  return getLucideIcon(iconName);
}
```

### Icon Coverage Needed (Based on typical portfolio skills)

**Frontend:**
- React, TypeScript, JavaScript, HTML5, CSS3, Tailwind, Next.js, Vue, Angular

**Backend:**
- Node.js, Python, Go, Rust, Java, C#, PHP, Ruby

**Databases:**
- PostgreSQL, MySQL, MongoDB, Redis, SQLite

**Tools/DevOps:**
- Git, GitHub, Docker, AWS, Azure, Linux, VS Code

**All of these are available in Devicon.**

### Admin Experience Considerations

**Option A: Text-based icon name (current)**
- Admin types "react" in icon field
- Pro: Simple, works with any icon system
- Con: Admin must know exact icon names

**Option B: Icon picker UI**
- Admin sees visual grid of available icons
- Pro: No guessing, visual feedback
- Con: More complex admin UI, scope creep

**Recommendation:** Keep text-based for v1.1, add picker in future if needed. Provide list of supported icon names in admin UI help text.

### Bundle Size Considerations

**Bad (imports entire library):**
```tsx
import * as Devicons from 'devicons-react';
```

**Good (imports only used icons):**
```tsx
import { ReactOriginal } from '@devicon/react/react/original';
import { TypescriptOriginal } from '@devicon/react/typescript/original';
```

**Best (dynamic import mapping):**
Create a mapping file that only imports icons actually used in the portfolio. Build-time tree shaking will remove unused imports.

### UX Considerations

- Icons should be immediately recognizable
- Size should match Lucide icons currently used (20x20 or 24x24)
- Consider color vs monochrome based on visual design
- Original colored logos may look busy with dark theme
- Plain/line variants available for cleaner look

### Sources

- [Devicon Official](https://devicon.dev/) - Icon reference (HIGH confidence)
- [@devicon/react](https://www.npmjs.com/package/@devicon/react) - Official React package (HIGH confidence)
- [devicons-react](https://devicons-react.vercel.app/) - Community package documentation (HIGH confidence)
- [react-devicons GitHub](https://github.com/devicons/react-devicons) - Official React implementation (HIGH confidence)

---

## Implementation Priority

Based on user impact and technical complexity:

| Priority | Feature | Impact | Complexity | Notes |
|----------|---------|--------|------------|-------|
| 1 | Cache Revalidation | HIGH | LOW | Already mostly implemented, just needs ISR config fix |
| 2 | SEO Metadata | HIGH | LOW | Quick win for social sharing |
| 3 | Loading Skeletons | MEDIUM | MEDIUM | Improves perceived performance |
| 4 | Error Boundaries | MEDIUM | LOW | Safety net, hopefully rarely triggered |
| 5 | Programming Icons | LOW | MEDIUM | Visual polish, not critical |

---

## Anti-Features (Do Not Build)

| Feature | Why Avoid |
|---------|-----------|
| Real-time cache invalidation via WebSocket | Overkill for personal portfolio |
| A/B testing different OG images | Not enough traffic to matter |
| Error tracking service integration | Can add later if actually needed |
| Icon upload from admin (custom SVGs) | Maintenance burden, security risk |
| Server-side error recovery with retry | Adds complexity, just show error UI |

---

## Summary for Roadmap

These five features form a cohesive "polish" milestone:

1. **Cache Revalidation** - Fix ISR config so admin changes appear instantly
2. **Error Boundaries** - Add `error.tsx` for graceful failure handling
3. **Loading Skeletons** - Add `loading.tsx` with skeleton UI
4. **SEO Metadata** - Extend `generateMetadata` with OG/Twitter tags
5. **Programming Icons** - Add devicon library for tech-specific logos

All features are independent and can be implemented in any order. No feature blocks another. Recommend starting with cache revalidation (highest impact, lowest effort) and ending with programming icons (lowest priority, requires admin UX consideration).
