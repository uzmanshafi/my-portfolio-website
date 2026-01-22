"use server";

// Storage server actions for Supabase Storage operations
// Uses service role client to bypass RLS

import { auth } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StorageResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Generate a signed upload URL for client-side uploads.
 * Requires authenticated admin session.
 *
 * @param bucket - Supabase storage bucket name
 * @param path - File path within the bucket
 * @returns Signed URL and token for direct upload, or error
 */
export async function getSignedUploadUrl(
  bucket: string,
  path: string
): Promise<StorageResult<{ signedUrl: string; token: string }>> {
  // Verify admin session
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error) {
      console.error("Storage signed URL error:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        signedUrl: data.signedUrl,
        token: data.token,
      },
    };
  } catch (error) {
    console.error("Storage operation failed:", error);
    return { success: false, error: "Failed to generate upload URL" };
  }
}

/**
 * Delete a file from Supabase Storage.
 * Used for cleanup when replacing images.
 * Requires authenticated admin session.
 *
 * @param bucket - Supabase storage bucket name
 * @param path - File path within the bucket
 */
export async function deleteStorageFile(
  bucket: string,
  path: string
): Promise<StorageResult<void>> {
  // Verify admin session
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const supabase = createSupabaseServerClient();

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error("Storage delete error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Storage delete failed:", error);
    return { success: false, error: "Failed to delete file" };
  }
}

/**
 * Get the public URL for a file in Supabase Storage.
 * Does not require authentication as public URLs are accessible to all.
 *
 * Note: This is a simple URL construction that runs on server.
 * It's marked async because all exports in a "use server" file must be async.
 *
 * @param bucket - Supabase storage bucket name
 * @param path - File path within the bucket
 */
export async function getPublicUrl(bucket: string, path: string): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
