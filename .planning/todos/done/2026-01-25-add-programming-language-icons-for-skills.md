---
created: 2026-01-25T12:20
title: Add programming language icons for skills
area: ui
files:
  - src/app/components/portfolio/skills-section.tsx
  - src/components/admin/skills-manager.tsx
  - src/lib/validations/skill.ts
---

## Problem

The skills section currently uses Lucide icons, which are excellent for general UI but lack coverage for programming languages, frameworks, and developer tools. When adding skills like "Python", "React", "TypeScript", or "Docker", there are no appropriate icons available.

This limits the visual appeal of the skills section and makes it harder to quickly identify technologies at a glance.

## Solution

Integrate a developer-focused icon library. Options:

1. **Simple Icons** (recommended)
   - 3000+ brand/tech icons including all major languages and tools
   - Package: `simple-icons` or `@icons-pack/react-simple-icons`
   - Consistent style, SVG-based, actively maintained
   - https://simpleicons.org

2. **Devicon**
   - Specifically designed for developer skills/technologies
   - Package: `devicon` or use via CDN
   - https://devicon.dev

3. **React Icons** (bundle multiple libraries)
   - Package: `react-icons`
   - Includes Simple Icons (`si` prefix) + many others
   - Larger bundle but more flexibility

Implementation:
1. Install chosen icon package
2. Update skill icon picker in admin to show tech icons
3. Store icon identifier (e.g., "siPython", "siReact")
4. Create icon renderer that maps identifier to component
5. Consider keeping Lucide for non-tech skills (soft skills, etc.)
