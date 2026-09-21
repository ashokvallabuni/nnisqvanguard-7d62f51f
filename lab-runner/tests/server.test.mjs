import test from "node:test";
import assert from "node:assert/strict";
import { createRunnerServer } from "../dist/server.js";

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });
}

class FakeProvider {
  environments = new Map();
  nextId = 1;

  async isDockerAvailable() {
    return true;
  }

  async createEnvironment() {
    const id = `fake-${this.nextId++}`;
    this.environments.set(id, "READY");
    return { providerInstanceId: id, status: "READY" };
  }

  async startEnvironment(id) {
    this.environments.set(id, "RUNNING");
    return { providerInstanceId: id, status: "RUNNING" };
  }

  async execute(id, command) {
    assert.equal(this.environments.get(id), "RUNNING");
    return { stdout: `ran: ${command}`, stderr: "", exitCode: 0 };
  }

  async stopEnvironment(id) {
    this.environments.set(id, "STOPPED");
  }

  async destroyEnvironment(id) {
    this.environments.delete(id);
  }

  async getEnvironmentStatus() {
    return "RUNNING";
  }
}

class OfflineProvider extends FakeProvider {
  async isDockerAvailable() {
    return false;
  }
}

test("health check returns NOT_CONFIGURED when docker is offline", async (t) => {
  const server = createRunnerServer({ provider: new OfflineProvider() });
  t.after(() => server.close());
  const baseUrl = await listen(server);

  const health = await fetch(`${baseUrl}/health`);
  // When Docker engine is offline, health returns 503 NOT_CONFIGURED without faking
  assert.equal(health.status, 503);
  const json = await health.json();
  assert.equal(json.status, "NOT_CONFIGURED");

  const unauth = await fetch(`${baseUrl}/api/labs/linux-security-fundamentals/session`, {
    method: "POST",
    headers: { "x-lab-runner-secret": "invalid-secret" },
  });
  assert.equal(unauth.status, 401);

  const unknown = await fetch(`${baseUrl}/api/unknown`, { method: "POST" });
  assert.equal(unknown.status, 404);
});

test("session ownership, terminal execution, flag validation, reset and cleanup", async (t) => {
  const server = createRunnerServer({
    runnerSecret: "runner-secret",
    executionEnabled: true,
    provider: new FakeProvider(),
  });
  t.after(() => server.close());
  const baseUrl = await listen(server);
  const headers = {
    "content-type": "application/json",
    "x-lab-runner-secret": "runner-secret",
    "x-authenticated-user-id": "user-a",
  };

  // Check healthy runner
  const health = await fetch(`${baseUrl}/health`);
  assert.equal(health.status, 200);
  const healthJson = await health.json();
  assert.equal(healthJson.status, "READY");

  // Create session
  const created = await fetch(`${baseUrl}/api/labs/linux-security-fundamentals/session`, {
    method: "POST",
    headers,
  });
  assert.equal(created.status, 201);
  const session = await created.json();
  assert.ok(session.sessionId);
  assert.equal(session.status, "RUNNING");

  // Cross user isolation
  const crossUser = await fetch(`${baseUrl}/api/labs/linux-security-fundamentals/session/${session.sessionId}/status`, {
    headers: { ...headers, "x-authenticated-user-id": "user-b" },
  });
  assert.equal(crossUser.status, 404);

  // Terminal execution
  const terminal = await fetch(`${baseUrl}/api/labs/linux-security-fundamentals/session/${session.sessionId}/terminal`, {
    method: "POST",
    headers,
    body: JSON.stringify({ command: "whoami" }),
  });
  assert.equal(terminal.status, 200);
  assert.equal((await terminal.json()).stdout, "ran: whoami");

  // Incorrect flag submission
  const incorrect = await fetch(`${baseUrl}/api/labs/linux-security-fundamentals/session/${session.sessionId}/submit`, {
    method: "POST",
    headers,
    body: JSON.stringify({ flag: "wrong" }),
  });
  assert.deepEqual(await incorrect.json(), { correct: false });

  // Correct flag submission
  const correct = await fetch(`${baseUrl}/api/labs/linux-security-fundamentals/session/${session.sessionId}/submit`, {
    method: "POST",
    headers,
    body: JSON.stringify({ flag: "NISQ{linux_permissions_basics}" }),
  });
  assert.deepEqual(await correct.json(), { correct: true, score: 100 });

  // Reset session
  const reset = await fetch(`${baseUrl}/api/labs/linux-security-fundamentals/session/${session.sessionId}/reset`, {
    method: "POST",
    headers,
  });
  assert.equal(reset.status, 200);
  assert.equal((await reset.json()).status, "RUNNING");

  // Stop session
  const stopped = await fetch(`${baseUrl}/api/labs/linux-security-fundamentals/session/${session.sessionId}/stop`, {
    method: "POST",
    headers,
  });
  assert.equal(stopped.status, 200);
  assert.equal((await stopped.json()).status, "STOPPED");

  // Post-stop terminal execution should fail with 409
  const stoppedTerminal = await fetch(
    `${baseUrl}/api/labs/linux-security-fundamentals/session/${session.sessionId}/terminal`,
    { method: "POST", headers, body: JSON.stringify({ command: "whoami" }) },
  );
  assert.equal(stoppedTerminal.status, 409);
});
