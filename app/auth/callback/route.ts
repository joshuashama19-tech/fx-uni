import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase email links (signup confirmation, password recovery) redirect
// here with a `code` param. Exchanging it for a session is what actually
// logs the user in / lets them set a new password — nothing else in this
// app implements that exchange.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/get-started";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/get-started";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("That link is invalid or has expired. Please try again.")}`
  );
}
