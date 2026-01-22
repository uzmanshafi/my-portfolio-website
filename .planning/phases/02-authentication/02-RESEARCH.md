# Phase 2: Authentication - Research

**Researched:** 2026-01-22
**Domain:** Auth.js v5 (NextAuth.js) with Credentials Provider, Next.js 15 App Router
**Confidence:** HIGH

## Summary

This phase implements admin authentication using Auth.js v5 (NextAuth.js) with the Credentials provider for email/password login. The architecture follows Auth.js v5's recommended split configuration pattern to handle Edge Runtime compatibility, with JWT session strategy for simplicity (single admin, no database session needed).

The implementation leverages a layered defense approach: middleware for route protection (returning 404 for unauthenticated access to hidden admin routes), layout-level session checks, and data layer verification. Session persistence implements "remember me" functionality with conditional maxAge (7 days vs browser session).

**Primary recommendation:** Use Auth.js v5 with JWT session strategy, split configuration for Edge compatibility, Argon2 for password hashing (with bcryptjs as fallback for serverless), and layered route protection returning 404 (not redirect) for unauthenticated admin access.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-auth | 5.x (beta) | Authentication framework | De facto standard for Next.js auth. Unified `auth()` function works across Server Components, Route Handlers, Middleware |
| @auth/prisma-adapter | latest | Database adapter (optional) | Standard Prisma integration, but NOT used for this phase since we use JWT strategy with env-based credentials |
| jose | 5.x | JWT handling for Edge Runtime | Required for middleware auth. `jsonwebtoken` does NOT work in Edge Runtime |
| argon2 | 0.40+ | Password hashing | PHC winner, more secure than bcrypt against GPU/ASIC attacks. Memory-hard design |
| bcryptjs | 3.x | Fallback password hashing | Pure JavaScript, works in serverless/Edge when native argon2 has issues |
| zod | 3.x | Schema validation | TypeScript-first validation for login form |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form | 7.x | Form management | Login form handling with uncontrolled components |
| @hookform/resolvers | latest | RHF + Zod bridge | Validate login credentials client-side before submission |
| sonner | latest | Toast notifications | Login error feedback, session expiry notifications |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| JWT strategy | Database strategy | Database strategy requires adapter, Edge-incompatible by default. JWT is simpler for single admin |
| argon2 | bcrypt/bcryptjs | argon2 is more secure but has native dependencies. bcryptjs is pure JS fallback |
| Custom login page | Auth.js built-in pages | Custom page required for split layout design per CONTEXT.md |
| Env credentials | Database User model | Database overkill for single admin, env is simpler and more secure for this use case |

**Installation:**
```bash
npm install next-auth@beta jose argon2 zod
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── backstage/                    # Admin routes (secret URL)
│   │   ├── layout.tsx                # Auth check, session provider wrapper
│   │   ├── page.tsx                  # Login page (unauthenticated users see this)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx            # Dashboard layout (requires auth)
│   │   │   └── page.tsx              # Dashboard home
│   │   └── [...catchall]/
│   │       └── page.tsx              # 404 for unknown backstage routes
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts          # Auth.js route handlers
├── lib/
│   ├── auth.ts                       # Main Auth.js config with full features
│   ├── auth.config.ts                # Edge-compatible config (no adapter)
│   └── actions/
│       └── auth.ts                   # Server actions for login/logout
└── middleware.ts                     # Route protection (or proxy.ts in Next.js 16+)
```

### Pattern 1: Split Configuration for Edge Runtime

**What:** Separate Auth.js configuration into edge-compatible and full-featured versions
**When to use:** Always, when using Auth.js with Next.js middleware
**Why:** Database adapters and some libraries don't work in Edge Runtime. Split config ensures middleware works.

```typescript
// src/lib/auth.config.ts - Edge-compatible (no adapter)
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  pages: {
    signIn: "/backstage",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" },
      },
      // Note: authorize function defined in auth.ts, not here
    }),
  ],
  callbacks: {
    authorized: async ({ auth, request }) => {
      const isBackstage = request.nextUrl.pathname.startsWith("/backstage");
      const isLoginPage = request.nextUrl.pathname === "/backstage";
      const isLoggedIn = !!auth?.user;

      if (isBackstage && !isLoginPage) {
        // Return false to trigger 404 behavior (handled by middleware)
        return isLoggedIn;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
```

```typescript
// src/lib/auth.ts - Full config with authorize logic
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import argon2 from "argon2";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // Default 7 days, can be overridden
  },
  providers: [
    Credentials({
      ...authConfig.providers[0].options,
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (email !== process.env.ADMIN_EMAIL) {
          return null;
        }

        const isValid = await argon2.verify(
          process.env.ADMIN_PASSWORD_HASH!,
          password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: "admin",
          email: process.env.ADMIN_EMAIL,
          name: "Admin",
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});
```

### Pattern 2: Middleware Route Protection with 404

**What:** Middleware intercepts protected routes and returns 404 for unauthenticated users
**When to use:** For hidden admin routes that should not reveal their existence
**Why:** Per CONTEXT.md, unauthenticated users should see 404, not redirect to login

