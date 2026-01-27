"use server";

// Server actions for skills CRUD operations and reordering
// All actions require authentication

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { skillSchema, type SkillCategory } from "@/lib/validations/skill";
import {
  ActionResult,
  success,
  failure,
} from "@/lib/validations/common";
import type { Skill } from "@/generated/prisma/client";

// Type for grouped skills by category
export type GroupedSkills = {
  category: SkillCategory;
  skills: Skill[];
}[];

/**
 * Fetches all skills grouped by category, ordered by category then order field.
 */
export async function getSkills(): Promise<ActionResult<GroupedSkills>> {
  try {
    const skills = await prisma.skill.findMany({
      where: { visible: true },
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });

    // Group by category maintaining order
    const categoryOrder: SkillCategory[] = ["frontend", "backend", "tools", "other"];
    const grouped: GroupedSkills = [];

    for (const cat of categoryOrder) {
      const categorySkills = skills.filter((s) => s.category === cat);
      if (categorySkills.length > 0) {
        grouped.push({
          category: cat,
          skills: categorySkills,
        });
      }
    }

    return success(grouped);
  } catch (error) {
    console.error("Failed to fetch skills:", error);
    return failure("Failed to fetch skills");
  }
}

/**
 * Fetches all skills (including hidden) for admin management.
 */
export async function getAllSkills(): Promise<ActionResult<GroupedSkills>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Not authenticated");
  }

  try {
    const skills = await prisma.skill.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });

    // Group by category maintaining order
    const categoryOrder: SkillCategory[] = ["frontend", "backend", "tools", "other"];
    const grouped: GroupedSkills = [];

    for (const cat of categoryOrder) {
      const categorySkills = skills.filter((s) => s.category === cat);
      if (categorySkills.length > 0) {
        grouped.push({
          category: cat,
          skills: categorySkills,
        });
      }
    }

    // Add empty categories so they appear in the UI for adding new skills
    for (const cat of categoryOrder) {
      if (!grouped.find((g) => g.category === cat)) {
        grouped.push({ category: cat, skills: [] });
      }
    }

    // Re-sort to maintain category order
    grouped.sort(
      (a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
    );

    return success(grouped);
  } catch (error) {
    console.error("Failed to fetch skills:", error);
    return failure("Failed to fetch skills");
  }
}

/**
 * Creates a new skill.
 * New skill is added at the end of its category (max order + 1).
 */
export async function createSkill(
  formData: FormData
): Promise<ActionResult<Skill>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Not authenticated");
  }

  const rawData = {
    name: formData.get("name"),
    iconType: formData.get("iconType") || "lucide",
    iconId: formData.get("iconId"),
    category: formData.get("category"),
  };

  const parsed = skillSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return failure(firstError?.message || "Invalid skill data");
  }

  try {
    // Get max order in this category
    const maxOrderSkill = await prisma.skill.findFirst({
      where: { category: parsed.data.category },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = (maxOrderSkill?.order ?? -1) + 1;

    const skill = await prisma.skill.create({
      data: {
        name: parsed.data.name,
        iconType: parsed.data.iconType,
        iconId: parsed.data.iconId,
        category: parsed.data.category,
        order: newOrder,
      },
    });

    revalidatePath("/backstage/dashboard/skills");
    revalidatePath("/");
    return success(skill);
  } catch (error) {
    console.error("Failed to create skill:", error);
    return failure("Failed to create skill");
  }
}

/**
 * Updates an existing skill.
 */
export async function updateSkill(
  id: string,
  formData: FormData
): Promise<ActionResult<Skill>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Not authenticated");
  }

  if (!id) {
    return failure("Skill ID is required");
  }

  const rawData = {
    name: formData.get("name"),
    iconType: formData.get("iconType") || "lucide",
    iconId: formData.get("iconId"),
    category: formData.get("category"),
  };

  const parsed = skillSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return failure(firstError?.message || "Invalid skill data");
  }

  try {
    // Check if skill exists
    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing) {
      return failure("Skill not found");
    }

    // If category changed, move to end of new category
    let newOrder = existing.order;
    if (existing.category !== parsed.data.category) {
      const maxOrderSkill = await prisma.skill.findFirst({
        where: { category: parsed.data.category },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      newOrder = (maxOrderSkill?.order ?? -1) + 1;
    }

    const skill = await prisma.skill.update({
      where: { id },
      data: {
        name: parsed.data.name,
        iconType: parsed.data.iconType,
        iconId: parsed.data.iconId,
        category: parsed.data.category,
        order: newOrder,
      },
    });

    revalidatePath("/backstage/dashboard/skills");
    revalidatePath("/");
    return success(skill);
  } catch (error) {
    console.error("Failed to update skill:", error);
    return failure("Failed to update skill");
  }
}

