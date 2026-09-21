/**
 * Server-side quiz scoring function.
 *
 * Security contract:
 * - Browser submits ONLY: quizId, selectedOption (number)
 * - Server fetches correct_option from quizzes table server-side
 * - is_correct and score are calculated server-side; never trusted from client
 * - correct_option is never returned to the browser
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const quizSubmitInput = z.object({
  quizId: z.string().min(1),
  moduleId: z.string().min(1),
  courseId: z.string().min(1),
  selectedOption: z.number().int().min(0),
});

export const submitQuizAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => quizSubmitInput.parse(value))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 1. Fetch quiz with correct_option from server (not trusted from client)
    const { data: quiz } = await supabase
      .from("quizzes")
      .select("id, module_id, question, correct_option, explanation")
      .eq("id", data.quizId)
      .maybeSingle();

    if (!quiz) {
      return { error: "QUIZ_NOT_FOUND", is_correct: false, score: 0, attempt_number: 0 };
    }

    // 2. Verify module ownership (quiz belongs to declared module)
    if (quiz.module_id !== data.moduleId) {
      return { error: "QUIZ_INVALID", is_correct: false, score: 0, attempt_number: 0 };
    }

    // 3. Count existing attempts for this quiz by this user
    const { count: existingAttempts } = await supabase
      .from("quiz_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("quiz_id", data.quizId);

    const attemptNumber = (existingAttempts ?? 0) + 1;

    // 4. Server-side correctness evaluation — correct_option never sent to browser
    const isCorrect = data.selectedOption === quiz.correct_option;
    const score = isCorrect ? 100 : 0;

    // 5. Persist quiz attempt
    await supabase.from("quiz_attempts").insert({
      user_id: userId,
      quiz_id: data.quizId,
      selected_option: data.selectedOption,
      is_correct: isCorrect,
      score,
      attempt_number: attemptNumber,
    });

    // 6. Update module progress record for this quiz
    await supabase.from("user_course_progress").upsert(
      {
        user_id: userId,
        course_id: data.courseId,
        module_id: data.moduleId,
        quiz_id: data.quizId,
        progress_type: "quiz",
        completed: isCorrect,
        score,
        response: String(data.selectedOption),
        completed_at: isCorrect ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,module_id,quiz_id,assignment_id,progress_type" },
    );

    // Safe response: explanation is returned (it's educational content, not a secret)
    // correct_option is NOT returned
    return {
      is_correct: isCorrect,
      score,
      attempt_number: attemptNumber,
      explanation: isCorrect ? (quiz.explanation ?? "Correct!") : "Incorrect. Review the lesson and try again.",
    };
  });
