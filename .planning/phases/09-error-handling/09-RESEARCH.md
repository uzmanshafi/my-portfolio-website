# Phase 9: Error Handling - Research

**Researched:** 2026-01-26
**Domain:** Next.js App Router Error Boundaries, Custom Error UI
**Confidence:** HIGH

## Summary

Error handling in Next.js App Router is built on React Error Boundaries with file-based conventions (`error.tsx`, `global-error.tsx`, `not-found.tsx`). The framework provides a clear hierarchy: `error.tsx` catches errors in child route segments but NOT in layouts at the same level, while `global-error.tsx` is required to catch root layout errors and must include its own `<html>` and `<body>` tags.

The user's requirement for a "full page reload on retry" via `window.location.reload()` is actually simpler than the framework's built-in `reset()` function, which has known issues with Server Components - the standard workaround requires combining `router.refresh()` with `reset()` wrapped in `startTransition()`. Since the user explicitly chose full page reload, this sidesteps that complexity entirely.

The current codebase's data layer (`src/lib/data/portfolio.ts`) silently catches all errors and returns null/empty arrays. This pattern prevents error boundaries from ever triggering. To display error pages, the data layer must be modified to throw errors that bubble up to the error boundary.

**Primary recommendation:** Create `error.tsx` at app root and `/backstage/dashboard/` to catch data fetch failures, modify data layer to throw instead of catch, and use `window.location.reload()` for retry per user decision.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.5.9 | Error boundary file conventions | Built-in, no alternatives needed |
| React | 19.1.0 | Error boundary mechanism | Foundation of error handling |
| lucide-react | 0.562.0 | Error page icons | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | - | - | Error handling is native to Next.js |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `window.location.reload()` | `reset()` + `router.refresh()` | Reset preserves layout state but has Server Component issues; reload is simpler and clears all state (user chose reload) |
| Custom logging | next-logger + pino | Adds structured JSON logging; deferred since basic console.error meets requirements |

**Installation:**
```bash
# No additional dependencies needed
# lucide-react already installed for icons
```

## Architecture Patterns

### Recommended Project Structure
```
src/app/
├── error.tsx              # Root error boundary (public portfolio)
├── global-error.tsx       # Root layout errors (must have html/body)
├── not-found.tsx          # Already exists, enhance styling
└── backstage/
    └── dashboard/
        └── error.tsx      # Admin dashboard error boundary
```

### Pattern 1: Throwing Errors from Data Layer
**What:** Modify data fetching functions to throw instead of catch errors
**When to use:** When you want error boundaries to display error UI
**Why needed:** Current pattern catches errors and returns null, hiding failures from users

```typescript
// Source: Official Next.js error handling docs
// BEFORE: Silent failures
export async function getPublicBio(): Promise<Bio | null> {
  try {
    const bio = await prisma.bio.findFirst();
    return bio;
  } catch (error) {
    console.error("Failed to fetch bio:", error);
    return null;  // Error hidden from user!
  }
}

// AFTER: Errors bubble to error boundary
export async function getPublicBio(): Promise<Bio | null> {
  try {
    const bio = await prisma.bio.findFirst();
    return bio;
  } catch (error) {
    console.error(JSON.stringify({
      type: "DatabaseConnectionError",
      operation: "getPublicBio",
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : "Unknown error"
    }));
    throw error;  // Bubbles to error boundary!
  }
}
```

### Pattern 2: Error Boundary with Full Page Reload
**What:** Client component that catches errors and provides retry via reload
**When to use:** When user decision is full page reload for recovery
**Source:** Official Next.js error.tsx API reference

```typescript
// src/app/error.tsx
'use client'

import { useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export default function Error({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void  // Not used - user chose window.reload
}) {
  useEffect(() => {
    // Structured logging to console
    console.error(JSON.stringify({
      type: 'UnhandledError',
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    }))
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
         style={{ backgroundColor: '#160f09', color: '#f3e9e2' }}>
      <WifiOff size={48} className="mb-6 opacity-60" />
      <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h1>
      <p className="mb-8 opacity-70">We're working on it.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 rounded-lg font-medium"
        style={{ backgroundColor: '#6655b8', color: '#f3e9e2' }}
      >
        Try again
      </button>
    </div>
  )
}
```

### Pattern 3: Global Error (Root Layout Fallback)
**What:** Catches errors in root layout itself; must define html/body
**When to use:** Required for production apps
**Source:** Official Next.js global-error.tsx API reference

