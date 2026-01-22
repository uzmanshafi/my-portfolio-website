# Phase 1: Foundation - Research

**Researched:** 2026-01-22
**Domain:** Next.js 15+ with PostgreSQL and Prisma ORM
**Confidence:** HIGH

## Summary

Phase 1 establishes the production-ready foundation for transforming a static HTML portfolio into a modern full-stack Next.js application. This phase focuses on three core technical requirements (TECH-01, TECH-02, TECH-03): setting up Next.js 15+ with App Router, connecting PostgreSQL for content storage, and configuring Prisma ORM for type-safe database access.

The existing codebase is a static HTML site with Tailwind CSS 3.x (no build system, inline JavaScript). This phase completely replaces that architecture with a Next.js App Router project, establishing the foundation for future phases (authentication, admin dashboard, GitHub integration).

Key findings indicate that Prisma 7.x has significant breaking changes from previous versions, requiring driver adapters, ESM module configuration, and a new `prisma.config.ts` file. The current stable versions are Next.js 16.1.4 and Prisma 7.3.0, though Next.js 15.x remains a valid choice given it meets requirements and has fewer migration concerns with Prisma 7.

**Primary recommendation:** Use Next.js 15.x (latest 15.x release) with Prisma 7.3+ and PostgreSQL, configured with the `@prisma/adapter-pg` driver adapter and proper connection pooling for serverless deployment.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Next.js** | 15.3+ | Full-stack React framework with App Router | Industry standard for React applications; stable with React 19, Turbopack for dev, server components and actions |
| **React** | 19.x | UI library | Required by Next.js 15; includes server components, use() hook, improved Suspense |
| **TypeScript** | 5.4+ | Type safety | Non-negotiable for maintainability; Next.js 15 has improved typed routes |
| **PostgreSQL** | 16.x | Relational database | Production-ready, excellent Prisma support, required for serverless connection pooling |
| **Prisma ORM** | 7.3+ | Type-safe database access | Latest major version with pure TypeScript runtime (no Rust binary), requires driver adapters |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@prisma/adapter-pg** | 7.x | PostgreSQL driver adapter | Required for Prisma 7 - handles database connections |
| **pg** | 8.x | Node.js PostgreSQL client | Required by @prisma/adapter-pg |
| **Tailwind CSS** | 4.x | Utility-first CSS | Already used in current site; v4 has CSS-first config, faster builds |
| **@tailwindcss/postcss** | 4.x | PostCSS plugin for Tailwind | Required for Tailwind 4 integration |
| **dotenv** | 16.x | Environment variable loading | Required for Prisma 7 - env vars must be explicitly loaded |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Next.js 15.x | Next.js 16.x | 16.x has Turbopack as default bundler but requires Prisma generator workarounds for compatibility; 15.x is more stable for Prisma 7 |
| PostgreSQL | SQLite | SQLite has connection pooling issues in serverless; PostgreSQL is required for production scalability |
| Prisma 7 | Drizzle ORM | Drizzle is lighter but Prisma has better migrations, Studio, and project requirements specify Prisma |
| Tailwind 4 | Tailwind 3 | Tailwind 4 has simpler config but breaking changes; can use 3.x if browser compatibility is critical |

**Installation:**
```bash
# Create Next.js project (choose 15.x for Prisma 7 stability)
npx create-next-app@15 portfolio --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install Prisma ORM 7 with PostgreSQL adapter
npm install prisma @prisma/client @prisma/adapter-pg pg dotenv
npm install -D @types/pg tsx

# Install Tailwind 4 (if not using create-next-app default)
npm install tailwindcss @tailwindcss/postcss postcss
```

## Architecture Patterns

### Recommended Project Structure

```
my-portfolio-website/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (html, body, providers)
│   │   ├── page.tsx            # Home page (will be public portfolio)
│   │   ├── globals.css         # Global styles with @import "tailwindcss"
│   │   └── not-found.tsx       # 404 page
│   │
│   ├── components/             # Shared React components
│   │   └── ui/                 # Generic UI components (buttons, etc.)
│   │
│   ├── lib/                    # Core application logic
│   │   └── prisma.ts           # Prisma client singleton
│   │
│   └── generated/              # Generated code
│       └── prisma/             # Prisma client output (from schema)
│
├── prisma/
│   ├── schema.prisma           # Database schema definition
│   ├── migrations/             # Migration history (generated)
│   └── seed.ts                 # Seed data (optional)
│
├── public/                     # Static assets (images, resume)
│   ├── images/
│   └── resume/
│
├── prisma.config.ts            # Prisma configuration (new in v7)
├── postcss.config.mjs          # PostCSS configuration
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
├── .env.local                  # Local environment variables (git-ignored)
├── .env.example                # Example environment file (committed)
└── docker-compose.yml          # Local PostgreSQL development
```

