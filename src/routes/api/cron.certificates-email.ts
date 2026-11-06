import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/api-helpers.server";
import { processQueuedCertificateEmailJobs } from "@/lib/certificates/email.server";

export const Route = createFileRoute("/api/cron/certificates-email")({
  server: {
    handlers: {
      GET: async ({ request }) => handleCron(request),
      POST: async ({ request }) => handleCron(request),
    },
  },
});

async function handleCron(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    // Protect endpoint if CRON_SECRET is configured
    if (expectedSecret) {
      const token = authHeader?.replace(/^Bearer\s+/i, "");
      if (token !== expectedSecret) {
        return json({ error: "Unauthorized: Invalid CRON_SECRET" }, 401);
      }
    }

    const result = await processQueuedCertificateEmailJobs({
      batchSize: 10,
      timeoutSeconds: 300,
    });

    return json({
      ok: true,
      timestamp: new Date().toISOString(),
      ...result,
    }, 200);
  } catch (error: any) {
    console.error("[Cron Certificate Email Error]", error);
    return json({ error: error?.message || "Internal server error" }, 500);
  }
}

