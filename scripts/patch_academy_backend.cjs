const fs = require('fs');

let code = fs.readFileSync('src/lib/academy.functions.ts', 'utf8');

// 1. Select is_test in course resolution
code = code.replace(
  /\.select\("id, title, slug"\)/,
  `.select("id, title, slug, is_test")`
);

// 2. Add quiz check before persisting module completion
const quizCheckCode = `
  // ── 2b. Check module quiz requirements (exempt for test courses) ─────────
  const isTestCourse = Boolean(dbCourse?.is_test || data.courseSlug.startsWith("zz-"));

  if (!isTestCourse) {
    const { data: dbQuizzes } = await supabase
      .from("quizzes")
      .select("id")
      .eq("module_id", moduleId);

    if (dbQuizzes && dbQuizzes.length > 0) {
      const quizIds = dbQuizzes.map((q) => q.id);
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("quiz_id, is_correct, score")
        .eq("user_id", userId)
        .in("quiz_id", quizIds);

      const passedQuizIds = new Set(
        attempts?.filter((a) => a.is_correct || (a.score ?? 0) >= 70).map((a) => a.quiz_id)
      );

      if (passedQuizIds.size < dbQuizzes.length) {
        return {
          error: "QUIZ_REQUIRED",
          completed: false,
          message: \`You must pass all required module knowledge checks (scoring at least 70%) before completing this module (\${passedQuizIds.size} of \${dbQuizzes.length} passed).\`,
        };
      }
    }
  }

  // ── 3. Persist module completion ────────────────────────────────────────`;

code = code.replace(
  /\s*\/\/\s*──\s*3\.\s*Persist module completion[\s─]*/,
  quizCheckCode.replace(/\n/g, code.includes('\r\n') ? '\r\n' : '\n')
);

// 3. Upsert into user_course_progress alongside module_progress
const moduleProgressUpsertRegex = /(\.from\("module_progress"\)\.upsert\([\s\S]*?\{ onConflict: "user_id,module_id" \},?\r?\n\s*\);)/;

const userCourseProgressUpsert = `

    await supabase.from("user_course_progress").upsert(
      {
        user_id: userId,
        course_id: courseId,
        module_id: moduleId,
        progress_type: "module",
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,module_id,quiz_id,assignment_id,progress_type" },
    );`.replace(/\n/g, code.includes('\r\n') ? '\r\n' : '\n');

if (moduleProgressUpsertRegex.test(code)) {
  code = code.replace(moduleProgressUpsertRegex, `$1${userCourseProgressUpsert}`);
} else {
  console.error("module_progress upsert not found!");
  process.exit(1);
}

fs.writeFileSync('src/lib/academy.functions.ts', code, 'utf8');
console.log('src/lib/academy.functions.ts successfully patched!');
