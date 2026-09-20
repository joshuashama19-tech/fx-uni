import { audienceFit } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { IconCheckCircle, IconX } from "./icons";

export function AudienceFitSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal className="rounded-2xl border border-brand-200 bg-brand-50/60 p-7 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white">
                <IconCheckCircle className="h-5 w-5" />
              </span>
              <h3 className="text-xl font-semibold text-ink-900">{audienceFit.forYou.headline}</h3>
            </div>
            <ul className="mt-6 space-y-4">
              {audienceFit.forYou.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink-700 sm:text-base">
                  <IconCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={100} className="rounded-2xl border border-ink-200 bg-ink-50/60 p-7 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-700 text-white">
                <IconX className="h-5 w-5" />
              </span>
              <h3 className="text-xl font-semibold text-ink-900">{audienceFit.notForYou.headline}</h3>
            </div>
            <ul className="mt-6 space-y-4">
              {audienceFit.notForYou.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink-600 sm:text-base">
                  <IconX className="mt-0.5 h-5 w-5 shrink-0 text-ink-400" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
