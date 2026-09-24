import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cbyoozhtubavksiolgxz.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieW9vemh0dWJhdmtzaW9sZ3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MTI0MDAsImV4cCI6MjEwMDM4ODQwMH0.-6D2ECGXcXmPakY-ATRfKOvr2SKnMgAagu3E9Aft1T0";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieW9vemh0dWJhdmtzaW9sZ3h6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgxMjQwMCwiZXhwIjoyMTAwMzg4NDAwfQ.GlcmJk1guLMRlumcK28nkIeKS_Vn9eR2Lyud2qswJDg";

const supabase = createClient(supabaseUrl, anonKey);
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log("Checking Supabase connection & tables with Admin Client...");

  const tables = [
    "courses",
    "modules",
    "lessons",
    "quizzes",
    "profiles",
    "user_roles",
    "complaints",
    "appointments",
    "colleges",
    "campus_programs",
    "user_progress",
    "module_progress",
    "user_course_progress"
  ];

  for (const table of tables) {
    try {
      const { data, count, error } = await supabaseAdmin
        .from(table)
        .select("*", { count: "exact", head: false })
        .limit(10);

      if (error) {
        console.log(`Table '${table}': ERROR -> ${error.message} (${error.code})`);
      } else {
        console.log(`Table '${table}': OK -> total count: ${count}, sample items: ${data?.length}`);
        if (data && data.length > 0) {
          if (table === "courses") {
            console.log(`  Courses (${data.length}):`, data.map(c => ({ id: c.id, slug: c.slug, title: c.title, status: c.status })));
          } else if (table === "modules") {
            console.log(`  Modules (${data.length}):`, data.map(m => ({ id: m.id, course_id: m.course_id, slug: m.slug, title: m.title })));
          } else if (table === "quizzes") {
            console.log(`  Quizzes (${data.length}):`, data.map(q => ({ id: q.id, module_id: q.module_id, question: q.question, correct_option: q.correct_option })));
          } else if (table === "colleges") {
            console.log(`  Colleges (${data.length}):`, data.map(c => ({ id: c.id, name: c.name, code: c.code })));
          }
        }
      }
    } catch (e) {
      console.log(`Table '${table}': EXCEPTION -> ${e.message}`);
    }
  }

  // Check storage buckets
  try {
    const { data: buckets, error: bErr } = await supabaseAdmin.storage.listBuckets();
    if (bErr) {
      console.log("Storage buckets ERROR:", bErr.message);
    } else {
      console.log("Storage buckets:", buckets.map(b => ({ id: b.id, name: b.name, public: b.public })));
    }
  } catch (e) {
    console.log("Storage buckets EXCEPTION:", e.message);
  }
}

main().catch(console.error);
