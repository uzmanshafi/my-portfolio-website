# Phase 6: Animation + Polish - Research

**Researched:** 2026-01-24
**Domain:** Framer Motion animations, accessibility, production deployment
**Confidence:** HIGH

## Summary

This phase adds smooth, physics-based animations to an existing Next.js 15 / React 19 portfolio application using Motion for React (formerly Framer Motion). The codebase already has all UI components built and styled - this phase purely adds animation behavior and deploys to production.

The animation library has been rebranded from "framer-motion" to "motion" with import path `motion/react`. Version 12.x is fully compatible with React 19. The existing components (HeroSection, ProjectCard, SectionWrapper, GeometricShapes, SkillsSection, AboutSection) are server components or client components that will need strategic "use client" boundaries for animation.

**Primary recommendation:** Install `motion` package, create reusable animation wrapper components (AnimatedSection, AnimatedText, TiltCard), implement accessibility via `useReducedMotion` hook, and deploy to Render.com as a Web Service.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion | ^12.27.0 | React animation library | Official React 19 support, best-in-class scroll animations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | - | - | Motion is batteries-included |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| motion | GSAP | GSAP is more powerful but heavier (40kb vs 16kb), licensing for commercial |
| motion | Motion One | Smaller (6kb) but fewer features, no spring physics |
| motion | CSS animations | No gesture support, harder scroll-triggered, no physics |

**Installation:**
```bash
npm install motion
```

**Import pattern:**
```typescript
import { motion, useReducedMotion } from "motion/react"
```

## Architecture Patterns

### Recommended Component Structure
```
src/
├── components/
│   └── animation/
│       ├── animated-section.tsx    # Scroll-triggered section wrapper
│       ├── animated-text.tsx       # Word-by-word text reveal
│       ├── tilt-card.tsx          # 3D tilt effect for project cards
│       └── motion-config.tsx      # Global MotionConfig provider
├── hooks/
│   └── use-animation-config.ts    # Centralized animation variants
└── app/
    └── components/
        └── portfolio/
            ├── hero-section.tsx   # Add motion to existing
            ├── project-card.tsx   # Wrap with TiltCard
            └── ...
```

### Pattern 1: Scroll-Triggered Reveal with whileInView
**What:** Elements fade and slide up when scrolling into viewport
**When to use:** All section content, skill cards, about text
**Example:**
```typescript
// Source: https://motion.dev/docs/react-scroll-animations
"use client";
import { motion } from "motion/react";

const revealVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut"
    }
  }
};

export function AnimatedSection({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={revealVariants}
    >
      {children}
    </motion.div>
  );
}
```

### Pattern 2: Staggered Children Animation
**What:** Parent orchestrates sequential child animations
**When to use:** Skills grid, project cards, navigation items
**Example:**
```typescript
// Source: https://www.frontend.fyi/tutorials/staggered-text-animations-with-framer-motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,  // 60ms between items (tight cascade)
      delayChildren: 0
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

<motion.div variants={containerVariants} initial="hidden" whileInView="visible">
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Pattern 3: Word-by-Word Text Reveal
**What:** Text animates in word by word with stagger
**When to use:** Hero section name, title, headline
**Example:**
```typescript
// Source: https://www.frontend.fyi/tutorials/staggered-text-animations-with-framer-motion
"use client";
import { motion } from "motion/react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  staggerDelay?: number;
}

export function AnimatedText({ text, className, staggerDelay = 0.08 }: AnimatedTextProps) {
  const words = text.split(" ");

  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } }
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.3, ease: "easeOut" }
            }
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}
```

### Pattern 4: 3D Tilt Card with Mouse Tracking
**What:** Card tilts toward mouse cursor with perspective transform
**When to use:** Project cards in bento grid only
**Example:**
```typescript
// Source: https://stackrant.com/posts/tiltable-cards
"use client";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;  // 5-10 degrees per spec
}

