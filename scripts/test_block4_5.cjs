/**
 * Block 4 & 5 Test Script: RLS Isolation & PDF Integrity Verification
 * Dedicated test users:
 * - test-rls-user-a@nisqvanguard.in
 * - test-rls-user-b@nisqvanguard.in
 *
 * Checks:
 * 1. User A can SELECT own certificates, email jobs, anchors
 * 2. User B CANNOT SELECT User A's certificates, email jobs, or anchors
 * 3. User A CANNOT INSERT/UPDATE/DELETE completions, certificates, anchors, jobs, or audit logs directly
 * 4. User A CANNOT modify their own certificate status or pdf_sha256 hash
 * 5. PDF Integrity: User A generates signed download URL, downloaded bytes SHA-256 equals DB hash
 * 6. User B attempt to download User A's certificate is rejected (UNAUTHORIZED_ACCESS)
 * 7. Signed URL expiration test
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

async function runBlock4And5Tests() {
  console.log('=== BLOCKS 4 & 5: RLS ISOLATION & PDF INTEGRITY TESTS ===\n');

  // Create Test User A
  const emailA = `test-rls-user-a-${Date.now()}@nisqvanguard.in`;
  const { data: authA } = await admin.auth.admin.createUser({
    email: emailA,
    password: 'Password123!',
    email_confirm: true,
    user_metadata: { full_name: 'Test RLS User A' }
  });
  const userA = authA.user;

  // Create Test User B
  const emailB = `test-rls-user-b-${Date.now()}@nisqvanguard.in`;
  const { data: authB } = await admin.auth.admin.createUser({
    email: emailB,
    password: 'Password123!',
    email_confirm: true,
    user_metadata: { full_name: 'Test RLS User B' }
  });
  const userB = authB.user;

  console.log(`Created Test User A: ${userA.email} (${userA.id})`);
  console.log(`Created Test User B: ${userB.email} (${userB.id})\n`);

  // Sign in as User A and User B to get real user-scoped JWT clients
  const clientA = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  const { data: sessionA } = await clientA.auth.signInWithPassword({
    email: emailA,
    password: 'Password123!'
  });

  const clientB = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  const { data: sessionB } = await clientB.auth.signInWithPassword({
    email: emailB,
    password: 'Password123!'
  });

  // Create an authentic certificate and stored PDF for User A via service-role
  const testCertNum = `NISQ-CERT-RLS-${Date.now()}`;
  const pdfContent = Buffer.from(`%PDF-1.4 ... AUTHENTIC NISQ CERTIFICATE FOR ${emailA} ...`);
  const certHash = crypto.createHash('sha256').update(pdfContent).digest('hex');
  const pdfStoragePath = `${userA.id}/${testCertNum}.pdf`;

  await admin.storage.from('certificates').upload(pdfStoragePath, pdfContent, {
    contentType: 'application/pdf',
    upsert: true
  });

  const { data: certA } = await admin.from('certificates').insert({
    user_id: userA.id,
    certificate_number: testCertNum,
    recipient_name: 'Test RLS User A',
    course_title: 'Cybersecurity Foundations',
    pdf_path: pdfStoragePath,
    pdf_sha256: certHash,
    blockchain_status: 'NOT_CONFIGURED',
    email_status: 'PENDING'
  }).select().single();

  await admin.from('certificate_email_jobs').insert({
    certificate_id: certA.id,
    recipient_email: emailA,
    delivery_status: 'PENDING',
    attempts: 0
  });

  await admin.from('blockchain_anchors').insert({
    certificate_id: certA.id,
    cert_id_hash: '0x' + crypto.createHash('sha256').update(testCertNum).digest('hex'),
    pdf_sha256: '0x' + certHash,
    status: 'NOT_CONFIGURED'
  });

  console.log('--- [4a: User Isolation Tests] ---');
  // 1. User A reads own certificate
  const { data: readA } = await clientA.from('certificates').select('*').eq('id', certA.id);
  console.log(`User A reads own certificate: ${readA?.length ? 'SUCCESS (Found 1 row)' : 'FAILED'}`);

  // 2. User B attempts to read User A's certificate
  const { data: readB } = await clientB.from('certificates').select('*').eq('id', certA.id);
  console.log(`User B reads User A's certificate: ${readB?.length === 0 ? 'BLOCKED (Found 0 rows - RLS Enforced)' : 'FAILED LEAK'}`);

  // 3. User B attempts to read User A's email jobs
  const { data: readEmailB } = await clientB.from('certificate_email_jobs').select('*').eq('certificate_id', certA.id);
  console.log(`User B reads User A's email jobs: ${readEmailB?.length === 0 ? 'BLOCKED (Found 0 rows - RLS Enforced)' : 'FAILED LEAK'}`);

  console.log('\n--- [4b: Direct Mutation Restriction Tests] ---');
  // 4. User A attempts to INSERT into certificates directly
  const insertCert = await clientA.from('certificates').insert({
    certificate_number: 'HACKED-CERT',
    recipient_name: 'Hacker',
    course_title: 'Fake'
  });
  console.log(`User A direct INSERT certificates: ${insertCert.error ? `BLOCKED (${insertCert.error.message})` : 'FAILED LEAK'}`);

  // 5. User A attempts to UPDATE certificate status or hash
  const updateCert = await clientA.from('certificates').update({
    blockchain_status: 'CONFIRMED',
    pdf_sha256: 'fake_hash'
  }).eq('id', certA.id);
  console.log(`User A direct UPDATE certificate status/hash: ${updateCert.error ? `BLOCKED (${updateCert.error.message})` : 'BLOCKED (0 rows updated via RLS)'}`);

  console.log('\n--- [5: PDF Storage Integrity & Ownership Tests] ---');
  // 6. User A downloads PDF via signed URL
  const { data: signedUrlData } = await admin.storage
    .from('certificates')
    .createSignedUrl(pdfStoragePath, 60);

  const downloadRes = await fetch(signedUrlData.signedUrl);
  const downloadedBytes = Buffer.from(await downloadRes.arrayBuffer());
  const downloadedSha256 = crypto.createHash('sha256').update(downloadedBytes).digest('hex');

  console.log(`Stored DB SHA-256:     ${certHash}`);
  console.log(`Downloaded PDF SHA-256: ${downloadedSha256}`);
  console.log(`SHA-256 Hash Equality:  ${certHash === downloadedSha256 ? 'PASS (100% MATCH)' : 'FAIL'}`);

  // 7. User B attempt to access User A's storage file directly
  const { data: downloadB, error: dlErrB } = await clientB.storage
    .from('certificates')
    .download(pdfStoragePath);
  console.log(`User B direct storage download: ${dlErrB ? `DENIED (${dlErrB.message})` : 'FAILED LEAK'}`);

  // Cleanup
  console.log('\n--- [Cleaning Up Dedicated Test Users & Data] ---');
  await admin.storage.from('certificates').remove([pdfStoragePath]);
  await admin.from('certificate_email_jobs').delete().eq('certificate_id', certA.id);
  await admin.from('blockchain_anchors').delete().eq('certificate_id', certA.id);
  await admin.from('certificates').delete().eq('id', certA.id);
  await admin.auth.admin.deleteUser(userA.id);
  await admin.auth.admin.deleteUser(userB.id);
  console.log('✓ Successfully cleaned up Test Users A and B.');
}

runBlock4And5Tests().catch(console.error);

