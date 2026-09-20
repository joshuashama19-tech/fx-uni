"use client";

import { useState } from "react";
import Link from "next/link";
import { announcement } from "@/lib/course-data";
import { IconX } from "./icons";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative bg-ink-950 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-10 py-2.5 text-center text-xs font-medium sm:text-sm">
        <span className="hidden h-1.5 w-1.5 shrink-0 animate-pulse-soft rounded-full bg-brand-400 sm:inline-block" />
        <p className="text-ink-100">
          {announcement.text}{" "}
          <Link
            href={announcement.ctaHref}
            className="ml-1 inline-flex items-center gap-1 font-semibold text-brand-300 underline decoration-brand-300/50 underline-offset-2 hover:text-brand-200"
          >
            {announcement.ctaLabel}
          </Link>
        </p>
        {announcement.dismissible ? (
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Dismiss announcement"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink-400 transition hover:bg-white/10 hover:text-white sm:right-4"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
