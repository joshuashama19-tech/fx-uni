/**
 * Premium trust-building visual asset #4 — "Platform / trust visual"
 * (FX University — Add Premium Trust-Building Visual Assets Only).
 *
 * An original vector composition of a course dashboard on a laptop —
 * a progress ring, a module checklist, and a small chart chip — with a
 * floating security badge, supporting the trust/value section. Every
 * number shown (module counts, progress ring) is an abstract, generic
 * placeholder — never a real balance, profit figure, or performance
 * claim. Brand palette only; no photography or external imagery.
 */
export function TrustPlatformVisual() {
  return (
    <div
      role="img"
      aria-label="Illustration of a course dashboard on a laptop screen, showing module progress, with a security badge"
      className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-ink-100 bg-white p-4 shadow-card sm:p-6"
    >
      <svg viewBox="0 0 440 320" className="h-full w-full" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="tpDesk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e5e5e5" stopOpacity="0" />
            <stop offset="100%" stopColor="#d8d8d8" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        <ellipse cx="220" cy="284" rx="180" ry="14" fill="url(#tpDesk)" />

        {/* Laptop base + screen, centered */}
        <path d="M120 250 L320 250 L332 274 L108 274 Z" fill="#d8d8d8" />
        <rect x="110" y="86" width="220" height="164" rx="10" fill="#0a0a0a" />
        <rect x="120" y="96" width="200" height="144" rx="4" fill="#ffffff" />

        {/* Header chrome */}
        <circle cx="130" cy="105" r="2.2" fill="#d8d8d8" />
        <circle cx="137" cy="105" r="2.2" fill="#d8d8d8" />
        <circle cx="144" cy="105" r="2.2" fill="#d8d8d8" />
        <text x="153" y="107.5" fontSize="5.5" fill="#929292" fontFamily="sans-serif">
          FX University · Dashboard
        </text>
        <line x1="120" y1="112" x2="320" y2="112" stroke="#e5e5e5" strokeWidth="1" />

        {/* Progress ring */}
        <circle cx="160" cy="160" r="30" fill="none" stroke="#e5e5e5" strokeWidth="7" />
        <circle
          cx="160"
          cy="160"
          r="30"
          fill="none"
          stroke="#e50914"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 30 * 0.62} ${2 * Math.PI * 30}`}
          transform="rotate(-90 160 160)"
        />
        <text x="160" y="158" fontSize="11" fontWeight="700" fill="#171717" fontFamily="sans-serif" textAnchor="middle">
          62%
        </text>
        <text x="160" y="170" fontSize="5" fill="#929292" fontFamily="sans-serif" textAnchor="middle">
          Complete
        </text>

        {/* Module checklist */}
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(206 ${138 + i * 22})`}>
              <rect x="0" y="0" width="14" height="14" rx="4" fill={i < 2 ? "#171717" : "#e5e5e5"} />
              {i < 2 ? (
                <path d="M3.5 7 L6 9.5 L10.5 4.5" stroke="#ffffff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ) : null}
              <rect x="20" y="3" width={i === 2 ? 66 : 84} height="4" rx="2" fill="#e5e5e5" />
            </g>
          ))}
        </g>

        {/* Small chart chip */}
        <rect x="120" y="204" width="200" height="26" rx="6" fill="#fdf0f1" />
        <path
          d="M128 220 L140 214 L152 222 L164 210 L176 216 L188 206 L200 212"
          fill="none"
          stroke="#b20710"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
        <text x="300" y="219" fontSize="5.5" fill="#b20710" fontFamily="sans-serif" textAnchor="end" fontWeight="600">
          10 Modules
        </text>

        {/* Floating trust/security badge */}
        <circle cx="352" cy="92" r="26" fill="#0a0a0a" />
        <path
          d="M352 78 L364 82 V92 C364 100 358.5 105.5 352 108 C345.5 105.5 340 100 340 92 V82 Z"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.9"
          strokeWidth="2"
        />
        <path d="M346 92 L350.5 96.5 L359 87" stroke="#e50914" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
