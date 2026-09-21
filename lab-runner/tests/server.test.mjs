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

test("runner contract is intentionally disabled without configuration", async (t) => {
  const server = createRunnerServer();
  t.after(() => server.close());
  const baseUrl = await listen(server);

  const health = await fetch(`${baseUrl}/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).execution, "disabled");

  const disabled = await fetch(`${baseUrl}/api/labs/lab/session`, {
    method: "POST",
    headers: { "x-lab-runner-secret": "test-secret" },
  });
  assert.equal(disabled.status, 401);

  const unknown = await fetch(`${baseUrl}/api/execute`, { method: "POST" });
  assert.equal(unknown.status, 404);
});

class FakeProvider {
  environments = new Map();
  nextId = 1;

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

test("session ownership, terminal execution, flag validation, and cleanup", async (t) => {
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

  const created = await fetch(`${baseUrl}/api/labs/linux/session`, {
    method: "POST",
    headers,
  });
  assert.equal(created.status, 201);
  const session = await created.json();

  const crossUser = await fetch(`${baseUrl}/api/labs/linux/session/${session.sessionId}/status`, {
    headers: { ...headers, "x-authenticated-user-id": "user-b" },
  });
  assert.equal(crossUser.status, 404);

  const terminal = await fetch(`${baseUrl}/api/labs/linux/session/${session.sessionId}/terminal`, {
    method: "POST",
    headers,
    body: JSON.stringify({ command: "pwd" }),
  });
  assert.equal(terminal.status, 200);
  assert.equal((await terminal.json()).stdout, "ran: pwd");

  const incorrect = await fetch(`${baseUrl}/api/labs/linux/session/${session.sessionId}/submit`, {
    method: "POST",
    headers,
    body: JSON.stringify({ flag: "wrong" }),
  });
  assert.deepEqual(await incorrect.json(), { correct: false });

  const correct = await fetch(`${baseUrl}/api/labs/linux/session/${session.sessionId}/submit`, {
    method: "POST",
    headers,
    body: JSON.stringify({ flag: "NISQ{linux_permissions_basics}" }),
  });
  assert.deepEqual(await correct.json(), { correct: true, score: 100 });

  const second = await fetch(`${baseUrl}/api/labs/linux/session`, {
    method: "POST",
    headers,
  });
  const secondSession = await second.json();
  const stopped = await fetch(`${baseUrl}/api/labs/linux/session/${secondSession.sessionId}/stop`, {
    method: "POST",
    headers,
  });
  assert.equal(stopped.status, 200);
  const stoppedTerminal = await fetch(
    `${baseUrl}/api/labs/linux/session/${secondSession.sessionId}/terminal`,
    { method: "POST", headers, body: JSON.stringify({ command: "pwd" }) },
  );
  assert.equal(stoppedTerminal.status, 409);
});
