const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectUsers() {
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) {
    console.error('List users error:', error);
    return;
  }
  console.log(`Found ${data.users.length} users:`);
  for (const u of data.users.slice(0, 5)) {
    console.log(`- ID: ${u.id}, Email: ${u.email}`);
  }
}

inspectUsers();

