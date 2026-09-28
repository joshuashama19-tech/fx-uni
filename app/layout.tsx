import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";
import "./globals.css";
import { siteConfig } from "@/lib/course-data";
import { PixelPageviewTracker } from "@/components/analytics/PixelPageviewTracker";

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The per-request CSP nonce middleware.ts generates and threads through
  // via the x-nonce request header (see lib/security-headers.ts and
  // lib/supabase/middleware.ts's updateSession(), which forwards it into
  // the render pipeline via NextResponse.next({request:{headers:...}})).
  // Next's own RSC-hydration scripts already read this same nonce back out
  // of the Content-Security-Policy response header value automatically;
  // this is the one place app code needs to read it directly, to hand it to
  // the Meta Pixel <Script> below the same way.
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  // Fails closed: no Pixel ID configured (e.g. local dev without
  // .env.local set) means no Pixel script and no noscript fallback are
  // rendered at all — never an fbq('init', undefined) call. Matches this
  // codebase's existing convention of failing closed on missing required
  // config (see lib/pricing.ts's resolvePricing()).
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <html lang="en" className={montserrat.variable}>
      <body className="flex min-h-screen flex-col bg-white font-sans text-ink-800">
        {/*
          Meta Pixel base code — mounted here, at the top of <body> in the
          root layout, so it loads on every route in the app (this is the
          one layout every route nests under) and follows Meta's own
          documented placement ("immediately after the opening body tag").

          CSP: script-src uses Next's documented nonce + 'strict-dynamic'
          pattern (lib/security-headers.ts) — the `nonce` prop below is what
          lets this script run at all, and 'strict-dynamic' is what lets it
          dynamically insert the actual fbevents.js <script> tag without
          connect.facebook.net needing a separate script-src allowlist
          entry. The Pixel's own tracking calls (and the <noscript>
          fallback image right below) are a different CSP concern —
          connect-src/img-src — already widened for
          https://www.facebook.com in lib/security-headers.ts; script-src
          was deliberately left untouched (verified, not assumed — see that
          file's comment).

          PageView firing: the fbq('track','PageView') call below fires
          once, for the initial full document load only. Any PageView from
          a later CLIENT-SIDE route change (a <Link> navigation that Next
          handles without a full reload) is fired separately by
          <PixelPageviewTracker/> below, which deliberately skips its own
          first run so this initial call is never double-counted — see that
          component's own doc comment for the full reasoning.
        */}
        {metaPixelId ? (
          <>
            <Script id="meta-pixel-base" strategy="afterInteractive" nonce={nonce}>
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${metaPixelId}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element -- Meta's documented noscript fallback pixel must be a plain <img>, not next/image. */}
              <img
                height="1"
                width="1"
                alt=""
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              />
            </noscript>
            <PixelPageviewTracker />
          </>
        ) : null}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink-900 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        {/*
          Defense-in-depth for components/ui/Reveal.tsx: it renders at
          opacity:0 until client JS confirms the element via
          IntersectionObserver, so content it wraps is only ever made
          visible by hydration completing successfully. That's exactly
          the failure mode this app just hit in production (a CSP nonce
          bug briefly broke hydration sitewide) — nothing about Reveal
          itself caused it, but nothing about Reveal protected against it
          either. <noscript> only ever renders when JavaScript is
          disabled entirely (a real hydration failure is invisible to
          CSS, so this can't catch every case), but it's a real, free
          safety net for that specific case: force every .reveal element
          fully visible rather than leaving it permanently blank.
        */}
        <noscript>
          <style>{`.reveal { opacity: 1 !important; animation: none !important; }`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}

