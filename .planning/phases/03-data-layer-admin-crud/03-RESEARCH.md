# Phase 3: Data Layer + Admin CRUD - Research

**Researched:** 2026-01-22
**Domain:** Admin Dashboard CRUD Operations, Drag-and-Drop, File Uploads, Form Handling
**Confidence:** HIGH

## Summary

This research covers the technical implementation details for building an admin dashboard with CRUD operations for portfolio content management. The phase requires drag-and-drop reordering (skills and projects), file uploads (profile images and resume PDFs), form handling with validation, and optimistic UI updates.

**Key technologies verified:**
- **dnd-kit** for drag-and-drop (react-beautiful-dnd is DEPRECATED)
- **Supabase Storage** with signed URLs for secure file uploads
- **react-easy-crop** for profile image cropping (1:1 aspect ratio)
- **react-hook-form + zod** for form validation with Server Actions
- **React 19 useOptimistic** for instant UI feedback

**Primary recommendation:** Use dnd-kit with `SortableContext` for reordering, Supabase signed URLs for file uploads (bypasses Next.js 1MB limit), and react-hook-form with zodResolver for type-safe form handling. Persist order changes immediately on drag end with optimistic updates.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@dnd-kit/core` | 6.x | Drag-and-drop foundation | Modern, lightweight, accessible. react-beautiful-dnd is archived/deprecated |
| `@dnd-kit/sortable` | 8.x+ | Sortable lists preset | Official preset for sortable use cases |
| `@dnd-kit/utilities` | 3.x | CSS transform utilities | Required for smooth drag animations |
| `@supabase/supabase-js` | 2.x | Supabase client | Official SDK for Storage operations |
| `@supabase/ssr` | 0.x | Server-side Supabase client | Required for Next.js App Router SSR |
| `react-easy-crop` | 5.x | Image cropping | Mobile-friendly, 1:1 aspect support, lightweight |
| `react-hook-form` | 7.x | Form state management | Already industry standard, minimal re-renders |
| `@hookform/resolvers` | 5.x+ | Zod integration | Bridges RHF with Zod validation |

### Already Installed (from package.json)
| Library | Version | Purpose |
|---------|---------|---------|
| `zod` | 4.x | Schema validation (server + client) |
| `sonner` | 2.x | Toast notifications |
| `lucide-react` | 0.562+ | Icons for UI |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-easy-crop | react-image-crop | react-image-crop has more GitHub stars but react-easy-crop has better mobile support and simpler API |
| dnd-kit | @hello-pangea/dnd | @hello-pangea/dnd is a fork of react-beautiful-dnd but dnd-kit is more flexible and actively maintained |
| Supabase Storage | UploadThing | UploadThing is simpler but Supabase was already decided for this project |

**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react-easy-crop @supabase/supabase-js @supabase/ssr react-hook-form @hookform/resolvers
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── actions/                    # Server Actions
│   │   ├── bio.ts                  # Bio CRUD actions
│   │   ├── skills.ts               # Skills CRUD + reorder
│   │   ├── projects.ts             # Projects CRUD + reorder
│   │   ├── resume.ts               # Resume upload actions
│   │   ├── contact.ts              # Contact + social links
│   │   └── storage.ts              # Supabase signed URL generation
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   └── server.ts               # Server client
│   └── validations/                # Zod schemas (shared client/server)
│       ├── bio.ts
│       ├── skill.ts
│       ├── project.ts
│       └── contact.ts
├── app/backstage/dashboard/
│   ├── layout.tsx                  # Dashboard layout with sidebar
│   ├── page.tsx                    # Dashboard home (overview)
│   ├── bio/
│   │   └── page.tsx                # Bio editing
│   ├── skills/
│   │   └── page.tsx                # Skills management
│   ├── projects/
│   │   └── page.tsx                # Projects management
│   ├── resume/
│   │   └── page.tsx                # Resume upload
│   └── contact/
│       └── page.tsx                # Contact + social links
├── components/
│   ├── admin/
│   │   ├── sidebar.tsx             # Dashboard sidebar navigation
│   │   ├── unsaved-changes-modal.tsx
│   │   └── image-cropper.tsx       # Profile image crop component
│   └── ui/
│       ├── sortable-item.tsx       # Reusable dnd-kit sortable item
│       └── sortable-list.tsx       # Reusable sortable container
└── hooks/
    ├── use-unsaved-changes.ts      # Unsaved changes detection
    └── use-optimistic-mutation.ts  # Wrapper for optimistic updates
```

