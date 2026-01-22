# Architecture Patterns

**Domain:** Portfolio website with admin dashboard
**Researched:** 2026-01-22
**Confidence:** HIGH (verified via official Next.js docs, Prisma docs, and multiple authoritative sources)

## Executive Summary

This architecture follows a **server-first, client-islands** pattern using Next.js App Router. The portfolio has two distinct experiences:

1. **Public portfolio** - Server-rendered, static where possible, highly performant
2. **Admin dashboard** - Protected, interactive, mutation-heavy

These are separated using **route groups** with distinct layouts, enabling different UI patterns and authentication requirements without URL pollution.

## Recommended Architecture

```
                                    +------------------+
                                    |   PostgreSQL     |
                                    |   (Render/etc)   |
                                    +--------+---------+
                                             |
                                    +--------+---------+
                                    |   Prisma ORM     |
                                    | (Data Access)    |
                                    +--------+---------+
                                             |
                    +------------------------+------------------------+
                    |                                                 |
          +---------+---------+                           +-----------+-----------+
          |  Server Actions   |                           |    API Routes         |
          | (Mutations/CRUD)  |                           | (GitHub API Proxy)    |
          +---------+---------+                           +-----------+-----------+
                    |                                                 |
                    +------------------------+------------------------+
                                             |
                              +--------------+--------------+
                              |        Next.js App         |
                              |    (App Router + RSC)      |
                              +--------------+--------------+
                                             |
                    +------------------------+------------------------+
                    |                                                 |
          +---------+---------+                           +-----------+-----------+
          |  (site)           |                           |   (admin)             |
          |  Public Portfolio |                           |   Admin Dashboard     |
          |  Server Components|                           |   Client + Server Mix |
          +-------------------+                           +-----------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **PostgreSQL** | Persistent data storage | Prisma only |
| **Prisma ORM** | Type-safe database access, schema, migrations | Server Actions, API Routes |
| **Server Actions** | CRUD mutations (create/update/delete content) | Prisma, called from Client Components |
| **API Routes** | GitHub API proxy, webhook endpoints | External APIs, Prisma |
| **Public Site** | Display portfolio content (SSR/SSG) | Prisma (read-only), Framer Motion |
| **Admin Dashboard** | Content management interface | Server Actions (mutations), Prisma (reads) |
| **Auth Middleware** | Route protection, session validation | Auth.js/NextAuth |

### Data Flow

**Public Portfolio (Read Flow):**
```
User Request -> Middleware (no auth) -> Server Component -> Prisma -> PostgreSQL
                                                   |
                                                   v
                                        Rendered HTML (cached via ISR)
```

**Admin Dashboard (Write Flow):**
```
Admin Action -> Middleware (auth check) -> Client Component -> Server Action -> Prisma -> PostgreSQL
                                                    |                              |
                                                    v                              v
                                          Optimistic UI Update            revalidatePath()
```

**GitHub Integration (Sync Flow):**
```
Admin triggers sync -> Server Action -> API Route (proxy) -> GitHub API
                                               |
                                               v
                              Parse repos -> Prisma -> PostgreSQL
