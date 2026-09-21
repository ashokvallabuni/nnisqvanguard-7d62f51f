import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const sessionInput = z.object({ labId: z.string().min(1) });
const sessionActionInput = z.object({ labId: z.string().min(1), sessionId: z.string().uuid() });
const terminalInput = sessionActionInput.extend({ command: z.string().min(1).max(2000) });
const submitInput = sessionActionInput.extend({
  taskId: z.string().uuid().optional(),
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

export const submitLabFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => submitInput.parse(value))
  .handler(async ({ data, context }) => {
    const result = await callRunner(
      `/api/labs/${encodeURIComponent(data.labId)}/session/${data.sessionId}/submit`,
      context.userId,
      "POST",
      { taskId: data.taskId, flag: data.flag },
    );
    if (result.correct === true) {
      const { data: lab } = await context.supabase
        .from("labs")
        .select("id")
        .eq("slug", data.labId)
        .maybeSingle();
      if (lab) {
        await context.supabase.from("lab_progress").upsert(
          {
            user_id: context.userId,
            lab_id: lab.id,
            tasks_completed: 6,
            total_tasks: 6,
            points: Number(result.score ?? 100),
            completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,lab_id" },
        );
        await context.supabase
          .from("lab_sessions")
          .update({
            status: "COMPLETED",
            score: Number(result.score ?? 100),
            completed_at: new Date().toISOString(),
          })
          .eq("id", data.sessionId)
          .eq("user_id", context.userId);
      }
    }
    return result;
  });
