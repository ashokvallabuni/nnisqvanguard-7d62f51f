import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { json } from "@/lib/api-helpers.server";

function publicClient() {
  const url =
    process.env.SUPABASE_URL ||
    (import.meta.env && (import.meta.env.VITE_SUPABASE_URL as string | undefined)) ||
    "";
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    (import.meta.env &&
      ((import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
        (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined))) ||
    "";
  if (!url || !key) {
    const missing = [
      ...(!url ? ["SUPABASE_URL / VITE_SUPABASE_URL"] : []),
      ...(!key ? ["SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_ANON_KEY"] : []),
    ];
    throw new Error(`Missing Supabase environment variable(s): ${missing.join(", ")}`);
  }
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
          .select("id,slug,title,description,level,tier,sort_order,status")
          .eq("slug", params.slug)
          .maybeSingle();
        if (cErr) return json({ error: cErr.message }, 500);
        if (!course) return json({ error: "Course not found" }, 404);

        const status = (course.status || "").trim().toLowerCase();
        if (status !== "published" && status !== "public" && status !== "live") {
          return json(
            {
              error:
                "This course is currently locked. It can only be made accessible when published from the Admin Console.",
              isLocked: true,
            },
            403,
          );
        }

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
