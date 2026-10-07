import os
import re

src_dir = r"C:\Users\ashok\nnisqvanguard-7d62f51f-1\src"

def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # Clean up generic arbitrary hex colors found in about.tsx, innovation.tsx, etc
    # Text
    content = re.sub(r'text-\[#[0-9a-fA-F]{6}\]', 'text-nisq-offwhite', content)
    # Backgrounds
    content = re.sub(r'bg-\[#[0-9a-fA-F]{6}\]', 'bg-nisq-navy2', content)
    # Borders
    content = re.sub(r'border-\[#[0-9a-fA-F]{6}\]', 'border-nisq-border', content)
    
    # SVG fills and strokes
    content = re.sub(r'fill="#[0-9a-fA-F]{6}"', 'className="fill-nisq-ash"', content)
    content = re.sub(r'stroke="#[0-9a-fA-F]{6}"', 'className="stroke-nisq-ash"', content)

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith((".tsx", ".ts", ".jsx", ".js")):
            process_file(os.path.join(root, file))
