import { ReactNode } from "react";
import { Reveal } from "./Reveal";

type SectionHeadingProps = {
  eyebrow?: string;
  headline: ReactNode;
  subheadline?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  headline,
  subheadline,
  align = "center",
  tone = "light",
  className = "",
}: SectionHeadingProps) {
  const isCenter = align === "center";
  const isDark = tone === "dark";

  return (
    <Reveal
      className={`max-w-3xl ${isCenter ? "mx-auto text-center" : "text-left"} ${className}`}
    >
      {eyebrow ? (
        <p
          className={`mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${
            isDark ? "text-brand-300" : "text-brand-700"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-brand-300" : "bg-brand-500"}`} />
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`text-balance text-3xl font-semibold tracking-tight ${
          isDark ? "text-white" : "text-ink-900"
        } sm:text-4xl`}
      >
        {headline}
      </h2>
      {subheadline ? (
        <p className={`mt-4 text-balance text-base leading-relaxed sm:text-lg ${isDark ? "text-ink-300" : "text-ink-500"}`}>
          {subheadline}
        </p>
      ) : null}
    </Reveal>
  );
}
