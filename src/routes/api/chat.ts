import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
 callChatModel,
 clientKey,
 getAuth,
 json,
 logEvent,
 IVVAB_SYSTEM_PROMPT,
 rateLimit,
} from "@/lib/api-helpers.server";
import { handleSecurityChatQuery, formatAnalysisSummary } from "@/lib/agents/orchestrator";
import {
 searchCourseKnowledge,
 formatKnowledgeContext,
} from "@/lib/rag/course-knowledge";

const LearningContextSchema = z.object({
 courseSlug: z.string().max(200).optional(),
 moduleSlug: z.string().max(200).optional(),
 lessonTitle: z.string().max(300).optional(),
 labSlug: z.string().max(200).optional(),
 taskId: z.string().max(100).optional(),
 taskTitle: z.string().max(300).optional(),
 datasetInfo: z.string().max(1000).optional(),
 learningMode: z.enum(["general", "lesson", "lab", "assessment"]).optional(),
});

const Body = z.object({
 message: z.string().trim().min(1).max(4000),
 history: z
 .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
 .max(30)
 .optional(),
 pageContext: z
 .object({
 path: z.string().max(300).optional(),
 title: z.string().max(300).optional(),
 })
 .optional(),
 learningContext: LearningContextSchema.optional(),
 stream: z.boolean().optional(),
});

function generateContextualFollowUps(query: string, pagePath?: string, labSlug?: string): string[] {
 const q = query.toLowerCase();
 const path = pagePath?.toLowerCase() || "";

 if (labSlug || q.includes("lab") || path.includes("cyber-range")) {
 if (labSlug?.includes("ssh") || q.includes("ssh")) {
 return [
 "How do I filter auth.log using grep and awk?",
 "What is the difference between benign failed logins and dictionary attacks?",
 "Give me a hint for identifying the attacking IP in this lab",
 ];
 }
 if (labSlug?.includes("suricata") || q.includes("suricata") || q.includes("dns")) {
 return [
 "How does DNS tunneling exfiltrate data across firewalls?",
 "Explain Suricata EVE JSON event logs",
 "Give me a hint on decoding the DNS query payload",
 ];
 }
 if (labSlug?.includes("sql") || q.includes("sql")) {
 return [
 "Why does UNION SELECT increase HTTP response body size?",
 "How do parameterized queries prevent SQL injection?",
 "Give me a hint on inspecting Apache access logs",
 ];
 }
 if (labSlug?.includes("memory") || q.includes("volatility")) {
 return [
 "What is the Order of Volatility under RFC 3227?",
 "How do I spot abnormal process parents in windows.pslist?",
 "Give me a hint for tracing the reverse shell connection",
 ];
 }
 return [
 "How do I submit flags in IVVAB LABS?",
 "Which lab is best for SQL injection defense?",
 "How does the in-browser lab container runner work?",
 ];
 }

 if (q.includes("course") || q.includes("roadmap") || path.includes("academy") || path.includes("courses")) {
 return [
 "Tell me more about Cybersecurity Foundations",
 "What skills do I learn in Basics of Networking?",
 "How do I track my course completion progress?",
 ];
 }

 if (path.includes("learn/")) {
 return [
 "Can you quiz me on this lesson?",
 "What are real-world attacks related to this?",
 "How do defenders detect this weakness in production?",
 ];
 }

 if (q.includes("service") || q.includes("consulting") || path.includes("services") || path.includes("appointments")) {
 return [
 "How do I request an API security audit?",
 "What is an architecture review?",
 "How do I book a security consultation?",
 ];
 }

 return [
 "Tell me about IVVAB LABS",
 "Which Academy course should I start with?",
 "Explain the CIA Triad in simple terms",
 ];
}

