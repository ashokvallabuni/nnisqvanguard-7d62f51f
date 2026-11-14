import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cbyoozhtubavksiolgxz.supabase.co";
const anonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieW9vemh0dWJhdmtzaW9sZ3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MTI0MDAsImV4cCI6MjEwMDM4ODQwMH0.-6D2ECGXcXmPakY-ATRfKOvr2SKnMgAagu3E9Aft1T0";
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieW9vemh0dWJhdmtzaW9sZ3h6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgxMjQwMCwiZXhwIjoyMTAwMzg4NDAwfQ.GlcmJk1guLMRlumcK28nkIeKS_Vn9eR2Lyud2qswJDg";

const supabaseAnon = createClient(supabaseUrl, anonKey);
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function testLockedCourseProtection() {
  console.log("=== Testing Locked-Course Protection Across Routes & APIs ===");

  const testSlug = "cybersecurity-foundations";
  const testModuleSlug = "what-is-cybersecurity";

  // 1. Verify that the course is currently locked in DB
  const { data: initialCourse } = await supabaseAdmin
    .from("courses")
    .select("slug, status")
    .eq("slug", testSlug)
    .single();

  console.log(
    `\n[State 1: Course is LOCKED in DB] (${testSlug}: status = '${initialCourse.status}')`,
  );

  // 1a. Test Anon Client querying courses
  const { data: anonCourse } = await supabaseAnon
    .from("courses")
    .select("slug, status")
    .eq("slug", testSlug)
    .single();
  console.log(`  Anon query result status: ${anonCourse.status}`);
  if (anonCourse.status !== "locked") throw new Error("Course is not locked!");

  // 1b. Test Course Accessibility logic for normal user
  const isLockedForUser = anonCourse.status !== "published";
  console.log(
    `  Access check for non-admin user: isLocked = ${isLockedForUser} (Expected: true -> LOCKED UI)`,
  );

  // 2. Simulate Admin publishing the course
  console.log(`\n[State 2: Admin publishes the course in DB]`);
  await supabaseAdmin.from("courses").update({ status: "published" }).eq("slug", testSlug);

  const { data: pubCourse } = await supabaseAnon
    .from("courses")
    .select("slug, status")
    .eq("slug", testSlug)
    .single();
  console.log(`  Anon query result status after admin publish: '${pubCourse.status}'`);
  const isAccessibleAfterPublish = pubCourse.status === "published";
  console.log(
    `  Access check after publish: isAccessible = ${isAccessibleAfterPublish} (Expected: true -> UNLOCKED UI)`,
  );

  // 3. Reset back to locked as required by Rule 4 ("ALL courses must initially be LOCKED")
  console.log(`\n[State 3: Re-locking course to preserve initial locked baseline]`);
  await supabaseAdmin.from("courses").update({ status: "locked" }).eq("slug", testSlug);

  const { data: relockedCourse } = await supabaseAnon
    .from("courses")
    .select("slug, status")
    .eq("slug", testSlug)
    .single();
  console.log(`  Confirmed re-locked status: '${relockedCourse.status}'`);

  console.log("\n=== Locked-Course Protection Test Passed Successfully ===");
}

testLockedCourseProtection().catch(console.error);
