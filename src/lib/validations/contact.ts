// Validation schemas for contact info and social links
// Used by server actions and client-side forms

import { z } from "zod";

/**
 * Common platforms with suggested icon mappings
 * Platform name -> Lucide icon name
 */
export const COMMON_PLATFORMS = [
  { platform: "github", icon: "github" },
  { platform: "linkedin", icon: "linkedin" },
  { platform: "twitter", icon: "twitter" },
  { platform: "x", icon: "twitter" }, // X uses twitter icon
  { platform: "instagram", icon: "instagram" },
  { platform: "youtube", icon: "youtube" },
  { platform: "email", icon: "mail" },
  { platform: "website", icon: "globe" },
  { platform: "dribbble", icon: "dribbble" },
  { platform: "figma", icon: "figma" },
] as const;

/**
 * Contact schema - email and optional location
 */
export const contactSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  location: z
    .string()
    .max(100, "Location must be 100 characters or less")
    .optional()
    .or(z.literal("")),
});

export type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Social link schema - platform, URL, and icon
 */
export const socialLinkSchema = z.object({
  platform: z
    .string()
    .min(1, "Platform name is required")
    .max(50, "Platform name must be 50 characters or less"),
  url: z
    .string()
    .min(1, "URL is required")
    .url("Please enter a valid URL"),
  icon: z
    .string()
    .min(1, "Icon name is required")
    .max(50, "Icon name must be 50 characters or less"),
});

export type SocialLinkFormData = z.infer<typeof socialLinkSchema>;