const PEDAGOGICAL_PROMPT = `
PEDAGOGICAL TEACHING & TUTORING GUIDELINES:
1. You are IVVAB, the official AI teaching assistant for NISQ Vanguard Academy and IVVAB LABS.
2. For conceptual cybersecurity questions, provide clear, structured, and pedagogical explanations following this progression:
 - Direct answer
 - Detailed explanation in beginner-friendly language
 - Step-by-step breakdown
 - Practical example or attack scenario
 - Verified terminal command or code snippet (with language identifier)
 - Expected output or observable telemetry
 - Common mistakes and troubleshooting tips
 - Direct connection to the relevant Academy course or IVVAB LAB
 - Short practice question or next step
3. ASSESSMENT INTEGRITY & ANSWER PROTECTION:
 - NEVER provide raw assessment flags (e.g. "FLAG{...}") or private answer keys under any circumstance.
 - When a student asks for the flag or task answer, provide progressive hints:
 * Level 1: Conceptual guidance on what log/file to inspect.
 * Level 2: Investigation strategy (filtering, column extraction).
 * Level 3: Syntax guidance for commands, leaving evidence discovery to the student.
4. GROUNDED KNOWLEDGE:
 - Prioritize the retrieved course sections below. Cite actual course names, module titles, and markdown links.
 - If a topic is not in the course catalog, clearly distinguish general cybersecurity knowledge from official Academy courses.
 - Never fabricate nonexistent modules or fake course links.
`;

