import { IconCandles, IconTarget, IconShield } from "./icons";

/**
 * Purely decorative, hand-drawn chart visual for the hero section.
 * Not a real screenshot or performance claim — abstract brand artwork only.
 * Uses a neutral white line (not green) so it never reads as an implied
 * profit/gain claim.
 */
export function HeroChartCard() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="rounded-2xl border border-white/10 bg-ink-950 p-5 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-ink-300">
            <IconCandles className="h-4 w-4 text-brand-400" aria-hidden />
            EUR/USD &middot; Educational Example
          </div>
          <span className="rounded-full bg-brand-600/15 px-2.5 py-1 text-[11px] font-semibold text-brand-300">
            Structure
          </span>
        </div>

        <svg viewBox="0 0 320 160" className="mt-5 h-36 w-full sm:h-44" aria-hidden="true">
          <defs>
            <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e50914" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#e50914" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1="0" x2="320" y1={20 + i * 35} y2={20 + i * 35} stroke="white" strokeOpacity="0.06" />
          ))}
          <path
            d="M0 120 L30 108 L55 128 L80 96 L110 104 L140 70 L170 84 L200 52 L230 60 L260 32 L290 40 L320 18"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M0 120 L30 108 L55 128 L80 96 L110 104 L140 70 L170 84 L200 52 L230 60 L260 32 L290 40 L320 18 L320 160 L0 160 Z"
            fill="url(#heroFill)"
            stroke="none"
          />
        </svg>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3 py-2.5">
            <IconTarget className="h-4 w-4 shrink-0 text-brand-400" aria-hidden />
            <div>
              <p className="text-[11px] text-ink-400">Focus</p>
              <p className="text-xs font-semibold text-white">Structured plan</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3 py-2.5">
            <IconShield className="h-4 w-4 shrink-0 text-brand-400" aria-hidden />
            <div>
              <p className="text-[11px] text-ink-400">Priority</p>
              <p className="text-xs font-semibold text-white">Risk management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
