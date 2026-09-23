/**
 * Subtle decorative candlestick/chart texture for dark sections (Curriculum,
 * Pricing, Final CTA) — purely a background flourish, never real data, never
 * a performance claim. Extremely low opacity so it reads as texture, not
 * content; aria-hidden since it carries no information.
 */
export function ChartTexture({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden opacity-[0.07] ${className}`} aria-hidden="true">
      <svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" focusable="false">
        {Array.from({ length: 26 }).map((_, i) => {
          const x = i * 32 + 10;
          const bodyTop = 60 + ((i * 37) % 140);
          const bodyH = 14 + ((i * 53) % 60);
          const wickTop = bodyTop - ((i * 17) % 30);
          const wickH = bodyH + ((i * 29) % 50);
          const up = i % 3 !== 0;
          return (
            <g key={i}>
              <line x1={x + 4} x2={x + 4} y1={wickTop} y2={wickTop + wickH} stroke="#ffffff" strokeWidth="1" />
              <rect x={x} y={bodyTop} width="8" height={bodyH} fill={up ? "#ffffff" : "#e50914"} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
