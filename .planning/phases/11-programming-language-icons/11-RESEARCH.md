# Phase 11: Programming Language Icons - Research

**Researched:** 2026-01-27
**Domain:** React icon libraries, icon picker UX, fuzzy search
**Confidence:** HIGH

## Summary

This phase replaces generic Lucide icons with recognizable tech logos (Python, React, TypeScript, etc.) using the devicons-react library. The implementation requires: (1) integrating devicons-react for tech icons while keeping Lucide for UI elements, (2) building a modal icon picker with search, category filters, and keyboard navigation, (3) implementing fuzzy matching to auto-suggest icons based on skill names, and (4) adding localStorage persistence for recently used icons.

The devicons-react library provides 400+ icons covering languages, frameworks, databases, cloud services, and tools. Icons come in three variants: Original (colored), Plain (monochrome, color customizable), and Line (outline, color customizable). For design system cohesion, use Plain or Line variants with `color="currentColor"` to inherit text color.

**Primary recommendation:** Use devicons-react Plain/Line variants with currentColor for monochrome display. Build a static icon registry mapping icon names to components and categories. Use native string matching for fuzzy search (no external library needed for ~400 icons).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| devicons-react | latest | Tech-specific icons (Python, React, etc.) | Already specified in PROJECT.md, 400+ dev icons, React components |
| lucide-react | ^0.562.0 | UI icons and category fallbacks | Already installed, used throughout project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None needed | - | Fuzzy search | Simple includes/startsWith sufficient for ~400 icons |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| devicons-react | react-icons (devicons set) | react-icons bundles multiple icon sets, larger overhead |
| devicons-react | @devicon/react | Less mature, fewer downloads |
| fuse.js for search | Native string methods | Fuse.js overkill for 400 items, adds 25kb |

**Installation:**
```bash
npm install devicons-react
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── icons/
│       ├── devicon-registry.ts    # Static mapping of icon names to components/metadata
│       ├── icon-categories.ts     # Category definitions and Lucide fallbacks
│       └── icon-matcher.ts        # Fuzzy matching logic for auto-suggest
├── components/
│   ├── admin/
│   │   └── icon-picker/
│   │       ├── icon-picker-modal.tsx   # Main modal with search + grid
│   │       ├── icon-grid.tsx           # Grid display with keyboard nav
│   │       ├── icon-search.tsx         # Search input component
│       │   └── recent-icons.tsx        # Recently used icons section
│   └── ui/
│       └── tech-icon.tsx           # Unified component rendering devicon or Lucide fallback
└── hooks/
    └── use-recent-icons.ts         # localStorage hook for recent icons
```

### Pattern 1: Static Icon Registry
**What:** Pre-define all available devicons in a TypeScript registry with metadata (name, category, searchTerms)
**When to use:** Always - enables type safety, searchability, and category filtering without runtime fetching
**Example:**
```typescript
// lib/icons/devicon-registry.ts
import type { ComponentType, SVGProps } from "react";

// Import icons individually to enable tree-shaking
import ReactOriginal from "devicons-react/icons/ReactOriginal";
import ReactPlain from "devicons-react/icons/ReactPlain";
import PythonOriginal from "devicons-react/icons/PythonOriginal";
import PythonPlain from "devicons-react/icons/PythonPlain";
// ... more imports

export type IconCategory = "languages" | "frameworks" | "databases" | "cloud" | "devops" | "tools";

export interface DeviconEntry {
  name: string;                                    // Display name: "React"
  id: string;                                      // Unique ID: "react"
  component: ComponentType<SVGProps<SVGSVGElement>>; // The icon component (Plain variant)
  category: IconCategory;
  aliases: string[];                               // For fuzzy matching: ["reactjs", "react.js"]
}

export const DEVICON_REGISTRY: DeviconEntry[] = [
  {
    name: "React",
    id: "react",
    component: ReactPlain,
    category: "frameworks",
    aliases: ["reactjs", "react.js", "react js"],
  },
  {
    name: "Python",
    id: "python",
    component: PythonPlain,
    category: "languages",
    aliases: ["python3", "py"],
  },
  // ... ~150+ entries
];

// Map for O(1) lookup by id
export const DEVICON_MAP = new Map(
  DEVICON_REGISTRY.map(icon => [icon.id, icon])
);
```

