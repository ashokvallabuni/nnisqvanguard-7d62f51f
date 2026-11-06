const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testScopedClients() {
  // Create user
  const email = `test-jwt-${Date.now()}@nisqvanguard.in`;
  const { data: authUser } = await admin.auth.admin.createUser({
    email,
    password: 'Password123!',
    email_confirm: true
  });

  const anonClient = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  const { data: login } = await anonClient.auth.signInWithPassword({
    email,
    password: 'Password123!'
  });

  const token = login.session.access_token;
  console.log('Got valid JWT for user:', authUser.user.id);

  // Create client with explicit auth header
  const userClient = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  // Verify auth.uid() inside postgres
  const { data: prof } = await userClient.from('profiles').select('id, email');
  console.log('Profiles returned to this user:', prof?.length, prof?.[0]?.email);

  await admin.auth.admin.deleteUser(authUser.user.id);
  console.log('Cleaned up test user.');
}

testScopedClients();

