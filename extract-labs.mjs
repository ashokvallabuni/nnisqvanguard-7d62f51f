import fs from 'fs';

const content = fs.readFileSync('src/routes/cyber-range.labs.tsx', 'utf8');
const match = content.match(/const CANONICAL_LABS: LabData\[\] = \[([\s\S]*?)\];/);

if (match) {
  const body = match[1];
  const ids = [...body.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const titles = [...body.matchAll(/title:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const slugs = [...body.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const courses = [...body.matchAll(/courseId:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  
  const mapped = ids.map((id, i) => ({ id, title: titles[i], slug: slugs[i], courseId: courses[i] || null }));
  console.log(mapped);
} else {
  console.log('no match');
}