### Pattern 2: Unified TechIcon Component
**What:** Single component that renders either a devicon or Lucide fallback based on icon type
**When to use:** In both admin and public portfolio to display skill icons consistently
**Example:**
```typescript
// components/ui/tech-icon.tsx
"use client";

import { DEVICON_MAP, type DeviconEntry } from "@/lib/icons/devicon-registry";
import { CATEGORY_FALLBACKS } from "@/lib/icons/icon-categories";
import type { SkillCategory } from "@/lib/validations/skill";

interface TechIconProps {
  iconId: string | null;        // devicon ID or null
  skillCategory: SkillCategory; // For fallback selection
  size?: number;
  className?: string;
}

export function TechIcon({ iconId, skillCategory, size = 20, className }: TechIconProps) {
  // Try to get devicon
  const devicon = iconId ? DEVICON_MAP.get(iconId) : null;

  if (devicon) {
    const IconComponent = devicon.component;
    return (
      <IconComponent
        color="currentColor"
        style={{ width: size, height: size }}
        className={className}
      />
    );
  }

  // Fallback to Lucide category icon
  const FallbackIcon = CATEGORY_FALLBACKS[skillCategory];
  return <FallbackIcon size={size} className={className} />;
}
```

### Pattern 3: Icon Picker Modal with Keyboard Navigation
**What:** Modal overlay with search, category tabs, and arrow key grid navigation
**When to use:** Admin skill form for selecting tech icons
**Example:**
```typescript
// components/admin/icon-picker/icon-picker-modal.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Search } from "lucide-react";
import { DEVICON_REGISTRY, type IconCategory } from "@/lib/icons/devicon-registry";
import { useRecentIcons } from "@/hooks/use-recent-icons";

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconId: string | null) => void;
  currentIconId: string | null;
}

const CATEGORIES: { value: IconCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "languages", label: "Languages" },
  { value: "frameworks", label: "Frameworks" },
  { value: "databases", label: "Databases" },
  { value: "cloud", label: "Cloud" },
  { value: "devops", label: "DevOps" },
  { value: "tools", label: "Tools" },
];

export function IconPickerModal({ isOpen, onClose, onSelect, currentIconId }: IconPickerModalProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<IconCategory | "all">("all");
  const [focusIndex, setFocusIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const { recentIcons, addRecentIcon } = useRecentIcons();

  // Filter icons based on search and category
  const filteredIcons = DEVICON_REGISTRY.filter(icon => {
    const matchesCategory = category === "all" || icon.category === category;
    const searchLower = search.toLowerCase();
    const matchesSearch = !search ||
      icon.name.toLowerCase().includes(searchLower) ||
      icon.id.includes(searchLower) ||
      icon.aliases.some(alias => alias.includes(searchLower));
    return matchesCategory && matchesSearch;
  });

  // Grid columns (responsive)
  const columns = 6; // Adjust based on modal width

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "Escape":
        onClose();
        break;
      case "ArrowRight":
        e.preventDefault();
        setFocusIndex(i => Math.min(i + 1, filteredIcons.length - 1));
        break;
      case "ArrowLeft":
        e.preventDefault();
        setFocusIndex(i => Math.max(i - 1, 0));
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusIndex(i => Math.min(i + columns, filteredIcons.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIndex(i => Math.max(i - columns, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredIcons[focusIndex]) {
          handleSelect(filteredIcons[focusIndex].id);
        }
        break;
    }
  }, [isOpen, filteredIcons, focusIndex, columns, onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset focus when filter changes
  useEffect(() => {
    setFocusIndex(0);
  }, [search, category]);

  const handleSelect = (iconId: string | null) => {
    if (iconId) addRecentIcon(iconId);
    onSelect(iconId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* ... modal structure with search, category tabs, grid */}
    </div>
  );
}
```

### Pattern 4: localStorage Hook for Recent Icons
**What:** Custom hook persisting last 5-10 selected icons in localStorage
**When to use:** Icon picker to show recently used icons at top
**Example:**
```typescript
// hooks/use-recent-icons.ts
"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "portfolio-recent-icons";
const MAX_RECENT = 8;

export function useRecentIcons() {
  const [recentIcons, setRecentIcons] = useState<string[]>([]);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentIcons(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const addRecentIcon = useCallback((iconId: string) => {
    setRecentIcons(current => {
      // Remove if already exists, add to front, limit size
      const filtered = current.filter(id => id !== iconId);
      const updated = [iconId, ...filtered].slice(0, MAX_RECENT);

      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }

      return updated;
    });
  }, []);

  return { recentIcons, addRecentIcon };
}
```

