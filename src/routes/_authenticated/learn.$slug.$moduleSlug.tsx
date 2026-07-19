import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/learn/$slug/$moduleSlug")({
  head: ({ params }) => ({ meta: [{ title: `${params.moduleSlug.replace(/-/g, " ")} — NISQ Vanguard` }] }),
  component: ModulePage,
});

function ModulePage() {
  const { slug, moduleSlug } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: mod, isLoading } = useQuery({
    queryKey: ["module", slug, moduleSlug],
    queryFn: async () => {
      const { data: course } = await supabase.from("courses").select("id,title,tier").eq("slug", slug).maybeSingle();
      if (!course) return null;
      const { data: m } = await supabase.from("modules").select("id,title,notes_md,video_url,locked,sort_order").eq("course_id", course.id).eq("slug", moduleSlug).maybeSingle();
      return m ? { ...m, course } : null;
    },
  });

  const { data: prog } = useQuery({
    queryKey: ["mod-prog", user?.id, mod?.id],
    queryFn: async () => {
      const { data } = await supabase.from("module_progress").select("completed").eq("user_id", user!.id).eq("module_id", mod!.id).maybeSingle();
      return data;
    },
    enabled: !!user && !!mod,
  });

  if (isLoading) return <main className="pt-24 px-4">Loading…</main>;
  if (!mod) return <main className="pt-24 px-4">Module not found.</main>;
  if (mod.locked || mod.course.tier === "paid") {
    return <main className="pt-24 px-4 text-center"><div className="glass rounded-xl p-8 max-w-md mx-auto"><div className="text-3xl mb-2">🔒</div><p>This module is locked. Upgrade coming soon.</p></div></main>;
  }

  const markComplete = async () => {
    if (!user) return;
    const { error } = await supabase.from("module_progress").upsert(
      { user_id: user.id, module_id: mod.id, completed: true, completed_at: new Date().toISOString() },
      { onConflict: "user_id,module_id" },
    );
    if (error) { toast.error(error.message); return; }
    toast.success("Module completed");
    qc.invalidateQueries({ queryKey: ["mod-prog"] });
    qc.invalidateQueries({ queryKey: ["progress"] });
  };

  return (
    <main className="pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/learn/$slug" params={{ slug }} className="mono text-[0.6rem] text-muted-foreground hover:text-cyber inline-flex items-center gap-1 mb-4"><ArrowLeft className="w-3 h-3" /> {mod.course.title.toUpperCase()}</Link>
        <h1 className="display text-3xl md:text-4xl mb-4">{mod.title}</h1>

        <div className="aspect-video glass rounded-xl overflow-hidden mb-6 flex items-center justify-center">
          {mod.video_url ? (
            <video src={mod.video_url} controls className="w-full h-full" />
          ) : (
            <div className="text-center p-6">
              <div className="mono text-[0.6rem] text-muted-foreground">VIDEO PLACEHOLDER</div>
              <div className="text-sm text-muted-foreground mt-1">Video content coming soon</div>
            </div>
          )}
        </div>

        <section className="glass rounded-xl p-6 mb-6">
          <div className="mono text-[0.6rem] text-cyber mb-2">// NOTES</div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{mod.notes_md ?? "Notes coming soon."}</div>
        </section>

        <button onClick={markComplete} disabled={prog?.completed} className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold mono text-xs disabled:opacity-60 inline-flex items-center justify-center gap-2">
          {prog?.completed ? <><CheckCircle2 className="w-4 h-4" /> COMPLETED</> : "MARK AS COMPLETE"}
        </button>
      </div>
    </main>
  );
}
