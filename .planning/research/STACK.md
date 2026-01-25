# Technology Stack

**Project:** Portfolio Website with Admin Dashboard
**Researched:** 2026-01-22
**Updated:** 2026-01-25 (v1.1 Polish Features)
**Overall Confidence:** HIGH

---

## Executive Summary

This stack transforms a static HTML portfolio into a modern full-stack Next.js application with an admin CMS and GitHub integration. The recommendations prioritize:

1. **Developer experience** - Type safety, excellent tooling, fast iteration
2. **Production readiness** - Battle-tested libraries with active maintenance
3. **Bundle efficiency** - Tree-shakeable, modern ESM packages
4. **Deployment simplicity** - Works seamlessly with Vercel/Railway/Render

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Confidence | Rationale |
|------------|---------|---------|------------|-----------|
| **Next.js** | 15.5+ | Full-stack React framework | HIGH | Industry standard for React apps in 2026. App Router provides server components, server actions, and API routes. Turbopack delivers 5x faster builds. React 19 support enables concurrent rendering. |
| **React** | 19.x | UI library | HIGH | Required by Next.js 15. New features like use() hook, server components, and improved Suspense handling. |
| **TypeScript** | 5.4+ | Type safety | HIGH | Non-negotiable for maintainability. Next.js 15.5 has improved typed routes for compile-time route validation. |

### Database & ORM

| Technology | Version | Purpose | Confidence | Rationale |
|------------|---------|---------|------------|-----------|
| **PostgreSQL** | 16.x | Primary database | HIGH | Production-ready, excellent Prisma support. Recommended over SQLite for serverless deployments (connection pooling). |
| **Prisma ORM** | 7.2+ | Database access | HIGH | Prisma 7 is a major upgrade: 3x faster queries, 90% smaller bundles, pure TypeScript (no Rust binary). New mapped enums, improved type generation (98% fewer types to evaluate), and built-in Prisma Studio. |

### Authentication

| Technology | Version | Purpose | Confidence | Rationale |
|------------|---------|---------|------------|-----------|
| **Auth.js (NextAuth v5)** | 5.x | Authentication framework | HIGH | De facto standard for Next.js auth. Stable for Next.js 15+, simplified `auth()` function, adapter for Prisma. Single admin user can use Credentials provider with Argon2 password hashing. |
| **@auth/prisma-adapter** | latest | Database sessions | HIGH | Seamless Prisma integration for session persistence. |
| **jose** | 5.x | JWT for Edge Runtime | HIGH | Required for middleware authentication. The `jsonwebtoken` package does NOT work in Edge Runtime. Jose uses Web Crypto APIs and is Edge-compatible. |
| **argon2** | 0.40+ | Password hashing | HIGH | Winner of Password Hashing Competition. More secure than bcrypt against GPU/ASIC attacks. Memory-hard design. Use `argon2id` type. |

### Styling & UI

| Technology | Version | Purpose | Confidence | Rationale |
|------------|---------|---------|------------|-----------|
| **Tailwind CSS** | 4.x | Utility-first CSS | HIGH | Major v4 rewrite: 5x faster builds, CSS-first configuration with `@theme` directive, native container queries, OKLCH colors. Single `@import "tailwindcss"` setup. |
| **shadcn/ui** | latest | Component library | HIGH | Copy-paste components built on Radix UI + Tailwind. Full code ownership. New `shadcn/create` tool for project scaffolding. Includes admin-ready components. |
| **Radix UI** | latest | Headless primitives | HIGH | Foundation of shadcn/ui. WAI-ARIA compliant, 130M+ monthly downloads, used by Vercel, Linear, Supabase. |
| **Lucide React** | 0.562+ | Icons | HIGH | 1,667 tree-shakeable SVG icons. Fully typed React components. Consistent, professional look. No emojis. |

### Animation

| Technology | Version | Purpose | Confidence | Rationale |
|------------|---------|---------|------------|-----------|
| **Framer Motion** | 12.27+ | Animations | HIGH | Industry standard for React animation. Physics-based, declarative API. Improved layout animations with React 19, AnimatePresence for exit animations. MIT licensed. |

### Data Fetching & State

| Technology | Version | Purpose | Confidence | Rationale |
|------------|---------|---------|------------|-----------|
| **TanStack Query** | 5.90+ | Server state management | HIGH | Handles caching, background updates, stale-while-revalidate. 40-70% faster initial loads when combined with React Server Components. Essential for GitHub API data and admin dashboard. |
| **Octokit** | 5.0+ | GitHub API client | HIGH | Official GitHub SDK. TypeScript types, both REST and GraphQL support. For fetching repos, use REST API - simpler for this use case (limited data needs). |

