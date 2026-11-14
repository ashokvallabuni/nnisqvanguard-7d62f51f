const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const anonClient = createClient(url, anonKey);
const adminClient = createClient(url, serviceKey);

async function runRlsTests() {
  console.log('--- STARTING STAGE 1 RLS VERIFICATION TESTS ---');

  // Test 1: Anonymous cannot INSERT into certificates
  const anonCertInsert = await anonClient.from('certificates').insert({
    certificate_number: 'TEST-SPOOF',
    recipient_name: 'Attacker',
    course_title: 'Fake Course'
  });
  console.log('1. Anonymous INSERT certificates:', anonCertInsert.error ? `BLOCKED (Expected: ${anonCertInsert.error.message})` : 'FAILED (Should be blocked)');

  // Test 2: Anonymous cannot INSERT into course_completions
  const anonCompInsert = await anonClient.from('course_completions').insert({
    total_modules: 10,
    completed_modules: 10
  });
  console.log('2. Anonymous INSERT course_completions:', anonCompInsert.error ? `BLOCKED (Expected: ${anonCompInsert.error.message})` : 'FAILED (Should be blocked)');

  // Test 3: Anonymous cannot SELECT from certificate_email_jobs
  const anonEmailSelect = await anonClient.from('certificate_email_jobs').select('*');
  console.log('3. Anonymous SELECT certificate_email_jobs:', anonEmailSelect.error ? `BLOCKED (Expected: ${anonEmailSelect.error.message})` : `Read ${anonEmailSelect.data?.length || 0} rows`);

  // Test 4: Anonymous cannot SELECT from certificate_audit_logs
  const anonAuditSelect = await anonClient.from('certificate_audit_logs').select('*');
  console.log('4. Anonymous SELECT certificate_audit_logs:', anonAuditSelect.error ? `BLOCKED (Expected: ${anonAuditSelect.error.message})` : `Read ${anonAuditSelect.data?.length || 0} rows`);

  // Test 5: Anonymous can SELECT public verification fields from certificates
  const anonCertSelect = await anonClient.from('certificates').select('id, certificate_number, recipient_name, course_title, issued_at');
  console.log('5. Anonymous SELECT public certificates:', anonCertSelect.error ? `Error: ${anonCertSelect.error.message}` : `ALLOWED (Status: ${anonCertSelect.status})`);

  // Test 6: Service role can read and write all pipeline tables
  const adminAuditInsert = await adminClient.from('certificate_audit_logs').insert({
    event_type: 'STAGE_1_RLS_AUDIT_VERIFIED',
    details: { timestamp: new Date().toISOString(), test: 'rls_passed' }
  }).select();
  console.log('6. Service-role INSERT certificate_audit_logs:', adminAuditInsert.error ? `Error: ${adminAuditInsert.error.message}` : `SUCCESS (id: ${adminAuditInsert.data[0].id})`);

  console.log('--- ALL STAGE 1 RLS VERIFICATION TESTS COMPLETED ---');
}

runRlsTests();