### Pattern 1: Prisma Client Singleton with Adapter

**What:** Create a single Prisma client instance with the required pg adapter, cached globally to prevent connection exhaustion during hot reloading.

**When to use:** Always in Next.js applications with Prisma 7.

**Example:**
```typescript
// src/lib/prisma.ts
// Source: Prisma Official Docs - https://www.prisma.io/docs/guides/nextjs

import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

// Create connection pool (reused across hot reloads)
const pool = globalForPrisma.pool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool;
}

// Create adapter and client
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Pattern 2: Prisma 7 Configuration File

**What:** New in Prisma 7, centralized configuration replaces CLI flags and moves database URL out of schema.

**When to use:** Required for all Prisma 7 projects.

**Example:**
```typescript
// prisma.config.ts
// Source: Prisma v7 Upgrade Guide - https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

### Pattern 3: Prisma Schema for Portfolio

**What:** Database schema defining all content models needed for the portfolio.

**When to use:** Phase 1 foundation - defines data structure for all future phases.

**Example:**
```prisma
// prisma/schema.prisma
// Source: Project research - based on REQUIREMENTS.md content models

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// Content Models
model Bio {
  id          String   @id @default(cuid())
  name        String
  title       String   // "Software Developer"
  headline    String   // Short intro
  description String   @db.Text
  imageUrl    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Skill {
  id        String   @id @default(cuid())
  name      String
  icon      String   // Lucide icon name
  category  String   // "frontend", "backend", "tools", "design"
  order     Int      @default(0)
  visible   Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([category])
}

model Project {
  id          String   @id @default(cuid())
  title       String
  description String   @db.Text
  imageUrl    String?
  liveUrl     String?
  repoUrl     String?

  // GitHub integration (Phase 4)
  githubId    Int?     @unique
  stars       Int      @default(0)
  forks       Int      @default(0)
  language    String?

  // Display settings
  featured    Boolean  @default(false)
  visible     Boolean  @default(true)
  order       Int      @default(0)

  technologies String[] // Array of technology names

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([featured, visible])
}

model SocialLink {
  id        String   @id @default(cuid())
  platform  String   // "github", "linkedin", "twitter"
  url       String
  icon      String   // Lucide icon name
  order     Int      @default(0)
  visible   Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Resume {
  id        String   @id @default(cuid())
  filename  String
  url       String
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Contact {
  id        String   @id @default(cuid())
  email     String
  location  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Pattern 4: Docker Compose for Local Development

**What:** Local PostgreSQL database for development, matching production environment.

**When to use:** Local development - avoids installing PostgreSQL directly on machine.

**Example:**
```yaml
# docker-compose.yml
# Source: Prisma Docker Guide - https://www.prisma.io/docs/guides/docker

version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: portfolio-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: portfolio
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d portfolio"]
      interval: 5s
      timeout: 2s
      retries: 10

volumes:
  postgres_data:
