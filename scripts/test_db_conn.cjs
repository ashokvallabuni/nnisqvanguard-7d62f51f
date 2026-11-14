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
const anonKey = env.VITE_SUPABASE_ANON_KEY;

console.log('URL present:', Boolean(url), 'ServiceKey present:', Boolean(serviceKey), 'AnonKey present:', Boolean(anonKey));

async function testConnection() {
  const adminClient = createClient(url, serviceKey);
  const certs = await adminClient.from('certificates').select('count', { count: 'exact', head: true });
  console.log('Certificates count via admin:', certs);

  const courses = await adminClient.from('courses').select('count', { count: 'exact', head: true });
  console.log('Courses count via admin:', courses);

  const profiles = await adminClient.from('profiles').select('count', { count: 'exact', head: true });
  console.log('Profiles count via admin:', profiles);
}

testConnection().catch(err => {
  console.error('Connection error:', err);
  process.exit(1);
});

