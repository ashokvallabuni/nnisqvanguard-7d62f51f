import fs from "fs";

const envText = fs.readFileSync("./lab-runner/.env", "utf8");
const match = envText.match(/^LAB_RUNNER_SECRET=(.+)$/m);
const secret = match ? match[1].trim() : "";

const tunnelUrl = "https://stickers-measurement-muscle-albert.trycloudflare.com";

console.log("Checking health over Cloudflare tunnel...");
const healthRes = await fetch(`${tunnelUrl}/health`);
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
  environmentId: session.environmentId,
});

if (session.sessionId) {
  console.log("\nExecuting terminal command inside container over tunnel (whoami)...");
  const execRes = await fetch(`${tunnelUrl}/api/labs/linux-security-fundamentals/session/${session.sessionId}/terminal`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-lab-runner-secret": secret,
      "x-authenticated-user-id": "test-analyst-uuid-1",
    },
    body: JSON.stringify({ command: "whoami" }),
  });
  const execData = await execRes.json();
  console.log("Terminal output:", execData);

  console.log("\nExecuting terminal command (pwd & ls)...");
  const execRes2 = await fetch(`${tunnelUrl}/api/labs/linux-security-fundamentals/session/${session.sessionId}/terminal`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-lab-runner-secret": secret,
      "x-authenticated-user-id": "test-analyst-uuid-1",
    },
    body: JSON.stringify({ command: "pwd && ls -la" }),
  });
  const execData2 = await execRes2.json();
  console.log("Terminal output 2:", execData2);

  console.log("\nStopping session over tunnel...");
  const stopRes = await fetch(`${tunnelUrl}/api/labs/linux-security-fundamentals/session/${session.sessionId}/stop`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-lab-runner-secret": secret,
      "x-authenticated-user-id": "test-analyst-uuid-1",
    },
    body: JSON.stringify({}),
  });
  const stopData = await stopRes.json();
  console.log("Stop response:", stopData);
}
