# External Integrations

**Analysis Date:** 2026-01-22

## APIs & External Services

**Content Delivery:**
- Google Fonts API - Font delivery (Roboto typeface)
  - URL: `https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap`
  - Preconnected for performance

- Font Preload
  - gstatic.com - Google Fonts assets preconnection
  - URL: `https://fonts.gstatic.com`

- Cloudflare CDN - Animate.css library
  - URL: `https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css`
  - Version: 4.1.1

- Simple Icons API - Skill badge icons
  - URL: `https://cdn.simpleicons.org/`
  - Used for: Tailwind CSS, MongoDB, MySQL, Git, GitHub icons
  - No authentication required

**Social Links (External):**
- GitHub: `https://github.com/uzmanshafi`
- LinkedIn: `https://www.linkedin.com/in/shafiuzman/`
- Instagram: `https://www.instagram.com/uzim4n/`
- X/Twitter: `https://x.com/onlyuzman`
- YouTube: Links in project sections

**Project Links (External):**
- GitHub repository links for portfolio projects
- YouTube video links for project demonstrations

## Data Storage

**Databases:**
- Not applicable - Static site only

**File Storage:**
- Local filesystem only
- Images stored in: `build/images/`
- Icons stored in: `build/images/icons/`
  - Frontend icons: `build/images/icons/frontend/`
  - Backend icons: `build/images/icons/backend/`
  - Design icons: `build/images/icons/design/`
- CSS stored in: `build/css/`
- Source CSS: `src/input.css`

**Caching:**
- Client-side caching via HTTP headers configured in `render.yaml`
  - Max-age: 31536000 seconds (1 year) for immutable assets
  - Applied to: `/*`, `/docs/*`, `/images/*`

## Authentication & Identity

**Auth Provider:**
- Not applicable - Portfolio is publicly accessible read-only content
- No user authentication required
- No login system

**Contact Information:**
- Email: `uzmanshafi@gmail.com` (hardcoded in HTML, manually copyable)
- No backend form submission

## Monitoring & Observability

**Error Tracking:**
- Not detected - Static site has minimal runtime errors

**Logs:**
- Not applicable - No backend logging system

**Performance:**
- Google Fonts preconnection for optimized font loading
- Cloudflare CDN for fast CSS library delivery

## CI/CD & Deployment

**Hosting:**
- Render.com (static web service)
  - Service type: Static
  - Publish path: `build/`
  - Domain: Portfolio website accessible via Render

**CI Pipeline:**
- Pull request preview enabled in `render.yaml`
  - Automatic previews for PRs
- No build command required (pre-built static content)
- Build command: `echo "Static site - no build required"`

**Deployment Configuration:**
File: `render.yaml`
```yaml
services:
  - type: web
    name: portfolio-website
    runtime: static
    buildCommand: echo "Static site - no build required"
    staticPublishPath: build/
    pullRequestPreviewsEnabled: true
    headers:
      - path: /*
        name: Cache-Control
        value: public, max-age=31536000, immutable
      - path: /docs/*
        name: Cache-Control
        value: public, max-age=31536000, immutable
      - path: /images/*
        name: Cache-Control
        value: public, max-age=31536000, immutable
```

## Environment Configuration

**Required env vars:**
- None - Static site requires no environment variables

**Secrets location:**
- Not applicable - No secrets needed

## Webhooks & Callbacks

**Incoming:**
- None - No backend endpoints

**Outgoing:**
- None - No backend services to call
- External links (GitHub, LinkedIn, etc.) are standard HTML `<a>` tags

## Client-Side Interactions

**Email Clipboard Copy:**
- Function: `copyEmail()` in `build/index.html`
- Mechanism: `navigator.clipboard.writeText()` (native browser API)
- Purpose: Copy email address to user's clipboard with feedback

**Text Animation:**
- TextScramble class for dynamic job title rotation
- Phrases: ['Software', 'Web', 'Game']
- Animation: Character scrambling effect before settling on text

**Scroll Tracking:**
- Scroll-to-top button visibility based on `window.innerHeight + window.pageYOffset`
- Shows button when at bottom of page

---

*Integration audit: 2026-01-22*
