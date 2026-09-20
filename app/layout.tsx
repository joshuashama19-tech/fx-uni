import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/course-data";

// Brand typeface: Montserrat, weights 400/500/600/700/800 per the brand spec.
// Exposed as a CSS variable and wired into Tailwind's `font-sans` so every
// existing `font-*` utility class keeps working without touching components.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

// Generic, site-wide defaults. The `/course` route (the only page that
// exists today) overrides this with course-specific metadata in
// `app/course/layout.tsx`. Keep this minimal — it's what a future
// homepage or any other top-level route inherits.
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="flex min-h-screen flex-col bg-white font-sans text-ink-800">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink-900 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}


