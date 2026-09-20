"""
ParagraphStyle definitions implementing the typography hierarchy from
style-guide.md section 8 and pdf-production-spec.md section 9:
course title > module title > lesson title > section heading > body >
captions/notes. Centralized here so no template hardcodes its own fonts.
"""
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch

from . import config

F = config.FONT_NAME
FB = config.FONT_NAME_BOLD
FI = config.FONT_NAME_ITALIC
MONO = config.MONO_NAME


def build_styles():
    styles = {}

    styles["CourseTitle"] = ParagraphStyle(
        "CourseTitle", fontName=FB, fontSize=34, leading=40,
        textColor=config.COLOR_BLACK, alignment=TA_CENTER, spaceAfter=6,
    )
    styles["CourseSubtitle"] = ParagraphStyle(
        "CourseSubtitle", fontName=F, fontSize=16, leading=22,
        textColor=config.COLOR_MUTED_TEXT, alignment=TA_CENTER, spaceAfter=4,
    )
    styles["CoverAccent"] = ParagraphStyle(
        "CoverAccent", fontName=FB, fontSize=11, leading=14,
        textColor=config.COLOR_RED, alignment=TA_CENTER, spaceAfter=2,
        tracking=1.2,
    )
    styles["CoverBody"] = ParagraphStyle(
        "CoverBody", fontName=F, fontSize=11.5, leading=17,
        textColor=config.COLOR_DARK_TEXT, alignment=TA_CENTER,
        spaceBefore=18,
    )

    # Module cover ("MODULE 0N" + title + subtitle)
    styles["ModuleEyebrow"] = ParagraphStyle(
        "ModuleEyebrow", fontName=FB, fontSize=13, leading=16,
        textColor=config.COLOR_RED, alignment=TA_LEFT, spaceAfter=4,
    )
    styles["ModuleTitle"] = ParagraphStyle(
        "ModuleTitle", fontName=FB, fontSize=27, leading=32,
        textColor=config.COLOR_BLACK, alignment=TA_LEFT, spaceAfter=8,
    )
    styles["ModuleSubtitle"] = ParagraphStyle(
        "ModuleSubtitle", fontName=FI, fontSize=13, leading=18,
        textColor=config.COLOR_MUTED_TEXT, alignment=TA_LEFT, spaceAfter=14,
    )
    styles["ModuleSectionLabel"] = ParagraphStyle(
        "ModuleSectionLabel", fontName=FB, fontSize=11, leading=14,
        textColor=config.COLOR_DARK_TEXT, spaceBefore=10, spaceAfter=4,
    )

    # Front-matter / part-level pages (Welcome, How to Use, Roadmap, TOC,
    # Course Complete, resource-library category dividers)
    styles["PartTitle"] = ParagraphStyle(
        "PartTitle", fontName=FB, fontSize=24, leading=29,
        textColor=config.COLOR_BLACK, spaceAfter=14,
    )

    # In-document heading hierarchy (##, ###)
    styles["H1"] = ParagraphStyle(
        "H1", fontName=FB, fontSize=17, leading=21,
        textColor=config.COLOR_BLACK, spaceBefore=16, spaceAfter=8,
        keepWithNext=True,
    )
    styles["LessonTitle"] = ParagraphStyle(
        "LessonTitle", fontName=FB, fontSize=14.5, leading=18,
        textColor=config.COLOR_BLACK, spaceBefore=14, spaceAfter=7,
        keepWithNext=True, borderColor=config.COLOR_BORDER,
    )
    styles["H3"] = ParagraphStyle(
        "H3", fontName=FB, fontSize=12.5, leading=16,
        textColor=config.COLOR_DARK_TEXT, spaceBefore=10, spaceAfter=9,
        keepWithNext=True,
    )

    # Body text
    styles["Body"] = ParagraphStyle(
        "Body", fontName=F, fontSize=10.2, leading=14.6,
        textColor=config.COLOR_DARK_TEXT, spaceAfter=7, alignment=TA_LEFT,
    )
    styles["BodyBold"] = ParagraphStyle(
        "BodyBold", parent=styles["Body"], fontName=FB,
    )
    styles["ListItem"] = ParagraphStyle(
        "ListItem", parent=styles["Body"], leftIndent=14, spaceAfter=3,
        bulletIndent=2,
    )
    styles["CheckboxItem"] = ParagraphStyle(
        "CheckboxItem", parent=styles["Body"], leftIndent=18, spaceAfter=5,
    )

    # Captions / notes / production notes
    styles["Caption"] = ParagraphStyle(
        "Caption", fontName=FI, fontSize=8.7, leading=12,
        textColor=config.COLOR_MUTED_TEXT, spaceAfter=8,
    )
    styles["SourceCite"] = ParagraphStyle(
        "SourceCite", fontName=FI, fontSize=9, leading=12,
        textColor=config.COLOR_MUTED_TEXT, spaceAfter=6,
    )

    # Formula / template / fenced-code blocks (style-guide.md section 3)
    styles["Formula"] = ParagraphStyle(
        "Formula", fontName=MONO, fontSize=9.3, leading=13.2,
        textColor=config.COLOR_DARK_TEXT, leftIndent=6, spaceAfter=2,
    )

    # Table cell text
    styles["TableHeader"] = ParagraphStyle(
        "TableHeader", fontName=FB, fontSize=9, leading=12,
        textColor=config.COLOR_WHITE,
    )
    styles["TableCell"] = ParagraphStyle(
        "TableCell", fontName=F, fontSize=9, leading=12.5,
        textColor=config.COLOR_DARK_TEXT,
    )

    # Callout text (label rendered separately, bold, colored per type)
    styles["CalloutLabel"] = ParagraphStyle(
        "CalloutLabel", fontName=FB, fontSize=9.5, leading=13,
        textColor=config.COLOR_WHITE, spaceAfter=2,
    )
    styles["CalloutBody"] = ParagraphStyle(
        "CalloutBody", fontName=F, fontSize=9.8, leading=14,
        textColor=config.COLOR_DARK_TEXT,
    )

    # Quiz / exercise numbering
    styles["QuestionNumber"] = ParagraphStyle(
        "QuestionNumber", fontName=FB, fontSize=10.2, leading=15,
        textColor=config.COLOR_BLACK, spaceBefore=10, spaceAfter=4,
        keepWithNext=True,
    )

    # TOC entry styles (used by TableOfContents.levelStyles)
    styles["TOCModule"] = ParagraphStyle(
        "TOCModule", fontName=FB, fontSize=11, leading=15,
        textColor=config.COLOR_BLACK, spaceBefore=8,
    )
    styles["TOCLesson"] = ParagraphStyle(
        "TOCLesson", fontName=F, fontSize=9.3, leading=13,
        textColor=config.COLOR_MUTED_TEXT, leftIndent=14,
    )

    return styles
