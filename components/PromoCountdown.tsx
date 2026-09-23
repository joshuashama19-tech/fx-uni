"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function getRemaining(endsAt: number): Remaining | null {
  const diff = endsAt - Date.now();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/**
 * Ticks down to a real, admin-configured end time (see /admin/pricing).
 * Always computed as `endsAt - now()`, never a fixed local duration, so it
 * reflects the actual configured end time and never resets on refresh.
 *
 * The price/discount themselves are still decided server-side on every
 * request (lib/pricing.ts) — this is purely a display countdown. When it
 * reaches zero, it asks Next.js to re-render from the server once, so the
 * promotional price/badge/countdown actually disappear rather than a stale
 * client view lingering after the real expiry.
 */
export function PromoCountdown({ endsAt, label }: { endsAt: string; label: string }) {
  const endsAtMs = new Date(endsAt).getTime();
  // Starts null on both server and client (never computed during the
  // initial render) so hydration always matches — the real countdown fills
  // in a moment after mount, entirely client-side.
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const [expired, setExpired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      const next = getRemaining(endsAtMs);
      setRemaining(next);
      if (next === null) {
        setExpired(true);
        router.refresh();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endsAtMs, router]);

  if (expired || !remaining) return null;

  const boxes: { value: number; unit: string }[] = [
    { value: remaining.days, unit: "d" },
    { value: remaining.hours, unit: "h" },
    { value: remaining.minutes, unit: "m" },
    { value: remaining.seconds, unit: "s" },
  ];

  return (
    <div className="mt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
      <div className="mt-2 flex gap-2">
        {boxes.map((box) => (
          <div
            key={box.unit}
            className="flex min-w-[3.25rem] flex-col items-center rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2"
          >
            <span className="text-lg font-bold tabular-nums text-white">{String(box.value).padStart(2, "0")}</span>
            <span className="text-[10px] uppercase text-ink-400">{box.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