### Forms & Validation

| Technology | Version | Purpose | Confidence | Rationale |
|------------|---------|---------|------------|-----------|
| **React Hook Form** | 7.x | Form management | HIGH | Uncontrolled components for performance. Excellent DX with TypeScript. |
| **Zod** | 3.x | Schema validation | HIGH | TypeScript-first validation. Same schema validates client AND server (Server Actions). Integrates via `@hookform/resolvers`. |
| **@hookform/resolvers** | latest | RHF + Zod bridge | HIGH | Standard integration pattern. |

### Drag and Drop

| Technology | Version | Purpose | Confidence | Rationale |
|------------|---------|---------|------------|-----------|
| **dnd-kit** | 6.x | Drag and drop | HIGH | Modern, lightweight, accessible. `react-beautiful-dnd` is DEPRECATED (archived by Atlassian). dnd-kit offers collision detection strategies, sorting strategies, custom placeholders. |

### File Storage

| Technology | Version | Purpose | Confidence | Rationale |
|------------|---------|---------|------------|-----------|
| **UploadThing** | latest | File uploads | MEDIUM | Simplest setup for Next.js. S3-compatible backend. Alternative: direct S3 with presigned URLs if you need more control. |

### Notifications

| Technology | Version | Purpose | Confidence | Rationale |
|------------|---------|---------|------------|-----------|
| **Sonner** | latest | Toast notifications | HIGH | Modern, lightweight, beautiful defaults. Built for React 18+. First-class shadcn/ui integration. Recommended over react-toastify for new projects. |

---

## v1.1 Polish Features - Stack Additions (2026-01-25)

The v1.1 polish features require **minimal stack additions**. Most capabilities are built into Next.js 15 already:

| Feature | Stack Change | Rationale |
|---------|--------------|-----------|
| Cache revalidation | **None** | Already using `revalidatePath` correctly |
| Error boundaries | **None** | Built-in `error.tsx` convention |
| Loading skeletons | **None** | Built-in `loading.tsx` convention |
| SEO metadata | **Add 1 dev dependency** | `schema-dts` for typed JSON-LD |
| Tech icons | **Add 1 dependency** | `devicons-react` for branded tech logos |

### New: Tech/Programming Language Icons

| Technology | Version | Purpose | Confidence | Rationale |
|------------|---------|---------|------------|-----------|
| **devicons-react** | ^1.5.0 | Programming language/tool icons | HIGH | Purpose-built for programming languages, frameworks, and dev tools. 150+ tech-specific icons (TypeScript, React, Node.js, PostgreSQL, etc.). Three variants per icon: Original (colored), Plain, Line. Tree-shakeable with individual imports. TypeScript-first (86% TypeScript codebase). Active maintenance (v1.5.0 released ~2 months ago). |

**Integration with existing stack:**
- Complements Lucide React (UI icons) - Lucide stays for general UI, devicons for tech branding
- Same import pattern: `import { TypescriptOriginal } from 'devicons-react'`
- Supports `size` and `color` props matching existing icon usage patterns

**Alternatives considered:**

| Option | Why Not |
|--------|---------|
| `react-icons` (with Simple Icons) | Bundles 31 icon libraries (massive), overkill for just tech icons |
| `@icons-pack/react-simple-icons` | Brand logos only, missing many dev tools (e.g., Prisma, Supabase) |
| `devicon` (base library) | Font/CSS-based, not React components, harder to style dynamically |

### New: JSON-LD Structured Data Types

| Technology | Version | Purpose | Confidence | Rationale |
|------------|---------|---------|------------|-----------|
| **schema-dts** | ^1.1.5 | Schema.org TypeScript types | HIGH | Official Google package for Schema.org TypeScript types. Zero runtime dependencies (types only). Enables typed JSON-LD objects with IDE autocomplete. Recommended by Next.js official documentation. Dev dependency only. |

**Note on maintenance:** The package shows "inactive" npm maintenance status (no releases in 12 months), but this is expected - Schema.org vocabulary is stable and rarely changes.

### No Stack Changes Needed For:

**Cache Revalidation (revalidatePath):**
- Already implemented in server actions
- Pattern fix needed: ensure all mutation actions call `revalidatePath("/")` for instant public page updates

**Error Boundaries (error.tsx):**
- Built-in Next.js 15 file convention
- Create `src/app/error.tsx` (must be Client Component with `'use client'`)
- Receives `error` and `reset` props

**Loading Skeletons (loading.tsx):**
- Built-in Next.js 15 file convention
- Create `src/app/loading.tsx`
- Automatically wraps page.tsx in React Suspense boundary

