import { LabDefinition } from "./types";
import { VirtualFileSystem } from "../engine/filesystem/vfs";

export const sqliInvestigationLab: LabDefinition = {
 id: "lab-sqli-investigation",
 slug: "sql-injection-incident-forensics",
 title: "SQL Injection Incident Forensics",
 difficulty: "MEDIUM",
 category: "Web Forensics",
 description:
 "Investigate web access logs to trace an SQL Injection attack that extracted sensitive user records. Reconstruct the attack timeline, identify URL-encoded payloads, quantify extracted tables, and verify the containment flag.",
 estimated_minutes: 40,
 reward_points: 125,
 learning_objectives: [
 "Analyze Apache/Nginx web server access logs in Combined Log Format",
 "Identify SQL injection indicators including boolean bypasses (%27 OR 1=1) and UNION-based exfiltration",
 "Decipher URL-encoded parameters (%27 for single quotes, %20 for spaces)",
 "Correlate HTTP response sizes (status 200, response bytes) to detect data leakage",
 "Recommend secure coding remediations (parameterized queries, prepared statements)",
 ],
 prerequisites: [
 "Understanding of HTTP request structure (GET/POST methods, query strings, headers)",
 "Basic SQL syntax (SELECT, FROM, WHERE, UNION)",
 "Familiarity with Linux command-line text parsing (grep, cat, awk)",
 ],
 conceptual_intro: `### Web Application Forensics & SQL Injection Anatomy

**SQL Injection (SQLi)** occurs when untrusted user input is directly concatenated into a dynamic database query without proper validation or parameterization. This allows adversaries to alter the query logic and execute arbitrary SQL commands.

#### Anatomy of an In-Band (UNION-Based) SQLi
1. **Tautology / Auth Bypass Probe:**
   \`\`\`sql
   SELECT * FROM products WHERE id = 1 OR 1=1--
   \`\`\`
   In web access logs, special characters are URL-encoded:
   \`%27\` represents \`'\` (single quote) and \`%20\` represents space:
   \`\`\`
   GET /product.php?id=1%27%20OR%201=1-- HTTP/1.1
   \`\`\`
2. **Column Discovery & UNION SELECT Exfiltration:**
   The adversary uses the \`UNION\` operator to append the results of an attacker-crafted \`SELECT\` query to the original query:
   \`\`\`sql
   GET /product.php?id=1%20UNION%20SELECT%20username,password%20FROM%20users-- HTTP/1.1
   \`\`\`

#### Forensic Evidence in Combined Log Format
Standard Apache/Nginx log structure:
\`\`\`
<Remote IP> - <User> [<Timestamp>] "<Method> <URI> <Protocol>" <Status> <Bytes Sent>
\`\`\`
- Notice the **Bytes Sent** column: A standard product page might return 1,200 bytes. When the attacker's \`UNION SELECT\` query extracts the entire user database, the response size surges to 9,500 bytes—a clear forensic signature of data exfiltration!`,
 dataset_description:
 "The virtual system provides an Apache web server log file under /var/log/apache2/access.log containing genuine attack telemetry from an adversary probing the production catalog service, alongside benign baseline traffic and a post-incident resolution vault in /vault/.",
 evidence_summary:
 "Attacker IP 192.168.1.50 executed sequential SQLi probes against /product.php. Response byte counts expanded from 1,234 to 9,500 bytes following a successful 'UNION SELECT username,password FROM users' statement.",
 hints: [
 "Look for HTTP GET parameters containing 'UNION' or '%27' (single quote).",
 "Examine the byte size response difference between normal requests and the UNION request.",
 "The incident resolution token is located in /vault/incident_flag.txt.",
 ],
 progressive_hints: [
 {
 level: 1,
 title: "Conceptual Clue",
 hint: "Web access logs are stored under /var/log/apache2/. Check access.log for requests containing SQL syntax words.",
 },
 {
 level: 2,
 title: "Investigation Strategy",
 hint: "Run 'grep UNION /var/log/apache2/access.log' to locate the exact exfiltration payload and examine the target tables extracted.",
 },
 {
 level: 3,
 title: "Exact Command Syntax",
 hint: "Use 'grep UNION /var/log/apache2/access.log', then view the post-incident vault at /vault/incident_flag.txt to capture the flag.",
 },
 ],
 tasks: [
 {
 id: "t1",
 title: "Inspect Web Logs Directory",
 description: "Explore the /var/log/apache2 directory to verify available server log files.",
 command_hint: "ls -la /var/log/apache2",
 explanation:
 "Confirming the log file locations establishes the starting point for timeline reconstruction.",
 failure_guidance: "Use 'ls -la /var/log/apache2' to view available web server logs.",
 progressive_hints: [
 { level: 1, text: "Navigate to the Apache log folder." },
 { level: 2, text: "Use ls to check /var/log/apache2." },
 { level: 3, text: "Command: ls -la /var/log/apache2" },
 ],
 validate: (ctx, cmd) => cmd.includes("ls") && cmd.includes("apache2"),
 },
 {
 id: "t2",
 title: "Identify the SQL Injection Attack Payload",
 description: "Search for SQL injection keywords (such as UNION or SELECT) in the web access logs.",
 command_hint: "grep 'UNION' /var/log/apache2/access.log",
 explanation:
 "Filtering for 'UNION' isolates the data-dump stage where the adversary extracted credentials from the users table.",
 failure_guidance: "Run 'grep UNION /var/log/apache2/access.log' to inspect the injected payload.",
 progressive_hints: [
 { level: 1, text: "Search the access.log for SQL commands." },
 { level: 2, text: "Look for the UNION keyword." },
 { level: 3, text: "Command: grep 'UNION' /var/log/apache2/access.log" },
 ],
 validate: (ctx, cmd) => cmd.includes("grep") && cmd.includes("UNION"),
 },
 {
 id: "t3",
 title: "Submit the Incident Forensics Flag",
 description: "Submit the incident verification token from /vault/incident_flag.txt.",
 command_hint: "cat /vault/incident_flag.txt",
 explanation:
 "Documenting the confirmed breach allows SOC analysts to trigger password resets and deploy parameterized query patches.",
 failure_guidance: "Read /vault/incident_flag.txt using cat.",
 progressive_hints: [
 { level: 1, text: "Check the incident vault in /vault/." },
 { level: 2, text: "Display incident_flag.txt." },
 { level: 3, text: "Command: cat /vault/incident_flag.txt" },
 ],
 validate: (ctx, cmd) => cmd.includes("cat") && cmd.includes("incident_flag.txt"),
 },
 ],
 flag: "FLAG{SQLI_PAYLOAD_ANALYZED}",
 completion_criteria: [
 "Located and verified web server access logs in /var/log/apache2/",
 "Isolated malicious SQL injection payloads including URL-encoded parameters and UNION extraction",
 "Retrieved and submitted incident sign-off validation token",
 ],
 final_assessment: [
 {
 id: "q1",
 question: "In URL encoding, what ASCII character does '%27' represent?",
 options: ["Double quote (\")", "Single quote (')", "Semicolon (;)", "Space ( )"],
 correct_index: 1,
 explanation: "Hexadecimal 0x27 is the ASCII code for the single quote character ('), which is used in SQL to delineate string literals.",
 },
 {
 id: "q2",
 question: "Why is a significant increase in HTTP response body bytes an important indicator of successful SQL injection?",
 options: [
 "Because the attacker uploaded malware to the web server",
 "Because the database returned a full dump of records instead of a single expected item",
 "Because the web server restarted",
 "Because the HTTP status code was changed to 500 Internal Server Error",
 ],
 correct_index: 1,
 explanation: "When a query designed to return a single item is modified via UNION SELECT to dump an entire table, the web server serializes all rows into the HTML/JSON response, causing a massive surge in response byte size.",
 },
 {
 id: "q3",
 question: "What is the primary developer remediation to prevent SQL injection vulnerabilities permanently?",
 options: [
 "Converting all HTTP GET requests to POST requests",
 "Using parameterized queries (prepared statements) with bound variables",
 "Installing a stronger SSL certificate",
 "Replacing Apache with Nginx",
 ],
 correct_index: 1,
 explanation: "Parameterized queries (prepared statements) ensure the database treats input strictly as data parameters, never as executable SQL instructions, completely neutralizing injection attacks regardless of the input characters.",
 },
 ],
 next_recommended: {
 title: "Memory Forensics with Volatility 3",
 route: "/cyber-range/lab/memory-forensics-with-volatility-3",
 description: "Advance to host endpoint memory triage, inspecting volatile RAM artifacts, rootkits, and injected processes.",
 },
 setupFilesystem: () => {
 const vfs = new VirtualFileSystem();
 vfs.mkdir("/var/log/apache2");
 vfs.mkdir("/vault");
 vfs.mkdir("/home/analyst");

 let accessLog =
 '10.0.0.1 - - [25/Sep/2026:10:00:00 +0000] "GET /index.php HTTP/1.1" 200 1234 "-" "Mozilla/5.0"\n' +
 '10.0.0.1 - - [25/Sep/2026:10:01:22 +0000] "GET /about.php HTTP/1.1" 200 842 "-" "Mozilla/5.0"\n' +
 '192.168.1.50 - - [25/Sep/2026:10:05:00 +0000] "GET /product.php?id=1%27%20OR%201=1-- HTTP/1.1" 200 5000 "-" "sqlmap/1.6.4#stable"\n' +
 '192.168.1.50 - - [25/Sep/2026:10:06:00 +0000] "GET /product.php?id=1%20UNION%20SELECT%20username,password%20FROM%20users-- HTTP/1.1" 200 9500 "-" "sqlmap/1.6.4#stable"\n' +
 '10.0.0.2 - - [25/Sep/2026:10:07:10 +0000] "GET /contact.php HTTP/1.1" 200 1102 "-" "Mozilla/5.0"\n';

 vfs.writeFile("/var/log/apache2/access.log", accessLog);
 vfs.writeFile("/vault/incident_flag.txt", "FLAG{SQLI_PAYLOAD_ANALYZED}\n");
 vfs.writeFile(
 "/home/analyst/README.txt",
 "FORENSIC CASE BRIEF:\n1. Examine /var/log/apache2/access.log for unusual query parameters in HTTP GET requests.\n2. Identify the adversary IP, injection technique, and exfiltrated table.\n3. Retrieve the resolution flag from /vault/incident_flag.txt and submit.\n",
 );

 return vfs;
 },
};
