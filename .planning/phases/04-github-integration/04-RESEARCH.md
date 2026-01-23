# Phase 4: GitHub Integration - Research

**Researched:** 2026-01-23
**Domain:** GitHub OAuth, GitHub API, Auth.js v5 multi-provider, background sync
**Confidence:** HIGH

## Summary

This phase integrates GitHub OAuth as a secondary authentication mechanism (alongside existing credentials-based admin login) to allow the admin to connect their GitHub account, browse repositories, and sync selected projects. The implementation involves:

1. **Auth.js v5 Multi-Provider Setup** - Adding GitHub OAuth provider to existing credentials configuration while storing the GitHub access token in JWT for API calls
2. **GitHub REST API Integration** - Using Octokit.js for authenticated API calls with pagination, rate limiting, and caching
3. **Schema Extension** - Adding fields to track GitHub connection state and customization overrides
4. **Background Sync** - Vercel Cron Jobs to periodically refresh GitHub data without manual intervention

**Primary recommendation:** Use Auth.js v5's account callback to capture the GitHub OAuth access token, store it encrypted in the database (not just JWT), and use Octokit.js with the throttling plugin for all GitHub API interactions. Implement Vercel Cron Jobs for daily background sync.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-auth | ^5.0.0-beta.30 | GitHub OAuth provider (already installed) | Auth.js v5 has native GitHub provider with scope configuration |
| octokit | ^4.x | GitHub REST API client | Official GitHub SDK with TypeScript, pagination, throttling |
| @octokit/plugin-throttling | (included) | Rate limit handling | Part of main octokit package, implements GitHub best practices |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jose | ^6.1.3 (installed) | Encrypt/decrypt GitHub token | Already used for JWT, can encrypt tokens at rest |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Octokit | Raw fetch | Octokit handles pagination, types, rate limits automatically |
| REST API | GraphQL API | GraphQL more efficient for complex queries but REST simpler for basic repo listing |
| Vercel Cron | GitHub Actions | Vercel Cron native to deployment platform, simpler for this use case |

**Installation:**
```bash
npm install octokit
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── auth.ts              # Extended with GitHub provider
│   ├── github/
│   │   ├── client.ts        # Octokit client factory
│   │   ├── types.ts         # GitHub API response types
│   │   └── queries.ts       # Repository fetching functions
│   └── actions/
│       └── github.ts        # Server actions for GitHub operations
├── app/
│   ├── api/
│   │   └── cron/
│   │       └── sync-github/
│   │           └── route.ts # Background sync endpoint
│   └── backstage/
│       └── dashboard/
│           └── github/
│               └── page.tsx # GitHub repository browser
```

### Pattern 1: Multi-Provider Auth.js Configuration

**What:** Adding GitHub OAuth alongside existing Credentials provider
**When to use:** When admin needs both password login AND GitHub OAuth connection
**Example:**
```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      // existing credentials config...
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: {
        params: {
          // Request repo scope to access private repos
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Capture GitHub access token on OAuth login
      if (account?.provider === 'github') {
        token.githubAccessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose whether GitHub is connected
      session.githubConnected = !!token.githubAccessToken;
      return session;
    },
  },
});
```

### Pattern 2: Octokit Client with Access Token

**What:** Creating authenticated Octokit client from stored token
**When to use:** All GitHub API interactions
**Example:**
```typescript
// src/lib/github/client.ts
import { Octokit } from 'octokit';

export function createGitHubClient(accessToken: string) {
  return new Octokit({
    auth: accessToken,
    throttle: {
      onRateLimit: (retryAfter, options, octokit, retryCount) => {
        octokit.log.warn(`Rate limit hit, retrying after ${retryAfter}s`);
        return retryCount < 2; // Retry twice
      },
      onSecondaryRateLimit: (retryAfter, options, octokit) => {
        octokit.log.warn(`Secondary rate limit hit`);
        return false; // Don't retry
      },
    },
  });
}
```

### Pattern 3: Paginated Repository Fetching

**What:** Fetching all repositories with pagination
**When to use:** Repository browser, initial sync
**Example:**
```typescript
// src/lib/github/queries.ts
export async function fetchUserRepos(octokit: Octokit, page = 1, perPage = 30) {
  const response = await octokit.rest.repos.listForAuthenticatedUser({
    sort: 'updated',
    direction: 'desc',
    per_page: perPage,
    page,
    visibility: 'all', // public, private, internal
  });

  return {
    repos: response.data,
    hasMore: response.data.length === perPage,
  };
}

// Or fetch ALL repos using pagination iterator
export async function fetchAllUserRepos(octokit: Octokit) {
  return octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
    sort: 'updated',
    per_page: 100,
  });
}
```

