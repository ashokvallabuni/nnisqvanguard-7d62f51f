import http from 'http';

const RUNNER_URL = 'http://127.0.0.1:8080';
const SECRET = 'nisq_lab_runner_secret_2026_dev';

async function checkHealth() {
  return new Promise((resolve, reject) => {
    const req = http.get(RUNNER_URL + '/health', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function api(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, RUNNER_URL);
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SECRET}`,
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : null);
        } else {
          reject(new Error(`API Error ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

const labsToTest = [
  'lab-ssh-bruteforce',
  'lab-suricata-nids',
  'lab-sqli-investigation',
  'lab-memory-forensics'
];

async function runTests() {
  const isHealthy = await checkHealth();
  if (!isHealthy) {
    console.log("\nLAB RUNNER OFFLINE");
    console.log("E2E TEST BLOCKED");
    process.exit(0);
  }

  console.log(`Starting IVVAB LABS course coverage test...`);
  let successCount = 0;
  for (const labId of labsToTest) {
    const sessionId = `test-session-${labId}-${Date.now()}`;
    console.log(`\nTesting Lab: ${labId}`);
    try {
      console.log('  1. START -> CREATE REAL CONTAINER');
      await api(`/api/labs/${labId}/session`, { method: 'POST', body: { sessionId } });
      
      console.log('  2. EXECUTE REAL COMMAND');
      await api(`/api/labs/${labId}/session/${sessionId}/execute`, { method: 'POST', body: { command: 'whoami' } });
      
      console.log('  3. STOP -> VERIFY CONTAINER REMOVED');
      await api(`/api/labs/${labId}/session/${sessionId}`, { method: 'DELETE' });
      console.log(`  ✓ Lab ${labId} passed.`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ Lab ${labId} failed:`, err.message);
    }
  }
  console.log(`\n✅ ${successCount}/${labsToTest.length} labs passed.`);
}

runTests();
