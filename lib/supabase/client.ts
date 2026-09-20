import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components / the browser.
 *
 * Uses only the public URL + anon (publishable) key — safe to ship to the
 * browser. Row Level Security policies (see supabase/migrations/) are what
 * actually restrict what this client can read or write; it has no elevated
 * privileges.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
