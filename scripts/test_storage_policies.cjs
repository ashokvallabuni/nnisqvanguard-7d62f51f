const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testStoragePolicies() {
  const { data: usersData } = await admin.auth.admin.listUsers();
  const uA = usersData.users[0];
  const uB = usersData.users[1];

  console.log(`Checking Storage RLS:`);
  console.log(`User A: ${uA.id}`);
  console.log(`User B: ${uB.id}`);

  const testPath = `${uA.id}/test-storage-rls.pdf`;
  await admin.storage.from('certificates').upload(testPath, Buffer.from('PDF_TEST'), { upsert: true });

  // Direct anon download attempt
  const anon = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  const dlAnon = await anon.storage.from('certificates').download(testPath);
  console.log('Anon storage download result: data =', !!dlAnon.data, 'error =', dlAnon.error?.message);

  await admin.storage.from('certificates').remove([testPath]);
}

testStoragePolicies().catch(console.error);

