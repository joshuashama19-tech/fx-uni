import { createClient } from "@/lib/supabase/server";
import type { FaqRow } from "@/lib/types";
import { faq as faqCopy } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { FAQAccordion } from "./FAQAccordion";

/**
 * FAQ items are admin-managed (supabase/migrations/0005_admin_cms.sql,
 * app/admin/faqs) — heading copy stays in lib/course-data.ts like every
 * other section heading. Uses the public RLS-scoped client, so only
 * is_active = true rows are ever readable here regardless of what this
 * code does (see the faqs_select_published policy).
 */
async function getPublishedFaqs(): Promise<FaqRow[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("faqs").select("*").order("display_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function FAQSection() {
  const items = await getPublishedFaqs();
  if (items.length === 0) return null;

  return (
    <section id="faq" className="bg-ink-50 py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={faqCopy.eyebrow} headline={faqCopy.headline} />
        <FAQAccordion items={items} />
      </Container>
    </section>
  );
}
