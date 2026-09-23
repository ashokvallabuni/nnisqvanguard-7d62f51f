/**
 * Server-side quiz scoring function.
 *
 * Security contract:
 * - Browser submits ONLY: quizId, selectedOption (number)
 * - Server fetches correct_option from quizzes table server-side
 * - is_correct and score are calculated server-side; never trusted from client
 * - correct_option is never returned to the browser
 *
 * Session / token errors return a structured { error: "SESSION_EXPIRED" }
 * response instead of raw 500 / unhandled exceptions so the frontend can
 * gracefully prompt the user to sign in again.
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

    // ── 1. Fetch quiz with correct_option server-side (never trust the client)
    let correctOption: number | null = null;
    let quizExplanation: string | null = null;

    try {
      const { data: dbQuiz } = await supabase
        .from("quizzes")
        .select("id, module_id, question, correct_option, explanation")
        .eq("id", data.quizId)
        .maybeSingle();

      if (dbQuiz) {
        if (dbQuiz.module_id !== data.moduleId) {
          return { error: "QUIZ_INVALID", is_correct: false, score: 0, attempt_number: 0, explanation: "This quiz does not belong to the specified module." };
        }
        correctOption = dbQuiz.correct_option;
        quizExplanation = dbQuiz.explanation;
      }
    } catch (dbErr: any) {
      // Detect auth / token expiry errors from Supabase
      const msg: string = dbErr?.message ?? "";
      if (
        msg.includes("JWT expired") ||
        msg.includes("invalid JWT") ||
        msg.includes("token is expired") ||
        msg.includes("Unauthorized")
      ) {
        return {
          error: "SESSION_EXPIRED",
          is_correct: false,
          score: 0,
          attempt_number: 0,
          explanation: "Your session has expired. Please sign in again to continue.",
        };
      }
    }

    // ── 2. Canonical curriculum fallback if quiz not found in DB
    if (correctOption === null) {
      try {
        const { AVAILABLE_COURSES } = await import("@/data/courses-curriculum");
        outer: for (const course of AVAILABLE_COURSES) {
          for (const mod of course.modules) {
            const foundQuiz = mod.quizzes.find(
              (q) => q.id === data.quizId || data.quizId.startsWith(mod.slug)
            );
            if (foundQuiz) {
              correctOption = foundQuiz.correct_option;
              quizExplanation = foundQuiz.explanation;
              break outer;
            }
          }
        }
      } catch {
        // Curriculum import failed — graceful degradation
      }
    }

    if (correctOption === null) {
      return {
        error: "QUIZ_NOT_FOUND",
        is_correct: false,
        score: 0,
        attempt_number: 0,
        explanation: "Quiz not found. Please refresh and try again.",
      };
    }

    // ── 3. Count existing attempts
    let attemptNumber = 1;
    try {
      const { count: existingAttempts } = await supabase
        .from("quiz_attempts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("quiz_id", data.quizId);
      attemptNumber = (existingAttempts ?? 0) + 1;
    } catch {
      // Non-fatal — proceed with attempt_number: 1
    }

    // ── 4. Server-side correctness evaluation
    const isCorrect = data.selectedOption === correctOption;
    const score = isCorrect ? 100 : 0;

    // ── 5. Persist quiz attempt (non-fatal if DB unavailable)
    try {
      await supabase.from("quiz_attempts").insert({
        user_id: userId,
        quiz_id: data.quizId,
        selected_option: data.selectedOption,
        is_correct: isCorrect,
        score,
        attempt_number: attemptNumber,
      });

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
    } catch (dbErr: any) {
      const msg: string = dbErr?.message ?? "";
      if (
        msg.includes("JWT expired") ||
        msg.includes("token is expired") ||
        msg.includes("Unauthorized")
      ) {
        // Session expired mid-submission: return result but flag the session issue
        return {
          is_correct: isCorrect,
          score,
          attempt_number: attemptNumber,
          explanation: isCorrect
            ? (quizExplanation ?? "Correct! However, your session has expired. Please sign in again to save your progress.")
            : (quizExplanation ? `Incorrect. ${quizExplanation}` : "Incorrect. Review the lesson and try again."),
          warning: "SESSION_EXPIRED",
        };
      }
      console.warn("[submitQuizAnswer] Warning saving progress to DB:", dbErr);
    }

    // ── 6. Return result — correct_option is never included in response
    return {
      is_correct: isCorrect,
      score,
      attempt_number: attemptNumber,
      explanation: isCorrect
        ? (quizExplanation ?? "Correct! Excellent work.")
        : (quizExplanation ? `Incorrect. ${quizExplanation}` : "Incorrect. Review the lesson and try again."),
    };
  });
