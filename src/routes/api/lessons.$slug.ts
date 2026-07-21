import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { json } from "@/lib/api-helpers.server";

function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const isNew = key.startsWith("sb_publishable_") || key.startsWith("sb_secret_");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (isNew && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const Route = createFileRoute("/api/lessons/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const supabase = publicClient();
        const { data: course, error: cErr } = await supabase
          .from("courses")
          .select("id,slug,title,description,level,tier,sort_order")
          .eq("slug", params.slug)
          .maybeSingle();
        if (cErr) return json({ error: cErr.message }, 500);
        if (!course) return json({ error: "Course not found" }, 404);

        const { data: modules, error: mErr } = await supabase
          .from("modules")
          .select("id,slug,title,video_url,notes_md,practice_md,quiz,sort_order,locked")
          .eq("course_id", course.id)
          .order("sort_order");
        if (mErr) return json({ error: mErr.message }, 500);

        // Strip quiz answers from the list view
        const safeModules = (modules ?? []).map((m) => ({
          ...m,
          quiz: Array.isArray(m.quiz) ? (m.quiz as unknown[]).length : m.quiz ? 1 : 0,
        }));
        return json({ course, modules: safeModules });
      },
    },
  },
});
