"""
Converts parsed markdown blocks (lib.md_parse) into a flat list of
reportlab flowables, using the reusable components in lib.flowables and
the shared ParagraphStyles in lib.styles. This is the one place that
walks a block list -- every content file (lessons, exercises, quizzes,
answer keys, checklists, resource library) goes through it, so nothing
is hardcoded per page.
"""
import re

from reportlab.platypus import Spacer, PageBreak

from . import flowables as F


def render_blocks(blocks, styles, usable_width, heading_toc_map=None,
                   skip_plain_headings=None, question_number_re=None):
    """heading_toc_map: {markdown level (1/2/3): toc_level or None}.
    skip_plain_headings: set of heading plain-text strings to omit
    entirely (already rendered elsewhere, e.g. on a module/part cover).
    question_number_re: if given, a paragraph/heading whose plain text
    matches gets QuestionNumber styling (quizzes/exercises/answer keys).
    """
    heading_toc_map = heading_toc_map or {}
    skip_plain_headings = skip_plain_headings or set()
    out = []

    for b in blocks:
        t = b["type"]

        if t == "heading":
            if b["plain"] in skip_plain_headings:
                continue
            level = b["level"]
            style = {1: styles["PartTitle"], 2: styles["H1"], 3: styles["LessonTitle"]}.get(
                level, styles["H3"]
            )
            toc_level = heading_toc_map.get(level)
            if toc_level is not None:
                out.append(F.make_heading_flowable(
                    b["xml"], style, toc_level, plain_text=b["plain"],
                ))
            else:
                p_style = style
                from reportlab.platypus import Paragraph
                out.append(Paragraph(b["xml"], p_style))

        elif t == "subhead":
            from reportlab.platypus import Paragraph
            out.append(Paragraph(b["xml"], styles["H3"]))

        elif t == "paragraph":
            from reportlab.platypus import Paragraph
            xml = b["xml"]
            style = styles["Body"]
            if question_number_re and question_number_re.match(_strip_tags(xml)):
                style = styles["QuestionNumber"]
            out.append(Paragraph(xml, style))

        elif t == "blockquote":
            if b["callout"]:
                out.append(F.callout_flowable(b["callout"], b["xml"], styles))
            else:
                from reportlab.platypus import Paragraph
                out.append(Paragraph(b["xml"], styles["CalloutBody"]))

        elif t == "list":
            out.extend(F.bullet_list_flowable(b["items"], styles, ordered=b["ordered"]))

        elif t == "checklist":
            out.append(F.checklist_flowable(b["items"], styles, usable_width))
            out.append(Spacer(1, 6))

        elif t == "table":
            out.extend(F.table_flowable(b["header"], b["rows"], styles, usable_width))

        elif t == "formula":
            out.append(F.formula_flowable(b["text"], styles))

        elif t == "hr":
            out.append(F.hr_flowable())

    return out


_TAG_RE = re.compile(r"<[^>]+>")


def _strip_tags(s):
    return _TAG_RE.sub("", s)
