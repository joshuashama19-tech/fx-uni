/**
 * Premium trust-building visual asset #3 — "Trading journal / analysis
 * visual" (FX University — Add Premium Trust-Building Visual Assets Only).
 *
 * An original vector "flat lay" composition of an open trading journal
 * next to a monitor edge showing a chart — structured review, not a
 * live trade or a performance claim. No account balances, profit
 * figures, or "results" of any kind are depicted; the chart is the same
 * abstract line motif used elsewhere on the page. Brand palette only.
 */
export function JournalAnalysisVisual() {
  return (
    <div
      role="img"
      aria-label="Illustration of an open trading journal notebook beside a monitor showing a chart, for structured review"
      className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-ink-100 bg-ink-50 p-4 shadow-card sm:p-6"
    >
      <svg viewBox="0 0 440 300" className="h-full w-full" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="jaShadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d8d8d8" stopOpacity="0" />
            <stop offset="100%" stopColor="#d8d8d8" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        <ellipse cx="220" cy="268" rx="190" ry="14" fill="url(#jaShadow)" />

        {/* Monitor edge, cropped in from the right for a close-up feel */}
        <path d="M300 40 L420 40 L420 220 L300 220 Z" fill="#0a0a0a" />
        <path d="M312 52 L408 52 L408 208 L312 208 Z" fill="#171717" />
        <path
          d="M320 175 L338 160 L356 182 L374 140 L392 155"
          fill="none"
          stroke="#e50914"
          strokeOpacity="0.6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {[0, 1, 2].map((i) => (
          <line key={i} x1="320" x2="400" y1={90 + i * 28} y2={90 + i * 28} stroke="#ffffff" strokeOpacity="0.05" />
        ))}
        <rect x="330" y="220" width="60" height="10" rx="3" fill="#0a0a0a" />

        {/* Open journal, layered in front */}
        <g transform="rotate(-3 190 190)">
          <rect x="30" y="120" width="300" height="150" rx="8" fill="#ffffff" stroke="#e5e5e5" strokeWidth="1.5" />
          <line x1="180" y1="120" x2="180" y2="270" stroke="#e5e5e5" strokeWidth="1.5" />

          {/* Left page: heading + notes */}
          <rect x="48" y="138" width="60" height="6" rx="3" fill="#b20710" opacity="0.55" />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={`l-${i}`} x1="48" x2={i % 2 === 0 ? 158 : 140} y1={156 + i * 14} y2={156 + i * 14} stroke="#e5e5e5" strokeWidth="2" strokeLinecap="round" />
          ))}

          {/* Right page: small checklist of review questions */}
          <rect x="198" y="138" width="70" height="6" rx="3" fill="#171717" opacity="0.5" />
          {[0, 1, 2].map((i) => (
            <g key={`c-${i}`} transform={`translate(198 ${158 + i * 20})`}>
              <rect x="0" y="0" width="10" height="10" rx="3" fill="none" stroke="#b9b9b9" strokeWidth="1.5" />
              <line x1="16" y1="5" x2="90" y2="5" stroke="#e5e5e5" strokeWidth="2" strokeLinecap="round" />
            </g>
          ))}

          {/* Small sketched candles, echoing the journal's own review of chart structure */}
          <g transform="translate(198 232)">
            <rect x="0" y="4" width="3.5" height="14" rx="1" fill="#171717" opacity="0.35" />
            <rect x="8" y="0" width="3.5" height="20" rx="1" fill="#b20710" opacity="0.55" />
            <rect x="16" y="8" width="3.5" height="10" rx="1" fill="#171717" opacity="0.35" />
            <rect x="24" y="2" width="3.5" height="18" rx="1" fill="#b20710" opacity="0.55" />
          </g>

          {/* Pen resting across the spine */}
          <rect x="70" y="248" width="130" height="6" rx="3" fill="#171717" opacity="0.55" transform="rotate(4 135 251)" />
        </g>
      </svg>
    </div>
  );
}
