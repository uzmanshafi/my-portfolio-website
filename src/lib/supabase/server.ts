// Server Supabase client for server-side operations
// Uses service role key to bypass RLS - only use in server actions/API routes

import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for server-side use with service role privileges.
 * Bypasses Row Level Security - use only for trusted server operations.
 *
 * This client is designed for storage operations (file uploads) where we need
 * full access without RLS restrictions. We don't use cookies because this
 * isn't for user authentication - Auth.js handles that separately.
 */
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      // Disable auth features since we use Auth.js for authentication
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
