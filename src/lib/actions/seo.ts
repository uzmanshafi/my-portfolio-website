"use server";

// SEO settings server actions for CRUD operations
// Handles validation, database operations, and cache revalidation

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seoSchema, type SeoFormData } from "@/lib/validations/seo";

// Singleton SEO ID - only one SEO settings record exists
const SEO_ID = "main";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Fetch the current SEO settings.
 * Returns null if no settings exist yet.
 */
export async function getSeoSettings() {
  try {
    const seoSettings = await prisma.seoSettings.findFirst({
      where: { id: SEO_ID },
    });
    return seoSettings;
  } catch (error) {
    console.error("Failed to fetch SEO settings:", error);
    return null;
  }
}

/**
 * Update SEO title and description.
 * Validates input and requires authenticated admin session.
 */
export async function updateSeoSettings(
  formData: FormData
): Promise<ActionResult<SeoFormData>> {
  // Verify admin session
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  // Extract and validate form data
  const rawData = {
    seoTitle: formData.get("seoTitle") || "",
    seoDescription: formData.get("seoDescription") || "",
  };

  const result = seoSchema.safeParse(rawData);
  if (!result.success) {
    // Return first validation error
    const firstError = result.error.issues[0];
    return { success: false, error: firstError.message };
  }

  const data = result.data;

  try {
    // Upsert SEO settings - create if not exists, update if exists
    await prisma.seoSettings.upsert({
      where: { id: SEO_ID },
      update: {
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
      },
      create: {
        id: SEO_ID,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
      },
    });

    // Revalidate pages that use SEO metadata
    revalidatePath("/backstage/dashboard/seo");
    revalidatePath("/"); // Public homepage for metadata

    return { success: true, data };
  } catch (error) {
    console.error("Failed to update SEO settings:", error);
    return { success: false, error: "Failed to save SEO settings" };
  }
}

/**
 * Update only the OG image URL.
 * Called after successful image upload to Supabase Storage.
 */
export async function updateOgImage(
  imageUrl: string
): Promise<ActionResult> {
  // Verify admin session
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  if (!imageUrl) {
    return { success: false, error: "Image URL is required" };
  }

  try {
    // Update or create SEO settings with OG image URL
    await prisma.seoSettings.upsert({
      where: { id: SEO_ID },
      update: {
        ogImageUrl: imageUrl,
      },
      create: {
        id: SEO_ID,
        ogImageUrl: imageUrl,
      },
    });

    // Revalidate pages that use OG image
    revalidatePath("/backstage/dashboard/seo");
    revalidatePath("/"); // Public homepage for metadata

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update OG image:", error);
    return { success: false, error: "Failed to save OG image" };
  }
}