```

## Project Structure

```
my-portfolio-website/
├── src/
│   ├── app/
│   │   ├── (site)/                    # Public portfolio routes
│   │   │   ├── layout.tsx             # Public layout (nav, footer)
│   │   │   ├── page.tsx               # Home/landing
│   │   │   ├── projects/
│   │   │   │   └── page.tsx           # Projects listing
│   │   │   └── _components/           # Site-specific components
│   │   │       ├── Hero.tsx
│   │   │       ├── ProjectCard.tsx
│   │   │       └── SkillsGrid.tsx
│   │   │
│   │   ├── (admin)/                   # Admin dashboard routes
│   │   │   ├── layout.tsx             # Admin layout (sidebar, auth wrapper)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx           # Dashboard home
│   │   │   ├── bio/
│   │   │   │   └── page.tsx           # Edit bio
│   │   │   ├── skills/
│   │   │   │   └── page.tsx           # Manage skills
│   │   │   ├── projects/
│   │   │   │   └── page.tsx           # Manage projects
│   │   │   ├── resume/
│   │   │   │   └── page.tsx           # Upload/manage resume
│   │   │   └── _components/           # Admin-specific components
│   │   │       ├── Sidebar.tsx
│   │   │       ├── ProjectForm.tsx
│   │   │       └── SkillEditor.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/    # NextAuth.js routes
│   │   │   │   └── route.ts
│   │   │   └── github/                # GitHub API proxy
│   │   │       └── repos/
│   │   │           └── route.ts
│   │   │
│   │   ├── layout.tsx                 # Root layout (html, body, providers)
│   │   ├── globals.css                # Global styles
│   │   └── not-found.tsx              # 404 page
│   │
│   ├── components/                    # Shared components
│   │   ├── ui/                        # Generic UI (buttons, inputs, cards)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   ├── motion/                    # Framer Motion wrappers
│   │   │   ├── MotionDiv.tsx
│   │   │   ├── MotionSection.tsx
│   │   │   └── AnimatedPage.tsx
│   │   └── layout/                    # Layout components
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/                           # Core application logic
│   │   ├── prisma.ts                  # Prisma client singleton
│   │   ├── auth.ts                    # Auth configuration
│   │   └── github.ts                  # GitHub API helpers
│   │
│   ├── server/                        # Server-only code
│   │   ├── actions/                   # Server Actions
│   │   │   ├── bio.ts                 # Bio CRUD
│   │   │   ├── skills.ts              # Skills CRUD
│   │   │   ├── projects.ts            # Projects CRUD
│   │   │   ├── resume.ts              # Resume upload/management
│   │   │   └── github.ts              # GitHub sync actions
│   │   └── data/                      # Data fetching functions
│   │       ├── bio.ts                 # Get bio data
│   │       ├── skills.ts              # Get skills data
│   │       ├── projects.ts            # Get projects data
│   │       └── settings.ts            # Get site settings
│   │
│   └── types/                         # TypeScript types
│       ├── index.ts                   # Shared types
│       └── github.ts                  # GitHub API types
│
├── prisma/
│   ├── schema.prisma                  # Database schema
│   ├── migrations/                    # Migration history
│   └── seed.ts                        # Seed data
│
├── public/                            # Static assets
│   ├── images/
│   └── resume/                        # Uploaded resumes
│
└── [config files]                     # next.config.js, tsconfig.json, etc.
```

## Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Authentication (NextAuth.js adapter)
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // For credentials auth
  role          String    @default("admin") // Single admin system
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Portfolio Content
model Bio {
  id          String   @id @default(cuid())
  name        String
  title       String   // "Software Developer"
  headline    String   // Short intro
  description String   @db.Text // Full bio
  imageUrl    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Skill {
  id        String   @id @default(cuid())
  name      String
  icon      String   // Lucide icon name
  category  String   // "frontend", "backend", "tools", etc.
  order     Int      @default(0) // Display order
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

  // GitHub integration
  githubId    Int?     @unique // GitHub repo ID
  stars       Int      @default(0)
  forks       Int      @default(0)
  language    String?

  // Display settings
  featured    Boolean  @default(false)
  order       Int      @default(0)
  visible     Boolean  @default(true)

  // Metadata
  technologies Technology[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([featured, visible])
}

model Technology {
  id        String    @id @default(cuid())
  name      String    @unique
  projects  Project[]
}

model SocialLink {
  id        String   @id @default(cuid())
  platform  String   // "github", "linkedin", "twitter", etc.
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
  active    Boolean  @default(true) // Only one active at a time
  createdAt DateTime @default(now())
}

model SiteSettings {
  id             String  @id @default(cuid())
  siteName       String  @default("Portfolio")
  email          String?
  githubUsername String? // For GitHub API integration
  githubToken    String? // Encrypted PAT for API access
}
```