### Pattern 5: Fuzzy Matching for Auto-Suggest
**What:** Match skill name to devicon using aliases and simple string matching
**When to use:** When admin creates/edits a skill, auto-suggest matching icon
**Example:**
```typescript
// lib/icons/icon-matcher.ts
import { DEVICON_REGISTRY, type DeviconEntry } from "./devicon-registry";

/**
 * Find best matching devicon for a skill name.
 * Returns null if no good match found.
 */
export function findMatchingIcon(skillName: string): DeviconEntry | null {
  const normalized = skillName.toLowerCase().trim();

  // Exact match on name or id
  const exactMatch = DEVICON_REGISTRY.find(
    icon => icon.name.toLowerCase() === normalized || icon.id === normalized
  );
  if (exactMatch) return exactMatch;

  // Alias match
  const aliasMatch = DEVICON_REGISTRY.find(
    icon => icon.aliases.some(alias => alias === normalized)
  );
  if (aliasMatch) return aliasMatch;

  // Partial match (name contains search or search contains name)
  const partialMatch = DEVICON_REGISTRY.find(
    icon =>
      icon.name.toLowerCase().includes(normalized) ||
      normalized.includes(icon.name.toLowerCase()) ||
      icon.aliases.some(alias =>
        alias.includes(normalized) || normalized.includes(alias)
      )
  );
  if (partialMatch) return partialMatch;

  return null;
}
```

### Anti-Patterns to Avoid
- **Importing all icons:** Never `import * from "devicons-react"` - breaks tree-shaking, bloats bundle
- **Runtime icon fetching:** Don't fetch icon metadata at runtime - use static registry
- **CSS-only monochrome:** Don't use CSS filters - use Plain/Line variants with color prop
- **Heavy fuzzy search library:** Don't add fuse.js for 400 items - native string methods sufficient

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Icon registry types | Manual interface definition | Infer from devicons-react | Maintain type safety with library updates |
| Keyboard grid navigation | Custom focus management | Existing patterns from project-form-modal.tsx | Consistent accessibility approach |
| Modal overlay | New component | Match existing SkillFormModal pattern | Design consistency |
| localStorage abstraction | Complex persistence layer | Simple hook with try/catch | localStorage is already simple enough |

**Key insight:** The project already has modal patterns (project-form-modal.tsx, skills-manager.tsx) with focus traps and keyboard handling. Reuse these patterns rather than inventing new ones.

## Common Pitfalls

### Pitfall 1: Bundle Size Explosion
**What goes wrong:** Importing icons incorrectly includes all 400+ icons in bundle
**Why it happens:** Using `import { ReactPlain } from "devicons-react"` instead of individual imports
**How to avoid:** Always use `import ReactPlain from "devicons-react/icons/ReactPlain"`
**Warning signs:** Build size increases significantly, slow page loads

### Pitfall 2: SSR Hydration Mismatch with localStorage
**What goes wrong:** Server renders empty recent icons, client has different state
**Why it happens:** localStorage only available client-side
**How to avoid:** Initialize state empty, populate in useEffect (client-only)
**Warning signs:** React hydration warnings in console

### Pitfall 3: Icons Not Inheriting Color
**What goes wrong:** Icons remain colored instead of matching text color
**Why it happens:** Using Original variants instead of Plain/Line, or missing color prop
**How to avoid:** Use Plain or Line variants with `color="currentColor"`
**Warning signs:** Colored logos clashing with monochrome design system

### Pitfall 4: Poor Keyboard Navigation UX
**What goes wrong:** Arrow keys don't work intuitively, focus jumps unexpectedly
**Why it happens:** Not accounting for grid layout in navigation logic
**How to avoid:** Calculate row/column position, handle edge cases (first/last row)
**Warning signs:** User testing reveals navigation confusion

### Pitfall 5: Missing Fallback for Unknown Icons
**What goes wrong:** Skill displays no icon or crashes
**Why it happens:** Icon ID in database doesn't match registry (typo, removed icon)
**How to avoid:** TechIcon always has Lucide fallback based on skill category
**Warning signs:** Skills appearing without icons in production

