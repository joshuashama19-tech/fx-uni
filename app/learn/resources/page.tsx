import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getResourceLibrary } from "@/lib/course-content";
import { MarkdownBlocks } from "@/lib/markdown/render";

export const metadata: Metadata = { title: "Resource Library" };

export default function ResourceLibraryPage() {
  const doc = getResourceLibrary();
  if (!doc) notFound();

  return (
    <article>
      <p className="text-sm text-ink-500">
        <Link href="/learn" className="hover:text-ink-800">
          Course
        </Link>{" "}
        / Resource Library
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">{doc.title}</h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-600">
        Every reusable worksheet, checklist, and template from across the course, compiled in one place.
      </p>

      <div className="mt-8 max-w-[70ch]">
        <MarkdownBlocks blocks={doc.blocks} />
      </div>
    </article>
  );
}
