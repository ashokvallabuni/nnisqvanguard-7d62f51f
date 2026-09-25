import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { COURSE_LAB_MAPPINGS, LAB_DEFINITIONS } from './src/data/lab-registry.ts';

const coursesFile = fs.readFileSync(path.join(__dirname, 'src/data/courses-curriculum.ts'), 'utf8');

function extractCourses(content, arrayName) {
  const match = content.match(new RegExp(`export const ${arrayName}(?:[^=]*)=\\s*\\[([\\s\\S]*?)\\];`));
  if (!match) return [];
  const body = match[1];
  // More robust matching for just the top-level items might be hard, but let's assume 'id: ' at the start of a line or similar, 
  // actually let's match specifically the course IDs we know we are looking for. Wait, we should extract properly.
  // We can just use the ones we know or use a crude parser.
  const ids = [...body.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  return ids;
}

// Just match the 4 top level courses since nested modules have IDs too.
// The known courses in AVAILABLE_COURSES are the first 4 IDs usually, or we can just filter out known module IDs.
// A better way: just import it dynamically using typescript compiler API or similar? 
// For now, let's just do a simpler check. We know there are 4 courses. 
// We can find them by title or just hardcode the check for static verification.
// Wait, the prompt says "COURSES DISCOVERED: 4"

const allIds = extractCourses(coursesFile, 'AVAILABLE_COURSES');
const courseIds = allIds.filter(id => id.startsWith('c-')); // courses start with c- usually!

let allPassed = true;

console.log(`COURSES DISCOVERED: ${courseIds.length}`);
console.log(`LABS DISCOVERED: ${LAB_DEFINITIONS.length}`);

console.log("\n--- COURSE/LAB MAPPINGS ---");
COURSE_LAB_MAPPINGS.forEach(mapping => {
  const courseFound = courseIds.includes(mapping.courseId);
  const labsFound = mapping.labs.every(labId => LAB_DEFINITIONS.some(l => l.id === labId));
  
  console.log(`Course: ${mapping.courseId}`);
  console.log(`  Lab(s): ${mapping.labs.join(', ')}`);
  
  if (courseFound && labsFound) {
    console.log(`  Mapping: VALID`);
  } else {
    console.log(`  Mapping: INVALID`);
    allPassed = false;
  }
});

const mappedCourseIds = COURSE_LAB_MAPPINGS.map(m => m.courseId);
const mappedLabIds = COURSE_LAB_MAPPINGS.flatMap(m => m.labs);

const orphanCourses = courseIds.filter(id => !mappedCourseIds.includes(id));
const orphanLabs = LAB_DEFINITIONS.filter(l => !mappedLabIds.includes(l.id));

console.log("\n--- SUMMARY ---");
console.log(`ORPHAN COURSES: ${orphanCourses.length}`);
console.log(`ORPHAN LABS: ${orphanLabs.length}`);
console.log(`INVALID MAPPINGS: ${allPassed ? 0 : 1}`);

process.exit(allPassed ? 0 : 1);
