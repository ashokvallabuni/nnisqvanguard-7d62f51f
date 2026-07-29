import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { clientKey, getAuth, json, logEvent, rateLimit } from "@/lib/api-helpers.server";
import { runFullAnalysis, runQuickAnalysis } from "@/lib/agents/orchestrator";
import type { RiskLevel } from "@/lib/agents/types";

const AnalyzeBody = z.object({
  type: z.enum(["security_event", "url", "file_hash", "ip_address", "domain", "log_entry", "chat_query"]),
  data: z.string().trim().min(1).max(50000),
  mode: z.enum(["full", "quick"]).optional().default("quick"),
  metadata: z.record(z.unknown()).optional(),
});

// Helper to convert RiskLevel to the subset logEvent accepts
function toLogRiskLevel(level: RiskLevel | undefined): "Low" | "Medium" | "High" | "Unknown" {
  if (level === "Critical") return "High";
  if (level === "Low" || level === "Medium" || level === "High") return level;
  return "Unknown";
}

export const Route = createFileRoute("/api/agents/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ctx = await getAuth(request);
        if (!rateLimit("agent-analyze:" + clientKey(request, ctx.userId), 10, 60_000)) {
          return json({ error: "Rate limit exceeded. Try again in a minute." }, 429);
        }

        let parsed;
        try {
          parsed = AnalyzeBody.parse(await request.json());
        } catch (e) {
          return json({ error: "Invalid input", details: (e as Error).message }, 400);
        }

        try {
          if (parsed.mode === "full") {
            const result = await runFullAnalysis({
              type: parsed.type,
              data: parsed.data,
              metadata: parsed.metadata,
            });

            await logEvent(
              ctx,
              "chat",
              "agent_analyze:" + parsed.type,
              { mode: parsed.mode, status: result.status },
              toLogRiskLevel(result.risk?.severity)
            );

            return json({
              success: true,
              mode: parsed.mode,
              result,
              timestamp: new Date().toISOString(),
            });
          } else {
            const result = await runQuickAnalysis(parsed.data);

            await logEvent(
              ctx,
              "chat",
              "agent_analyze:" + parsed.type,
              { mode: parsed.mode, riskScore: result.risk.riskScore },
              toLogRiskLevel(result.risk.severity)
            );

            return json({
              success: true,
              mode: parsed.mode,
              result,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.error("[/api/agents/analyze]", e);
          return json({ error: (e as Error).message }, 500);
        }
      },
    },
  },
});

