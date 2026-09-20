"""
Shared configuration for the FX University PDF generator: paths, page
geometry, and the approved brand palette (content/course/production/style-guide.md
section 9 and pdf-production-spec.md section 10). Nothing here contains
course content -- this generator reads content/course/ programmatically.
"""
import os

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
GENERATOR_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTION_DIR = os.path.dirname(GENERATOR_DIR)
COURSE_DIR = os.path.dirname(PRODUCTION_DIR)
MODULES_DIR = os.path.join(COURSE_DIR, "modules")
FRONT_MATTER_DIR = os.path.join(PRODUCTION_DIR, "front-matter")
RESOURCE_LIBRARY_PATH = os.path.join(PRODUCTION_DIR, "resource-library.md")
COMPLETION_PAGE_PATH = os.path.join(PRODUCTION_DIR, "module-completion-page.md")
MODULE_INDEX_PATH = os.path.join(COURSE_DIR, "module-index.md")

OUTPUT_DIR = os.path.join(PRODUCTION_DIR, "output")
OUTPUT_FILENAME = "FX-University-Forex-Trading-Course.pdf"
OUTPUT_PATH = os.path.join(OUTPUT_DIR, OUTPUT_FILENAME)

QA_DIR = os.path.join(PRODUCTION_DIR, "qa")

# ---------------------------------------------------------------------------
# Modules, in the approved, unrenamed, unreordered sequence
# (matches module-index.md and production-manifest.md exactly)
# ---------------------------------------------------------------------------
MODULE_FOLDERS = [
    "module-01-forex-fundamentals",
    "module-02-reading-understanding-charts",
    "module-03-technical-analysis",
    "module-04-price-action",
    "module-05-fundamental-analysis",
    "module-06-risk-management",
    "module-07-trading-psychology",
    "module-08-building-a-trading-plan",
    "module-09-backtesting-trading-journal",
    "module-10-practical-forex-development",
]

FRONT_MATTER_FILES = [
    "01-cover-page.md",
    "02-welcome.md",
    "03-how-to-use-this-course.md",
    "04-course-roadmap.md",
    "05-table-of-contents.md",
]

# ---------------------------------------------------------------------------
# Page geometry (pdf-production-spec.md section 27)
# ---------------------------------------------------------------------------
from reportlab.lib.pagesizes import LETTER  # noqa: E402

PAGE_SIZE = LETTER
MARGIN_TOP = 0.85 * 72
MARGIN_BOTTOM = 0.75 * 72
MARGIN_LEFT = 0.9 * 72
MARGIN_RIGHT = 0.9 * 72

# ---------------------------------------------------------------------------
# Brand palette (style-guide.md section 9 / pdf-production-spec.md section 10)
# ---------------------------------------------------------------------------
COLOR_BLACK = "#0A0A0A"
COLOR_RED = "#E50914"
COLOR_DARK_RED = "#B20710"
COLOR_WHITE = "#FFFFFF"
COLOR_LIGHT_GRAY = "#F7F7F7"
COLOR_DARK_TEXT = "#171717"
COLOR_MUTED_TEXT = "#666666"
COLOR_BORDER = "#E5E5E5"

# ---------------------------------------------------------------------------
# Fonts
#
# Montserrat is required by the production spec but could not be obtained in
# this session: both the npm registry and the Ubuntu package archive (which
# carries the "fonts-montserrat" package) returned 403 host_not_allowed when
# accessed directly, and no other network path was available or attempted
# (per this environment's policy: report a blocked host, do not route around
# it). No Montserrat font file exists anywhere on this system.
#
# Substitute: Liberation Sans -- already installed, metrically compatible
# with Arial/Helvetica, and verified (via fontTools) to cover every
# character actually used in the course content (bold/italic/bold-italic
# all present). This is a visible, documented substitution, not a silent
# one -- see pdf-build-report.md "Known limitations."
# ---------------------------------------------------------------------------
FONT_DIR = "/usr/share/fonts/truetype/liberation"
FONT_REGULAR = os.path.join(FONT_DIR, "LiberationSans-Regular.ttf")
FONT_BOLD = os.path.join(FONT_DIR, "LiberationSans-Bold.ttf")
FONT_ITALIC = os.path.join(FONT_DIR, "LiberationSans-Italic.ttf")
FONT_BOLD_ITALIC = os.path.join(FONT_DIR, "LiberationSans-BoldItalic.ttf")

MONO_DIR = "/usr/share/fonts/truetype/liberation"
FONT_MONO_REGULAR = os.path.join(MONO_DIR, "LiberationMono-Regular.ttf")
FONT_MONO_BOLD = os.path.join(MONO_DIR, "LiberationMono-Bold.ttf")

FONT_FAMILY = "LiberationSans"
FONT_NAME = "LiberationSans"
FONT_NAME_BOLD = "LiberationSans-Bold"
FONT_NAME_ITALIC = "LiberationSans-Italic"
FONT_NAME_BOLD_ITALIC = "LiberationSans-BoldItalic"

MONO_FAMILY = "LiberationMono"
MONO_NAME = "LiberationMono"
MONO_NAME_BOLD = "LiberationMono-Bold"

# Requested typeface, retained here only so the substitution is traceable
# from the config a reader would expect to name it in.
REQUESTED_FONT = "Montserrat"
SUBSTITUTED_FONT = "Liberation Sans"

# ---------------------------------------------------------------------------
# Callout types (style-guide.md section 4)
# ---------------------------------------------------------------------------
CALLOUT_TYPES = {
    "KEY CONCEPT": {"label": "Key Concept", "accent": COLOR_RED},
    "EXAMPLE": {"label": "Example", "accent": COLOR_DARK_TEXT},
    "PRACTICAL NOTE": {"label": "Practical Note", "accent": COLOR_DARK_TEXT},
    "WATCH OUT": {"label": "Watch Out", "accent": COLOR_DARK_RED},
    "CHECKPOINT": {"label": "Checkpoint", "accent": COLOR_DARK_TEXT},
    "REMEMBER": {"label": "Remember", "accent": COLOR_RED},
    # Source-text labels that map onto the six approved types
    # (style-guide.md section 4, "Existing source" column).
    "BEGINNER MISTAKE": {"label": "Watch Out", "accent": COLOR_DARK_RED},
}