```typescript
// middleware.ts (or proxy.ts for Next.js 16+)
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isBackstage = req.nextUrl.pathname.startsWith("/backstage");
  const isLoginPage = req.nextUrl.pathname === "/backstage";
  const isLoggedIn = !!req.auth;

  // Login page: redirect to dashboard if already logged in
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/backstage/dashboard", req.url));
  }

  // Protected routes: return 404 if not logged in
  if (isBackstage && !isLoginPage && !isLoggedIn) {
    // Rewrite to 404 page (pretend route doesn't exist)
    return NextResponse.rewrite(new URL("/not-found", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/backstage/:path*"],
};
```

### Pattern 3: Server Action for Login

**What:** Server action handles form submission with error handling
**When to use:** Custom login forms (not Auth.js built-in pages)

```typescript
// src/lib/actions/auth.ts
"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      rememberMe: formData.get("rememberMe") === "on",
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }
  redirect("/backstage/dashboard");
}

export async function logout() {
  await signOut({ redirectTo: "/backstage" });
}
```

### Pattern 4: Layered Defense

**What:** Multiple layers of auth verification
**When to use:** Always - defense in depth

```typescript
// Layer 1: Middleware (route-level, returns 404)
// See middleware.ts above

// Layer 2: Layout (UI-level, session provider)
// src/app/backstage/dashboard/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/backstage");
  }

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}

// Layer 3: Data layer (action-level)
// src/lib/actions/projects.ts
"use server";

import { auth } from "@/lib/auth";

export async function updateProject(id: string, data: ProjectData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  // ... proceed with update
}
```

### Anti-Patterns to Avoid

- **Middleware-only auth:** Never rely solely on middleware for authorization. Always verify session at data layer.
- **Database sessions with Edge:** Don't use database session strategy if you need middleware auth - use JWT.
- **Redirect for hidden routes:** Don't redirect to login page for secret admin routes - return 404.
- **Storing plain passwords:** Never store or compare plain text passwords.
- **NEXTAUTH_ prefix:** v5 uses AUTH_ prefix, not NEXTAUTH_.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | Custom hash function | argon2/bcryptjs | Cryptographic security, timing attack prevention |
| JWT handling | Manual JWT creation | Auth.js + jose | Edge compatibility, token rotation, security |
| Session management | Custom cookies | Auth.js session | CSRF protection, secure cookies, expiry handling |
| CSRF protection | Manual tokens | Auth.js built-in | Automatic token generation and validation |
| Form validation | Manual checks | Zod schemas | Type-safe, reusable, client+server |

**Key insight:** Authentication has countless edge cases (timing attacks, session fixation, CSRF, token refresh). Auth.js handles these automatically.

## Common Pitfalls

### Pitfall 1: Edge Runtime Incompatibility

**What goes wrong:** Middleware crashes with "Module not found" or "tty module" errors
**Why it happens:** Database adapters/argon2 use Node.js APIs unavailable in Edge Runtime
**How to avoid:** Use split configuration pattern. Keep adapter-dependent code in auth.ts, edge-safe config in auth.config.ts
**Warning signs:** Build errors mentioning Edge Runtime, tty, or specific Node modules

### Pitfall 2: Session Returning Null with Credentials

**What goes wrong:** `auth()` returns null even after successful login
**Why it happens:** Credentials provider requires explicit JWT callback to persist user data
**How to avoid:** Always implement jwt and session callbacks that pass user data to token
**Warning signs:** Login appears successful but session is empty

### Pitfall 3: signOut Not Clearing Session

**What goes wrong:** After logout, session cookies persist in browser
**Why it happens:** Server-side signOut in Server Actions may not properly clear client cookies
**How to avoid:** Call signOut with redirect, or use client-side signOut from next-auth/react for reliability
**Warning signs:** User can navigate back to protected routes after logout

### Pitfall 4: "Remember Me" Dynamic maxAge

**What goes wrong:** Session duration doesn't change based on checkbox
**Why it happens:** `session.maxAge` is static config, not dynamic per-login
**How to avoid:** Use custom JWT encoding or store rememberMe flag in token, handle in jwt callback
**Warning signs:** All sessions have same duration regardless of checkbox state

### Pitfall 5: Middleware Security Bypass (CVE-2025-29927)

**What goes wrong:** Attackers bypass middleware auth by manipulating headers
**Why it happens:** Next.js versions 11.1.4-15.2.2 had critical vulnerability
**How to avoid:** Upgrade to Next.js 15.2.3+. Never rely solely on middleware for auth.
**Warning signs:** Using Next.js < 15.2.3, middleware-only auth

### Pitfall 6: Wrong Credentials Endpoint

**What goes wrong:** Login fails with "UnknownAction" error
**Why it happens:** POSTing to /api/auth/login instead of /api/auth/callback/credentials
**How to avoid:** Use Auth.js signIn function, not manual fetch to custom endpoints
**Warning signs:** Custom fetch calls to auth endpoints

## Code Examples

Verified patterns from official sources:

### Password Hashing with Argon2

