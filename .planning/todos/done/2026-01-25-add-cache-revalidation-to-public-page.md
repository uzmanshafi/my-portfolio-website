---
created: 2026-01-25T12:00
title: Add cache revalidation to public page
area: api
files:
  - src/lib/actions/contact.ts
  - src/lib/actions/social-links.ts
  - src/lib/actions/resume.ts
  - src/lib/actions/github.ts:248
---

## Problem

The milestone audit integration checker found that several server actions don't revalidate the public homepage (`/`) after mutations. Currently:

- **Bio actions** correctly call `revalidatePath("/")` 
- **Contact, Social Links, Resume, GitHub import** do NOT revalidate `/`

This means public page updates rely solely on ISR's 60-second window rather than being instant. While not broken (ISR handles it), it's inconsistent with the bio behavior and could surprise users expecting immediate updates.

## Solution

Add `revalidatePath("/")` calls to these action files after successful mutations:

1. `src/lib/actions/contact.ts` - after updateContact
2. `src/lib/actions/social-links.ts` - after create/update/delete/reorder
3. `src/lib/actions/resume.ts` - after uploadResume and deleteResume
4. `src/lib/actions/github.ts` - after importRepositoriesAsProjects (line ~248)

This ensures instant public page freshness regardless of which admin section is edited.