### Pattern 1: Server Action with Zod Validation
**What:** Shared Zod schema validates on both client (react-hook-form) and server (Server Action)
**When to use:** All form submissions
**Example:**
```typescript
// src/lib/validations/bio.ts
import { z } from "zod";

export const bioSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  headline: z.string().min(1, "Headline is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export type BioFormData = z.infer<typeof bioSchema>;

// src/lib/actions/bio.ts
"use server";

import { prisma } from "@/lib/prisma";
import { bioSchema } from "@/lib/validations/bio";
import { revalidatePath } from "next/cache";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function updateBio(formData: FormData): Promise<ActionResult> {
  const rawData = {
    name: formData.get("name"),
    title: formData.get("title"),
    headline: formData.get("headline"),
    description: formData.get("description"),
  };

  const parsed = bioSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    // Upsert: create if not exists, update if exists
    await prisma.bio.upsert({
      where: { id: "singleton" }, // or use findFirst + update
      update: parsed.data,
      create: { ...parsed.data, id: "singleton" },
    });

    revalidatePath("/backstage/dashboard/bio");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to save bio" };
  }
}
```

### Pattern 2: dnd-kit Sortable List with Immediate Persist
**What:** Drag-and-drop reordering that persists to database on drop
**When to use:** Skills reordering (within category), Projects reordering (global)
**Example:**
```typescript
// Source: https://docs.dndkit.com/presets/sortable
"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useOptimistic, useTransition } from "react";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div {...listeners} className="cursor-grab">
        {/* Drag handle icon here */}
      </div>
      {children}
    </div>
  );
}

// Usage in parent component
function SkillsList({ initialSkills, updateOrder }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticSkills, setOptimisticSkills] = useOptimistic(initialSkills);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = optimisticSkills.findIndex((s) => s.id === active.id);
    const newIndex = optimisticSkills.findIndex((s) => s.id === over.id);
    const newOrder = arrayMove(optimisticSkills, oldIndex, newIndex);

    // Optimistic update
    startTransition(async () => {
      setOptimisticSkills(newOrder);
      await updateOrder(newOrder.map((s, i) => ({ id: s.id, order: i })));
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={optimisticSkills.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        {optimisticSkills.map((skill) => (
          <SortableItem key={skill.id} id={skill.id}>
            {skill.name}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

### Pattern 3: Supabase Signed URL Upload (Bypasses Next.js 1MB Limit)
**What:** Server Action generates signed URL, client uploads directly to Supabase
**When to use:** All file uploads (profile image, resume PDF)
**Example:**
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

// src/lib/actions/storage.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { auth } from "@/lib/auth";

export async function getSignedUploadUrl(
  bucket: string,
  path: string
): Promise<{ signedUrl: string; token: string } | { error: string }> {
  const session = await auth();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error) {
    return { error: error.message };
  }

  return { signedUrl: data.signedUrl, token: data.token };
}

// src/lib/supabase/client.ts (browser)
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Client-side upload using signed URL
async function uploadFile(file: File, signedUrl: string, token: string) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase.storage
    .from("images") // bucket name
    .uploadToSignedUrl(signedUrl, token, file);

  return { data, error };
}
```

### Pattern 4: Image Cropping with react-easy-crop
**What:** Square crop UI for profile images
**When to use:** Profile image upload
**Example:**
```typescript
// Source: https://github.com/ValentinH/react-easy-crop
"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropAreaChange = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
    if (blob) onCropComplete(blob);
  };

  return (
    <div className="relative h-96 w-full">
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        aspect={1} // 1:1 square
        cropShape="round" // or "rect"
        onCropChange={onCropChange}
        onZoomChange={onZoomChange}
        onCropComplete={onCropAreaChange}
      />
      <div className="mt-4 flex gap-2">
        <button onClick={onCancel}>Cancel</button>
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}

// Helper function to get cropped image as Blob
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}
```

### Pattern 5: Unsaved Changes Detection
**What:** Warn user before navigating away with unsaved form changes
**When to use:** All admin forms
**Example:**
```typescript
// src/hooks/use-unsaved-changes.ts
"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export function useUnsavedChanges(isDirty: boolean) {
  const router = useRouter();

  // Handle browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = ""; // Required for Chrome
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Note: For in-app navigation (Link, router.push), Next.js App Router
  // doesn't provide a built-in way to intercept. Options:
  // 1. Use a custom confirmation modal before navigation
  // 2. Store form state in session storage for recovery
  // 3. Use a navigation observer pattern (complex, involves patching)

  return { isDirty };
}

// Usage with react-hook-form
function BioForm() {
  const form = useForm({
    resolver: zodResolver(bioSchema),
  });

  const { isDirty } = form.formState;
  useUnsavedChanges(isDirty);

  // ...
}
```

