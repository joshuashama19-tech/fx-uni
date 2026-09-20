import type { Block, CalloutKind } from "./types";
import { parseInline } from "./inline";

// Same fixed callout vocabulary as
// content/course/production/pdf-generator/lib/md_parse.py's
// _CALLOUT_LABELS, so a recognized label renders as a named badge and an
// unrecognized one (e.g. "Note:", "Risk note:") still renders — just as a
// plain callout, exactly like the PDF build's behavior.
const CALLOUT_LABELS: Record<string, CalloutKind> = {
  "key concept": "KEY CONCEPT",
  example: "EXAMPLE",
  "practical note": "PRACTICAL NOTE",
  "watch out": "WATCH OUT",
  checkpoint: "CHECKPOINT",
  remember: "REMEMBER",
  "beginner mistake": "BEGINNER MISTAKE",
  reminder: "PRACTICAL NOTE",
};

export interface Frontmatter {
  [key: string]: string;
}

/** Splits a raw file's `---\n...\n---` frontmatter block from its body. */
export function stripFrontmatter(raw: string): { frontmatter: Frontmatter; body: string } {
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?/.exec(raw);
  if (!match) return { frontmatter: {}, body: raw };
  const frontmatter: Frontmatter = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { frontmatter, body: raw.slice(match[0].length) };
}

const HEADING_RE = /^(#{1,4})\s+(.*)$/;
const HR_RE = /^(-{3,}|\*{3,}|_{3,})$/;
const FENCE_OPEN_RE = /^```(\w*)\s*$/;
const LIST_ITEM_RE = /^(\s*)([-*]|\d+\.)\s+(.*)$/;
const TABLE_SEP_RE = /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/;
const CHECKLIST_ITEM_RE = /^\[( |x|X)\]\s*(.*)$/;

// Mirrors md_parse.py's _CALC_LINE_RE: a line "hits" if it contains an "="
// anywhere, or looks like "Label: value" at the start.
const CALC_LINE_RE = /=|^[A-Za-z][A-Za-z0-9 /().'-]{0,30}:\s*\S/;

/** Parses a markdown body (frontmatter already stripped) into blocks. */
export function parseMarkdown(body: string): Block[] {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    const fenceMatch = FENCE_OPEN_RE.exec(line.trim());
    if (fenceMatch) {
      const lang = fenceMatch[1] || undefined;
      const contentLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "```") {
        contentLines.push(lines[i]);
        i++;
      }
      i++; // consume closing fence (or EOF if the file has an unclosed fence)
      blocks.push({ type: "formula", text: contentLines.join("\n"), lang });
      continue;
    }

    const headingMatch = HEADING_RE.exec(line);
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length, 3) as 1 | 2 | 3;
      blocks.push({ type: "heading", level, children: parseInline(headingMatch[2].trim()) });
      i++;
      continue;
    }

    if (HR_RE.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    if (/^>/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      const joined = quoteLines
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .join(" ");
      blocks.push(buildBlockquote(joined));
      continue;
    }

    if (/^\|/.test(line.trim()) && i + 1 < lines.length && TABLE_SEP_RE.test(lines[i + 1].trim())) {
      const headerCells = splitTableRow(line);
      i += 2; // header + separator
      const rows: string[][] = [];
      while (i < lines.length && /^\|/.test(lines[i].trim())) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      blocks.push({
        type: "table",
        header: headerCells.map((c) => parseInline(c)),
        rows: rows.map((r) => r.map((c) => parseInline(c))),
      });
      continue;
    }

    const listItemMatch = LIST_ITEM_RE.exec(line);
    if (listItemMatch) {
      const ordered = /^\d+\.$/.test(listItemMatch[2]);
      const items: string[] = [];
      let isChecklist = false;

      while (i < lines.length) {
        const m = LIST_ITEM_RE.exec(lines[i]);
        if (!m) break;
        const thisOrdered = /^\d+\.$/.test(m[2]);
        if (thisOrdered !== ordered) break; // don't mix marker types in one list block

        let text = m[3];
        i++;
        // Fold in indented continuation lines (a wrapped item), stopping at
        // a blank line or the next list item.
        while (
          i < lines.length &&
          lines[i].trim() !== "" &&
          !LIST_ITEM_RE.test(lines[i]) &&
          /^\s+\S/.test(lines[i])
        ) {
          text += " " + lines[i].trim();
          i++;
        }

        const checklistMatch = CHECKLIST_ITEM_RE.exec(text);
        if (checklistMatch) {
          isChecklist = true;
          items.push(checklistMatch[2]);
        } else {
          items.push(text);
        }
      }

      if (isChecklist) {
        blocks.push({ type: "checklist", items: items.map((t) => parseInline(t)) });
      } else {
        blocks.push({ type: "list", ordered, items: items.map((t) => parseInline(t)) });
      }
      continue;
    }

    // Paragraph: consume consecutive lines until the next special block.
    const paraLines: string[] = [];
    while (i < lines.length && isParagraphLine(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push(buildParagraph(paraLines));
  }

  return blocks;
}

function isParagraphLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed === "") return false;
  if (FENCE_OPEN_RE.test(trimmed)) return false;
  if (HEADING_RE.test(line)) return false;
  if (/^>/.test(line)) return false;
  if (LIST_ITEM_RE.test(line)) return false;
  if (/^\|/.test(trimmed)) return false;
  if (HR_RE.test(trimmed)) return false;
  return true;
}

