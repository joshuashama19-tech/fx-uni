import type { InlineNode } from "./types";

// Matches, in priority order: **bold**, `code`, [text](url), *italic*/_italic_,
// and a literal newline (used as an explicit line-break marker inside
// "calc"-style paragraphs — see buildCalcText in parser.ts). Bold must be
// tried before the single-asterisk italic alternative, or "**x**" would be
// misread as italic-of-"*x*".
const INLINE_TOKEN_RE =
  /(\*\*(?:[^*]|\*(?!\*))+?\*\*|`[^`]+?`|\[[^\]]+?\]\([^)]+?\)|\*(?!\*)[^*]+?\*|_[^_]+?_|\n)/;

const LINK_RE = /^\[([^\]]+?)\]\(([^)]+?)\)$/;

/**
 * Parses a plain (already whitespace-normalized) text string into inline
 * nodes. This is the only place markdown inline syntax is interpreted —
 * everything that isn't one of the recognized tokens above becomes a plain
 * text node. Because the output is a typed AST rendered later via real
 * React elements (never dangerouslySetInnerHTML — see render.tsx), there is
 * no HTML-injection vector: literal "<script>"-looking text in source stays
 * inert text on the page.
 */
export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let rest = text;

  while (rest.length > 0) {
    const match = INLINE_TOKEN_RE.exec(rest);
    if (!match || match.index === undefined) {
      nodes.push({ type: "text", value: rest });
      break;
    }

    const idx = match.index;
    if (idx > 0) {
      nodes.push({ type: "text", value: rest.slice(0, idx) });
    }

    const token = match[0];

    if (token === "\n") {
      nodes.push({ type: "break" });
    } else if (token.startsWith("**")) {
      nodes.push({ type: "bold", children: parseInline(token.slice(2, -2)) });
    } else if (token.startsWith("`")) {
      nodes.push({ type: "code", value: token.slice(1, -1) });
    } else if (token.startsWith("[")) {
      const linkMatch = LINK_RE.exec(token);
      if (linkMatch) {
        nodes.push({ type: "link", href: linkMatch[2], children: parseInline(linkMatch[1]) });
      } else {
        nodes.push({ type: "text", value: token });
      }
    } else if (token.startsWith("*") || token.startsWith("_")) {
      nodes.push({ type: "italic", children: parseInline(token.slice(1, -1)) });
    }

    rest = rest.slice(idx + token.length);
  }

  return nodes;
}

/** Flattens inline nodes back to plain text (for slugs, nav labels, <title>). */
export function inlineToPlainText(nodes: InlineNode[]): string {
  return nodes
    .map((n) => {
      switch (n.type) {
        case "text":
          return n.value;
        case "code":
          return n.value;
        case "break":
          return " ";
        case "bold":
        case "italic":
        case "link":
          return inlineToPlainText(n.children);
        default:
          return "";
      }
    })
    .join("");
}
