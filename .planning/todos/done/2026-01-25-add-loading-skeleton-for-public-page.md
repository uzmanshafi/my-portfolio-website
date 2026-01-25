---
created: 2026-01-25T12:10
title: Add loading skeleton for public page
area: ui
files:
  - src/app/loading.tsx
  - src/app/page.tsx
---

## Problem

The public portfolio page has no loading state during initial server render. While ISR caching makes this rarely visible, first-time visitors or cache misses will see a blank page until data loads.

A skeleton loading state would:
1. Provide immediate visual feedback
2. Prevent layout shift when content loads
3. Feel more polished and professional

## Solution

Create `src/app/loading.tsx` with:
1. Skeleton shapes matching portfolio sections (hero, about, skills grid, projects bento, contact)
2. Use CSS animations for subtle shimmer effect
3. Match dark warm design system colors
4. Consider using Tailwind's `animate-pulse` or custom shimmer

Structure:
- Hero skeleton: Large text placeholders, CTA button shapes
- About skeleton: Image placeholder + text lines
- Skills skeleton: Grid of small rounded rectangles
- Projects skeleton: Bento grid of card placeholders
- Contact skeleton: Email line + social icon circles
