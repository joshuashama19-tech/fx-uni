import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkCourseAccess } from "@/lib/access";
import { signInAction } from "@/lib/auth/actions";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/course-data";

export const metadata: Metadata = { title: "Log In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const access = await checkCourseAccess();
    redirect(access.authorized ? "/learn" : "/get-started");
  }

  const next = params.next && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : "/learn";

  return (
    <main id="main-content" className="min-h-screen bg-ink-950 py-16 sm:py-24">
      <Container className="max-w-md">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">{siteConfig.name}</p>
          <h1 className="mx-auto mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Log in</h1>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          {params.status === "password-updated" ? (
            <p className="mb-5 rounded-lg bg-ink-50 px-4 py-3 text-sm text-ink-700">
              Your password has been updated. Log in with your new password.
            </p>
          ) : null}
          {params.error ? (
            <p className="mb-5 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">{params.error}</p>
          ) : null}

          <form action={signInAction} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <input type="hidden" name="redirectPath" value="/login" />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">Email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">Password</span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
            <div className="text-right">
              <Link href="/forgot-password" className="text-xs text-ink-500 underline underline-offset-2 hover:text-ink-800">
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700"
            >
              Log in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            New here?{" "}
            <Link href="/get-started?mode=signup" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700">
              Create an account
            </Link>
          </p>
        </div>
      </Container>
    </main>
  );
}
