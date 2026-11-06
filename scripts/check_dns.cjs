const dns = require("dns").promises;

async function checkDns() {
  console.log("=== CHECKING DNS RECORDS FOR nisqvanguard.in ===");
  const domain = "nisqvanguard.in";

  // 1. TXT records on apex (SPF, site verification)
  try {
    const txts = await dns.resolveTxt(domain);
    console.log("\n[APEX TXT RECORDS for " + domain + "]:");
    let foundSpf = false;
    for (const record of txts) {
      const text = record.join("");
      console.log(" -", text);
      if (text.startsWith("v=spf1")) {
        foundSpf = true;
        console.log("   -> SPF DETECTED:", text);
      }
    }
    if (!foundSpf) {
      console.log("   -> NO SPF RECORD FOUND on apex.");
    }
  } catch (err) {
    console.log("Error querying TXT for apex:", err.message);
  }

  // 2. DMARC record on _dmarc.nisqvanguard.in
  try {
    const dmarc = await dns.resolveTxt(`_dmarc.${domain}`);
    console.log("\n[DMARC RECORD for _dmarc." + domain + "]:");
    for (const record of dmarc) {
      const text = record.join("");
      console.log(" -", text);
    }
  } catch (err) {
    console.log("\n[DMARC RECORD]: NOT FOUND or error:", err.message);
  }

  // 3. Resend DKIM records
  // Resend typically uses resend._domainkey.domain or selectors like resend._domainkey, k1._domainkey, etc.
  const dkimSelectors = ["resend._domainkey", "k1._domainkey", "default._domainkey", "smtp._domainkey", "mail._domainkey"];
  console.log("\n[DKIM SELECTOR CHECKS for " + domain + "]:");
  for (const selector of dkimSelectors) {
    try {
      const dkim = await dns.resolveTxt(`${selector}.${domain}`);
      console.log(` - FOUND ${selector}.${domain}:`, dkim.map(r => r.join("")));
    } catch (e) {
      console.log(` - ${selector}.${domain}: ${e.code || e.message}`);
    }
  }

  // 4. MX records
  try {
    const mx = await dns.resolveMx(domain);
    console.log("\n[MX RECORDS for " + domain + "]:", mx);
  } catch (err) {
    console.log("\n[MX RECORDS]: error:", err.message);
  }
}

checkDns();

