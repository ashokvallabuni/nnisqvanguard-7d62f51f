import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/api-helpers.server";
import { handleResendWebhook } from "@/lib/certificates/email.server";

export const Route = createFileRoute("/api/webhooks/resend")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const payload = await request.text();
          const id = request.headers.get("webhook-id") || request.headers.get("svix-id") || undefined;
          const timestamp = request.headers.get("webhook-timestamp") || request.headers.get("svix-timestamp") || undefined;
          const signature = request.headers.get("webhook-signature") || request.headers.get("svix-signature") || undefined;

          const result = await handleResendWebhook({
            payload,
            headers: { id, timestamp, signature },
          });

          if (!result.verified) {
            return json({ error: "Invalid webhook signature" }, 401);
          }

          return json(result, 200);
        } catch (error: any) {
          console.error("[Resend Webhook Error]", error);
          return json({ error: error?.message || "Internal server error" }, 500);
        }
      },
    },
  },
});

