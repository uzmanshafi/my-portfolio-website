# Phase 6: Animation + Polish - Context

**Gathered:** 2026-01-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Portfolio features smooth, physics-based animations and is production-ready for deployment. This includes scroll-triggered reveals, hero entrance animations, 3D card interactions, and accessibility compliance for motion preferences. Deployment to production environment.

</domain>

<decisions>
## Implementation Decisions

### Scroll Animations
- Reveal style: Fade + slide up (elements fade in while moving up)
- Slide distance: Medium (30-50px)
- Trigger point: 50% visible in viewport
- Duration: Quick (300-400ms)
- Stagger: Cascading with tight delay (50-75ms between items)
- Replay: Once only — animate on first view, stay visible after
- Coverage: All sections get scroll reveal treatment

### Hero Entrance
- Text reveal: Word by word sequence
- Geometric shapes: Scale in from center
- Choreography: Shapes first, then text follows
- Initial delay: None — animations start immediately on page load

### Card Interactions
- 3D tilt: Subtle intensity (5-10° max rotation)
- Shine effect: Yes, subtle glare that follows cursor
- Hover state: Lift + enhanced shadow (card rises, feels clickable)
- Scope: Project cards only (bento grid), not all cards

### Motion Personality
- Overall vibe: Snappy & precise — quick, deliberate movements
- Spring physics: No overshoot — elements stop exactly at target
- Easing: Ease-out (fast start, slow end) for responsive feel
- Reduced motion: Disable all animations when prefers-reduced-motion is set

### Claude's Discretion
- Exact pixel values for shadow depths
- Specific timing offsets for hero choreography
- Implementation of shine/glare effect technique
- Production deployment configuration details

</decisions>

<specifics>
## Specific Ideas

- Animations should feel professional and intentional, not flashy
- The dark/warm aesthetic (#160f09 bg, #f3e9e2 text) should be enhanced by motion, not overshadowed
- Card tilt should add depth perception without being gimmicky

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-animation-polish*
*Context gathered: 2026-01-24*
