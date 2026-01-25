"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { socialLinkSchema } from "@/lib/validations/contact";
import { ActionResult, success, failure } from "@/lib/validations/common";
import type { SocialLink } from "@/generated/prisma/client";

/**
 * Fetch all social links ordered by their order field
 */
export async function getSocialLinks(): Promise<SocialLink[]> {
  return prisma.socialLink.findMany({
    orderBy: { order: "asc" },
  });
}

/**
 * Create a new social link
 * Requires authentication
 */
export async function createSocialLink(
  formData: FormData
): Promise<ActionResult<SocialLink>> {
  // Check authentication
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  // Parse and validate form data
  const rawData = {
    platform: formData.get("platform"),
    url: formData.get("url"),
    icon: formData.get("icon"),
  };

  const parsed = socialLinkSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return failure(firstError.message);
  }

  try {
    // Get max order for new item
    const maxOrder = await prisma.socialLink.aggregate({
      _max: { order: true },
    });
    const newOrder = (maxOrder._max.order ?? -1) + 1;

    const socialLink = await prisma.socialLink.create({
      data: {
        platform: parsed.data.platform,
        url: parsed.data.url,
        icon: parsed.data.icon,
        order: newOrder,
      },
    });

    revalidatePath("/backstage/dashboard/contact");
    revalidatePath("/");

    return success(socialLink);
  } catch (error) {
    console.error("Failed to create social link:", error);
    return failure("Failed to create social link");
  }
}

/**
 * Update an existing social link
 * Requires authentication
 */
export async function updateSocialLink(
  id: string,
  formData: FormData
): Promise<ActionResult<SocialLink>> {
  // Check authentication
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  // Parse and validate form data
  const rawData = {
    platform: formData.get("platform"),
    url: formData.get("url"),
    icon: formData.get("icon"),
  };

  const parsed = socialLinkSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return failure(firstError.message);
  }

  try {
    const socialLink = await prisma.socialLink.update({
      where: { id },
      data: {
        platform: parsed.data.platform,
        url: parsed.data.url,
        icon: parsed.data.icon,
      },
    });

    revalidatePath("/backstage/dashboard/contact");
    revalidatePath("/");

    return success(socialLink);
  } catch (error) {
    console.error("Failed to update social link:", error);
    return failure("Failed to update social link");
  }
}

/**
 * Delete a social link by ID
 * Requires authentication
 */
export async function deleteSocialLink(
  id: string
): Promise<ActionResult<void>> {
  // Check authentication
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  try {
    await prisma.socialLink.delete({
      where: { id },
    });

    revalidatePath("/backstage/dashboard/contact");
    revalidatePath("/");

    return success();
  } catch (error) {
    console.error("Failed to delete social link:", error);
    return failure("Failed to delete social link");
  }
}

/**
 * Update the order of multiple social links
 * Requires authentication
 */
export async function updateSocialLinksOrder(
  updates: { id: string; order: number }[]
): Promise<ActionResult<void>> {
  // Check authentication
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  if (!updates || updates.length === 0) {
    return success();
  }

  try {
    // Update all orders in a transaction
    await prisma.$transaction(
      updates.map((update) =>
        prisma.socialLink.update({
          where: { id: update.id },
          data: { order: update.order },
        })
      )
    );

    revalidatePath("/backstage/dashboard/contact");
    revalidatePath("/");

    return success();
  } catch (error) {
    console.error("Failed to update social links order:", error);
    return failure("Failed to update order");
  }
}
