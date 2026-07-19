import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { ScanSearch, AlertTriangle, GraduationCap, BookOpen, Lock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My Account — CyberShield India" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, profile } = useAuth();
  const { data: bookings } = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("bookings").select("id,topic,program_type,status,preferred_date,created_at").order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });
  const { data: complaints } = useQuery({
    queryKey: ["my-complaints", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("complaints").select("id,complaint_text,verdict,fraud_score,status,created_at").order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <main className="pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mono text-xs text-cyber mb-2">// PERSONAL CONSOLE</div>
        <h1 className="display text-4xl mb-2">Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}</h1>
        <p className="text-muted-foreground mb-8 mono text-xs">{user?.email || user?.phone}</p>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <QuickCard to="/fraud-check" icon={<ScanSearch className="w-5 h-5" />} label="Scan Screenshot" />
          <QuickCard to="/complaint" icon={<AlertTriangle className="w-5 h-5" />} label="File Complaint" />
          <QuickCard to="/programs" icon={<GraduationCap className="w-5 h-5" />} label="Book Program" />
        </div>

        <section className="mb-10">
          <h2 className="display text-2xl mb-3">My Bookings</h2>
          <div className="glass rounded-xl overflow-hidden">
            {(!bookings || bookings.length === 0) ? (
              <div className="p-6 text-muted-foreground text-sm">No bookings yet.</div>
            ) : bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-4 py-3 border-b border-border/30 last:border-0">
                <div>
                  <div className="text-sm font-semibold">{b.topic}</div>
                  <div className="mono text-[0.6rem] text-muted-foreground">{b.program_type} · {b.preferred_date ?? "no date"}</div>
                </div>
                <StatusPill s={b.status} />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="display text-2xl mb-3">My Complaints</h2>
          <div className="glass rounded-xl overflow-hidden">
            {(!complaints || complaints.length === 0) ? (
              <div className="p-6 text-muted-foreground text-sm">No complaints yet.</div>
            ) : complaints.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3 border-b border-border/30 last:border-0">
                <div className="min-w-0 pr-3">
                  <div className="text-sm truncate">{c.complaint_text}</div>
                  <div className="mono text-[0.6rem] text-muted-foreground">{c.verdict ? `${c.verdict} · ${c.fraud_score}/100` : "Pending AI review"}</div>
                </div>
                <StatusPill s={c.status} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function QuickCard({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="glass rounded-xl p-5 hover:glow-cyber transition flex items-center gap-3">
      <div className="w-10 h-10 rounded bg-primary/10 border border-primary/40 flex items-center justify-center text-cyber">{icon}</div>
      <div className="display text-lg">{label}</div>
    </Link>
  );
}
function StatusPill({ s }: { s: string }) {
  const cls = s === "approved" || s === "resolved" ? "text-success border-success/40" :
              s === "rejected" ? "text-destructive border-destructive/40" :
              "text-warning border-warning/40";
  return <span className={`mono text-[0.55rem] px-2 py-1 rounded border ${cls}`}>{s.toUpperCase()}</span>;
}
