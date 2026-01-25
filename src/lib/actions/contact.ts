"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { contactSchema } from "@/lib/validations/contact";
import { ActionResult, success, failure } from "@/lib/validations/common";
import type { Contact } from "@/generated/prisma/client";

/**
 * Fetch the contact record (singleton pattern - may not exist)
 */
export async function getContact(): Promise<Contact | null> {
  return prisma.contact.findFirst();
}

/**
 * Update or create the contact record (singleton pattern)
 * Requires authentication
 */
export async function updateContact(
  formData: FormData
): Promise<ActionResult<Contact>> {
  // Check authentication
  const session = await auth();
  if (!session?.user) {
    return failure("Unauthorized");
  }

  // Parse and validate form data
  const rawData = {
    email: formData.get("email"),
    location: formData.get("location") || "",
  };

  const parsed = contactSchema.safeParse(rawData);
  if (!parsed.success) {
    // Zod v4 uses .issues instead of .errors
    const firstError = parsed.error.issues[0];
    return failure(firstError.message);
  }

  try {
    // Find existing contact
    const existing = await prisma.contact.findFirst();

    let contact: Contact;

    if (existing) {
      // Update existing
      contact = await prisma.contact.update({
        where: { id: existing.id },
        data: {
          email: parsed.data.email,
          location: parsed.data.location || null,
        },
      });
    } else {
      // Create new
      contact = await prisma.contact.create({
        data: {
          email: parsed.data.email,
          location: parsed.data.location || null,
        },
      });
    }

    revalidatePath("/backstage/dashboard/contact");
    revalidatePath("/");

    return success(contact);
  } catch (error) {
    console.error("Failed to update contact:", error);
    return failure("Failed to save contact information");
  }
}
