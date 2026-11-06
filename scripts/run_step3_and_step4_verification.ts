/**
 * Step 3 & Step 4 Full End-to-End Verification Script
 * Uses real Supabase DB, real auth sessions, real PDF generation and storage,
 * real RPC verification, and real edge cases.
 */
import fs from "fs";

// Pre-load process.env BEFORE any imports that access process.env
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
import crypto from "crypto";
import { evaluateAndIssueCertificateInternal } from "../src/lib/certificate.functions";

const admin = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const anon = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function cleanupUser(email: string) {
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === email);
  if (existing) {
    const uid = existing.id;
    // List and delete files in storage
    const { data: files } = await admin.storage.from("certificates").list(uid);
    if (files && files.length > 0) {
      await admin.storage.from("certificates").remove(files.map((f) => `${uid}/${f.name}`));
    }
    await admin.from("certificate_audit_logs").delete().eq("user_id", uid);
    await admin.from("certificate_email_jobs").delete().in(
      "certificate_id",
      (await admin.from("certificates").select("id").eq("user_id", uid)).data?.map((c) => c.id) || []
    );
    await admin.from("blockchain_anchors").delete().in(
      "certificate_id",
      (await admin.from("certificates").select("id").eq("user_id", uid)).data?.map((c) => c.id) || []
    );
    await admin.from("course_completions").delete().eq("user_id", uid);
    await admin.from("certificates").delete().eq("user_id", uid);
    await admin.from("user_course_progress").delete().eq("user_id", uid);
    await admin.from("quiz_attempts").delete().eq("user_id", uid);
    await admin.from("module_progress").delete().eq("user_id", uid);
    await admin.from("profiles").delete().eq("id", uid);
    await admin.auth.admin.deleteUser(uid);
  }
}

