import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Lock, PlayCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/learn/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — NISQ Vanguard` },
      { name: "description", content: "Course modules on NISQ Vanguard cybersecurity learning platform." },
    ],
  }),
  component: CoursePage,
  errorComponent: ({ error }) => <div className="pt-24 px-4 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="pt-24 px-4 text-center">Course not found.</div>,
});

function CoursePage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [showUpsell, setShowUpsell] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("id,slug,title,description,level,tier").eq("slug", slug).maybeSingle();
      if (!data) throw notFound();
      return data;
    },
  });

  const { data: modules } = useQuery({
    queryKey: ["modules", course?.id],
    queryFn: async () => {
      const { data } = await supabase.from("modules").select("id,slug,title,sort_order,locked,notes_md").eq("course_id", course!.id).order("sort_order");
      return data ?? [];
    },
    enabled: !!course,
  });

  const { data: progress } = useQuery({
    queryKey: ["progress", user?.id, course?.id],
    queryFn: async () => {
      const { data } = await supabase.from("module_progress").select("module_id,completed").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user && !!course,
  });

  if (isLoading) return <main className="pt-24 px-4 text-muted-foreground">Loading…</main>;
  if (!course) return null;

  const completedIds = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.module_id));
  const pct = modules && modules.length ? Math.round((completedIds.size / modules.length) * 100) : 0;
  const isPaid = course.tier === "paid";

  return (
    <main className="pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/learn" className="mono text-[0.6rem] text-muted-foreground hover:text-cyber inline-flex items-center gap-1 mb-4"><ArrowLeft className="w-3 h-3" /> ALL COURSES</Link>
        <div className="mono text-xs text-cyber mb-2">// {course.level.toUpperCase()} · {isPaid ? "PREMIUM" : "FREE"}</div>
        <h1 className="display text-4xl md:text-5xl mb-3">{course.title}</h1>
        <p className="text-muted-foreground mb-6 max-w-2xl">{course.description}</p>

        {user && !isPaid && (
          <div className="glass rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="mono text-[0.6rem] text-muted-foreground">PROGRESS</span>
              <span className="mono text-[0.6rem] text-cyber">{pct}%</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary glow-cyber transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div className="space-y-2">
          {(modules ?? []).map((m, i) => {
            const done = completedIds.has(m.id);
            const locked = m.locked || isPaid;
            const inner = (
              <div className="glass rounded-lg p-4 flex items-center gap-4 hover:glow-cyber transition">
                <div className="mono text-[0.6rem] text-muted-foreground w-6">{String(i + 1).padStart(2, "0")}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{m.title}</div>
                  <div className="mono text-[0.55rem] text-muted-foreground line-clamp-1">{m.notes_md?.slice(0, 90)}</div>
                </div>
                {locked ? <Lock className="w-5 h-5 text-accent" /> :
                 done ? <CheckCircle2 className="w-5 h-5 text-success" /> :
                 <PlayCircle className="w-5 h-5 text-cyber" />}
              </div>
            );
            if (locked) {
              return <button key={m.id} onClick={() => setShowUpsell(true)} className="w-full text-left">{inner}</button>;
            }
            if (!user) {
              return <Link key={m.id} to="/auth" search={{ next: `/learn/${slug}/${m.slug}` }}>{inner}</Link>;
            }
            return <Link key={m.id} to="/learn/$slug/$moduleSlug" params={{ slug, moduleSlug: m.slug }}>{inner}</Link>;
          })}
        </div>
      </div>

      {showUpsell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowUpsell(false)}>
          <div className="glass rounded-2xl p-8 max-w-md w-full glow-cyber" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl mb-2">🔒</div>
            <h3 className="display text-2xl text-cyber mb-2">Unlock Practical Cybersecurity Skills</h3>
            <p className="text-sm text-muted-foreground mb-6">Upgrade to access real tools & hacking labs. Payments launching soon — join the waitlist.</p>
            <button onClick={() => setShowUpsell(false)} className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-md mono text-xs">GOT IT</button>
          </div>
        </div>
      )}
    </main>
  );
}