/**
 * Deletes a skill by ID.
 */
export async function deleteSkill(id: string): Promise<ActionResult<void>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Not authenticated");
  }

  if (!id) {
    return failure("Skill ID is required");
  }

  try {
    // Check if skill exists
    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing) {
      return failure("Skill not found");
    }

    await prisma.skill.delete({ where: { id } });

    revalidatePath("/backstage/dashboard/skills");
    revalidatePath("/");
    return success();
  } catch (error) {
    console.error("Failed to delete skill:", error);
    return failure("Failed to delete skill");
  }
}

/**
 * Bulk updates skill order within a category.
 * Uses transaction for atomic update.
 */
export async function updateSkillsOrder(
  updates: { id: string; order: number }[]
): Promise<ActionResult<void>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Not authenticated");
  }

  if (!updates || updates.length === 0) {
    return success(); // Nothing to update
  }

  try {
    // Use transaction for atomic update
    await prisma.$transaction(
      updates.map((update) =>
        prisma.skill.update({
          where: { id: update.id },
          data: { order: update.order },
        })
      )
    );

    revalidatePath("/backstage/dashboard/skills");
    revalidatePath("/");
    return success();
  } catch (error) {
    console.error("Failed to update skills order:", error);
    return failure("Failed to update skills order");
  }
}

/**
 * Updates category display order by reordering all skills across categories.
 * Skills within each category maintain their relative order,
 * but category groups are reordered based on the provided array.
 */
export async function updateCategoryOrder(
  categoryOrder: string[]
): Promise<ActionResult<void>> {
  const session = await auth();
  if (!session?.user) {
    return failure("Not authenticated");
  }

  if (!categoryOrder || categoryOrder.length === 0) {
    return success(); // Nothing to update
  }

  try {
    // Fetch all skills grouped by category
    const skills = await prisma.skill.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });

    // Group skills by category
    const skillsByCategory = new Map<string, typeof skills>();
    for (const skill of skills) {
      const catSkills = skillsByCategory.get(skill.category) || [];
      catSkills.push(skill);
      skillsByCategory.set(skill.category, catSkills);
    }

    // Build updates: assign order based on new category order
    // Each category gets a range (e.g., category 0: 0-99, category 1: 100-199)
    const updates: { id: string; order: number }[] = [];
    const CATEGORY_RANGE = 1000; // Each category gets 1000 order slots

    for (let catIndex = 0; catIndex < categoryOrder.length; catIndex++) {
      const category = categoryOrder[catIndex];
      const catSkills = skillsByCategory.get(category) || [];
      const baseOrder = catIndex * CATEGORY_RANGE;

      for (let skillIndex = 0; skillIndex < catSkills.length; skillIndex++) {
        updates.push({
          id: catSkills[skillIndex].id,
          order: baseOrder + skillIndex,
        });
      }
    }

    // Execute all updates in a transaction
    if (updates.length > 0) {
      await prisma.$transaction(
        updates.map((update) =>
          prisma.skill.update({
            where: { id: update.id },
            data: { order: update.order },
          })
        )
      );
    }

    revalidatePath("/backstage/dashboard/skills");
    revalidatePath("/");
    return success();
  } catch (error) {
    console.error("Failed to update category order:", error);
    return failure("Failed to update category order");
  }
}
