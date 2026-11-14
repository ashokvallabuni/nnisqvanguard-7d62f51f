const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function findCollisions() {
  const { data: all } = await admin.from('courses').select('slug, title, sort_order');
  const dupes = {};
  for (const c of all) {
    const k = c.sort_order ?? 'null';
    if (!dupes[k]) dupes[k] = [];
    dupes[k].push(c.slug);
  }
  for (const [k, v] of Object.entries(dupes)) {
    if (v.length > 1) {
      console.log(`Colliding sort_order #${k}:`, v);
    }
  }
}

findCollisions();