## Patterns to Follow

### Pattern 1: Route Group Separation

Separate public and admin experiences at the route level:

```typescript
// app/(site)/layout.tsx - Public layout
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

// app/(admin)/layout.tsx - Admin layout (protected)
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

**Why:** Clean separation of concerns. Public pages have marketing layout, admin has dashboard layout. Auth is checked once at the layout level.

### Pattern 2: Server Actions for Mutations

Use Server Actions for all CRUD operations:

```typescript
// server/actions/skills.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createSkill(data: { name: string; icon: string; category: string }) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const skill = await prisma.skill.create({
    data: {
      ...data,
      order: await getNextOrder(),
    },
  });

  revalidatePath("/(site)"); // Invalidate public pages
  revalidatePath("/(admin)/skills");

  return skill;
}

export async function reorderSkills(orderedIds: string[]) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.skill.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidatePath("/(site)");
  revalidatePath("/(admin)/skills");
}
```

**Why:** Type-safe, secure by default (server-only), automatic revalidation, no separate API endpoints needed.

### Pattern 3: Data Access Layer for Reads

Centralize data fetching in a separate layer:

```typescript
// server/data/projects.ts
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// Public: cached, visible projects only
export const getPublicProjects = unstable_cache(
  async () => {
    return prisma.project.findMany({
      where: { visible: true },
      orderBy: [{ featured: "desc" }, { order: "asc" }],
      include: { technologies: true },
    });
  },
  ["public-projects"],
  { tags: ["projects"], revalidate: 3600 } // 1 hour cache
);

// Admin: all projects, no cache
export async function getAllProjects() {
  return prisma.project.findMany({
    orderBy: { order: "asc" },
    include: { technologies: true },
  });
}
```

**Why:** Separation between public (cached) and admin (fresh) data. Cache tags enable targeted invalidation.

### Pattern 4: Framer Motion Client Components

Create motion wrappers for server component compatibility:

```typescript
// components/motion/MotionDiv.tsx
"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef } from "react";

export const MotionDiv = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  (props, ref) => <motion.div ref={ref} {...props} />
);

MotionDiv.displayName = "MotionDiv";
```

```typescript
// app/(site)/page.tsx (Server Component)
import { MotionDiv } from "@/components/motion/MotionDiv";
import { getPublicProjects } from "@/server/data/projects";

