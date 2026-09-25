import fs from "fs";

let content = fs.readFileSync("src/routes/cyber-range.labs.tsx", "utf8");

const importStatement = "import { LAB_DEFINITIONS } from '@/data/lab-registry';\n";
if (!content.includes("LAB_DEFINITIONS")) {
  content = content.replace(
    'import { LabCard, LabData } from "@/components/cyber-range/LabCard";',
    importStatement + 'import { LabCard, LabData } from "@/components/cyber-range/LabCard";',
  );
}

const canonicalLabsRegex =
  /\/\/ Canonical defense & threat investigation labs\s+const CANONICAL_LABS: LabData\[\] = \[[\s\S]*?\];/;
content = content.replace(
  canonicalLabsRegex,
  "// Canonical defense & threat investigation labs\nconst CANONICAL_LABS: LabData[] = LAB_DEFINITIONS as LabData[];",
);

content = content.replace(/Cyber Range/g, "IVVAB LABS");

fs.writeFileSync("src/routes/cyber-range.labs.tsx", content);

let labCardContent = fs.readFileSync("src/components/cyber-range/LabCard.tsx", "utf8");
if (!labCardContent.includes("courseId?: string;")) {
  labCardContent = labCardContent.replace(
    "summary: string;",
    "summary: string;\n  courseId?: string;",
  );
  fs.writeFileSync("src/components/cyber-range/LabCard.tsx", labCardContent);
}
