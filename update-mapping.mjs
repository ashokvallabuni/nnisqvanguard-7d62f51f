const fs = require("fs");

let content = fs.readFileSync("src/routes/cyber-range.labs.tsx", "utf8");

content = content.replace(
  /id: "lab-ssh-bruteforce",\s*slug: "linux-ssh-brute-force-investigation",\s*title: "Linux SSH Brute Force Investigation",\s*summary:/,
  'id: "lab-ssh-bruteforce", slug: "linux-ssh-brute-force-investigation", title: "Linux SSH Brute Force Investigation", courseId: "c-lin-quest", summary:',
);

content = content.replace(
  /id: "lab-suricata-nids",\s*slug: "suricata-network-threat-hunting",\s*title: "Suricata Network Threat Hunting & PCAP Analysis",\s*summary:/,
  'id: "lab-suricata-nids", slug: "suricata-network-threat-hunting", title: "Suricata Network Threat Hunting & PCAP Analysis", courseId: "c-net-fund", summary:',
);

content = content.replace(
  /id: "lab-sqli-investigation",\s*slug: "sql-injection-forensics-and-mitigation",\s*title: "SQL Injection Incident Forensics & Hardening",\s*summary:/,
  'id: "lab-sqli-investigation", slug: "sql-injection-forensics-and-mitigation", title: "SQL Injection Incident Forensics & Hardening", courseId: "c-cyber-found", summary:',
);

content = content.replace(
  /id: "lab-memory-forensics",\s*slug: "volatility-memory-dump-analysis",\s*title: "Memory Forensics with Volatility 3",\s*summary:/,
  'id: "lab-memory-forensics", slug: "volatility-memory-dump-analysis", title: "Memory Forensics with Volatility 3", courseId: "c-cyber-master", summary:',
);

fs.writeFileSync("src/routes/cyber-range.labs.tsx", content);
