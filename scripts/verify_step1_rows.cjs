const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const envText = fs.readFileSync(".env", "utf8");
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function verifyStep1() {
  console.log("=== STEP 1: VERIFYING TEST COURSE & ROWS ===");
  
  // 1. Course row
  const { data: course, error: cErr } = await supabase
    .from("courses")
    .select("id, slug, title, level, tier, sort_order, is_test")
    .eq("slug", "zz-certificate-test-course")
    .single();

  if (cErr) throw cErr;
  console.log("Course row:", JSON.stringify(course, null, 2));

  // 2. Modules rows
  const { data: modules, error: mErr } = await supabase
    .from("modules")
    .select("id, slug, title, sort_order, practice_labs")
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });

  if (mErr) throw mErr;
  console.log(`Modules (${modules.length}):`, JSON.stringify(modules, null, 2));

  // 3. Quizzes rows
  const module3 = modules.find((m) => m.slug === "zz-test-mod-3");
  const { data: quizzes, error: qErr } = await supabase
    .from("quizzes")
    .select("id, module_id, question, correct_option, sort_order")
    .eq("module_id", module3.id)
    .order("sort_order", { ascending: true });

  if (qErr) throw qErr;
  console.log(`Quizzes for Module 3 (${quizzes.length}):`, JSON.stringify(quizzes, null, 2));

  // 4. Confirm total courses count
  const { count: totalCourses } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true });

  const { count: realCourses } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true })
    .eq("is_test", false);

  console.log(`Total courses in DB: ${totalCourses}, Real courses (is_test=false): ${realCourses}`);
}

verifyStep1().catch((err) => {
  console.error(err);
  process.exit(1);
});
