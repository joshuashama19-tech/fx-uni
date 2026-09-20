import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use in Server Components, Server Actions, and Route
 * Handlers. Reads/writes the auth session via Next.js's cookie store.
 *
 * This client is still subject to Row Level Security — it authenticates as
 * the current user's session, not as an admin. For privileged server-only
 * operations (webhook processing, admin actions) use
 * lib/supabase/admin.ts instead.
 *
 * Must be created fresh per request (never module-level/singleton) because
 * it closes over the current request's cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component, which can't set cookies.
            // Harmless as long as middleware.ts is refreshing sessions
            // on every request (it is — see middleware.ts).
          }
        },
      },
    }
  );
}

