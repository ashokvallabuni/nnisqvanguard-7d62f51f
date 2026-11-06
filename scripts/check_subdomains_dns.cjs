const dns = require("dns").promises;

async function checkSubdomains() {
  const subs = ["send", "bounces", "resend", "mail", "em", "smtp"];
  for (const s of subs) {
    const fqdn = `${s}.nisqvanguard.in`;
    try {
      const txt = await dns.resolveTxt(fqdn);
      console.log(`TXT for ${fqdn}:`, txt.map(r => r.join("")));
    } catch (e) {
      // not found
    }
    try {
      const mx = await dns.resolveMx(fqdn);
      console.log(`MX for ${fqdn}:`, mx);
    } catch (e) {
      // not found
    }
  }
}

checkSubdomains();

