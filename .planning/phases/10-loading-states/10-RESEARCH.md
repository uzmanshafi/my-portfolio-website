# Phase 10: Loading States - Research

**Researched:** 2026-01-26
**Domain:** CSS skeleton loading animations with Tailwind CSS 4, Next.js 15 App Router
**Confidence:** HIGH

## Summary

This phase implements skeleton loading states for the portfolio page during initial server render. The research focused on three areas: (1) how to create synchronized diagonal shimmer animations using CSS, (2) best practices for skeleton loaders in Next.js App Router, and (3) accessibility considerations for motion-sensitive users.

The standard approach uses Tailwind CSS 4's `@theme` directive to define a custom shimmer animation with CSS keyframes. The shimmer effect uses a diagonal linear gradient that sweeps across skeleton elements. Crucially, using `background-attachment: fixed` ensures all skeleton elements shimmer in sync as a unified effect. For accessibility, the shimmer animation must be disabled for users with `prefers-reduced-motion: reduce` using Tailwind's `motion-safe:` variant.

**Primary recommendation:** Define a custom `--animate-shimmer` animation in `@theme` using the background-position technique with `background-attachment: fixed` for synchronized shimmer across all skeleton elements.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | ^4 | Skeleton styling, custom animations | Already in project, @theme directive perfect for custom shimmer |
| Next.js | 15.5.9 | loading.js file convention | Built-in Suspense boundary with streaming |
| CSS Keyframes | Native | Shimmer animation | No JS library needed, performant |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| motion/react | ^12.29.0 | Already in project | NOT needed for skeletons - pure CSS is better for initial load |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom CSS shimmer | Tailwind's `animate-pulse` | Pulse is a simple opacity fade; shimmer wave is more premium per user decision |
| CSS-only skeleton | react-loading-skeleton | Adds dependency; CSS-only is lighter for SSR |
| `loading.js` file | Inline `<Suspense>` boundaries | `loading.js` is automatic; use Suspense for granular control if needed |

**No additional installation required** - All functionality available with existing stack.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── loading.tsx           # Route-level skeleton (wraps page.tsx in Suspense)
│   └── globals.css           # Add shimmer animation to @theme
└── components/
    └── skeletons/
        ├── hero-skeleton.tsx
        ├── about-skeleton.tsx
        ├── skills-skeleton.tsx
        ├── projects-skeleton.tsx
        ├── contact-skeleton.tsx
        └── section-nav-skeleton.tsx
```

### Pattern 1: Skeleton Component with Shimmer Class
**What:** Create skeleton components that match actual layout structure with a shared shimmer animation class
**When to use:** All skeleton placeholder elements
**Example:**
```tsx
// Source: Tailwind CSS v4 @theme docs + synchronized shimmer pattern

// In globals.css - define the shimmer animation
@theme {
  --animate-shimmer: shimmer 2s ease-in-out infinite;

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
}

// Skeleton base class in globals.css
.skeleton {
  background: linear-gradient(
    100deg,
    var(--color-accent) 0%,
    var(--color-accent) 40%,
    color-mix(in oklch, var(--color-accent), white 30%) 50%,
    var(--color-accent) 60%,
    var(--color-accent) 100%
  );
  background-size: 200% 100%;
  background-attachment: fixed; /* Critical for sync */
  opacity: 0.12; /* 10-15% as specified */
}
```

### Pattern 2: loading.tsx Route File
**What:** Next.js automatically wraps page.tsx with Suspense when loading.tsx exists
**When to use:** For route-level skeleton that appears during initial page load
**Example:**
```tsx
// Source: Next.js App Router docs
// src/app/loading.tsx

