// Zero-dependency Markdown AST types for the course reader.
//
// This is a deliberately small, purpose-built block/inline model — not a
// general CommonMark implementation — designed to faithfully render the
// actual patterns used across content/course/modules/**: headings,
// paragraphs, bold-only "subhead" lines, callout blockquotes
// (`> **Beginner mistake:** ...`), ordered/unordered lists, `- [ ]`
// checklists, tables, and fenced ``` calculation/example blocks.
//
// Ported (in spirit, not code) from the same design already proven in
// content/course/production/pdf-generator/lib/md_parse.py, which parses
// this exact content for the PDF build.

export type InlineNode =
  | { type: "text"; value: string }
  | { type: "bold"; children: InlineNode[] }
  | { type: "italic"; children: InlineNode[] }
  | { type: "code"; value: string }
  | { type: "link"; href: string; children: InlineNode[] }
  | { type: "break" };

// The fixed callout vocabulary used across the course. Any blockquote
// whose leading bold label doesn't match one of these (e.g. "Note:",
// "Risk note:", "Note on terminology:") is still rendered — just as a
// plain callout without a named badge, exactly like the PDF generator's
// behavior for an unrecognized label.
export type CalloutKind =
  | "KEY CONCEPT"
  | "EXAMPLE"
  | "PRACTICAL NOTE"
  | "WATCH OUT"
  | "CHECKPOINT"
  | "REMEMBER"
  | "BEGINNER MISTAKE";

export type Block =
  | { type: "heading"; level: 1 | 2 | 3; children: InlineNode[] }
  | { type: "subhead"; children: InlineNode[] }
  | { type: "paragraph"; children: InlineNode[]; calc?: boolean }
  | { type: "blockquote"; callout: CalloutKind | null; children: InlineNode[] }
  | { type: "list"; ordered: boolean; items: InlineNode[][] }
  | { type: "checklist"; items: InlineNode[][] }
  | { type: "table"; header: InlineNode[][]; rows: InlineNode[][][] }
  | { type: "formula"; text: string; lang?: string }
  | { type: "hr" };
