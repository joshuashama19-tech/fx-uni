import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the SERVICE ROLE key.
 *
 * This client BYPASSES Row Level Security entirely. It must only be used in
 * trusted server-only code paths that perform their own authorization checks
 * before touching the database:
 *   - the Paystack webhook handler (lib/payments/paystack.ts / the webhook
 *     route), which has no logged-in user session to authenticate as, but
 *     must still write orders/course_access/payment_events rows
 *   - admin actions (app/admin/**), which check requireAdmin() themselves
 *     before ever calling this client
 *
 * NEVER import this file into a Client Component, NEVER call it in response
 * to unauthenticated/unauthorized input, and NEVER use it as a shortcut to
 * avoid writing a proper RLS policy or an authorization check. The
 * `server-only` import above turns the first of those into a build-time
 * error instead of relying solely on this comment (added in the pre-
 * deployment security-hardening pass — this file previously had no such
 * enforcement, unlike every other file that touches secret credentials).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "createAdminClient: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
        "must both be set. This client is server-only and must never be reached " +
        "from the browser."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
