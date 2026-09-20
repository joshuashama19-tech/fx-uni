#!/usr/bin/env python3
"""
FX University master PDF build script.

Usage:
    python3 build.py

Reads the approved course content from content/course/ and
content/course/production/ (never hardcoded into this script) and
assembles it, per content/course/production/pdf-production-spec.md and
production-manifest.md, into the single master student-facing PDF at
content/course/production/output/FX-University-Forex-Trading-Course.pdf.

Deterministic: running this against an unchanged content/course/ tree
produces the same document structure and content every time.
"""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib import config, fonts, styles as styles_mod, doctemplate, assemble


def main():
    t0 = time.time()
    os.makedirs(config.OUTPUT_DIR, exist_ok=True)

    print("Registering fonts...")
    fonts.register_fonts()

    print("Building styles...")
    styles = styles_mod.build_styles()

    print("Setting up document template...")
    doc = doctemplate.build_doc(config.OUTPUT_PATH)
    toc_flowable = doctemplate.build_toc(styles)

    print("Assembling story from content/course/ ...")
    story = assemble.build_full_story(styles, doc.usable_width, toc_flowable)
    print(f"  {len(story)} flowables assembled.")

    print("Running multiBuild (two-pass TOC page-number resolution)...")
    doc.multiBuild(story)

    elapsed = time.time() - t0
    size = os.path.getsize(config.OUTPUT_PATH)
    print(f"\nDone in {elapsed:.1f}s")
    print(f"Output: {config.OUTPUT_PATH}")
    print(f"Size: {size:,} bytes")


if __name__ == "__main__":
    main()