### Pattern 4: Token Storage Strategy

**What:** Securely storing GitHub access token for background sync
**When to use:** When OAuth token needed for cron jobs (no active session)
**Critical Decision:** Store encrypted token in database, not just JWT

```typescript
// Schema addition for GitHubConnection
model GitHubConnection {
  id              String    @id @default(cuid())
  accessToken     String    // Encrypted with jose
  username        String
  connectedAt     DateTime  @default(now())
  lastSyncAt      DateTime?
  syncError       String?   // Last sync error if any
}
```

### Anti-Patterns to Avoid

- **Storing raw access token in JWT only:** Background cron jobs have no session, need database storage
- **Fetching all repos on every page load:** Cache results, use pagination
- **Ignoring rate limits:** GitHub has 5000 req/hour limit, use Octokit throttling
- **Overwriting admin customizations:** Track which fields are customized, skip them during sync

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GitHub API pagination | Manual page tracking | `octokit.paginate()` | Handles all edge cases, returns all results |
| Rate limit handling | Custom retry logic | `@octokit/plugin-throttling` | Follows GitHub's official guidelines |
| OAuth flow | Manual redirect handling | Auth.js GitHub provider | Handles PKCE, state, token exchange |
| Scheduled tasks | setInterval/cron libraries | Vercel Cron Jobs | Native to platform, no server needed |
| Token encryption | Custom encryption | jose library | Already in project, standards-compliant |

**Key insight:** GitHub's API has complex rate limiting (primary + secondary limits), pagination via Link headers, and conditional request support. Octokit handles all of this; raw fetch requires reimplementing it all.

## Common Pitfalls

### Pitfall 1: JWT-Only Token Storage
**What goes wrong:** Cron jobs for background sync cannot access JWT tokens
**Why it happens:** JWT is tied to user session, cron has no session
**How to avoid:** Store encrypted access token in database (GitHubConnection model)
**Warning signs:** Background sync fails with "no token" errors

### Pitfall 2: Requesting Wrong OAuth Scopes
**What goes wrong:** Can only see public repos, not private
**Why it happens:** Default GitHub OAuth scope is `read:user user:email` only
**How to avoid:** Explicitly request `repo` scope in authorization params
**Warning signs:** API returns fewer repos than expected

### Pitfall 3: Overwriting Admin Customizations During Sync
**What goes wrong:** Admin edits title/description, next sync reverts it
**Why it happens:** Sync blindly updates all fields from GitHub
**How to avoid:** Track which fields are customized (JSON field or separate columns), skip during sync
**Warning signs:** Admin changes keep disappearing

### Pitfall 4: Rate Limit Exhaustion
**What goes wrong:** API calls start failing with 403
**Why it happens:** Exceeding 5000 requests/hour or secondary abuse limits
**How to avoid:** Use Octokit throttling plugin, cache responses, use conditional requests
**Warning signs:** Intermittent API failures, 403 responses with rate limit headers

### Pitfall 5: Not Handling Deleted/Private Repos
**What goes wrong:** Portfolio shows projects that no longer exist or are now private
**Why it happens:** Sync only updates existing data, doesn't check deletion
**How to avoid:** Mark projects as hidden when source repo returns 404 or is private
**Warning signs:** Broken links, stale project data

## Code Examples

Verified patterns from official sources:

### GitHub OAuth Provider with Custom Scope
```typescript
// Source: https://authjs.dev/guides/configuring-oauth-providers
import GitHub from 'next-auth/providers/github';

GitHub({
  authorization: {
    params: {
      scope: 'read:user user:email repo',
    },
  },
});
```

### Capturing Access Token in JWT Callback
```typescript
// Source: https://authjs.dev/guides/refresh-token-rotation
callbacks: {
  async jwt({ token, account }) {
    if (account) {
      // First-time login - capture tokens
      return {
        ...token,
        access_token: account.access_token,
        provider: account.provider,
      };
    }
    return token;
  },
}
```

### Octokit Paginated Repository List
```typescript
// Source: https://github.com/octokit/plugin-paginate-rest.js
const repos = await octokit.paginate(
  octokit.rest.repos.listForAuthenticatedUser,
  {
    sort: 'updated',
    per_page: 100,
  },
  (response) => response.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    stars: repo.stargazers_count,
    language: repo.language,
    private: repo.private,
    htmlUrl: repo.html_url,
  }))
);
```

### Get Single Repository Details
```typescript
// Source: https://docs.github.com/en/rest/repos/repos
const { data: repo } = await octokit.rest.repos.get({
  owner: 'username',
  repo: 'repo-name',
});

// Response includes:
// - stargazers_count (stars)
// - description
// - language (primary)
// - full_name, html_url, etc.
```

