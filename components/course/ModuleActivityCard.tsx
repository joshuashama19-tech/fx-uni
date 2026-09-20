import Link from "next/link";
import { IconCheckCircle, IconArrowRight } from "@/components/icons";

export function ModuleActivityCard({
  href,
  title,
  description,
  status,
}: {
  href: string;
  title: string;
  description: string;
  /** null = not started/no signal to show yet. */
  status: { complete: boolean; label?: string } | null;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-xl border border-ink-100 px-5 py-4 transition-colors hover:border-brand-200 hover:bg-brand-50/30"
    >
      <div>
        <p className="font-medium text-ink-900">{title}</p>
        <p className="mt-0.5 text-sm text-ink-500">{description}</p>
        {status?.complete ? (
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
            <IconCheckCircle className="h-3.5 w-3.5" /> {status.label ?? "Complete"}
          </p>
        ) : status?.label ? (
          <p className="mt-1.5 text-xs font-medium text-ink-500">{status.label}</p>
        ) : null}
      </div>
      <IconArrowRight className="h-4 w-4 flex-none text-ink-400" />
    </Link>
  );
}
