import sys
import re

with open('src/routes/_authenticated/dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove NEXT UP
content = re.sub(r'\{\s*/\*\s*SECTION: NEXT UP\s*\*/\s*\}.*?\{\s*/\*\s*SECTION: PRIMARY ACTIONS\s*\*/\s*\}', '{/* SECTION: PRIMARY ACTIONS */}', content, flags=re.DOTALL)

# Remove Continue Learning from PRIMARY ACTIONS
content = re.sub(r'<Link\s+to="/learn".*?</Link>', '', content, flags=re.DOTALL)
content = content.replace('grid-cols-1 md:grid-cols-2', 'grid-cols-1')

# Remove ENROLLED TRACKS
content = re.sub(r'\{\s*/\*\s*SECTION: ENROLLED TRACKS\s*\*/\s*\}.*?\{\s*/\*\s*SECTION: SKILL MATRIX\s*\*/\s*\}', '{/* SECTION: SKILL MATRIX */}', content, flags=re.DOTALL)

# Remove CONTINUE LEARNING from Sidebar Quick Links
content = re.sub(r'<Link\s+to="/learn"[^>]*>.*?CONTINUE LEARNING\s*</Link>', '', content, flags=re.DOTALL)

# Remove Lessons stat card
content = re.sub(r'<div className="p-4 nv-card space-y-1 shadow-sm">\s*<div className="text-\[0\.65rem\] font-mono uppercase text-primary">Lessons</div>\s*<div className="font-display font-bold text-2xl text-foreground">\s*\{completedModulesCount\}\s*</div>\s*</div>', '', content, flags=re.DOTALL)

with open('src/routes/_authenticated/dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
