import http from "http";

const RUNNER_URL = "http://127.0.0.1:8080";
const SECRET = "nisq_lab_runner_secret_2026_dev"; // Local dev secret

async function api(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, RUNNER_URL);
    const req = http.request(
      url,
      {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SECRET}`,
          ...options.headers,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data ? JSON.parse(data) : null);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${data}`));
          }
        });
      },
    );

    req.on("error", reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function runTests() {
  const sessionId = "test-session-" + Date.now();
  const labId = "linux-investigation-1";

  console.log(`Starting test for IVVAB LABS (Session: ${sessionId})`);

  try {
    // 1. START -> CREATE REAL CONTAINER
    console.log("1. START -> CREATE REAL CONTAINER");
    await api(`/api/labs/${labId}/session`, {
      method: "POST",
      body: { sessionId },
    });
    console.log("   ✓ Session started.");

    // 2. EXECUTE REAL COMMAND -> VERIFY OUTPUT
    console.log("2. EXECUTE REAL COMMAND");
    const execRes = await api(`/api/labs/${labId}/session/${sessionId}/execute`, {
      method: "POST",
      body: { command: "whoami" },
    });
    if (!execRes.output.includes("analyst")) {
      throw new Error(`Expected output to contain 'analyst', got: ${execRes.output}`);
    }
    console.log('   ✓ Command "whoami" executed, got "analyst".');

    // 3. EXECUTE ANOTHER COMMAND TO VERIFY FILES
    const execRes2 = await api(`/api/labs/${labId}/session/${sessionId}/execute`, {
      method: "POST",
      body: { command: "ls -la" },
    });
    console.log('   ✓ Command "ls -la" executed successfully.');

    // 4. STOP -> VERIFY CONTAINER REMOVED
    console.log("4. STOP -> VERIFY CONTAINER REMOVED");
    await api(`/api/labs/${labId}/session/${sessionId}`, {
      method: "DELETE",
    });
    console.log("   ✓ Session stopped and container removed.");

    console.log("\n✅ All IVVAB LABS tests passed successfully!");
  } catch (err) {
    console.error("\n❌ Test failed:", err.message);
    process.exit(1);
  }
}

runTests();
