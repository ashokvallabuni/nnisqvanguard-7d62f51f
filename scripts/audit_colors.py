"""Audit colour usage across src/ and public/. Usage: python scripts/audit_colors.py [--files]"""
import os
import re
import sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIRS = ["src", "public"]
EXT = (".tsx", ".ts", ".css", ".svg", ".html", ".json", ".webmanifest")
SKIP_FILES = {"routeTree.gen.ts", "types.ts"}

OLD = r"(?:bg|text|border|ring|shadow|fill|stroke|divide|outline|decoration|from|to|via|accent|caret)-(?:purple|violet|indigo|fuchsia|pink|rose|emerald|green|teal|lime|orange|amber|yellow|red|cyan|sky|slate|gray|zinc|neutral|stone)-\d{2,3}"
CATS = {
    "old_tailwind_colors": re.compile(OLD),
    "dark_bg_classes(black/navy/navy2)": re.compile(r"\b(?:bg|from|to|via)-(?:black|nisq-navy2?|nisq-navy)\b(?!-)"),
    "text-white": re.compile(r"\btext-white\b"),
    "dark:_variants": re.compile(r"\bdark:"),
    "hex_colors": re.compile(r"#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![\w-])"),
    "rgb_hsl_fn": re.compile(r"\b(?:rgba?|hsla?|oklch)\("),
    "inline_style": re.compile(r"style=\{\{"),
    "svg_fill_stroke_attr": re.compile(r"\b(?:fill|stroke)=\"(?!none|currentColor)[^\"]+\""),
    "gradients": re.compile(r"(?:linear|radial|conic)-gradient|bg-gradient-|\bfrom-|\bvia-"),
}


def scan():
    totals = defaultdict(int)
    per_file = defaultdict(lambda: defaultdict(int))
    for d in DIRS:
        for base, _, files in os.walk(os.path.join(ROOT, d)):
            for f in files:
                if not f.endswith(EXT) or f in SKIP_FILES:
                    continue
                p = os.path.join(base, f)
                try:
                    text = open(p, encoding="utf-8").read()
                except Exception:
                    continue
                rel = os.path.relpath(p, ROOT).replace("\\", "/")
                for name, rx in CATS.items():
                    n = len(rx.findall(text))
                    if n:
                        per_file[rel][name] = n
                        totals[name] += n
    return totals, per_file


if __name__ == "__main__":
    totals, per_file = scan()
    print("=== TOTALS ===")
    for k in CATS:
        print(f"{k:40s} {totals.get(k, 0)}")
    if "--files" in sys.argv:
        print("\n=== PER FILE ===")
        for rel in sorted(per_file):
            print(rel, dict(per_file[rel]))
