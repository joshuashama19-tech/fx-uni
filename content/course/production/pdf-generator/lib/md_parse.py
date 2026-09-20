"""
Markdown -> block AST parser for the FX University course content.

Uses python-markdown (a mature, tested CommonMark-family parser -- not a
regex-only pass) for block structure and inline formatting. Fenced code
blocks are extracted before conversion and restored as literal "formula"
blocks afterward, so calculation/template whitespace is preserved exactly
(style-guide.md section 3: never compress or re-flow a verified
calculation). Checklist items (`- [ ] ...`) are detected after conversion
and rendered as their own block type.

Output is a flat list of block dicts:
  {"type": "heading", "level": 1|2|3, "xml": <reportlab mini-xml>, "plain": str}
  {"type": "paragraph", "xml": ...}
  {"type": "subhead", "xml": ...}            (a paragraph that is only **bold**)
  {"type": "blockquote", "callout": "KEY CONCEPT"|None, "xml": ...}
  {"type": "list", "ordered": bool, "items": [xml, ...]}
  {"type": "checklist", "items": [xml, ...]}
  {"type": "table", "header": [xml,...], "rows": [[xml,...], ...]}
  {"type": "formula", "text": raw literal string}
  {"type": "hr"}
"""
import re
import xml.etree.ElementTree as ET
from xml.sax.saxutils import escape as xml_escape

import markdown

_FENCE_RE = re.compile(r"```([^\n]*)\n(.*?)\n```", re.DOTALL)
_FRONTMATTER_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*\n", re.DOTALL)

_CALLOUT_LABELS = {
    "key concept": "KEY CONCEPT",
    "example": "EXAMPLE",
    "practical note": "PRACTICAL NOTE",
    "watch out": "WATCH OUT",
    "checkpoint": "CHECKPOINT",
    "remember": "REMEMBER",
    "beginner mistake": "BEGINNER MISTAKE",
    "reminder": "PRACTICAL NOTE",
}


def strip_frontmatter(text):
    """Return (frontmatter_dict, body_text)."""
    m = _FRONTMATTER_RE.match(text)
    if not m:
        return {}, text
    fm_text = m.group(1)
    fm = {}
    for line in fm_text.splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            fm[k.strip()] = v.strip()
    return fm, text[m.end():]


def _extract_fences(text):
    fences = []

    def repl(m):
        fences.append(m.group(2))
        return f"\n\nFENCEPLACEHOLDER{len(fences) - 1}FENCEPLACEHOLDER\n\n"

    new_text = _FENCE_RE.sub(repl, text)
    return new_text, fences


def _inline_xml(elem, skip_tag_itself=True):
    """Recursively render an element's mixed content as reportlab mini-XML."""
    parts = []
    if not skip_tag_itself:
        parts.append(_open_tag(elem))
    if elem.text:
        parts.append(xml_escape(elem.text))
    for child in elem:
        parts.append(_inline_xml_full(child))
        if child.tail:
            parts.append(xml_escape(child.tail))
    if not skip_tag_itself:
        parts.append(_close_tag(elem))
    return "".join(parts)


def _inline_xml_full(elem):
    tag = elem.tag
    inner = []
    if elem.text:
        inner.append(xml_escape(elem.text))
    for child in elem:
        inner.append(_inline_xml_full(child))
        if child.tail:
            inner.append(xml_escape(child.tail))
    inner_str = "".join(inner)

    if tag in ("strong", "b"):
        return f"<b>{inner_str}</b>"
    if tag in ("em", "i"):
        return f"<i>{inner_str}</i>"
    if tag == "code":
        return f'<font face="LiberationMono">{inner_str}</font>'
    if tag == "a":
        href = elem.get("href", "")
        return f'<a href="{xml_escape(href)}" color="#B20710">{inner_str}</a>'
    if tag == "br":
        return "<br/>"
    # Unknown inline tag: just return its text content
    return inner_str


def _open_tag(elem):
    return ""


def _close_tag(elem):
    return ""


