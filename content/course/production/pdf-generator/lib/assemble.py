"""
Reads the approved course content directly from disk (content/course/ and
content/course/production/) and assembles the full reportlab story, in
exactly the order production-manifest.md specifies. This file contains no
course text of its own -- everything rendered comes from parsing the
existing markdown files.
"""
import os
import re

from reportlab.platypus import PageBreak, Paragraph, Spacer
from reportlab.lib.units import inch

from . import config
from . import md_parse
from . import pages
from . import flowables as F
from .render_blocks import render_blocks, _strip_tags

_QUESTION_RE = re.compile(r"^\d+\.")


def _is_production_note(b):
    if b["type"] != "paragraph":
        return False
    return _strip_tags(b["xml"]).strip().startswith("Production note")


def _filter_notes(blocks):
    return [b for b in blocks if not _is_production_note(b)]


def _strip_leading_module_title(blocks, subtitle_text):
    """Remove the module's own '# Module N — Title' h1 and the italic
    subtitle-echo paragraph right after it (both already shown on the
    module cover, built separately from frontmatter)."""
    out = list(blocks)
    if out and out[0]["type"] == "heading" and out[0]["level"] == 1:
        out = out[1:]
    if out and out[0]["type"] == "paragraph":
        plain = _strip_tags(out[0]["xml"]).strip().strip('"')
        if subtitle_text and plain.lower() == subtitle_text.strip().strip('"').lower():
            out = out[1:]
    return out


def build_module_section(folder_name, module_num, styles, usable_width):
    content_path = os.path.join(config.MODULES_DIR, folder_name, "01-content.md")
    fm, blocks = md_parse.parse_markdown_file(content_path)
    blocks = _filter_notes(blocks)

    title = fm.get("title", folder_name)
    subtitle = fm.get("subtitle", "")

    intro_blocks, blocks = pages.extract_section(blocks, "Module Introduction", 2)
    objectives_blocks, blocks = pages.extract_section(blocks, "Learning Objectives", 2)
    blocks = _strip_leading_module_title(blocks, subtitle)

    story = pages.build_module_cover(
        module_num, f"Module {module_num} — {title}", subtitle,
        intro_blocks, objectives_blocks, styles, usable_width, config,
    )

    story.extend(render_blocks(
        blocks, styles, usable_width,
        heading_toc_map={2: None, 3: 1},
    ))
    story.append(PageBreak())

    # Exercises / Quiz / Answer Key / Checklist -- each its own section,
    # module assembly order fixed by production-manifest.md.
    for fname in ("02-exercises.md", "03-quiz.md", "04-answer-key.md", "05-checklist.md"):
        fpath = os.path.join(config.MODULES_DIR, folder_name, fname)
        f_fm, f_blocks = md_parse.parse_markdown_file(fpath)
        f_blocks = _filter_notes(f_blocks)
        is_quiz_or_key = fname in ("03-quiz.md", "04-answer-key.md")
        story.extend(render_blocks(
            f_blocks, styles, usable_width,
            heading_toc_map={1: None, 2: None, 3: None},
            question_number_re=_QUESTION_RE if is_quiz_or_key else None,
        ))
        story.append(PageBreak())

    return story


_RESOURCE_CATEGORIES = [
    "Risk Management", "Trading Plan", "Backtesting & Journaling",
    "Practical Development",
]


def build_resource_library(styles, usable_width):
    fm, blocks = md_parse.parse_markdown_file(config.RESOURCE_LIBRARY_PATH)
    blocks = _filter_notes(blocks)

    # Leading "# Practical Resource Library" heading + any intro paragraphs
    # before the first "## <Category>" heading.
    first_cat_idx = next(
        (i for i, b in enumerate(blocks)
         if b["type"] == "heading" and b["level"] == 2), len(blocks)
    )
    lead_blocks = blocks[1:first_cat_idx]  # skip the h1 itself
    remaining = blocks[first_cat_idx:]

    story = []
    title_p = F.make_heading_flowable(
        "Practical Resource Library", styles["PartTitle"], toc_level=0,
        plain_text="Practical Resource Library",
    )
    story.append(title_p)
    story.extend(render_blocks(lead_blocks, styles, usable_width))

    for i, category in enumerate(_RESOURCE_CATEGORIES):
        section_blocks, remaining = pages.extract_section(
            remaining, category, 2, stop_at_any_heading=False,
        )
        story.append(PageBreak())
        story.extend(pages.resource_category_divider(category, styles, usable_width, config))
        story.extend(render_blocks(
            section_blocks, styles, usable_width,
            heading_toc_map={3: 2},
        ))

    return story


def build_course_complete(styles, usable_width):
    fm, blocks = md_parse.parse_markdown_file(config.COMPLETION_PAGE_PATH)
    blocks = _filter_notes(blocks)
    story = []
    story.extend(render_blocks(
        blocks, styles, usable_width,
        heading_toc_map={1: 0, 2: None, 3: None},
    ))
    return story


def build_front_matter_file(filename, styles, usable_width, new_page_after=True):
    fpath = os.path.join(config.FRONT_MATTER_DIR, filename)
    fm, blocks = md_parse.parse_markdown_file(fpath)
    blocks = _filter_notes(blocks)
    story = render_blocks(
        blocks, styles, usable_width,
        heading_toc_map={1: 0, 2: None, 3: None},
    )
    if new_page_after:
        story.append(PageBreak())
    return story


def build_table_of_contents_page(styles, usable_width, toc_flowable):
    """Renders the TOC page's own title, then the auto-generated,
    real-page-numbered TableOfContents flowable -- not a hand-typed list
    (pdf-production-spec.md section 13). The source file
    front-matter/05-table-of-contents.md remains the human-readable
    reference version; its body text is intentionally not re-rendered
    here since it has no page numbers by design."""
    story = []
    title_p = F.make_heading_flowable(
        "Table of Contents", styles["PartTitle"], toc_level=0,
        plain_text="Table of Contents",
    )
    story.append(title_p)
    story.append(Spacer(1, 6))
    story.append(toc_flowable)
    story.append(PageBreak())
    return story


def build_full_story(styles, usable_width, toc_flowable):
    story = []
    story.extend(pages.build_cover(styles, config))
    story.extend(build_front_matter_file("02-welcome.md", styles, usable_width))
    story.extend(build_front_matter_file("03-how-to-use-this-course.md", styles, usable_width))
    story.extend(build_front_matter_file("04-course-roadmap.md", styles, usable_width))
    story.extend(build_table_of_contents_page(styles, usable_width, toc_flowable))

    for i, folder in enumerate(config.MODULE_FOLDERS, start=1):
        story.extend(build_module_section(folder, i, styles, usable_width))

    story.extend(build_resource_library(styles, usable_width))
    story.extend(build_course_complete(styles, usable_width))

    # Drop a single trailing PageBreak if the very last flowable is one
    # (avoids generating a blank final page).
    while story and isinstance(story[-1], PageBreak):
        story.pop()

    return story
