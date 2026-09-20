"""
Font registration. Registers the Liberation Sans family (documented
substitute for Montserrat -- see config.py) and Liberation Mono (for
formula/template/code blocks) with reportlab, so both are embedded in the
generated PDF.
"""
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from . import config

_REGISTERED = False


def register_fonts():
    """Register all fonts used by the generator. Idempotent."""
    global _REGISTERED
    if _REGISTERED:
        return
    pdfmetrics.registerFont(TTFont(config.FONT_NAME, config.FONT_REGULAR))
    pdfmetrics.registerFont(TTFont(config.FONT_NAME_BOLD, config.FONT_BOLD))
    pdfmetrics.registerFont(TTFont(config.FONT_NAME_ITALIC, config.FONT_ITALIC))
    pdfmetrics.registerFont(
        TTFont(config.FONT_NAME_BOLD_ITALIC, config.FONT_BOLD_ITALIC)
    )
    pdfmetrics.registerFontFamily(
        config.FONT_FAMILY,
        normal=config.FONT_NAME,
        bold=config.FONT_NAME_BOLD,
        italic=config.FONT_NAME_ITALIC,
        boldItalic=config.FONT_NAME_BOLD_ITALIC,
    )

    pdfmetrics.registerFont(TTFont(config.MONO_NAME, config.FONT_MONO_REGULAR))
    pdfmetrics.registerFont(TTFont(config.MONO_NAME_BOLD, config.FONT_MONO_BOLD))
    pdfmetrics.registerFontFamily(
        config.MONO_FAMILY,
        normal=config.MONO_NAME,
        bold=config.MONO_NAME_BOLD,
        italic=config.MONO_NAME,
        boldItalic=config.MONO_NAME_BOLD,
    )
    _REGISTERED = True
