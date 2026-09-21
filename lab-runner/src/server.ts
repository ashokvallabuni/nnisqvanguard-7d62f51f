import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { DockerProvider } from "./providers/docker-provider.js";
import type { LabEnvironmentProvider } from "./providers/types.js";

type Json = Record<string, unknown>;
type SessionStatus = "CREATED" | "RUNNING" | "STOPPED" | "EXPIRED" | "COMPLETED" | "FAILED";
type Session = {
  id: string;
  userId: string;
  labId: string;
  status: SessionStatus;
  expiresAt: number;
  environmentId: string;
  score: number;
  completed: boolean;
};

const sessionLifetimeMs = 60 * 60 * 1000;
const maxBodyBytes = 8 * 1024;
const maxFlagAttempts = 10;

function json(response: ServerResponse, status: number, body: Json) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(body));
}

function userId(request: IncomingMessage) {
  const value = request.headers["x-authenticated-user-id"];
  return typeof value === "string" && value.length <= 128 ? value : null;
}

function readBody(request: IncomingMessage): Promise<Json> {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk: Buffer) => {
      body += chunk.toString("utf8");
      if (Buffer.byteLength(body) > maxBodyBytes) reject(new Error("BODY_TOO_LARGE"));
    });
    request.on("end", () => {
      if (!body) return resolve({});
      try {
        const value = JSON.parse(body);
        resolve(value && typeof value === "object" ? value : {});
      } catch {
        reject(new Error("INVALID_JSON"));
      }
    });
    request.on("error", reject);
  });
}