def _plain_text(elem):
    return "".join(elem.itertext())


_CALC_LINE_RE = re.compile(r"[=]|^[A-Za-z][A-Za-z0-9 /().'-]{0,30}:\s*\S")


def _looks_like_calc_paragraph(plain_text):
    """Heuristic: a paragraph made of several short 'key = value'-style
    lines (a worked-example walkthrough written as a plain paragraph
    rather than a fenced block) should keep its line breaks rather than
    reflow as prose -- style-guide.md section 3's "never compress a
    step-by-step calculation" applies here too, even outside a fence."""
    lines = [l for l in plain_text.split("\n") if l.strip()]
    if len(lines) < 2:
        return False
    hits = sum(1 for l in lines if _CALC_LINE_RE.search(l))
    return hits >= len(lines) - 1 and hits >= 2


_NEW_CALC_LINE_RE = re.compile(r"\n(?=[^\n]{0,45}=)")


def _preserve_linebreaks(xml_str):
    """Break before a line that starts a new 'key = value' statement;
    merge (as a plain space) a continuation line that doesn't -- avoids
    inserting a hard break mid-sentence just because the paragraph also
    contains calc lines elsewhere."""
    xml_str = _NEW_CALC_LINE_RE.sub("<br/>", xml_str)
    xml_str = xml_str.replace("\n", " ")
    xml_str = _MULTI_SPACE_RE.sub(" ", xml_str).strip()
    return xml_str


def _is_bold_only_paragraph(p_elem):
    """True if <p> contains exactly one <strong> child and no other text."""
    children = list(p_elem)
    text_before = (p_elem.text or "").strip()
    if text_before:
        return False
    if len(children) != 1:
        return False
    child = children[0]
    if child.tag != "strong":
        return False
    tail = (child.tail or "").strip()
    if tail:
        return False
    return True


def _detect_callout(p_elem):
    """If a <blockquote>'s first <p> starts with '**Label:**', return
    (callout_key, remaining_xml) else (None, full_xml)."""
    children = list(p_elem)
    text_start = (p_elem.text or "")
    if children and children[0].tag == "strong":
        label_text = _plain_text(children[0]).strip().rstrip(":").lower()
        if label_text in _CALLOUT_LABELS and not text_start.strip():
            callout_key = _CALLOUT_LABELS[label_text]
            # Rebuild xml without the leading "**Label:**" bold run
            rest = []
            if children[0].tail:
                rest.append(xml_escape(children[0].tail))
            for child in children[1:]:
                rest.append(_inline_xml_full(child))
                if child.tail:
                    rest.append(xml_escape(child.tail))
            return callout_key, "".join(rest).strip()
    return None, _inline_xml(p_elem)


