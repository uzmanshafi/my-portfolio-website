"use server";

// Resume server actions for managing resume uploads
// Handles database records - actual file upload is via signed URL

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ActionResult, success, failure } from "@/lib/validations/common";
import type { Resume } from "@/generated/prisma/client";

/**
 * Fetch the active resume record.
 * Returns null if no resume exists or none is active.
 */
export async function getActiveResume(): Promise<Resume | null> {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const resume = await prisma.resume.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return resume;
}

/**
 * Create a new resume record after file upload.
 * Deactivates all existing resumes (only one active at a time).
 *
 * @param filename - Original filename of the uploaded PDF
 * @param url - Public URL of the uploaded file in Supabase Storage
 */
export async function uploadResume(
  filename: string,
  url: string
): Promise<ActionResult<Resume>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  try {
    // Deactivate all existing resumes
    await prisma.resume.updateMany({
      where: { active: true },
      data: { active: false },
    });

    // Create new active resume record
    const resume = await prisma.resume.create({
      data: {
        filename,
        url,
        active: true,
      },
    });

    revalidatePath("/backstage/dashboard/resume");
    revalidatePath("/");

    return success(resume);
  } catch (error) {
    console.error("Failed to create resume record:", error);
    return failure("Failed to save resume record");
  }
}

/**
 * Delete a resume record.
 * Note: This only deletes the database record. Storage cleanup
 * should be handled separately if needed.
 *
 * @param id - Resume record ID to delete
 */
export async function deleteResume(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  try {
    await prisma.resume.delete({
      where: { id },
    });

    revalidatePath("/backstage/dashboard/resume");
    revalidatePath("/");

    return success();
  } catch (error) {
    console.error("Failed to delete resume:", error);
    return failure("Failed to delete resume");
  }
}