export default function Loading() {
  return (
    <main className="relative">
      <SectionNavSkeleton />
      <HeroSkeleton />
      <SkillsSkeleton />
      <ProjectsSkeleton />
      <ContactSkeleton />
    </main>
  );
}
```

### Pattern 3: Mirrored Layout Skeletons
**What:** Each skeleton component mirrors the exact structure of its real counterpart
**When to use:** All section skeletons
**Example:**
```tsx
// Hero skeleton mirrors HeroSection layout exactly
export function HeroSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 md:px-8">
      <div className="max-w-4xl text-center">
        {/* Name - matches h1 sizing */}
        <div className="skeleton h-12 md:h-16 lg:h-20 w-48 md:w-64 mx-auto mb-4 rounded-md motion-safe:animate-shimmer" />

        {/* Title - matches h2 sizing */}
        <div className="skeleton h-8 md:h-10 w-36 md:w-48 mx-auto mb-6 rounded-md motion-safe:animate-shimmer" />

        {/* Headline - 2 lines */}
        <div className="max-w-2xl mx-auto space-y-2 mb-4">
          <div className="skeleton h-6 w-full rounded-md motion-safe:animate-shimmer" />
          <div className="skeleton h-6 w-3/4 mx-auto rounded-md motion-safe:animate-shimmer" />
        </div>

        {/* Location placeholder */}
        <div className="skeleton h-5 w-32 mx-auto mb-8 md:mb-12 rounded-md motion-safe:animate-shimmer" />

        {/* CTA buttons */}
        <div className="flex justify-center gap-4 mt-8 md:mt-12">
          <div className="skeleton h-12 md:h-14 w-32 md:w-40 rounded-lg motion-safe:animate-shimmer" />
          <div className="skeleton h-12 md:h-14 w-36 md:w-44 rounded-lg motion-safe:animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Using animate-pulse for premium feel:** The user decided on shimmer wave, not pulse. Don't default to `animate-pulse`.
- **Un-synchronized animations:** Without `background-attachment: fixed`, each element shimmers independently, looking chaotic.
- **Gray skeletons:** User specified accent color at low opacity, not gray placeholders.
- **Missing reduced motion support:** Forgetting `motion-safe:` prefix will animate for motion-sensitive users.
- **Skeleton layout mismatch:** If skeleton layout doesn't match real content, users experience jarring CLS.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Shimmer animation sync | Individual element animations | `background-attachment: fixed` | CSS handles viewport-relative positioning natively |
| Route-level loading UI | Manual Suspense wrapping | `loading.tsx` file | Next.js auto-wraps with Suspense |
| Reduced motion detection | Custom JS media query | `motion-safe:` / `motion-reduce:` variants | Tailwind handles this declaratively |
| Animation timing | JavaScript timing | CSS `animation` property | More performant, no hydration needed |

**Key insight:** Skeleton loading is primarily a CSS concern. No JavaScript animation library is needed - pure CSS with `@keyframes` and `background-attachment: fixed` provides the best performance for initial page load since it works before JavaScript hydrates.

## Common Pitfalls

### Pitfall 1: Layout Shift (CLS) from Mismatched Dimensions
**What goes wrong:** Skeleton shows, then content loads with different dimensions, causing content to jump
**Why it happens:** Skeleton elements don't match the exact heights/widths of real content
**How to avoid:**
- Use the same Tailwind classes for dimensions (e.g., `h-12`, `max-w-4xl`, `px-6`)
- Measure real component dimensions and replicate in skeleton
- For text blocks, use multiple skeleton lines matching paragraph structure
**Warning signs:** Content "jumps" or shifts when transitioning from skeleton to real content

### Pitfall 2: Skeleton Visible After Content Loads
**What goes wrong:** Both skeleton and real content visible briefly, or skeleton "flashes"
**Why it happens:** Loading.tsx doesn't properly yield to page.tsx, or hydration timing issues
**How to avoid:**
- Use `loading.tsx` file convention (Next.js handles Suspense automatically)
- Don't use `loading.tsx` for pages that load instantly (ISR/static)
- This portfolio uses ISR with 60s revalidate, so initial load is fast
**Warning signs:** Skeleton flashes briefly on navigation even when content is cached

### Pitfall 3: Animation Blocking Main Thread
**What goes wrong:** Shimmer animation causes jank or high CPU usage
**Why it happens:** Using JS animation libraries or animating expensive properties (width, height)
**How to avoid:**
- Use CSS-only animations with `transform` or `background-position`
- Prefer `background-position` animation over pseudo-element transforms for shimmer
- Animation runs on compositor thread, not main thread
**Warning signs:** Frame drops, high CPU in DevTools performance panel

