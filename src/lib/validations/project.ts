// Project validation schema for CRUD operations
// Used by react-hook-form and server actions

import { z } from "zod";

/**
 * Optional URL field - accepts empty string or valid URL
 * Transforms empty string to undefined for cleaner handling
 */
const optionalUrl = z
  .string()
  .refine(
    (val) => val === "" || z.string().url().safeParse(val).success,
    { message: "Please enter a valid URL" }
  )
  .transform((val) => (val === "" ? undefined : val))
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

/**
 * Input type for the form (before transformation).
 * All optional URLs are strings (empty or valid URL).
 */
export type ProjectFormInput = {
  title: string;
  description: string;
  imageUrl?: string;
  liveUrl?: string;
  repoUrl?: string;
  technologies?: string[];
  featured?: boolean;
};
