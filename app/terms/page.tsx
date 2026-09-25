import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/course-data";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern enrollment in and use of the FX University course.",
};

// Content grounded in this codebase's actual behavior (checkout flow,
// discount codes, course-access model, the per-student "Licensed to"
// watermark on /learn, and the refund/chargeback -> access-revocation
// logic in lib/payments/access-activation.ts) — not invented from general
// templates. Deliberately does NOT state a specific governing-law
// jurisdiction, refund/cancellation entitlement, registered company name,
// or regulatory/licensing claim, since none of those are established
// anywhere in this repository. See the Batch 4B report for the full list
// of what could and couldn't be verified from the code.
const LAST_UPDATED = "September 25, 2026";

type Section = { heading: string; content: ReactNode[] };

const SECTIONS: Section[] = [
  {
    heading: "Acceptance of these Terms",
    content: [
      `By creating an account, enrolling in, or otherwise using ${siteConfig.name} (the "Service"), you agree to
      these Terms of Service ("Terms"). If you do not agree to these Terms, please do not create an account or
      use the Service.`,
    ],
  },
  {
    heading: "Eligibility and your account",
    content: [
      `You are responsible for the accuracy of the information you provide when creating an account, and for
      keeping your login credentials confidential. You are responsible for all activity that happens under your
      account. If you believe your account has been accessed without your permission, contact us using the
      details in "Contact us" below as soon as possible.`,
      `By using the Service, you confirm that you have the legal capacity to agree to these Terms.`,
    ],
  },
  {
    heading: "The educational nature of this course",
    content: [
      `${siteConfig.name} is an educational course about the foreign exchange (Forex) market. It is provided
      strictly for educational purposes. Nothing in the course, on this website, or communicated by us
      constitutes financial, investment, or trading advice, and nothing should be interpreted as a
      recommendation to buy, sell, or hold any financial instrument.`,
      `Trading Forex involves substantial risk, and no outcome — including any past educational example used in
      the course — is a guarantee or indication of future results. Section 13 ("Risk Disclaimer") below has more
      detail, and applies to your use of the Service in full.`,
    ],
  },
  {
    heading: "Course access and account security",
    content: [
      `Once your enrollment is confirmed, your account is granted access to the course for your own personal
      use. Access is tied to your individual account and may not be shared, transferred, or used by anyone
      other than you.`,
      `Course pages display a personal "Licensed to" notice showing your name and account email while you are
      signed in. This exists so that course materials remain individually licensed to the enrolled student —
      see "Intellectual property in course materials" below.`,
      `We use automated, server-side checks to confirm your access on every request. If your access is revoked
      (see "Suspension and termination" below), you will lose the ability to view course content until it is
      restored.`,
    ],
  },
  {
    heading: "Enrollment and payment",
    content: [
      `To enroll, you create an account and complete payment through the checkout flow on the Service. Payments
      are processed by a third-party payment provider (see "Payments" in our Privacy Policy) — we do not collect
      or store your full card or bank details ourselves.`,
      `An order is only confirmed, and course access only granted, once your payment has been independently
      verified with the payment provider. We do not treat a browser redirect back to our site, on its own, as
      proof that payment succeeded.`,
    ],
  },
  {
    heading: "Pricing and promotional pricing",
    content: [
      `The price shown to you at checkout is the price you will be charged. We may, at our discretion, offer
      promotional or discounted pricing for a limited time. When a promotional period ends, the course price
      returns to its regular price for new enrollments — this does not affect access you have already been
      granted.`,
      `We may change course pricing at any time. A price change does not affect an enrollment you have already
      paid for.`,
    ],
  },
  {
    heading: "Discount codes",
    content: [
      `We may issue discount codes that can be applied at checkout. Discount codes are subject to the specific
      conditions attached to that code (which may include an expiry date, a total redemption limit, and a limit
      on how many times a single customer may use it), are subject to verification at the time you use them,
      and may be changed, limited, or withdrawn at any time before they are redeemed.`,
    ],
  },
  {
    heading: "Intellectual property in course materials",
    content: [
      `All course content — including lessons, exercises, checklists, quizzes, and any other material made
      available to you through the Service — is the property of ${siteConfig.name} and is licensed, not sold,
      to you for your own personal, non-commercial use as an enrolled student.`,
      `You may not copy, reproduce, distribute, publicly share, resell, or create derivative works from course
      materials, in whole or in part, without our prior written permission. Course pages are watermarked with
      your name and account email specifically to identify materials as personally licensed to you.`,
    ],
  },
  {
    heading: "Acceptable use",
    content: [
      "When using the Service, you agree not to:",
    ],
  },
  {
    heading: "Testimonials and feedback",
    content: [
      `From time to time, feedback shared with us by a student may be displayed publicly on the Service as a
      testimonial, together with the name and any role or description associated with it. We only publish
      testimonials that we believe genuinely reflect feedback we have received, and we do not publish a
      testimonial as if it were real when it is not.`,
      `If you have concerns about feedback attributed to you, contact us using the details in "Contact us"
      below.`,
    ],
  },
  {
    heading: "Availability and changes to the Service",
    content: [
      `We may update, change, or improve any part of the Service — including course content, site features, and
      the checkout flow — at any time. We aim to keep the Service available, but we do not guarantee
      uninterrupted or error-free access, and access may occasionally be limited for maintenance or other
      reasons outside our control.`,
    ],
  },
  {
    heading: "Disclaimers and limitation of responsibility",
    content: [
      `The Service and its course content are provided on an "as is" and "as available" basis. To the fullest
      extent permitted by applicable law, we make no warranties, express or implied, about the Service or the
      results you may achieve from applying anything taught in the course.`,
      `You are solely responsible for any trading or financial decisions you make, whether or not informed by
      this course. To the fullest extent permitted by applicable law, ${siteConfig.name} is not liable for any
      trading losses, lost profits, or other financial outcome arising from your use of the course or any
      decision made in connection with it.`,
    ],
  },
  {
    heading: "Risk disclaimer",
    content: [
      <>
        Trading Forex carries a substantial risk of loss and may not be suitable for every individual. Our full
        Risk Disclaimer — covering leverage, the educational-only nature of this course, and the limitations of
        past examples — is set out in full on the course page and forms part of these Terms:{" "}
        <Link href="/risk-disclaimer" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700">
          read the Risk Disclaimer
        </Link>
        .
      </>,
    ],
  },
  {
    heading: "Suspension and termination",
    content: [
      "We may suspend or revoke your access to the course, including in the following circumstances:",
    ],
  },
  {
    heading: "Changes to these Terms",
    content: [
      `We may update these Terms from time to time. If we make a material change, we will take reasonable steps
      to make the updated Terms available on this page with a new "Last updated" date. Your continued use of the
      Service after an update takes effect means you accept the revised Terms.`,
    ],
  },
  {
    heading: "Contact us",
    content: [
      <>
        If you have questions about these Terms, contact us at{" "}
        <a
          href={`mailto:${siteConfig.supportEmail}`}
          className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700"
        >
          {siteConfig.supportEmail}
        </a>
        .
      </>,
    ],
  },
];