### Pitfall 4: Shimmer on Dark Background Not Visible
**What goes wrong:** Shimmer highlight too subtle to see against dark portfolio background
**Why it happens:** White/light shimmer gradient doesn't contrast enough at low opacity
**How to avoid:**
- Test shimmer visibility against `--color-background: #160f09`
- May need to adjust shimmer highlight to be more prominent
- The accent color `#6655b8` at 10-15% opacity should be visible
**Warning signs:** Skeleton appears static when it should be animated

### Pitfall 5: Ignoring prefers-reduced-motion
**What goes wrong:** Motion-sensitive users experience discomfort
**Why it happens:** Developer forgets to add reduced motion handling
**How to avoid:**
- Always use `motion-safe:animate-shimmer` instead of `animate-shimmer`
- Test with reduced motion enabled in OS settings
- Static skeleton (no animation) is perfectly acceptable fallback
**Warning signs:** Animation plays regardless of OS accessibility settings

## Code Examples

Verified patterns from official sources:

### Custom Shimmer Animation in Tailwind v4 @theme
```css
/* Source: Tailwind CSS v4 @theme docs */
/* Add to src/app/globals.css */

@theme {
  --animate-shimmer: shimmer 2s ease-in-out infinite;

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
}

/* Skeleton base class - outside @theme */
.skeleton {
  background: linear-gradient(
    100deg,
    var(--color-accent) 0%,
    var(--color-accent) 40%,
    color-mix(in oklch, var(--color-accent), white 30%) 50%,
    var(--color-accent) 60%,
    var(--color-accent) 100%
  );
  background-size: 200% 100%;
  background-attachment: fixed;
  opacity: 0.12;
  border-radius: theme(borderRadius.md);
}

/* Reduced motion: static skeleton */
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none !important;
  }
}
```

