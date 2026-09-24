/**
 * Server-side task submission function.
 *
 * Security contract:
 * - Browser supplies ONLY: labId, sessionId, taskId, answer
 * - Server fetches expected_answer from lab_tasks using service-role key (bypasses RLS)
 * - is_correct and score are calculated server-side; never trusted from client
 * - attempt_number is calculated server-side from existing attempt count
 * - flag values are never returned to the browser
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const taskSubmitInput = z.object({
  labId: z.string().min(1),
  sessionId: z.string().uuid(),
  taskId: z.string().min(1),
  answer: z.string().min(1).max(1024),
});

export const submitLabTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => taskSubmitInput.parse(value))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 1. Verify session ownership and active status
    const { data: session } = await supabase
      .from("lab_sessions")
      .select("id, lab_id, status, user_id")
      .eq("id", data.sessionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!session) {
      return { error: "SESSION_NOT_FOUND", is_correct: false, score: 0, attempt_number: 0 };
    }
    if (session.status !== "RUNNING") {
      return { error: "SESSION_INACTIVE", is_correct: false, score: 0, attempt_number: 0 };
    }

    // 2. Fetch task using service-role to access expected_answer (not visible to authenticated users)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: task } = await supabaseAdmin
      .from("lab_tasks")
      .select("id, lab_id, title, task_type, expected_answer")
      .eq("id", data.taskId)
      .maybeSingle();

    if (!task) {
      return { error: "TASK_INVALID", is_correct: false, score: 0, attempt_number: 0 };
    }

    // 3. Verify task belongs to the session's lab
    const { data: lab } = await supabase
      .from("labs")
      .select("id")
      .eq("slug", data.labId)
      .maybeSingle();

    if (!lab || task.lab_id !== lab.id) {
      return { error: "TASK_INVALID", is_correct: false, score: 0, attempt_number: 0 };
    }

    // 4. Count existing attempts for this task in this session
    const { count: existingAttempts } = await supabase
      .from("lab_task_attempts")
      .select("id", { count: "exact", head: true })
      .eq("session_id", data.sessionId)
      .eq("task_id", data.taskId)
      .eq("user_id", userId);

    const attemptNumber = (existingAttempts ?? 0) + 1;

    // 5. Validate answer server-side (case-insensitive trim comparison)
    const isCorrect =
      task.expected_answer != null &&
      data.answer.trim().toLowerCase() === task.expected_answer.trim().toLowerCase();

    const score = isCorrect ? 10 : 0;

    // 6. Record attempt — never expose expected_answer in response
    await supabase.from("lab_task_attempts").insert({
      session_id: data.sessionId,
      task_id: data.taskId,
      user_id: userId,
      answer: data.answer, // store submitted answer for audit
      is_correct: isCorrect,
      score,
      attempt_number: attemptNumber,
    });

    // 7. Update lab_progress.tasks_completed if correct (first correct only)
    if (isCorrect && attemptNumber === 1) {
      const { data: labProgress } = await supabase
        .from("lab_progress")
        .select("tasks_completed, total_tasks")
        .eq("user_id", userId)
        .eq("lab_id", lab.id)
        .maybeSingle();

      const { count: totalTasks } = await supabase
        .from("lab_tasks")
        .select("id", { count: "exact", head: true })
        .eq("lab_id", lab.id);

      const tasksCompleted = (labProgress?.tasks_completed ?? 0) + 1;
      const total = totalTasks ?? labProgress?.total_tasks ?? 1;

      await supabase.from("lab_progress").upsert(
        {
          user_id: userId,
          lab_id: lab.id,
          tasks_completed: tasksCompleted,
          total_tasks: total,
          points: tasksCompleted * 10,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lab_id" },
      );
    }

    // Safe response: no expected_answer, no internal task data
    return {
      is_correct: isCorrect,
      score,
      attempt_number: attemptNumber,
      message: isCorrect
        ? "Correct! Task verified."
        : "Incorrect answer. Review the evidence and try again.",
    };
  });