### Anti-Patterns to Avoid
- **Direct file upload via Server Action:** Next.js limits request body to 1MB by default. Use signed URLs instead.
- **Drag without optimistic update:** Users will perceive lag. Always update UI immediately.
- **Validating only on server:** Validate on client for instant feedback, then re-validate on server for security.
- **Storing images in database:** Use Supabase Storage with URL references in database.
- **Polling for reorder confirmation:** Use optimistic updates with error rollback instead.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop | Custom mouse event handlers | dnd-kit | Accessibility, keyboard support, touch support, collision detection |
| Image cropping | Canvas manipulation from scratch | react-easy-crop | Mobile support, zoom, rotation, crop shape options |
| Form state | useState for each field | react-hook-form | Performance (uncontrolled), validation integration, dirty tracking |
| Schema validation | Manual if/else checks | Zod | Type inference, reusable schemas, composable |
| Toast notifications | Custom notification system | sonner (installed) | Positioning, stacking, auto-dismiss, accessibility |
| Signed URLs | Manual JWT signing | Supabase SDK | Security, expiration, token management |
| CSS transforms for drag | Manual translate calculations | @dnd-kit/utilities CSS helper | Browser compatibility, performance |

**Key insight:** Admin dashboards have many moving parts (drag, upload, validate, toast). Each of these has edge cases that libraries have already solved. Hand-rolling leads to accessibility gaps and inconsistent behavior.

## Common Pitfalls

### Pitfall 1: Next.js Server Action File Size Limit
**What goes wrong:** File uploads fail silently or error for files > 1MB
**Why it happens:** Next.js Server Actions have a 1MB default body size limit
**How to avoid:** Use Supabase signed URLs - generate URL in Server Action, upload directly from client to Supabase
**Warning signs:** "Request body too large" errors, large files failing while small ones work

### Pitfall 2: dnd-kit Items Array Order Mismatch
**What goes wrong:** Items jump around unexpectedly during drag
**Why it happens:** `SortableContext items` array must match render order exactly
**How to avoid:** Always pass items in the same order they are rendered: `items={skills.map(s => s.id)}`
**Warning signs:** Items visually jumping, incorrect drop positions

### Pitfall 3: Optimistic Update Without Rollback
**What goes wrong:** UI shows success but server failed, leaving inconsistent state
**Why it happens:** Optimistic update applied but server error not handled
**How to avoid:** Wrap mutation in try/catch, revert optimistic state on error, show toast
**Warning signs:** UI shows reordered items but refresh shows original order

### Pitfall 4: Zod v4 Type Errors with @hookform/resolvers
**What goes wrong:** TypeScript errors like "No overload matches this call"
**Why it happens:** Type incompatibility between Zod v4 and older resolver versions
**How to avoid:** Use `@hookform/resolvers@5.x+` which has Zod v4 support. Import from `'zod'` not `'zod/v4'`
**Warning signs:** Type errors mentioning `_zod.version.minor` incompatibility

### Pitfall 5: Supabase Storage RLS Blocking Uploads
**What goes wrong:** "new row violates row-level security policy" errors
**Why it happens:** Supabase Storage buckets are private by default with no INSERT policy
**How to avoid:** Create RLS policy: `CREATE POLICY "Allow admin uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio-assets');`
**Warning signs:** 403 errors, RLS violation messages

### Pitfall 6: useOptimistic Called Outside startTransition
**What goes wrong:** "An async function was passed to useActionState, but it was dispatched outside of an action context"
**Why it happens:** React requires optimistic updates to be wrapped in transitions
**How to avoid:** Always wrap: `startTransition(async () => { setOptimistic(newValue); await serverAction(); })`
**Warning signs:** React console errors about action context

### Pitfall 7: Missing CORS on Cropped Image
**What goes wrong:** `getCroppedImg` canvas throws security error
**Why it happens:** Image loaded from different origin without crossOrigin attribute
**How to avoid:** Set `image.crossOrigin = "anonymous"` when creating Image element
**Warning signs:** "Tainted canvas" errors, SecurityError

## Code Examples

