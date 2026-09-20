import type { ReactNode } from "react";
import type { Block, InlineNode, CalloutKind } from "./types";

// Renders the course-content AST as real React elements — never
// dangerouslySetInnerHTML — using the existing brand Tailwind tokens
// (ink-*/brand-*, see tailwind.config.ts) so the reader matches the rest of
// the site: light background, generous spacing, no dark/glassmorphism
// styling.

export function renderInline(nodes: InlineNode[], keyPrefix = "n"): ReactNode[] {
  return nodes.map((node, idx) => {
    const key = `${keyPrefix}-${idx}`;
    switch (node.type) {
      case "text":
        return node.value ? <span key={key}>{node.value}</span> : null;
      case "bold":
        return (
          <strong key={key} className="font-semibold text-ink-900">
            {renderInline(node.children, key)}
          </strong>
        );
      case "italic":
        return <em key={key}>{renderInline(node.children, key)}</em>;
      case "code":
        return (
          <code key={key} className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[0.9em] text-ink-800">
            {node.value}
          </code>
        );
      case "link": {
        const isExternal = /^(https?:)?\/\//.test(node.href) || node.href.startsWith("mailto:");
        if (!isExternal) {
          // Internal/relative doc references (e.g. links to another source
          // markdown file) have no corresponding /learn route and would
          // otherwise leak filesystem-shaped paths or 404 — render as
          // styled, non-navigating text instead of a broken/unsafe link.
          return (
            <span key={key} className="font-medium text-ink-800">
              {renderInline(node.children, key)}
            </span>
          );
        }
        return (
          <a
            key={key}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
          >
            {renderInline(node.children, key)}
          </a>
        );
      }
      case "break":
        return <br key={key} />;
      default:
        return null;
    }
  });
}

const CALLOUT_STYLES: Record<CalloutKind, string> = {
  "KEY CONCEPT": "border-brand-600 bg-brand-50/60",
  EXAMPLE: "border-ink-300 bg-ink-50",
  "PRACTICAL NOTE": "border-ink-300 bg-ink-50",
  "WATCH OUT": "border-brand-600 bg-brand-50/60",
  CHECKPOINT: "border-ink-400 bg-ink-50",
  REMEMBER: "border-ink-400 bg-ink-50",
  "BEGINNER MISTAKE": "border-brand-600 bg-brand-50/60",
};

function BlockView({ block, index }: { block: Block; index: number }) {
  switch (block.type) {
    case "heading": {
      const HeadingTag = (`h${block.level + 1}`) as "h2" | "h3" | "h4"; // lesson <h1> is the page title
      const sizeClass =
        block.level === 1
          ? "text-2xl sm:text-3xl mt-10 mb-4"
          : block.level === 2
            ? "text-xl sm:text-2xl mt-9 mb-3"
            : "text-lg sm:text-xl mt-7 mb-3";
      return (
        <HeadingTag className={`font-semibold tracking-tight text-ink-950 ${sizeClass}`}>
          {renderInline(block.children, `h${index}`)}
        </HeadingTag>
      );
    }
    case "subhead":
      return (
        <p className="mb-2 mt-6 font-semibold text-ink-900">{renderInline(block.children, `sh${index}`)}</p>
      );
    case "paragraph":
      if (block.calc) {
        return (
          <p className="mb-4 rounded-lg border border-ink-100 bg-ink-50 p-4 font-mono text-sm leading-relaxed text-ink-800">
            {renderInline(block.children, `p${index}`)}
          </p>
        );
      }
      return (
        <p className="mb-4 text-base leading-relaxed text-ink-700">{renderInline(block.children, `p${index}`)}</p>
      );
    case "blockquote": {
      const style = block.callout ? CALLOUT_STYLES[block.callout] : "border-ink-200 bg-ink-50";
      return (
        <blockquote className={`my-5 rounded-r-lg border-l-4 py-3 pl-4 pr-4 ${style}`}>
          {block.callout ? (
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-700">{block.callout}</p>
          ) : null}
          <p className="text-base leading-relaxed text-ink-700">{renderInline(block.children, `bq${index}`)}</p>
        </blockquote>
      );
    }
    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag
          className={`mb-4 space-y-2 pl-6 text-base leading-relaxed text-ink-700 ${
            block.ordered ? "list-decimal" : "list-disc"
          }`}
        >
          {block.items.map((item, i) => (
            <li key={`li${index}-${i}`}>{renderInline(item, `li${index}-${i}`)}</li>
          ))}
        </ListTag>
      );
    }
    case "checklist":
      return (
        <ul className="mb-4 space-y-2.5">
          {block.items.map((item, i) => (
            <li key={`cl${index}-${i}`} className="flex items-start gap-3 text-base leading-relaxed text-ink-700">
              <span
                aria-hidden="true"
                className="mt-1 inline-block h-4 w-4 flex-none rounded border-2 border-ink-300"
              />
              <span>{renderInline(item, `cl${index}-${i}`)}</span>
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div className="mb-5 overflow-x-auto rounded-lg border border-ink-100">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="bg-ink-50">
                {block.header.map((cell, i) => (
                  <th
                    key={`th${index}-${i}`}
                    className="border-b-2 border-ink-200 px-3 py-2.5 text-left font-semibold text-ink-900"
                  >
                    {renderInline(cell, `th${index}-${i}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={`tr${index}-${r}`} className={r % 2 === 1 ? "bg-ink-50/50" : undefined}>
                  {row.map((cell, c) => (
                    <td key={`td${index}-${r}-${c}`} className="border-b border-ink-100 px-3 py-2.5 text-ink-700">
                      {renderInline(cell, `td${index}-${r}-${c}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "formula":
      return (
        <pre className="mb-5 overflow-x-auto rounded-lg border border-ink-100 bg-ink-50 p-4 font-mono text-sm leading-relaxed text-ink-800">
          <code>{block.text}</code>
        </pre>
      );
    case "hr":
      return <hr className="my-8 border-ink-200" />;
    default:
      return null;
  }
}

export function MarkdownBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="course-prose">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} index={i} />
      ))}
    </div>
  );
}
