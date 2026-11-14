const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectPolicies() {
  const { data: usersData } = await admin.auth.admin.listUsers();
  const uA = usersData.users[0];
  const uB = usersData.users[1];

  console.log(`User A: ${uA.id}`);
  console.log(`User B: ${uB.id}`);

  // Create cert for User A
  const { data: c } = await admin.from('certificates').insert({
    user_id: uA.id,
    certificate_number: 'TEST-POL-A',
    recipient_name: 'A',
    course_title: 'Test'
  }).select().single();

  console.log(`Certificate created with ID: ${c.id}`);

  // Direct anon client test (no user)
  const anon = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  const anonRes = await anon.from('certificates').select('*').eq('id', c.id);
  console.log('Anon read result count:', anonRes.data?.length, 'error:', anonRes.error?.message);

  // Cleanup
  await admin.from('certificates').delete().eq('id', c.id);
  console.log('Cleaned up test certificate.');
}

inspectPolicies().catch(console.error);