### Complete Form with react-hook-form + Server Action + Toast
```typescript
// Source: Combined from official docs
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";
import { bioSchema, type BioFormData } from "@/lib/validations/bio";
import { updateBio } from "@/lib/actions/bio";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

export function BioForm({ initialData }: { initialData: BioFormData }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<BioFormData>({
    resolver: zodResolver(bioSchema),
    defaultValues: initialData,
    mode: "onBlur", // Validate on blur
  });

  const { isDirty } = form.formState;
  useUnsavedChanges(isDirty);

  async function onSubmit(data: BioFormData) {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const result = await updateBio(formData);

      if (result.success) {
        toast.success("Bio updated successfully");
        form.reset(data); // Reset dirty state
      } else {
        toast.error(result.error || "Failed to update bio");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("name")} />
      {form.formState.errors.name && (
        <span>{form.formState.errors.name.message}</span>
      )}

      {/* Other fields... */}

      <button type="submit" disabled={isPending || !isDirty}>
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
```

### Bulk Order Update Server Action
```typescript
// src/lib/actions/skills.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type OrderUpdate = { id: string; order: number };

export async function updateSkillsOrder(
  updates: OrderUpdate[]
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Use transaction for atomic update
    await prisma.$transaction(
      updates.map((update) =>
        prisma.skill.update({
          where: { id: update.id },
          data: { order: update.order },
        })
      )
    );

    revalidatePath("/backstage/dashboard/skills");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update order" };
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | dnd-kit | 2022 (archived) | MUST migrate - rbd is unmaintained |
| @supabase/auth-helpers | @supabase/ssr | 2024 | New projects should use @supabase/ssr |
| Zod v3 | Zod v4 | 2025 | Performance improvements, same API |
| API Routes for uploads | Server Actions + Signed URLs | 2024 | Simpler, type-safe |
| useFormState (React 18) | useActionState (React 19) | 2024 | Name change, same functionality |

**Deprecated/outdated:**
- `react-beautiful-dnd`: Archived by Atlassian. Use dnd-kit
- `@supabase/auth-helpers`: Deprecated for @supabase/ssr
- Direct FormData in large file uploads: Use signed URLs

## Open Questions

Things that couldn't be fully resolved:

1. **Next.js App Router navigation interception**
   - What we know: beforeunload works for browser close/refresh
   - What's unclear: No built-in API to intercept in-app navigation (Link, router.push)
   - Recommendation: Use confirmation modal pattern triggered by onClick handlers on navigation links, or accept limitation for v1

2. **Skills reordering across categories**
   - What we know: CONTEXT.md says skills reorder within category only
   - What's unclear: Should dragging to different category be blocked visually or allowed to trigger category change?
   - Recommendation: Block visually with dnd-kit collision detection scoped to category container

3. **Supabase auth vs existing Auth.js**
   - What we know: Project uses Auth.js for authentication, needs Supabase only for Storage
   - What's unclear: Can use Supabase Storage without Supabase Auth?
   - Recommendation: YES - use service role key in Server Actions for Storage operations, bypasses Supabase RLS entirely. More secure since uploads only happen from server.

## Sources

### Primary (HIGH confidence)
- [dnd-kit Official Documentation](https://docs.dndkit.com/presets/sortable) - Sortable preset, SortableContext, useSortable
- [React useOptimistic Reference](https://react.dev/reference/react/useOptimistic) - Official React 19 hook documentation
- [Supabase Storage createSignedUploadUrl](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl) - Official API reference
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control) - RLS policies for Storage
- [react-easy-crop GitHub](https://github.com/ValentinH/react-easy-crop) - Official README with props and usage
- [@hookform/resolvers GitHub](https://github.com/react-hook-form/resolvers) - Zod v4 support confirmation

### Secondary (MEDIUM confidence)
- [Type-Safe Form Validation in Next.js 15](https://www.abstractapi.com/guides/email-validation/type-safe-form-validation-in-next-js-15-with-zod-and-react-hook-form) - RHF + Zod + Server Actions pattern
- [Signed URL file uploads with NextJs and Supabase](https://medium.com/@olliedoesdev/signed-url-file-uploads-with-nextjs-and-supabase-74ba91b65fe0) - Signed URL pattern explanation
- [Supabase SSR Setup with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) - Server/client setup

### Tertiary (LOW confidence)
- [npm-compare: react-easy-crop vs react-image-crop](https://npm-compare.com/react-easy-crop,react-image-crop) - Download stats comparison
- [GitHub Discussion: Unsaved changes in Next.js App Router](https://github.com/vercel/next.js/discussions/50700) - Community workarounds

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official documentation
- Architecture: HIGH - Patterns verified with official examples
- Pitfalls: HIGH - Verified through GitHub issues and official docs
- Supabase integration: MEDIUM - Project doesn't currently use Supabase, need to set up from scratch

**Research date:** 2026-01-22
**Valid until:** 2026-02-22 (30 days - stable libraries)
