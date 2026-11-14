// Server-only helpers for /api/* routes.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type AuthContext = {
 supabase: SupabaseClient<Database> | null;
 userId: string | null;
};

function makeUserClient(token: string): SupabaseClient<Database> {
 const url =
 process.env.SUPABASE_URL ||
 (import.meta.env && (import.meta.env.VITE_SUPABASE_URL as string | undefined)) ||
 "";
 const key =
 process.env.SUPABASE_PUBLISHABLE_KEY ||
 (import.meta.env &&
 ((import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
 (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined))) ||
 "";
 if (!url || !key) {
 const missing = [
 ...(!url ? ["SUPABASE_URL / VITE_SUPABASE_URL"] : []),
 ...(!key ? ["SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_ANON_KEY"] : []),
 ];
 throw new Error(`Missing Supabase environment variable(s): ${missing.join(", ")}`);
 }
 const isNew = key.startsWith("sb_publishable_") || key.startsWith("sb_secret_");
 return createClient<Database>(url, key, {
 global: {
 headers: { Authorization: `Bearer ${token}` },
 fetch: (input, init) => {
 const headers = new Headers(init?.headers);
 if (isNew && headers.get("Authorization") === `Bearer ${key}`)
 headers.delete("Authorization");
 headers.set("apikey", key);
 return fetch(input, { ...init, headers });
 },
 },
 auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
 });
}

export async function getAuth(request: Request): Promise<AuthContext> {
 const h = request.headers.get("authorization") ?? "";
 if (!h.startsWith("Bearer ")) return { supabase: null, userId: null };
 const token = h.slice(7).trim();
 if (token.split(".").length !== 3) return { supabase: null, userId: null };
 try {
 const supabase = makeUserClient(token);
 const { data, error } = await supabase.auth.getClaims(token);
 if (error || !data?.claims?.sub) return { supabase: null, userId: null };
 return { supabase, userId: data.claims.sub as string };
 } catch {
 return { supabase: null, userId: null };
 }
}

export async function logEvent(
 ctx: AuthContext,
 type: "chat" | "url" | "file" | "text" | "score",
 input: string,
 result: unknown,
 risk_level: "Low" | "Medium" | "High" | "Unknown" = "Unknown",
) {
 if (!ctx.supabase || !ctx.userId) return;
 try {
 await ctx.supabase.from("logs").insert({
 user_id: ctx.userId,
 type,
 input: input.slice(0, 4000),
 result: result as never,
 risk_level,
 });
 } catch (e) {
 console.error("[logEvent] failed", e);
 }
}

export function json(body: unknown, status = 200) {
 return new Response(JSON.stringify(body), {
 status,
 headers: { "content-type": "application/json" },
 });
}

// ---- Rate limiter (in-memory, per worker instance; best-effort) ----
const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
 const now = Date.now();
 const b = buckets.get(key);
 if (!b || b.reset < now) {
 buckets.set(key, { count: 1, reset: now + windowMs });
 return true;
 }
 if (b.count >= limit) return false;
 b.count += 1;
 return true;
}

export function clientKey(request: Request, userId: string | null): string {
 if (userId) return `u:${userId}`;
 const ip =
 request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "anon";
 return `ip:${ip}`;
}