```typescript
// src/app/global-error.tsx
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#160f09', color: '#f3e9e2', margin: 0 }}>
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <h1 className="text-2xl font-bold mb-4">Something went wrong!</h1>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-lg"
            style={{ backgroundColor: '#6655b8' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
```

### Pattern 4: Keyboard Shortcut for Retry
**What:** R key triggers page reload for power users
**When to use:** User specifically requested this feature
**Source:** User decision in CONTEXT.md

```typescript
'use client'

import { useEffect } from 'react'

export default function Error({ error }: { error: Error }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        window.location.reload()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // ... rest of component
}
```

### Anti-Patterns to Avoid

- **Catching errors silently in data layer:** Current pattern returns null/empty on error - users never see error page. Must throw to trigger error boundary.
- **Using reset() alone with Server Components:** Known issue - reset() doesn't re-trigger server data fetches. Requires `startTransition(() => { router.refresh(); reset() })` workaround. User chose window.reload() which avoids this entirely.
- **Forgetting global-error.tsx:** Root error.tsx cannot catch root layout errors. Always create global-error.tsx for production.
- **Using error.tsx at same level as failing layout:** error.tsx catches child errors, not sibling layout.tsx errors. Place error.tsx in parent directory to catch layout errors.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Error boundary mechanics | Custom error catching HOC | Next.js error.tsx convention | Built-in, handles hydration, SSR edge cases |
| Not found pages | Custom 404 component | Next.js not-found.tsx + notFound() | Proper HTTP status codes, streaming support |
| Root layout error catching | Try/catch in layout | global-error.tsx | Only way to catch root layout errors |

**Key insight:** Next.js error handling is file-based and well-designed. Use the conventions, don't fight them. The only customization needed is the UI inside the error components.

## Common Pitfalls

### Pitfall 1: Silent Data Layer Failures
**What goes wrong:** Error pages never appear even when database is down
**Why it happens:** Data layer catches all errors and returns null/empty arrays
**How to avoid:** Modify data fetching to throw errors, not catch them
**Warning signs:** Errors in server logs but users see empty content instead of error page