```

### Anti-Patterns to Avoid

- **Creating Prisma client per request:** Exhausts database connections. Always use the singleton pattern.
- **Hardcoding DATABASE_URL in schema.prisma:** Prisma 7 requires `prisma.config.ts` for the URL; schema only declares provider.
- **Using node_modules output for Prisma client:** Prisma 7 requires explicit output path in generator block.
- **Skipping driver adapter:** Prisma 7 will fail without `@prisma/adapter-pg` passed to PrismaClient.
- **Using `prisma-client-js` provider:** Prisma 7 uses `prisma-client` (without `-js`) as the generator provider.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Database connection pooling | Custom pool management | `pg.Pool` with Prisma adapter | Pool handles max connections, idle cleanup, error recovery |
| Environment variable loading | Manual process.env reading | `dotenv/config` import | Prisma 7 requires explicit loading; dotenv handles .env files |
| TypeScript path aliases | Manual tsconfig paths | create-next-app `@/*` alias | Default setup handles all edge cases |
| Database migrations | SQL scripts | `prisma migrate dev` | Version-controlled, reversible, type-safe |
| Type generation | Manual type definitions | Prisma client generation | Types auto-update with schema changes |
| Hot reload client caching | Custom singleton | globalThis pattern | Standard Next.js pattern prevents memory leaks |

**Key insight:** Prisma 7's architecture change (dropping Rust binary, requiring adapters) means older tutorials and patterns won't work. Always verify patterns against Prisma 7 documentation.

## Common Pitfalls

### Pitfall 1: Prisma 7 Breaking Changes Blindside

**What goes wrong:** Using Prisma 6.x patterns (no adapter, `prisma-client-js` provider, URL in schema) causes cryptic errors or silent failures.

**Why it happens:** Most tutorials and Stack Overflow answers reference Prisma 5/6. Prisma 7 has fundamental architecture changes.

**How to avoid:**
- Use `prisma-client` provider (not `prisma-client-js`)
- Always pass adapter to `new PrismaClient({ adapter })`
- Put DATABASE_URL in `prisma.config.ts`, not `schema.prisma`
- Set `"type": "module"` in package.json for ESM compatibility

**Warning signs:** "Cannot find module", "adapter is required", "url is not defined in datasource"

### Pitfall 2: Connection Pool Exhaustion in Development

**What goes wrong:** Hot reloading creates new Prisma clients, each opening new database connections. Eventually hits PostgreSQL connection limit.

**Why it happens:** Next.js reloads server code on changes. Without caching, each reload creates a new client and pool.

**How to avoid:**
- Always use the `globalForPrisma` singleton pattern
- Cache both the `Pool` AND the `PrismaClient` on globalThis
- Check `process.env.NODE_ENV !== 'production'` before caching

**Warning signs:** "Too many connections", slow response times, connection timeout errors

### Pitfall 3: ESM/CommonJS Module Conflicts

**What goes wrong:** Import errors, "Cannot use import statement outside module", or TypeScript compilation failures.

**Why it happens:** Prisma 7 ships as ESM. Project may have mixed module formats.

**How to avoid:**
- Set `"type": "module"` in package.json
- Configure tsconfig.json with `"module": "ESNext"`, `"moduleResolution": "bundler"`
- Use `tsx` for running TypeScript directly (seeds, scripts)

**Warning signs:** SyntaxError on import statements, "require() of ES Module not supported"

### Pitfall 4: Missing Prisma Output Directory

**What goes wrong:** "Cannot find module '../generated/prisma/client'" after generation.

**Why it happens:** Prisma 7 requires explicit output path. Default node_modules location no longer works.

**How to avoid:**
- Add `output = "../src/generated/prisma"` to generator block
- Run `npx prisma generate` after schema changes
- Add `postinstall` script: `"postinstall": "prisma generate"`

**Warning signs:** Module not found errors pointing to generated client path

### Pitfall 5: Database Region Mismatch

**What goes wrong:** Production is slow despite correct code. Every database query has 100-500ms latency.

**Why it happens:** App deployed to one region (e.g., Vercel us-east-1), database in another (e.g., Railway eu-west).

**How to avoid:**
- Choose primary region before provisioning anything
- Deploy database and app to same region
- Verify regions match before going to production

**Warning signs:** Works fast locally, slow in production; network round-trip visible in query times

## Code Examples

Verified patterns from official sources:

### Environment Configuration

```bash
# .env.local (git-ignored)
# Source: Next.js Environment Variables Guide

# PostgreSQL connection (Docker local)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/portfolio?schema=public"

# PostgreSQL connection (production example)
# DATABASE_URL="postgresql://user:password@host:5432/portfolio?sslmode=require"
```

```bash
# .env.example (committed to git)
DATABASE_URL="postgresql://user:password@localhost:5432/portfolio?schema=public"
```

### package.json Scripts

```json
{
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

### tsconfig.json for Prisma 7

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "prisma.config.ts"],
  "exclude": ["node_modules"]
}
```

### PostCSS Configuration for Tailwind 4

```javascript
// postcss.config.mjs
// Source: Tailwind CSS Installation Guide - https://tailwindcss.com/docs/guides/nextjs

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### Global CSS with Tailwind 4

```css
/* src/app/globals.css */
/* Source: Tailwind CSS Installation Guide */

@import "tailwindcss";

/* Custom CSS variables for design system (from PROJECT.md) */
:root {
  --color-text: #f3e9e2;
  --color-background: #160f09;
  --color-primary: #d3b196;
  --color-secondary: #326978;
  --color-accent: #6655b8;
}
```

### Basic Seed File

```typescript
// prisma/seed.ts
// Run with: npm run db:seed

