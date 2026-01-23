# Phase 5: Public Portfolio - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Display all portfolio content (bio, skills, projects, contact, resume) to public visitors with sophisticated visual design, responsive layout, and the established dark warm color palette. Server-rendered with ISR caching.

</domain>

<decisions>
## Implementation Decisions

### Page structure
- Single scrolling page with all sections
- Side dots/indicators for navigation (clickable, show current section)
- Hide navigation dots on mobile - users scroll naturally
- Section order: Hero → About → Skills → Projects → Contact
- Moderate spacing between sections (clear separation, content flows continuously)
- No separate footer - Contact section is the ending
- Resume download link appears in both hero and contact sections

### Hero section
- Abstract/artistic visual focus with geometric shapes (floating circles, lines, grids - modern tech aesthetic)
- Text content: Name + role + tagline format
- Two CTAs: "View Projects" + "Download Resume"
- Geometric shapes should work with the warm dark palette

### Projects bento grid
- Mixed/asymmetric grid layout (true bento style with varying column spans)
- Featured projects distinguished by different styling (accent border or glow effect), not larger size
- Default card shows: image + title + tech tags
- On hover: just action links appear (Live Demo, GitHub)
- Don't show stars/forks on public portfolio - keep it clean

### Visual polish
- Strong glassmorphism effect on cards (obvious frosted glass look)
- Grain texture applied to cards only (part of the glass effect)
- Subtle gradient lines between sections (soft horizontal gradients that fade at edges)
- Accent color (#6655b8 purple) used sparingly - only for important CTAs or featured items

### Claude's Discretion
- Exact geometric shape placement and animation in hero
- Typography scale and font weights
- Responsive breakpoints and mobile adaptations
- Skills section layout (grouped by category with Lucide icons per roadmap)
- Contact section layout (copyable email, social links)
- ISR revalidation timing

</decisions>

<specifics>
## Specific Ideas

- Bento grid should feel asymmetric and visually interesting, not a rigid uniform grid
- Geometric shapes in hero evoke "modern tech aesthetic" - think floating elements creating depth
- Glass cards should be bold/obvious, not subtle
- Purple accent is precious - reserve for special moments (featured projects, primary CTA)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-public-portfolio*
*Context gathered: 2026-01-23*
