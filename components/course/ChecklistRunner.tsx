"use client";

import { useState, useTransition } from "react";
import type { InlineNode } from "@/lib/markdown/types";
import { renderInline } from "@/lib/markdown/render";
import { toggleChecklistItemAction } from "@/lib/progress/activity-actions";
import { IconCheckCircle } from "@/components/icons";

export interface ChecklistGroupData {
  title: string;
  items: { id: string; text: InlineNode[] }[];
}

export function ChecklistRunner({
  moduleSlug,
  groups,
  initialCheckedIds,
  initialComplete,
}: {
  moduleSlug: string;
  groups: ChecklistGroupData[];
  initialCheckedIds: string[];
  initialComplete: boolean;
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set(initialCheckedIds));
  const [complete, setComplete] = useState(initialComplete);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);
  const percent = totalItems > 0 ? Math.round((checked.size / totalItems) * 100) : 0;

  function toggle(itemId: string) {
    const previous = checked; // snapshot the pre-toggle state, for a clean revert on failure
    const next = new Set(checked);
    const nowChecked = !next.has(itemId);
    if (nowChecked) next.add(itemId);
    else next.delete(itemId);
    setChecked(next); // optimistic — instant feedback, no waiting on the round-trip
    setComplete(next.size === totalItems);
    setError(null);

    startTransition(async () => {
      try {
        const result = await toggleChecklistItemAction(moduleSlug, itemId, nowChecked);
        setChecked(result.checkedItems);
        setComplete(result.completedAt !== null);
      } catch {
        // Revert on failure — never leave the UI claiming a state the
        // server didn't actually persist — and say so, rather than
        // failing silently (a refresh would otherwise be the only way to
        // discover the checkbox didn't really save).
        setChecked(previous);
        setComplete(previous.size === totalItems);
        setError("Couldn't save that change. Check your connection and try again.");
      }
    });
  }

  return (
    <div>
      <div
        className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium transition-opacity ${
          complete ? "bg-brand-50 text-brand-800" : "bg-ink-50 text-ink-600"
        } ${pending ? "opacity-70" : "opacity-100"}`}
      >
        <div className="flex items-center justify-between gap-2" aria-live="polite">
          <span className="inline-flex items-center gap-2">
            {complete ? <IconCheckCircle className="h-4 w-4 flex-none" /> : null}
            {checked.size} / {totalItems} checked{complete ? " — Checklist complete" : ""}
          </span>
          <span className="text-xs font-semibold text-ink-500">{percent}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`h-full rounded-full transition-[width] ${complete ? "bg-brand-600" : "bg-brand-400"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {groups.map((group) => (
        <section key={group.title} className="mb-7">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">{group.title}</h3>
          <ul className="mt-3 space-y-2.5">
            {group.items.map((item) => {
              const isChecked = checked.has(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-pressed={isChecked}
                    className="flex w-full min-h-11 items-start gap-3 rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:border-ink-100 hover:bg-ink-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded border-2 ${
                        isChecked ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300 bg-white"
                      }`}
                    >
                      {isChecked ? <IconCheckCircle className="h-3.5 w-3.5" /> : null}
                    </span>
                    <span className={`text-base leading-relaxed ${isChecked ? "text-ink-500 line-through" : "text-ink-800"}`}>
                      {renderInline(item.text, item.id)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