function isAuthorized(request: IncomingMessage, runnerSecret?: string): boolean {
  if (!runnerSecret) return false;
  const supplied = request.headers["x-lab-runner-secret"];
  if (typeof supplied !== "string") return false;
  const expected = Buffer.from(runnerSecret);
  const actual = Buffer.from(supplied);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function requiresConfiguredRunner(
  response: ServerResponse,
  runnerSecret: string | undefined,
  executionEnabled: boolean,
) {
  if (!runnerSecret || !executionEnabled) {
    json(response, 503, {
      error: "LAB_INFRASTRUCTURE_NOT_CONFIGURED",
      message: "Lab infrastructure is not configured.",
    });
    return true;
  }
  return false;
}

function isKnownRoute(pathname: string, method: string): boolean {
  return (
    (method === "GET" && pathname === "/health") ||
    (method === "POST" && /^\/api\/labs\/[^/]+\/session$/.test(pathname)) ||
    (method === "GET" && /^\/api\/labs\/[^/]+\/session\/[^/]+\/status$/.test(pathname)) ||
    (method === "POST" &&
      /^\/api\/labs\/[^/]+\/session\/[^/]+\/(start|terminal|reset|stop|submit)$/.test(pathname))
  );
}

export function createRunnerServer(
  options: {
    runnerSecret?: string;
    executionEnabled?: boolean;
    provider?: LabEnvironmentProvider;
    flagDigest?: string;
  } = {},
) {
  const runnerSecret = options.runnerSecret ?? process.env.LAB_RUNNER_SECRET;
  const executionEnabled =
    options.executionEnabled ??
    (process.env.LAB_RUNNER_ENABLED === "true" && process.env.LAB_DOCKER_ENABLED === "true");
  const provider = options.provider ?? new DockerProvider();
  const flagDigest =
    options.flagDigest ??
    process.env.LAB_FLAG_DIGEST ??
    createHash("sha256").update("NISQ{linux_permissions_basics}").digest("hex");
  const sessions = new Map<string, Session>();
  const attempts = new Map<string, number>();

  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    if (!isKnownRoute(url.pathname, request.method ?? "GET")) {
      json(response, 404, { error: "NOT_FOUND" });
      return;
    }

    if (url.pathname === "/health") {
      json(response, 200, {
        status: executionEnabled ? "CONFIGURED" : "NOT_CONFIGURED",
        execution: executionEnabled ? "enabled" : "disabled",
        network: "none",
      });
      return;
    }

    if (!isAuthorized(request, runnerSecret)) {
      json(response, 401, { error: "UNAUTHORIZED" });
      return;
    }

    if (requiresConfiguredRunner(response, runnerSecret, executionEnabled)) return;

    const currentUserId = userId(request);
    if (!currentUserId) {
      json(response, 401, { error: "UNAUTHORIZED" });
      return;
    }

    void handleRequest(
      request,
      response,
      url,
      currentUserId,
      provider,
      sessions,
      attempts,
      flagDigest,
    );
  });
  const expiryTimer = setInterval(() => {
    for (const session of sessions.values()) {
      if (session.status === "RUNNING" && Date.now() >= session.expiresAt) {
        void provider
          .destroyEnvironment(session.environmentId)
          .then(() => {
            session.status = "EXPIRED";
          })
          .catch(() => {
            session.status = "FAILED";
          });
      }
    }
  }, 30_000);
  expiryTimer.unref();
  server.on("close", () => clearInterval(expiryTimer));
  return server;
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL,
  currentUserId: string,
  provider: LabEnvironmentProvider,
  sessions: Map<string, Session>,
  attempts: Map<string, number>,
  flagDigest: string,
) {
  const parts = url.pathname.split("/").filter(Boolean);
  const labId = parts[2];
  const sessionId = parts[4];

  try {
    if (request.method === "POST" && parts.length === 4 && parts[3] === "session") {
      const environment = await provider.createEnvironment({
        cpus: 1,
        memoryMb: 512,
        pidsLimit: 64,
        timeoutMs: 15_000,
      });
      const session: Session = {
        id: randomUUID(),
        userId: currentUserId,
        labId,
        status: "CREATED",
        expiresAt: Date.now() + sessionLifetimeMs,
        environmentId: environment.providerInstanceId,
        score: 0,
        completed: false,
      };
      sessions.set(session.id, session);
      await provider.startEnvironment(session.environmentId);
      session.status = "RUNNING";
      json(response, 201, {
        sessionId: session.id,
        status: session.status,
        expiresAt: new Date(session.expiresAt).toISOString(),
      });
      return;
    }

    const session = sessions.get(sessionId);
    if (!session || session.userId !== currentUserId || session.labId !== labId) {
      json(response, 404, { error: "SESSION_NOT_FOUND" });
      return;
    }
    if (Date.now() >= session.expiresAt && session.status === "RUNNING") {
      await provider.destroyEnvironment(session.environmentId);
      session.status = "EXPIRED";
    }
    if (request.method === "GET" && parts[5] === "status") {
      json(response, 200, {
        sessionId: session.id,
        status: session.status,
        score: session.score,
        expiresAt: new Date(session.expiresAt).toISOString(),
      });
      return;
    }
    if (session.status !== "RUNNING") {
      json(response, 409, { error: "SESSION_INACTIVE" });
      return;
    }
    const body = await readBody(request);
    if (request.method === "POST" && parts[5] === "terminal") {
      const command = typeof body.command === "string" ? body.command : "";
      const result = await provider.execute(session.environmentId, command, 5_000, 64 * 1024);
      json(response, 200, result);
      return;
    }
    if (request.method === "POST" && parts[5] === "start") {
      await provider.startEnvironment(session.environmentId);
      session.status = "RUNNING";
      json(response, 200, { status: session.status });
      return;
    }
    if (request.method === "POST" && parts[5] === "stop") {
      await provider.stopEnvironment(session.environmentId);
      await provider.destroyEnvironment(session.environmentId);
      session.status = "STOPPED";
      json(response, 200, { status: session.status });
      return;
    }
    if (request.method === "POST" && parts[5] === "reset") {
      await provider.destroyEnvironment(session.environmentId);
      const environment = await provider.createEnvironment({
        cpus: 1,
        memoryMb: 512,
        pidsLimit: 64,
        timeoutMs: 15_000,
      });
      await provider.startEnvironment(environment.providerInstanceId);
      session.environmentId = environment.providerInstanceId;
      session.expiresAt = Date.now() + sessionLifetimeMs;
      session.status = "RUNNING";
      session.score = 0;
      session.completed = false;
      json(response, 200, { status: session.status });
      return;
    }
    if (request.method === "POST" && parts[5] === "submit") {
      const flag = typeof body.flag === "string" ? body.flag : "";
      const attemptKey = `${session.id}:${body.taskId ?? "flag"}`;
      const attemptCount = attempts.get(attemptKey) ?? 0;
      if (attemptCount >= maxFlagAttempts) {
        json(response, 429, { error: "ATTEMPT_LIMIT_REACHED" });
        return;
      }
      attempts.set(attemptKey, attemptCount + 1);
      const correct = createHash("sha256").update(flag).digest("hex") === flagDigest;
      if (correct) {
        session.score = 100;
        session.completed = true;
        session.status = "COMPLETED";
      }
      json(response, 200, correct ? { correct: true, score: session.score } : { correct: false });
      return;
    }
    json(response, 404, { error: "NOT_FOUND" });
  } catch (error) {
    const code = error instanceof Error ? error.message : "PROVIDER_ERROR";
    json(response, code === "INVALID_COMMAND" ? 400 : 503, {
      error: code === "INVALID_COMMAND" ? "INVALID_COMMAND" : "LAB_EXECUTION_UNAVAILABLE",
    });
  }
}

if (process.argv[1]?.endsWith("server.js")) {
  const port = Number(process.env.PORT ?? 8787);
  const server = createRunnerServer();
  server.listen(port, "127.0.0.1", () => {
    console.log(`NISQ lab runner listening on 127.0.0.1:${port}`);
  });
}
