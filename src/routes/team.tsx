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
          "Meet the NISQ Vanguard leadership team: Ashok Vallabhuni, Varun Gajula, Sai Tanaku, Sannith Reddy, and Chitireddy Janaki Raghu Rami Reddy.",
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
  { name: "Sai Tanaku", role: "Chief Technology Officer" },
  { name: "Sannith Reddy", role: "Product Manager" },
  { name: "Chitireddy Janaki Raghu Rami Reddy", role: "Chief Technology Officer" },
] as const;

const REMOVED_PUBLIC_NAMES = new Set(["Pulijala Bhavani", "Bhavani Pulijala"]);

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

function TeamMemberCard({ member }: { member: Member }) {
  return (
    <div className="glass flex flex-col items-center rounded-xl p-6 hover:glow-cyber transition h-full text-center">
      <div className="w-24 h-24 shrink-0 rounded-full bg-primary/10 border border-primary/40 mx-auto flex items-center justify-center overflow-hidden mb-4">
        {member.image_url ? (
          <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-10 h-10 text-cyber" />
        )}
      </div>
      <h3 className="display text-xl text-foreground mb-1 break-words w-full">{member.name}</h3>
      <div className="mono text-[0.65rem] text-primary mb-3 tracking-wide uppercase break-words w-full">
        {member.role}
      </div>
      {member.bio && (
        <p className="text-sm text-muted-foreground mt-auto pt-4 border-t border-border/50">
          {member.bio}
        </p>
      )}
    </div>
  );
}

function Team() {
  const { data } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const { data } = await supabase.from("team_members").select("*").order("display_order");
      const raw = (data ?? []) as Member[];
      const filteredDb = filterPublic(raw);

      const missingMembers = APPROVED_PUBLIC_TEAM.filter(
        (approved) =>
          !filteredDb.some((dbMember) => normalize(dbMember.name) === normalize(approved.name)),
      ).map((m, i) => ({
        id: `approved-missing-${i}`,
        name: m.name,
        role: m.role,
        bio: null,
        image_url: null,
      })) as Member[];

      return [...filteredDb, ...missingMembers];
    },
  });

  return (
    <main className="pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mono text-xs text-primary mb-2">// PEOPLE · NISQ VANGUARD LEADERSHIP</div>
        <h1 className="display text-4xl md:text-5xl mb-4 text-foreground">Leadership Team</h1>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          The cybersecurity strategists, educators, and product leaders building accessible,
          practical, and impactful defence education across India.
        </p>
        {!data || data.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center text-muted-foreground">
            Team members will appear here once added by an administrator.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.map((m) => (
              <TeamMemberCard key={m.id} member={m} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
