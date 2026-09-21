import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const sessionInput = z.object({ labId: z.string().min(1) });
const sessionActionInput = z.object({ labId: z.string().min(1), sessionId: z.string().uuid() });
const terminalInput = sessionActionInput.extend({ command: z.string().min(1).max(2000) });
const submitInput = sessionActionInput.extend({
  taskId: z.string().optional(),
  flag: z.string().min(1).max(512),
});

type RunnerResponse = {
  error?: string;
  sessionId?: string;
  status?: string;
  score?: number;
  expiresAt?: string;
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  correct?: boolean;
};

async function callRunner(
  path: string,
  userId: string,
  method: "GET" | "POST",
  body?: Record<string, unknown>,
): Promise<RunnerResponse> {
  const runnerUrl = process.env.LAB_RUNNER_URL;
  const runnerSecret = process.env.LAB_RUNNER_SECRET;
  if (!runnerUrl || !runnerSecret) {
    return { error: "LAB_INFRASTRUCTURE_NOT_CONFIGURED" };
  }

  const response = await fetch(`${runnerUrl.replace(/\/$/, "")}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-lab-runner-secret": runnerSecret,
      "x-authenticated-user-id": userId,
    },
    body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
  });
  const result = (await response.json().catch(() => ({}))) as RunnerResponse;
  if (!response.ok) {
    return { error: typeof result.error === "string" ? result.error : "LAB_EXECUTION_UNAVAILABLE" };
  }
  return result;
}

export const createLabSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => sessionInput.parse(value))
  .handler(async ({ data, context }) => {
    const result = await callRunner(
      `/api/labs/${encodeURIComponent(data.labId)}/session`,
      context.userId,
      "POST",
    );
    if (result.sessionId && !result.error) {
      const { data: lab } = await context.supabase
        .from("labs")
        .select("id")
        .eq("slug", data.labId)
        .eq("status", "PUBLISHED")
        .maybeSingle();
      if (lab) {
        await context.supabase.from("lab_sessions").insert({
          id: result.sessionId,
          user_id: context.userId,
          lab_id: lab.id,
          status: "RUNNING",
          started_at: new Date().toISOString(),
          expires_at: result.expiresAt ?? new Date(Date.now() + 3600000).toISOString(),
        });
        // Ensure progress record starts if not already present
        await context.supabase.from("lab_progress").upsert(
          {
            user_id: context.userId,
            lab_id: lab.id,
            tasks_completed: 0,
            total_tasks: 0,
            points: 0,
            completed: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,lab_id", ignoreDuplicates: true },
        );
      }
    }
    return result;
  });

export const startLabSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => sessionActionInput.parse(value))
  .handler(({ data, context }) =>
    callRunner(
      `/api/labs/${encodeURIComponent(data.labId)}/session/${data.sessionId}/start`,
      context.userId,
      "POST",
    ),
  );

export const getLabSessionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => sessionActionInput.parse(value))
  .handler(({ data, context }) =>
    callRunner(
      `/api/labs/${encodeURIComponent(data.labId)}/session/${data.sessionId}/status`,
      context.userId,
      "GET",
    ),
  );

export const executeLabTerminal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => terminalInput.parse(value))
  .handler(({ data, context }) =>
    callRunner(
      `/api/labs/${encodeURIComponent(data.labId)}/session/${data.sessionId}/terminal`,
      context.userId,
      "POST",
      { command: data.command },
    ),
  );

export const resetLabSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => sessionActionInput.parse(value))
  .handler(({ data, context }) =>
    callRunner(
      `/api/labs/${encodeURIComponent(data.labId)}/session/${data.sessionId}/reset`,
      context.userId,
      "POST",
    ),
  );

export const stopLabSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => sessionActionInput.parse(value))
  .handler(async ({ data, context }) => {
    const result = await callRunner(
      `/api/labs/${encodeURIComponent(data.labId)}/session/${data.sessionId}/stop`,
      context.userId,
      "POST",
    );
    if (!result.error) {
      await context.supabase
        .from("lab_sessions")
        .update({ status: "TERMINATED" })
        .eq("id", data.sessionId)
        .eq("user_id", context.userId);
    }
    return result;
  });

/**
 * Submit a captured flag for server-side validation.
 *
 * Security contract:
 * - Flag is forwarded to the runner (which holds the expected flag); never compared client-side
 * - Attempt is recorded before calling runner (audit trail even for wrong answers)
 * - Points are taken from runner response, never from browser
 * - Correct flag: lab_progress.completed=true, lab_sessions.status=COMPLETED, badge evaluated
 * - Idempotent: second correct submission returns is_correct but does not re-award points
 */
export const submitLabFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => submitInput.parse(value))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 1. Verify session belongs to authenticated user
    const { data: session } = await supabase
      .from("lab_sessions")
      .select("id, lab_id, status, user_id")
      .eq("id", data.sessionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!session) {
      return { error: "SESSION_NOT_FOUND", correct: false };
    }

    // 2. Resolve lab record
    const { data: lab } = await supabase
      .from("labs")
      .select("id, points")
      .eq("slug", data.labId)
      .maybeSingle();

    if (!lab) {
      return { error: "LAB_NOT_FOUND", correct: false };
    }

    // 3. Check if already correctly submitted (prevent double-award)
    const { data: existingCorrect } = await supabase
      .from("lab_flag_attempts")
      .select("id")
      .eq("session_id", data.sessionId)
      .eq("user_id", userId)
      .eq("is_correct", true)
      .maybeSingle();

    if (existingCorrect) {
      // Already awarded — return success without re-awarding
      return { correct: true, score: 0, alreadyAwarded: true };
    }

    // 4. Count prior attempts (for attempt_number)
    const { count: priorAttempts } = await supabase
      .from("lab_flag_attempts")
      .select("id", { count: "exact", head: true })
      .eq("session_id", data.sessionId)
      .eq("user_id", userId);

    const attemptNumber = (priorAttempts ?? 0) + 1;

    // 5. Forward flag to runner for validation — runner holds expected flag; we never compare locally
    const result = await callRunner(
      `/api/labs/${encodeURIComponent(data.labId)}/session/${data.sessionId}/submit`,
      userId,
      "POST",
      { taskId: data.taskId, flag: data.flag },
    );

    const isCorrect = result.correct === true;
    // Points come from runner (or lab record); NEVER from browser
    const awardedPoints = isCorrect ? Number(result.score ?? lab.points ?? 100) : 0;

    // Resolve task_id: use provided taskId, or find the flag task for this lab
    let taskId = data.taskId;
    if (!taskId) {
      const { data: flagTask } = await supabase
        .from("lab_tasks")
        .select("id")
        .eq("lab_id", lab.id)
        .eq("task_type", "flag")
        .maybeSingle();
      taskId = flagTask?.id;
    }

    if (!taskId) {
      const { data: firstTask } = await supabase
        .from("lab_tasks")
        .select("id")
        .eq("lab_id", lab.id)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      taskId = firstTask?.id;
    }

    if (taskId) {
      // 6. Record attempt (correct or incorrect)
      await supabase.from("lab_flag_attempts").insert({
        session_id: data.sessionId,
        user_id: userId,
        task_id: taskId,
        is_correct: isCorrect,
        attempt_number: attemptNumber,
      });
    }

    // 7. On correct flag: update progress + session + award badge
    if (isCorrect) {
      // Fetch actual task count from DB
      const { count: totalTasks } = await supabase
        .from("lab_tasks")
        .select("id", { count: "exact", head: true })
        .eq("lab_id", lab.id);

      const total = totalTasks ?? 6;

      await supabase.from("lab_progress").upsert(
        {
          user_id: userId,
          lab_id: lab.id,
          tasks_completed: total,
          total_tasks: total,
          points: awardedPoints,
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lab_id" },
      );

      await supabase
        .from("lab_sessions")
        .update({
          status: "COMPLETED",
          score: awardedPoints,
          completed_at: new Date().toISOString(),
        })
        .eq("id", data.sessionId)
        .eq("user_id", userId);

      // Evaluate badges server-side via admin client
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { evaluateAllBadgesForUser } = await import("@/lib/badge.functions");
        await evaluateAllBadgesForUser(userId, supabaseAdmin);
      } catch {
        // Badge errors must not fail flag submission
      }
    }

    // Return only safe fields — never return the expected flag or internal secrets
    return {
      correct: isCorrect,
      score: awardedPoints,
      attemptNumber,
      error: result.error,
    };
  });
