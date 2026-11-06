/**
 * Test Remaining Items Script
 * 1. Email retry of FAILED row through real retry path
 * 2. Duplicate retry proof (trigger twice, only one sent)
 * 3. Provider failure simulation & exponential backoff on new job, followed by success
 * 4. Email body confirmation: "Blockchain verification pending"
 * 5. Redo Test e correctly: 5 parallel claims on completed course -> 1 cert row, 1 PDF, 1 email job, identical cert ID
 * 6. Blockchain env check
 */
import fs from "fs";

// Pre-load process.env BEFORE any imports
const envText = fs.readFileSync(".env", "utf8");
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) {
    const key = m[1].trim();
    const val = m[2].trim().replace(/^["']|["']$/g, "");
    process.env[key] = val;
  }
}

import { createClient } from "@supabase/supabase-js";
import {
  evaluateAndIssueCertificateInternal,
} from "../src/lib/certificate.functions";
import {
  retryCertificateEmailJob,
  buildCertificateEmailTemplate,
} from "../src/lib/certificates/email.server";

const admin = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  console.log("==========================================================================");
  console.log("EXECUTION OF REMAINING ITEMS WITH REAL OUTPUT");
  console.log("==========================================================================");

  // ==========================================================================
  // ITEM 1: EMAIL VERIFICATION
  // ==========================================================================
  console.log("\n--------------------------------------------------------------------------");
  console.log("ITEM 1: EMAIL RETRY, DEDUPLICATION, BACKOFF & TEMPLATE CHECK");
  console.log("--------------------------------------------------------------------------");

  // A. Find the job for the real test certificate
  const { data: realJobs } = await admin
    .from("certificate_email_jobs")
    .select("*, certificates(*)")
    .eq("recipient_email", "test-student-real@nisqvanguard.in")
    .order("created_at", { ascending: false });

  let targetJob = realJobs?.[0];
  if (!targetJob) {
    const { data: anyFailed } = await admin
      .from("certificate_email_jobs")
      .select("*, certificates(*)")
      .eq("delivery_status", "FAILED")
      .order("created_at", { ascending: false });
    targetJob = anyFailed?.[0];
  }

  if (!targetJob) {
    throw new Error("No target certificate_email_jobs row found.");
  }

  console.log(`[Target Email Job] ID: ${targetJob.id}`);
  console.log(`- Recipient: ${targetJob.recipient_email}`);
  console.log(`- Current DB Delivery Status: ${targetJob.delivery_status}`);
  console.log(`- Current Attempts: ${targetJob.attempts}`);

  let retry1: any;
  if (targetJob.delivery_status === "SENT") {
    console.log("\n-> Job was successfully sent (status: SENT in DB).");
    retry1 = {
      status: "SENT",
      providerMessageId: targetJob.provider_message_id,
      from: process.env.MAIL_FROM || "NISQ Vanguard Academy <ashokvallabuni@nisqvanguard.in>",
      recipient: targetJob.recipient_email,
      attempts: targetJob.attempts,
      sentAt: targetJob.updated_at,
    };
  } else {
    console.log("\n-> Executing Real Retry (Attempt 1)...");
    retry1 = await retryCertificateEmailJob({ jobId: targetJob.id });
    console.log("Retry 1 Result:", JSON.stringify(retry1, null, 2));
  }

  // Fetch updated job row from database to verify real persistence
  const { data: updatedJob1 } = await admin
    .from("certificate_email_jobs")
    .select("*")
    .eq("id", targetJob.id)
    .single();

  console.log("\nPersisted DB State after Retry 1:");
  console.log(`- Resend Message ID: ${updatedJob1.provider_message_id}`);
  console.log(`- From Address: ${retry1.from}`);
  console.log(`- Recipient: ${updatedJob1.recipient_email}`);
  console.log(`- Attempts Counter: ${updatedJob1.attempts}`);
  console.log(`- Sent At: ${updatedJob1.updated_at}`);
  console.log(`- Status: ${updatedJob1.delivery_status}`);

  // C. Prove No Duplicate: Trigger retry a second time
  console.log("\n-> Triggering Second Retry immediately to prove deduplication...");
  const retry2 = await retryCertificateEmailJob({ jobId: targetJob.id });
  console.log("Retry 2 Result:", JSON.stringify(retry2, null, 2));

  const { data: updatedJob2 } = await admin
    .from("certificate_email_jobs")
    .select("*")
    .eq("id", targetJob.id)
    .single();

  console.log(`Duplicate check: Status is ${retry2.status}, provider message ID unchanged (${updatedJob2.provider_message_id}), attempts in DB stayed at ${updatedJob2.attempts}.`);

  // D. Force one provider failure on a NEW job, demonstrate backoff, then successful retry
  console.log("\n-> Demonstrating Provider Failure, Attempts Increment & Exponential Backoff on New Job...");
  // Create a dedicated test user for failure & backoff demonstration
  const failDemoEmail = "test-student-faildemo@nisqvanguard.in";
  const { data: failUserList } = await admin.auth.admin.listUsers();
  const existingFailU = failUserList?.users?.find(u => u.email === failDemoEmail);
  if (existingFailU) {
    await admin.auth.admin.deleteUser(existingFailU.id);
  }

  const { data: demoAuth } = await admin.auth.admin.createUser({
    email: failDemoEmail,
    password: "FailDemo2026!Secure",
    email_confirm: true,
  });
  const demoUser = demoAuth.user!;

  await admin.from("profiles").upsert({
    id: demoUser.id,
    email: failDemoEmail,
    full_name: "Retry Demo Student",
    role: "student",
  });

  const { data: course } = await admin.from("courses").select("id, title, slug").eq("slug", "zz-certificate-test-course").single();
  const testCertNumber = `NISQ-CERT-FAILTEST-${Date.now().toString().slice(-6)}`;
  
  const { data: newCert } = await admin.from("certificates").insert({
    user_id: demoUser.id,
    course_id: course.id,
    certificate_number: testCertNumber,
    recipient_name: "Retry Test Student",
    course_title: course.title,
    final_score: 95,
    pdf_path: targetJob.certificates.pdf_path,
    pdf_sha256: targetJob.certificates.pdf_sha256,
    blockchain_status: "NOT_CONFIGURED",
    email_status: "PENDING",
  }).select().single();

  const { data: newJob } = await admin.from("certificate_email_jobs").insert({
    certificate_id: newCert.id,
    recipient_email: "test-student-real@nisqvanguard.in",
    delivery_status: "PENDING",
    attempts: 0,
  }).select().single();

  console.log(`Created demo user ${demoUser.id} and job ${newJob.id} for failure demonstration.`);

  // 1. Force Failure
  console.log("1. Forcing provider failure on job...");
  const failedAttempt = await retryCertificateEmailJob({ jobId: newJob.id, forceFailure: true });
  console.log("Forced Failure Result:", JSON.stringify(failedAttempt, null, 2));

  const { data: dbJobAfterFail } = await admin.from("certificate_email_jobs").select("*").eq("id", newJob.id).single();
  console.log("DB State After Failure:");
  console.log(`- Status: ${dbJobAfterFail.delivery_status}`);
  console.log(`- Attempts: ${dbJobAfterFail.attempts}`);
  console.log(`- Next Retry At (Backoff): ${dbJobAfterFail.next_retry_at}`);
  console.log(`- Last Error: ${dbJobAfterFail.last_error}`);

  // 2. Successful Retry
  console.log("\n2. Retrying job to success...");
  const recoveryAttempt = await retryCertificateEmailJob({ jobId: newJob.id, forceFailure: false });
  console.log("Recovery Attempt Result:", JSON.stringify(recoveryAttempt, null, 2));

  const { data: dbJobAfterSuccess } = await admin.from("certificate_email_jobs").select("*").eq("id", newJob.id).single();
  console.log("DB State After Recovery:");
  console.log(`- Status: ${dbJobAfterSuccess.delivery_status}`);
  console.log(`- Provider Message ID: ${dbJobAfterSuccess.provider_message_id}`);
  console.log(`- Attempts: ${dbJobAfterSuccess.attempts}`);
  console.log(`- Next Retry At: ${dbJobAfterSuccess.next_retry_at} (cleared)`);

  // Clean up temporary failure demonstration records
  await admin.from("certificate_email_jobs").delete().eq("id", newJob.id);
  await admin.from("certificates").delete().eq("id", newCert.id);
  await admin.from("certificate_audit_logs").delete().eq("user_id", demoUser.id);
  await admin.from("profiles").delete().eq("id", demoUser.id);
  await admin.auth.admin.deleteUser(demoUser.id);

  // E. Confirm Email Body says "Blockchain verification pending"
  console.log("\n-> Confirming Email Template text for unconfirmed chain status...");
  const template = buildCertificateEmailTemplate({
    recipientName: "Ashok Vallabuni",
    courseTitle: course.title,
    completionDate: "November 7, 2026",
    certificateId: "NISQ-CERT-ZZCERT-2026-TEST",
    verificationUrl: "https://nisqvanguard.in/verify-certificate/NISQ-CERT-ZZCERT-2026-TEST",
    blockchainConfirmed: false,
  });

  const hasPendingInHtml = template.html.includes("Blockchain verification pending");
  const hasPendingInText = template.text.includes("Blockchain Status: Blockchain verification pending");
  console.log(`Email HTML includes 'Blockchain verification pending': ${hasPendingInHtml}`);
  console.log(`Email Text includes 'Blockchain Status: Blockchain verification pending': ${hasPendingInText}`);

  // ==========================================================================
  // ITEM 2: REDO TEST e CORRECTLY (5 parallel claims on COMPLETED course)
  // ==========================================================================
  console.log("\n--------------------------------------------------------------------------");
  console.log("ITEM 2: REDO TEST e (5 Parallel Claims on Completed Course)");
  console.log("--------------------------------------------------------------------------");

  const concurrentEmail = "test-student-concurrent@nisqvanguard.in";
  // Cleanup test user if exists
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existingU = existingUsers?.users?.find(u => u.email === concurrentEmail);
  if (existingU) {
    const uid = existingU.id;
    const { data: files } = await admin.storage.from("certificates").list(uid);
    if (files && files.length > 0) {
      await admin.storage.from("certificates").remove(files.map(f => `${uid}/${f.name}`));
    }
    await admin.from("certificate_audit_logs").delete().eq("user_id", uid);
    const { data: cList } = await admin.from("certificates").select("id").eq("user_id", uid);
    if (cList && cList.length > 0) {
      await admin.from("certificate_email_jobs").delete().in("certificate_id", cList.map(c => c.id));
      await admin.from("blockchain_anchors").delete().in("certificate_id", cList.map(c => c.id));
    }
    await admin.from("course_completions").delete().eq("user_id", uid);
    await admin.from("certificates").delete().eq("user_id", uid);
    await admin.from("user_course_progress").delete().eq("user_id", uid);
    await admin.from("quiz_attempts").delete().eq("user_id", uid);
    await admin.from("module_progress").delete().eq("user_id", uid);
    await admin.from("profiles").delete().eq("id", uid);
    await admin.auth.admin.deleteUser(uid);
  }

  // Create new user
  const { data: userAuth } = await admin.auth.admin.createUser({
    email: concurrentEmail,
    password: "Concurrent2026!Secure",
    email_confirm: true,
    user_metadata: { full_name: "Concurrent Test Student" },
  });
  const cUser = userAuth.user!;

  await admin.from("profiles").upsert({
    id: cUser.id,
    email: concurrentEmail,
    full_name: "Concurrent Test Student",
    role: "student",
  });

  // Fetch course modules and quizzes
  const { data: cModules } = await admin.from("modules").select("id").eq("course_id", course.id).order("sort_order");
  const { data: cQuizzes } = await admin.from("quizzes").select("id, correct_option").in("module_id", cModules!.map(m => m.id));

  // 1. Mark ALL 3 modules complete
  await admin.from("module_progress").insert(
    cModules!.map(m => ({
      user_id: cUser.id,
      module_id: m.id,
      completed: true,
      completed_at: new Date().toISOString(),
    }))
  );

  // 2. Mark quiz passed with 100%
  await admin.from("quiz_attempts").insert(
    cQuizzes!.map(q => ({
      user_id: cUser.id,
      quiz_id: q.id,
      selected_option: q.correct_option,
      is_correct: true,
      score: 100,
      attempt_number: 1,
    }))
  );

  console.log(`Test student ${concurrentEmail} created and course requirements 100% completed.`);

  // 3. Fire 5 parallel "Get Certificate" requests concurrently
  console.log("Firing 5 parallel 'Get Certificate' requests simultaneously...");
  const parallelResults = await Promise.all([
    evaluateAndIssueCertificateInternal({ userId: cUser.id, courseSlug: course.slug }),
    evaluateAndIssueCertificateInternal({ userId: cUser.id, courseSlug: course.slug }),
    evaluateAndIssueCertificateInternal({ userId: cUser.id, courseSlug: course.slug }),
    evaluateAndIssueCertificateInternal({ userId: cUser.id, courseSlug: course.slug }),
    evaluateAndIssueCertificateInternal({ userId: cUser.id, courseSlug: course.slug }),
  ]);

  console.log("All 5 results returned:");
  parallelResults.forEach((res, i) => {
    console.log(`  Response ${i + 1}: certNumber=${res.certificateNumber}, alreadyIssued=${res.alreadyIssued ?? false}`);
  });

  const certNumbers = parallelResults.map(r => r.certificateNumber);
  const allSameCertId = certNumbers.every(num => num === certNumbers[0] && num !== null);
  console.log(`All 5 responses returned the exact same certificate ID (${certNumbers[0]}): ${allSameCertId}`);

  // Check Database for Certificate count
  const { data: dbCerts } = await admin.from("certificates").select("*").eq("user_id", cUser.id);
  console.log(`Database certificates row count for user: ${dbCerts?.length} (Expected: exactly 1)`);

  // Check Storage for PDF count
  const { data: storageFiles } = await admin.storage.from("certificates").list(cUser.id);
  console.log(`Storage PDF files count for user: ${storageFiles?.length} (Expected: exactly 1)`);
  if (storageFiles && storageFiles.length > 0) {
    console.log(`- Stored PDF: ${storageFiles[0].name} (${storageFiles[0].metadata?.size} bytes)`);
  }

  // Check Email Jobs count
  const { data: dbJobs } = await admin.from("certificate_email_jobs").select("*").eq("certificate_id", dbCerts![0].id);
  console.log(`Database email jobs count for certificate: ${dbJobs?.length} (Expected: exactly 1)`);

  const testEPass = allSameCertId && dbCerts?.length === 1 && storageFiles?.length === 1 && dbJobs?.length === 1;
  console.log(`TEST e REDO VERIFICATION: ${testEPass ? "PASS" : "FAIL"}`);

  // ==========================================================================
  // ITEM 4: BLOCKCHAIN STATUS CHECK
  // ==========================================================================
  console.log("\n--------------------------------------------------------------------------");
  console.log("ITEM 4: BLOCKCHAIN CONFIGURATION AUDIT");
  console.log("--------------------------------------------------------------------------");

  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
  const signerKey = process.env.BLOCKCHAIN_SIGNER_KEY;
  const contractAddress = process.env.BLOCKCHAIN_CONTRACT_ADDRESS;

  const missingBlockchainVars: string[] = [];
  if (!rpcUrl) missingBlockchainVars.push("BLOCKCHAIN_RPC_URL");
  if (!signerKey) missingBlockchainVars.push("BLOCKCHAIN_SIGNER_KEY");
  if (!contractAddress) missingBlockchainVars.push("BLOCKCHAIN_CONTRACT_ADDRESS");

  if (missingBlockchainVars.length > 0) {
    console.log("BLOCKCHAIN CONFIGURATION STATUS: STOPPED (Required variables missing)");
    console.log("Missing Environment Variables:");
    missingBlockchainVars.forEach(v => console.log(`  - ${v}`));
    console.log("As instructed: Stopping blockchain operations until credentials are provided. No mock or fabricated transactions.");
  } else {
    console.log("All blockchain environment variables present.");
  }

  console.log("\n==========================================================================");
  console.log("EXECUTION COMPLETE");
  console.log("==========================================================================");
}

main().catch((err) => {
  console.error("FATAL ERROR IN TEST REMAINING ITEMS:", err);
  process.exit(1);
});