import { prisma } from '../src/lib/prisma';

async function main() {
  // Create initial bio
  await prisma.bio.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      name: 'Your Name',
      title: 'Software Developer',
      headline: 'Building amazing things with code',
      description: 'Full bio content here...',
    },
  });

  // Create initial contact
  await prisma.contact.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      email: 'your@email.com',
    },
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Prisma with Rust binary | Pure TypeScript with driver adapters | Prisma 7 (2025) | Faster installs, smaller bundles, but requires adapter setup |
| `prisma-client-js` provider | `prisma-client` provider | Prisma 7 (2025) | Schema generator block must change |
| DATABASE_URL in schema.prisma | DATABASE_URL in prisma.config.ts | Prisma 7 (2025) | New config file required |
| Tailwind tailwind.config.js | Tailwind CSS-first configuration | Tailwind 4 (2025) | Config moves to CSS file with @theme |
| Next.js pages/ directory | Next.js app/ directory (App Router) | Next.js 13+ | Server components, layouts, colocation |

**Deprecated/outdated:**
- `prisma-client-js` generator provider - use `prisma-client` in Prisma 7
- Prisma client in node_modules - must specify custom output path
- Tailwind tailwind.config.js - Tailwind 4 uses CSS-first config (though JS config still works with @config)
- Next.js 15 synchronized request APIs - deprecated in 15, removed in 16

## Open Questions

Things that couldn't be fully resolved:

1. **Next.js 15 vs 16 for Prisma 7 Turbopack compatibility**
   - What we know: Prisma 7 has documented issues with Next.js 16 Turbopack bundler; workaround is using `prisma-client-js` provider instead of `prisma-client`
   - What's unclear: Whether this is fixed in latest versions; official guidance is evolving
   - Recommendation: Start with Next.js 15.x for stability; can upgrade to 16 later when compatibility is confirmed

2. **Connection pooling for Render.com deployment**
   - What we know: Serverless needs connection pooling; Prisma Accelerate provides built-in pooling; native pg.Pool works for traditional deployments
   - What's unclear: Render.com's specific serverless model and whether pg.Pool is sufficient
   - Recommendation: Use pg.Pool for now (works with Docker and traditional deployments); evaluate Prisma Accelerate if connection issues arise

3. **Tailwind 4 browser compatibility**
   - What we know: Tailwind 4 uses modern CSS features (cascade layers, @property, color-mix) that may not work in older browsers
   - What's unclear: Exact browser support matrix for all features used
   - Recommendation: Use Tailwind 4 (project targets modern browsers); can fallback to 3.x if edge cases emerge

## Sources

### Primary (HIGH confidence)

- [Next.js App Router Installation](https://nextjs.org/docs/app/getting-started/installation) - Project creation and structure
- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) - File conventions and organization
- [Prisma 7 Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7) - Breaking changes, adapter requirements
- [Prisma with Next.js Guide](https://www.prisma.io/docs/guides/nextjs) - Singleton pattern, Vercel deployment
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/docker) - Docker Compose configuration
- [Tailwind CSS Next.js Installation](https://tailwindcss.com/docs/guides/nextjs) - PostCSS setup, CSS imports

### Secondary (MEDIUM confidence)

- [Medium: Prisma 7 with Next.js](https://medium.com/@gauravkmaurya09/guide-to-prisma-7-with-next-js-16-javascript-edition-99c8c4ca10be) - Practical migration guide
- [Build with Matija: Prisma v7 Turbopack Fix](https://www.buildwithmatija.com/blog/migrate-prisma-v7-nextjs-16-turbopack-fix) - Turbopack compatibility workaround
- [Vercel KB: Connection Pooling](https://vercel.com/kb/guide/connection-pooling-with-functions) - Serverless connection patterns

### Tertiary (LOW confidence - for validation)

- npm version checks (verified current versions: Next.js 16.1.4, Prisma 7.3.0 as of 2026-01-22)
- Various Medium articles on folder structure best practices

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation verified for all major libraries
- Architecture: HIGH - Patterns from official Prisma and Next.js docs
- Pitfalls: HIGH - Verified through official upgrade guides and documented issues

**Research date:** 2026-01-22
**Valid until:** ~30 days (Prisma 7 and Next.js 15/16 are stable; minor version updates unlikely to break patterns)
