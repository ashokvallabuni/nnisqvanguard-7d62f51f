import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { callChatModel, clientKey, getAuth, json, logEvent, NISQ_SYSTEM_PROMPT, rateLimit } from "@/lib/api-helpers.server";

const Body = z.object({
  message: z.string().trim().min(1).max(4000),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) })).max(20).optional(),
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
          const messages = [
            { role: "system", content: NISQ_SYSTEM_PROMPT },
            ...(parsed.history ?? []),
            { role: "user", content: parsed.message },
          ];
          const reply = await callChatModel(messages);
          if (ctx.supabase && ctx.userId) {
            await ctx.supabase.from("chat_history").insert({
              user_id: ctx.userId,
              message: parsed.message,
              reply,
            });
          }
          await logEvent(ctx, "chat", parsed.message, { reply }, "Unknown");
          return json({ reply });
        } catch (e) {
          console.error("[/api/chat]", e);
          return json({ error: (e as Error).message }, 500);
        }
      },
    },
  },
});