export default async function HomePage() {
  const projects = await getPublicProjects();

  return (
    <section>
      {projects.map((project, i) => (
        <MotionDiv
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <ProjectCard project={project} />
        </MotionDiv>
      ))}
    </section>
  );
}
```

**Why:** Motion needs DOM access (client-side only). Wrapper components enable use within server components.

### Pattern 5: GitHub Integration via API Route

Proxy GitHub API through your own route:

```typescript
// app/api/github/repos/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.siteSettings.findFirst();
  if (!settings?.githubToken || !settings?.githubUsername) {
    return NextResponse.json({ error: "GitHub not configured" }, { status: 400 });
  }

  const response = await fetch(
    `https://api.github.com/users/${settings.githubUsername}/repos?per_page=100&sort=updated`,
    {
      headers: {
        Authorization: `Bearer ${settings.githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  const repos = await response.json();
  return NextResponse.json(repos);
}
```

**Why:** Keeps token server-side, enables caching, provides clean interface for admin dashboard.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Mixing Auth Logic in Components

**Bad:**
```typescript
// Every admin component checks auth individually
export default async function SkillsPage() {
  const session = await auth();
  if (!session) redirect("/login"); // Repeated everywhere
  // ...
}
```

**Good:** Check auth once in the layout, components assume auth is valid.

### Anti-Pattern 2: Direct Database Access in Components

**Bad:**
```typescript
// app/(site)/page.tsx
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const projects = await prisma.project.findMany(); // Direct access
}
```

**Good:** Go through data access layer for caching, filtering, and consistent behavior.

### Anti-Pattern 3: Client Components for Everything

**Bad:**
```typescript
// Making entire page client component for one animation
"use client";
export default function ProjectsPage() {
  // All SSR benefits lost
}
```

**Good:** Keep pages as server components, use client component islands only for interactivity.

### Anti-Pattern 4: API Routes for Mutations

**Bad:**
```typescript
// app/api/skills/route.ts
export async function POST(req: Request) {
  const data = await req.json();
  // Manual parsing, validation, auth checking
}
```

**Good:** Use Server Actions for mutations - type-safe, validated, and integrated with forms.

## Scalability Considerations

| Concern | At Launch | At 10K Views/Month | At 100K Views/Month |
|---------|-----------|-------------------|---------------------|
| **Database** | Render free tier | Render paid, connection pooling | Prisma Accelerate, read replicas |
| **Caching** | ISR (1 hour) | ISR + Edge caching | Add Redis, shorter ISR |
| **Images** | Local/Cloudinary | Cloudinary CDN | Vercel Image Optimization |
| **API Rate Limits** | GitHub unauthenticated | Personal Access Token | Cached responses, longer intervals |

## Build Order (Dependencies)

Based on component dependencies, recommended build sequence:

```
Phase 1: Foundation (no dependencies)
├── Next.js project setup
├── Prisma schema + migrations
├── Database provisioning
└── Basic project structure

Phase 2: Data Layer (depends on Phase 1)
├── Prisma client singleton
├── Data access functions (reads)
├── Server Actions (writes)
└── Seed data

Phase 3: Authentication (depends on Phase 2)
├── NextAuth.js configuration
├── Login page
├── Middleware for route protection
└── Session handling

Phase 4: Admin Dashboard (depends on Phase 3)
├── Admin layout with sidebar
├── Bio management page
├── Skills management page
├── Projects management page
├── Resume upload
└── GitHub integration UI

Phase 5: Public Portfolio (depends on Phase 2)
├── Public layout (header, footer)
├── Home page with sections
├── Framer Motion wrappers
├── Animations and transitions
└── Responsive design

Phase 6: Polish (depends on Phase 4, 5)
├── Error boundaries
├── Loading states
├── Preview functionality
├── Performance optimization
└── Final styling
```

**Key Dependencies:**
- Admin dashboard REQUIRES authentication
- Public site CAN be built in parallel with admin (both need data layer)
- Animations are additive, can be last
- GitHub integration can be added incrementally

## Sources

**Official Documentation (HIGH confidence):**
- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)
- [Prisma with Next.js](https://www.prisma.io/docs/guides/nextjs)
- [Auth.js/NextAuth.js Prisma Adapter](https://authjs.dev/getting-started/adapters/prisma)

**Architecture Patterns (MEDIUM confidence):**
- [Next.js Architecture 2026 - Server-First Patterns](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router)
- [Next.js Folder Structure Best Practices 2025](https://medium.com/better-dev-nextjs-react/inside-the-app-router-best-practices-for-next-js-file-and-directory-structure-2025-edition-ed6bc14a8da3)
- [Server Actions vs API Routes](https://prateeksha.com/blog/forms-mutations-nextjs-app-router-server-actions-vs-api-routes)
- [Vercel Next.js + Prisma Starter](https://vercel.com/templates/next.js/prisma-postgres)

**Framer Motion Integration (HIGH confidence):**
- [Framer Motion with Next.js Server Components](https://www.hemantasundaray.com/blog/use-framer-motion-with-nextjs-server-components)
- [StaticMania Framer Motion Guide](https://staticmania.com/blog/how-to-use-framer-motion-for-animations-in-next-js)

**Security Consideration (HIGH confidence):**
- [Next.js Middleware Auth CVE-2025-29927](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass) - Use Data Access Layer pattern, don't rely on middleware alone for authorization
