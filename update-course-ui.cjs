const fs = require("fs");

let content = fs.readFileSync("src/routes/learn.$slug.tsx", "utf8");

if (!content.includes("COURSE_LAB_MAPPINGS")) {
  content = content.replace(
    'import { PageHeader } from "@/components/common/PageHeader";',
    'import { PageHeader } from "@/components/common/PageHeader";\nimport { getLabsForCourse } from "@/data/lab-registry";\nimport { LabCard } from "@/components/cyber-range/LabCard";',
  );
}

// Add the call to getLabsForCourse
content = content.replace(
  "const nextModule = modules?.find((m) => !completedModuleIds.has(m.id)) || modules?.[0];",
  "const nextModule = modules?.find((m) => !completedModuleIds.has(m.id)) || modules?.[0];\n  const courseLabs = course ? getLabsForCourse(course.id) : [];",
);

const uiInjection = `
            {courseLabs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-primary" />
                    <span>PRACTICE WITH IVVAB LABS</span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {courseLabs.map((lab) => (
                    <LabCard key={lab.id} lab={lab as any} />
                  ))}
                </div>
              </div>
            )}
`;

content = content.replace(
  "          {/* Sidebar Action / Progress Widget */}",
  uiInjection + "\n          {/* Sidebar Action / Progress Widget */}",
);

fs.writeFileSync("src/routes/learn.$slug.tsx", content);
console.log("updated learn.$slug.tsx");
