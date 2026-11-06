const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const env = {};
fs.readFileSync(".env", "utf8").split(/\r?\n/).forEach((l) => {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
});

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // Try inserting duplicate (user_id, course_id) in a test transaction or test check
  const { data: indexes } = await admin.rpc("get_indexes_for_table", { tbl: "certificates" }).catch(() => ({ data: null }));
  console.log("Indexes RPC:", indexes);
}

main();

