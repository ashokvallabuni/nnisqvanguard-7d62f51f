import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Lock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "Learn Cybersecurity — NISQ Vanguard" },
      {
        name: "description",
        content:
          "Start free with Cyber Awareness and Cybersecurity Foundations. Upgrade for hands-on ethical hacking labs.",
      },
    ],
  }),
  component: LearnIndex,
});

function LearnIndex() {
  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data } = await supabase
        .from("courses")
        .select("id,slug,title,description,level,tier,sort_order")
        .order("sort_order");
      return data ?? [];
    },
  });

  return (
    <main className="pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mono text-xs text-cyber mb-2">// LEARNING TRACKS</div>
        <h1 className="display text-4xl md:text-5xl mb-3">Learn Cybersecurity from Scratch</h1>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          Start FREE with awareness and foundations. Upgrade when you're ready for hands-on
          offensive security labs.
        </p>

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
