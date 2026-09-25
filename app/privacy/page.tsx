import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/course-data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How FX University collects, uses, and protects your information.",
};

// Content grounded in this codebase's actual data model (the profiles /
// orders / course_access / payment_events / course_progress /
// lesson_completions / discount_code_redemptions tables and their RLS
// policies in supabase/migrations/), its actual dependency list
// (package.json — no analytics/tracking SDK of any kind), its actual
// cookie usage (only Supabase Auth's own session cookie, set in
// lib/supabase/server.ts), and its two actual payment providers (Paystack,
// Korapay — lib/payments/). Not invented from a generic template.
// Deliberately does NOT claim a specific data-retention period, a named
// analytics/advertising tool, or a data-protection-officer/regulatory
// contact, since none of those are established anywhere in this
// repository. See the Batch 4B report for the full list of what could and
// couldn't be verified from the code.
const LAST_UPDATED = "September 25, 2026";

type Section = { heading: string; content: ReactNode[] };

const SECTIONS: Section[] = [
  {
    heading: "Information we collect",
    content: [
      "We collect the information described below, either because you provide it directly or because it is generated automatically as you use the Service:",
    ],
  },
  {
    heading: "Account and authentication information",
    content: [
      `When you create an account, we collect your email address and, if you provide one, your full name. Account
      sign-in is handled by our authentication provider, Supabase, which manages your password and issues the
      session that keeps you signed in — we do not otherwise store your password ourselves.`,
    ],
  },
  {
    heading: "Course progress",
    content: [
      `While you are enrolled, we record which lesson you most recently opened (so the Service can offer to take
      you back to where you left off) and which lessons you have explicitly marked complete. This progress data is
      tied to your account and is used only to operate the course experience for you.`,
    ],
  },
  {
    heading: "Payment and order information",
    content: [
      `When you enroll, we create an order record containing the course price, currency, any discount code applied
      and the resulting discount amount, the order's status (for example pending, successful, refunded, or
      disputed), and a reference issued by our payment provider. We do not collect or store your full card or bank
      account details ourselves — those are entered directly with our payment provider and are never sent to or
      held by our own systems.`,
      `We also keep a record of the events our payment provider reports to us about a payment (such as
      confirmation of success, a refund, or a dispute), which we use to verify payments and to determine whether
      your course access should be granted or revoked.`,
    ],
  },
  {
    heading: "Testimonials",
    content: [
      `Testimonials shown on the Service are added by us, based on feedback we have received — the Service does
      not have a public form for submitting a testimonial yourself. If a testimonial is published in connection
      with feedback you gave us, it may include your name and a role or description you are associated with.`,
    ],
  },
  {
    heading: "Support and contact information",
    content: [
      `If you contact us for support (for example by email), we will have access to whatever information you
      choose to include in that message, so that we can respond to you.`,
    ],
  },
  {
    heading: "How we use your information",
    content: [
      "We use the information described above to:",
    ],
  },
  {
    heading: "Cookies and similar technologies",
    content: [
      `The Service uses a single cookie set by our authentication provider, Supabase, to keep you signed in and to
      recognize your session on later visits. This cookie is necessary for the Service to function — for example,
      to know that you are the enrolled student before showing you course content.`,
      `We do not use advertising cookies, and the Service does not include any third-party analytics or tracking
      code.`,
    ],
  },
  {
    heading: "Service providers we use",
    content: [
      `We rely on a small number of third-party service providers to operate the Service, each of which processes
      certain information on our behalf as described above:`,
    ],
  },
  {
    heading: "How we protect your information",
    content: [
      `Access to your account data, course-progress data, and order data is restricted by database-level access
      controls: as a signed-in student, you can only read your own records, and privileged changes (such as
      granting or revoking course access, or updating an order's status) can only be made by trusted, server-side
      systems — never directly by a browser request, whether yours or anyone else's.`,
      `Payment card and bank details are handled entirely by our payment providers and never pass through or rest
      on our own servers.`,
    ],
  },
  {
    heading: "Sharing and disclosure",
    content: [
      `We do not sell your personal information. We share information only with the service providers described
      above, to the extent needed for them to perform their role (for example, sharing your email and the amount
      due with our payment provider so it can process your payment), or where we are required to do so by law.`,
    ],
  },
  {
    heading: "Your choices",
    content: [
      `You can review and update certain account details (such as your name) directly from your account. If you
      would like to access, correct, or request deletion of information we hold about you, contact us using the
      details in "Contact us" below and we will respond to your request.`,
      `Because course access, order history, and progress records exist to support the course you enrolled in,
      deleting your account may mean we can no longer provide that access.`,
    ],
  },
  {
    heading: "Children's privacy",
    content: [
      `The Service is intended for adults and is not directed to children. We do not knowingly collect information
      from children.`,
    ],
  },
  {
    heading: "Changes to this policy",
    content: [
      `We may update this Privacy Policy from time to time. If we make a material change, we will take reasonable
      steps to make the updated policy available on this page with a new "Last updated" date. Your continued use
      of the Service after an update takes effect means you accept the revised policy.`,
    ],
  },
  {
    heading: "Contact us",
    content: [
      <>
        If you have questions about this Privacy Policy, or would like to make a request about your information,
        contact us at{" "}
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

// Kept as bullet lists rather than paragraphs — both are grounded directly
// in this repo's own code paths (lib/progress/*, lib/payments/*,
// lib/discounts.ts, lib/supabase/server.ts), not invented.
const USES_ITEMS = [
  "create your account and let you sign in securely;",
  "grant and verify your access to the course you enrolled in;",
  "process your enrollment payment and keep an accurate record of your order, including any discount code applied;",
  "save and restore your course progress, including your most recently viewed lesson and your completed lessons;",
  "respond to support requests you send us;",
  "detect and prevent fraudulent or unauthorized payment activity, including acting on refunds, disputes, or chargebacks reported to us by our payment provider.",
];

const PROVIDERS_ITEMS = [
  <>
    <span className="font-medium text-ink-700">Supabase</span> — hosts our database and provides account
    authentication (sign-up, sign-in, and session management).
  </>,
  <>
    <span className="font-medium text-ink-700">Paystack</span> — processes enrollment payments.
  </>,
  <>
    <span className="font-medium text-ink-700">Korapay</span> — processes enrollment payments for a subset of
    checkouts.
  </>,
];

function SectionBody({ section }: { section: Section }) {
  const isUses = section.heading === "How we use your information";
  const isProviders = section.heading === "Service providers we use";
  return (
    <div className="mt-3 space-y-3">
      {section.content.map((node, i) => (
        <p key={i} className="text-sm leading-relaxed text-ink-500">
          {node}
        </p>
      ))}
      {isUses ? (
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-500">
          {USES_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {isProviders ? (
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-500">
          {PROVIDERS_ITEMS.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main id="main-content" className="py-20 sm:py-24">
      <Container className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{siteConfig.name}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">Privacy Policy</h1>
        <p className="mt-2 text-xs text-ink-400">Last updated: {LAST_UPDATED}</p>

        <p className="mt-6 text-sm leading-relaxed text-ink-500">
          This Privacy Policy explains what information {siteConfig.name} collects when you create an account and
          enroll in the course, and how that information is used. It works alongside our{" "}
          <Link href="/terms" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700">
            Terms of Service
          </Link>
          .
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
