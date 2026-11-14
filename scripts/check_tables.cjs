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

async function checkTables() {
  const tables = ['certificates', 'course_completions', 'certificate_email_jobs', 'blockchain_anchors', 'certificate_audit_logs'];
  for (const t of tables) {
    const res = await adminClient.from(t).select('count', { count: 'exact', head: true });
    console.log(`Table ${t}:`, res.error ? `Error: ${res.error.message}` : `Exists (count: ${res.count})`);
  }
}

checkTables();

