import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarCheck, ShieldAlert, School, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Overview,
});

function Overview() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [b, c, co, up] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("complaints").select("id", { count: "exact", head: true }),
        supabase.from("colleges").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "approved").gte("preferred_date", new Date().toISOString().slice(0, 10)),
      ]);
      return {
        bookings: b.count ?? 0,
        complaints: c.count ?? 0,
        colleges: co.count ?? 0,
        upcoming: up.count ?? 0,
      };
    },
  });
  const { data: fraudCount } = useQuery({
    queryKey: ["fraud-count"],
    queryFn: async () => {
      const { count } = await supabase.from("complaints").select("id", { count: "exact", head: true }).eq("verdict", "Fraud");
      return count ?? 0;
    },
  });

  return (
    <div>
      <div className="mono text-xs text-cyber mb-2">// SYSTEM OVERVIEW</div>
      <h1 className="display text-4xl mb-8">Admin Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card icon={<ShieldAlert />} label="Total Complaints" value={stats?.complaints ?? 0} />
        <Card icon={<ShieldAlert />} label="Fraud Detected" value={fraudCount ?? 0} accent="destructive" />
        <Card icon={<CalendarCheck />} label="Total Bookings" value={stats?.bookings ?? 0} />
        <Card icon={<CalendarCheck />} label="Upcoming Sessions" value={stats?.upcoming ?? 0} accent="success" />
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <Card icon={<School />} label="Colleges in Database" value={stats?.colleges ?? 0} />
        <Card icon={<Users />} label="Powered by AI Vision" value="LIVE" />
      </div>
    </div>
  );
}

function Card({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number | string; accent?: "success" | "destructive" }) {
  const color = accent === "destructive" ? "text-destructive" : accent === "success" ? "text-success" : "text-cyber";
  return (
    <div className="glass rounded-xl p-5">
      <div className={`w-10 h-10 rounded bg-primary/10 border border-primary/30 flex items-center justify-center ${color} mb-3`}>{icon}</div>
      <div className="mono text-[0.6rem] text-muted-foreground">{label.toUpperCase()}</div>
      <div className={`display text-3xl mt-1 ${color}`}>{value}</div>
    </div>
  );
}
