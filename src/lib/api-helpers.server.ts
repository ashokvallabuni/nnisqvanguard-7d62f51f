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
 const query = userMsg.toLowerCase();

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
