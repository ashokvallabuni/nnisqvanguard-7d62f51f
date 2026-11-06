const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const env = {};
fs.readFileSync(".env", "utf8").split(/\r?\n/).forEach((l) => {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
});

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: claimTest, error: claimErr } = await admin.rpc("claim_next_email_jobs", { batch_size: 5, timeout_seconds: 300 });
  console.log("claim_next_email_jobs RPC test result:", claimTest, claimErr);
}

main();

