import { createClient } from "@supabase/supabase-js";
import { AVAILABLE_COURSES } from "../src/data/courses-curriculum.ts";

const supabaseUrl = "https://cbyoozhtubavksiolgxz.supabase.co";
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieW9vemh0dWJhdmtzaW9sZ3h6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgxMjQwMCwiZXhwIjoyMTAwMzg4NDAwfQ.GlcmJk1guLMRlumcK28nkIeKS_Vn9eR2Lyud2qswJDg";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  console.log(`Starting full curriculum migration for ${AVAILABLE_COURSES.length} courses...`);

  for (const course of AVAILABLE_COURSES) {
    console.log(`\n--- Course: ${course.title} (${course.slug}) ---`);

    // 1. Upsert course (initially locked as required)
    const { data: dbCourse, error: cErr } = await supabase
      .from("courses")
      .upsert(
        {
          slug: course.slug,
          title: course.title,
          description: course.description || course.summary || "",
          level: (course.level || "Beginner").toLowerCase(),
          tier: (course.tier || "free").toLowerCase(),
          status: "locked", // All courses initially locked per requirement 4
        },
        { onConflict: "slug" },
      )
      .select("id, slug, title")
      .single();

    if (cErr) {
      console.error(`Error upserting course ${course.slug}:`, cErr.message);
      continue;
    }

    const courseId = dbCourse.id;
    console.log(`Course DB ID: ${courseId}`);

    // 2. Upsert modules
    for (let i = 0; i < course.modules.length; i++) {
      const mod = course.modules[i];
      const { data: dbMod, error: mErr } = await supabase
        .from("modules")
        .upsert(
          {
            course_id: courseId,
            slug: mod.slug,
            title: mod.title,
            sort_order: mod.order_index || i + 1,
            notes_md: mod.notes_md || mod.summary || "",
            quiz: mod.quizzes || [],
          },
          { onConflict: "course_id,slug" },
        )
        .select("id, slug, title")
        .single();

      if (mErr) {
        console.error(`Error upserting module ${mod.slug}:`, mErr.message);
        continue;
      }

      const moduleId = dbMod.id;

      // 3. Upsert lessons (Theory & Practice)
      const lessonsToUpsert = [
        {
          module_id: moduleId,
          slug: "theory",
          title: "Theory & In-Depth Notes",
          content_md: mod.notes_md || mod.summary || "Theory notes for " + mod.title,
          duration_minutes: Math.ceil((mod.duration_minutes || 15) * 0.6),
          sort_order: 1,
        },
        {
          module_id: moduleId,
          slug: "practice",
          title: "Hands-on Drills & Quiz Validation",
          content_md: `### Practice & Knowledge Check\n\n1. Review the core concepts for **${mod.title}**.\n2. Complete the module assessment below to verify your knowledge.\n3. Score 100% to earn module completion and unlock progression badges.`,
          duration_minutes: Math.ceil((mod.duration_minutes || 15) * 0.4),
          sort_order: 2,
        },
      ];

      for (const les of lessonsToUpsert) {
        const { error: lErr } = await supabase
          .from("lessons")
          .upsert(les, { onConflict: "module_id,slug" });

        if (lErr) {
          console.error(
            `  Error upserting lesson ${les.slug} for module ${mod.slug}:`,
            lErr.message,
          );
        }
      }

      // 4. Upsert quizzes & questions & answers
      if (mod.quizzes && mod.quizzes.length > 0) {
        for (let qIdx = 0; qIdx < mod.quizzes.length; qIdx++) {
          const q = mod.quizzes[qIdx];

          // Check if quiz already exists for module
          const { data: existingQuiz } = await supabase
            .from("quizzes")
            .select("id")
            .eq("module_id", moduleId)
            .maybeSingle();

          const quizPayload = {
            module_id: moduleId,
            question: q.question,
            options: q.options,
            correct_option: q.correct_option,
            explanation: q.explanation || "Correct answer verified by NISQ Vanguard.",
          };

          if (existingQuiz) {
            const { error: qUpErr } = await supabase
              .from("quizzes")
              .update(quizPayload)
              .eq("id", existingQuiz.id);
            if (qUpErr) console.error(`  Error updating quiz for ${mod.slug}:`, qUpErr.message);
          } else {
            const { error: qInErr } = await supabase.from("quizzes").insert(quizPayload);
            if (qInErr) console.error(`  Error inserting quiz for ${mod.slug}:`, qInErr.message);
          }
        }
      }
    }
  }

  console.log("\nCurriculum seeding completed successfully!");
}

seed().catch(console.error);
