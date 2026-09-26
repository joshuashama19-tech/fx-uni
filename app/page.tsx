import { siteConfig } from "@/lib/course-data";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IconArrowRight, IconChart, IconCandles, IconShield, IconTarget } from "@/components/icons";

// The real FX University homepage. Replaces the earlier "main site is still
// being built" placeholder now that /course (the paid course page) is
// stable. Deliberately self-contained and scoped to ONLY what a homepage
// needs — branding, headline, a "what you'll learn" summary, and links out
// to /course and /login — so it never touches /course's own pricing, copy,
// or the checkout/auth/course-access logic those pages own. Written fresh
// rather than importing lib/course-data's `hero`/`benefits`/`curriculum`
// (those remain /course's own content, unchanged), so nothing here can ever
// drift the sales page's copy just because this page's copy changes later.

const learnTopics = [
  {
    title: "Market Fundamentals",
    description: "How currency pairs, pricing, and trade execution actually work.",
    Icon: IconChart,
  },
  {
    title: "Reading Charts",
    description: "Recognize trends, ranges, and key support and resistance levels with confidence.",
    Icon: IconCandles,
  },
  {
    title: "Risk Management",
    description: "Protect your capital with a structured approach to position sizing and risk.",
    Icon: IconShield,
  },
  {
    title: "A Real Trading Plan",
    description: "Move from reacting to the market to trading with a clear, repeatable process.",
    Icon: IconTarget,
  },
];

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Hero — branding, headline, description, and the two required entry
          points (course / log in), on the same dark treatment /course's own
          hero uses for visual consistency. */}
      <section className="relative overflow-hidden bg-ink-950">
        <div className="pointer-events-none absolute inset-0 bg-grid grid-fade-mask opacity-60" aria-hidden />
        <Container className="relative flex flex-col items-center py-20 text-center sm:py-28">
          <Reveal className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-extrabold text-ink-950">
              {siteConfig.shortName.slice(0, 2)}
            </span>
            <span className="text-base font-semibold text-white sm:text-lg">{siteConfig.name}</span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mx-auto mt-8 max-w-2xl text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
              Learn Forex the structured way.
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-ink-300 sm:text-lg">
              A beginner-friendly, step-by-step Forex course — no scattered videos, no guesswork. Just a clear
              path from the fundamentals to a real trading process.
            </p>
          </Reveal>

          {/* Rendered plainly (no Reveal opacity gate) — same reasoning as
              /course's own hero CTA row: primary conversion buttons should
              never depend on animation/hydration timing to become visible. */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              href="/course"
              size="lg"
              icon={<IconArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
            >
              Get the Forex Course
            </Button>
            <Button href="/login" variant="ghost" size="lg">
              Log In
            </Button>
          </div>
        </Container>
      </section>

      {/* What students learn — concise, four items, matches /course's own
          card pattern (icon + title + description) without importing any of
          its content. */}
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="What You'll Learn" headline="A clear, structured path into Forex." />

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {learnTopics.map((topic, i) => (
              <Reveal
                key={topic.title}
                delay={(i % 4) * 60}
                className="rounded-2xl border border-ink-100 bg-white p-5 transition-colors duration-200 hover:border-brand-200 hover:bg-brand-50/40 sm:p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-950 text-brand-300">
                  <topic.Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-ink-900 sm:text-base">{topic.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{topic.description}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA — the one other required entry point into /course. */}
      <section className="bg-ink-950 py-20 sm:py-24">
        <Container className="text-center">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Ready to start learning?
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="mx-auto mt-4 max-w-xl text-balance text-base leading-relaxed text-ink-300 sm:text-lg">
              Get full access to the structured Forex course built for beginners.
            </p>
          </Reveal>
          <Reveal delay={160} className="mt-8">
            <Button
              href="/course"
              size="lg"
              icon={<IconArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
            >
              Get Course Access
            </Button>
          </Reveal>
        </Container>
      </section>

      <footer className="border-t border-ink-100 bg-white py-8 text-center">
        <p className="text-xs text-ink-400">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
