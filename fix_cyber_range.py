import re

with open('src/routes/cyber-range.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the wolfHero image tag
content = re.sub(r'<img\s+src=\{wolfHero\}\s+width=\{1920\}\s+height=\{1080\}\s+alt="[^"]+"\s+className="range-wolf"\s+/>', '', content)
# Remove the wolfHero import
content = re.sub(r'import wolfHero from "@/assets/cyber-wolf-hero\.jpg";\n', '', content)

with open('src/routes/cyber-range.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
