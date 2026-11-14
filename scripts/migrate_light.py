"""One-off migration: dark/navy utility classes -> light White + Nano Blue tokens.
Run from repo root:  python scripts/migrate_light.py
Operates on quoted string literals in .tsx files so unrelated code is never touched.
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
STR_RE = re.compile(r"""(["'`])((?:\\.|(?!\1)[^\\])*)\1""", re.S)

SOLID_BG = re.compile(r"(?<![\w/:-])(?:bg-primary|bg-nisq-blue|bg-destructive|bg-nisq-danger)(?![\w/-])")
BARE = lambda name: re.compile(r"(?<![\w:-])" + re.escape(name) + r"(?![\w/-])")


def rewrite(s: str) -> str:
    if not re.search(r"nisq-|shadow-\[|shadow-black|font-orbitron|text-black|text-white|bg-black", s):
        return s

    # --- renames of retired token names
    s = s.replace("nisq-soft", "nisq-blue-soft").replace("nisq-bright", "nisq-blue-bright")

    has_solid = bool(SOLID_BG.search(s))
    has_text_token = bool(re.search(r"(?<![\w-])(?:[a-z-]+:)*text-(?!\[|xs|sm|base|lg|xl|\dxl|center|left|right|ellipsis|clip|wrap|nowrap|balance|pretty)[\w/-]+", s))

    # --- pill pattern: solid bg + coloured text => tinted pill
    if not has_solid_white(s):
        if has_text_token and not re.search(r"text-nisq-white|text-primary-foreground", s):
            s = BARE("bg-nisq-blue").sub("bg-nisq-blue-tint", s)
            s = BARE("bg-nisq-blue-soft").sub("bg-nisq-blue-tint", s)
            s = BARE("bg-nisq-ash").sub("bg-nisq-offwhite", s)
            s = BARE("bg-nisq-danger").sub("bg-nisq-danger-tint", s)
    # remaining bare ash fills used as dots/bars stay solid ash; soft stays solid soft

    # --- text colours
    if re.search(r"(?<![\w-])text-nisq-white", s) and not has_solid:
        s = re.sub(r"(?<![\w-])((?:[a-z-]+:)*)text-nisq-white", r"\1text-nisq-ink", s)
    s = re.sub(r"(?<![\w-])((?:[a-z-]+:)*)text-nisq-offwhite", lambda m: m.group(1) + ("text-nisq-ink" if m.group(1).startswith(("hover:", "group-hover:")) else "text-nisq-text"), s)
    s = s.replace("placeholder:text-nisq-ink", "placeholder:text-nisq-ash")
    s = re.sub(r"(?<![\w-])text-nisq-ash", "text-nisq-muted", s)
    s = s.replace("text-nisq-navy", "text-nisq-white")  # dark text that sat on bright bg -> white on blue

    # --- backgrounds
    s = re.sub(r"(?<![\w-])hover:bg-nisq-navy2(?:/\d+)?", "hover:bg-nisq-blue-tint", s)
    s = re.sub(r"(?<![\w-])focus:bg-nisq-navy2(?:/\d+)?", "focus:bg-nisq-blue-tint", s)
    s = re.sub(r"(?<![\w-])hover:file:bg-nisq-navy2", "hover:file:bg-nisq-blue-tint", s)
    s = re.sub(r"(?<![\w-])selection:bg-nisq-navy2", "selection:bg-nisq-blue-tint", s)
    s = re.sub(r"(?<![\w-])hover:bg-nisq-white(?:/\d+)?", "hover:bg-nisq-blue-tint", s)
    s = re.sub(r"(?<![\w-])hover:bg-nisq-danger(?![\w-])", "hover:bg-nisq-danger-tint", s)
    s = re.sub(r"(?<![\w-])bg-nisq-navy2/\d+", "bg-nisq-offwhite", s)
    s = re.sub(r"(?<![\w-])bg-nisq-navy2(?![\w-])", "bg-nisq-white", s)
    s = re.sub(r"(?<![\w-])((?:[a-z-]+:)*)bg-nisq-navy(?![\w-])", r"\1bg-nisq-ink/40", s)
    s = s.replace("bg-black/50", "bg-nisq-ink/40").replace("bg-black/60", "bg-nisq-ink/40").replace("bg-black", "bg-nisq-ink/40")

    # --- borders
    s = re.sub(r"(?<![\w-])((?:[a-z-]+:)*)border-nisq-(?:ash|white)(?![\w-])", r"\1border-nisq-border", s)
    s = re.sub(r"(?<![\w-])((?:[a-z-]+:)*)border-nisq-border/\d+", r"\1border-nisq-border", s)

    # --- glow shadows -> token shadows
    s = re.sub(r"hover:shadow-\[[^\]]*\]", "hover:shadow-glow", s)
    s = re.sub(r"(?<![\w:-])shadow-\[[^\]]*\]", "shadow-card", s)
    s = re.sub(r"drop-shadow-\[[^\]]*\]\s?", "", s)
    s = s.replace("shadow-black/50", "shadow-nisq-ink/10").replace("shadow-xl", "shadow-pop")

    s = s.replace("font-orbitron", "font-display")
    s = s.replace("text-black", "text-nisq-ink")
    return s


def has_solid_white(s: str) -> bool:
    return bool(SOLID_BG.search(s)) and bool(re.search(r"text-nisq-white|text-primary-foreground|text-white", s))


def process(path: str) -> bool:
    text = open(path, encoding="utf-8").read()
    new = STR_RE.sub(lambda m: m.group(1) + rewrite(m.group(2)) + m.group(1), text)
    if new != text:
        open(path, "w", encoding="utf-8", newline="").write(new)
        return True
    return False


if __name__ == "__main__":
    changed = []
    for base, _, files in os.walk(SRC):
        for f in files:
            if f.endswith(".tsx"):
                p = os.path.join(base, f)
                if process(p):
                    changed.append(os.path.relpath(p, ROOT))
    print(f"changed {len(changed)} files")
    for c in sorted(changed):
        print(" ", c)
