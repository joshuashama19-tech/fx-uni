import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/course-data";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service placeholder.",
};

export default function TermsPage() {
  return (
    <main id="main-content" className="py-20 sm:py-24">
      <Container className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{siteConfig.name}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">Terms of Service</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-500">
          This page is a placeholder. The full terms of service — covering enrollment, access, and course use —
          will be added here before launch.
        </p>
      </Container>
    </main>
  );
}