**Open Graph & Twitter Cards:**
- Built-in Next.js Metadata API via `generateMetadata`
- Extend existing metadata in `page.tsx` to include `openGraph` and `twitter` fields
- Set `metadataBase` in root layout for absolute URLs

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|---------------------|
| Framework | Next.js 15 | Remix, Astro | Next.js has best ecosystem, Vercel deployment, most tutorials |
| ORM | Prisma 7 | Drizzle | Prisma has better DX, migrations, studio. Drizzle is lighter but less mature |
| Auth | Auth.js v5 | Clerk, Lucia | Auth.js is free, self-hosted, sufficient for single-admin. Clerk adds cost |
| UI | shadcn/ui | Chakra UI, MUI | shadcn gives code ownership, no runtime overhead, Tailwind-native |
| Animation | Framer Motion | React Spring, GSAP | Framer Motion has best React integration, declarative API |
| Drag-Drop | dnd-kit | @hello-pangea/dnd | dnd-kit is more flexible, better maintained |
| Icons | Lucide | Heroicons, Tabler | Lucide has largest set (1,667), consistent style, tree-shakeable |
| Toast | Sonner | react-toastify | Sonner is lighter, modern, shadcn-native |
| Password | Argon2 | bcrypt | Argon2 is PHC winner, more resistant to GPU attacks |

---

## What NOT to Use

| Technology | Why Avoid |
|------------|-----------|
| `react-beautiful-dnd` | DEPRECATED. Archived by Atlassian in 2022. Use dnd-kit or @hello-pangea/dnd instead. |
| `jsonwebtoken` | Does NOT work in Edge Runtime (Next.js middleware). Use `jose` instead. |
| `bcrypt` | Still secure but Argon2 is more future-proof. bcrypt limited to 72 bytes, fixed 4KB memory. |
| `@next/font` | Removed in Next.js 15. Use built-in `next/font` instead. |
| CSS Modules | Not recommended with Tailwind 4. Use Tailwind utilities directly. |
| `create-react-app` | Dead project. Next.js is the standard. |
| SQLite (production) | Connection pooling issues with serverless. PostgreSQL handles concurrent connections better. |
| Animate.css | Legacy. Framer Motion provides better React integration and physics-based animations. |

### v1.1 Anti-Recommendations

| Technology | Why Avoid |
|------------|-----------|
| `next-seo` | Next.js 15 Metadata API is comprehensive and built-in. Adds runtime dependencies for features already native. |
| `react-icons` | Bundles 31 icon libraries. Overkill when only tech icons needed. Already have Lucide for UI icons. |
| `serialize-javascript` | Simple `.replace(/</g, '\\u003c')` sanitization is sufficient for controlled admin data. |
| `revalidateTag` pattern | Current `revalidatePath("/")` is sufficient for single-page portfolio. Tags add complexity without benefit here. |

---

## Version Matrix

Verified current versions as of 2026-01-25:

```
# Core
next@15.5.x                    # Stable, Turbopack ready
react@19.x                     # Required by Next.js 15
typescript@5.4+                # Typed routes support

# Database
prisma@7.2.x                   # Latest with TypeScript runtime
@prisma/client@7.2.x           # Generated client

# Auth
next-auth@5.x                  # Auth.js for Next.js
@auth/prisma-adapter@latest    # Prisma session storage
jose@5.x                       # Edge-compatible JWT
argon2@0.40+                   # Password hashing

# UI
tailwindcss@4.x                # CSS-first config
@radix-ui/*@latest             # Headless primitives (via shadcn)
lucide-react@0.562+            # Icons
framer-motion@12.27+           # Animation

# Data & Forms
@tanstack/react-query@5.90+    # Server state
octokit@5.0+                   # GitHub API
react-hook-form@7.x            # Forms
zod@3.x                        # Validation
@hookform/resolvers@latest     # Zod integration

# Utilities
@dnd-kit/core@6.x              # Drag and drop
@dnd-kit/sortable@8.x          # Sortable lists
sonner@latest                  # Toast notifications

# v1.1 Additions
devicons-react@^1.5.0          # Tech/programming language icons
schema-dts@^1.1.5              # JSON-LD TypeScript types (dev)
```

---

## Installation Commands

### Initial Setup

```bash
# Create Next.js 15 app with TypeScript
npx create-next-app@latest portfolio --typescript --tailwind --eslint --app --src-dir

# Or use shadcn/create for pre-configured setup
npx shadcn@latest create
```

### Core Dependencies

```bash
npm install next@latest react@latest react-dom@latest

# Database
npm install prisma@latest @prisma/client@latest

# Auth
npm install next-auth@5 @auth/prisma-adapter jose argon2

# UI & Animation
npm install framer-motion lucide-react sonner
npx shadcn@latest init

# Data & Forms
npm install @tanstack/react-query octokit react-hook-form zod @hookform/resolvers

# Drag and Drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### v1.1 Polish Feature Dependencies

```bash
# Production dependency - tech icons
npm install devicons-react

