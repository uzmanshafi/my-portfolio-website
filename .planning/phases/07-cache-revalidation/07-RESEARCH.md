# Phase 7: Cache Revalidation - Research

**Researched:** 2026-01-25
**Domain:** Next.js ISR, On-Demand Revalidation, Toast Notifications
**Confidence:** HIGH

## Summary

This phase addresses a straightforward gap: several server actions that modify content displayed on the public portfolio are not calling `revalidatePath("/")`, causing a delay of up to 60 seconds (the ISR interval) before changes appear publicly.

The fix is mechanical: add `revalidatePath("/")` to all mutation actions after successful database operations, and update toast messages to confirm that "Content is now live" rather than just "saved."

**Primary recommendation:** Add `revalidatePath("/")` immediately after each successful mutation, before returning the success response. Update toast feedback to indicate public visibility.

## Standard Stack

### Core (Already in Use)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.5.9 | Framework with revalidatePath | Built-in cache invalidation |
| sonner | ^2.0.7 | Toast notifications | Already configured in root layout |

No additional libraries needed. All required tooling is already in place.

## Architecture Patterns

### Current Pattern (bio.ts - Correct Implementation)
```typescript
// src/lib/actions/bio.ts - Lines 83-85
// After successful mutation:
revalidatePath("/backstage/dashboard/bio");
revalidatePath("/"); // Public homepage
```

**This is the pattern to replicate** - all actions should:
1. Revalidate the admin dashboard path (for immediate admin UI refresh)
2. Revalidate `"/"` (to invalidate the public page cache)

### Pattern for Server Actions

```typescript
// After successful database mutation:
try {
  await prisma.someModel.update({ ... });

  revalidatePath("/backstage/dashboard/[section]");  // Admin sees change
  revalidatePath("/");                                // Public sees change

  return success(data);
} catch (error) {
  return failure("Error message");
}
```

### Key Insight: `revalidatePath("/")` vs `revalidatePath("/", "layout")`

From Next.js documentation:
- `revalidatePath("/")` - Invalidates the specific `/` page
- `revalidatePath("/", "layout")` - Invalidates the root layout and ALL nested routes

For this portfolio site with a single public page at `/`, using `revalidatePath("/")` is sufficient and more performant.

### Anti-Patterns to Avoid

- **Adding revalidation before mutation completes:** Always call after the database operation succeeds
- **Calling revalidatePath in catch blocks:** Only revalidate on success; failed mutations shouldn't invalidate cache
- **Using `revalidatePath("/", "layout")` unnecessarily:** Overkill for a single-page portfolio

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cache invalidation | Custom cache timestamps | `revalidatePath` | Next.js handles full cache lifecycle |
| Toast notifications | Custom toast state management | `sonner` | Already configured, battle-tested |
| Success feedback | Custom modal/overlay | `toast.success()` | Consistent UX, already styled |

## Files Requiring Changes

### Actions Missing `revalidatePath("/")`

Based on current codebase analysis:

| File | Function | Currently Revalidates | Needs `/` Added |
|------|----------|----------------------|-----------------|
| `contact.ts` | `updateContact` | **None** | YES |
| `social-links.ts` | `createSocialLink` | **None** | YES |
| `social-links.ts` | `updateSocialLink` | **None** | YES |
| `social-links.ts` | `deleteSocialLink` | **None** | YES |
| `social-links.ts` | `updateSocialLinksOrder` | **None** | YES |
| `resume.ts` | `uploadResume` | `/backstage/dashboard/resume` | YES |
| `resume.ts` | `deleteResume` | `/backstage/dashboard/resume` | YES |
| `skills.ts` | `createSkill` | `/backstage/dashboard/skills` | YES |
| `skills.ts` | `updateSkill` | `/backstage/dashboard/skills` | YES |
| `skills.ts` | `deleteSkill` | `/backstage/dashboard/skills` | YES |
| `skills.ts` | `updateSkillsOrder` | `/backstage/dashboard/skills` | YES |
| `skills.ts` | `updateCategoryOrder` | `/backstage/dashboard/skills` | YES |
| `projects.ts` | `createProject` | `/backstage/dashboard/projects` | YES |
| `projects.ts` | `updateProject` | `/backstage/dashboard/projects` | YES |
| `projects.ts` | `deleteProject` | `/backstage/dashboard/projects` | YES |
| `projects.ts` | `updateProjectsOrder` | `/backstage/dashboard/projects` | YES |
| `projects.ts` | `toggleProjectVisibility` | `/backstage/dashboard/projects` | YES |
| `projects.ts` | `updateProjectImage` | `/backstage/dashboard/projects` | YES |
| `github.ts` | `importRepositoriesAsProjects` | Dashboard paths only | YES |
| `github.ts` | `resetProjectFieldToGitHub` | Dashboard paths only | YES |

### Actions Already Correct

| File | Function | Status |
|------|----------|--------|
| `bio.ts` | `updateBio` | Already revalidates `/` |
| `bio.ts` | `updateProfileImage` | Already revalidates `/` |

### Read-Only Actions (No Change Needed)

These don't modify content, so no revalidation needed:
- `getContact`, `getSocialLinks`, `getActiveResume`
- `getSkills`, `getAllSkills`, `getProjects`
- `getRepositories`, `getLanguages`, `getImportedRepoIds`
- `getGitHubConnection`, `getGitHubAccessToken`
- `syncGitHubProjects` (background job, not admin UI action)

## Toast Feedback Pattern

### Current Pattern (bio-form.tsx)
```typescript
// src/app/backstage/dashboard/bio/bio-form.tsx - Lines 73-79
if (result.success) {
  toast.success("Bio saved successfully");
  reset(data);
} else {
  toast.error(result.error || "Failed to save bio");
}
```

