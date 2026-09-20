import Link from "next/link";
import type { LessonRef } from "@/lib/course-content";
import { IconArrowRight } from "@/components/icons";

// Dark card matching the site's existing black/red premium treatment (same
// bg-ink-950 + brand-600 pairing used by PricingCard) — deliberately the
// one visually "loud" element on an otherwise white-dominant dashboard,
// since it's the single most important action on the page.
export function ContinueLearningCard({ target }: { target: LessonRef }) {
  return (
    <Link
      href={`/learn/${target.moduleSlug}/${target.lessonSlug}`}
      className="group flex items-center justify-between gap-4 rounded-2xl bg-ink-950 p-6 transition-colors hover:bg-ink-900"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">Continue Learning</p>
        <p className="mt-2 text-base font-semibold text-white sm:text-lg">
          Module {target.moduleOrder} — {target.moduleTitle}
        </p>
        <p className="mt-1 text-sm text-ink-300">
          Lesson {target.lessonOrder} — {target.lessonTitle}
        </p>
      </div>
      <IconArrowRight className="h-5 w-5 flex-none text-white transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
