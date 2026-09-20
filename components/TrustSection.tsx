import { trust } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { StudentCount } from "./StudentCount";
import { IconBook, IconLock, IconShield } from "./icons";

const icons = [IconBook, IconLock, IconShield];

export function TrustSection() {
  return (
    <section className="bg-ink-50 py-20 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-5xl font-extrabold tracking-tight text-ink-950 sm:text-6xl">
            <StudentCount format="number" />
          </p>
          <p className="mt-2 text-base font-semibold text-brand-700 sm:text-lg">Students Trained</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-500">{trust.studentProofNote}</p>
        </Reveal>

        <div className="mt-14">
          <SectionHeading eyebrow={trust.eyebrow} headline={trust.headline} subheadline={trust.subheadline} />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {trust.points.map((point, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Reveal
                key={point.title}
                delay={i * 70}
                className="rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-card"
              >
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-ink-50 text-ink-600">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-ink-900">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{point.description}</p>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
