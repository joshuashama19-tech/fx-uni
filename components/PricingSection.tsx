"use client";

import { useState } from "react";
import { pricing } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { Button } from "./ui/Button";
import { IconCheck, IconShield, IconArrowRight } from "./icons";

export function PricingSection() {
  const [coupon, setCoupon] = useState("");

  return (
    <section id="pricing" className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={pricing.eyebrow} headline={pricing.headline} subheadline={pricing.subheadline} />

        <Reveal delay={100} className="mx-auto mt-12 max-w-lg">
          <div className="rounded-3xl border border-ink-900 bg-ink-950 p-7 shadow-2xl sm:p-9">
            <div>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {pricing.currency}
                  {pricing.price}
                </span>
                {pricing.originalPrice ? (
                  <span className="text-lg text-ink-500 line-through">
                    {pricing.currency}
                    {pricing.originalPrice}
                  </span>
                ) : null}
                {pricing.discountLabel ? (
                  <span className="rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-white">
                    {pricing.discountLabel}
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-sm text-ink-400">{pricing.billingNote}</p>

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

              <Button
                href={pricing.ctaHref}
                size="lg"
                className="mt-7 w-full"
                icon={<IconArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
              >
                {pricing.ctaLabel}
              </Button>

              <div className="mt-5 flex items-start gap-2 text-xs text-ink-500">
                <IconShield className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{pricing.paymentNote}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
