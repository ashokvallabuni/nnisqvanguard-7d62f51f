import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Leadership Team — NISQ Vanguard Defence Technologies" },
      {
        name: "description",
        content:
          "Meet the NISQ Vanguard leadership team: Ashok Vallabhuni (Founder · Chief Architect), Varun Gajula (Co-Founder), and Sannith Reddy (CPO · Product Marketer).",
      },
    ],
  }),
  component: Team,
});

type Member = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
};

const APPROVED_PUBLIC_TEAM: ReadonlyArray<{ name: string; role: string }> = [
  { name: "Ashok Vallabhuni", role: "Founder · Chief Architect" },
  { name: "Varun Gajula", role: "Co-Founder" },
  { name: "Sannith Reddy", role: "CPO · Product Marketer" },
] as const;

const REMOVED_PUBLIC_NAMES = new Set(["Sai Tanaku", "Pulijala Bhavani", "Bhavani Pulijala"]);

const normalize = (value: string) => value.replace(/\s+/g, " ").trim().toLowerCase();

function resolveTitle(dbName: string, dbRole: string | null | undefined): string {
  const override = APPROVED_PUBLIC_TEAM.find((m) => normalize(m.name) === normalize(dbName));
  if (override) return override.role;
  return dbRole ?? "";
}

function filterPublic(members: Member[]): Member[] {
  const normalizedAllowed = new Set(APPROVED_PUBLIC_TEAM.map((m) => normalize(m.name)));
  return members
    .filter((m) => {
      const n = normalize(m.name);
      if (REMOVED_PUBLIC_NAMES.has(m.name)) return false;
      if (REMOVED_PUBLIC_NAMES.has(n)) return false;
      if (normalizedAllowed.has(n)) return true;
      return false;
    })
    .map((m) => ({
      ...m,
      role: resolveTitle(m.name, m.role),
    }))
    .sort(
      (a, b) =>
        APPROVED_PUBLIC_TEAM.findIndex((p) => normalize(p.name) === normalize(a.name)) -
        APPROVED_PUBLIC_TEAM.findIndex((p) => normalize(p.name) === normalize(b.name)),
    );
}

function Team() {
  const { data } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const { data } = await supabase.from("team_members").select("*").order("display_order");
      const raw = (data ?? []) as Member[];
      const filteredDb = filterPublic(raw);
      if (filteredDb.length === 0) {
        return APPROVED_PUBLIC_TEAM.map((m, i) => ({
          id: `approved-${i}`,
          name: m.name,
          role: m.role,
          bio: null,
          image_url: null,
        })) as Member[];
      }
      return filteredDb;
    },
  });

  return (
    <main className="pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mono text-xs text-cyber mb-2">// PEOPLE · NISQ VANGUARD LEADERSHIP</div>
        <h1 className="display text-4xl md:text-5xl mb-4">Leadership Team</h1>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          The cybersecurity strategists, educators, and product leaders building accessible,
          practical, and impactful defence education across India.
        </p>
        {!data || data.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center text-muted-foreground">
            Team members will appear here once added by an administrator.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {data.map((m) => (
              <div key={m.id} className="glass rounded-xl p-6 hover:glow-cyber transition">
                <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/40 mx-auto flex items-center justify-center overflow-hidden mb-4">
                  {m.image_url ? (
                    <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-cyber" />
                  )}
                </div>
                <h3 className="display text-xl text-center">{m.name}</h3>
                <div className="mono text-[0.65rem] text-cyber text-center mb-3 tracking-wide uppercase">
                  {m.role}
                </div>
                {m.bio && <p className="text-sm text-muted-foreground text-center">{m.bio}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
