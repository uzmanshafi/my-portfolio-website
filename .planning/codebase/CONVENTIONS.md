# Coding Conventions

**Analysis Date:** 2026-01-22

## Naming Patterns

**Files:**
- HTML files: lowercase with hyphens (e.g., `index.html`)
- CSS files: lowercase with hyphens (e.g., `style.css`, `input.css`)
- Image assets: lowercase with spaces or hyphens in descriptive names (e.g., `project banners/flappy.png`, `pfp.jpg`)
- SVG icons: descriptive names with origin suffix (e.g., `tailwindcss-original.svg`, `react-original.svg`)

**CSS Classes:**
- Tailwind utility classes: kebab-case (e.g., `text-white`, `hover:text-indigo-500`, `bg-zinc-900`)
- Custom CSS classes: kebab-case (e.g., `.navbar`, `.nav-list`, `.logo-blocks`, `.typewriter`, `.project-card`)
- CSS custom properties (CSS variables): lowercase with hyphens (e.g., `--tw-border-spacing-x`)

**IDs:**
- HTML IDs: kebab-case (e.g., `id="contact-email"`, `id="job-title"`, `id="scrollToTopBtn"`)
- Semantic section IDs: kebab-case matching section names (e.g., `id="home"`, `id="about"`, `id="skills"`, `id="projects"`, `id="contact"`)

**JavaScript Functions:**
- camelCase for function names (e.g., `copyEmail()`, `checkScrollPosition()`, `setText()`, `randomChar()`, `nextPhrase()`)
- Class names: PascalCase (e.g., `TextScramble`)

**JavaScript Variables:**
- camelCase for local variables and properties (e.g., `scrollBtn`, `scrollPosition`, `newText`, `oldText`, `frameRequest`)
- UPPERCASE for constants (e.g., `'!@#$%^&*()-_=+[]{};:,.<>?'` assigned to character set)

## Code Style

**Formatting:**
- No explicit linter or formatter detected
- Indentation: 2 spaces (observed in HTML)
- Line length: No enforced limit, but HTML/CSS maintained under 200 characters per line in most cases

**HTML Formatting:**
- Semantic HTML5 structure with sections using ID anchors for navigation
- Self-closing tags properly closed (e.g., `<meta ... />`, `<img ... />`)
- Attributes alphabetically ordered in some cases (e.g., `xmlns`, `width`, `height`, `viewBox` on SVG elements)
- Class attribute values first, then other attributes (common pattern but not strict)

**CSS Formatting:**
- Selectors on single line followed by braces
- Properties in alphabetical order within declarations (observed in custom styles)
- Comments above rule sets explaining purpose
- Vendor prefixes included where needed (e.g., `-webkit-backdrop-filter`, `-moz-tab-size`)

**JavaScript Formatting:**
- Semicolons used consistently
- Template literals not used; string concatenation with quotes
- `const`/`let` keywords used (not `var`)
- Method chaining patterns used (e.g., `.then().then()`)

## Import Organization

**CSS:**
- `@tailwind` directives at top (base, components, utilities)
- Google Fonts imports after Tailwind
- Custom CSS rules organized by component/feature below imports

**HTML:**
- Meta tags in `<head>` first
- External CSS links (Tailwind, Google Fonts, Animate.css)
- JavaScript `<script>` tags at end of `<body>` before closing tag
- External library scripts before custom inline scripts

## Error Handling

**JavaScript:**
- Alert-based error feedback (e.g., `alert('Failed to copy email.')`)
- Promise-based error handling with fallback `.catch()` patterns
- No try-catch blocks observed in current code

**CSS:**
- Graceful fallbacks for backdrop-filter (both webkit and standard)
- Fallback font stacks (e.g., `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji"`)

## Comments

**When to Comment:**
- Above CSS rule sets to explain non-obvious styles (e.g., `/* Typewriter effect */`, `/* Bounce animation */`)
- HTML: Comment sections describe major layout components (e.g., `<!-- Navbar -->`, `<!-- Fixed background -->`, `<!-- Floating arrow -->`)
- JavaScript: Minimal comments; code is self-documenting in most cases
- Comments mark feature boundaries in scripts (e.g., `<!-- Added scroll-to-top visibility script start -->`)

**Format:**
- CSS: `/* Style purpose */` above related rules
- HTML: `<!-- Feature name -->` on separate line before element
- No JSDoc or TSDoc style comments observed

## Function Design

**Size:**
- Small, focused functions (10-30 lines max)
- Examples: `copyEmail()` is 7 lines, `checkScrollPosition()` is 6 lines, `randomChar()` is 2 lines

**Parameters:**
- Constructor-based classes accept DOM element reference (e.g., `constructor(el)`)
- Methods use `this` binding for state (e.g., `this.update = this.update.bind(this)`)
- No complex parameter validation observed

**Return Values:**
- Functions return promises where appropriate (e.g., `setText()` returns Promise)
- Void functions used for side effects (e.g., `copyEmail()`, `nextPhrase()`)
- Constructor returns implicit `this`

**This Binding:**
- Explicit binding in constructor (e.g., `this.update = this.update.bind(this)`)
- Arrow functions not used (would auto-bind `this`)

## Module Design

**Exports:**
- No module exports observed (static website, no build process)
- Inline script tags in HTML directly define and execute code
- Class definitions available globally (e.g., `TextScramble` accessed as window property)

**Scope:**
- Classes defined in inline `<script>` tags become global
- Event listeners attached inline (`window.addEventListener('scroll', ...)`)
- DOM access via `document.getElementById()` for element references

## Animations & Transitions

**Tailwind Animations:**
- `animate__` prefixed classes from Animate.css library (e.g., `animate__animated`, `animate__fadeInDown`, `animate__bounceIn`)
- Built-in Tailwind animations used (e.g., `animate-bounce`)

**CSS Animations:**
- Keyframe animations named descriptively (e.g., `@keyframes typing`, `@keyframes blink-caret`, `@keyframes pulse`, `@keyframes bounce`)
- Duration and timing specified inline (e.g., `animation: typing 3.5s steps(40, end)`)

## DOM Manipulation Patterns

**Query Selection:**
- `document.getElementById()` for ID-based element access (most common)
- No query selectors or classname searches observed
- Direct manipulation of `classList` (e.g., `.classList.add()`, `.classList.remove()`)

**Content Updates:**
- `innerText` for text content (e.g., `this.el.innerText`)
- `innerHTML` for HTML content (e.g., `this.el.innerHTML = output`)
- `value` property for form inputs (e.g., `document.getElementById('contact-email').value`)

## Accessibility Patterns

**Alt Text:**
- Images include descriptive alt attributes (e.g., `alt="my profile picture"`)

**Links:**
- External links include `target="_blank"` with `rel="noopener noreferrer"`
- Navigation uses semantic `<nav>` and `<ul>/<li>` structure

**Semantic HTML:**
- Proper heading hierarchy (`h1`, `h2`, `h3`)
- Section elements with ID anchors for page navigation
- Form elements properly structured

---

*Convention analysis: 2026-01-22*
