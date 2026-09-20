"""
Page-level builders: cover, module cover, and section utilities. These are
the reusable templates pdf-production-spec.md section 29 asks for -- one
function per template, parameterized by content, never a hardcoded page.
"""
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    Paragraph, Spacer, PageBreak, NextPageTemplate, Table, TableStyle,
    HRFlowable,
)

from . import flowables as F

CB = colors.HexColor


def build_cover(styles, config):
    """pdf-production-spec.md section 7 / 21: premium, minimal cover.
    Required text only: 'FX UNIVERSITY' / 'Forex Trading Course'. No
    imagery, no clutter, no guaranteed-success language."""
    story = []
    story.append(Spacer(1, 2.6 * inch))
    story.append(F.hr_flowable(width=1.4 * inch, thickness=3,
                                color=config.COLOR_RED, space_before=0, space_after=0))
    story.append(Spacer(1, 22))
    story.append(Paragraph("FX UNIVERSITY", styles["CourseTitle"]))
    story.append(Paragraph("Forex Trading Course", styles["CourseSubtitle"]))
    story.append(Spacer(1, 46))
    story.append(Paragraph(
        "A complete, structured curriculum for learning the forex market, "
        "managing risk, building a trading plan, and developing a "
        "disciplined, testable process.",
        styles["CoverBody"],
    ))
    story.append(NextPageTemplate("Normal"))
    story.append(PageBreak())
    return story


def build_front_matter_page(fm_dict, blocks, styles, usable_width, render_blocks_fn,
                              new_page_after=True):
    """A generic front-matter page: its own '#' heading becomes a
    TOC-level-0 PartTitle, everything else renders normally."""
    from .render_blocks import render_blocks as _rb
    story = _rb(
        blocks, styles, usable_width,
        heading_toc_map={1: 0, 2: None, 3: None},
    )
    if new_page_after:
        story.append(PageBreak())
    return story


def extract_section(blocks, heading_plain_text, section_level=2, stop_at_any_heading=True):
    """Pull out a named '## Heading' section from a block list. Returns
    (section_blocks_without_its_own_heading, remaining_blocks).

    By default (stop_at_any_heading=True) the section ends at the very
    next heading of ANY level -- correct for "Module Introduction" and
    "Learning Objectives", which in this course's content are always a
    few paragraphs/a list with no nested subheadings of their own,
    immediately followed by "### Lesson 1" (a *deeper* heading than the
    section's own level-2, so a "stop at level <= section_level" rule
    would incorrectly swallow every lesson into the section)."""
    start = None
    for i, b in enumerate(blocks):
        if b["type"] == "heading" and b["level"] == section_level and b["plain"] == heading_plain_text:
            start = i
            break
    if start is None:
        return [], blocks
    end = len(blocks)
    for j in range(start + 1, len(blocks)):
        b = blocks[j]
        if b["type"] != "heading":
            continue
        if stop_at_any_heading or b["level"] <= section_level:
            end = j
            break
    section = blocks[start + 1:end]
    remaining = blocks[:start] + blocks[end:]
    return section, remaining


def build_module_cover(module_num, title, subtitle, intro_blocks, objectives_blocks,
                        styles, usable_width, config):
    """style-guide.md section 1: MODULE 0N / Title / Subtitle / Module
    Introduction / Learning Objectives, pulled from data already in the
    module's own frontmatter and content -- nothing new is written here."""
    from .render_blocks import render_blocks as _rb
    story = []
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph(f"MODULE {module_num:02d}", styles["ModuleEyebrow"]))
    title_p = F.make_heading_flowable(
        title, styles["ModuleTitle"], toc_level=0, plain_text=_plain(title),
    )
    story.append(title_p)
    if subtitle:
        story.append(Paragraph(subtitle, styles["ModuleSubtitle"]))
    story.append(F.hr_flowable(width=usable_width, thickness=1.2,
                                color=config.COLOR_BORDER, space_before=0, space_after=12))

    if intro_blocks:
        story.append(Paragraph("Module Introduction", styles["ModuleSectionLabel"]))
        story.extend(_rb(intro_blocks, styles, usable_width))

    if objectives_blocks:
        story.append(Paragraph("What You'll Learn", styles["ModuleSectionLabel"]))
        story.extend(_rb(objectives_blocks, styles, usable_width))

    story.append(PageBreak())
    return story


def _plain(xml_text):
    import re
    return re.sub(r"<[^>]+>", "", xml_text)


def resource_category_divider(name, styles, usable_width, config):
    story = []
    title_p = F.make_heading_flowable(
        name, styles["PartTitle"], toc_level=1, plain_text=name,
    )
    story.append(title_p)
    story.append(F.hr_flowable(width=usable_width, thickness=1.2,
                                color=config.COLOR_RED, space_before=0, space_after=10))
    return story
