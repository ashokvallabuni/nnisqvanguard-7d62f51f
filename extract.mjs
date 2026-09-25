import fs from 'fs';
import path from 'path';
import url from 'url';

const content1 = fs.readFileSync('src/data/courses-curriculum.ts', 'utf8');
const content2 = fs.readFileSync('src/data/curriculum-102.ts', 'utf8');

function extractCourses(content, arrayName) {
  const match = content.match(new RegExp(`export const ${arrayName}(?:[^=]*)=\\s*\\[([\\s\\S]*?)\\];`));
  if (!match) return [];
  const body = match[1];
  const ids = [...body.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const titles = [...body.matchAll(/title:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  return ids.map((id, i) => ({ id, title: titles[i] || 'Unknown' }));
}

console.log("AVAILABLE_COURSES:", extractCourses(content1, 'AVAILABLE_COURSES'));
console.log("LOCKED_COURSES:", extractCourses(content1, 'LOCKED_COURSES'));

// curriculum-102.ts might have a different format (RAW_COURSES_META)
const match2 = content2.match(/const RAW_COURSES_META = \[([\s\S]*?)\];/);
if (match2) {
  const body = match2[1];
  const ids = [...body.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const titles = [...body.matchAll(/title:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  console.log("ALL_102_COURSES:", ids.map((id, i) => ({ id, title: titles[i] || 'Unknown' })));
}