async function runVerification() {
  console.log("=====================================================================");
  console.log("END-TO-END CERTIFICATION PIPELINE VERIFICATION (REAL CODE & REAL DB)");
  console.log("=====================================================================");

  const studentEmail = "test-student-verified@nisqvanguard.in";
  const studentPassword = "VerifiedStudent2026!Pass";
  await cleanupUser(studentEmail);

  // 1. Create fresh test student in Supabase Auth
  const { data: authRes, error: authErr } = await admin.auth.admin.createUser({
    email: studentEmail,
    password: studentPassword,
    email_confirm: true,
    user_metadata: { full_name: "Verified Test Student" },
  });
  if (authErr) throw authErr;
  const user = authRes.user;
  console.log(`[AUTH] Created student: ${user.email} (${user.id})`);

  await admin.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: "Verified Test Student",
  });

  // Login as student to obtain real JWT
  const { data: loginRes, error: loginErr } = await anon.auth.signInWithPassword({
    email: studentEmail,
    password: studentPassword,
  });
  if (loginErr) throw loginErr;
  const studentClient = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${loginRes.session.access_token}` } },
  });

  // Fetch test course
  const { data: course } = await admin
    .from("courses")
    .select("id, slug, title")
    .eq("slug", "zz-certificate-test-course")
    .single();

  const { data: modules } = await admin
    .from("modules")
    .select("id, slug, title, sort_order")
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });

  const { data: quizzes } = await admin
    .from("quizzes")
    .select("id, module_id, question, correct_option, sort_order")
    .eq("module_id", modules[2].id)
    .order("sort_order", { ascending: true });

  console.log(`[COURSE] ${course.title} (${course.slug}) with ${modules.length} modules and ${quizzes.length} quizzes`);

  // --- Step 3a: Complete module 1
  console.log("\n>>> Step 3a: Complete module 1");
  const { data: m1Row } = await studentClient.from("module_progress").upsert({
    user_id: user.id,
    module_id: modules[0].id,
    completed: true,
    completed_at: new Date().toISOString(),
  }, { onConflict: "user_id,module_id" }).select().single();
  console.log("module_progress row 1:", JSON.stringify(m1Row, null, 2));

  // --- Step 3b: Complete module 2
  console.log("\n>>> Step 3b: Complete module 2");
  const { data: m2Row } = await studentClient.from("module_progress").upsert({
    user_id: user.id,
    module_id: modules[1].id,
    completed: true,
    completed_at: new Date().toISOString(),
  }, { onConflict: "user_id,module_id" }).select().single();
  console.log("module_progress row 2:", JSON.stringify(m2Row, null, 2));

  // --- Step 3c: Try to trigger certificate issuance now -> rejected
  console.log("\n>>> Step 3c: Attempt issuance with incomplete requirements");
  const rejectRes1 = await evaluateAndIssueCertificateInternal({ userId: user.id, courseSlug: course.slug });
  console.log("Rejection result (Step 3c):", JSON.stringify(rejectRes1, null, 2));
  if (rejectRes1.error !== "REQUIREMENTS_NOT_MET") throw new Error("Expected REQUIREMENTS_NOT_MET");

  // --- Step 3d: Complete module 3
  console.log("\n>>> Step 3d: Complete module 3");
  const { data: m3Row } = await studentClient.from("module_progress").upsert({
    user_id: user.id,
    module_id: modules[2].id,
    completed: true,
    completed_at: new Date().toISOString(),
  }, { onConflict: "user_id,module_id" }).select().single();
  console.log("module_progress row 3:", JSON.stringify(m3Row, null, 2));

  // --- Step 3e: Fail the quiz once (score below 70%) -> rejected
  console.log("\n>>> Step 3e: Fail the quiz (score below 70%)");
  await studentClient.from("quiz_attempts").insert({
    user_id: user.id,
    quiz_id: quizzes[0].id,
    selected_option: 3, // wrong
    is_correct: false,
    score: 0,
    attempt_number: 1,
  });
  const rejectRes2 = await evaluateAndIssueCertificateInternal({ userId: user.id, courseSlug: course.slug });
  console.log("Rejection result (Step 3e):", JSON.stringify(rejectRes2, null, 2));
  if (rejectRes2.error !== "ASSESSMENT_NOT_PASSED") throw new Error("Expected ASSESSMENT_NOT_PASSED");

  // --- Step 3f: Pass the quiz -> show quiz attempt row
  console.log("\n>>> Step 3f: Pass the quiz (all questions answered correctly)");
  const quizPassAttempts = [];
  for (const q of quizzes) {
    const { data: row } = await studentClient.from("quiz_attempts").insert({
      user_id: user.id,
      quiz_id: q.id,
      selected_option: q.correct_option,
      is_correct: true,
      score: 100,
      attempt_number: 2,
    }).select().single();
    quizPassAttempts.push(row);
  }
  console.log("Quiz attempts passed (Step 3f):", JSON.stringify(quizPassAttempts, null, 2));

  // Now trigger automatic completion engine (as called by submitQuizAnswer / completeModule)
  console.log("\n>>> Triggering Automatic Completion Engine after passing final requirement...");
  const issueResult = await evaluateAndIssueCertificateInternal({ userId: user.id, courseSlug: course.slug });
  console.log("Issuance Result:", JSON.stringify(issueResult, null, 2));
  if (!issueResult.certificateNumber) throw new Error("Certificate issuance failed!");

  // --- Step 3g: Show course_completions row
  console.log("\n>>> Step 3g: Show course_completions row");
  const { data: completionRow } = await admin
    .from("course_completions")
    .select("id, user_id, course_id, certificate_id, completed_at, total_modules, completed_modules, final_score")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .single();
  console.log("course_completions row:", JSON.stringify(completionRow, null, 2));

  // --- Step 3h: Show certificates row
  console.log("\n>>> Step 3h: Show certificates row");
  const { data: certRow } = await admin
    .from("certificates")
    .select("id, certificate_number, verification_token, pdf_path, pdf_sha256, blockchain_status, blockchain_network, email_status, final_score, issued_at")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .single();
  console.log("certificates row:", JSON.stringify(certRow, null, 2));

  // --- Step 3i: Show PDF in private storage, download via signed URL & compare SHA-256
  console.log("\n>>> Step 3i: Verify PDF in Private Storage & SHA-256 Digest");
  const { data: signedData, error: signedErr } = await admin.storage
    .from("certificates")
    .createSignedUrl(certRow.pdf_path, 300);
  if (signedErr) throw signedErr;
  console.log("Signed Download URL generated successfully (expires in 300s):", signedData.signedUrl.slice(0, 80) + "...");

  const fetchRes = await fetch(signedData.signedUrl);
  if (!fetchRes.ok) throw new Error(`Failed to download PDF: ${fetchRes.status}`);
  const downloadedBuf = Buffer.from(await fetchRes.arrayBuffer());
  const downloadedSha256 = crypto.createHash("sha256").update(downloadedBuf).digest("hex");

  console.log(`Downloaded PDF Size: ${downloadedBuf.length} bytes`);
  console.log(`Downloaded SHA-256: ${downloadedSha256}`);
  console.log(`Database pdf_sha256: ${certRow.pdf_sha256}`);
  const hashMatch = downloadedSha256 === certRow.pdf_sha256;
  console.log(`SHA-256 Cryptographic Match: ${hashMatch}`);
  if (!hashMatch) throw new Error("SHA-256 MISMATCH!");

  // --- Step 3j: Show certificate_email_jobs row and status
  console.log("\n>>> Step 3j: Show certificate_email_jobs row");
  const { data: emailJobRow } = await admin
    .from("certificate_email_jobs")
    .select("id, certificate_id, recipient_email, delivery_status, attempts, last_error, provider_message_id, created_at")
    .eq("certificate_id", certRow.id)
    .single();
  console.log("certificate_email_jobs row:", JSON.stringify(emailJobRow, null, 2));

  // --- Step 3k: Show certificate in My Certificates query
  console.log("\n>>> Step 3k: Query My Certificates as student");
  const { data: myCerts } = await studentClient
    .from("certificates")
    .select("id, certificate_number, course_title, issued_at, final_score, blockchain_status, blockchain_tx_hash, email_status, revoked")
    .eq("user_id", user.id);
  console.log("My Certificates Query Result:", JSON.stringify(myCerts, null, 2));
  if (!myCerts || myCerts.length === 0) throw new Error("My Certificates query returned 0 rows!");

  // --- Step 3l: Open /verify-certificate/[certificateId] publicly
  console.log("\n>>> Step 3l: Public Exact Lookup via RPC");
  const { data: publicCert, error: rpcErr } = await anon.rpc("lookup_certificate_public", {
    lookup_number: certRow.certificate_number,
  });
  if (rpcErr) throw rpcErr;
  console.log("Public Verification Payload (Anonymous lookup):", JSON.stringify(publicCert, null, 2));
  console.log("PII Privacy Check - user_id present?:", !!publicCert[0]?.user_id);
  console.log("PII Privacy Check - email present?:", !!publicCert[0]?.email);
  console.log("Masked Name:", publicCert[0]?.masked_recipient_name);

  // --- Step 4 Additional Tests: Idempotency & Order of Completion
  console.log("\n=====================================================================");
  console.log("STEP 4: IDEMPOTENCY & EDGE CASE VERIFICATION");
  console.log("=====================================================================");

  // 1. Call issue endpoint twice on completed course (Idempotency)
  console.log("Test 1: Calling issueCertificate second time on already issued course...");
  const secondIssue = await evaluateAndIssueCertificateInternal({ userId: user.id, courseSlug: course.slug });
  console.log("Second call result:", JSON.stringify(secondIssue, null, 2));
  const { count: certCountAfterSecond } = await admin
    .from("certificates")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("course_id", course.id);
  console.log(`Total certificate records in DB for user: ${certCountAfterSecond} (Expected: 1)`);
  if (certCountAfterSecond !== 1) throw new Error("IDEMPOTENCY FAILED: Multiple certificates created!");

  // 2. Different order: Complete Quiz BEFORE Module 3 on a fresh user
  const orderEmail = "test-student-order@nisqvanguard.in";
  await cleanupUser(orderEmail);

  const { data: orderAuth } = await admin.auth.admin.createUser({
    email: orderEmail,
    password: "OrderTestPassword2026!",
    email_confirm: true,
    user_metadata: { full_name: "Order Test Student" },
  });
  const orderUser = orderAuth.user;
  await admin.from("profiles").upsert({
    id: orderUser.id,
    email: orderUser.email,
    full_name: "Order Test Student",
  });
  console.log(`\nCreated second test user for Order Test: ${orderUser.email}`);

  // Complete module 1 & 2
  await admin.from("module_progress").upsert([
    { user_id: orderUser.id, module_id: modules[0].id, completed: true },
    { user_id: orderUser.id, module_id: modules[1].id, completed: true },
  ]);

  // Complete QUIZ before module 3
  console.log("Passing quiz before completing Module 3...");
  for (const q of quizzes) {
    await admin.from("quiz_attempts").insert({
      user_id: orderUser.id,
      quiz_id: q.id,
      selected_option: q.correct_option,
      is_correct: true,
      score: 100,
      attempt_number: 1,
    });
  }

  // Attempt issuance before module 3 is marked
  const orderReject = await evaluateAndIssueCertificateInternal({ userId: orderUser.id, courseSlug: course.slug });
  console.log("Issuance rejected before module 3 complete:", orderReject.error === "REQUIREMENTS_NOT_MET");

  // Now complete module 3 (the final action)
  console.log("Now completing Module 3 as the final action...");
  await admin.from("module_progress").upsert({
    user_id: orderUser.id,
    module_id: modules[2].id,
    completed: true,
  });

  // Now issuance should succeed!
  const orderPass = await evaluateAndIssueCertificateInternal({ userId: orderUser.id, courseSlug: course.slug });
  console.log("Issuance successful upon final module completion:", orderPass.certificateNumber);
  if (!orderPass.certificateNumber) throw new Error("Order test failed to issue certificate!");

  console.log("\n=====================================================================");
  console.log("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!");
  console.log("=====================================================================");
}

runVerification().catch((err) => {
  console.error("FATAL ERROR IN VERIFICATION:", err);
  process.exit(1);
});