# Dev dependency - JSON-LD types
npm install -D schema-dts
```

### Dev Dependencies

```bash
npm install -D @types/node @types/react @types/react-dom
npm install -D prisma
npm install -D @tanstack/eslint-plugin-query
```

---

## Database Schema Preview

Based on the project requirements, the core Prisma schema should include:

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Bio {
  id          String   @id @default(cuid())
  content     String   @db.Text
  headline    String
  updatedAt   DateTime @updatedAt
}

model Skill {
  id        String   @id @default(cuid())
  name      String
  icon      String   // Lucide icon name
  category  String
  order     Int
  createdAt DateTime @default(now())
}

model Project {
  id            String   @id @default(cuid())
  title         String
  description   String   @db.Text
  githubUrl     String?
  githubRepoId  String?  @unique // GitHub repo ID for sync
  liveUrl       String?
  imageUrl      String?
  technologies  String[] // Array of tech names
  featured      Boolean  @default(false)
  order         Int
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model SocialLink {
  id       String @id @default(cuid())
  platform String // github, linkedin, twitter, etc.
  url      String
  order    Int
}

model Resume {
  id        String   @id @default(cuid())
  url       String
  filename  String
  updatedAt DateTime @updatedAt
}

model Contact {
  id        String   @id @default(cuid())
  email     String
  location  String?
  updatedAt DateTime @updatedAt
}
```

---

## Deployment Recommendations

### Option 1: Vercel (Recommended)

- Native Next.js support with zero config
- Prisma Postgres via Vercel Marketplace (built-in connection pooling)
- Automatic preview deployments
- Edge Functions for middleware

### Option 2: Railway

- PostgreSQL included, easy setup
- Works well with Prisma
- Good for budget-conscious projects

### Option 3: Render.com (Current)

- Already using for static site
- Supports PostgreSQL and Next.js
- May need connection pooling setup (PgBouncer or Prisma Accelerate)

**Note:** For serverless deployments (Vercel, Railway), connection pooling is ESSENTIAL. Use Prisma Accelerate or Prisma Postgres which have built-in pooling.

---

## Environment Variables

```bash
# .env.local (development)
DATABASE_URL="postgresql://user:password@localhost:5432/portfolio"

# Auth
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"

# GitHub (for API integration)
GITHUB_TOKEN="ghp_xxxx"  # Personal access token with repo read scope
GITHUB_USERNAME="uzmanshafi"

# File uploads (if using UploadThing)
UPLOADTHING_SECRET="sk_live_xxxx"
UPLOADTHING_APP_ID="xxxx"
```

---

## Sources

### Official Documentation
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-15)
- [Next.js revalidatePath API](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Next.js error.tsx Conventions](https://nextjs.org/docs/app/api-reference/file-conventions/error)
- [Next.js loading.tsx Conventions](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld)
- [Next.js generateMetadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Prisma 7 Announcement](https://www.prisma.io/blog/announcing-prisma-orm-7-0-0)
- [Auth.js v5 Migration](https://authjs.dev/getting-started/migrating-to-v5)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4)
- [GitHub API Comparison](https://docs.github.com/en/rest/about-the-rest-api/comparing-githubs-rest-api-and-graphql-api)

### NPM Packages (version verification)
- [@tanstack/react-query](https://www.npmjs.com/package/@tanstack/react-query) - v5.90.19
- [framer-motion](https://www.npmjs.com/package/framer-motion) - v12.27.0
- [lucide-react](https://www.npmjs.com/package/lucide-react) - v0.562.0
- [octokit](https://www.npmjs.com/package/octokit) - v5.0.5
- [jose](https://www.npmjs.com/package/jose) - Edge-compatible JWT
- [devicons-react](https://github.com/MKAbuMattar/devicons-react) - v1.5.0
- [schema-dts](https://github.com/google/schema-dts) - v1.1.5

### Ecosystem Research
- [Top Drag-and-Drop Libraries 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)
- [React Toast Libraries Compared](https://blog.logrocket.com/react-toast-libraries-compared-2025/)
- [Password Hashing Guide 2026](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/)
- [shadcn/ui Top Libraries 2026](https://dev.to/vaibhavg/top-shadcn-ui-libraries-every-developer-should-know-1ffh)
- [React Icon Libraries 2026](https://lineicons.com/blog/react-icon-libraries)
- [Next.js Caching Discussion](https://github.com/vercel/next.js/discussions/54075)

---

*Last updated: 2026-01-25*
