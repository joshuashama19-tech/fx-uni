import Image from "next/image";
import { testimonials } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { IconCheckCircle } from "./icons";

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={testimonials.eyebrow}
          headline={testimonials.headline}
          subheadline={testimonials.subheadline}
        />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {testimonials.items.map((t, i) => (
            <Reveal
              key={`${t.name}-${i}`}
              delay={i * 80}
              className="relative flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6 shadow-card"
            >
              {t.placeholder ? (
                <span className="absolute right-4 top-4 rounded-full bg-ink-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                  Placeholder
                </span>
              ) : null}

              <div className="flex items-center gap-3">
                {t.photo ? (
                  <Image
                    src={t.photo}
                    alt={t.name}
                    width={44}
                    height={44}
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink-100 text-sm font-semibold text-ink-400">
                    ?
                  </span>
                )}
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                    {t.name}
                    {t.verified ? (
                      <IconCheckCircle className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-label="Verified student" />
                    ) : null}
                  </p>
                  <p className="text-xs text-ink-400">{t.location}</p>
                </div>
              </div>

              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-600">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 text-xs text-ink-400">{t.date}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