// A short, honest list — kept separate from the generic paragraph
// rendering above because these two sections read better as bullet lists.
// Both are grounded in this repo's actual access-control and
// course-access-revocation logic, not invented.
const ACCEPTABLE_USE_ITEMS = [
  "Share your account, login credentials, or course access with anyone else.",
  "Copy, download in bulk, redistribute, publicly post, or resell course materials.",
  "Attempt to bypass, disable, or interfere with the access controls that protect course content.",
  "Use the Service for any unlawful purpose, or in a way that could harm, disable, or impair it.",
  "Attempt to gain unauthorized access to another user's account or to any part of the Service you are not authorized to access.",
];

const TERMINATION_ITEMS = [
  "a breach of these Terms, including any of the acceptable-use restrictions above;",
  "fraudulent, unauthorized, or disputed payment activity on your account;",
  "a refund, dispute, or chargeback reported to us by our payment provider in connection with your order.",
];

function SectionBody({ section }: { section: Section }) {
  const isAcceptableUse = section.heading === "Acceptable use";
  const isTermination = section.heading === "Suspension and termination";
  return (
    <div className="mt-3 space-y-3">
      {section.content.map((node, i) => (
        <p key={i} className="text-sm leading-relaxed text-ink-500">
          {node}
        </p>
      ))}
      {isAcceptableUse ? (
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-500">
          {ACCEPTABLE_USE_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {isTermination ? (
        <>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-500">
            {TERMINATION_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed text-ink-500">
            Where access is revoked following a refund, dispute, or chargeback, this reflects the outcome
            reported to us by the payment provider — it is not, on its own, a promise of refund eligibility.
          </p>
        </>
      ) : null}
    </div>
  );
}

export default function TermsPage() {
  return (
    <main id="main-content" className="py-20 sm:py-24">
      <Container className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{siteConfig.name}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">Terms of Service</h1>
        <p className="mt-2 text-xs text-ink-400">Last updated: {LAST_UPDATED}</p>

        <p className="mt-6 text-sm leading-relaxed text-ink-500">
          These Terms of Service explain the rules for enrolling in and using the {siteConfig.name} course. They
          work alongside our{" "}
          <Link href="/privacy" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700">
            Privacy Policy
          </Link>{" "}
          and our Risk Disclaimer, referenced in Section 13 below.
        </p>

        <div className="mt-10 space-y-10">
          {SECTIONS.map((section, i) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold text-ink-900">
                {i + 1}. {section.heading}
              </h2>
              <SectionBody section={section} />
            </section>
          ))}
        </div>
      </Container>
    </main>
  );
}
