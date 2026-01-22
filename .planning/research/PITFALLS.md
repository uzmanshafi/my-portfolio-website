# Domain Pitfalls

**Domain:** Next.js Portfolio with Admin Dashboard + GitHub Integration
**Researched:** 2026-01-22
**Confidence:** HIGH (verified with official sources and multiple authoritative references)

## Critical Pitfalls

Mistakes that cause rewrites, security vulnerabilities, or major architectural problems.

---

### Pitfall 1: Middleware-Only Authentication

**What goes wrong:** Relying solely on Next.js middleware for authentication allows attackers to bypass security checks entirely. CVE-2025-29927 demonstrated that middleware can be bypassed through header manipulation (`x-middleware-subrequest`), allowing unauthenticated access to admin panels.

**Why it happens:** Next.js documentation historically promoted middleware as the place for auth checks. Developers assume one authentication layer is sufficient.

**Consequences:**
- Complete admin dashboard access without login
- Ability to modify portfolio content, upload files, or delete data
- Exposed GitHub tokens and database access

**Warning signs:**
- Auth checks only exist in `middleware.ts`
- No authentication verification in API routes
- No server-side checks in page components
- Using Next.js versions 11.1.4 through 15.2.2 without patches

**Prevention:**
```typescript
// WRONG: Middleware-only auth
// middleware.ts
export function middleware(request) {
  if (!isAuthenticated(request)) {
    return NextResponse.redirect('/login');
  }
}

// RIGHT: Multi-layer auth (defense in depth)
// 1. Middleware (first line, can be bypassed)
// 2. API route level
export async function POST(request) {
  const session = await auth(); // Verify again
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
// 3. Data access layer
export async function updateBio(userId, data) {
  const session = await auth();
  if (!session || session.user.id !== userId) throw new Error('Unauthorized');
}
```

**Phase to address:** Authentication setup phase. Implement layered auth from the start.

