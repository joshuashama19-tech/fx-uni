import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase email links (signup confirmation, password recovery) redirect
// here with a `code` param. Exchanging it for a session is what actually
// confirms the address / lets them set a new password — nothing else in
// this app implements that exchange. The two callers that build a link
// pointing here are signUpAction and requestPasswordResetAction (both in
// lib/auth/actions.ts) — distinguished below by their `next` value, since
// Supabase doesn't forward anything else that would tell them apart.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/get-started";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/get-started";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Password recovery is the one flow that must keep the session this
      // exchange just created — /reset-password calls
      // supabase.auth.updateUser(), which requires an active session to
      // know whose password to change.
      if (next === "/reset-password") {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Every other case reaching here is a signup email confirmation.
      // Confirming an email address only proves the address is real — it
      // is not a login, and it must never be treated as one. Sign the
      // session this exchange just created back out immediately, and send
      // the student to the login page to authenticate with their password
      // like any other visit. This is also what keeps course access honest:
      // requireCourseAccess() (lib/access.ts) only ever sees this user
      // after a real signInAction call, so a confirmation link can never by
      // itself reach /learn or count as having paid.
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login?status=email-confirmed&next=${encodeURIComponent(next)}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("That link is invalid or has expired. Please try again.")}`
  );
}
