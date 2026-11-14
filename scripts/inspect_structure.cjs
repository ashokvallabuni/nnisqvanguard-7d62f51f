const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectCourseStructure() {
  const { data: c } = await admin.from('courses').select('id, slug').eq('slug', 'networking-fundamentals').single();
  const { data: mods } = await admin.from('modules').select('id, slug').eq('course_id', c.id);
  const modIds = mods.map(m => m.id);
  const { data: qz } = await admin.from('quizzes').select('id, module_id').in('module_id', modIds);

  console.log(`Course ${c.slug}:`);
  console.log(`- Modules count: ${mods.length}`);
  console.log(`- Quizzes count: ${qz ? qz.length : 0}`);

  // Test quiz attempt insertion
  if (qz && qz.length > 0) {
    console.log(`First quiz ID: ${qz[0].id}`);
  }
}

inspectCourseStructure();