### Vercel Cron Job Configuration
```json
// vercel.json
// Source: https://vercel.com/docs/cron-jobs
{
  "crons": [
    {
      "path": "/api/cron/sync-github",
      "schedule": "0 4 * * *"
    }
  ]
}
```

### Cron Route Handler with Security
```typescript
// app/api/cron/sync-github/route.ts
export async function GET(request: Request) {
  // Verify request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Perform sync...
  return Response.json({ synced: true });
}
```

### TypeScript Type Extensions for Auth.js
```typescript
// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    githubConnected?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    githubAccessToken?: string;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-auth v4 | Auth.js v5 (next-auth ^5.0.0) | 2024 | New callback signatures, automatic env var inference |
| Manual pagination | `octokit.paginate()` | Current | Simplifies fetching all pages |
| Server-side intervals | Vercel Cron Jobs | 2023 | Serverless-compatible scheduling |
| Storing tokens in session | JWT + database hybrid | Current | Enables background operations |

**Deprecated/outdated:**
- `getServerSession()` from next-auth/next: Use `auth()` from your config file in v5
- `@auth/core` imports: Provider definitions now come from `next-auth` itself
- OAuth 1.0 support: Deprecated in Auth.js v5

## Schema Modifications Required

### New GitHubConnection Model
```prisma
model GitHubConnection {
  id              String    @id @default(cuid())
  accessToken     String    // Encrypted
  username        String
  avatarUrl       String?
  connectedAt     DateTime  @default(now())
  lastSyncAt      DateTime?
  syncError       String?
}
```

### Project Model Extensions
```prisma
model Project {
  // Existing fields...

  // GitHub sync fields (some already exist)
  githubId         Int?      @unique  // Already exists
  githubFullName   String?   // NEW: owner/repo for API calls
  stars            Int       @default(0)  // Already exists
  forks            Int       @default(0)  // Already exists
  language         String?   // Already exists

  // Customization tracking (NEW)
  isGitHubSynced   Boolean   @default(false)  // Distinguishes manual vs synced
  customizedFields String[]  // Track which fields admin has customized
  lastSyncedAt     DateTime? // When GitHub data was last pulled
}
```

The `customizedFields` array tracks which fields the admin has manually edited. During sync, skip these fields. Example: `["title", "description"]` means don't overwrite title or description from GitHub.

## Open Questions

Things that couldn't be fully resolved:

1. **GitHub Open Graph Image Retrieval**
   - What we know: GraphQL API has `openGraphImageUrl` field, returns custom social preview or falls back to user avatar
   - What's unclear: Whether this reliably returns repo-specific preview vs user avatar
   - Recommendation: Use GraphQL `openGraphImageUrl` first, fall back to auto-generated `https://opengraph.githubassets.com/{sha}/{owner}/{repo}`

2. **Token Refresh for Long-Lived Connections**
   - What we know: GitHub OAuth tokens don't expire by default for OAuth Apps
   - What's unclear: Whether using GitHub App (fine-grained permissions) changes this
   - Recommendation: Use OAuth App (not GitHub App) for simplicity; tokens persist until revoked

3. **Disconnection Flow**
   - What we know: Need to handle user revoking GitHub OAuth access
   - What's unclear: Best UX for projects that lose their sync source
   - Recommendation: Keep projects but mark `isGitHubSynced: false`, show "disconnected" badge

## Sources

### Primary (HIGH confidence)
- Auth.js v5 OAuth configuration: https://authjs.dev/guides/configuring-oauth-providers
- Auth.js v5 token handling: https://authjs.dev/guides/refresh-token-rotation
- GitHub REST API repos: https://docs.github.com/en/rest/repos/repos
- GitHub OAuth scopes: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
- Octokit pagination: https://github.com/octokit/plugin-paginate-rest.js
- Octokit throttling: https://github.com/octokit/plugin-throttling.js
- Vercel Cron Jobs: https://vercel.com/docs/cron-jobs

### Secondary (MEDIUM confidence)
- Auth.js v5 multiple providers: WebSearch verified with official docs
- Octokit main package: https://github.com/octokit/octokit.js

### Tertiary (LOW confidence)
- GitHub Open Graph image behavior: Community discussions indicate inconsistent results

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Auth.js docs, Octokit docs
- Architecture: HIGH - Patterns from official documentation
- Pitfalls: HIGH - Well-documented common issues
- Schema design: MEDIUM - Based on requirements analysis, not external validation

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days - Auth.js v5 is stable, GitHub API rarely changes)
