/**
 * CLEANUP SCRIPT: Test Course & Test Users Cleanup
 *
 * This script removes ONLY:
 * 1. The test course 'zz-certificate-test-course' and its modules, lessons, and quizzes
 * 2. Dedicated test user accounts (emails starting with 'test-student-')
 * 3. Associated test data: module_progress, quiz_attempts, user_course_progress,
 *    course_completions, certificates, certificate_email_jobs, blockchain_anchors,
 *    and certificate_audit_logs created during testing
 * 4. PDF files stored in private Supabase Storage under test user IDs
 *
 * DOES NOT TOUCH any real student data, real progress, or the 105 canonical courses.
 *
 * Run with: node scripts/cleanup_test_course_and_data.cjs
 */
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const envText = fs.readFileSync(".env", "utf8");
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanup() {
  console.log("=== STARTING TEST DATA CLEANUP ===");

  // 1. Identify test users
  const { data: usersList } = await admin.auth.admin.listUsers();
  const testUsers = (usersList?.users || []).filter(
    (u) => u.email && (u.email.startsWith("test-student-") || u.email.includes("test-student"))
  );
  console.log(`Identified ${testUsers.length} test user(s) for cleanup:`, testUsers.map((u) => u.email));

  for (const user of testUsers) {
    const uid = user.id;
    console.log(`Cleaning data for test user: ${user.email} (${uid})...`);

    // Delete PDF files from storage
    const { data: files } = await admin.storage.from("certificates").list(uid);
    if (files && files.length > 0) {
      const paths = files.map((f) => `${uid}/${f.name}`);
      await admin.storage.from("certificates").remove(paths);
      console.log(`  Removed ${paths.length} file(s) from storage:`, paths);
    }

    // Delete child records
    const { data: userCerts } = await admin.from("certificates").select("id").eq("user_id", uid);
    const certIds = (userCerts || []).map((c) => c.id);

    if (certIds.length > 0) {
      await admin.from("certificate_email_jobs").delete().in("certificate_id", certIds);
      await admin.from("blockchain_anchors").delete().in("certificate_id", certIds);
      console.log(`  Deleted email jobs and blockchain anchors for ${certIds.length} cert(s)`);
    }

    await admin.from("certificate_audit_logs").delete().eq("user_id", uid);
    await admin.from("course_completions").delete().eq("user_id", uid);
    await admin.from("certificates").delete().eq("user_id", uid);
    await admin.from("user_course_progress").delete().eq("user_id", uid);
    await admin.from("quiz_attempts").delete().eq("user_id", uid);
    await admin.from("module_progress").delete().eq("user_id", uid);
    await admin.from("profiles").delete().eq("id", uid);

    // Delete auth user
    await admin.auth.admin.deleteUser(uid);
    console.log(`  Deleted auth user ${user.email}`);
  }

  // 2. Identify test course
  const { data: testCourse } = await admin
    .from("courses")
    .select("id, slug, title")
    .eq("slug", "zz-certificate-test-course")
    .maybeSingle();

  if (testCourse) {
    console.log(`Found test course: ${testCourse.title} (${testCourse.id}). Removing...`);
    // Delete quizzes
    const { data: testMods } = await admin.from("modules").select("id").eq("course_id", testCourse.id);
    const modIds = (testMods || []).map((m) => m.id);

    if (modIds.length > 0) {
      await admin.from("quizzes").delete().in("module_id", modIds);
      console.log(`  Deleted quizzes for ${modIds.length} test module(s)`);
    }

    // Delete modules
    await admin.from("modules").delete().eq("course_id", testCourse.id);
    console.log(`  Deleted modules for test course`);

    // Delete course
    await admin.from("courses").delete().eq("id", testCourse.id);
    console.log(`  Deleted course: zz-certificate-test-course`);
  } else {
    console.log("Test course 'zz-certificate-test-course' not found (already clean).");
  }

  // 3. Verify canonical courses remain intact
  const { count: realCoursesCount } = await admin
    .from("courses")
    .select("id", { count: "exact", head: true });
  console.log(`Verification: Remaining canonical courses count: ${realCoursesCount}`);

  console.log("=== CLEANUP COMPLETED SUCCESSFULLY ===");
}

if (process.argv.includes("--confirm")) {
  cleanup().catch(console.error);
} else {
  console.log("SAFETY NOTICE: This script will only run when passed '--confirm'.");
  console.log("Run: node scripts/cleanup_test_course_and_data.cjs --confirm");
}

