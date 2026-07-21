import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, CheckCircle2, PlayCircle, BookOpen, Wrench, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/learn/$slug/$moduleSlug")({
  head: ({ params }) => ({ meta: [{ title: `${params.moduleSlug.replace(/-/g, " ")} — NISQ Vanguard` }] }),
  component: ModulePage,
});

type Quiz = { question: string; options: string[] };
type Lesson = {
  course: { id: string; slug: string; title: string; tier: string };
  module: {
    id: string;
    slug: string;
    title: string;
    video_url: string | null;
    notes_md: string | null;
    practice_md: string | null;
    quiz: Quiz[];
  };
};
type GradeResult = {
  score: number;
  passed: boolean;
  results: Array<{ correct: boolean; answer: number; explanation?: string }>;
};

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function ModulePage() {
  const { slug, moduleSlug } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["lesson", slug, moduleSlug],
    queryFn: async (): Promise<Lesson> => {
      const res = await fetch(`/api/lessons/${slug}/${moduleSlug}`);
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load lesson");
      return res.json();
    },
  });

  const { data: prog } = useQuery({
    queryKey: ["mod-prog", user?.id, data?.module.id],
    queryFn: async () => {
      const { data: p } = await supabase
        .from("module_progress")
        .select("completed,quiz_score")
        .eq("user_id", user!.id)
        .eq("module_id", data!.module.id)
        .maybeSingle();
      return p;
    },
    enabled: !!user && !!data?.module.id,
  });

  if (isLoading) return <main className="pt-24 px-4">Loading…</main>;
  if (error) return <main className="pt-24 px-4 text-center">{(error as Error).message}</main>;
  if (!data) return <main className="pt-24 px-4">Module not found.</main>;

  const { course, module: mod } = data;

  const markComplete = async () => {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "content-type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ module_id: mod.id, completed: true }),
    });
    if (!res.ok) { toast.error("Failed to save progress"); return; }
    toast.success("Module completed");
    qc.invalidateQueries({ queryKey: ["mod-prog"] });
    qc.invalidateQueries({ queryKey: ["progress"] });
  };

  const submitQuiz = async () => {
    if (mod.quiz.length === 0) return;
    if (Object.keys(answers).length !== mod.quiz.length) {
      toast.error("Answer all questions");
      return;
    }
    setSubmitting(true);
    const arr = mod.quiz.map((_, i) => answers[i]);
    const res = await fetch(`/api/quiz/${mod.id}`, {
      method: "POST",
      headers: { "content-type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ answers: arr }),
    });
    setSubmitting(false);
    if (!res.ok) { toast.error("Quiz submission failed"); return; }
    const g = (await res.json()) as GradeResult;
    setGrade(g);
    qc.invalidateQueries({ queryKey: ["mod-prog"] });
    qc.invalidateQueries({ queryKey: ["progress"] });
    toast[g.passed ? "success" : "info"](`Score: ${g.score}%`);
  };

  return (
    <main className="pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/learn/$slug" params={{ slug }} className="mono text-[0.6rem] text-muted-foreground hover:text-cyber inline-flex items-center gap-1 mb-4">
          <ArrowLeft className="w-3 h-3" /> {course.title.toUpperCase()}
        </Link>
        <h1 className="display text-3xl md:text-4xl mb-4">{mod.title}</h1>

        {/* VIDEO */}
        <div className="aspect-video glass rounded-xl overflow-hidden mb-6 flex items-center justify-center">
          {mod.video_url ? (
            <video src={mod.video_url} controls className="w-full h-full" />
          ) : (
            <div className="text-center p-6">
              <PlayCircle className="w-10 h-10 text-cyber mx-auto mb-2" />
              <div className="mono text-[0.6rem] text-muted-foreground">VIDEO PLACEHOLDER</div>
              <div className="text-sm text-muted-foreground mt-1">Video content coming soon</div>
            </div>
          )}
        </div>

        {/* NOTES */}
        <section className="glass rounded-xl p-6 mb-6">
          <div className="mono text-[0.6rem] text-cyber mb-2 inline-flex items-center gap-2">
            <BookOpen className="w-3 h-3" /> // NOTES
          </div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {mod.notes_md ?? "Notes coming soon."}
          </div>
        </section>

        {/* PRACTICE */}
        {mod.practice_md && (
          <section className="glass rounded-xl p-6 mb-6 border border-primary/20">
            <div className="mono text-[0.6rem] text-cyber mb-2 inline-flex items-center gap-2">
              <Wrench className="w-3 h-3" /> // PRACTICE TASK
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {mod.practice_md}
            </div>
          </section>
        )}

        {/* QUIZ */}
        {mod.quiz.length > 0 && (
          <section className="glass rounded-xl p-6 mb-6">
            <div className="mono text-[0.6rem] text-cyber mb-4 inline-flex items-center gap-2">
              <HelpCircle className="w-3 h-3" /> // QUIZ
            </div>
            <div className="space-y-6">
              {mod.quiz.map((q, i) => {
                const r = grade?.results[i];
                return (
                  <div key={i}>
                    <div className="font-semibold mb-2">{i + 1}. {q.question}</div>
                    <div className="space-y-2">
                      {q.options.map((opt, j) => {
                        const selected = answers[i] === j;
                        const isCorrect = r && j === r.answer;
                        const isWrongPick = r && selected && !r.correct;
                        return (
                          <button
                            key={j}
                            disabled={!!grade}
                            onClick={() => setAnswers((a) => ({ ...a, [i]: j }))}
                            className={`w-full text-left px-3 py-2 rounded-md border text-sm transition ${
                              isCorrect ? "border-success bg-success/10 text-success" :
                              isWrongPick ? "border-destructive bg-destructive/10 text-destructive" :
                              selected ? "border-primary bg-primary/10" :
                              "border-border hover:border-primary/40"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {r?.explanation && (
                      <div className="mono text-[0.65rem] text-muted-foreground mt-2">→ {r.explanation}</div>
                    )}
                  </div>
                );
              })}
            </div>
            {!grade ? (
              <button onClick={submitQuiz} disabled={submitting} className="mt-6 w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold mono text-xs disabled:opacity-60">
                {submitting ? "GRADING…" : "SUBMIT QUIZ"}
              </button>
            ) : (
              <div className={`mt-6 p-4 rounded-md text-center mono text-sm ${grade.passed ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                SCORE: {grade.score}% · {grade.passed ? "PASSED" : "TRY AGAIN"}
                {!grade.passed && (
                  <button onClick={() => { setGrade(null); setAnswers({}); }} className="ml-3 underline">Retry</button>
                )}
              </div>
            )}
          </section>
        )}

        {/* COMPLETE */}
        <button onClick={markComplete} disabled={prog?.completed} className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold mono text-xs disabled:opacity-60 inline-flex items-center justify-center gap-2">
          {prog?.completed ? <><CheckCircle2 className="w-4 h-4" /> COMPLETED</> : "MARK AS COMPLETE"}
        </button>
      </div>
    </main>
  );
}
