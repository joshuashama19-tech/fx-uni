import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { RiskDisclaimerSection } from "@/components/RiskDisclaimerSection";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/course-data";

export const metadata: Metadata = {
  title: "Risk Disclaimer",
  description: "The risks of trading Forex, and the educational-only nature of the FX University course.",
};

// Dedicated page for the footer's "Risk Disclaimer" link (lib/course-data.ts's
// footer.columns), replacing the previous /course#risk-disclaimer anchor now
// that RiskDisclaimerSection is no longer mounted on the /course sales page
// (see Batch 4C). Reuses the existing RiskDisclaimerSection component and its
// underlying `riskDisclaimer` content from lib/course-data.ts as-is — the
// disclaimer wording itself is defined in exactly one place in the codebase,
// same as before. This page adds only a short page header (matching the
// eyebrow + H1 pattern used on /terms and /privacy) around that same,
// unmodified component.
//
// Unlike /terms and /privacy (which render without the site Header/Footer),
// this page includes the existing site <Footer /> per req. #8, so a visitor
// who lands here directly still has the same footer navigation available.
export default function RiskDisclaimerPage() {
  return (
    <>
      <main id="main-content" className="flex-1 py-20 sm:py-24">
        <Container className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{siteConfig.name}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">Risk Disclaimer</h1>
          <p className="mt-6 text-sm leading-relaxed text-ink-500">
            This Risk Disclaimer applies to your use of the {siteConfig.name} course and forms part of our{" "}
            <Link href="/terms" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700">
              Terms of Service
            </Link>
            .
          </p>
        </Container>

        <div className="mt-10">
          <RiskDisclaimerSection />
        </div>
      </main>
      <Footer />
    </>
  );
}
