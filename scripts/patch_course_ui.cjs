const fs = require("fs");

// 1. Patch src/routes/learn.$slug.tsx
let learnContent = fs.readFileSync("src/routes/learn.$slug.tsx", "utf8").replace(/\r\n/g, "\n");

// Add CertificateActionButton under hero progress
const heroTarget = `{nextModule && (
 <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary">
 {progressPercent > 0 ? "In Progress" : "Ready to Start"}
 </span>
 <span className="text-xs font-mono text-muted-foreground">
 {completedCount}/{totalModules} Modules ({progressPercent}%)
 </span>
 </div>
 <p className="text-xs text-muted-foreground">
 Next up: <span className="font-semibold text-foreground">{nextModule.title}</span>
 </p>
 </div>
 <Link
 to="/learn/$slug/$moduleSlug"
 params={{ slug: course.slug, moduleSlug: nextModule.slug }}
 className="inline-flex items-center justify-center gap-2 px-6 min-h-[48px] rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 active:scale-[0.98] shadow-sm transition-all"
 >
 <Play className="w-4 h-4 fill-primary-foreground" />
 <span>{progressPercent > 0 ? "RESUME COURSE" : "START LEARNING"}</span>
 </Link>
 </div>
 )}`;

const heroReplacement = `{nextModule && (
 <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary">
 {progressPercent > 0 ? "In Progress" : "Ready to Start"}
 </span>
 <span className="text-xs font-mono text-muted-foreground">
 {completedCount}/{totalModules} Modules ({progressPercent}%)
 </span>
 </div>
 <p className="text-xs text-muted-foreground">
 Next up: <span className="font-semibold text-foreground">{nextModule.title}</span>
 </p>
 </div>
 <Link
 to="/learn/$slug/$moduleSlug"
 params={{ slug: course.slug, moduleSlug: nextModule.slug }}
 className="inline-flex items-center justify-center gap-2 px-6 min-h-[48px] rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 active:scale-[0.98] shadow-sm transition-all"
 >
 <Play className="w-4 h-4 fill-primary-foreground" />
 <span>{progressPercent > 0 ? "RESUME COURSE" : "START LEARNING"}</span>
 </Link>
 </div>
 )}

 {/* Persistent Course Certificate Action Bar */}
 <CertificateActionButton
 courseSlug={course.slug}
 courseTitle={course.title}
 />`;

// Add CertificateActionButton in sidebar
const sidebarTarget = `<div className="space-y-2">
 <div className="flex justify-between text-xs font-mono">
 <span className="text-muted-foreground">Course Progress</span>
 <span className="font-semibold text-foreground">{progressPercent}%</span>
 </div>
 <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
 <div
 className="h-full bg-primary transition-all duration-300"
 style={{ width: \`\${progressPercent}%\` }}
 />
 </div>
 </div>`;

const sidebarReplacement = `<div className="space-y-2">
 <div className="flex justify-between text-xs font-mono">
 <span className="text-muted-foreground">Course Progress</span>
 <span className="font-semibold text-foreground">{progressPercent}%</span>
 </div>
 <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
 <div
 className="h-full bg-primary transition-all duration-300"
 style={{ width: \`\${progressPercent}%\` }}
 />
 </div>
 </div>

 {/* Persistent Certificate Action Widget */}
 <CertificateActionButton
 courseSlug={course.slug}
 courseTitle={course.title}
 compact
 />`;

if (learnContent.includes(heroTarget)) {
  learnContent = learnContent.replace(heroTarget, heroReplacement);
  console.log("✓ Added hero CertificateActionButton in learn.$slug.tsx");
} else {
  console.warn("Hero target not found in learn.$slug.tsx");
}

if (learnContent.includes(sidebarTarget)) {
  learnContent = learnContent.replace(sidebarTarget, sidebarReplacement);
  console.log("✓ Added sidebar CertificateActionButton in learn.$slug.tsx");
} else {
  console.warn("Sidebar target not found in learn.$slug.tsx");
}

fs.writeFileSync("src/routes/learn.$slug.tsx", learnContent, "utf8");

// 2. Patch src/routes/_authenticated/learn.$slug.$moduleSlug.tsx
let moduleContent = fs.readFileSync("src/routes/_authenticated/learn.$slug.$moduleSlug.tsx", "utf8").replace(/\r\n/g, "\n");

// Add import
if (!moduleContent.includes("CertificateActionButton")) {
  moduleContent = moduleContent.replace(
    'import { completeModule } from "@/lib/academy.functions";',
    'import { completeModule } from "@/lib/academy.functions";\nimport { CertificateActionButton } from "@/components/academy/CertificateActionButton";'
  );
}

// Add persistent CertificateActionButton above bottom actions
const moduleBottomTarget = `{/* Bottom Actions: Previous / Next / Complete */}
 <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">`;

const moduleBottomReplacement = `{/* Course Completion & Persistent Certificate Action Widget */}
 <CertificateActionButton
 courseSlug={course.slug}
 courseTitle={course.title}
 className="my-4"
 />

 {/* Bottom Actions: Previous / Next / Complete */}
 <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">`;

if (moduleContent.includes(moduleBottomTarget)) {
  moduleContent = moduleContent.replace(moduleBottomTarget, moduleBottomReplacement);
  console.log("✓ Added persistent CertificateActionButton in learn.$slug.$moduleSlug.tsx");
} else {
  console.warn("Bottom target not found in learn.$slug.$moduleSlug.tsx");
}

fs.writeFileSync("src/routes/_authenticated/learn.$slug.$moduleSlug.tsx", moduleContent, "utf8");
console.log("All course pages patched successfully!");

