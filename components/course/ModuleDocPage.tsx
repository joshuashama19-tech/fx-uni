import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule, getModuleDocument, type ModuleDocKind } from "@/lib/course-content";
import { MarkdownBlocks } from "@/lib/markdown/render";

/**
 * Shared renderer for a module's whole exercises/quiz/answer-key/checklist
 * file. Used by the four thin route files under app/learn/[module]/ — kept
 * here once rather than duplicated four times.
 */
export function ModuleDocPage({ moduleSlug, kind }: { moduleSlug: string; kind: ModuleDocKind }) {
  const mod = getModule(moduleSlug);
  const doc = getModuleDocument(moduleSlug, kind);
  if (!mod || !doc) notFound();

  return (
    <article>
      <p className="text-sm text-ink-500">
        <Link href="/learn" className="hover:text-ink-800">
          Course
        </Link>{" "}
        /{" "}
        <Link href={`/learn/${mod.slug}`} className="hover:text-ink-800">
          Module {mod.order}: {mod.title}
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">{doc.title}</h1>

      <div className="mt-8 max-w-[70ch]">
        <MarkdownBlocks blocks={doc.blocks} />
      </div>

      <nav className="mt-12 border-t border-ink-100 pt-6 text-sm">
        <Link href={`/learn/${mod.slug}`} className="font-medium text-brand-600 hover:text-brand-700">
          ← Back to Module {mod.order}
        </Link>
      </nav>
    </article>
  );
}
