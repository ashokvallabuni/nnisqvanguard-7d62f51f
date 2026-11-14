import fs from "fs/promises";
import path from "path";

const filesToUpdate = [
  "src/routes/campus.tsx",
  "src/routes/appointments.tsx",
  "src/routes/about.founder.tsx",
  "src/components/cyber-intelligence-home.tsx",
  "src/components/common/Navigation.tsx",
  "src/components/common/PageHeader.tsx",
];

const replacements = [
  // Appointments & general
  { from: /bg-slate-900\/75/g, to: "bg-card text-card-foreground" },
  { from: /bg-slate-950\/50/g, to: "bg-background border-input" },
  { from: /bg-slate-950\/85/g, to: "bg-background/85" },
  { from: /bg-slate-950/g, to: "bg-card text-card-foreground" },

  // Text colors
  { from: /text-slate-200/g, to: "text-foreground" },
  { from: /text-slate-300/g, to: "text-muted-foreground" },
  { from: /text-white/g, to: "text-foreground" },
  { from: /text-cyan-400/g, to: "text-primary" },
  { from: /text-cyan-500/g, to: "text-primary" },
  { from: /text-cyan-300/g, to: "text-primary" },
  { from: /text-slate-950/g, to: "text-primary-foreground" },

  // Borders
  { from: /border-slate-700/g, to: "border-border" },
  { from: /border-cyan-400\/60/g, to: "border-primary/60" },
  { from: /border-cyan-400\/30/g, to: "border-primary/30" },
  { from: /border-cyan-400\/70/g, to: "border-primary/70" },
  { from: /focus:border-cyan-500/g, to: "focus:border-primary focus:ring-1 focus:ring-primary" },
  { from: /focus:border-cyan-400/g, to: "focus:border-primary focus:ring-1 focus:ring-primary" },

  // Backgrounds / Hovers
  { from: /bg-gradient-to-r from-blue-600 to-cyan-400/g, to: "bg-primary hover:bg-primary/90" },
  { from: /hover:bg-cyan-400/g, to: "hover:bg-primary hover:text-primary-foreground" },
  { from: /bg-cyan-400\/10/g, to: "bg-primary/10" },
  { from: /bg-cyan-500/g, to: "bg-primary" },
];

async function run() {
  for (const filePath of filesToUpdate) {
    const fullPath = path.resolve(filePath);
    try {
      let content = await fs.readFile(fullPath, "utf8");
      let updated = content;

      for (const r of replacements) {
        updated = updated.replace(r.from, r.to);
      }

      if (updated !== content) {
        await fs.writeFile(fullPath, updated, "utf8");
        console.log(`Updated ${filePath}`);
      } else {
        console.log(`No changes needed in ${filePath}`);
      }
    } catch (e) {
      console.error(`Error processing ${filePath}:`, e.message);
    }
  }
}

run();