def parse_markdown(text, extensions=("tables", "sane_lists")):
    """Parse markdown body text (frontmatter already stripped) into blocks."""
    text_no_fences, fences = _extract_fences(text)
    html = markdown.markdown(text_no_fences, extensions=list(extensions))
    wrapped = f"<root>{html}</root>"
    try:
        root = ET.fromstring(wrapped)
    except ET.ParseError:
        # Recovery: escape stray bare ampersands/lt that aren't valid XML
        # entities, then retry once.
        cleaned = re.sub(r"&(?!amp;|lt;|gt;|#\d+;|#x[0-9a-fA-F]+;)", "&amp;", wrapped)
        root = ET.fromstring(cleaned)

    blocks = []
    for elem in root:
        tag = elem.tag
        if tag in ("h1", "h2", "h3", "h4"):
            level = int(tag[1])
            blocks.append({
                "type": "heading",
                "level": min(level, 3),
                "xml": _inline_xml(elem),
                "plain": _plain_text(elem).strip(),
            })
        elif tag == "p":
            plain = _plain_text(elem).strip()
            fence_m = re.fullmatch(r"FENCEPLACEHOLDER(\d+)FENCEPLACEHOLDER", plain)
            if fence_m:
                idx = int(fence_m.group(1))
                blocks.append({"type": "formula", "text": fences[idx]})
            elif _is_bold_only_paragraph(elem):
                blocks.append({
                    "type": "subhead",
                    "xml": _inline_xml_full(list(elem)[0]).replace("<b>", "").replace("</b>", ""),
                })
            else:
                para_xml = _inline_xml(elem)
                if _looks_like_calc_paragraph(plain):
                    blocks.append({
                        "type": "paragraph",
                        "xml": _preserve_linebreaks(para_xml),
                        "calc": True,
                    })
                else:
                    blocks.append({"type": "paragraph", "xml": para_xml})
        elif tag == "blockquote":
            inner_ps = [c for c in elem if c.tag == "p"]
            if not inner_ps:
                continue
            callout_key, first_xml = _detect_callout(inner_ps[0])
            rest_xml = " ".join(_inline_xml(p) for p in inner_ps[1:])
            full_xml = (first_xml + (" " + rest_xml if rest_xml else "")).strip()
            blocks.append({
                "type": "blockquote",
                "callout": callout_key,
                "xml": full_xml,
            })
        elif tag in ("ul", "ol"):
            items = []
            checklist_items = []
            is_checklist = False
            for li in elem.findall("li"):
                li_text = li.text or ""
                stripped = li_text.lstrip()
                if stripped.startswith("[ ] ") or stripped.startswith("[ ]"):
                    is_checklist = True
                    new_text = stripped.split("]", 1)[1]
                    if new_text.startswith(" "):
                        new_text = new_text[1:]
                    li_copy_xml = xml_escape(new_text)
                    for child in li:
                        li_copy_xml += _inline_xml_full(child)
                        if child.tail:
                            li_copy_xml += xml_escape(child.tail)
                    checklist_items.append(li_copy_xml)
                else:
                    items.append(_inline_xml(li))
            if is_checklist:
                blocks.append({"type": "checklist", "items": checklist_items})
            else:
                blocks.append({
                    "type": "list",
                    "ordered": tag == "ol",
                    "items": items,
                })
        elif tag == "table":
            header = []
            thead = elem.find("thead")
            if thead is not None:
                for th in thead.find("tr").findall("th"):
                    header.append(_inline_xml(th))
            rows = []
            tbody = elem.find("tbody")
            if tbody is not None:
                for tr in tbody.findall("tr"):
                    rows.append([_inline_xml(td) for td in tr.findall("td")])
            blocks.append({"type": "table", "header": header, "rows": rows})
        elif tag == "hr":
            blocks.append({"type": "hr"})
        # else: ignore unknown top-level tags

    _normalize_whitespace(blocks)
    return blocks


_WS_RE = re.compile(r"[ \t]*\n[ \t]*")
_MULTI_SPACE_RE = re.compile(r" {2,}")


def _collapse(s):
    if s is None:
        return s
    s = _WS_RE.sub(" ", s)
    s = _MULTI_SPACE_RE.sub(" ", s)
    return s.strip()


def _normalize_whitespace(blocks):
    """Collapse soft-wrapped newlines to spaces everywhere except formula
    blocks (literal, preformatted) and paragraphs already flagged as
    calc-style (which use explicit <br/> tags, not bare newlines)."""
    for b in blocks:
        t = b["type"]
        if t == "paragraph" and not b.get("calc"):
            b["xml"] = _collapse(b["xml"])
        elif t in ("heading", "subhead", "blockquote"):
            b["xml"] = _collapse(b["xml"])
        elif t in ("list", "checklist"):
            b["items"] = [_collapse(i) for i in b["items"]]
        elif t == "table":
            b["header"] = [_collapse(h) for h in b["header"]]
            b["rows"] = [[_collapse(c) for c in row] for row in b["rows"]]
        # "formula" (literal) and calc-paragraphs are left untouched


def parse_markdown_file(path):
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()
    fm, body = strip_frontmatter(raw)
    blocks = parse_markdown(body)
    return fm, blocks
