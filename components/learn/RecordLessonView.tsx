"use client";

import { useEffect, useRef } from "react";
import { recordLessonViewedAction } from "@/lib/progress/actions";

/**
 * Invisible — records "the student opened this lesson" exactly once per
 * real page view. Deliberately a client-side effect rather than a write
 * during server rendering: Next.js prefetches <Link> destinations that
 * merely scroll into view, and a render-time write would record a lesson
 * as "last viewed" just from being hovered near, not actually opened. A
 * mount-time effect only ever runs in the browser after a real navigation,
 * so it can't be triggered by prefetching.
 *
 * Best-effort: if the write fails (e.g. a transient network blip), the
 * lesson still renders normally — this must never block reading.
 */
export function RecordLessonView({ moduleSlug, lessonSlug }: { moduleSlug: string; lessonSlug: string }) {
  const recordedKey = useRef<string | null>(null);

  useEffect(() => {
    const key = `${moduleSlug}/${lessonSlug}`;
    if (recordedKey.current === key) return;
    recordedKey.current = key;
    recordLessonViewedAction(moduleSlug, lessonSlug).catch(() => {
      // Silently ignore — see file comment.
    });
  }, [moduleSlug, lessonSlug]);

  return null;
}
