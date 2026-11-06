const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testQuizInsert() {
  const { data: usersData } = await admin.auth.admin.listUsers();
  const user = usersData.users[0];
  const { data: qz } = await admin.from('quizzes').select('id').limit(1).single();

  console.log('Testing insert on quiz_attempts:');
  const res = await admin.from('quiz_attempts').insert({
    user_id: user.id,
    quiz_id: qz.id,
    score: 100,
    is_correct: true
  }).select();

  console.log('Result:', res);
  if (res.data) {
    await admin.from('quiz_attempts').delete().eq('id', res.data[0].id);
    console.log('Cleaned up test attempt.');
  }
}

testQuizInsert();