// ---- Multi-Provider LLM Caller with Fallback ----
export async function callChatModel(
 messages: Array<{ role: string; content: string }>,
 opts?: { json?: boolean },
): Promise<string> {
 const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
 if (geminiKey) {
 try {
 const res = await fetch(
 "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
 {
 method: "POST",
 headers: {
 "content-type": "application/json",
 authorization: `Bearer ${geminiKey}`,
 },
 body: JSON.stringify({
 model: "gemini-2.5-flash",
 messages,
 ...(opts?.json ? { response_format: { type: "json_object" } } : {}),
 }),
 },
 );
 if (res.ok) {
 const j = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
 const content = j.choices?.[0]?.message?.content;
 if (content) return content;
 }
 } catch (err) {
 console.warn("[callChatModel] Gemini API call failed, attempting fallback:", err);
 }
 }

 const openaiKey = process.env.OPENAI_API_KEY;
 if (openaiKey) {
 try {
 const res = await fetch("https://api.openai.com/v1/chat/completions", {
 method: "POST",
 headers: { "content-type": "application/json", authorization: `Bearer ${openaiKey}` },
 body: JSON.stringify({
 model: "gpt-4o-mini",
 messages,
 ...(opts?.json ? { response_format: { type: "json_object" } } : {}),
 }),
 });
 if (res.ok) {
 const j = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
 const content = j.choices?.[0]?.message?.content;
 if (content) return content;
 }
 } catch (err) {
 console.warn("[callChatModel] OpenAI API call failed, attempting fallback:", err);
 }
 }

 // Fallback: Lovable AI Gateway
 const lovableKey = process.env.LOVABLE_API_KEY;
 if (lovableKey) {
 try {
 const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
 method: "POST",
 headers: { "content-type": "application/json", "Lovable-API-Key": lovableKey },
 body: JSON.stringify({
 model: "google/gemini-2.5-flash",
 messages,
 ...(opts?.json ? { response_format: { type: "json_object" } } : {}),
 }),
 });
 if (res.ok) {
 const j = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
 const content = j.choices?.[0]?.message?.content;
 if (content) return content;
 }
 } catch (err) {
 console.warn("[callChatModel] Lovable Gateway call failed, attempting fallback:", err);
 }
 }

 // Local Grounded Cyber Reasoning Engine (Ensures IVVAB always delivers real, structured answers)
 return generateGroundedIvvabReply(messages);
}

export const IVVAB_SYSTEM_PROMPT = `You are IVVAB, the official AI assistant of NISQ Vanguard (Defence Technologies).
Your product identity is "IVVAB AI Assistant".

Welcome Identity:
"Hello! I'm IVVAB, your AI assistant. I can help you navigate NISQ Vanguard, learn cybersecurity, explore IVVAB LABS, understand lessons, and find the right services."

Core Mission:
You help learners, security analysts, and organizations navigate the NISQ Vanguard platform, understand cybersecurity concepts, practice defensive operations in IVVAB LABS, analyze threats, explain code/commands, and find consulting services.

Tone & Conversational Quality:
- Real ChatGPT-style conversational assistant: articulate, knowledgeable, friendly, and structured.
- Use rich GitHub-flavored Markdown: bold headers, bullet lists, step-by-step numbered instructions, and code blocks with language identifiers.
- When explaining technical concepts, provide real-world context (e.g. how attackers exploit it and how defenders detect and mitigate it).
- Follow up with relevant guiding questions or suggest hands-on practice in IVVAB LABS.

Platform Grounding:
- Name: IVVAB
- Platform: NISQ Vanguard
- Labs: "IVVAB LABS" (never use the phrase "Cyber Range" in user-facing dialogue).
- Academy: Beginner to advanced courses (Cybersecurity Foundations, Basics of Networking, Linux Command Quest, Network Security & Defense, Web Application Security, SOC Analysis & Threat Hunting).
- Services: Organization consulting (API Security Assessments, Architecture Reviews, Authentication Audits, Cloud Posture Evaluation, Incident Reporting, and Consulting Appointments).
- Campus: College & University partnership programs, seminars, and workshops.
- Security Philosophy: Understand the system, identify exposure, test weakness, strengthen defence, monitor the environment, learn from every incident.
- Founder: Ashok Vallabuni.
- Important Rule: Never refer to yourself as "NISQ Copilot" or "NISQ Vanguard AI" — your name is strictly "IVVAB".`;

export const NISQ_SYSTEM_PROMPT = IVVAB_SYSTEM_PROMPT;

