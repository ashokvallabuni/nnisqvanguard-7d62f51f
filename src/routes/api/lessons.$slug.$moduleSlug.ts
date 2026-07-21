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

type QuizItem = { question: string; options: string[]; answer: number; explanation?: string };

export const Route = createFileRoute("/api/lessons/$slug/$moduleSlug")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const url = new URL(request.url);
        const withAnswers = url.searchParams.get("answers") === "1";
        const supabase = publicClient();

        const { data: course } = await supabase
          .from("courses")
          .select("id,slug,title,tier")
          .eq("slug", params.slug)
          .maybeSingle();
        if (!course) return json({ error: "Course not found" }, 404);

        const { data: mod, error } = await supabase
          .from("modules")
          .select("id,slug,title,video_url,notes_md,practice_md,quiz,sort_order,locked")
          .eq("course_id", course.id)
          .eq("slug", params.moduleSlug)
          .maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!mod) return json({ error: "Module not found" }, 404);
        if (mod.locked || course.tier === "paid") return json({ error: "Module locked" }, 403);

        const quiz = Array.isArray(mod.quiz) ? (mod.quiz as unknown as QuizItem[]) : [];
        const safeQuiz = withAnswers
          ? quiz
          : quiz.map((q) => ({ question: q.question, options: q.options }));

        return json({
          course,
          module: {
            id: mod.id,
            slug: mod.slug,
            title: mod.title,
            video_url: mod.video_url,
            notes_md: mod.notes_md,
            practice_md: mod.practice_md,
            quiz: safeQuiz,
          },
        });
      },
    },
  },
});
