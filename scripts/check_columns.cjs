const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const envText = fs.readFileSync(".env", "utf8");
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from("certificates").select("*").limit(1);
  if (error) {
    console.error("Error querying certificates:", error);
  } else {
    console.log("Certificates row count:", data.length);
  }

  // Query information schema columns
  const { data: cols, error: colErr } = await supabase.rpc("lookup_certificate_public", {
    cert_number: "NON_EXISTENT",
  });
  console.log("RPC lookup test response:", cols);

  // Read certificates columns via postgres function or error test
  const testInsert = await supabase.from("certificates").insert({}).select();
  console.log("Test insert error (gives schema hints):", testInsert.error);
}

check();

