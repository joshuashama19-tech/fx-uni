import { createClient } from "@/lib/supabase/server";
import type { TestimonialRow } from "@/lib/types";
import { testimonials as testimonialsCopy } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

/**
 * Testimonial ITEMS are admin-managed (supabase/migrations/0005_admin_cms.sql
 * + app/admin/testimonials) — the section headline/subheadline stay as
 * design copy in lib/course-data.ts, same as every other section heading on
 * the page.
 *
 * The query below is the public, RLS-scoped client (lib/supabase/server.ts),
 * not the service-role admin client — the database itself enforces that only
 * `is_active = true and is_placeholder = false` rows are readable here (see
 * the testimonials_select_published policy), so this component can't
 * accidentally leak a draft or placeholder even if this code had a bug.
 *
 * Per spec: never invent or auto-publish testimonials. If no genuine,
 * published testimonial exists yet, this renders nothing at all — no
 * placeholder cards — rather than showing fake social proof.
 */
async function getPublishedTestimonials(): Promise<TestimonialRow[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("display_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function TestimonialsSection() {
  const items = await getPublishedTestimonials();
  if (items.length === 0) return null;

  return (
    <section id="testimonials" className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={testimonialsCopy.eyebrow}
          headline={testimonialsCopy.headline}
          subheadline={testimonialsCopy.subheadline}
        />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {items.map((t, i) => (
            <Reveal
              key={t.id}
              delay={i * 80}
              className="relative flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6 shadow-card"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {t.student_name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{t.student_name}</p>
                  {t.role_title ? <p className="text-xs text-ink-400">{t.role_title}</p> : null}
                </div>
              </div>

              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-600">&ldquo;{t.quote}&rdquo;</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
