// Browser Supabase client for client-side operations
// Used for file uploads and real-time features

import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for browser/client-side use.
 * Uses the anon key which respects Row Level Security policies.
 */
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
