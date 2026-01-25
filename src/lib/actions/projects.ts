"use server";

// Server actions for Projects CRUD operations
// All actions require authentication

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations/project";
import type { ActionResult } from "@/lib/validations/common";
import { success, failure } from "@/lib/validations/common";
import type { Project } from "@/generated/prisma/client";

/**
 * Fetch all projects ordered by order field.
 * Returns all projects including hidden ones (for admin view).
 */
export async function getProjects(): Promise<ActionResult<Project[]>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  try {
    const projects = await prisma.project.findMany({
      orderBy: { order: "asc" },
    });
    return success(projects);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return failure("Failed to fetch projects");
  }
}

/**
 * Create a new project.
 * Automatically assigns order = max order + 1.
 */
export async function createProject(
  formData: FormData
): Promise<ActionResult<Project>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  // Parse form data
  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    imageUrl: (formData.get("imageUrl") as string) || "",
    liveUrl: (formData.get("liveUrl") as string) || "",
    repoUrl: (formData.get("repoUrl") as string) || "",
    technologies: JSON.parse(
      (formData.get("technologies") as string) || "[]"
    ) as string[],
    featured: formData.get("featured") === "true",
  };

  // Validate
  const result = projectSchema.safeParse(rawData);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return failure(firstError?.message || "Validation failed");
  }

  try {
    // Get max order
    const maxOrder = await prisma.project.aggregate({
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    // Create project
    const project = await prisma.project.create({
      data: {
        title: result.data.title,
        description: result.data.description,
        imageUrl: result.data.imageUrl || null,
        liveUrl: result.data.liveUrl || null,
        repoUrl: result.data.repoUrl || null,
        technologies: result.data.technologies,
        featured: result.data.featured,
        visible: true,
        order: nextOrder,
      },
    });

    revalidatePath("/backstage/dashboard/projects");
    revalidatePath("/");
    return success(project);
  } catch (error) {
    console.error("Failed to create project:", error);
    return failure("Failed to create project");
  }
}

/**
 * Update an existing project.
 */
export async function updateProject(
  id: string,
  formData: FormData
): Promise<ActionResult<Project>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  // Parse form data
  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    imageUrl: (formData.get("imageUrl") as string) || "",
    liveUrl: (formData.get("liveUrl") as string) || "",
    repoUrl: (formData.get("repoUrl") as string) || "",
    technologies: JSON.parse(
      (formData.get("technologies") as string) || "[]"
    ) as string[],
    featured: formData.get("featured") === "true",
  };

  // Validate
  const result = projectSchema.safeParse(rawData);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return failure(firstError?.message || "Validation failed");
  }

  try {
    // Verify project exists
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return failure("Project not found");
    }

    // Track which fields are being customized (for GitHub-synced projects)
    let customizedFields = existing.customizedFields || [];

    if (existing.isGitHubSynced) {
      // Fields that can be synced from GitHub - track if user changes them
      const syncableFields: { key: string; newValue: string | null }[] = [
        { key: "title", newValue: result.data.title },
        { key: "description", newValue: result.data.description },
      ];

      for (const { key, newValue } of syncableFields) {
        const existingValue = existing[key as keyof typeof existing];

        // If value changed and field not already in customizedFields, add it
        if (newValue !== existingValue && !customizedFields.includes(key)) {
          customizedFields = [...customizedFields, key];
        }
      }
    }

    // Update project
    const project = await prisma.project.update({
      where: { id },
      data: {
        title: result.data.title,
        description: result.data.description,
        imageUrl: result.data.imageUrl || null,
        liveUrl: result.data.liveUrl || null,
        repoUrl: result.data.repoUrl || null,
        technologies: result.data.technologies,
        featured: result.data.featured,
        customizedFields,
      },
    });

    revalidatePath("/backstage/dashboard/projects");
    revalidatePath("/");
    return success(project);
  } catch (error) {
    console.error("Failed to update project:", error);
    return failure("Failed to update project");
  }
}

/**
 * Delete a project by ID.
 */
export async function deleteProject(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  try {
    // Verify project exists
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return failure("Project not found");
    }

    await prisma.project.delete({ where: { id } });

    revalidatePath("/backstage/dashboard/projects");
    revalidatePath("/");
    return success();
  } catch (error) {
    console.error("Failed to delete project:", error);
    return failure("Failed to delete project");
  }
}

/**
 * Bulk update project order.
 * Uses a transaction to ensure atomicity.
 */
export async function updateProjectsOrder(
  updates: { id: string; order: number }[]
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  if (!updates.length) {
    return success();
  }

  try {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.project.update({
          where: { id: update.id },
          data: { order: update.order },
        })
      )
    );

    revalidatePath("/backstage/dashboard/projects");
    revalidatePath("/");
    return success();
  } catch (error) {
    console.error("Failed to update project order:", error);
    return failure("Failed to update project order");
  }
}

/**
 * Toggle project visibility.
 */
export async function toggleProjectVisibility(
  id: string
): Promise<ActionResult<Project>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  try {
    // Get current state
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return failure("Project not found");
    }

    // Toggle visibility
    const project = await prisma.project.update({
      where: { id },
      data: { visible: !existing.visible },
    });

    revalidatePath("/backstage/dashboard/projects");
    revalidatePath("/");
    return success(project);
  } catch (error) {
    console.error("Failed to toggle project visibility:", error);
    return failure("Failed to toggle visibility");
  }
}

/**
 * Update only the project image URL.
 * Called after successful upload to Supabase.
 */
export async function updateProjectImage(
  id: string,
  imageUrl: string
): Promise<ActionResult<Project>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  try {
    // Verify project exists
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return failure("Project not found");
    }

    // Update image URL
    const project = await prisma.project.update({
      where: { id },
      data: { imageUrl },
    });

    revalidatePath("/backstage/dashboard/projects");
    revalidatePath("/");
    return success(project);
  } catch (error) {
    console.error("Failed to update project image:", error);
    return failure("Failed to update project image");
  }
}
