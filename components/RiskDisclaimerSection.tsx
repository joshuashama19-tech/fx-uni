import { riskDisclaimer } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { IconAlert } from "./icons";

export function RiskDisclaimerSection() {
  return (
    <section id="risk-disclaimer" className="bg-ink-50 py-16 sm:py-20">
      <Container>
        <Reveal className="mx-auto max-w-3xl rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
              <IconAlert className="h-5 w-5" />
            </span>
            <h2 className="text-base font-semibold text-ink-900 sm:text-lg">{riskDisclaimer.headline}</h2>
          </div>
          <div className="mt-4 space-y-3">
            {riskDisclaimer.body.map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-ink-500">
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
