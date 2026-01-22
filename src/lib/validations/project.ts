// Project validation schema for CRUD operations
// Used by react-hook-form and server actions

import { z } from "zod";

/**
 * Optional URL field - accepts empty string, null, or valid URL
 */
const optionalUrl = z
  .string()
  .transform((val) => (val === "" ? null : val))
  .pipe(z.string().url().nullable())
  .or(z.literal(""))
  .optional();

/**
 * Zod schema for project creation and editing.
 * Validates all fields with appropriate constraints.
 */
export const projectSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be 2000 characters or less"),
  imageUrl: optionalUrl,
  liveUrl: optionalUrl,
  repoUrl: optionalUrl,
  technologies: z
    .array(z.string().min(1))
    .optional()
    .default([]),
  featured: z.boolean().optional().default(false),
});

/**
 * TypeScript type inferred from the schema.
 * Use this for form data typing.
 */
export type ProjectFormData = z.infer<typeof projectSchema>;