### Improved Pattern (Requirement CACH-03)
```typescript
if (result.success) {
  toast.success("Changes saved - content is now live");
  reset(data);
} else {
  toast.error(result.error || "Failed to save");
}
```

**Message guidelines:**
- Include "now live" or "visible on site" to confirm public visibility
- Keep message concise (under 50 characters)
- Match existing success/error pattern

### Files Needing Toast Message Updates

| File | Current Message | Suggested Update |
|------|-----------------|------------------|
| `bio-form.tsx` | "Bio saved successfully" | "Bio saved - now live on your site" |
| `contact-manager.tsx` | "Contact information saved" | "Contact updated - now live" |
| `contact-manager.tsx` | "Social link added" | "Social link added - now live" |
| `contact-manager.tsx` | "Social link updated" | "Social link updated - now live" |
| `contact-manager.tsx` | "Social link deleted" | "Social link removed from site" |
| `resume-manager.tsx` | "Resume uploaded successfully" | "Resume uploaded - now available for download" |
| `resume-manager.tsx` | "Resume deleted" | "Resume removed from site" |
| `skills-manager.tsx` | (check current messages) | Add "now live" suffix |
| `projects-manager.tsx` | (check current messages) | Add "now live" suffix |

## Common Pitfalls

### Pitfall 1: Not Importing revalidatePath
**What goes wrong:** Action file doesn't import the function
**Why it happens:** Copy-paste without checking imports
**How to avoid:** Verify import at top of file: `import { revalidatePath } from "next/cache";`
**Warning signs:** TypeScript error about undefined function

### Pitfall 2: Calling revalidatePath After Return
**What goes wrong:** Code after return statement never executes
**Why it happens:** Revalidation added after existing return
**How to avoid:** Always add revalidation BEFORE the return statement
**Warning signs:** Cache not invalidating despite code being present

### Pitfall 3: Revalidating on Error
**What goes wrong:** Cache invalidated even when mutation failed
**Why it happens:** Revalidation placed outside try/catch success path
**How to avoid:** Only revalidate within the success path, before `return success()`
**Warning signs:** Cache cleared but data didn't actually change

### Pitfall 4: Toast Shown Before Server Action Completes
**What goes wrong:** Toast shows "success" but action hasn't finished
**Why it happens:** Not awaiting the server action
**How to avoid:** Always `await` server action before showing toast
**Warning signs:** Toast appears, then error state shows

### Pitfall 5: resume-manager.tsx Uses Custom Toast
**What goes wrong:** Inconsistent toast implementation
**Why it happens:** Component was written before sonner was integrated
**How to avoid:** Migrate to sonner for consistency
**Current state:** `resume-manager.tsx` has a custom toast implementation (lines 22-32)

## Code Examples

### Adding revalidatePath to contact.ts
```typescript
// src/lib/actions/contact.ts
import { revalidatePath } from "next/cache";  // Add this import

export async function updateContact(formData: FormData): Promise<ActionResult<Contact>> {
  // ... existing validation and auth code ...

  try {
    // ... existing database operation ...

    // Add these lines before return:
    revalidatePath("/backstage/dashboard/contact");
    revalidatePath("/");  // Invalidate public page

    return success(contact);
  } catch (error) {
    // ... existing error handling ...
  }
}
```

### Adding revalidatePath to social-links.ts
```typescript
// Pattern for each mutation function
export async function createSocialLink(formData: FormData): Promise<ActionResult<SocialLink>> {
  // ... existing code ...

  try {
    // ... existing database operation ...

    // Add before return:
    revalidatePath("/backstage/dashboard/contact");
    revalidatePath("/");

    return success(socialLink);
  } catch (error) {
    // ...
  }
}
```

### Updating Toast Messages in contact-manager.tsx
```typescript
// Before
toast.success("Contact information saved");

// After
toast.success("Contact updated - now live");
```

### Migrating resume-manager.tsx to sonner
```typescript
// Add import at top:
import { toast } from "sonner";

// Remove local toast state and showToast function

// Replace showToast calls:
// showToast("Resume uploaded successfully", "success");
toast.success("Resume uploaded - now available for download");

// showToast("Failed to upload file", "error");
toast.error("Failed to upload file");
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ISR only | ISR + on-demand revalidation | Next.js 13+ | Real-time updates possible |
| Manual cache headers | `revalidatePath()` / `revalidateTag()` | Next.js 13 App Router | Simpler, more reliable |
| Client-side refetching | Server action revalidation | Next.js 14+ | Automatic UI updates |

**The portfolio already uses ISR (`revalidate = 60`).** Adding `revalidatePath("/")` to mutations means:
- Normal visitors: Page regenerates every 60 seconds at most
- After admin saves: Page regenerates immediately on next request

## Open Questions

1. **resume-manager.tsx custom toast migration**
   - What we know: It implements custom toast state (lines 22-32) instead of using sonner
   - What's unclear: Whether this is intentional or just predates sonner integration
   - Recommendation: Migrate to sonner for consistency; simpler code, consistent styling

## Sources

### Primary (HIGH confidence)
- Next.js official docs: https://nextjs.org/docs/app/api-reference/functions/revalidatePath
- Sonner official docs: https://sonner.emilkowal.ski/

### Codebase Analysis (HIGH confidence)
- All server action files in `src/lib/actions/`
- Toast usage patterns in dashboard components
- Current `revalidatePath` usage in `bio.ts`

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Already using Next.js 15 and sonner
- Architecture: HIGH - Pattern established in bio.ts, just needs replication
- Pitfalls: HIGH - Based on direct code analysis

**Research date:** 2026-01-25
**Valid until:** No expiration - patterns are stable in Next.js 15
