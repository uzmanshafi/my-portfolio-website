# Phase 8: SEO Metadata - Research

**Researched:** 2026-01-25
**Domain:** Next.js Metadata API, Open Graph Protocol, JSON-LD Structured Data
**Confidence:** HIGH

## Summary

This phase implements SEO metadata for the portfolio, enabling rich social media previews and structured data for search engines. The implementation leverages Next.js App Router's built-in `generateMetadata` function for Open Graph and Twitter Card meta tags, combined with `schema-dts` for type-safe JSON-LD structured data.

The approach involves:
1. **Database extension** - Add SEO-specific fields to store custom OG image URL, SEO title, and SEO description
2. **Admin SEO section** - New dashboard page for managing SEO settings with OG image upload
3. **Metadata generation** - Extend `generateMetadata` in `page.tsx` to include Open Graph and Twitter Card tags
4. **JSON-LD injection** - Add Person and WebSite structured data schemas to the page

**Primary recommendation:** Use Next.js native `generateMetadata` with dynamic data from database, store static OG image in Supabase Storage, and inject JSON-LD via script tag with `schema-dts` types for validation.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js Metadata API | 15.5.9 (current) | Open Graph and Twitter Card meta tags | Built-in, no dependencies, SSR-optimized |
| schema-dts | 1.1.5 | TypeScript types for JSON-LD | Google-maintained, type-safe Schema.org |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | - | - | Next.js handles everything |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| schema-dts | next-seo | next-seo adds JSON-LD helpers but schema-dts is lighter and Google-maintained |
| Static OG image | Dynamic @vercel/og | Dynamic generation adds complexity; static image sufficient for single-page portfolio |
| Manual JSON-LD | react-schemaorg | react-schemaorg wraps script injection but adds dependency; manual approach is simpler |

**Installation:**
```bash
npm install --save-dev schema-dts
```

Note: `schema-dts` is type-only (no runtime code), so can be devDependency.

## Architecture Patterns

### Database Schema Extension
```prisma
model SeoSettings {
  id            String   @id @default(cuid())
  ogImageUrl    String?  // Supabase storage URL for OG image
  seoTitle      String?  // Custom title (fallback to bio.name + bio.title)
  seoDescription String? // Custom description (fallback to bio.headline)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Recommended File Structure
```
src/
├── app/
│   ├── page.tsx                           # Extend generateMetadata here
│   └── backstage/dashboard/seo/
│       ├── page.tsx                       # SEO admin page (server component)
│       └── seo-manager.tsx                # SEO form client component
├── components/
│   └── seo/
│       └── json-ld.tsx                    # JSON-LD injection component
├── lib/
│   ├── actions/
│   │   └── seo.ts                         # Server actions for SEO settings
│   ├── data/
│   │   └── portfolio.ts                   # Extend to fetch SEO settings
│   └── validations/
│       └── seo.ts                         # Zod schema for SEO form
```

### Pattern 1: Dynamic Metadata Generation
**What:** Use `generateMetadata` async function to fetch data and return metadata object
**When to use:** Always - Next.js automatically handles meta tag injection
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata } from "next";
import { getPortfolioData } from "@/lib/data/portfolio";

export async function generateMetadata(): Promise<Metadata> {
  const { bio, seoSettings, socialLinks } = await getPortfolioData();

  // Build absolute URL for OG image
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";
  const ogImageUrl = seoSettings?.ogImageUrl
    || bio?.imageUrl
    || `${siteUrl}/default-og.png`;

  const title = seoSettings?.seoTitle
    || (bio?.name && bio?.title ? `${bio.name} | ${bio.title}` : "Portfolio");

  const description = seoSettings?.seoDescription
    || bio?.headline
    || "Personal portfolio website";

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: bio?.name || "Portfolio",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${bio?.name || "Portfolio"} preview`,
        },
      ],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}
```

### Pattern 2: JSON-LD Component Injection
**What:** Server component that renders JSON-LD script tag
**When to use:** For structured data (Person, WebSite schemas)
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/json-ld
import type { Person, WebSite, WithContext } from "schema-dts";

interface JsonLdProps {
  bio: { name: string; title: string; imageUrl?: string | null } | null;
  siteUrl: string;
  socialLinks: { platform: string; url: string }[];
}

export function JsonLd({ bio, siteUrl, socialLinks }: JsonLdProps) {
  const personSchema: WithContext<Person> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: bio?.name || "Developer",
    jobTitle: bio?.title || "Software Developer",
    url: siteUrl,
    image: bio?.imageUrl || undefined,
    sameAs: socialLinks.map(link => link.url),
  };

  const websiteSchema: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${bio?.name || "Developer"} Portfolio`,
    url: siteUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
