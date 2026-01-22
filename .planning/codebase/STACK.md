# Technology Stack

**Analysis Date:** 2026-01-22

## Languages

**Primary:**
- HTML5 - Markup for the portfolio website
- CSS3 - Styling and custom animations
- JavaScript (ES6+) - Client-side interactivity

**Not Used:**
- No TypeScript
- No backend languages (static site)

## Runtime

**Environment:**
- Node.js v24.13.0 (development only)

**Package Manager:**
- npm (with lockfile present at `package-lock.json`)

## Frameworks

**Core:**
- Tailwind CSS 3.4.17 - Utility-first CSS framework for responsive design

**Utilities:**
- Animate.css 4.1.1 - Pre-built animation library (via CDN)
- Google Fonts (Roboto) - Typography via CDN

**Build/Dev:**
- None detected (static HTML generation)

## Key Dependencies

**Critical:**
- tailwindcss 3.4.17 - Required for styling the site, configured in `tailwind.config.js`

**Infrastructure:**
- No backend framework
- No database driver
- No API client libraries

## Configuration

**Environment:**
- Static site deployment only
- No environment variables required
- No secrets management needed

**Build:**
- Tailwind CSS configuration: `tailwind.config.js`
  - Processes HTML in `./build/*.html`
  - Extends default theme with no custom theme modifications
  - No plugins enabled
- CSS source: `src/input.css`
- CSS output: `build/css/style.css`

**Package Configuration:**
- Minimal `package.json` at project root
- Contains only devDependencies (tailwindcss)
- No scripts defined for build automation

## Platform Requirements

**Development:**
- Node.js v24.13.0 or compatible
- npm for dependency management
- Text editor/IDE for HTML, CSS editing
- Optional: Tailwind CSS CLI for watching/building

**Production:**
- Static file hosting (HTTP/HTTPS server)
- Deployed to Render.com using static runtime
- No server runtime required
- Build path: `/build/` directory (pre-built)

---

*Stack analysis: 2026-01-22*
