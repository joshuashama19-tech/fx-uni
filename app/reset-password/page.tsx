import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePasswordAction } from "@/lib/auth/actions";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/course-data";

export const metadata: Metadata = { title: "Set New Password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/forgot-password?error=${encodeURIComponent("That reset link has expired. Please request a new one.")}`
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-ink-950 py-16 sm:py-24">
      <Container className="max-w-md">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">{siteConfig.name}</p>
          <h1 className="mx-auto mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Set a new password
          </h1>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          {params.error ? (
            <p className="mb-5 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">{params.error}</p>
          ) : null}
          <form action={updatePasswordAction} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">New password</span>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">Confirm new password</span>
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700"
            >
              Update password
            </button>
          </form>
        </div>
      </Container>
    </main>
  );
}