export function TiltCard({ children, className, maxTilt = 8 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Spring config for snappy, no-overshoot feel
  const springConfig = { stiffness: 300, damping: 30 };

  const rotateX = useSpring(useTransform(y, [0, 1], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), springConfig);

  // Shine effect position
  const sheenX = useTransform(x, [0, 1], ["0%", "100%"]);
  const sheenY = useTransform(y, [0, 1], ["0%", "100%"]);

  function handleMouseMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const xPercent = (e.clientX - rect.left) / rect.width;
    const yPercent = (e.clientY - rect.top) / rect.height;

    x.set(xPercent);
    y.set(yPercent);
  }

  function handleMouseLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
      {/* Shine overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{
          background: `radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255,255,255,0.15) 0%, transparent 60%)`,
        }}
      />
    </motion.div>
  );
}
```

### Pattern 5: Reduced Motion Accessibility
**What:** Disable animations when user prefers reduced motion
**When to use:** Wrap entire app or check in each animation component
**Example:**
```typescript
// Source: https://motion.dev/docs/react-accessibility
"use client";
import { MotionConfig, useReducedMotion } from "motion/react";

// Option A: Global config (recommended)
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}

// Option B: Per-component check
export function AnimatedSection({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div>{children}</div>;  // No animation
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
```

### Anti-Patterns to Avoid
- **Animating everything:** Only animate meaningful interactions (reveals, hovers, transitions)
- **Using springs for opacity:** Springs are for transform properties; use tween/easeOut for opacity
- **Forgetting viewport.once:** Scroll animations should play once, not repeat on scroll back
- **Heavy transform on large elements:** Can cause jank; test on mobile
- **Ignoring Server Components:** Motion components need "use client"; wrap minimally

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll-triggered animations | IntersectionObserver + useState | `whileInView` prop | Handles edge cases, cleanup, timing |
| Spring physics | CSS transition timing | `type: "spring"` | Physics-based natural feel |
| Reduced motion detection | window.matchMedia | `useReducedMotion` hook | Reactive, handles changes |
| Mouse tracking transforms | Manual event listeners | `useMotionValue` + `useTransform` | Automatic cleanup, performance optimized |
| Staggered animations | setTimeout chains | `staggerChildren` variant | Declarative, interruptible |

**Key insight:** Motion handles animation lifecycle (mount/unmount/interrupt) correctly - manual implementations often have bugs when users scroll fast or resize viewport.

## Common Pitfalls

### Pitfall 1: Server Component Boundaries
**What goes wrong:** Importing motion components in server components causes build errors
**Why it happens:** Motion uses React hooks internally; server components can't use hooks
**How to avoid:** Create client component wrappers, import those in server components
**Warning signs:** "useState/useEffect" errors at build time

### Pitfall 2: Layout Shift from Initial State
**What goes wrong:** Content jumps when animation starts from `opacity: 0, y: 40`
**Why it happens:** Element takes up space but is invisible, then moves
**How to avoid:** Use `viewport={{ amount: 0.5 }}` so animation triggers when element is partially visible
**Warning signs:** CLS (Cumulative Layout Shift) warnings in Lighthouse

### Pitfall 3: Spring Overshoot Looks Wrong
**What goes wrong:** Elements bounce past target, feels playful not professional
**Why it happens:** Default spring has damping: 10 which allows oscillation
**How to avoid:** Use `{ stiffness: 300, damping: 30 }` for critically damped (no bounce)
**Warning signs:** Card tilt "wobbles" on mouse leave

### Pitfall 4: Performance on Mobile
**What goes wrong:** Animations feel sluggish, drain battery
**Why it happens:** Too many simultaneous transforms, especially on scroll
**How to avoid:**
- Use `viewport={{ once: true }}` to stop tracking after animation
- Limit tilt effect to hover (desktop only)
- Test on real mobile devices
**Warning signs:** Frame drops in DevTools Performance panel

### Pitfall 5: Animation Interruption Issues
**What goes wrong:** Fast scrolling causes elements to freeze mid-animation
**Why it happens:** Manual implementations don't handle interruption
**How to avoid:** Let Motion handle via variants; don't use custom timers
**Warning signs:** Elements stuck at partial opacity

## Code Examples

Verified patterns from official sources:

### Hero Entrance Sequence (Shapes First, Then Text)
```typescript
// Choreography: geometric shapes scale in, then text reveals word-by-word
"use client";
import { motion } from "motion/react";

// For GeometricShapes component
const shapeVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

// Parent orchestration
const heroVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0  // Start immediately per spec
    }
  }
};

// Text comes after shapes (use delayChildren on text container)
const textContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.5  // After shapes finish
    }
  }
};
```

### Snappy No-Overshoot Spring Config
```typescript
// Source: https://motion.dev/docs/react-transitions
// Per spec: "No overshoot - elements stop exactly at target"
const snappySpring = {
  type: "spring",
  stiffness: 300,
  damping: 30,  // High damping = no bounce
};

// Alternative: duration-based with bounce: 0
const preciseSpring = {
  type: "spring",
  duration: 0.35,
  bounce: 0
};
```

### Viewport Configuration for 50% Trigger
```typescript
// Per spec: "Trigger point: 50% visible in viewport"
const viewportConfig = {
  once: true,      // Animate once, stay visible after
  amount: 0.5,     // 50% of element must be visible
};

<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={viewportConfig}
  variants={revealVariants}
>
```

## Deployment Configuration

### Render.com Web Service Setup

**Service Type:** Web Service (required for SSR/ISR/API routes)

**render.yaml:**
```yaml
services:
  - type: web
    name: portfolio
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false  # Set in Dashboard for security
      - key: GITHUB_TOKEN
        sync: false
    disk:
      name: nextjs-cache
      mountPath: /opt/render/project/src/.next/cache
      sizeGB: 1
    healthCheckPath: /api/health
```

**Health Check Endpoint:**
```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({ status: "ok" });
}
```

**next.config.js additions:**
```javascript
// Already configured: images.remotePatterns for Supabase
// ISR cache will persist with disk mount
```

**Environment Variables Needed:**
- `DATABASE_URL` - Supabase/Postgres connection string
- `NEXTAUTH_SECRET` - Auth secret
- `NEXTAUTH_URL` - Production URL
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` - Already configured
- `GITHUB_TOKEN` - For repo sync (if using GitHub integration)

### Node Version
Add to `package.json`:
```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

Or create `.node-version`:
```
20
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package | `motion` package | 2024 | Import from `motion/react` not `framer-motion` |
| Physics spring only | Duration-based spring | FM v10 | `bounce: 0` for easy no-overshoot |
| Manual reduced motion | `reducedMotion="user"` on MotionConfig | FM v10 | Automatic system preference respect |
| AnimatePresence required | whileInView built-in | FM v5 | Simpler scroll animations |

**Deprecated/outdated:**
- `framer-motion` package name: Use `motion` instead (same library, rebranded)
- `useCycle` for simple states: Use standard React useState
- `motion.custom()`: Use `motion()` factory directly

## Open Questions

Things that couldn't be fully resolved:

1. **ISR Cache Persistence on Render**
   - What we know: Render filesystems are ephemeral; disk mount needed for ISR cache
   - What's unclear: Whether current 60s revalidation generates enough cache to matter
   - Recommendation: Configure disk mount anyway; it's cheap insurance

2. **Tilt Effect on Touch Devices**
   - What we know: Mouse events don't fire on touch; tilt won't work
   - What's unclear: Should we add touch-based tilt or just disable?
   - Recommendation: Disable tilt on touch devices; it's not expected UX

## Sources

### Primary (HIGH confidence)
- Motion official docs - scroll animations, transitions, accessibility: https://motion.dev/docs/react-scroll-animations
- Motion transitions documentation: https://motion.dev/docs/react-transitions
- Frontend.fyi staggered text tutorial: https://www.frontend.fyi/tutorials/staggered-text-animations-with-framer-motion
- Render.com Next.js deployment: https://render.com/docs/deploy-nextjs-app, https://render.com/articles/how-to-deploy-next-js-applications-with-ssr-and-api-routes

### Secondary (MEDIUM confidence)
- Stackrant tiltable cards tutorial: https://stackrant.com/posts/tiltable-cards
- Dev.to 3D shiny card animation: https://dev.to/arielbk/how-to-make-a-3d-shiny-card-animation-react-ts-and-framer-motion-ijf
- LogRocket scroll animations guide: https://blog.logrocket.com/react-scroll-animations-framer-motion/

### Tertiary (LOW confidence)
- WebSearch results for spring config optimization (verified against official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official docs confirm motion package, React 19 support
- Architecture patterns: HIGH - Based on official Motion documentation and verified tutorials
- Pitfalls: MEDIUM - Based on community experience and official best practices
- Deployment: HIGH - Based on official Render.com documentation

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days - stable domain)
