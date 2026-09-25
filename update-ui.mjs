import fs from 'fs';

let content = fs.readFileSync('src/routes/cyber-range.labs.tsx', 'utf8');

if (!content.includes('COURSE_LAB_MAPPINGS')) {
  content = content.replace(
    "import { LAB_DEFINITIONS } from '@/data/lab-registry';",
    "import { LAB_DEFINITIONS, COURSE_LAB_MAPPINGS } from '@/data/lab-registry';\nimport { AVAILABLE_COURSES } from '@/data/courses-curriculum';"
  );
}

const replacement = `          ) : (
            <div className="space-y-12">
              {COURSE_LAB_MAPPINGS.map(mapping => {
                const course = AVAILABLE_COURSES.find(c => c.id === mapping.courseId);
                const courseLabs = filteredLabs.filter(l => mapping.labs.includes(l.id));
                if (courseLabs.length === 0) return null;
                
                return (
                  <div key={mapping.courseId} className="space-y-4">
                    <h4 className="font-display text-lg font-bold text-foreground border-b border-border pb-2 uppercase tracking-wide flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" />
                      {course ? course.title : mapping.courseId} IVVAB LABS
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {courseLabs.map((lab) => (
                        <LabCard key={lab.id} lab={lab as any} />
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {(() => {
                const mappedLabIds = new Set(COURSE_LAB_MAPPINGS.flatMap(m => m.labs));
                const unmappedLabs = filteredLabs.filter(l => !mappedLabIds.has(l.id));
                if (unmappedLabs.length === 0) return null;
                
                return (
                  <div className="space-y-4">
                    <h4 className="font-display text-lg font-bold text-foreground border-b border-border pb-2 uppercase tracking-wide flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-muted-foreground" />
                      OTHER IVVAB LABS
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {unmappedLabs.map((lab) => (
                        <LabCard key={lab.id} lab={lab as any} />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}`;

const regex = /          \) : \([\s\S]*?<\/[dD]iv>\s*\)\}/;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/routes/cyber-range.labs.tsx', content);
  console.log('updated cyber-range.labs.tsx');
} else {
  console.error('Target regex not found!');
  process.exit(1);
}
