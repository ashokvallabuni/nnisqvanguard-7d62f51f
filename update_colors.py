import os
import re

src_dir = r"C:\Users\ashok\nnisqvanguard-7d62f51f-1\src"

def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # 1. Neutralize dark: prefix (we are forcing one theme, dark mode only)
    content = re.sub(r'\bdark:([a-zA-Z0-9_-]+)', r'\1', content)
    
    # Also neutralize hover:dark: etc
    content = re.sub(r'([a-z:]+):dark:([a-zA-Z0-9_-]+)', r'\1:\2', content)

    # 2. Tailwind color replacements
    # Purples/Pinks/Cyans -> nisq-blue / nisq-soft
    content = re.sub(r'\b(bg|text|border|ring|shadow|fill|stroke|divide|outline|decoration)-(purple|violet|indigo|fuchsia|pink|rose|cyan|sky|blue)-[0-9]{2,3}(?:/[0-9]+)?\b', r'\1-nisq-blue', content)
    
    # Greens -> nisq-soft (for success, but restrained)
    content = re.sub(r'\b(bg|text|border|ring|shadow|fill|stroke|divide|outline|decoration)-(emerald|green|teal|lime)-[0-9]{2,3}(?:/[0-9]+)?\b', r'\1-nisq-soft', content)
    
    # Oranges/Yellows -> nisq-ash
    content = re.sub(r'\b(bg|text|border|ring|shadow|fill|stroke|divide|outline|decoration)-(orange|amber|yellow|brown)-[0-9]{2,3}(?:/[0-9]+)?\b', r'\1-nisq-ash', content)
    
    # Reds -> nisq-danger (semantic only)
    content = re.sub(r'\b(bg|text|border|ring|shadow|fill|stroke|divide|outline|decoration)-(red)-[0-9]{2,3}(?:/[0-9]+)?\b', r'\1-nisq-danger', content)
    
    # Grays -> navy2, ash, border, offwhite
    content = re.sub(r'\bbg-(slate|gray|zinc|neutral|stone)-[0-9]{2,3}(?:/[0-9]+)?\b', r'bg-nisq-navy2', content)
    content = re.sub(r'\btext-(slate|gray|zinc|neutral|stone)-[5-9][0-9]{2}(?:/[0-9]+)?\b', r'text-nisq-ash', content)
    content = re.sub(r'\btext-(slate|gray|zinc|neutral|stone)-[1-4][0-9]{2}(?:/[0-9]+)?\b', r'text-nisq-offwhite', content)
    content = re.sub(r'\b(border|ring|divide|outline)-(slate|gray|zinc|neutral|stone)-[0-9]{2,3}(?:/[0-9]+)?\b', r'\1-nisq-border', content)

    # Hardcoded white/black classes
    content = re.sub(r'\bbg-white(?:/[0-9]+)?\b', 'bg-nisq-white', content)
    content = re.sub(r'\btext-white(?:/[0-9]+)?\b', 'text-nisq-white', content)
    content = re.sub(r'\bborder-white(?:/[0-9]+)?\b', 'border-nisq-white', content)
    
    content = re.sub(r'\bbg-black(?:/[0-9]+)?\b', 'bg-nisq-navy', content)
    content = re.sub(r'\btext-black(?:/[0-9]+)?\b', 'text-nisq-navy', content)
    
    # 3. Gradients Removal
    content = re.sub(r'\bbg-gradient-to-[a-z]{1,2}\b', '', content)
    content = re.sub(r'\bfrom-[a-zA-Z0-9_-]+\b', '', content)
    content = re.sub(r'\bvia-[a-zA-Z0-9_-]+\b', '', content)
    content = re.sub(r'\bto-[a-zA-Z0-9_-]+\b', '', content)
    
    # Clean up inline gradients
    content = re.sub(r'style=\{\{[^}]*?(?:linear-gradient|radial-gradient|conic-gradient)[^}]*?\}\}', '', content)
    content = re.sub(r'style=\{\{[^}]*?(?:color|background|border|fill|stroke)[^}]*?\}\}', '', content)

    # Remove empty class strings left behind
    content = re.sub(r'className="\s+"', '', content)
    content = re.sub(r'className=`\s+`', '', content)
    content = re.sub(r' +', ' ', content) # compact spaces

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith((".tsx", ".ts", ".jsx", ".js")):
            process_file(os.path.join(root, file))
