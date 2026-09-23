import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Supabase email links (signup confirmation, password recovery) redirect
// here. Two request shapes are accepted, both ending in the identical
// post-verification behavior below:
//   - `code` — the PKCE flow (supabase.auth.exchangeCodeForSession). This
//     is what requestPasswordResetAction's reset-password link uses today,
//     and it is untouched.
//   - `token_hash` + `type` — Supabase's current officially-recommended
//     verification flow for server-side/SSR apps (supabase.auth.verifyOtp).
//     The "Confirm signup" email template must be switched to produce this
//     shape (see the fix notes shipped alongside this change) — the
//     template's old `{{ .ConfirmationURL }}` variable never produces a
//     `code` param this route understands, which is why confirmation links
//     were landing on the generic "invalid or expired" error below, every
//     time.
// The two callers that build a link pointing here are signUpAction and
// requestPasswordResetAction (both in lib/auth/actions.ts) — distinguished
// below by their `next` value, since Supabase doesn't forward anything else
// that would tell them apart.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next") ?? "/get-started";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/get-started";

  const supabase = await createClient();

  let verified = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verified = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    verified = !error;
  }

  if (verified) {
    // Password recovery is the one flow that must keep the session this
    // exchange/verification just created — /reset-password calls
    // supabase.auth.updateUser(), which requires an active session to
    // know whose password to change.
    if (next === "/reset-password") {
      return NextResponse.redirect(`${origin}${next}`);
    }

    // Every other case reaching here is a signup email confirmation.
    // Confirming an email address only proves the address is real — it
    // is not a login, and it must never be treated as one. Sign the
    // session this exchange/verification just created back out
    // immediately, and send the student to the login page to authenticate
    // with their password like any other visit. This is also what keeps
    // course access honest: requireCourseAccess() (lib/access.ts) only
    // ever sees this user after a real signInAction call, so a
    // confirmation link can never by itself reach /learn or count as
    // having paid.
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?status=email-confirmed&next=${encodeURIComponent(next)}`);
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("That link is invalid or has expired. Please try again.")}`
  );
}
