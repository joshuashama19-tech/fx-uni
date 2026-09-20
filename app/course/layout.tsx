import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/course-data";

// Course-specific metadata (title/description/OG/Twitter/keywords). This
// overrides the generic defaults from the root layout for every page under
// /course. Moved here (rather than the root layout) so a future homepage
// at "/" doesn't inherit course-sales-page copy in its <title>/meta tags.
export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Learn Forex the Structured Way`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "A structured, beginner-friendly Forex education course. Learn how the market works, read charts, manage risk, and build a disciplined trading plan — step by step.",
  keywords: [
    "forex course",
    "learn forex",
    "forex for beginners",
    "forex education",
    "trading psychology",
    "risk management course",
  ],
  alternates: {
    canonical: "/course",
  },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/course`,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Learn Forex the Structured Way`,
    description:
      "A structured, beginner-friendly Forex education course covering fundamentals, charts, risk management, psychology, and building your own trading plan.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Learn Forex the Structured Way`,
    description:
      "A structured, beginner-friendly Forex education course covering fundamentals, charts, risk management, psychology, and building your own trading plan.",
    images: ["/og-image.svg"],
  },
};

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
