// Zod validation schema for skills
// Provides type-safe validation for skill CRUD operations

import { z } from "zod";

// Skill categories as const array for dropdown options and validation
export const SKILL_CATEGORIES = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "tools", label: "Tools" },
  { value: "other", label: "Other" },
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number]["value"];

// Zod schema for skill validation
export const skillSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less"),
  icon: z
    .string()
    .min(1, "Icon is required")
    .max(50, "Icon name must be 50 characters or less"),
  category: z.enum(["frontend", "backend", "tools", "other"], {
    error: "Please select a valid category",
  }),
});

// TypeScript type derived from schema
export type SkillFormData = z.infer<typeof skillSchema>;
