import type { Metadata } from "next";
import Link from "next/link";
import { requestPasswordResetAction } from "@/lib/auth/actions";
import { Container } from "@/components/ui/Container";
import { IconMail } from "@/components/icons";
import { siteConfig } from "@/lib/course-data";

export const metadata: Metadata = { title: "Reset Password" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main id="main-content" className="min-h-screen bg-ink-950 py-16 sm:py-24">
      <Container className="max-w-md">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">{siteConfig.name}</p>
          <h1 className="mx-auto mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Reset your password
          </h1>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          {params.status === "sent" ? (
            <div className="flex gap-3 rounded-lg bg-ink-50 px-4 py-3.5 text-ink-700">
              <IconMail className="mt-0.5 h-5 w-5 flex-none" />
              <p className="text-sm leading-relaxed">
                If an account exists for that email, we&apos;ve sent a link to reset your password. Check your
                inbox.
              </p>
            </div>
          ) : (
            <>
              {params.error ? (
                <p className="mb-5 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">{params.error}</p>
              ) : null}
              <p className="mb-5 text-sm text-ink-600">
                Enter your account email and we&apos;ll send you a link to set a new password.
              </p>
              <form action={requestPasswordResetAction} className="space-y-4">
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
                <button
                  type="submit"
                  className="w-full rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700"
                >
                  Send reset link
                </button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-ink-500">
            <Link href="/login" className="underline underline-offset-2 hover:text-ink-800">
              Back to log in
            </Link>
          </p>
        </div>
      </Container>
    </main>
  );
}
