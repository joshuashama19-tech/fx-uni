import { socialProofStats } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";

/**
 * Premium stats/social-proof strip (Final Promotion + Social Proof Pass,
 * req. #1/#11) — placed just after the trust section, near the top of the
 * page. Every figure is a real product fact (see lib/course-data.ts's
 * socialProofStats); deliberately no fabricated ratings, live-visitor
 * counts, or purchase activity.
 */
export function SocialProofSection() {
  return (
    <section className="border-y border-ink-100 bg-white py-14 sm:py-16">
      <Container>
        <Reveal className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-500">
            {socialProofStats.headline}
          </p>
        </Reveal>

        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-y-0">
          {socialProofStats.stats.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 60}
              className={`flex flex-col items-center text-center ${
                i > 0 ? "sm:border-l sm:border-ink-100" : ""
              }`}
            >
              <span className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">{stat.value}</span>
              <span className="mt-1.5 text-xs font-medium uppercase tracking-wide text-ink-500 sm:text-sm">
                {stat.label}
              </span>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
