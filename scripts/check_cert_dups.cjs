const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const env = {};
fs.readFileSync(".env", "utf8").split(/\r?\n/).forEach((l) => {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
});

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // Let's test whether certificates has a unique constraint or if we should add an in-memory promise queue + additive unique constraint
  const { data: certs } = await admin.from("certificates").select("user_id, course_id, id");
  const seen = new Set();
  let hasDups = false;
  for (const c of certs || []) {
    const k = `${c.user_id}:${c.course_id}`;
    if (seen.has(k)) {
      hasDups = true;
      console.log("Duplicate found:", k);
    }
    seen.add(k);
  }
  console.log("Existing certs count:", certs?.length, "Has duplicates:", hasDups);
}

main();

