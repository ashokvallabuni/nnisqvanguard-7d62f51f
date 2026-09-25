import fs from "fs";

const secret = "nisq_lab_runner_secret_2026_dev";
const tunnelUrl = "https://dish-ralph-satisfaction-abstract.trycloudflare.com";

console.log("Checking health over Cloudflare tunnel...");
const healthRes = await fetch(`${tunnelUrl}/health`, {
  headers: {
    "x-lab-runner-secret": secret
  }
});
const health = await healthRes.json();
console.log("Health status:", healthRes.status, health);

console.log("\nTesting session creation over Cloudflare tunnel...");
const createRes = await fetch(`${tunnelUrl}/api/labs/linux-security-fundamentals/session`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-lab-runner-secret": secret,
    "x-authenticated-user-id": "test-analyst-uuid-1",
  },
  body: JSON.stringify({}),
});

console.log("Create session status:", createRes.status);
const session = await createRes.json();
console.log("Session response:", {
  sessionId: session.sessionId,
  status: session.status,
});

if (session.sessionId) {
  console.log("\nExecuting terminal command inside container over tunnel (whoami)...");
  const execRes = await fetch(
    `${tunnelUrl}/api/labs/linux-security-fundamentals/session/${session.sessionId}/terminal`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-lab-runner-secret": secret,
        "x-authenticated-user-id": "test-analyst-uuid-1",
      },
      body: JSON.stringify({ command: "whoami" }),
    },
  );
  const execData = await execRes.json();
  console.log("Terminal output:", execData);

  console.log("\nStopping session over tunnel...");
  const stopRes = await fetch(
    `${tunnelUrl}/api/labs/linux-security-fundamentals/session/${session.sessionId}/stop`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-lab-runner-secret": secret,
        "x-authenticated-user-id": "test-analyst-uuid-1",
      },
      body: JSON.stringify({}),
    },
  );
  const stopData = await stopRes.json();
  console.log("Stop response:", stopData);
}
