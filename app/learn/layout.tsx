import type { ReactNode } from "react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { requireCourseAccess, ServiceUnavailableError } from "@/lib/access";
import { signOutAction } from "@/lib/auth/actions";
import { siteConfig } from "@/lib/course-data";
import { Container } from "@/components/ui/Container";

// The protected shell for every /learn route. requireCourseAccess() is the
// server-side authorization check (see lib/access.ts) — it runs on every
// request to this layout, so a revoked student is rejected on their very
// next navigation, not just their next login, and there is no client-side
// code anywhere that could be bypassed to see course content.
export default async function LearnLayout({ children }: { children: ReactNode }) {
  try {
    const { user, profile } = await requireCourseAccess();
    const displayName = profile?.full_name || user.email || "Student";

    return (
      <div className="min-h-screen bg-white">
        {/* Student watermark: subtle, always present, never blocks reading. */}
        <div className="bg-ink-50 py-1.5 text-center text-[11px] text-ink-400">
          Licensed to: {displayName} · {user.email}
        </div>

        <header className="border-b border-ink-100">
          <Container className="flex h-16 items-center justify-between">
            <Link href="/learn" className="text-sm font-semibold tracking-tight text-ink-950">
              {siteConfig.name}
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link href="/learn/resources" className="text-ink-500 hover:text-ink-900">
                Resource Library
              </Link>
              <Link href="/account" className="text-ink-500 hover:text-ink-900">
                Account
              </Link>
              <form action={signOutAction}>
                <button type="submit" className="text-ink-500 hover:text-ink-900">
                  Log out
                </button>
              </form>
            </nav>
          </Container>
        </header>

        <Container className="py-8 sm:py-12">{children}</Container>
      </div>
    );
  } catch (err) {
    // requireCourseAccess() uses next/navigation's redirect() for the
    // unauthenticated/no_access/revoked cases, which works by throwing a
    // special control-flow error that must propagate up uncaught. Without
    // this, the catch below would swallow that redirect instead of letting
    // it happen.
    unstable_rethrow(err);
    if (err instanceof ServiceUnavailableError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-white px-5">
          <div className="max-w-sm text-center">
            <h1 className="text-lg font-semibold text-ink-950">Temporarily unavailable</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              We couldn&apos;t confirm your course access right now. This is usually temporary — please refresh
              the page in a moment. If it persists, contact support.
            </p>
            <Link
              href="/learn"
              className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Try again
            </Link>
          </div>
        </div>
      );
    }
    throw err;
  }
}