**Sources:**
- [CVE-2025-29927 Analysis (JFrog)](https://jfrog.com/blog/cve-2025-29927-next-js-authorization-bypass/)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)
- [Auth.js Session Protection](https://authjs.dev/getting-started/session-management/protecting)

---

### Pitfall 2: GitHub API Rate Limit Exhaustion

**What goes wrong:** GitHub API has strict rate limits (60 requests/hour unauthenticated, 5,000/hour authenticated). Portfolio sites that fetch repository data on every page load quickly hit these limits, causing the portfolio to display errors or empty project sections.

**Why it happens:** Developers fetch GitHub data client-side or on every request without caching. Static site generation (SSG) during build can also exhaust limits when fetching many repositories.

**Consequences:**
- Portfolio displays "Unable to load projects" errors
- GitHub API returns 403 responses
- Visitors see broken or empty project sections
- Site appears unprofessional or broken

**Warning signs:**
- GitHub API calls on every page render
- No caching layer for repository data
- Using unauthenticated requests (60/hour limit)
- Fetching full repository data when only metadata is needed

**Prevention:**
```typescript
// WRONG: Fetching on every request
async function ProjectsSection() {
  const repos = await fetch('https://api.github.com/users/x/repos'); // Rate limit death
}

// RIGHT: Use caching with revalidation
// Option 1: ISR with long revalidation
export const revalidate = 3600; // Revalidate hourly

// Option 2: Store selected repos in database
// Admin selects repos -> Save to DB -> Serve from DB
// Only sync with GitHub on admin action or cron job

// Option 3: Use Octokit with throttling + conditional requests
import { Octokit } from '@octokit/core';
import { throttling } from '@octokit/plugin-throttling';

const MyOctokit = Octokit.plugin(throttling);
const octokit = new MyOctokit({
  auth: process.env.GITHUB_TOKEN,
  throttle: {
    onRateLimit: (retryAfter) => true, // Auto-retry
    onSecondaryRateLimit: (retryAfter) => true,
  },
});
```

**Phase to address:** GitHub integration phase. Design caching strategy before implementation.

**Sources:**
- [Octokit Throttling Plugin](https://github.com/octokit/plugin-throttling.js/)
- [Conditional HTTP Requests for GitHub API](https://armel.soro.io/leveraging-conditional-http-requests-and-octokit-hooks-to-avoid-hitting-rate-limits-against-the-github-rest-api/)
- [Next.js GitHub Discussions on Rate Limits](https://github.com/vercel/next.js/discussions/18550)

---

### Pitfall 3: Prisma Connection Pool Exhaustion in Serverless

**What goes wrong:** Each serverless function invocation creates a new database connection. Under load, this exhausts the PostgreSQL connection limit (typically 20-100 connections), causing database errors and request failures.

**Why it happens:** Serverless functions are stateless and ephemeral. Unlike traditional servers with persistent connection pools, each cold start opens new connections. When functions are suspended, they "leak" connections that never close properly.

**Consequences:**
- "Too many connections" database errors
- Admin dashboard becomes unresponsive
- Data operations fail intermittently
- Works fine in development, breaks in production

**Warning signs:**
- Prisma Client instantiated inside function handlers
- No connection pooling configured
- Database and application in different geographic regions
- Errors appear only under load or after deployments

**Prevention:**
```typescript
// WRONG: New client per request
export async function GET() {
  const prisma = new PrismaClient(); // Creates new connection pool each time
  const data = await prisma.bio.findFirst();
  return Response.json(data);
}

// RIGHT: Singleton pattern with global scope
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// For serverless: Use Prisma Accelerate or connection pooler
// DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=..."
```

**Additional measures:**
1. Use a connection pooler (PgBouncer, Supabase Pooler, Neon)
2. Consider Prisma Accelerate for built-in pooling
3. Deploy database and app in same region
4. Use Vercel's Fluid Compute with `attachDatabasePool`

**Phase to address:** Database setup phase. Configure pooling before any database code.

**Sources:**
- [Prisma Vercel Deployment Guide](https://www.prisma.io/docs/orm/prisma-client/deployment/serverless/deploy-to-vercel)
- [Vercel Connection Pooling Guide](https://vercel.com/kb/guide/connection-pooling-with-functions)
- [Prisma + Next.js Pitfalls](https://blog.albingroen.com/posts/prisma-nextjs-and-postgres-pitfalls)

---

### Pitfall 4: Dark Mode Hydration Mismatch

**What goes wrong:** Server renders page with one theme (usually light or unknown), but client immediately switches to user's preferred theme. React detects the mismatch and throws hydration errors, causing flickering or broken UI.

**Why it happens:** Theme preference is stored in localStorage or system preferences, which the server cannot access. The server renders "unknown" state while client knows the actual theme.

**Consequences:**
- Console filled with hydration warnings
- Visible flash of wrong theme on page load
- Theme toggle may not work correctly
- Poor user experience, especially for dark theme users

**Warning signs:**
- "Hydration failed" errors in console
- Flash of light theme before dark theme applies
- `useTheme()` returning undefined on initial render
- Theme-dependent UI showing wrong colors briefly

**Prevention:**
```typescript
// WRONG: Using theme value directly in render
function ThemeIcon() {
  const { theme } = useTheme();
  return theme === 'dark' ? <Moon /> : <Sun />; // Hydration mismatch!
}

// RIGHT: Wait for mount before rendering theme-dependent UI
function ThemeIcon() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // Or skeleton

  return theme === 'dark' ? <Moon /> : <Sun />;
}

// ALSO: Add suppressHydrationWarning to html tag
// layout.tsx
<html lang="en" suppressHydrationWarning>
  <body>
    <ThemeProvider attribute="class" defaultTheme="dark">
      {children}
    </ThemeProvider>
  </body>
</html>
```

**Note for this project:** PROJECT.md specifies "committing to dark theme" with no toggle. This simplifies things significantly - just use `dark` class on `<html>` and skip the theme provider entirely.

**Phase to address:** UI foundation phase. Decide theme strategy before building components.

**Sources:**
- [next-themes GitHub](https://github.com/pacocoursey/next-themes)
- [Fixing Hydration Mismatch (Medium)](https://medium.com/@pavan1419/fixing-hydration-mismatch-in-next-js-next-themes-issue-8017c43dfef9)
- [shadcn/ui Dark Mode Guide](https://ui.shadcn.com/docs/dark-mode/next)

---

### Pitfall 5: Framer Motion SSR Compatibility

**What goes wrong:** Framer Motion components fail to animate or throw errors in Next.js because they require client-side rendering. Animations work in development but break in production or cause hydration issues.

**Why it happens:** Framer Motion uses browser APIs (requestAnimationFrame, DOM measurements) unavailable during server-side rendering. Next.js App Router defaults to Server Components, which are incompatible with Framer Motion.

**Consequences:**
- Animations don't play at all
- Console errors about missing browser APIs
- Animations work inconsistently across browsers
- Performance issues with client-side rendering fallback

**Warning signs:**
- Using Framer Motion without `"use client"` directive
- Animations working in dev but not production
- `window is not defined` errors
- Different animation behavior in different browsers

**Prevention:**
```typescript
// WRONG: Framer Motion in Server Component
// app/page.tsx (Server Component by default)
import { motion } from 'framer-motion';

export default function Page() {
  return <motion.div animate={{ opacity: 1 }} />; // ERROR
}

// RIGHT: Create client component wrapper
// components/AnimatedSection.tsx
'use client';

import { motion } from 'framer-motion';

export function AnimatedSection({ children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {children}
    </motion.section>
  );
}

// Note: For React 19 / Next.js 15+, use motion/react import
import { motion } from 'motion/react'; // Not 'framer-motion'
```

**Performance tips:**
- Use `transform` and `opacity` for hardware-accelerated animations
- Avoid animating `width`, `height`, `left`, `top` (layout properties)
- Use `will-change` sparingly
- Set `viewport={{ once: true }}` for scroll animations (don't re-trigger)

**Phase to address:** Animation implementation phase. Create animation wrapper components early.

**Sources:**
- [Framer Motion Performance Guide](https://motion.dev/docs/performance)
- [Framer Motion + Next.js Compatibility (Medium)](https://medium.com/@dolce-emmy/resolving-framer-motion-compatibility-in-next-js-14-the-use-client-workaround-1ec82e5a0c75)
- [Next.js Framer Motion Discussions](https://github.com/vercel/next.js/discussions/72228)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or degraded user experience.

---

### Pitfall 6: Auth.js (NextAuth) v5 Migration Gotchas

**What goes wrong:** Auth.js v5 has significant breaking changes from v4. Using v4 patterns causes cryptic errors, session issues, or authentication failures.

**Why it happens:** Many tutorials and Stack Overflow answers reference v4 patterns. The migration is recent and documentation is still evolving.

**Consequences:**
- Sessions not persisting across refreshes
- TypeScript errors with session types
- Cookie-related authentication failures
- Credentials provider not working with database sessions

**Warning signs:**
- Using `NEXTAUTH_SECRET` instead of `AUTH_SECRET`
- Importing from `next-auth` instead of `@auth/core`
- Credentials provider with database session strategy
- Session data undefined in client components

**Prevention:**
```typescript
// v5 Environment Variables (v4 names won't work)
AUTH_SECRET=your-32-byte-secret  // Not NEXTAUTH_SECRET
AUTH_TRUST_HOST=true             // For deployment behind proxy

// v5 Import Patterns
import NextAuth from 'next-auth';           // Server-side
import { useSession } from 'next-auth/react'; // Client-side

// v5 Configuration
// auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Credentials({ /* ... */ })],
  // For credentials provider: JWT sessions, NOT database sessions
  session: { strategy: 'jwt' },
});

// Wrap app with SessionProvider at root
// app/layout.tsx
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
```

**Phase to address:** Authentication phase. Read v5 migration guide before starting.

**Sources:**
- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [NextAuth Session Management Issues](https://clerk.com/articles/nextjs-session-management-solving-nextauth-persistence-issues)

---

### Pitfall 7: Image Optimization Neglect

**What goes wrong:** Portfolio images (project screenshots, profile photo) are unoptimized, causing slow page loads, poor Core Web Vitals scores, and layout shift.

**Why it happens:** Developers focus on functionality first, treating image optimization as an afterthought. Using regular `<img>` tags instead of `next/image` loses all built-in optimizations.

**Consequences:**
- Slow Largest Contentful Paint (LCP)
- Layout shift as images load (poor CLS)
- Mobile users experience slow loads
- Portfolio appears unprofessional due to jank

**Warning signs:**
- Using `<img>` instead of `next/image`
- No `width`/`height` props on images
- Large images served to mobile devices
- No `priority` prop on above-fold images

**Prevention:**
```tsx
// WRONG
<img src="/projects/app.png" alt="App screenshot" />

// RIGHT
import Image from 'next/image';

<Image
  src="/projects/app.png"
  alt="App screenshot"
  width={800}
  height={600}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL={blurDataUrl}
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// For remote images (GitHub avatars, etc), configure next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
};
```

**Phase to address:** Visual implementation phase. Use `next/image` from the start.

**Sources:**
- [Next.js Image Optimization Guide](https://nextjs.org/docs/app/getting-started/images)
- [Common Next.js Mistakes (Core Web Vitals)](https://pagepro.co/blog/common-nextjs-mistakes-core-web-vitals/)

---

### Pitfall 8: File Upload Security Vulnerabilities

**What goes wrong:** Admin file uploads (resume PDF) lack proper validation, allowing malicious files, path traversal attacks, or resource exhaustion.

**Why it happens:** Developers trust admin users and skip validation. File upload security is complex and often underestimated.

**Consequences:**
- Malware uploaded to server
- Path traversal exposing sensitive files
- Server resource exhaustion from large files
- XSS via malicious SVG or HTML files

**Warning signs:**
- No file type validation (trusting client-side checks)
- No file size limits
- Storing files with original filenames
- No virus scanning

**Prevention:**
```typescript
// API route for resume upload
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('resume') as File;

  // 1. Validate file type (server-side, not just extension)
  const allowedTypes = ['application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return Response.json({ error: 'Only PDF files allowed' }, { status: 400 });
  }

  // 2. Validate file size
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return Response.json({ error: 'File too large' }, { status: 400 });
  }

  // 3. Generate safe filename (never use original)
  const safeFilename = `resume-${Date.now()}.pdf`;

  // 4. Store outside web root or use signed URLs
  // Consider using cloud storage (S3, Cloudflare R2) instead of local

  // 5. Validate content matches type (magic bytes)
  const buffer = Buffer.from(await file.arrayBuffer());
  const isPdf = buffer.toString('utf8', 0, 4) === '%PDF';
  if (!isPdf) {
    return Response.json({ error: 'Invalid PDF file' }, { status: 400 });
  }
}
```

**Phase to address:** Admin dashboard phase, specifically resume upload feature.

**Sources:**
- [Next.js File Upload Security (MoldStud)](https://moldstud.com/articles/p-handling-file-uploads-in-nextjs-best-practices-and-security-considerations)
- [Next.js Security Checklist (Arcjet)](https://blog.arcjet.com/next-js-security-checklist/)

---

### Pitfall 9: Database/App Geographic Separation

**What goes wrong:** Database is deployed in a different region than the application, causing significant latency on every database query.

**Why it happens:** Developers deploy app to Vercel (auto-region) and database to a different provider (Railway, Supabase) without coordinating regions. Free tiers often have limited region options.

**Consequences:**
- 100-500ms added latency per query
- Admin dashboard feels sluggish
- Page loads slower than necessary
- Compounds with multiple queries per page

**Warning signs:**
- App on Vercel (us-east-1) + Database on Railway (eu-west)
- Network round-trip visible in query times
- Development is fast, production is slow
- "Works fine locally" syndrome

**Prevention:**
```
Deployment checklist:
1. Choose a primary region (e.g., us-east-1)
2. Deploy database in that region
3. Configure Vercel to use that region: vercel.json
   {
     "regions": ["iad1"]  // Match your database region
   }
4. If using edge functions, use a regional database or global provider

Common region mappings:
- Vercel iad1 = AWS us-east-1 (N. Virginia)
- Vercel sfo1 = AWS us-west-1 (N. California)
- Railway us-west = similar to sfo1
- Supabase: Check your project's region in dashboard
```

**Phase to address:** Infrastructure setup phase. Decide regions before deploying anything.

**Sources:**
- [Prisma + Next.js Pitfalls (Region Issues)](https://blog.albingroen.com/posts/prisma-nextjs-and-postgres-pitfalls)
- [Vercel Connection Pooling Guide](https://vercel.com/kb/guide/connection-pooling-with-functions)

---

### Pitfall 10: Content Management Schema Over-Engineering

**What goes wrong:** Database schema for portfolio content becomes overly complex, with generic "content blocks" or "flexible fields" that make simple edits difficult.

**Why it happens:** Developers anticipate future features that never come, or copy patterns from full CMS systems that aren't needed for a personal portfolio.

**Consequences:**
- Simple bio edit requires multiple queries
- Admin UI becomes complex to build
- Data migrations become risky
- Harder to reason about data shape

**Warning signs:**
- Tables like `content_blocks`, `meta_fields`, `field_values`
- JSON blobs instead of typed columns
- "This will be flexible for the future"
- More than 10 tables for a portfolio

**Prevention:**
```prisma
// WRONG: Over-engineered
model Content {
  id        String   @id
  type      String   // 'bio', 'skill', 'project'
  data      Json     // Flexible but untyped
  metadata  Json     // More flexibility!
}

// RIGHT: Simple, typed models
model Bio {
  id          String   @id @default(cuid())
  headline    String
  description String   @db.Text
  avatarUrl   String?
  updatedAt   DateTime @updatedAt
}

model Skill {
  id       String @id @default(cuid())
  name     String
  icon     String // Lucide icon name
  category String
  order    Int    @default(0)
}

model Project {
  id           String   @id @default(cuid())
  title        String
  description  String   @db.Text
  githubUrl    String?
  liveUrl      String?
  imageUrl     String?
  featured     Boolean  @default(false)
  order        Int      @default(0)
  // GitHub sync fields
  githubRepoId String?  @unique
  stars        Int?
  languages    Json?    // Array of languages
}

model Resume {
  id        String   @id @default(cuid())
  fileUrl   String
  fileName  String
  updatedAt DateTime @updatedAt
}

model Contact {
  id       String  @id @default(cuid())
  email    String
  github   String?
  linkedin String?
  twitter  String?
}
```

**Phase to address:** Database schema phase. Start simple, add complexity only when needed.

---

## Minor Pitfalls

Annoyances that are easily fixable but good to avoid.

---

### Pitfall 11: Environment Variable Confusion

**What goes wrong:** Environment variables work locally but not in production, or vice versa. Client-side code can't access server-only variables.

**Prevention:**
```
Naming conventions:
- NEXT_PUBLIC_*  = Available in browser (be careful what you expose!)
- DATABASE_URL   = Server-only
- AUTH_SECRET    = Server-only

Common mistakes:
- Using process.env.VAR in client component (undefined)
- Forgetting to add vars to Vercel/Render dashboard
- Committing .env to git (add to .gitignore!)
- Using .env.local for production secrets

Verification:
console.log('Server var:', process.env.DATABASE_URL ? 'SET' : 'MISSING');
console.log('Client var:', process.env.NEXT_PUBLIC_APP_URL);
```

---

### Pitfall 12: Missing Loading and Error States

**What goes wrong:** Admin dashboard or portfolio sections show blank screens during data fetching, or display cryptic errors on failure.

**Prevention:**
```typescript
// Use Next.js loading.tsx and error.tsx conventions
// app/admin/loading.tsx
export default function Loading() {
  return <AdminSkeleton />;
}

// app/admin/error.tsx
'use client';
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// For granular loading states, use Suspense
import { Suspense } from 'react';
<Suspense fallback={<ProjectsSkeleton />}>
  <ProjectsList />
</Suspense>
```

---

### Pitfall 13: Ignoring TypeScript Strict Mode

**What goes wrong:** TypeScript errors are ignored or suppressed, leading to runtime crashes that could have been caught at build time.

**Prevention:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}

// Don't use:
// @ts-ignore
// @ts-expect-error (unless truly expected)
// as any
```

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| Project Setup | Wrong Next.js version with known CVEs | Use Next.js 15.3+ or latest patched version |
| Database Setup | Connection pool exhaustion | Configure pooler before writing any Prisma code |
| Authentication | Middleware-only auth | Implement layered auth from the start |
| GitHub Integration | Rate limit exhaustion | Design caching strategy before API calls |
| Admin Dashboard | File upload vulnerabilities | Validate server-side, never trust client |
| Animation Implementation | Hydration mismatches | Create 'use client' wrapper components |
| Deployment | Region mismatch latency | Coordinate app and database regions |
| Resume Upload | Path traversal / malware | Generate safe filenames, validate content |

---

## Pre-Implementation Checklist

Before starting each major feature, verify:

- [ ] **Auth:** Multi-layer authentication planned (not middleware-only)?
- [ ] **Database:** Connection pooling configured for serverless?
- [ ] **GitHub:** Caching strategy for API responses?
- [ ] **Images:** Using `next/image` with proper optimization?
- [ ] **Animations:** 'use client' wrappers for Framer Motion?
- [ ] **File Upload:** Server-side validation for type, size, content?
- [ ] **Environment:** Variables properly scoped (NEXT_PUBLIC_ vs server-only)?
- [ ] **Regions:** Database and app co-located geographically?
- [ ] **Schema:** Simple, typed models (not over-engineered)?
- [ ] **Error Handling:** Loading and error states for all async operations?

---

## Sources Summary

**Security (HIGH confidence - official sources):**
- [Next.js Security Guide](https://nextjs.org/docs/app/guides/authentication)
- [CVE-2025-29927 Analysis](https://jfrog.com/blog/cve-2025-29927-next-js-authorization-bypass/)
- [Auth.js Protection Docs](https://authjs.dev/getting-started/session-management/protecting)

**Database (HIGH confidence - Prisma/Vercel official):**
- [Prisma + Vercel Deployment](https://www.prisma.io/docs/orm/prisma-client/deployment/serverless/deploy-to-vercel)
- [Vercel Connection Pooling](https://vercel.com/kb/guide/connection-pooling-with-functions)

**GitHub API (MEDIUM confidence - community verified):**
- [Octokit Throttling Plugin](https://github.com/octokit/plugin-throttling.js/)
- [Conditional Requests for Rate Limits](https://armel.soro.io/leveraging-conditional-http-requests-and-octokit-hooks-to-avoid-hitting-rate-limits-against-the-github-rest-api/)

**Animation/UI (HIGH confidence - official docs):**
- [Framer Motion Performance](https://motion.dev/docs/performance)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Next.js Image Optimization](https://nextjs.org/docs/app/getting-started/images)

---

*Pitfalls research: 2026-01-22*