```

### Pattern 3: OG Image Upload in Admin
**What:** Reuse existing image upload pattern with 1200x630 aspect ratio
**When to use:** In SEO admin section for OG image management
**Example:**
```typescript
// Reuse existing ImageCropper with different aspect ratio
<ImageCropper
  imageSrc={selectedImage}
  onCropComplete={handleCropComplete}
  onCancel={handleCropCancel}
  aspect={1200 / 630}  // OG image aspect ratio (1.91:1)
/>
```

### Anti-Patterns to Avoid
- **Hardcoding site URL:** Use `process.env.NEXT_PUBLIC_SITE_URL` for metadataBase
- **Relative OG image paths without metadataBase:** Will break on social platforms
- **JSON.stringify without XSS sanitization:** Always replace `<` with `\u003c`
- **Storing OG image dimensions in database:** Fixed at 1200x630, no need to store
- **Creating separate Twitter images:** Twitter falls back to og:image; one image suffices

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Meta tag generation | Custom `<meta>` tags in Head | Next.js `generateMetadata` | Automatic deduplication, streaming support |
| OG image serving | Custom image endpoint | Static file in Supabase Storage | No runtime cost, CDN cached |
| JSON-LD types | Manual type definitions | `schema-dts` types | Google-maintained, always current with Schema.org |
| URL composition | String concatenation | `metadataBase` + relative paths | Handles edge cases, protocol prefixing |
| Social card validation | Manual testing | Platform debuggers | Facebook, Twitter, LinkedIn all have official tools |

**Key insight:** Next.js Metadata API handles the complexity of meta tag ordering, deduplication across layouts, and proper head injection. Manual approaches miss these edge cases.

## Common Pitfalls

### Pitfall 1: metadataBase Not Set
**What goes wrong:** OG images use relative paths, which don't work for social crawlers
**Why it happens:** Developers forget that social platforms need absolute URLs
**How to avoid:** Always set `metadataBase` in root layout or page metadata
**Warning signs:** "metadata.metadataBase is not set" console warning

### Pitfall 2: OG Image Size Validation
**What goes wrong:** Image appears cropped or pixelated on social platforms
**Why it happens:** Image not exactly 1200x630 or file too large
**How to avoid:**
- Enforce 1200x630 at upload time via ImageCropper aspect ratio
- Validate file size < 8MB (LinkedIn limit)
**Warning signs:** Blurry or cropped preview in platform debuggers

### Pitfall 3: NEXT_PUBLIC_SITE_URL Not Configured in Production
**What goes wrong:** metadataBase falls back to localhost, breaking all OG URLs
**Why it happens:** Environment variable not set in deployment platform (Render)
**How to avoid:**
- Add `NEXT_PUBLIC_SITE_URL` to Render environment variables
- Set to production domain (e.g., `https://yourdomain.com`)
**Warning signs:** OG images not loading, sharing shows localhost URLs

### Pitfall 4: JSON-LD XSS Vulnerability
**What goes wrong:** Malicious content in bio fields could inject scripts
**Why it happens:** `JSON.stringify` doesn't escape `<script>` tags
**How to avoid:** Always sanitize: `JSON.stringify(data).replace(/</g, "\\u003c")`
**Warning signs:** Rich Results Test showing parsing errors

### Pitfall 5: Caching Prevents OG Updates
**What goes wrong:** Social platforms cache old OG data, new image doesn't appear
**Why it happens:** Platforms cache for 24-48 hours; OG image URL unchanged
**How to avoid:**
- Append timestamp or hash to OG image filename on update
- Use platform cache busters (Facebook Sharing Debugger scrape button)
**Warning signs:** Old preview persists after updating OG image

### Pitfall 6: Twitter Creator Without Handle
**What goes wrong:** Error or warning when twitter:creator is empty
**Why it happens:** Including empty twitter:creator tag
**How to avoid:** Omit twitter:creator entirely when no handle available (per CONTEXT.md decision)
**Warning signs:** Twitter Card Validator warnings

