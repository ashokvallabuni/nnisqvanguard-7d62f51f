import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { clientKey, getAuth, json, logEvent, rateLimit } from "@/lib/api-helpers.server";
import { runFullAnalysis } from "@/lib/agents/orchestrator";
import { generateReport } from "@/lib/agents/report-agent";

const ReportBody = z.object({
  data: z.string().trim().min(1).max(50000),
  title: z.string().max(200).optional(),
  type: z
    .enum(["security_event", "url", "file_hash", "ip_address", "domain", "log_entry", "chat_query"])
    .optional()
    .default("security_event"),
  metadata: z.record(z.unknown()).optional(),
});

export const Route = createFileRoute("/api/agents/report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ctx = await getAuth(request);
        if (!rateLimit("agent-report:" + clientKey(request, ctx.userId), 5, 60_000)) {
          return json({ error: "Rate limit exceeded. Try again in a minute." }, 429);
        }

        let parsed;
        try {
          parsed = ReportBody.parse(await request.json());
        } catch (e) {
          return json({ error: "Invalid input", details: (e as Error).message }, 400);
        }

        try {
          // Run full analysis through all agents
          const analysis = await runFullAnalysis({
            type: parsed.type,
            data: parsed.data,
            metadata: parsed.metadata,
          });

          if (analysis.status === "failed") {
            return json({ error: "Analysis failed: " + (analysis.error || "Unknown error") }, 500);
          }

          // Generate the report
          const report = await generateReport(
            analysis.detection,
            analysis.analysis,
            analysis.risk,
            analysis.response,
          );

          const payload = {
            success: true,
            report: {
              ...report,
              title: parsed.title || report.title,
            },
            analysis: {
              requestId: analysis.requestId,
              status: analysis.status,
              riskScore: analysis.risk?.riskScore ?? 0,
              severity: analysis.risk?.severity ?? "Low",
              findingsCount: analysis.detection?.findings.length ?? 0,
            },
            timestamp: new Date().toISOString(),
          };

          await logEvent(
            ctx,
            "chat",
            "agent_report:" + parsed.type,
            { title: payload.report.title, riskScore: payload.analysis.riskScore },
            payload.analysis.severity as "Low" | "Medium" | "High" | "Unknown",
          );

          return json(payload);
        } catch (e) {
          console.error("[/api/agents/report]", e);
          return json({ error: (e as Error).message }, 500);
        }
      },
    },
  },
});
