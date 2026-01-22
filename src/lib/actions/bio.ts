"use server";

// Bio server actions for CRUD operations
// Handles validation, database operations, and cache revalidation

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bioSchema, type BioFormData } from "@/lib/validations/bio";

// Singleton bio ID - only one bio record exists
const BIO_ID = "main";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Fetch the current bio data.
 * Returns null if no bio exists yet.
 */
export async function getBio() {
  try {
    const bio = await prisma.bio.findFirst({
      where: { id: BIO_ID },
    });
    return bio;
  } catch (error) {
    console.error("Failed to fetch bio:", error);
    return null;
  }
}

/**
 * Create or update bio data.
 * Validates input and requires authenticated admin session.
 */
export async function updateBio(
  formData: FormData
): Promise<ActionResult<BioFormData>> {
  // Verify admin session
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  // Extract and validate form data
  const rawData = {
    name: formData.get("name"),
    title: formData.get("title"),
    headline: formData.get("headline"),
    description: formData.get("description"),
  };

  const result = bioSchema.safeParse(rawData);
  if (!result.success) {
    // Return first validation error (Zod v4 uses .issues)
    const firstError = result.error.issues[0];
    return { success: false, error: firstError.message };
  }

  const data = result.data;

  try {
    // Upsert bio - create if not exists, update if exists
    await prisma.bio.upsert({
      where: { id: BIO_ID },
      update: {
        name: data.name,
        title: data.title,
        headline: data.headline,
        description: data.description,
      },
      create: {
        id: BIO_ID,
        name: data.name,
        title: data.title,
        headline: data.headline,
        description: data.description,
      },
    });

    // Revalidate pages that display bio data
    revalidatePath("/backstage/dashboard/bio");
    revalidatePath("/"); // Public homepage

    return { success: true, data };
  } catch (error) {
    console.error("Failed to update bio:", error);
    return { success: false, error: "Failed to save bio" };
  }
}

/**
 * Update only the profile image URL.
 * Called after successful image upload to Supabase Storage.
 */
export async function updateProfileImage(
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
    // Update or create bio with image URL
    await prisma.bio.upsert({
      where: { id: BIO_ID },
      update: {
        imageUrl,
      },
      create: {
        id: BIO_ID,
        name: "",
        title: "",
        headline: "",
        description: "",
        imageUrl,
      },
    });

    // Revalidate pages that display profile image
    revalidatePath("/backstage/dashboard/bio");
    revalidatePath("/"); // Public homepage

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update profile image:", error);
    return { success: false, error: "Failed to save profile image" };
  }
}