### Pitfall 2: reset() Doesn't Re-fetch Server Data
**What goes wrong:** User clicks "Try again" but nothing happens
**Why it happens:** reset() only re-renders client components, doesn't re-trigger server component data fetching
**How to avoid:** Either use `startTransition(() => { router.refresh(); reset() })` or use `window.location.reload()` (user's choice)
**Warning signs:** Console shows new error boundary render but no network requests

### Pitfall 3: error.tsx Can't Catch Layout Errors
**What goes wrong:** App crashes instead of showing error page when layout has error
**Why it happens:** error.tsx wraps children, not siblings like layout.tsx at same level
**How to avoid:** Create global-error.tsx for root layout; for nested layouts, put error.tsx in parent directory
**Warning signs:** Error boundary works for pages but not when layout fails

### Pitfall 4: Missing html/body in global-error.tsx
**What goes wrong:** Broken page rendering when global error activates
**Why it happens:** global-error.tsx replaces root layout, so it must provide html/body
**How to avoid:** Always include complete html/body structure in global-error.tsx
**Warning signs:** Unstyled content, missing CSS when global error shows

### Pitfall 5: Error Digest Mismatch
**What goes wrong:** Can't correlate client-side errors with server logs
**Why it happens:** Server component errors show generic message on client for security
**How to avoid:** Use error.digest property to match with server-side logs
**Warning signs:** Client shows "An error occurred" but server logs show actual error

## Code Examples

Verified patterns from official sources:

### Error Component with Design System Colors
```typescript
// Source: Official Next.js docs + user design system
'use client'

import { useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export default function Error({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Structured console logging per ERRR-04
    console.error(JSON.stringify({
      type: 'RenderError',
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      context: { page: window.location.pathname }
    }))
  }, [error])

  useEffect(() => {
    // R key shortcut per user decision
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        window.location.reload()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        backgroundColor: 'var(--color-background)', // #160f09
        color: 'var(--color-text)'                  // #f3e9e2
      }}
    >
      <WifiOff
        size={48}
        className="mb-6"
        style={{ color: 'var(--color-primary)', opacity: 0.6 }}
      />
      <h1
        className="text-2xl font-bold mb-2"
        style={{ color: 'var(--color-text)' }}
      >
        Oops! Something went wrong.
      </h1>
      <p
        className="mb-8 text-center max-w-md"
        style={{ color: 'var(--color-text)', opacity: 0.7 }}
      >
        We're working on it.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
        style={{
          backgroundColor: 'var(--color-accent)', // #6655b8
          color: 'var(--color-text)'
        }}
      >
        Try again
      </button>
    </main>
  )
}
```

### Admin Error Component with Technical Details
```typescript
// Source: User decision - admin sees more details
'use client'

import { useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export default function AdminError({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(JSON.stringify({
      type: 'AdminDashboardError',
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }))
  }, [error])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8"
          style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>
      <WifiOff size={48} className="mb-6" style={{ opacity: 0.6 }} />
      <h1 className="text-2xl font-bold mb-2">Dashboard Error</h1>
      <p className="mb-4 opacity-70">Something went wrong loading this page.</p>

      {/* Technical details visible on admin page */}
      <div className="mb-8 p-4 rounded-lg max-w-lg w-full"
           style={{ backgroundColor: 'rgba(243,233,226,0.05)', border: '1px solid rgba(243,233,226,0.1)' }}>
        <p className="text-sm font-mono opacity-60 break-all">
          {error.message}
        </p>
        {error.digest && (
          <p className="text-xs font-mono opacity-40 mt-2">
            Digest: {error.digest}
          </p>
        )}
      </div>

      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 rounded-lg font-medium"
        style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text)' }}
      >
        Try again
      </button>
    </main>
  )
}
```

### Structured Server-Side Logging
```typescript
// Source: Best practices for server-side error logging
// Use in data layer when errors occur

function logError(error: unknown, context: {
  operation: string;
  [key: string]: unknown;
}) {
  const errorObj = {
    timestamp: new Date().toISOString(),
    type: error instanceof Error ? error.constructor.name : 'UnknownError',
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  };

  // JSON format for Render logs / log aggregators
  console.error(JSON.stringify(errorObj));
}

// Usage in data layer:
export async function getPublicBio(): Promise<Bio | null> {
  try {
    return await prisma.bio.findFirst();
  } catch (error) {
    logError(error, { operation: 'getPublicBio', table: 'Bio' });
    throw error; // Re-throw to trigger error boundary
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom ErrorBoundary class | File-based error.tsx | Next.js 13 (2022) | Simpler, automatic boundary creation |
| Pages router _error.tsx | App router error.tsx | Next.js 13 (2022) | Per-route error handling |
| try/catch everywhere | Error boundaries + throw | React 16+ | Cleaner data layer, centralized error UI |

**Deprecated/outdated:**
- `_error.tsx` in pages router: Replaced by `error.tsx` in app router
- Class-based ErrorBoundary components: No longer needed, file convention handles it
- getInitialProps error handling: Not applicable to App Router

## Open Questions

Things that couldn't be fully resolved:

1. **Prisma-specific error types**
   - What we know: Prisma throws typed errors (PrismaClientKnownRequestError, etc.)
   - What's unclear: Whether to differentiate these in UI (connection vs query errors)
   - Recommendation: Start with generic error page; can enhance later if needed

2. **Error boundary for API routes**
   - What we know: error.tsx only catches rendering errors, not API route errors
   - What's unclear: How to show branded error for failed API calls made from client
   - Recommendation: Out of scope for Phase 9 which focuses on data fetch failures during SSR

## Sources

### Primary (HIGH confidence)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling) - Error categories, error.tsx patterns, global-error.tsx
- [Next.js error.tsx API Reference](https://nextjs.org/docs/app/api-reference/file-conventions/error) - Props, TypeScript types, requirements
- [Next.js not-found.tsx API Reference](https://nextjs.org/docs/app/api-reference/file-conventions/not-found) - Not found handling patterns
- [Lucide Icons](https://lucide.dev/icons/) - Available connection/network icons: wifi-off, unplug, cloud-off

### Secondary (MEDIUM confidence)
- [Next.js Discussion #50744](https://github.com/vercel/next.js/discussions/50744) - reset() workaround with startTransition + router.refresh()
- [Better Stack Next.js Error Handling](https://betterstack.com/community/guides/scaling-nodejs/error-handling-nextjs/) - Best practices verified against official docs
- [Arcjet Structured Logging](https://blog.arcjet.com/structured-logging-in-json-for-next-js/) - JSON logging patterns for Next.js

### Tertiary (LOW confidence)
- Various WebSearch results on error handling best practices - Cross-verified with official docs where possible

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Next.js documentation
- Architecture: HIGH - File conventions are well-documented
- Pitfalls: HIGH - Verified through official docs and GitHub discussions
- Code examples: HIGH - Based on official API reference with design system colors

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - Next.js error handling is stable)
