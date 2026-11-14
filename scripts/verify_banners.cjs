const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('src/data/course-images.ts', 'utf8');
const manifestMatch = content.match(/export const COURSE_IMAGE_MANIFEST: Record<string, CourseImageEntry> = \{([\s\S]*?)\n\};/);

if (!manifestMatch) {
  console.error('Could not find COURSE_IMAGE_MANIFEST');
  process.exit(1);
}

const lines = manifestMatch[1].split('\n');
let total = 0;
let missing = 0;

for (const line of lines) {
  const m = line.match(/imagePath:\s*"([^"]+)"/);
  if (m) {
    total++;
    const imgPath = m[1];
    const diskPath = path.join('public', imgPath.replace(/^\//, ''));
    if (!fs.existsSync(diskPath)) {
      console.error('MISSING:', imgPath, 'at', diskPath);
      missing++;
    }
  }
}

console.log(`Checked ${total} image paths in COURSE_IMAGE_MANIFEST.`);
console.log(`Missing count: ${missing}`);

if (missing > 0) {
  process.exit(1);
}

