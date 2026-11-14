import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getAuth, json, rateLimit, clientKey } from "@/lib/api-helpers.server";

const PostBody = z.object({
  module_id: z.string().uuid(),
  completed: z.boolean().optional(),
});

export const Route = createFileRoute("/api/progress")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const ctx = await getAuth(request);
          if (!ctx.supabase || !ctx.userId) return json({ error: "Unauthorized" }, 401);
          const url = new URL(request.url);
          const courseSlug = url.searchParams.get("course");

          let moduleIds: string[] | null = null;
          if (courseSlug) {
            const { data: course } = await ctx.supabase
              .from("courses")
              .select("id")
              .eq("slug", courseSlug)
              .maybeSingle();
            if (!course) return json({ error: "Course not found" }, 404);
            const { data: mods } = await ctx.supabase
              .from("modules")
              .select("id")
              .eq("course_id", course.id);
            moduleIds = (mods ?? []).map((m) => m.id);
          }

          let q = ctx.supabase
            .from("module_progress")
            .select("module_id,completed,quiz_score,completed_at")
            .eq("user_id", ctx.userId);
          if (moduleIds) q = q.in("module_id", moduleIds);
          const { data, error } = await q;
          if (error) {
            console.error("Progress fetch error:", error);
            return json({ error: "Failed to retrieve module progress." }, 500);
          }
          return json({ progress: data ?? [] });
        } catch (err) {
          console.error("Progress GET unhandled error:", err);
          return json({ error: "Internal server error." }, 500);
        }
      },

      POST: async ({ request }) => {
        try {
          const ctx = await getAuth(request);
          if (!ctx.supabase || !ctx.userId) return json({ error: "Unauthorized" }, 401);
          if (!rateLimit(`prog:${clientKey(request, ctx.userId)}`, 60, 60_000)) {
            return json({ error: "Rate limited" }, 429);
          }
          let body;
          try {
            body = PostBody.parse(await request.json());
          } catch {
            return json({ error: "Invalid progress request data." }, 400);
          }
          const patch = {
            user_id: ctx.userId,
            module_id: body.module_id,
            ...(typeof body.completed === "boolean"
              ? {
                  completed: body.completed,
                  completed_at: body.completed ? new Date().toISOString() : null,
                }
              : {}),
          };

          const { data, error } = await ctx.supabase
            .from("module_progress")
            .upsert(patch, { onConflict: "user_id,module_id" })
            .select("module_id,completed,quiz_score,completed_at")
            .maybeSingle();
          if (error) {
            console.error("Progress upsert error:", error);
            return json({ error: "Failed to update module progress." }, 500);
          }
          return json({ progress: data });
        } catch (err) {
          console.error("Progress POST unhandled error:", err);
          return json({ error: "Internal server error." }, 500);
        }
      },
    },
  },
});
