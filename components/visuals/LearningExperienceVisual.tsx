/**
 * Premium trust-building visual asset #2 — "Learning experience visual"
 * (FX University — Add Premium Trust-Building Visual Assets Only).
 *
 * An original vector illustration of a laptop on a desk, with the
 * FX University lesson interface reflected on its screen — reusing the
 * same header bar / lesson-line / checklist / progress-bar language as
 * the real product mockup in CoursePreviewSection, rather than a
 * generic laptop showing an unrelated website. A notebook, pen, and cup
 * beside it suggest a real, personal study session without needing an
 * attempted (and inevitably lower-quality) hand-drawn human figure.
 *
 * Brand palette only (ink/brand ramp); no photography, no external
 * imagery, no fabricated numbers or claims.
 */
export function LearningExperienceVisual() {
  return (
    <div
      role="img"
      aria-label="Illustration of a laptop on a desk showing the FX University lesson interface, beside a notebook and pen"
      className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-ink-100 bg-ink-50 p-4 shadow-card sm:p-6"
    >
      <svg viewBox="0 0 440 320" className="h-full w-full" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="lxDesk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e5e5e5" stopOpacity="0" />
            <stop offset="100%" stopColor="#d8d8d8" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Desk shadow */}
        <ellipse cx="220" cy="286" rx="190" ry="16" fill="url(#lxDesk)" />

        {/* Notebook, angled behind-left of the laptop */}
        <g transform="rotate(-8 100 220)">
          <rect x="40" y="190" width="130" height="92" rx="6" fill="#ffffff" stroke="#e5e5e5" strokeWidth="1.5" />
          <line x1="105" y1="190" x2="105" y2="282" stroke="#e5e5e5" strokeWidth="1.5" />
          {[0, 1, 2, 3].map((i) => (
            <line key={`l-${i}`} x1="52" x2="96" y1={210 + i * 14} y2={210 + i * 14} stroke="#d8d8d8" strokeWidth="2" strokeLinecap="round" />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <line key={`r-${i}`} x1="114" x2="158" y1={210 + i * 14} y2={210 + i * 14} stroke="#d8d8d8" strokeWidth="2" strokeLinecap="round" />
          ))}
          {/* small hand-drawn candle sketch, echoing the brand's chart motif */}
          <rect x="118" y="238" width="4" height="16" rx="1" fill="#b20710" opacity="0.6" />
          <rect x="128" y="230" width="4" height="24" rx="1" fill="#171717" opacity="0.35" />
          <rect x="138" y="242" width="4" height="10" rx="1" fill="#b20710" opacity="0.6" />
          {/* pen resting diagonally */}
          <rect x="48" y="255" width="52" height="5" rx="2.5" fill="#171717" opacity="0.5" transform="rotate(18 74 257)" />
        </g>

        {/* Laptop base */}
        <path d="M225 260 L395 260 L408 284 L212 284 Z" fill="#d8d8d8" />
        <path d="M225 260 L395 260 L393 264 L227 264 Z" fill="#b9b9b9" />

        {/* Laptop screen */}
        <rect x="235" y="120" width="150" height="140" rx="8" fill="#0a0a0a" />
        <rect x="243" y="128" width="134" height="118" rx="3" fill="#ffffff" />

        {/* Screen header bar — mirrors CoursePreviewSection's mockup chrome */}
        <circle cx="251" cy="135" r="2" fill="#d8d8d8" />
        <circle cx="257" cy="135" r="2" fill="#d8d8d8" />
        <circle cx="263" cy="135" r="2" fill="#d8d8d8" />
        <text x="271" y="137.5" fontSize="5" fill="#929292" fontFamily="sans-serif">
          FX University · Lesson
        </text>
        <line x1="243" y1="141" x2="377" y2="141" stroke="#e5e5e5" strokeWidth="1" />

        {/* Lesson content placeholder lines */}
        <rect x="251" y="150" width="118" height="4" rx="2" fill="#e5e5e5" />
        <rect x="251" y="158" width="108" height="4" rx="2" fill="#e5e5e5" />
        <rect x="251" y="166" width="84" height="4" rx="2" fill="#e5e5e5" />

        {/* Knowledge-check style row */}
        <rect x="251" y="180" width="118" height="14" rx="4" fill="#fdf0f1" stroke="#f7b0b4" strokeWidth="1" />
        <circle cx="259" cy="187" r="3" fill="#e50914" />
        <path d="M257.5 187 L258.5 188.2 L261 185.2" stroke="#ffffff" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="267" y="185" width="70" height="3.5" rx="1.75" fill="#b20710" opacity="0.55" />

        {/* Progress bar */}
        <rect x="251" y="205" width="118" height="3.5" rx="1.75" fill="#e5e5e5" />
        <rect x="251" y="205" width="40" height="3.5" rx="1.75" fill="#e50914" />
        <text x="251" y="218" fontSize="5" fill="#929292" fontFamily="sans-serif">
          Module 3 of 10
        </text>

        {/* Keyboard hint */}
        <rect x="245" y="264" width="126" height="14" rx="3" fill="#171717" opacity="0.06" />
      </svg>
    </div>
  );
}