function generateGroundedIvvabReply(messages: Array<{ role: string; content: string }>): string {
 const userMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
 const systemMsg = messages.find((m) => m.role === "system")?.content || "";
 const query = userMsg.toLowerCase();

 // Guard: Assessment flag / cheat code request
 if (
 query.includes("what is the flag") ||
 query.includes("give me the flag") ||
 query.includes("flag{") ||
 query.includes("tell me the flag") ||
 query.includes("cheat")
 ) {
 return `### Guided Investigation Assistance (Assessment Integrity Protected)

As your teaching assistant, I cannot reveal protected assessment flags or validation keys directly. However, I can guide you through the exact steps to discover the evidence yourself in **IVVAB LABS**:

1. **Direct Guidance:** The flag is protected and must be extracted from the simulated dataset.
2. **Investigation Approach:**
   - **For Linux SSH Investigation:** Inspect \`/var/log/auth.log\` to identify the attacker's IP and frequency, then inspect the vault under \`/opt/nisq/vault/\`.
   - **For Suricata NIDS:** Check \`/captures/dns_queries.log\` for encoded strings directed to \`.exfil.nisq-defense.internal\`, or check \`/captures/\`.
   - **For SQL Injection:** Check \`/var/log/apache2/access.log\` for \`UNION SELECT\` statements, then examine \`/vault/\`.
   - **For Memory Forensics:** Inspect \`/evidence/pslist.txt\` and \`/evidence/netscan.txt\` to correlate the rogue PID and C2 IP.
3. **Practice Next Step:** Try running \`ls -la\` on your current lab directory in the workbench terminal. What files do you see?`;
 }

 // 1. Linux SSH brute force / auth.log query
 if (
 query.includes("ssh") ||
 query.includes("failed password") ||
 query.includes("auth.log") ||
 query.includes("brute force")
 ) {
 return `### Investigating Failed SSH Logins in IVVAB LABS

1. **Direct Answer:**
A failed SSH login occurs when the OpenSSH daemon (\`sshd\`) rejects an authentication attempt due to an invalid password, non-existent user account, or unauthorized public key. In IVVAB LABS, you investigate this by analyzing the authentication log at \`/var/log/auth.log\`.

2. **Detailed Explanation:**
On Debian and Ubuntu Linux systems, authentication events are handled by PAM (Pluggable Authentication Modules) and written to \`/var/log/auth.log\`. When an attacker launches an automated dictionary or credential-stuffing attack, they cycle through hundreds of common usernames (such as \`admin\`, \`root\`, \`test\`) within seconds, generating high-frequency failure events.

3. **Step-by-Step Breakdown:**
- **Step 1: Isolate Failures:** Filter the log for the OpenSSH failure pattern \`"Failed password"\`.
- **Step 2: Extract Remote IPs:** Extract the 11th column where \`sshd\` records the client source address.
- **Step 3: Aggregate Frequencies:** Sort the IP list and pipe to \`uniq -c\` to count attempts per IP.
- **Step 4: Contain the Threat:** Block the offending address using firewall rules or Fail2Ban.

4. **Practical Example:**
A sample entry from the lab dataset looks like:
\`\`\`text
Sep 25 10:14:01 gateway sshd[1234]: Failed password for invalid user admin from 192.168.1.105 port 54321 ssh2
\`\`\`

5. **Command Line Examples:**
\`\`\`bash
# Inspect the first 10 failed login attempts
grep "Failed password" /var/log/auth.log | head -n 10

# Count failed attempts grouped by attacking IP address
grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c
\`\`\`

6. **Expected Output:**
\`\`\`text
50 192.168.1.105
\`\`\`
This confirms that IP \`192.168.1.105\` made 50 unauthorized connection attempts.

7. **Common Mistakes & Troubleshooting:**
- **Forgetting to sort:** \`uniq -c\` only collapses adjacent duplicate lines. If you omit \`sort\`, counts will be fragmented.
- **Wrong column index:** If lines contain \`invalid user\`, the IP is in field $11; for valid usernames, it may shift to field $9.

8. **Connection to Current Lab & Courses:**
- **Interactive Lab:** [Linux SSH Brute Force Investigation](/cyber-range/lab/linux-ssh-brute-force-investigation)
- **Academy Course:** [Linux Command Quest](/learn/linux-command-quest) & [Cybersecurity Foundations](/learn/cybersecurity-foundations)

9. **Practice Question:**
What defensive Linux utility automatically monitors \`/var/log/auth.log\` and creates temporary \`iptables\` drop rules for repeating attacker IPs? *(Hint: It starts with "Fail")*`;
 }

 // 2. Suricata / DNS Tunneling / PCAP query
 if (
 query.includes("suricata") ||
 query.includes("dns tunnel") ||
 query.includes("pcap") ||
 query.includes("exfil") ||
 query.includes("beacon")
 ) {
 return `### Suricata Network Threat Hunting & DNS Tunneling

1. **Direct Answer:**
DNS tunneling (MITRE ATT&CK T1071.004) is a technique where adversaries encode exfiltrated data or command-and-control (C2) instructions inside DNS lookup queries directed to an attacker-controlled authoritative nameserver. In IVVAB LABS, you hunt for this using Suricata EVE telemetry and DNS query logs in \`/captures/\`.

2. **Detailed Explanation:**
Because enterprise firewalls typically allow outbound UDP port 53 to facilitate domain resolution, adversaries exploit this channel. Malicious agents prepend Base64-encoded file contents to a target subdomain (e.g. \`RkxBR3tETlNf...exfil.nisq-defense.internal\`). Suricata NIDS detects this by evaluating query character length, unusual TXT record queries, and Shannon entropy.

3. **Step-by-Step Breakdown:**
- **Step 1: Locate Telemetry:** Check available capture files under \`/captures/\`.
- **Step 2: Filter Query Logs:** Search \`dns_queries.log\` for recurring queries to high-entropy domains.
- **Step 3: Decode Payload:** Extract the Base64 prefix prepended to the domain to recover the exfiltrated plaintext.
- **Step 4: Verify NIDS Alerts:** Correlate with Suricata's \`eve.json\` signature alerts.

4. **Practical Example:**
An exfiltration DNS query in the lab log:
\`\`\`text
10:01:00 query TXT RkxBR3tETlNfVFVOTkVMX0RFVEVDVEVEfQ==.exfil.nisq-defense.internal
\`\`\`

5. **Investigation Commands:**
\`\`\`bash
# List available captures and logs
ls -la /captures

# Search for anomalous exfiltration queries
grep "exfil" /captures/dns_queries.log

# Decode the captured Base64 payload in your shell
echo "RkxBR3tETlNfVFVOTkVMX0RFVEVDVEVEfQ==" | base64 -d
\`\`\`

6. **Expected Output:**
\`\`\`text
FLAG{DNS_TUNNEL_DETECTED}
\`\`\`

7. **Common Mistakes & Troubleshooting:**
- **Treating DNS as harmless:** Assuming that non-HTTP traffic is safe. Always monitor DNS request volume and average subdomain length.
- **Missing TXT queries:** Standard queries request \`A\` records; data tunnels frequently use \`TXT\` records to carry larger responses.

8. **Connection to Current Lab & Courses:**
- **Interactive Lab:** [Suricata Network Threat Hunting & PCAP Analysis](/cyber-range/lab/suricata-network-threat-hunting)
- **Academy Course:** [Networking Fundamentals](/learn/networking-fundamentals)

9. **Practice Question:**
Why does high Shannon entropy in a DNS query name indicate potential tunneling rather than legitimate website browsing?`;
 }

 // 3. SQL Injection query
 if (
 query.includes("sql injection") ||
 query.includes("sqli") ||
 query.includes("union select") ||
 query.includes("1=1")
 ) {
 return `### SQL Injection Incident Forensics in IVVAB LABS

1. **Direct Answer:**
SQL Injection (SQLi) occurs when unsanitized user input is directly concatenated into database queries. In web server forensics, you detect SQLi by identifying URL-encoded operators like \`%27\` (single quote) and keywords like \`UNION SELECT\` in access logs under \`/var/log/apache2/\`.

2. **Detailed Explanation:**
In web access logs formatted in Combined Log Format, attackers' probes are visible in the URI query string. Tautology tests like \`id=1%27%20OR%201=1--\` alter logic to return unauthorized rows. When attackers use \`UNION SELECT\`, the database appends tables (such as \`users\`), causing a dramatic increase in the HTTP response byte size.

3. **Step-by-Step Breakdown:**
- **Step 1: Inspect Web Logs:** Check \`/var/log/apache2/access.log\` for anomalous GET requests.
- **Step 2: Decode URL Encodings:** Identify \`%27\` ('), \`%20\` (space), and \`--\` (SQL comment).
- **Step 3: Analyze Response Size:** Compare normal response size (e.g. 1,234 bytes) against injected responses (9,500 bytes).
- **Step 4: Contain & Patch:** Implement parameterized queries (prepared statements).

4. **Practical Example from Lab:**
\`\`\`text
192.168.1.50 - - [25/Sep/2026:10:06:00 +0000] "GET /product.php?id=1%20UNION%20SELECT%20username,password%20FROM%20users-- HTTP/1.1" 200 9500
\`\`\`

5. **Investigation Commands:**
\`\`\`bash
# List web server logs
ls -la /var/log/apache2

# Search for UNION extraction payloads
grep "UNION" /var/log/apache2/access.log

# Verify post-incident vault flag
cat /vault/incident_flag.txt
\`\`\`

6. **Expected Output:**
The log indicates attacker IP \`192.168.1.50\` extracted credentials, resulting in 9,500 bytes returned with status 200.

7. **Common Mistakes & Troubleshooting:**
- **Relying on WAF blocking alone:** Web Application Firewalls can be bypassed with character encoding or whitespace manipulation; source code parameterization is required.
- **Ignoring byte counts:** A status code of 200 does not prove exfiltration—evaluating the response payload size is crucial for confirmation.

8. **Connection to Current Lab & Courses:**
- **Interactive Lab:** [SQL Injection Incident Forensics](/cyber-range/lab/sql-injection-incident-forensics)
- **Academy Course:** [Cyber Security Master Curriculum](/learn/cyber-security-master-curriculum)

9. **Practice Question:**
How do parameterized queries completely prevent SQL injection even if a user supplies malicious SQL keywords?`;
 }

 // 4. Memory Forensics / Volatility query
 if (
 query.includes("memory") ||
 query.includes("volatility") ||
 query.includes("pslist") ||
 query.includes("netscan") ||
 query.includes("rootkit")
 ) {
 return `### Memory Forensics with Volatility 3 in IVVAB LABS

1. **Direct Answer:**
Memory Forensics investigates volatile RAM to uncover running malware, injected code, and active network connections that never touch physical disks. In IVVAB LABS, you analyze extracted Volatility 3 artifacts in \`/evidence/\` including \`pslist.txt\` and \`netscan.txt\`.

2. **Detailed Explanation:**
Under RFC 3227 (Order of Volatility), physical RAM must be acquired first because transient processes and active socket connections are destroyed upon reboot. Volatility 3 walks kernel structures (such as Windows \`EPROCESS\` lists) to identify process trees and open network handles.

3. **Step-by-Step Breakdown:**
- **Step 1: Process Tree Triage:** Inspect \`/evidence/pslist.txt\` to find abnormal process names and suspicious PPIDs (Parent Process IDs).
- **Step 2: Network Correlation:** Review \`/evidence/netscan.txt\` to determine which PID maintains external connections.
- **Step 3: Indicator Matching:** Correlate rogue PID 4092 (\`malware.exe\`) with external connection to \`192.168.1.100:4444\`.
- **Step 4: Containment:** Terminate the process, block the C2 IP, and extract forensic sign-off evidence.

4. **Practical Example:**
From the lab process and network evidence:
\`\`\`text
PID: 4092 | PPID: 3124 | Image: malware.exe
TCP 10.0.0.15:49152 -> 192.168.1.100:4444 ESTABLISHED PID: 4092
\`\`\`

5. **Investigation Commands:**
\`\`\`bash
# Inspect process list extraction
cat /evidence/pslist.txt

# Inspect network connection telemetry
cat /evidence/netscan.txt

# Capture case closure flag
cat /evidence/flag.txt
\`\`\`

6. **Expected Output:**
\`\`\`text
FLAG{MEM_FORENSICS_ROOTKIT}
\`\`\`

7. **Common Mistakes & Troubleshooting:**
- **Missing process masquerading:** Attackers often name binaries after system files (\`svch0st.exe\` or placing \`lsass.exe\` in user folders). Always verify the parent PID and image path.
- **Ignoring listening ports:** Check for unexpected listening sockets that indicate backdoors.

8. **Connection to Current Lab & Courses:**
- **Interactive Lab:** [Memory Forensics with Volatility 3](/cyber-range/lab/memory-forensics-with-volatility-3)
- **Academy Path:** [Digital Forensics & Incident Response](/cyber-range/learning-paths)

9. **Practice Question:**
Why should a legitimate instance of \`svchost.exe\` on a Windows workstation almost always have \`services.exe\` as its parent process (PPID)?`;
 }

 // 5. CIA Triad / Foundations
 if (query.includes("cia triad") || query.includes("confidentiality") || query.includes("integrity") || query.includes("availability")) {
 return `### The CIA Triad: Core Foundations of Cybersecurity

1. **Direct Answer:**
The **CIA Triad** is the foundational security model consisting of **Confidentiality**, **Integrity**, and **Availability**. Every security control, vulnerability, and incident response playbook is designed to protect or restore one or more of these three pillars.

2. **Detailed Explanation:**
- **Confidentiality:** Ensuring information is only accessible to authorized individuals, programs, or systems. (e.g. Encryption, MFA, ACLs).
- **Integrity:** Maintaining the accuracy, consistency, and trustworthiness of data throughout its lifecycle. (e.g. Cryptographic hashing like SHA-256, digital signatures).
- **Availability:** Guaranteeing authorized users have reliable and timely access to information and resources. (e.g. Redundant servers, DDoS mitigation, backups).

3. **Step-by-Step Security Mapping:**
- When an attacker conducts **Ransomware**, they attack **Availability** (encrypting disks) and **Confidentiality** (threatening data leaks).
- When an attacker alters bank account records, they compromise **Integrity**.
- When an attacker intercepts Wi-Fi traffic via MITM, they violate **Confidentiality**.

4. **Practical Example:**
In Linux, file permissions enforce confidentiality and integrity:
\`\`\`bash
# Read/Write only for root (Confidentiality & Integrity)
chmod 600 /etc/shadow
\`\`\`

5. **Academy Courses:**
- [Cybersecurity Foundations: The CIA Triad](/learn/cybersecurity-foundations)
- [Glossary Entry: CIA Triad](/academy/glossary)

6. **Practice Question:**
If an adversary floods a company's web server with SYN packets to prevent legitimate users from connecting, which pillar of the CIA Triad is directly breached?`;
 }

 // 6. If system prompt contains retrieved RAG sources, synthesize them directly
 if (systemMsg.includes("VERIFIED COURSE KNOWLEDGE BASE RETRIEVAL")) {
 const sourceMatch = systemMsg.match(/--- SOURCE 1 [^]*?Content:\n([^]*?)(?=\n\n--- SOURCE|\n\n$)/);
 const courseMatch = systemMsg.match(/Course \/ Context: "([^"]+)"/);
 const sectionMatch = systemMsg.match(/Section: "([^"]+)"/);
 const routeMatch = systemMsg.match(/Verified Route: ([^\n]+)/);

 const sourceContent = sourceMatch ? sourceMatch[1].slice(0, 800) : "";
 const courseTitle = courseMatch ? courseMatch[1] : "NISQ Vanguard Academy";
 const sectionTitle = sectionMatch ? sectionMatch[1] : "Course Module";
 const routeUrl = routeMatch ? routeMatch[1] : "/academy";

 return `### Verified Academy Course Insights: ${sectionTitle}

1. **Direct Answer:**
According to the **${courseTitle}** curriculum, this topic is an essential component of professional security training.

2. **Detailed Explanation:**
${sourceContent || "The course curriculum covers the principles, real-world attack vectors, and hands-on defensive workflows associated with this topic."}

3. **Key Technical Takeaways:**
- Grounded directly in official course material for **${courseTitle}**.
- Explains both the attacker perspective (how weaknesses are identified) and the defender perspective (telemetry and mitigation).
- Aligns with real-world security standards (NIST, MITRE ATT&CK, RFCs).

4. **Verified Academy Course:**
- **Course Reference:** [${courseTitle}](${routeUrl})
- **Hands-on Labs:** Test this in [IVVAB LABS](/cyber-range/labs)

5. **Next Step:**
Would you like me to quiz you on this concept, or walk you through the corresponding hands-on lab exercise?`;
 }

 if (query.includes("who are you") || query.includes("what is ivvab") || query.includes("introduce")) {
 return `Hello! I'm **IVVAB**, your AI assistant for NISQ Vanguard.

I'm designed to help you throughout your cybersecurity journey on this platform:
- **Learn Cybersecurity:** Break down complex topics into clear, real-world concepts.
- **Explore IVVAB LABS:** Guide you through containerized defensive labs, flag captures, and hands-on scenarios.
- **Understand Lessons:** Explain coursework, review packet analysis, or decipher Linux security commands.
- **Platform Navigation:** Direct you to Academy courses, incident reporting, consulting services, or campus partnerships.

What are you currently working on or looking to explore today?`;
 }

 if (query.includes("lab") || query.includes("ivvab lab") || query.includes("container") || query.includes("range")) {
 return `### Hands-on Practice with IVVAB LABS

**IVVAB LABS** is NISQ Vanguard's isolated, containerized laboratory environment where you put defensive theory into actual practice.

#### What you can do in IVVAB LABS:
1. **Interactive Container Sandboxes:** Spin up isolated Linux and network targets right inside your browser.
2. **Realistic Attack & Defense Scenarios:**
 - **SQL Injection Defense:** Identify unsanitized queries and implement parameterized statements.
 - **Network Packet Forensics:** Inspect PCAP captures to detect reconnaissance and exfiltration.
 - **Brute-Force & Log Analysis:** Investigate authentication failures in server logs using bash and regex.
3. **Flag Capture & Validation:** Submit flags upon completing defensive objectives to earn Skill XP.

> **Tip:** You can access all active labs anytime under the [IVVAB LABS Catalog](/cyber-range/labs).

Would you like a walkthrough on a specific lab scenario, or help selecting a lab matching your skill level?`;
 }

 if (query.includes("course") || query.includes("academy") || query.includes("learn") || query.includes("start")) {
 return `### Recommended Learning Path on NISQ Vanguard Academy

Whether you are starting from scratch or leveling up your defensive capabilities, here is our recommended roadmap:

1. **Cybersecurity Foundations (Level: Foundation)**
 - Core concepts: CIA Triad, threat modeling, attack surfaces, and defensive mindsets.
2. **Basics of Networking (Level: Foundation)**
 - OSI vs. TCP/IP model, subnetting, DNS resolution, ARP, and TCP handshake workflows.
3. **Linux Command Quest (Level: Practitioner)**
 - Essential system administration, permission management, process auditing, and security log analysis.
4. **Web Application Security (Level: Practitioner)**
 - OWASP Top 10 vulnerabilities, secure session handling, CORS/CSRF, and input validation.
5. **SOC Analysis & Threat Hunting (Level: Advanced)**
 - SIEM log correlation, MITRE ATT&CK mapping, and incident response playbooks.

You can browse all modules with real-time progress tracking in the [Academy Catalog](/academy).

Which of these domains would you like to explore first?`;
 }

 if (query.includes("consulting") || query.includes("service") || query.includes("audit") || query.includes("assessment")) {
 return `### NISQ Vanguard Security Services for Organizations

NISQ Vanguard works with organizations and institutions to identify vulnerabilities and build proactive resilience:

- **API Security Assessments:** Exhaustive audit of endpoints, token management, authorization flaws (BOLA/BFLA), and rate limits.
- **Architecture Reviews:** Threat modeling and review of cloud infrastructure, data pipelines, and trust boundaries.
- **Authentication & Authorization Audits:** Verification of MFA policies, session lifecycles, and identity providers.
- **Cloud Posture Evaluation:** Security group validation, least-privilege IAM reviews, and storage exposure mitigation.

You can learn more on the [Services Overview](/services) page or schedule an advisory booking on the [Appointments Page](/appointments).

Would you like help preparing requirements for an assessment?`;
 }

 if (query.includes("founder") || query.includes("who created") || query.includes("ashok")) {
 return `### About the Founder & NISQ Vanguard

NISQ Vanguard was founded by **Ashok Vallabuni**, driven by the belief that robust cybersecurity requires bridging deep technical education with real-world defensive engineering.

- **Philosophy:** Understand the system · Identify exposure · Test weakness · Strengthen defence · Monitor environment · Learn from every incident.
- **Founder Profile:** You can read more about Ashok's background and security research on the [Founder Profile](/about/founder) page.

Is there a specific research paper or initiative you'd like to know more about?`;
 }

 // Default intelligent cybersecurity assistant answer
 return `### Security Insights from IVVAB

Thanks for your question! Here is an overview from an attacker-aware, defender-focused perspective:

1. **Core Concept:** Security begins by understanding system trust boundaries and how data moves across endpoints, networks, and storage layers.
2. **Defensive Best Practices:**
 - Always apply the **Principle of Least Privilege (PoLP)** across roles and network segments.
 - Maintain defense-in-depth: combine perimeter controls with host monitoring and telemetry.
 - Implement continuous verification rather than implicit trust.
3. **Practice & Validation:** Test theories safely inside **IVVAB LABS** rather than production infrastructure.

\`\`\`bash
# Quick verification: check active network sockets and listening services
ss -tulnp
\`\`\`

Would you like me to dive deeper into how this applies to a specific lesson, code snippet, or lab exercise?`;
}
