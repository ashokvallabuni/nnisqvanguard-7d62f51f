const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const anon = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkAnonCertificatesColumns() {
  console.log('Auditing anonymous SELECT on public.certificates:');
  const res = await anon.from('certificates').select('*');
  console.log('Status:', res.status, 'Data length:', res.data ? res.data.length : null);
  if (res.data && res.data.length > 0) {
    console.log('Readable columns:', Object.keys(res.data[0]));
  } else {
    // Attempt inserting a dummy cert with service_role to test reading
    console.log('No rows returned to inspect columns.');
  }
}

checkAnonCertificatesColumns();

