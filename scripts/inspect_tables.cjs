const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const adminClient = createClient(url, serviceKey);

async function inspectColumns() {
  const c = await adminClient.from('certificates').select('*').limit(1);
  console.log('Certificates select result:', c);

  const cc = await adminClient.from('course_completions').select('*').limit(1);
  console.log('Course_completions select result:', cc);
}

inspectColumns();

