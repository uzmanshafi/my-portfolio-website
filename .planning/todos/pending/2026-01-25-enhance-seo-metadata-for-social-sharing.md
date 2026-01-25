---
created: 2026-01-25T12:15
title: Enhance SEO metadata for social sharing
area: ui
files:
  - src/app/page.tsx
  - src/app/layout.tsx
---

## Problem

The portfolio currently has basic metadata but could benefit from enhanced Open Graph and Twitter Card tags for better social sharing previews. When someone shares the portfolio on LinkedIn, Twitter, or other platforms, a rich preview with image and description increases engagement.

Current state:
- Basic `generateMetadata` in page.tsx pulls from bio data
- No Open Graph image specified
- No Twitter card configuration
- No structured data (JSON-LD)

## Solution

Enhance metadata in `src/app/page.tsx` and/or `src/app/layout.tsx`:

1. **Open Graph tags:**
   - `og:image` - Profile image or custom OG image
   - `og:image:width` / `og:image:height` - Dimensions for proper rendering
   - `og:type` - "website" or "profile"
   - `og:site_name` - Portfolio name

2. **Twitter Card tags:**
   - `twitter:card` - "summary_large_image" for prominent preview
   - `twitter:image` - Same as OG image
   - `twitter:creator` - Twitter handle if available

3. **Structured data (optional):**
   - JSON-LD Person schema for rich search results
   - Include name, job title, social profiles

4. **Consider:**
   - Creating a dedicated OG image (1200x630px) stored in public/
   - Or dynamically generating OG image from bio data using @vercel/og
