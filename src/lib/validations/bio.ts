// Bio validation schema
// Used by both client forms and server actions for consistent validation

import { z } from "zod";

export const bioSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  headline: z
    .string()
    .min(1, "Headline is required")
    .max(200, "Headline must be 200 characters or less"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
});

export type BioFormData = z.infer<typeof bioSchema>;