function buildBlockquote(text: string): Block {
  const labelMatch = /^\*\*(.+?)\*\*:?\s*/.exec(text);
  if (labelMatch) {
    const label = labelMatch[1].trim().replace(/:$/, "").toLowerCase();
    const kind = CALLOUT_LABELS[label];
    if (kind) {
      const rest = text.slice(labelMatch[0].length);
      return { type: "blockquote", callout: kind, children: parseInline(rest) };
    }
  }
  return { type: "blockquote", callout: null, children: parseInline(text) };
}

function buildParagraph(rawLines: string[]): Block {
  const trimmedLines = rawLines.map((l) => l.trim()).filter((l) => l.length > 0);

  if (trimmedLines.length === 1) {
    const soleBoldMatch = /^\*\*(.+)\*\*$/.exec(trimmedLines[0]);
    if (soleBoldMatch) {
      return { type: "subhead", children: parseInline(soleBoldMatch[1]) };
    }
  }

  if (looksLikeCalcParagraph(trimmedLines)) {
    return { type: "paragraph", calc: true, children: parseInline(buildCalcText(trimmedLines)) };
  }

  const joined = trimmedLines.join(" ").replace(/ {2,}/g, " ").trim();
  return { type: "paragraph", children: parseInline(joined) };
}

/**
 * A worked-example/calculation walkthrough written as a plain paragraph
 * (several short "key = value" lines) should keep its line breaks rather
 * than reflow as prose — same rule as
 * pdf-generator/lib/md_parse.py's _looks_like_calc_paragraph.
 */
function looksLikeCalcParagraph(lines: string[]): boolean {
  if (lines.length < 2) return false;
  let hits = 0;
  for (const line of lines) {
    if (CALC_LINE_RE.test(line)) hits++;
  }
  return hits >= lines.length - 1 && hits >= 2;
}

/**
 * Rejoins calc-paragraph lines, breaking before a line that starts a new
 * "key = value" statement and merging (as a space) a continuation line that
 * doesn't — mirrors _preserve_linebreaks in the Python parser. The literal
 * "\n" left in the output is interpreted by parseInline() as an explicit
 * line break.
 */
function buildCalcText(trimmedLines: string[]): string {
  let out = trimmedLines[0] ?? "";
  for (let i = 1; i < trimmedLines.length; i++) {
    const next = trimmedLines[i];
    const startsNewCalcLine = next.slice(0, 45).includes("=");
    out += (startsNewCalcLine ? "\n" : " ") + next;
  }
  return out;
}

function splitTableRow(line: string): string[] {
  let t = line.trim();
  if (t.startsWith("|")) t = t.slice(1);
  if (t.endsWith("|")) t = t.slice(0, -1);
  return t.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
}
