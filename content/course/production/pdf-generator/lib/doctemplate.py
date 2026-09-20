"""
The master document template: page geometry, header/footer + continuous
page numbering (pdf-production-spec.md sections 11-12), automatic TOC with
real page numbers via reportlab's multiBuild two-pass resolution (section
13), and PDF bookmarks/outline for internal navigation (section 14).
"""
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph
from reportlab.platypus.tableofcontents import TableOfContents

from . import config

CB = colors.HexColor


class MasterDocTemplate(BaseDocTemplate):
    """BaseDocTemplate subclass that, after every heading flowable is
    drawn, registers it with the TOC (for automatic page-number
    resolution across multiBuild's two passes) and with the PDF's
    bookmarks/outline (for internal navigation)."""

    def afterFlowable(self, flowable):
        level = getattr(flowable, "_toc_level", None)
        if level is None:
            return
        key = flowable._bookmark_key
        text = flowable._toc_text
        self.canv.bookmarkPage(key)
        self.notify("TOCEntry", (level, text, self.page, key))
        self.canv.addOutlineEntry(text, key, level=level, closed=(level > 0))


def _draw_footer(canvas, doc):
    """FX UNIVERSITY (left) / page number (right); skipped on the cover
    page. Continuous numbering, never restarted per module (section 12)."""
    if getattr(doc, "_is_cover_page", False):
        return
    canvas.saveState()
    canvas.setFont(config.FONT_NAME, 8.3)
    canvas.setFillColor(CB(config.COLOR_MUTED_TEXT))
    y = 0.5 * inch
    canvas.drawString(config.MARGIN_LEFT, y, "FX UNIVERSITY")
    canvas.drawRightString(
        config.PAGE_SIZE[0] - config.MARGIN_RIGHT, y, str(doc.page)
    )
    canvas.setStrokeColor(CB(config.COLOR_BORDER))
    canvas.setLineWidth(0.5)
    canvas.line(
        config.MARGIN_LEFT, y + 14,
        config.PAGE_SIZE[0] - config.MARGIN_RIGHT, y + 14,
    )
    canvas.restoreState()


def _on_cover_page(canvas, doc):
    doc._is_cover_page = True
    # No footer/header on the cover (pdf-production-spec.md section 11).


def _on_normal_page(canvas, doc):
    doc._is_cover_page = False
    _draw_footer(canvas, doc)


def build_doc(output_path):
    doc = MasterDocTemplate(
        output_path,
        pagesize=config.PAGE_SIZE,
        leftMargin=config.MARGIN_LEFT,
        rightMargin=config.MARGIN_RIGHT,
        topMargin=config.MARGIN_TOP,
        bottomMargin=config.MARGIN_BOTTOM,
        title="FX University — Forex Trading Course",
        author="FX University",
        subject="FX University complete student curriculum",
    )
    usable_width = config.PAGE_SIZE[0] - config.MARGIN_LEFT - config.MARGIN_RIGHT
    usable_height = config.PAGE_SIZE[1] - config.MARGIN_TOP - config.MARGIN_BOTTOM

    cover_frame = Frame(
        config.MARGIN_LEFT, config.MARGIN_BOTTOM, usable_width, usable_height,
        id="cover",
    )
    normal_frame = Frame(
        config.MARGIN_LEFT, config.MARGIN_BOTTOM, usable_width, usable_height,
        id="normal",
    )
    doc.addPageTemplates([
        PageTemplate(id="Cover", frames=[cover_frame], onPage=_on_cover_page),
        PageTemplate(id="Normal", frames=[normal_frame], onPage=_on_normal_page),
    ])
    doc.usable_width = usable_width
    return doc


def build_toc(styles):
    toc = TableOfContents()
    toc.levelStyles = [
        styles["TOCModule"],
        styles["TOCLesson"],
        styles["TOCLesson"],
    ]
    toc.dotsMinLevel = 0
    return toc
