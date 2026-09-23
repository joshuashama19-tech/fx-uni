/**
 * Premium trust-building visual asset #1 — "Hero visual"
 * (FX University — Add Premium Trust-Building Visual Assets Only).
 *
 * An original, hand-built vector composition of a modern trading
 * workspace — a monitor and laptop on a desk, under a soft ambient glow —
 * rendered entirely in the site's own brand palette (ink-950/900/800,
 * brand-600/700, white). No photography or external imagery is used or
 * referenced.
 *
 * This is decorative atmosphere, not a real screenshot, a performance
 * claim, or any kind of account/balance display — every number-shaped
 * element here is an abstract placeholder bar, never actual figures.
 * It sits behind HeroChartCard (the existing, unmodified UI mockup) so
 * the hero's existing hierarchy — headline, subheadline, CTAs — is
 * completely unchanged; this only adds depth and context behind the
 * card that was already there.
 */
export function HeroWorkspaceVisual() {
  return (
    <div
      role="img"
      aria-label="Illustration of a modern trading workspace with a monitor and laptop on a desk"
      className="pointer-events-none absolute -inset-x-6 -inset-y-10 -z-10 sm:-inset-x-10 sm:-inset-y-14"
    >
      <svg viewBox="0 0 480 440" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="heroGlow" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#e50914" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#e50914" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="heroDesk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#171717" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="heroMonitorScreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f2f2f" />
            <stop offset="100%" stopColor="#171717" />
          </linearGradient>
        </defs>

        {/* Ambient glow */}
        <circle cx="260" cy="150" r="220" fill="url(#heroGlow)" />

        {/* Desk surface */}
        <path d="M20 360 L460 360 L430 420 L50 420 Z" fill="url(#heroDesk)" />
        <path d="M20 360 L460 360" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1.5" />

        {/* Faint particle field for premium tech texture */}
        {[
          [70, 70], [120, 40], [380, 60], [420, 110], [60, 200], [400, 220], [340, 30], [150, 300],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={1.6} fill="#ffffff" opacity={0.18} />
        ))}

        {/* Monitor stand */}
        <rect x="228" y="322" width="24" height="28" rx="3" fill="#171717" />
        <rect x="196" y="346" width="88" height="8" rx="4" fill="#171717" />

        {/* Monitor body */}
        <rect x="120" y="90" width="240" height="236" rx="14" fill="#0a0a0a" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1.5" />
        <rect x="136" y="106" width="208" height="204" rx="6" fill="url(#heroMonitorScreen)" />

        {/* Abstract chart line on the monitor screen — echoes the brand's line-chart motif, never real figures */}
        <path
          d="M150 250 L172 236 L194 258 L216 214 L238 226 L260 180 L282 198 L304 156 L326 168"
          fill="none"
          stroke="#e50914"
          strokeOpacity="0.55"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {[0, 1, 2].map((i) => (
          <line key={i} x1="150" x2="326" y1={140 + i * 30} y2={140 + i * 30} stroke="#ffffff" strokeOpacity="0.05" />
        ))}
        {/* Placeholder module bars — abstract, not real content */}
        <rect x="150" y="268" width="70" height="6" rx="3" fill="#ffffff" opacity="0.12" />
        <rect x="150" y="282" width="46" height="6" rx="3" fill="#ffffff" opacity="0.12" />

        {/* Laptop, partially behind the monitor for depth */}
        <path d="M50 372 L150 372 L158 410 L38 410 Z" fill="#171717" />
        <path d="M55 372 L145 372 L140 320 L60 320 Z" fill="#0a0a0a" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1.25" />
        <rect x="70" y="332" width="60" height="4" rx="2" fill="#ffffff" opacity="0.1" />
        <rect x="70" y="342" width="40" height="4" rx="2" fill="#ffffff" opacity="0.1" />
      </svg>
    </div>
  );
}
