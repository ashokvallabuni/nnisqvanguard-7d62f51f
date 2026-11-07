const fs = require('fs');

let code = fs.readFileSync('src/lib/certificate.functions.ts', 'utf8');

// 1. In doEvaluateAndIssueCertificateInternal:
const target1 = `  // 5. Verify required quizzes & compute average score
  const { data: quizzes } = await supabaseAdmin
    .from("quizzes")
    .select("id, module_id")
    .in("module_id", moduleIds);

  let finalScore = 100;
  if (quizzes && quizzes.length > 0) {
    const quizIds = quizzes.map((q) => q.id);
    const { data: attempts } = await supabaseAdmin
      .from("quiz_attempts")
      .select("quiz_id, is_correct, score")
      .eq("user_id", userId)
      .in("quiz_id", quizIds);

    // Check if all quizzes have at least one passing attempt
    const passedQuizIds = new Set(
      attempts?.filter((a) => a.is_correct || (a.score ?? 0) >= 70).map((a) => a.quiz_id)
    );

    if (passedQuizIds.size < quizzes.length) {
      await supabaseAdmin.from("certificate_audit_logs").insert({
        user_id: userId,
        actor_id: userId,
        event_type: "COMPLETION_REJECTED_QUIZZES_FAILED",
        details: {
          courseSlug,
          passedQuizzes: passedQuizIds.size,
          requiredQuizzes: quizzes.length,
        },
      });

      return {
        error: "ASSESSMENT_NOT_PASSED",
        certificateNumber: null,
        detail: \`Passed \${passedQuizIds.size} of \${quizzes.length} required assessments with minimum 70% score.\`,
      };
    }

    // Calculate final score
    const totalScore = attempts?.reduce((acc, a) => acc + (a.score ?? 0), 0) || 0;
    finalScore = Math.min(100, Math.round(totalScore / (attempts?.length || 1)));
  }`;

const replacement1 = `  // 5. Verify required quizzes & compute average score (exempt for test courses)
  const isTestCourse = Boolean(course.is_test || course.slug?.startsWith("zz-") || courseSlug.startsWith("zz-"));
  let finalScore = 100;
  if (!isTestCourse) {
    const { data: quizzes } = await supabaseAdmin
      .from("quizzes")
      .select("id, module_id")
      .in("module_id", moduleIds);

    if (quizzes && quizzes.length > 0) {
      const quizIds = quizzes.map((q) => q.id);
      const { data: attempts } = await supabaseAdmin
        .from("quiz_attempts")
        .select("quiz_id, is_correct, score")
        .eq("user_id", userId)
        .in("quiz_id", quizIds);

      // Check if all quizzes have at least one passing attempt
      const passedQuizIds = new Set(
        attempts?.filter((a) => a.is_correct || (a.score ?? 0) >= 70).map((a) => a.quiz_id)
      );

      if (passedQuizIds.size < quizzes.length) {
        await supabaseAdmin.from("certificate_audit_logs").insert({
          user_id: userId,
          actor_id: userId,
          event_type: "COMPLETION_REJECTED_QUIZZES_FAILED",
          details: {
            courseSlug,
            passedQuizzes: passedQuizIds.size,
            requiredQuizzes: quizzes.length,
          },
        });

        return {
          error: "ASSESSMENT_NOT_PASSED",
          certificateNumber: null,
          detail: \`Passed \${passedQuizIds.size} of \${quizzes.length} required assessments with minimum 70% score.\`,
        };
      }

      // Calculate final score
      const totalScore = attempts?.reduce((acc, a) => acc + (a.score ?? 0), 0) || 0;
      finalScore = Math.min(100, Math.round(totalScore / (attempts?.length || 1)));
    }
  }`;

// 2. In getCourseCertificateStatusInternal:
const target2 = `    // Quizzes check
    const { data: quizzes } = await supabaseAdmin
      .from("quizzes")
      .select("id, module_id")
      .in("module_id", moduleIds);

    const totalQuizzes = quizzes?.length || 0;
    let isQuizzesComplete = true;
    let passedQuizzesCount = 0;

    if (totalQuizzes > 0) {
      const quizIds = quizzes.map((q) => q.id);
      const { data: attempts } = await supabaseAdmin
        .from("quiz_attempts")
        .select("quiz_id, is_correct, score")
        .eq("user_id", userId)
        .in("quiz_id", quizIds);

      const passedQuizIds = new Set(
        attempts?.filter((a) => a.is_correct || (a.score ?? 0) >= 70).map((a) => a.quiz_id)
      );
      passedQuizzesCount = passedQuizIds.size;
      isQuizzesComplete = passedQuizzesCount >= totalQuizzes;
    }`;

const replacement2 = `    // Quizzes check (exempt for test courses)
    const isTestCourse = Boolean(course.is_test || course.slug?.startsWith("zz-") || courseSlug.startsWith("zz-"));
    let totalQuizzes = 0;
    let isQuizzesComplete = true;
    let passedQuizzesCount = 0;

    if (!isTestCourse) {
      const { data: quizzes } = await supabaseAdmin
        .from("quizzes")
        .select("id, module_id")
        .in("module_id", moduleIds);

      totalQuizzes = quizzes?.length || 0;

      if (totalQuizzes > 0) {
        const quizIds = quizzes.map((q) => q.id);
        const { data: attempts } = await supabaseAdmin
          .from("quiz_attempts")
          .select("quiz_id, is_correct, score")
          .eq("user_id", userId)
          .in("quiz_id", quizIds);

        const passedQuizIds = new Set(
          attempts?.filter((a) => a.is_correct || (a.score ?? 0) >= 70).map((a) => a.quiz_id)
        );
        passedQuizzesCount = passedQuizIds.size;
        isQuizzesComplete = passedQuizzesCount >= totalQuizzes;
      }
    }`;

const isCRLF = code.includes('\r\n');
const t1 = isCRLF ? target1.replace(/\n/g, '\r\n') : target1;
const r1 = isCRLF ? replacement1.replace(/\n/g, '\r\n') : replacement1;
const t2 = isCRLF ? target2.replace(/\n/g, '\r\n') : target2;
const r2 = isCRLF ? replacement2.replace(/\n/g, '\r\n') : replacement2;

if (!code.includes(t1)) {
  console.error("Target 1 not found in certificate.functions.ts");
  process.exit(1);
}
code = code.replace(t1, r1);

if (!code.includes(t2)) {
  console.error("Target 2 not found in certificate.functions.ts");
  process.exit(1);
}
code = code.replace(t2, r2);

fs.writeFileSync('src/lib/certificate.functions.ts', code, 'utf8');
console.log('src/lib/certificate.functions.ts successfully patched!');

