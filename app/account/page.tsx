import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkCourseAccess } from "@/lib/access";
import { signOutAction } from "@/lib/auth/actions";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/course-data";

export const metadata: Metadata = { title: "Account" };

// Deliberately minimal — per spec, this is not a dashboard. Just enough for
// a student to see their own status and log out.
export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=%2Faccount");
  }

  const access = await checkCourseAccess();
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();

  return (
    <main id="main-content" className="min-h-screen bg-ink-950 py-16 sm:py-24">
      <Container className="max-w-md">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">{siteConfig.name}</p>
          <h1 className="mx-auto mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Your account</h1>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-ink-500">Name</dt>
              <dd className="mt-0.5 font-medium text-ink-900">{profile?.full_name || "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Email</dt>
              <dd className="mt-0.5 font-medium text-ink-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Course access</dt>
              <dd className="mt-0.5 font-medium text-ink-900">
                {access.authorized ? (
                  <span className="inline-flex items-center gap-1.5 text-ink-900">
                    <span className="h-2 w-2 rounded-full bg-green-500" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-ink-500">
                    <span className="h-2 w-2 rounded-full bg-ink-300" /> Not active
                  </span>
                )}
              </dd>
            </div>
          </dl>

          <div className="mt-8 space-y-3">
            {access.authorized ? (
              <Link
                href="/learn"
                className="block w-full rounded-full bg-brand-600 px-6 py-3.5 text-center text-base font-semibold text-white shadow-glow hover:bg-brand-700"
              >
                Go to course
              </Link>
            ) : (
              <Link
                href="/get-started"
                className="block w-full rounded-full bg-brand-600 px-6 py-3.5 text-center text-base font-semibold text-white shadow-glow hover:bg-brand-700"
              >
                Complete enrollment
              </Link>
            )}
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full rounded-full border border-ink-200 px-6 py-3.5 text-base font-semibold text-ink-700 hover:bg-ink-50"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </Container>
    </main>
  );
}