### Pitfall 6: Search Not Finding Expected Icons
**What goes wrong:** User types "ReactJS" but React icon not found
**Why it happens:** No aliases defined for common variations
**How to avoid:** Include common aliases: "react.js", "reactjs", "react js"
**Warning signs:** User manually browsing instead of searching

## Code Examples

### Importing devicons-react Icons Correctly
```typescript
// CORRECT: Individual imports enable tree-shaking
import ReactPlain from "devicons-react/icons/ReactPlain";
import TypescriptPlain from "devicons-react/icons/TypescriptPlain";
import PythonPlain from "devicons-react/icons/PythonPlain";

// WRONG: Named imports include entire library
import { ReactPlain, TypescriptPlain } from "devicons-react";
```

### Rendering Monochrome devicon
```typescript
import ReactPlain from "devicons-react/icons/ReactPlain";

// Inherits text color from parent
<ReactPlain color="currentColor" style={{ width: 20, height: 20 }} />

// Or with explicit color
<ReactPlain color="var(--color-text)" style={{ width: 20, height: 20 }} />
```

### Category Fallback Mapping
```typescript
// lib/icons/icon-categories.ts
import { Code, Server, Database, Cloud, Container, Wrench } from "lucide-react";
import type { SkillCategory } from "@/lib/validations/skill";
import type { LucideIcon } from "lucide-react";

export const CATEGORY_FALLBACKS: Record<SkillCategory, LucideIcon> = {
  frontend: Code,
  backend: Server,
  tools: Wrench,
  other: Code,
};

// Extended categories for devicons
export const DEVICON_CATEGORY_FALLBACKS: Record<string, LucideIcon> = {
  languages: Code,
  frameworks: Code,
  databases: Database,
  cloud: Cloud,
  devops: Container,
  tools: Wrench,
};
```

### Schema Change for Icon Type
```prisma
// prisma/schema.prisma - Updated Skill model
model Skill {
  id        String   @id @default(cuid())
  name      String
  iconType  String   @default("lucide")  // "devicon" | "lucide"
  iconId    String?                       // devicon ID like "react" or lucide name
  category  String
  order     Int      @default(0)
  visible   Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([category])
  @@index([order])
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS icon fonts | SVG React components | 2020+ | Better tree-shaking, accessibility |
| Colored brand icons | Monochrome with CSS control | Design system trend | Consistent visual language |
| External CDN icons | Bundled components | Performance focus | Faster, no network dependency |

**Deprecated/outdated:**
- Font-based devicons (devicon CSS): Still works but SVG components are preferred for React
- Fetching icon metadata at runtime: Pre-build static registries are faster and more reliable

## Open Questions

1. **Exact icon count in devicons-react**
   - What we know: Documentation says "comprehensive collection" based on Devicon's 400+ icons
   - What's unclear: Whether all Devicon icons are included or a subset
   - Recommendation: Build registry incrementally, starting with most common (~100), expand as needed

2. **Icon component prop types**
   - What we know: size (number), color (string), className supported
   - What's unclear: Exact TypeScript types exported by library
   - Recommendation: Verify types after installation, may need custom type wrapper

## Sources

### Primary (HIGH confidence)
- [devicons-react GitHub](https://github.com/MKAbuMattar/devicons-react) - Installation, import patterns, customization props
- [Devicon project](https://github.com/devicons/devicon) - Icon metadata structure, ~400+ icons available
- [Lucide React docs](https://lucide.dev/guide/packages/lucide-react) - Icon component props, color/size customization
- Context7: /devicons/devicon - SVG usage, JSON metadata API
- Context7: /websites/lucide_dev_guide_packages - React component patterns
- Context7: /websites/fusejs_io - Fuzzy search patterns (determined not needed)

### Secondary (MEDIUM confidence)
- [freeCodeCamp keyboard accessibility](https://www.freecodecamp.org/news/designing-keyboard-accessibility-for-complex-react-experiences/) - Grid navigation patterns
- [Josh Comeau localStorage persistence](https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/) - SSR-safe localStorage hooks

### Tertiary (LOW confidence)
- Web search results for bundle size claims - verify after installation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - devicons-react verified in documentation, already in PROJECT.md
- Architecture: HIGH - patterns derived from existing project code (project-form-modal.tsx)
- Pitfalls: HIGH - common React patterns, verified with multiple sources

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (stable domain, libraries mature)
