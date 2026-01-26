// SEO validation schema
// Used by both client forms and server actions for consistent validation

import { z } from "zod";

export const seoSchema = z.object({
  seoTitle: z
    .string()
    .max(60, "SEO title must be 60 characters or less")
    .optional()
    .or(z.literal("")),
  seoDescription: z
    .string()
    .max(160, "SEO description must be 160 characters or less")
    .optional()
    .or(z.literal("")),
});

export type SeoFormData = z.infer<typeof seoSchema>;