## Code Examples

Verified patterns from official sources:

### Complete generateMetadata Implementation
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { bio, seoSettings, socialLinks } = await getPortfolioData();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const title = seoSettings?.seoTitle || `${bio?.name} | ${bio?.title}`;
  const description = seoSettings?.seoDescription || bio?.headline;
  const ogImage = seoSettings?.ogImageUrl || `${siteUrl}/default-og.png`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,

    // Open Graph - Facebook, LinkedIn, most platforms
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: bio?.name || "Portfolio",
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${bio?.name} portfolio preview`,
      }],
      type: "website",
      locale: "en_US",
    },

    // Twitter/X - Large image card
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      // Note: Omitting twitter:creator per CONTEXT.md decision
    },

    // Additional LinkedIn-preferred tags via other
    other: {
      "article:author": bio?.name || "",
    },
  };
}
```

### Type-Safe JSON-LD with schema-dts
```typescript
// Source: https://github.com/google/schema-dts
import type { Person, WebSite, WithContext } from "schema-dts";

// Person schema with sameAs for social profiles
const personSchema: WithContext<Person> = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "John Doe",
  jobTitle: "Full-Stack Developer",
  url: "https://johndoe.com",
  image: "https://johndoe.com/profile.jpg",
  sameAs: [
    "https://github.com/johndoe",
    "https://linkedin.com/in/johndoe",
    "https://twitter.com/johndoe",
  ],
};

// WebSite schema
const websiteSchema: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "John Doe Portfolio",
  url: "https://johndoe.com",
};

// Inject in component (must sanitize!)
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
  }}
/>
```

### SEO Settings Server Action Pattern
```typescript
// Source: Follows existing project patterns (bio.ts, storage.ts)
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSeoSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const seoTitle = formData.get("seoTitle") as string;
  const seoDescription = formData.get("seoDescription") as string;

  await prisma.seoSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
    },
    update: {
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
    },
  });

  revalidatePath("/");
  return { success: true };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-seo package | Native generateMetadata | Next.js 13+ (2023) | No external dependency needed |
| Custom Head component | Metadata API | Next.js 13+ (2023) | Better streaming, deduplication |
| next/head | Export metadata object | Next.js 13+ (2023) | Server-side only, no hydration |
| Manual JSON-LD strings | schema-dts types | stable since 2021 | Type safety, IDE completions |

**Deprecated/outdated:**
- `next/head` in App Router - Use Metadata API instead
- `next-seo` package - Now redundant with native support
- Inline meta tags in layout.tsx - Use metadata export

## Open Questions

Things that couldn't be fully resolved:

1. **LinkedIn article:author handling**
   - What we know: LinkedIn prefers `article:author` for author attribution
   - What's unclear: Whether `other: { "article:author": name }` renders correctly in Next.js
   - Recommendation: Test with LinkedIn Post Inspector after implementation

2. **OG image cache invalidation strategy**
   - What we know: Platforms cache OG data aggressively (24-48 hours)
   - What's unclear: Best pattern for forcing cache refresh on image update
   - Recommendation: Append timestamp to filename (e.g., `og-1234567890.jpg`) on each upload

## Sources

### Primary (HIGH confidence)
- [Next.js generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - Official API reference
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld) - Official implementation pattern
- [schema-dts GitHub](https://github.com/google/schema-dts) - Google's official TypeScript types for Schema.org
- [Schema.org Person](https://schema.org/Person) - Official property reference

### Secondary (MEDIUM confidence)
- [Open Graph Protocol](https://ogp.me/) - Official OG specification
- [Twitter Card Docs](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards) - Twitter card types
- [LinkedIn Share Documentation](https://www.linkedin.com/help/linkedin/answer/a521928) - LinkedIn OG requirements

### Tertiary (LOW confidence - for validation)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) - Testing tool
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) - Testing tool
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) - Testing tool
- [Google Rich Results Test](https://search.google.com/test/rich-results) - JSON-LD validation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Next.js native, Google-maintained schema-dts
- Architecture: HIGH - Follows existing project patterns, well-documented
- Pitfalls: HIGH - Common issues well-documented in Next.js discussions
- JSON-LD patterns: HIGH - Official examples from Next.js docs

**Research date:** 2026-01-25
**Valid until:** 2026-03-25 (stable APIs, unlikely to change)
