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
  stream: z.boolean().optional(),
});

function generateContextualFollowUps(query: string, pagePath?: string): string[] {
  const q = query.toLowerCase();
  const path = pagePath?.toLowerCase() || "";

  if (q.includes("lab") || path.includes("cyber-range")) {
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

  if (path.includes("campus")) {
    return [
      "How do colleges partner with NISQ Vanguard?",
      "What student cohort tiers are available?",
      "How do campus workshops work?",
    ];
  }

  return [
    "Tell me about IVVAB LABS",
    "Which Academy course should I start with?",
    "Explain the CIA Triad in simple terms",
  ];
}

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
            const contextAddendum = parsed.pageContext?.path
              ? `\n\n[Active Page Context: User is viewing "${parsed.pageContext.path}"${
                  parsed.pageContext.title ? ` (${parsed.pageContext.title})` : ""
                }]`
              : "";

            const messages = [
              { role: "system" as const, content: IVVAB_SYSTEM_PROMPT + contextAddendum },
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

          const followUps = generateContextualFollowUps(parsed.message, parsed.pageContext?.path);

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
                    encoder.encode(`data: ${JSON.stringify({ done: true, followUps })}\n\n`),
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

          return json({ reply: enhancedReply, followUps });
        } catch (e) {
          console.error("[/api/chat]", e);
          return json({ error: (e as Error).message }, 500);
        }
      },
    },
  },
});
