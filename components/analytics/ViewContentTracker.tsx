"use client";

import { useEffect, useRef } from "react";

// See PixelPageviewTracker.tsx for why this augmentation exists — repeated
// here rather than shared, since these are two separate client bundles and
// neither has any other reason to import from the other.
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Fires a Meta Pixel ViewContent event once, when the course sales page
 * (/course) mounts. Deliberately separate from PixelPageviewTracker (which
 * only ever fires PageView) — ViewContent is a distinct funnel step Meta's
 * own reporting tracks on its own, matching "a visitor is looking at the
 * product" rather than "a visitor loaded any page".
 *
 * No value/currency here: per the funnel implementation plan, ViewContent
 * intentionally carries no monetary value — that only enters the funnel at
 * InitiateCheckout/Purchase, once a real order (and therefore a real,
 * server-resolved price) exists. courseId/contentName are passed in from
 * app/course/page.tsx (a Server Component, so it can call the server-only
 * getCourseId()/siteConfig directly) rather than re-derived here.
 *
 * Fires unconditionally, with no is_test gating — this mirrors
 * PixelPageviewTracker's/the base Pixel snippet's own existing behavior
 * (fires for every visitor, admin/test accounts included), and this page
 * has no auth context to gate on in the first place. Only the Purchase
 * event (browser + CAPI, see PurchaseTracker.tsx and
 * lib/payments/access-activation.ts) is excluded for a test-mode order —
 * that's the one event with real financial meaning.
 *
 * Guarded by a mount-once ref so React StrictMode's intentional dev-mode
 * double-invoke never fires this twice — the same defensive shape as
 * PixelPageviewTracker's isFirstRender guard, adapted for "fire once ever"
 * instead of "skip once".
 */
export function ViewContentTracker({ courseId, contentName }: { courseId: string; contentName: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "ViewContent", {
        content_name: contentName,
        content_type: "product",
        content_ids: [courseId],
      });
    }
  }, [courseId, contentName]);

  return null;
}
