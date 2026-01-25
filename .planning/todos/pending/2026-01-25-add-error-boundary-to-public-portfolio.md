---
created: 2026-01-25T12:05
title: Add error boundary to public portfolio
area: ui
files:
  - src/app/page.tsx
  - src/app/error.tsx
---

## Problem

The milestone audit integration checker identified that the public portfolio page has no error boundary. If Prisma connection fails or data fetching throws an error, users would see Next.js default error page rather than a graceful fallback.

Current state:
- `src/app/page.tsx` fetches portfolio data via `getPortfolioData()`
- No `error.tsx` exists in `src/app/` for graceful error handling
- No `loading.tsx` for suspense fallback

While the app is stable, production environments can experience transient database issues, and a branded error state provides better UX.

## Solution

Create `src/app/error.tsx` with:
1. "use client" directive (required for error boundaries)
2. Branded error UI matching dark warm design system
3. "Try again" button that calls `reset()` prop
4. Optional: Log error to monitoring service

Consider also adding `src/app/loading.tsx` for initial page load skeleton.
