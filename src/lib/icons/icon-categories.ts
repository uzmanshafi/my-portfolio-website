// Category fallback mapping and icon picker categories
// Maps skill categories to Lucide fallback icons
// Provides tab definitions for icon picker UI

import { Code, Server, Wrench, Database, Cloud, Container } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SkillCategory } from "@/lib/validations/skill";
import type { IconCategory } from "./devicon-registry";

// Fallback Lucide icons for skills without a devicon
// Maps SkillCategory (frontend, backend, tools, other) to Lucide icons
export const CATEGORY_FALLBACKS: Record<SkillCategory, LucideIcon> = {
  frontend: Code,
  backend: Server,
  tools: Wrench,
  other: Code,
};

// Extended fallbacks for devicon categories
// Used when matching devicon categories to Lucide fallbacks
export const DEVICON_CATEGORY_FALLBACKS: Record<IconCategory, LucideIcon> = {
  languages: Code,
  frameworks: Code,
  databases: Database,
  cloud: Cloud,
  devops: Container,
  tools: Wrench,
};

// Category tabs for icon picker UI
export const DEVICON_CATEGORIES: { value: IconCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "languages", label: "Languages" },
  { value: "frameworks", label: "Frameworks" },
  { value: "databases", label: "Databases" },
  { value: "cloud", label: "Cloud" },
  { value: "devops", label: "DevOps" },
  { value: "tools", label: "Tools" },
];
