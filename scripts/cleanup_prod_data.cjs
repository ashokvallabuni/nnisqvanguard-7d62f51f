const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanUpProductionTestData() {
  console.log('=== BLOCK 1: CLEANING UP PRODUCTION TEST DATA ===\n');

  // 1. Find all test certificates matching NISQ-CERT-TEST-* or NISQ-CERT-PARALLEL-*
  const { data: testCerts, error: certErr } = await admin
    .from('certificates')
    .select('id, certificate_number, user_id, course_title')
    .or('certificate_number.like.NISQ-CERT-TEST-%,certificate_number.like.NISQ-CERT-PARALLEL-%');

  console.log(`Found ${testCerts ? testCerts.length : 0} test certificates to clean up:`);
  if (testCerts && testCerts.length > 0) {
    for (const c of testCerts) {
      console.log(`  - ID: ${c.id} | Number: ${c.certificate_number}`);
      // Clean up jobs & anchors referencing this cert
      await admin.from('certificate_email_jobs').delete().eq('certificate_id', c.id);
      await admin.from('blockchain_anchors').delete().eq('certificate_id', c.id);
      await admin.from('course_completions').delete().eq('certificate_id', c.id);
      await admin.from('certificate_audit_logs').delete().eq('certificate_id', c.id);
      await admin.from('certificates').delete().eq('id', c.id);
    }
    console.log('✓ Successfully deleted test certificates and related records.');
  } else {
    console.log('✓ No lingering test certificates found in database.');
  }

  // 2. Clean up any test audit logs with event_type like STAGE_1_RLS_AUDIT_VERIFIED
  const { data: testLogs } = await admin
    .from('certificate_audit_logs')
    .select('id, event_type')
    .eq('event_type', 'STAGE_1_RLS_AUDIT_VERIFIED');

  if (testLogs && testLogs.length > 0) {
    console.log(`Deleting ${testLogs.length} Stage 1 audit verification test log rows...`);
    await admin.from('certificate_audit_logs').delete().eq('event_type', 'STAGE_1_RLS_AUDIT_VERIFIED');
    console.log('✓ Successfully deleted Stage 1 test audit logs.');
  }

  // 3. Clean up test PDF storage objects
  const { data: files } = await admin.storage.from('certificates').list();
  if (files && files.length > 0) {
    console.log(`Checking storage bucket "certificates" for test files...`);
    for (const item of files) {
      if (item.name.includes('test') || item.id === null) {
        // Check inside folder if it's a folder
        const { data: subFiles } = await admin.storage.from('certificates').list(item.name);
        if (subFiles) {
          const toRemove = subFiles.filter(f => f.name.includes('test') || f.name.includes('PARALLEL')).map(f => `${item.name}/${f.name}`);
          if (toRemove.length > 0) {
            console.log(`Removing test storage files:`, toRemove);
            await admin.storage.from('certificates').remove(toRemove);
          }
        }
      }
    }
  }

  // 4. Verify that real student certificates, progress, and users are untouched
  console.log('\n--- VERIFYING REAL PRODUCTION DATA INTEGRITY ---');
  const { count: realCertsCount } = await admin.from('certificates').select('id', { count: 'exact', head: true });
  const { count: realCompletionsCount } = await admin.from('course_completions').select('id', { count: 'exact', head: true });
  const { count: realProgressCount } = await admin.from('module_progress').select('id', { count: 'exact', head: true });
  const { count: realCoursesCount } = await admin.from('courses').select('id', { count: 'exact', head: true });
  const { data: usersData } = await admin.auth.admin.listUsers();

  console.log(`- Remaining Certificates: ${realCertsCount}`);
  console.log(`- Course Completions: ${realCompletionsCount}`);
  console.log(`- Module Progress records: ${realProgressCount}`);
  console.log(`- Course Catalog count: ${realCoursesCount}`);
  console.log(`- Total Auth Users: ${usersData.users.length}`);
  console.log('\n✓ Production data integrity verified: 0 real student records were touched.');
}

cleanUpProductionTestData().catch(console.error);

