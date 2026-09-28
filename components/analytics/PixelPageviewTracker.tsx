"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// TypeScript has no built-in knowledge of window.fbq — it's injected at
// runtime by the Meta Pixel base snippet (see app/layout.tsx), never
// imported as a module. Narrow, local augmentation rather than a project-
// wide .d.ts: nothing else in this codebase needs to know fbq exists.
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Fires an additional Meta Pixel PageView on every CLIENT-SIDE route
 * change (e.g. clicking a <Link> from /course to /get-started, or between
 * the signup/login modes on /get-started). The base Pixel snippet in
 * app/layout.tsx only ever executes once, on the initial full document
 * load (it's a next/script with strategy="afterInteractive" mounted in the
 * root layout, not something that re-runs on a Next.js App Router soft
 * navigation) — without this, any visit that continues past the first page
 * via client-side navigation, rather than a full reload, would under-count
 * in Meta's PageView metric.
 *
 * Duplicate-PageView safety (the two things that make this NOT double-count
 * the very first pageview, which the base snippet already reported):
 *
 * 1. isFirstRender below. usePathname()'s value on this component's first
 *    mount is the SAME route the base snippet's own
 *    fbq('track', 'PageView') call already fired for. The effect
 *    deliberately no-ops on that first run and only starts actually calling
 *    fbq() from the SECOND distinct pathname onward — i.e. only for a
 *    genuine subsequent navigation, never for the page the user landed on.
 * 2. Mounted exactly once, in the root layout (app/layout.tsx), which
 *    every route in this app nests under — never re-mounted per-route, so
 *    isFirstRender's guard is never accidentally reset by navigating
 *    around the site.
 *
 * This only ever calls fbq('track', 'PageView') — a read-only,
 * side-effect-free-on-our-own-data call to Meta's own SDK. It does not
 * create, read, or touch any payment_events row, order, or any other
 * application state; the payment/CAPI side of this integration is
 * deliberately out of scope for this change.
 */
export function PixelPageviewTracker() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Defensive only — window.fbq is defined synchronously by the base
    // snippet's own IIFE the moment it runs, independent of whether the
    // actual fbevents.js network request succeeds (see app/layout.tsx), so
    // this should always be true by the time a SECOND navigation can even
    // happen. The one case it protects against: NEXT_PUBLIC_META_PIXEL_ID
    // unset, in which case app/layout.tsx renders no Pixel script at all
    // and window.fbq is never defined.
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  return null;
}
