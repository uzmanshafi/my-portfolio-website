# Architecture

**Analysis Date:** 2026-01-22

## Pattern Overview

**Overall:** Static Single-Page Website (HTML/CSS/JavaScript)

**Key Characteristics:**
- Single monolithic HTML file serving as entry point
- Tailwind CSS utility-first styling framework
- Inline vanilla JavaScript for interactivity
- Server-side static hosting with no backend processing
- Git-based content deployment via Render platform

## Layers

**Presentation Layer:**
- Purpose: Render UI and handle visual interactions
- Location: `build/index.html`
- Contains: Semantic HTML markup, Tailwind utility classes, inline CSS animations
- Depends on: CSS framework (Tailwind), Google Fonts, Animate.css CDN, SVG icons
- Used by: Browser DOM, JavaScript controllers

**Styling Layer:**
- Purpose: Define visual appearance, animations, and responsive design
- Location: `src/input.css`, `build/css/style.css`
- Contains: Custom CSS rules, keyframe animations, Tailwind directives, media queries
- Depends on: Tailwind CSS, Google Fonts API
- Used by: HTML markup via class bindings

**JavaScript Interaction Layer:**
- Purpose: Handle dynamic behavior and user interactions
- Location: Inline `<script>` blocks at end of `build/index.html` (lines 1520+)
- Contains: Email copy functionality, scroll-to-top button visibility, text scramble animation
- Depends on: DOM API, browser clipboard API, requestAnimationFrame
- Used by: HTML elements via onclick handlers and event listeners

**Build Configuration Layer:**
- Purpose: Manage CSS generation and deployment settings
- Location: `tailwind.config.js`, `render.yaml`
- Contains: Tailwind content paths, static site configuration, caching headers
- Depends on: Tailwind CLI, Render platform API
- Used by: Build process and hosting infrastructure

## Data Flow

**Page Load Sequence:**

1. Browser requests `build/index.html` from Render static server
2. HTML loads with inline CSS and Tailwind-compiled styles from `build/css/style.css`
3. External resources load: Google Fonts, Animate.css CDN, SVG icon files
4. DOM fully rendered with Tailwind utility classes applied
5. JavaScript executes inline scripts:
   - TextScramble initializes job title animation
   - Scroll event listener attached for scroll-to-top button
6. User interactions trigger JavaScript handlers (copyEmail, scroll events)

**State Management:**

- No centralized state management (no Redux, Vuex, etc.)
- Component state exists in DOM itself (visible/hidden classes, innerHTML mutations)
- TextScramble class maintains local animation state in `this.queue`, `this.frame`, `this.frameRequest`
- Email input state stored in DOM element with id `contact-email`
- Scroll position tracked implicitly via window scroll events

## Key Abstractions

**TextScramble Class:**
- Purpose: Animate text transitions with character-by-character scramble effect
- Location: `build/index.html` lines 1545-1600
- Pattern: Vanilla JavaScript ES6 class with animation frame loop
- Usage: Applied to job title element to cycle between "Software", "Web", "Game"
- Implementation: RequestAnimationFrame for smooth 60fps animation, random character substitution during transition

**Section Navigation:**
- Purpose: Organize content into logical viewport-height sections with anchor linking
- Pattern: HTML section elements with id attributes (home, about, skills, projects, contact)
- Location: `build/index.html` throughout document body
- Smooth scroll behavior defined in `src/input.css` line 8-10

**Responsive Grid System:**
- Purpose: Adapt layout across mobile, tablet, desktop viewports
- Pattern: Tailwind responsive prefixes (sm:, md:, lg:) on utility classes
- Example: `text-2xl sm:text-3xl md:text-4xl` scales typography across breakpoints
- Location: Distributed throughout `build/index.html`

**Animation System:**
- Purpose: Create visual feedback and engagement effects
- Patterns:
  - CSS keyframe animations (typing, blink-caret, bounce, pulse)
  - Animate.css CDN for ready-made effects (fadeInDown, bounceIn)
  - Custom Tailwind animation classes (animate-bounce, animate__animated)
- Location: `src/input.css` lines 86-171 and inline in HTML

## Entry Points

**Primary Entry:**
- Location: `build/index.html`
- Triggers: HTTP request to domain root or /index.html
- Responsibilities:
  - Serve complete page structure
  - Load all CSS and external resources
  - Initialize JavaScript functionality
  - Render navbar, sections (home, about, skills, projects, contact), footer

**Build Entry:**
- Location: `render.yaml`, `package.json` (implicitly)
- Triggers: Git push to main branch detected by Render
- Responsibilities:
  - Run Tailwind CSS compilation (via npm scripts or Render hook)
  - Generate `build/css/style.css` from `src/input.css`
  - Deploy static files to CDN
  - Apply cache headers for assets

## Error Handling

**Strategy:** Graceful degradation with user-facing feedback

**Patterns:**

- **Email Copy Failure:** `copyEmail()` function (lines 1521-1528) uses try-catch via Promise rejection handler with alert() fallback
- **Missing Assets:** Critical paths (Google Fonts, Animate.css) via CDN with fallback system fonts in CSS
- **JavaScript Disabled:** Page remains functional with reduced interactivity; core content always readable
- **Animation Performance:** requestAnimationFrame with frame skipping prevents browser blocking

## Cross-Cutting Concerns

**Logging:**
- No centralized logging framework
- Browser console available for debugging
- Alert dialogs used for user feedback (email copy confirmation)

**Validation:**
- No input validation layer (contact form uses native HTML input)
- Email input has type="email" for browser-level validation

**Authentication:**
- Not applicable (public portfolio site)
- Resume download via direct link to PDF file
- Social links (GitHub, LinkedIn) open in new tabs

**Performance Optimization:**
- Static site with zero runtime computation
- Render caching headers configured for assets (max-age=31536000 for /images/*, /docs/*)
- Tailwind CSS tree-shaking removes unused styles in production build

---

*Architecture analysis: 2026-01-22*
