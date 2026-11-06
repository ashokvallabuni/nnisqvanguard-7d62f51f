const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const env = {};
fs.readFileSync(".env", "utf8").split(/\r?\n/).forEach((l) => {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
});

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: allJobs, error } = await admin.from("certificate_email_jobs").select("*");
  if (error) {
    console.error("Error fetching jobs:", error);
    return;
  }
  
  const counts = {};
  for (const j of allJobs) {
    counts[j.delivery_status] = (counts[j.delivery_status] || 0) + 1;
  }
  console.log("Counts per delivery_status:", counts);
  console.log("All Jobs count:", allJobs.length);
  const stuckOrFailed = allJobs.filter(j => j.delivery_status !== "SENT");
  console.log("Non-SENT jobs:", JSON.stringify(stuckOrFailed, null, 2));
}

main();
