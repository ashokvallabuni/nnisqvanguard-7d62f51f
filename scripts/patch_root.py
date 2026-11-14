import re, io
p = "src/routes/__root.tsx"
t = open(p, encoding="utf-8").read()
n0 = len(t)

def sub(pattern, repl, flags=re.S, count=1):
    global t
    new, k = re.subn(pattern, repl, t, count=count, flags=flags)
    print(("OK  " if k else "MISS"), pattern[:60])
    t = new

sub(r'\{ name: "theme-color", content: "#050B14" \}', '{ name: "theme-color", content: PALETTE.blue }')
sub(r'href:\s*"https://fonts\.googleapis\.com/css2\?[^"]*"', 'href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"')
sub(r'<ThemeProvider defaultTheme="system" storageKey="nisq-theme">', '<ThemeProvider defaultTheme="light" storageKey="nisq-theme">')
sub(r'<Toaster theme="system" />', '<Toaster theme="light" />')
sub(r'accent-sky-300', 'accent-nisq-blue')
# admin bar -> light
sub(r'w-full bg-nisq-white text-nisq-ink border-b border-nisq-border text-\[0\.65rem\] font-mono flex items-center justify-between px-4 py-1\.5',
    'w-full bg-nisq-blue-tint text-nisq-ink border-b border-nisq-border text-xs flex items-center justify-between px-4 py-1.5')
# header + layout
sub(r'<header className="sticky top-0 z-50 w-full flex flex-col bg-background/90 backdrop-blur-md shadow-md border-b border-border">',
    '<header className="sticky top-0 z-50 w-full flex flex-col bg-nisq-white">')
sub(r'\s*<div className="fixed inset-0 grid-bg opacity-\[0\.12\] pointer-events-none" />', '')
sub(r'min-h-screen relative pb-20 md:pb-0 overflow-x-hidden', 'min-h-screen relative flex flex-col overflow-x-hidden bg-nisq-white')
sub(r'<div className="relative z-10 pt-4">', '<div className="relative z-10 flex-1">')
# remove cyan scan line wipe block
sub(r'\s*\{/\* Cyan scan line wipe effect on route enter \*/\}\s*<motion\.div\s+initial=\{\{ top: "0%", opacity: 1 \}\}.*?/>\s*(?=<Outlet />)', '\n                ')
sub(r'(\s*</AnimatePresence>\s*</div>)(\s*</div>\s*\);\s*\}\s*)$', r'\1\n      <Footer />\2')
# imports
if 'PALETTE' not in t.split('export const Route')[0]:
    t = t.replace('import { ThemeProvider }', 'import { PALETTE } from "@/lib/palette";\nimport { Footer } from "@/components/common/Footer";\nimport { ThemeProvider }', 1)
open(p, "w", encoding="utf-8", newline="").write(t)
print(n0, len(t))
