import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Our Team — CyberShield India" }, { name: "description", content: "Meet the cyber experts behind CyberShield India." }] }),
  component: Team,
});

type Member = { id: string; name: string; role: string; bio: string | null; image_url: string | null };

function Team() {
  const { data } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const { data } = await supabase.from("team_members").select("*").order("display_order");
      return (data ?? []) as Member[];
    },
  });

  return (
    <main className="pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mono text-xs text-cyber mb-2">// PEOPLE</div>
        <h1 className="display text-4xl md:text-5xl mb-4">Our Team</h1>
        <p className="text-muted-foreground mb-10 max-w-2xl">The cybersecurity experts, educators, and technologists safeguarding India's digital future.</p>
        {(!data || data.length === 0) ? (
          <div className="glass rounded-xl p-12 text-center text-muted-foreground">Team members will appear here once added by an administrator.</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {data.map((m) => (
              <div key={m.id} className="glass rounded-xl p-6 hover:glow-cyber transition">
                <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/40 mx-auto flex items-center justify-center overflow-hidden mb-4">
                  {m.image_url ? <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-cyber" />}
                </div>
                <h3 className="display text-xl text-center">{m.name}</h3>
                <div className="mono text-[0.6rem] text-cyber text-center mb-3">{m.role}</div>
                {m.bio && <p className="text-sm text-muted-foreground text-center">{m.bio}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
