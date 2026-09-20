"""
Reusable page/content components (pdf-production-spec.md section 29:
"Build architecture" -- page templates, callouts, tables, etc. must be
reusable functions, not hardcoded per page).
"""
import re
from xml.sax.saxutils import escape as xml_escape

from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether,
    HRFlowable, ListFlowable, ListItem, CondPageBreak,
)

from . import config

CB = colors.HexColor


# ---------------------------------------------------------------------------
# Heading registration (bookmarks + TOC notifications) -- shared by every
# renderer that produces a heading, so bookmarks/outline/TOC stay in sync.
# ---------------------------------------------------------------------------
_heading_counter = {"n": 0}


def make_heading_flowable(text_xml, style, toc_level, plain_text=None, doc_key_prefix="h"):
    """A Paragraph instance tagged so the DocTemplate's afterFlowable hook
    can register it with the TOC and the PDF outline/bookmarks."""
    _heading_counter["n"] += 1
    key = f"{doc_key_prefix}-{_heading_counter['n']}"
    p = Paragraph(text_xml, style)
    p._toc_level = toc_level
    p._bookmark_key = key
    p._toc_text = plain_text if plain_text is not None else re.sub("<[^>]+>", "", text_xml)
    return p


# ---------------------------------------------------------------------------
# Callouts (style-guide.md section 4 / pdf-production-spec.md section 16)
# ---------------------------------------------------------------------------
def callout_flowable(callout_key, body_xml, styles):
    meta = config.CALLOUT_TYPES.get(callout_key, config.CALLOUT_TYPES["PRACTICAL NOTE"])
    label = meta["label"].upper()
    accent = CB(meta["accent"])

    label_style = styles["CalloutLabel"]
    body_style = styles["CalloutBody"]

    label_p = Paragraph(label, label_style)
    body_p = Paragraph(body_xml, body_style)

    inner = Table(
        [[label_p], [body_p]],
        colWidths=[None],
    )
    inner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), accent),
        ("BACKGROUND", (0, 1), (0, 1), CB(config.COLOR_LIGHT_GRAY)),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (0, 0), 5),
        ("BOTTOMPADDING", (0, 0), (0, 0), 5),
        ("TOPPADDING", (0, 1), (0, 1), 7),
        ("BOTTOMPADDING", (0, 1), (0, 1), 9),
        ("LINEBELOW", (0, 1), (0, 1), 0.75, CB(config.COLOR_BORDER)),
        ("LINEAFTER", (0, 0), (0, 1), 0, accent),
    ]))
    return KeepTogether([Spacer(1, 4), inner, Spacer(1, 8)])


# ---------------------------------------------------------------------------
# Formula / template blocks (style-guide.md section 3)
# ---------------------------------------------------------------------------
def formula_flowable(raw_text, styles):
    from reportlab.lib.styles import ParagraphStyle

    escaped = xml_escape(raw_text)
    # Preserve exact spacing/alignment: convert runs of 2+ spaces (and
    # leading indentation) to non-breaking spaces -- reportlab's Paragraph
    # engine otherwise collapses all whitespace runs to one space.
    escaped = re.sub(r"  +", lambda m: " " * len(m.group(0)), escaped)
    escaped = re.sub(r"^ ", " ", escaped, flags=re.MULTILINE)
    escaped = escaped.replace("\n", "<br/>")

    base = styles["Formula"]
    boxed_style = ParagraphStyle(
        "FormulaBoxed", parent=base,
        backColor=CB(config.COLOR_LIGHT_GRAY),
        borderColor=CB(config.COLOR_BORDER),
        borderWidth=0.75,
        borderPadding=(8, 10, 8, 10),
        spaceBefore=6,
        spaceAfter=8,
    )
    # A styled Paragraph (not a single-row Table) so a long template can
    # split across a page break instead of raising a LayoutError -- most
    # formulas are short and simply won't split in practice.
    return Paragraph(escaped, boxed_style)


# ---------------------------------------------------------------------------
# Checklists (style-guide.md section 6 / pdf-production-spec.md section 20)
# Checkboxes are drawn vector squares, not a Unicode ballot-box glyph --
# more reliable across fonts than depending on glyph coverage (Liberation
# Sans has no U+2610; see lib/config.py's font-substitution note).
# ---------------------------------------------------------------------------
class _CheckboxCell:
    """A tiny flowable that draws a checkbox square, sized to one line."""
    pass


def checklist_flowable(items_xml, styles, usable_width):
    rows = []
    box_w = 11
    for item_xml in items_xml:
        p = Paragraph(item_xml, styles["CheckboxItem"])
        rows.append([_CheckboxDrawer(box_w), p])
    t = Table(rows, colWidths=[box_w + 8, usable_width - box_w - 8])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (1, 0), (1, -1), 0),
    ]))
    return t


from reportlab.platypus import Flowable  # noqa: E402


class _CheckboxDrawer(Flowable):
    def __init__(self, size=11):
        super().__init__()
        self.size = size
        self.width = size
        self.height = size + 4

    def draw(self):
        c = self.canv
        c.setStrokeColor(CB(config.COLOR_DARK_TEXT))
        c.setLineWidth(1)
        c.rect(0, 2, self.size, self.size, stroke=1, fill=0)


# ---------------------------------------------------------------------------
# Tables (pdf-production-spec.md section 17)
# ---------------------------------------------------------------------------
def table_flowable(header, rows, styles, usable_width):
    ncols = max(len(header), max((len(r) for r in rows), default=1)) if (header or rows) else 1
    if ncols == 0:
        ncols = 1
    col_w = usable_width / ncols

    data = []
    if header:
        data.append([Paragraph(h, styles["TableHeader"]) for h in header])
    for row in rows:
        padded = list(row) + [""] * (ncols - len(row))
        data.append([Paragraph(c, styles["TableCell"]) for c in padded])

    if not data:
        return Spacer(1, 0)

    t = Table(data, colWidths=[col_w] * ncols, repeatRows=1 if header else 0)
    style_cmds = [
        ("GRID", (0, 0), (-1, -1), 0.6, CB(config.COLOR_BORDER)),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    if header:
        style_cmds.append(("BACKGROUND", (0, 0), (-1, 0), CB(config.COLOR_BLACK)))
    t.setStyle(TableStyle(style_cmds))
    # Not wrapped in KeepTogether: a long table (e.g. a fill-in log) should
    # be allowed to flow across a page break, with its header row repeated
    # (repeatRows=1 above) rather than forced onto one page.
    return [Spacer(1, 3), t, Spacer(1, 8)]


# ---------------------------------------------------------------------------
# Lists
# ---------------------------------------------------------------------------
def bullet_list_flowable(items_xml, styles, ordered=False):
    flowables = []
    for i, item_xml in enumerate(items_xml, start=1):
        bullet = f"{i}." if ordered else "•"
        p = Paragraph(f"{bullet}&nbsp;&nbsp;{item_xml}", styles["ListItem"])
        flowables.append(p)
    return flowables


# ---------------------------------------------------------------------------
# Horizontal rule
# ---------------------------------------------------------------------------
def hr_flowable(width="100%", thickness=0.75, color=None, space_before=10, space_after=10):
    return HRFlowable(
        width=width, thickness=thickness,
        color=CB(color or config.COLOR_BORDER),
        spaceBefore=space_before, spaceAfter=space_after,
    )
