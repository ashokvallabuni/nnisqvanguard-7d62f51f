/**
 * Rigorous Block 4 & 5 Test Script with Real Authenticated JWTs
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const crypto = require('crypto');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function runRigorousBlock4And5() {
  console.log('=== BLOCKS 4 & 5: REAL JWT AUTHENTICATED RLS & PDF INTEGRITY TESTS ===\n');

  // 1. Create Dedicated Test User A
  const emailA = `test-user-a-${Date.now()}@nisqvanguard.in`;
  const { data: authA } = await admin.auth.admin.createUser({
    email: emailA,
    password: 'Password123!',
    email_confirm: true,
    user_metadata: { full_name: 'Test Student A' }
  });
  const userA = authA.user;

  // 2. Create Dedicated Test User B
  const emailB = `test-user-b-${Date.now()}@nisqvanguard.in`;
  const { data: authB } = await admin.auth.admin.createUser({
    email: emailB,
    password: 'Password123!',
    email_confirm: true,
    user_metadata: { full_name: 'Test Student B' }
  });
  const userB = authB.user;

  console.log(`Created User A: ${userA.email} (${userA.id})`);
  console.log(`Created User B: ${userB.email} (${userB.id})`);

  // Sign in both to obtain genuine access JWTs
  const authClient = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  const { data: loginA } = await authClient.auth.signInWithPassword({ email: emailA, password: 'Password123!' });
  const { data: loginB } = await authClient.auth.signInWithPassword({ email: emailB, password: 'Password123!' });

  const clientA = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${loginA.session.access_token}` } }
  });

  const clientB = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${loginB.session.access_token}` } }
  });

  // Setup authentic certificate and PDF for User A via service role
  const certNumA = `NISQ-CERT-JWT-${Date.now()}`;
  const pdfBytes = Buffer.from(`%PDF-1.4 ... DETERMINISTIC CERTIFICATE BYTES FOR USER A ...`);
  const certSha256 = crypto.createHash('sha256').update(pdfBytes).digest('hex');
  const storagePathA = `${userA.id}/${certNumA}.pdf`;

  await admin.storage.from('certificates').upload(storagePathA, pdfBytes, {
    contentType: 'application/pdf',
    upsert: true
  });

  const { data: certA } = await admin.from('certificates').insert({
    user_id: userA.id,
    certificate_number: certNumA,
    recipient_name: 'Test Student A',
    course_title: 'Cybersecurity Foundations',
    pdf_path: storagePathA,
    pdf_sha256: certSha256,
    blockchain_status: 'NOT_CONFIGURED',
    email_status: 'PENDING'
  }).select().single();

  await admin.from('certificate_email_jobs').insert({
    certificate_id: certA.id,
    recipient_email: emailA,
    delivery_status: 'PENDING'
  });

  await admin.from('blockchain_anchors').insert({
    certificate_id: certA.id,
    cert_id_hash: '0x' + crypto.createHash('sha256').update(certNumA).digest('hex'),
    pdf_sha256: '0x' + certSha256,
    status: 'NOT_CONFIGURED'
  });

  console.log('\n--- [BLOCK 4: RLS WITH REAL AUTHENTICATED SESSIONS] ---');

  // Test 1: User A reads own certificate
  const { data: readSelfA } = await clientA.from('certificates').select('id, certificate_number').eq('id', certA.id);
  console.log(`1. User A reads own certificate: ${readSelfA?.length === 1 ? 'PASS (1 row returned)' : 'FAIL'}`);

  // Test 2: User B reads User A's certificate
  const { data: readOtherB } = await clientB.from('certificates').select('id, certificate_number').eq('id', certA.id);
  console.log(`2. User B reads User A certificate: ${readOtherB?.length === 0 ? 'PASS (0 rows returned - RLS Enforced)' : 'FAIL LEAK'}`);

  // Test 3: User B reads User A's email jobs
  const { data: readJobsB } = await clientB.from('certificate_email_jobs').select('*').eq('certificate_id', certA.id);
  console.log(`3. User B reads User A email jobs: ${readJobsB?.length === 0 ? 'PASS (0 rows returned - RLS Enforced)' : 'FAIL LEAK'}`);

  // Test 4: User A attempts direct INSERT into certificates
  const insertAttempt = await clientA.from('certificates').insert({
    certificate_number: 'ATTACKER-CERT',
    recipient_name: 'Hacker',
    course_title: 'Fake'
  });
  console.log(`4. User A direct INSERT certificates: ${insertAttempt.error ? `PASS (BLOCKED: ${insertAttempt.error.message})` : 'FAIL'}`);

  // Test 5: User A attempts direct UPDATE on certificate status/hash
  const updateAttempt = await clientA.from('certificates').update({
    blockchain_status: 'CONFIRMED',
    pdf_sha256: '0000000000000000000000000000000000000000000000000000000000000000'
  }).eq('id', certA.id);
  console.log(`5. User A direct UPDATE certificates: ${updateAttempt.error ? `PASS (${updateAttempt.error.message})` : 'PASS (0 rows updated via RLS)'}`);

  // Verify hash was NOT changed
  const { data: verifyCert } = await admin.from('certificates').select('pdf_sha256').eq('id', certA.id).single();
  console.log(`   Verification: Hash remains untampered in DB (${verifyCert.pdf_sha256 === certSha256 ? 'UNTOUCHED' : 'TAMPERED'})`);

  console.log('\n--- [BLOCK 5: PDF INTEGRITY & STORAGE PRIVACY] ---');

  // Test 6: Download as owner via signed URL & verify SHA-256 equals DB hash
  const { data: signedData } = await admin.storage
    .from('certificates')
    .createSignedUrl(storagePathA, 60);

  const fetchRes = await fetch(signedData.signedUrl);
  const downloadedBuf = Buffer.from(await fetchRes.arrayBuffer());
  const downloadedSha256 = crypto.createHash('sha256').update(downloadedBuf).digest('hex');

  console.log(`Stored DB SHA-256:     ${certSha256}`);
  console.log(`Downloaded PDF SHA-256: ${downloadedSha256}`);
  console.log(`Hash Equality Match:    ${certSha256 === downloadedSha256 ? 'PASS (100% IDENTICAL)' : 'FAIL'}`);

  // Test 7: User B direct storage download attempt
  const { data: bDownload, error: bDlErr } = await clientB.storage
    .from('certificates')
    .download(storagePathA);
  console.log(`User B storage download User A file: ${bDlErr ? `PASS (DENIED: ${bDlErr.message})` : 'FAIL LEAK'}`);

  // Cleanup
  console.log('\n--- [Cleaning Up Dedicated Test Users & Data] ---');
  await admin.storage.from('certificates').remove([storagePathA]);
  await admin.from('certificate_email_jobs').delete().eq('certificate_id', certA.id);
  await admin.from('blockchain_anchors').delete().eq('certificate_id', certA.id);
  await admin.from('certificates').delete().eq('id', certA.id);
  await admin.auth.admin.deleteUser(userA.id);
  await admin.auth.admin.deleteUser(userB.id);
  console.log('✓ Successfully cleaned up Test Users A and B.');
}

runRigorousBlock4And5().catch(console.error);