### Skills Section Skeleton
```tsx
// Mirrors SkillsSection structure
export function SkillsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-8">
      {/* Section heading skeleton */}
      <div className="skeleton h-10 w-24 mb-12 rounded-md motion-safe:animate-shimmer" />

      <div className="space-y-10">
        {/* 3 category groups */}
        {[1, 2, 3].map((category) => (
          <div key={category}>
            {/* Category heading */}
            <div className="skeleton h-7 w-28 mb-4 rounded-md motion-safe:animate-shimmer" />

            {/* Skills grid - 5 columns on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg glass-card"
                >
                  {/* Icon circle */}
                  <div className="skeleton w-5 h-5 rounded-full flex-shrink-0 motion-safe:animate-shimmer" />
                  {/* Skill name */}
                  <div className="skeleton h-4 w-16 rounded-md motion-safe:animate-shimmer" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Projects Bento Grid Skeleton
```tsx
// Mirrors ProjectsSection bento layout
export function ProjectsSkeleton() {
  // Bento pattern: positions 0 = large, 3 = wide, 5 = tall
  const gridItems = [
    { className: "lg:col-span-2 lg:row-span-2" }, // 0: Large
    { className: "" },                              // 1: Standard
    { className: "" },                              // 2: Standard
    { className: "lg:col-span-2" },                 // 3: Wide
    { className: "" },                              // 4: Standard
    { className: "lg:row-span-2" },                 // 5: Tall
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8">
      {/* Section heading */}
      <div className="skeleton h-10 w-28 mb-12 rounded-md motion-safe:animate-shimmer" />

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[220px] grid-flow-dense">
        {gridItems.map((item, index) => (
          <div
            key={index}
            className={`rounded-xl overflow-hidden ${item.className}`}
          >
            <div className="h-full flex flex-col justify-end p-4 md:p-6 glass-card">
              {/* Image area placeholder */}
              <div className="skeleton absolute inset-0 motion-safe:animate-shimmer" />

              {/* Content at bottom */}
              <div className="relative z-10 glass-card-strong rounded-lg p-4">
                {/* Title */}
                <div className="skeleton h-6 w-32 mb-2 rounded-md motion-safe:animate-shimmer" />

                {/* Tech tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[1, 2, 3].map((tag) => (
                    <div
                      key={tag}
                      className="skeleton h-6 w-14 rounded-full motion-safe:animate-shimmer"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### About Section Skeleton with Profile Image
```tsx
export function AboutSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Profile image placeholder - circular */}
        <div className="flex justify-center lg:justify-start">
          <div className="skeleton w-full max-w-xs lg:max-w-md aspect-square rounded-3xl motion-safe:animate-shimmer" />
        </div>

        {/* Text content */}
        <div>
          {/* Heading */}
          <div className="skeleton h-10 w-36 mb-6 rounded-md motion-safe:animate-shimmer" />

          {/* Paragraph lines (2-4 lines per paragraph, 2 paragraphs) */}
          <div className="space-y-4 max-w-prose">
            <div className="space-y-2">
              <div className="skeleton h-5 w-full rounded-md motion-safe:animate-shimmer" />
              <div className="skeleton h-5 w-full rounded-md motion-safe:animate-shimmer" />
              <div className="skeleton h-5 w-3/4 rounded-md motion-safe:animate-shimmer" />
            </div>
            <div className="space-y-2">
              <div className="skeleton h-5 w-full rounded-md motion-safe:animate-shimmer" />
              <div className="skeleton h-5 w-5/6 rounded-md motion-safe:animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Section Nav Skeleton
```tsx
export function SectionNavSkeleton() {
  const sections = 5; // hero, about, skills, projects, contact

  return (
    <nav
      className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-4"
      aria-hidden="true"
    >
      {[...Array(sections)].map((_, i) => (
        <div
          key={i}
          className="skeleton w-3 h-3 rounded-full motion-safe:animate-shimmer"
        />
      ))}
    </nav>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JS animation libraries for shimmer | Pure CSS with keyframes | Always preferred for SSR | Better performance, works before hydration |
| `tailwind.config.js` animations | `@theme` directive in CSS | Tailwind v4 (2024) | CSS-first config, tree-shakable |
| Gray skeleton placeholders | Brand-colored skeletons | UX trend 2023+ | Better brand consistency, more polished |
| Loading spinner | Skeleton screens | UX pattern since ~2018 | Lower perceived wait time |

**Deprecated/outdated:**
- `tailwind.config.js` animation configuration: Use `@theme` in CSS for Tailwind v4
- `animate-pulse` for premium loading: User decided on shimmer wave effect instead

## Open Questions

1. **Geometric Shapes During Skeleton**
   - What we know: Context says geometric shapes should be "visible during loading (static, no animation until content loads)"
   - What's unclear: Should GeometricShapes component render during skeleton, or should skeleton have static shapes?
   - Recommendation: Include GeometricShapes in loading.tsx but with `motion-reduce:` forcing no animation, ensuring shapes appear but don't animate until real content hydrates

2. **ISR Cache Behavior**
   - What we know: Page uses 60s ISR revalidation, so most requests serve cached HTML instantly
   - What's unclear: Will skeleton ever be visible on cached pages?
   - Recommendation: Skeleton primarily shows on first-ever load or cache miss; test with cleared cache

## Sources

### Primary (HIGH confidence)
- Tailwind CSS v4 docs: `@theme` directive, `--animate-*` variables, `motion-safe:` variant
- Next.js App Router docs: `loading.js` file convention, Suspense boundaries, streaming
- MDN: `prefers-reduced-motion`, `background-attachment: fixed`

### Secondary (MEDIUM confidence)
- WebSearch: Synchronized shimmer using `background-attachment: fixed` - multiple sources agree
- WebSearch: CLS prevention with matched skeleton dimensions - multiple sources agree
- WebSearch: 2-second animation duration for calm/premium feel - aligns with user spec

### Tertiary (LOW confidence)
- `color-mix()` for shimmer highlight - CSS Color Level 5, widely supported but verify browser targets

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing project stack, no new dependencies
- Architecture: HIGH - Next.js loading.tsx pattern is well-documented
- CSS Shimmer: HIGH - Multiple sources confirm background-attachment: fixed technique
- Accessibility: HIGH - Tailwind motion-safe/reduce variants are documented
- Pitfalls: MEDIUM - Gathered from multiple sources but some are experience-based

**Research date:** 2026-01-26
**Valid until:** 60 days (stable patterns, no fast-moving dependencies)
