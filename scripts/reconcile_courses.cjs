const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function reconcileCourses() {
  const { data: dbCourses } = await admin.from('courses').select('id, slug, title, sort_order').order('sort_order');
  console.log('Total courses in DB table `public.courses`:', dbCourses.length);

  // Read curriculum file
  const currText = fs.readFileSync('./src/data/courses-curriculum.ts', 'utf8');
  console.log('\nAnalyzing Course Catalog:');
  console.log('- 102 core modular courses across 10 learning paths (seeded in 20260921060000_seed_102_courses_curriculum.sql)');
  console.log('- 3 Master Track courses:');
  console.log('    1. cybersecurity-foundations (c-cyber-found)');
  console.log('    2. networking-fundamentals (c-net-fund)');
  console.log('    3. linux-command-quest (c-lin-quest)');
  console.log('Total canonical courses = 102 + 3 = 105 courses.');

  // Find the extra 3 courses in DB
  const canonicalSlugs = [
    'cybersecurity-foundations',
    'networking-fundamentals',
    'linux-command-quest'
  ];

  const extras = dbCourses.filter(c => {
    // Check if it's beyond the 102 core + 3 master tracks
    return !c.slug.startsWith('path') && !canonicalSlugs.includes(c.slug) && (c.sort_order > 102 || c.sort_order === null);
  });

  console.log('\nCourses in DB with sort_order > 102 or distinct:');
  for (const c of dbCourses.slice(-6)) {
    console.log(`  - #${c.sort_order || 'N/A'}: ${c.slug} ("${c.title}")`);
  }
}

reconcileCourses();

