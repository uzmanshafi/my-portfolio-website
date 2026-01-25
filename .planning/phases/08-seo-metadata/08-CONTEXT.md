# Phase 8: SEO Metadata - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Portfolio appears with rich previews when shared on social media and search results. Includes Open Graph tags, Twitter Card tags, properly sized OG image, and JSON-LD structured data with Person schema.

</domain>

<decisions>
## Implementation Decisions

### OG Image approach
- Static image uploaded to Supabase storage (not dynamically generated)
- Image content: Name + title + headshot (professional card-style)
- Admin dashboard gets OG image upload field in a new SEO section
- Image should be 1200x630 pixels for optimal social sharing

### Meta content
- OG title: Combines name + tagline from bio (e.g., "John Doe | Full-Stack Developer")
- OG description: Custom SEO description field (separate from bio text)
- New admin section: Separate "SEO" sidebar item for all SEO settings
- Fallback pattern: If custom SEO fields empty, fall back to bio data

### Structured data depth
- Extended Person schema: name, jobTitle, image, url + sameAs array with social links
- Also include WebSite schema type alongside Person
- Data source: Pull dynamically from existing database (bio, contact, social links)
- Use schema-dts library for type-safe JSON-LD

### Social platform handling
- Twitter/X: Same as OG (twitter:card inherits from og:image)
- Twitter card type: summary_large_image (large preview)
- Twitter creator: Skip twitter:creator tag (no handle)
- LinkedIn: Add article:author and other LinkedIn-preferred tags
- Standard og:* and twitter:* cover most platforms

### Claude's Discretion
- Exact meta tag ordering in head
- OG image upload UI placement within SEO section
- Fallback logic implementation details
- Additional schema.org properties beyond specified

</decisions>

<specifics>
## Specific Ideas

- OG image should feel professional — name, title, and headshot like a digital business card
- New SEO admin section keeps metadata management separate from content editing
- schema-dts already identified in v1.1 research — aligns with project decisions

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-seo-metadata*
*Context gathered: 2026-01-25*
