import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getAuth, json, rateLimit, clientKey } from "@/lib/api-helpers.server";

const Body = z.object({ answers: z.array(z.number().int()).min(1).max(50) });

type QuizItem = { question: string; options: string[]; answer: number; explanation?: string };

export const Route = createFileRoute("/api/quiz/$moduleId")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const ctx = await getAuth(request);
        if (!ctx.supabase || !ctx.userId) return json({ error: "Unauthorized" }, 401);
        if (!rateLimit(`quiz:${clientKey(request, ctx.userId)}`, 30, 60_000)) {
          return json({ error: "Rate limited" }, 429);
        }

        let parsed;
        try {
          parsed = Body.parse(await request.json());
        } catch (e) {
          return json({ error: (e as Error).message }, 400);
        }

        const { data: mod, error } = await ctx.supabase
          .from("modules")
          .select("id,quiz,course_id,locked")
          .eq("id", params.moduleId)
          .maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!mod) return json({ error: "Module not found" }, 404);
        if (mod.locked) return json({ error: "Module locked" }, 403);

        const quiz = Array.isArray(mod.quiz) ? (mod.quiz as unknown as QuizItem[]) : [];
        if (quiz.length === 0) return json({ error: "No quiz for this module" }, 400);

        const results = quiz.map((q, i) => {
          const chosen = parsed.answers[i];
          const correct = chosen === q.answer;
          return {
            question: q.question,
            chosen,
            correct_answer: q.answer,
            correct,
            explanation: q.explanation ?? null,
          };
        });
        const correctCount = results.filter((r) => r.correct).length;
        const score = Math.round((correctCount / quiz.length) * 100);
        const passed = score >= 70;

        const { error: upErr } = await ctx.supabase.from("module_progress").upsert(
          {
            user_id: ctx.userId,
            module_id: mod.id,
            quiz_score: score,
            completed: passed,
            completed_at: passed ? new Date().toISOString() : null,
          },
          { onConflict: "user_id,module_id" },
        );
        if (upErr) return json({ error: upErr.message }, 500);

        return json({ score, passed, total: quiz.length, correct: correctCount, results });
      },
    },
  },
});