```typescript
// scripts/hash-password.ts - Run once to generate hash for .env
import argon2 from "argon2";

async function hashPassword(password: string) {
  // Uses argon2id variant (recommended by RFC 9106)
  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,       // 3 iterations
    parallelism: 4,    // 4 threads
  });
  console.log("ADMIN_PASSWORD_HASH=" + hash);
}

hashPassword("your-secure-password");
```

```typescript
// Verification in authorize function
import argon2 from "argon2";

async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false; // Malformed hash or other error
  }
}
```

### Login Form Component

```typescript
// src/app/backstage/components/login-form.tsx
"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-red-500/10 text-red-500 p-3 rounded">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={isPending}
        />
      </div>

      <div className="relative">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          disabled={isPending}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-8"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="rememberMe"
          name="rememberMe"
          type="checkbox"
          defaultChecked
        />
        <label htmlFor="rememberMe">Remember me for 7 days</label>
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="animate-spin mr-2" size={20} />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
```

### Environment Variables

```bash
# .env.local
AUTH_SECRET="generate-with-openssl-rand-base64-32"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD_HASH="$argon2id$v=19$m=65536,t=3,p=4$..."

# Generate AUTH_SECRET:
# openssl rand -base64 32

# Generate ADMIN_PASSWORD_HASH:
# npx tsx scripts/hash-password.ts
```

### Route Handler

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| NEXTAUTH_ env prefix | AUTH_ prefix | Auth.js v5 | Update all env vars |
| getServerSession() | auth() | Auth.js v5 | Simpler unified API |
| next-auth/next imports | next-auth imports | Auth.js v5 | Updated import paths |
| middleware.ts | proxy.ts (optional) | Next.js 16 | Renamed, same API for now |
| @next-auth/prisma-adapter | @auth/prisma-adapter | Auth.js v5 | New package scope |

**Deprecated/outdated:**
- `getServerSession()`: Use `auth()` instead
- `getToken()`: Use `auth()` which returns session with user
- `NEXTAUTH_URL`: Now `AUTH_URL` (auto-detected in most cases)
- `NEXTAUTH_SECRET`: Now `AUTH_SECRET`

## Open Questions

Things that couldn't be fully resolved:

1. **"Remember Me" with conditional session duration**
   - What we know: session.maxAge is static config, not per-login
   - What's unclear: Best approach for truly dynamic session expiry in Auth.js v5
   - Recommendation: Store `rememberMe` flag in JWT token, set appropriate cookie maxAge in jwt callback. May need custom cookie handling.

2. **Session expiry modal prompt**
   - What we know: Auth.js doesn't have built-in expiry detection on client
   - What's unclear: Best UX pattern for detecting impending expiry
   - Recommendation: Use `useSession` with `refetchInterval`, check `session.expires` against current time, show modal when close to expiry

3. **Next.js middleware vs proxy naming**
   - What we know: proxy.ts is the new name in Next.js 16, middleware.ts still works in 15.x
   - What's unclear: Exact deprecation timeline
   - Recommendation: Use middleware.ts for Next.js 15.x, plan migration to proxy.ts when upgrading

## Sources

### Primary (HIGH confidence)
- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5) - Configuration structure, env vars, breaking changes
- [Auth.js Edge Compatibility](https://authjs.dev/guides/edge-compatibility) - Split configuration pattern
- [Auth.js Protecting Routes](https://authjs.dev/getting-started/session-management/protecting) - Layered defense approach
- [Auth.js Credentials Provider](https://authjs.dev/getting-started/authentication/credentials) - Authorize function, schema validation
- [Auth.js Custom Signin Page](https://authjs.dev/guides/pages/signin) - Custom login implementation
- [Next.js proxy.ts Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) - Middleware/proxy configuration
- [Next.js not-found.js](https://nextjs.org/docs/app/api-reference/file-conventions/not-found) - 404 handling
- [argon2 npm package](https://www.npmjs.com/package/argon2) - Password hashing API

### Secondary (MEDIUM confidence)
- [How to Set Up Next.js 15 with NextAuth v5](https://codevoweb.com/how-to-set-up-next-js-15-with-nextauth-v5/) - Full setup walkthrough
- [Senior Dev's Guide to Next.js 15 & Auth.js v5](https://javascript.plainenglish.io/stop-crying-over-auth-a-senior-devs-guide-to-next-js-15-auth-js-v5-42a57bc5b4ce) - Practical patterns
- [GitHub Discussion: Remember Me Functionality](https://github.com/nextauthjs/next-auth/discussions/3794) - Session maxAge approaches

### Tertiary (LOW confidence)
- [Password Hashing Guide 2026](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/) - Argon2 vs bcrypt comparison
- Various Medium articles on Auth.js v5 setup (corroborate but don't rely solely)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Auth.js documentation, verified package compatibility
- Architecture patterns: HIGH - Official Auth.js guides for split config and layered defense
- Pitfalls: HIGH - Well-documented issues in GitHub discussions and official guides

**Research date:** 2026-01-22
**Valid until:** 2026-02-22 (30 days - Auth.js v5 is stable beta, patterns established)
