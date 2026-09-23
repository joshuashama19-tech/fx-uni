"use client";

import { useState } from "react";
import { Reveal } from "./ui/Reveal";
import { Button } from "./ui/Button";
import { IconCheck } from "./icons";
import { pricing } from "@/lib/course-data";
import { PromoCountdown } from "./PromoCountdown";
import type { PricingState } from "@/lib/pricing";

type PricingCardProps = {
  pricingState: PricingState;
  billingNote: string;
};

/**
 * Pure presentation/interaction (the coupon input's local state). The
 * pricing state itself is resolved server-side (components/PricingSection.tsx
 * -> lib/pricing.ts's resolvePricing()) and passed in whole — this component
 * never re-derives or overrides any part of it. Whatever it shows here is
 * exactly what checkout will charge.
 */
export function PricingCard({ pricingState, billingNote }: PricingCardProps) {
  const [coupon, setCoupon] = useState("");
  const promo = pricingState.isPromoActive;

  return (
    <Reveal delay={100} className="mx-auto mt-12 max-w-lg">
      {/* bg-ink-900 (not -950) + shadow-glow so the card still reads as a
          distinct card now that PricingSection's own background is dark
          too (Final Premium Landing Page Redesign, req. #10) — visual only,
          no change to any pricing value or logic below. */}
      <div className="rounded-3xl border border-white/10 bg-ink-900 p-7 shadow-glow sm:p-9">
        <div>
          {promo ? (
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-400">
              {pricingState.promotionTitle}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-baseline gap-3">
            {promo ? (
              <span className="text-lg font-medium text-ink-500 line-through">
                {pricingState.regularPriceFormatted}
              </span>
            ) : null}
            <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {pricingState.payableFormatted}
            </span>
            {promo ? (
              <span className="rounded-full bg-brand-600 px-3 py-1 text-sm font-bold text-white">
                {pricingState.discountPercent}% OFF
              </span>
            ) : null}
          </div>

          {promo ? (
            <p className="mt-1.5 text-sm font-semibold text-brand-300">Save {pricingState.savingsFormatted}</p>
          ) : null}

          <p className="mt-1.5 text-sm text-ink-400">{billingNote}</p>

          {promo && pricingState.promotionSubtext ? (
            <p className="mt-3 text-sm leading-relaxed text-ink-400">{pricingState.promotionSubtext}</p>
          ) : null}

          {promo && pricingState.countdownEnabled && pricingState.endsAt ? (
            <PromoCountdown endsAt={pricingState.endsAt} label="Special enrollment offer ends in" />
          ) : null}

          <ul className="mt-7 space-y-3">
            {pricing.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-ink-100 sm:text-base">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-7">
            <label htmlFor="coupon" className="mb-2 block text-xs font-medium text-ink-400">
              {pricing.couponPlaceholder}
            </label>
            <div className="flex gap-2">
              <input
                id="coupon"
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Enter code"
                className="w-full rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-ink-500 focus-visible:border-brand-400"
              />
              <button
                type="button"
                className="shrink-0 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-ink-200 transition hover:bg-white/10"
              >
                Apply
              </button>
            </div>
          </div>

          <Button href={pricing.ctaHref} size="lg" className="mt-7 w-full">
            {pricing.ctaLabel}
          </Button>

          <p className="mt-5 text-center text-xs text-ink-500">
            {billingNote} &middot; Secure Paystack checkout &middot; Private student access
          </p>
        </div>
      </div>
    </Reveal>
  );
}
