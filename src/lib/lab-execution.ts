import {
  checkLabRunnerHealth,
  createLabSession,
  executeLabTerminal,
  getLabSessionStatus,
  resetLabSession,
  stopLabSession,
  submitLabFlag,
  type LabRunnerHealthResult,
} from "@/lib/lab-runner.functions";

export type LabExecutionState =
  | "configuration_required"
  | "connecting"
  | "running"
  | "stopped"
  | "completed"
  | "error";

export type LabSession = {
  id: string | null;
  state: LabExecutionState;
  message: string;
  error?: string;
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  score?: number;
};

export interface LabExecutionService {
  checkHealth(): Promise<LabRunnerHealthResult>;
  createSession(labSlug: string): Promise<LabSession>;
  getSession(labSlug: string, sessionId: string): Promise<LabSession>;
  executeTerminal(labSlug: string, sessionId: string, command: string): Promise<LabSession>;
  submitFlag(labSlug: string, sessionId: string, flag: string): Promise<LabSession>;
  resetLab(labSlug: string, sessionId: string): Promise<LabSession>;
  terminateSession(labSlug: string, sessionId: string): Promise<LabSession>;
}

export const labExecutionService: LabExecutionService = {
  async checkHealth() {
    return checkLabRunnerHealth();
  },
  async createSession(labId) {
    return normalize(await createLabSession({ data: { labId } }));
  },
  async getSession(labSlug, sessionId) {
    return normalize(await getLabSessionStatus({ data: { labId: labSlug, sessionId } }), sessionId);
  },
  async executeTerminal(labSlug, sessionId, command) {
    return normalize(
      await executeLabTerminal({ data: { labId: labSlug, sessionId, command } }),
      sessionId,
    );
  },
  async submitFlag(labSlug, sessionId, flag) {
    return normalize(await submitLabFlag({ data: { labId: labSlug, sessionId, flag } }), sessionId);
  },
  async resetLab(labSlug, sessionId) {
    return normalize(await resetLabSession({ data: { labId: labSlug, sessionId } }), sessionId);
  },
  async terminateSession(labSlug, sessionId) {
    return normalize(await stopLabSession({ data: { labId: labSlug, sessionId } }), sessionId);
  },
};

function normalize(result: unknown, id: string | null = null): LabSession {
  const value = result && typeof result === "object" ? (result as Record<string, unknown>) : {};
  if (
    value.error === "LAB_INFRASTRUCTURE_NOT_CONFIGURED" ||
    value.error === "RUNNER_URL_MISSING" ||
    value.error === "RUNNER_SECRET_MISSING"
  ) {
    return {
      id,
      state: "configuration_required",
      message: String(value.error),
      error: String(value.error),
    };
  }
  if (value.status === "COMPLETED") {
    return {
      id: String(value.sessionId ?? ""),
      state: "completed",
      message: "Lab completed.",
      score: Number(value.score ?? 0),
    };
  }
  return {
    id: typeof value.sessionId === "string" ? value.sessionId : id,
    state: value.status === "RUNNING" ? "running" : "error",
    message: typeof value.error === "string" ? value.error : "Lab session updated.",
    error: typeof value.error === "string" ? value.error : undefined,
    score: typeof value.score === "number" ? value.score : undefined,
    stdout: typeof value.stdout === "string" ? value.stdout : undefined,
    stderr: typeof value.stderr === "string" ? value.stderr : undefined,
    exitCode: typeof value.exitCode === "number" ? value.exitCode : undefined,
  };
}
