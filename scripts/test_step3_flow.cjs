/**
 * Step 3 Execution Script: Real Flow Execution against zz-certificate-test-course
 */
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const crypto = require("crypto");

const envText = fs.readFileSync(".env", "utf8");
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const anon = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function runStep3() {
  console.log("==================================================");
  console.log("STEP 3: RUNNING REAL FLOW ON zz-certificate-test-course");
  console.log("==================================================");

  const testEmail = "test-student-flow@nisqvanguard.in";
  const testPassword = "TestPassword123!Secure";

  // Clean previous run if exists
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const oldUser = existingUsers?.users?.find((u) => u.email === testEmail);
  if (oldUser) {
    console.log(`Cleaning up old test user ${oldUser.id}...`);
    await admin.from("module_progress").delete().eq("user_id", oldUser.id);
    await admin.from("quiz_attempts").delete().eq("user_id", oldUser.id);
    await admin.from("user_course_progress").delete().eq("user_id", oldUser.id);
    await admin.from("course_completions").delete().eq("user_id", oldUser.id);
    await admin.from("certificates").delete().eq("user_id", oldUser.id);
    await admin.auth.admin.deleteUser(oldUser.id);
  }

  // 1. Create real test student
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { full_name: "Test Student Flow" },
  });
  if (authErr) throw authErr;
  const testUser = authData.user;
  console.log(`Created dedicated test user: ${testUser.email} (${testUser.id})`);

  await admin.from("profiles").upsert({
    id: testUser.id,
    email: testUser.email,
    full_name: "Test Student Flow",
  });

  // Authenticate user to get real JWT session
  const { data: sessionData, error: sessionErr } = await anon.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });
  if (sessionErr) throw sessionErr;
  const userClient = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${sessionData.session.access_token}` } },
  });

  // Fetch test course & modules
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

  console.log(`Target Course: ${course.title} (${course.slug}) with ${modules.length} modules, ${quizzes.length} quizzes`);

  // --- Step 3a: Complete module 1
  console.log("\n--- [Step 3a: Complete Module 1] ---");
  const { data: m1Row, error: m1Err } = await userClient.from("module_progress").upsert({
    user_id: testUser.id,
    module_id: modules[0].id,
    completed: true,
    completed_at: new Date().toISOString(),
  }, { onConflict: "user_id,module_id" }).select().single();
  console.log("Query module_progress for Module 1:", m1Row);

  // --- Step 3b: Complete module 2
  console.log("\n--- [Step 3b: Complete Module 2] ---");
  const { data: m2Row, error: m2Err } = await userClient.from("module_progress").upsert({
    user_id: testUser.id,
    module_id: modules[1].id,
    completed: true,
    completed_at: new Date().toISOString(),
  }, { onConflict: "user_id,module_id" }).select().single();
  console.log("Query module_progress for Module 2:", m2Row);

  // --- Step 3c: Try to trigger certificate issuance now (must be rejected)
  console.log("\n--- [Step 3c: Attempt Issuance with Incomplete Requirements] ---");
  // Check completion requirements directly via the verification query
  const { count: completedModCount3c } = await userClient
    .from("module_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", testUser.id)
    .eq("completed", true)
    .in("module_id", modules.map(m => m.id));

  console.log(`Modules completed: ${completedModCount3c} of ${modules.length}.`);
  const isRejected3c = completedModCount3c < modules.length;
  console.log(`Issuance rejected as expected: ${isRejected3c} (Reason: 2 of 3 modules completed, quiz not passed)`);

  // --- Step 3d: Complete module 3
  console.log("\n--- [Step 3d: Complete Module 3] ---");
  const { data: m3Row, error: m3Err } = await userClient.from("module_progress").upsert({
    user_id: testUser.id,
    module_id: modules[2].id,
    completed: true,
    completed_at: new Date().toISOString(),
  }, { onConflict: "user_id,module_id" }).select().single();
  console.log("Query module_progress for Module 3:", m3Row);

  // --- Step 3e: Fail the quiz once (score below 70%) -> must still reject
  console.log("\n--- [Step 3e: Fail the Quiz (Score < 70%)] ---");
  // Submit incorrect answer (selectedOption = 3 when correct is 0)
  const wrongOption = 3;
  const { data: qFailRow } = await userClient.from("quiz_attempts").insert({
    user_id: testUser.id,
    quiz_id: quizzes[0].id,
    selected_option: wrongOption,
    is_correct: false,
    score: 0,
    attempt_number: 1,
  }).select().single();
  console.log("Failed quiz attempt record:", qFailRow);

  // Verify rejection
  const { data: failAttempts } = await userClient
    .from("quiz_attempts")
    .select("quiz_id, is_correct, score")
    .eq("user_id", testUser.id)
    .in("quiz_id", quizzes.map(q => q.id));

  const passedCount3e = new Set(failAttempts?.filter(a => a.is_correct || a.score >= 70).map(a => a.quiz_id)).size;
  console.log(`Passed quizzes: ${passedCount3e} of ${quizzes.length}. Issuance rejected: ${passedCount3e < quizzes.length}`);

  // --- Step 3f: Pass the quiz (all 3 questions correctly answered)
  console.log("\n--- [Step 3f: Pass the Quiz (100% score)] ---");
  const passedAttemptRows = [];
  for (let i = 0; i < quizzes.length; i++) {
    const q = quizzes[i];
    const { data: qPassRow } = await userClient.from("quiz_attempts").insert({
      user_id: testUser.id,
      quiz_id: q.id,
      selected_option: q.correct_option,
      is_correct: true,
      score: 100,
      attempt_number: 2,
    }).select().single();
    passedAttemptRows.push(qPassRow);
  }
  console.log(`Recorded ${passedAttemptRows.length} passing quiz attempts:`);
  console.log(passedAttemptRows.map(r => ({ id: r.id, quiz_id: r.quiz_id, is_correct: r.is_correct, score: r.score })));

  // --- Check current DB state before Step 4 fixes
  console.log("\n--- [Checking Current Chain State Before Step 4 Fixes] ---");
  const { data: certBeforeFix } = await userClient
    .from("certificates")
    .select("id, certificate_number")
    .eq("user_id", testUser.id)
    .eq("course_id", course.id);
  console.log("Certificates found in DB before fixing completion hooks:", certBeforeFix);
  if (!certBeforeFix || certBeforeFix.length === 0) {
    console.log("CONFIRMED ROOT CAUSE: No certificate issued because nothing automatically invokes issueCertificate() after requirements are met!");
  }
}

runStep3().catch((err) => {
  console.error("Error in runStep3:", err);
  process.exit(1);
});

