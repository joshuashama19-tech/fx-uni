// Presentational only — receives already-computed numbers from
// lib/progress/actions.ts's getStudentProgress(). Deliberately plain: a
// label, a count, a percentage, and a static (non-animated) bar — matches
// the rest of the site's "clean, premium, no excessive animation" design
// language rather than introducing a new chart/animation dependency.
export function ProgressSummary({
  completedCount,
  totalCount,
  percentage,
}: {
  completedCount: number;
  totalCount: number;
  percentage: number;
}) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-5">
      <p className="text-sm font-semibold text-ink-900">Your Progress</p>
      <p className="mt-1 text-sm text-ink-600">
        {completedCount} / {totalCount} lessons completed
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
        <div
          className="h-full rounded-full bg-brand-600"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-medium text-ink-500">{percentage}% complete</p>
    </div>
  );
}