export const Route = createFileRoute("/api/chat")({
 server: {
 handlers: {
 POST: async ({ request }) => {
 const ctx = await getAuth(request);
 if (!rateLimit(`chat:${clientKey(request, ctx.userId)}`, 30, 60_000)) {
 return json({ error: "Rate limit exceeded. Try again in a minute." }, 429);
 }

 let parsed;
 try {
 parsed = Body.parse(await request.json());
 } catch (e) {
 return json({ error: "Invalid input", details: (e as Error).message }, 400);
 }

 try {
 // Retrieve grounded course and lab knowledge
 const ragResults = searchCourseKnowledge(parsed.message, {
 limit: 4,
 courseSlug: parsed.learningContext?.courseSlug,
 labSlug: parsed.learningContext?.labSlug,
 });
 const ragContext = formatKnowledgeContext(ragResults);

 // Check for security threat analysis via orchestrator
 let analysis;
 let orchestratorReply = "";

 try {
 const result = await handleSecurityChatQuery(parsed.message, undefined);
 orchestratorReply = result.reply;
 analysis = result.analysis;
 } catch (e) {
 console.warn("[/api/chat] Orchestrator pass warning:", e);
 }

 let enhancedReply = orchestratorReply;
 if (analysis && analysis.detection && analysis.detection.findings.length > 0) {
 const summary = formatAnalysisSummary(analysis);
 enhancedReply = (orchestratorReply ? orchestratorReply + "\n\n---\n" : "") + summary;
 }

 // If orchestrator didn't generate or had no findings, run full multi-turn conversational chat
 if (!enhancedReply || enhancedReply === orchestratorReply) {
 let contextAddendum = "";
 if (parsed.learningContext) {
 contextAddendum += `\n\n[Active Learning Context: Mode: ${parsed.learningContext.learningMode || "lesson"}`;
 if (parsed.learningContext.courseSlug) contextAddendum += ` | Course: ${parsed.learningContext.courseSlug}`;
 if (parsed.learningContext.moduleSlug) contextAddendum += ` | Module: ${parsed.learningContext.moduleSlug}`;
 if (parsed.learningContext.lessonTitle) contextAddendum += ` | Lesson: ${parsed.learningContext.lessonTitle}`;
 if (parsed.learningContext.labSlug) contextAddendum += ` | Lab: ${parsed.learningContext.labSlug}`;
 if (parsed.learningContext.taskTitle) contextAddendum += ` | Active Task: ${parsed.learningContext.taskTitle}`;
 if (parsed.learningContext.datasetInfo) contextAddendum += ` | Dataset Telemetry: ${parsed.learningContext.datasetInfo}`;
 contextAddendum += `]`;
 } else if (parsed.pageContext?.path) {
 contextAddendum += `\n\n[Active Page Context: User is viewing "${parsed.pageContext.path}"${
 parsed.pageContext.title ? ` (${parsed.pageContext.title})` : ""
 }]`;
 }

 contextAddendum += `\n\n${ragContext}`;

 const messages = [
 {
 role: "system" as const,
 content: `${IVVAB_SYSTEM_PROMPT}\n\n${PEDAGOGICAL_PROMPT}\n\n${contextAddendum}`,
 },
 ...(parsed.history ?? []).map((h) => ({
 role: h.role as "user" | "assistant",
 content: h.content,
 })),
 { role: "user" as const, content: parsed.message },
 ];

 enhancedReply = await callChatModel(messages);
 }

 // Save chat history if user is authenticated
 if (ctx.supabase && ctx.userId) {
 try {
 await ctx.supabase.from("chat_history").insert({
 user_id: ctx.userId,
 message: parsed.message,
 reply: enhancedReply,
 });

 if (analysis) {
 await ctx.supabase.from("ai_analyses").insert({
 request_id: analysis.requestId,
 user_id: ctx.userId,
 input_type: "chat_query",
 input_data: parsed.message,
 detection_result: analysis.detection
 ? JSON.parse(JSON.stringify(analysis.detection))
 : null,
 analysis_result: analysis.analysis
 ? JSON.parse(JSON.stringify(analysis.analysis))
 : null,
 risk_result: analysis.risk ? JSON.parse(JSON.stringify(analysis.risk)) : null,
 response_result: analysis.response
 ? JSON.parse(JSON.stringify(analysis.response))
 : null,
 risk_score: analysis.risk?.riskScore ?? null,
 severity: analysis.risk?.severity ?? null,
 findings_count: analysis.detection?.findings.length ?? 0,
 status: analysis.status,
 });
 }
 } catch (dbErr) {
 console.warn("[/api/chat] DB logging warning:", dbErr);
 }
 }

 await logEvent(
 ctx,
 "chat",
 parsed.message,
 { reply_length: enhancedReply.length, agent_analysis: Boolean(analysis) },
 analysis?.risk?.severity === "Critical"
 ? "High"
 : analysis?.risk?.severity === "High"
 ? "High"
 : analysis?.risk?.severity === "Medium"
 ? "Medium"
 : analysis?.risk?.severity === "Low"
 ? "Low"
 : "Unknown",
 );

 const followUps = generateContextualFollowUps(
 parsed.message,
 parsed.pageContext?.path,
 parsed.learningContext?.labSlug,
 );

 const citations = ragResults.map((r) => ({
 title: r.chunk.sectionTitle,
 courseTitle: r.chunk.courseTitle,
 route: r.chunk.verifiedRoute,
 score: r.score,
 }));

 // Support real-time streaming response if requested by client
 if (parsed.stream) {
 const encoder = new TextEncoder();
 const words = enhancedReply.split(" ");
 const readable = new ReadableStream({
 async start(controller) {
 try {
 for (let i = 0; i < words.length; i++) {
 const chunk = (i === 0 ? "" : " ") + words[i];
 controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
 await new Promise((r) => setTimeout(r, 14));
 }
 controller.enqueue(
 encoder.encode(`data: ${JSON.stringify({ done: true, followUps, citations })}\n\n`),
 );
 controller.close();
 } catch (streamErr) {
 controller.error(streamErr);
 }
 },
 });

 return new Response(readable, {
 headers: {
 "Content-Type": "text/event-stream",
 "Cache-Control": "no-cache",
 Connection: "keep-alive",
 },
 });
 }

 return json({ reply: enhancedReply, followUps, citations });
 } catch (e) {
 console.error("[/api/chat]", e);
 return json({ error: (e as Error).message }, 500);
 }
 },
 },
 },
});
