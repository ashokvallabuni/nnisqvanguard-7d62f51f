import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  callChatModel,
  clientKey,
  getAuth,
  json,
  logEvent,
  NISQ_SYSTEM_PROMPT,
  rateLimit,
} from "@/lib/api-helpers.server";
import { handleSecurityChatQuery, formatAnalysisSummary } from "@/lib/agents/orchestrator";

const Body = z.object({
  message: z.string().trim().min(1).max(4000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(20)
    .optional(),
});

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ctx = await getAuth(request);
        if (!rateLimit(`chat:${clientKey(request, ctx.userId)}`, 20, 60_000)) {
          return json({ error: "Rate limit exceeded. Try again in a minute." }, 429);
        }
        let parsed;
        try {
          parsed = Body.parse(await request.json());
        } catch (e) {
          return json({ error: "Invalid input", details: (e as Error).message }, 400);
        }
        try {
          // Run through multi-agent orchestrator for security-related queries
          const { reply, analysis } = await handleSecurityChatQuery(
            parsed.message,
            undefined, // No pre-existing threat context
          );

          // If agents found threats, include analysis summary in response
          let enhancedReply = reply;
          if (analysis && analysis.detection && analysis.detection.findings.length > 0) {
            const summary = formatAnalysisSummary(analysis);
            enhancedReply = reply + "\n\n---\n" + summary;
          }

          // Fallback to standard chat if orchestrator didn't enhance
          if (enhancedReply === reply && !analysis) {
            const messages = [
              { role: "system" as const, content: NISQ_SYSTEM_PROMPT },
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
            await ctx.supabase.from("chat_history").insert({
              user_id: ctx.userId,
              message: parsed.message,
              reply: enhancedReply,
            });

            // Save analysis to database if available
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
          }

          await logEvent(
            ctx,
            "chat",
            parsed.message,
            { reply_length: enhancedReply.length, agent_analysis: analysis ? true : false },
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
          return json({ reply: enhancedReply });
        } catch (e) {
          console.error("[/api/chat]", e);
          return json({ error: (e as Error).message }, 500);
        }
      },
    },
  },
});
