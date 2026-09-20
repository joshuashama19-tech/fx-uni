import Link from "next/link";
import { siteConfig } from "@/lib/course-data";

// Placeholder for the future FX University homepage. Out of scope for this
// phase — the paid course sales page lives at /course. This page exists
// only so "/" isn't a 404 and clearly points visitors to /course today.
export default function HomePage() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center bg-white px-5 py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-950 text-lg font-extrabold text-white">
        {siteConfig.shortName.slice(0, 2)}
      </span>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">{siteConfig.name}</h1>
      <p className="mt-3 max-w-md text-balance text-base leading-relaxed text-ink-500">
        The main site is still being built. In the meantime, the Forex course is live.
      </p>
      <Link
        href="/course"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-glow transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-700"
      >
        View the Forex Course
      </Link>
    </main>
  );
}
