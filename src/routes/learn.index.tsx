import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Lock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "Cybersecurity Courses — NISQ Vanguard" },
      {
        name: "description",
        content: "Explore cybersecurity courses, foundations, and practical defensive learning.",
      },
    ],
  }),
  component: LearnIndex,
});

function LearnIndex() {
  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data: phase, error: phaseError } = await supabase
        .from("learning_phases")
        .select("id")
        .eq("slug", "cybersecurity")
        .maybeSingle();
      if (phaseError) throw new Error(phaseError.message);
      if (!phase) return [];
      const { data, error } = await supabase
        .from("courses")
        .select("id,slug,title,description,level,tier,sort_order")
        .eq("phase_id", phase.id)
        .order("sort_order");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
  const { data: aiCourses, isLoading: aiLoading } = useQuery({
    queryKey: ["academy-ai-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_courses")
        .select("id,slug,title,description,level,duration,learning_objectives")
        .eq("is_published", true)
        .eq("is_available", true)
        .order("display_order");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  return (
    <main className="pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mono text-xs text-cyber mb-2">// LEARNING TRACKS</div>
        <h1 className="display text-4xl md:text-5xl mb-3">Cybersecurity & Defence Technologies</h1>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          A dedicated cybersecurity catalog for foundations, defensive practice, and safe learning
          labs. Explore the independent AI division from the Academy navigation.
        </p>

        <div className="mb-5 flex items-center justify-between">
          <h2 className="display text-2xl">Cybersecurity Division</h2>
          <span className="mono text-[0.6rem] text-cyber">LEGACY CATALOG PRESERVED</span>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {(courses ?? []).map((c) => (
            <Link
              key={c.id}
              to="/learn/$slug"
              params={{ slug: c.slug }}
              className="glass rounded-xl p-6 hover:glow-cyber transition group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded bg-primary/10 border border-primary/40 flex items-center justify-center text-cyber">
                  {c.tier === "paid" ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <GraduationCap className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`mono text-[0.55rem] px-2 py-1 rounded border ${c.tier === "paid" ? "text-accent border-accent/40" : "text-success border-success/40"}`}
                >
                  {c.tier === "paid" ? "PREMIUM" : "FREE"}
                </span>
              </div>
              <div className="mono text-[0.55rem] text-muted-foreground mb-1">
                {c.level.toUpperCase()}
              </div>
              <h3 className="display text-2xl mb-2 group-hover:text-cyber transition">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.description}</p>
              <div className="mono text-[0.6rem] text-cyber mt-4">EXPLORE →</div>
            </Link>
          ))}
        </div>

        <section className="mt-14">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="mono text-xs text-cyber mb-2">// PHASE 1</div>
              <h2 className="display text-2xl">Artificial Intelligence & Emerging Technologies</h2>
            </div>
            <span className="mono text-[0.6rem] text-cyber">{aiCourses?.length ?? 0} COURSES</span>
          </div>
          {aiLoading ? (
            <div className="glass rounded-xl p-6 text-sm text-muted-foreground">Loading AI catalog…</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {(aiCourses ?? []).map((course) => (
                <Link
                  key={course.id}
                  to="/learn/$slug"
                  params={{ slug: course.slug }}
                  className="glass rounded-xl p-6 hover:glow-cyber transition group"
                >
                  <div className="mono text-[0.55rem] text-violet-300 mb-2">
                    {course.level.toUpperCase()} · {course.duration} MIN
                  </div>
                  <h3 className="display text-2xl mb-2 group-hover:text-cyber transition">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                  <div className="mt-4 mono text-[0.55rem] text-muted-foreground">
                    {course.learning_objectives.slice(0, 2).join(" · ")}
                  </div>
                  <div className="mono text-[0.6rem] text-cyber mt-4">OPEN DATABASE COURSE →</div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-16 glass rounded-2xl p-8">
          <h2 className="display text-2xl mb-4">Free vs Premium</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <div className="mono text-[0.6rem] text-success mb-2">FREE INCLUDES</div>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Cyber Awareness (5
                  modules)
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Cybersecurity
                  Foundations (5 modules)
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Progress tracking &
                  quizzes
                </li>
              </ul>
            </div>
            <div>
              <div className="mono text-[0.6rem] text-accent mb-2">PREMIUM ADDS (COMING SOON)</div>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <Lock className="w-4 h-4 text-accent shrink-0" /> Kali Linux, SQLi, and real
                  attack labs
                </li>
                <li className="flex gap-2">
                  <Lock className="w-4 h-4 text-accent shrink-0" /> PDF certificate on completion
                </li>
                <li className="flex gap-2">
                  <Lock className="w-4 h-4 text-accent shrink-0" /> Priority mentor support
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
