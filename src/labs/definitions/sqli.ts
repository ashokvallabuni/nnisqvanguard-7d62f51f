import { LabDefinition } from "./types";
import { VirtualFileSystem } from "../engine/filesystem/vfs";

export const sqliInvestigationLab: LabDefinition = {
  id: "lab-sqli-investigation",
  slug: "sql-injection-incident-forensics",
  title: "SQL Injection Incident Forensics",
  difficulty: "MEDIUM",
  category: "Web Forensics",
  description:
    "Investigate web access logs to trace an SQL Injection attack that extracted sensitive user data.",
  estimated_minutes: 40,
  reward_points: 125,
  learning_objectives: [
    "Analyze web server access logs",
    "Identify SQL injection payloads (UNION SELECT, timing, boolean)",
    "Trace the attacker's timeline and exfiltrated records",
  ],
  hints: [
    "Look for HTTP GET parameters containing 'UNION' or '%27' (single quote).",
    "The flag is located in the incident report vault.",
  ],
  flag: "FLAG{SQLI_PAYLOAD_ANALYZED}",
  tasks: [
    {
      id: "t1",
      title: "Inspect Web Logs",
      description: "Find the web access log file.",
      command_hint: "ls -la /var/log/apache2",
      validate: (ctx, cmd) => cmd.includes("ls") && cmd.includes("apache2"),
    },
    {
      id: "t2",
      title: "Identify the Attack",
      description: "Search for SQL keywords like UNION or SELECT in the access logs.",
      command_hint: "grep 'UNION' /var/log/apache2/access.log",
      validate: (ctx, cmd) => cmd.includes("grep") && cmd.includes("UNION"),
    },
    {
      id: "t3",
      title: "Submit the Flag",
      description: "Submit the security flag located in the incident vault.",
      command_hint: "cat /vault/incident_flag.txt",
      validate: (ctx, cmd) => cmd.includes("cat") && cmd.includes("incident_flag.txt"),
    },
  ],
  setupFilesystem: () => {
    const vfs = new VirtualFileSystem();
    vfs.mkdir("/var/log/apache2");
    vfs.mkdir("/vault");
    vfs.mkdir("/home/analyst");

    let accessLog =
      '10.0.0.1 - - [25/Sep/2026:10:00:00 +0000] "GET /index.php HTTP/1.1" 200 1234\n';
    accessLog +=
      '192.168.1.50 - - [25/Sep/2026:10:05:00 +0000] "GET /product.php?id=1%27%20OR%201=1-- HTTP/1.1" 200 5000\n';
    accessLog +=
      '192.168.1.50 - - [25/Sep/2026:10:06:00 +0000] "GET /product.php?id=1%20UNION%20SELECT%20username,password%20FROM%20users-- HTTP/1.1" 200 9500\n';

    vfs.writeFile("/var/log/apache2/access.log", accessLog);
    vfs.writeFile("/vault/incident_flag.txt", "FLAG{SQLI_PAYLOAD_ANALYZED}\n");

    return vfs;
  },
};
