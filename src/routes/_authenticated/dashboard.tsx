import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  ScanSearch,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  Lock,
  BrainCircuit,
  ShieldCheck,
  FlaskConical,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My Account — CyberShield India" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, profile } = useAuth();
  const { data: bookings } = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("id,topic,program_type,status,preferred_date,created_at")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });
  const { data: complaints } = useQuery({
    queryKey: ["my-complaints", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("complaints")
        .select("id,complaint_text,verdict,fraud_score,status,created_at")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });
  const { data: courses } = useQuery({
    queryKey: ["dash-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id,slug,title,tier,description,phase_id")
        .order("sort_order");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
  const { data: phases } = useQuery({
    queryKey: ["dash-learning-phases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_phases")
        .select("id,slug,name")
        .order("sort_order");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
  const { data: progress } = useQuery({
    queryKey: ["dash-progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_progress")
        .select("module_id,completed")
        .eq("user_id", user!.id);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!user,
  });
  const { data: academyProgress } = useQuery({
    queryKey: ["dash-academy-progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_course_progress")
        .select("course_id,module_id,progress_type,completed")
        .eq("user_id", user!.id);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!user,
  });
  const { data: allModules } = useQuery({
    queryKey: ["dash-modules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("modules").select("id,course_id");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
  const { data: completedLabs } = useQuery({
    queryKey: ["dash-completed-labs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_progress")
        .select("id")
        .eq("user_id", user!.id)
        .not("completed_at", "is", null);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!user,
  });
  const completedModuleIds = new Set([
    ...(progress ?? []).filter((item) => item.completed).map((item) => item.module_id),
    ...(academyProgress ?? [])
      .filter((item) => item.progress_type === "module" && item.completed)
      .map((item) => item.module_id),
  ]);
  const activeCourse =
    (courses ?? []).find((course) => {
      const courseModules = (allModules ?? []).filter((module) => module.course_id === course.id);
      return (
        courseModules.length > 0 &&
        courseModules.some((module) => !completedModuleIds.has(module.id))
      );
    }) ?? courses?.[0];
  const pctByCourse = (cid: string) => {
    const total = (allModules ?? []).filter((m) => m.course_id === cid).length;
    if (!total) return 0;
    const courseModuleIds = new Set(
      (allModules ?? []).filter((module) => module.course_id === cid).map((module) => module.id),
    );
    const done = [...completedModuleIds].filter((moduleId) => courseModuleIds.has(moduleId)).length;
    return Math.round((done / total) * 100);
  };
  const phaseStats = (phaseSlug: string) => {
    const phaseId = phases?.find((phase) => phase.slug === phaseSlug)?.id;
    const phaseCourses = (courses ?? []).filter((course) => course.phase_id === phaseId);
    const phaseCourseIds = new Set(phaseCourses.map((course) => course.id));
    const phaseModules = (allModules ?? []).filter((module) =>
      phaseCourseIds.has(module.course_id),
    );
    const completed = phaseCourses.filter((course) => {
      const courseModules = phaseModules.filter((module) => module.course_id === course.id);
      return (
        courseModules.length > 0 &&
        courseModules.every((module) => completedModuleIds.has(module.id))
      );
    }).length;
    const startedCourseIds = new Set(
      [
        ...(academyProgress ?? []).map((item) => item.course_id),
        ...(progress ?? []).flatMap((item) => {
          const module = phaseModules.find((courseModule) => courseModule.id === item.module_id);
          return module ? [module.course_id] : [];
        }),
      ].filter((courseId) => phaseCourseIds.has(courseId)),
    );
    return { started: startedCourseIds.size, completed };
  };

  return (
    <main className="pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mono text-xs text-cyber mb-2">// PERSONAL CONSOLE</div>
        <h1 className="display text-4xl mb-2">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="text-muted-foreground mb-8 mono text-xs">{user?.email || user?.phone}</p>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <QuickCard
            to="/fraud-check"
            icon={<ScanSearch className="w-5 h-5" />}
            label="Scan Screenshot"
          />
          <QuickCard
            to="/complaint"
            icon={<AlertTriangle className="w-5 h-5" />}
            label="File Complaint"
          />
          <QuickCard
            to="/programs"
            icon={<GraduationCap className="w-5 h-5" />}
            label="Book Program"
          />
        </div>

        <section className="mb-10">
          <h2 className="display text-2xl mb-3">Continue Course</h2>
          {activeCourse ? (
            <Link
              to="/learn/$slug"
              params={{ slug: activeCourse.slug }}
              className="glass rounded-xl p-6 hover:glow-cyber transition flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="mono text-[0.6rem] text-cyber mb-2">PICK UP WHERE YOU LEFT OFF</div>
                <div className="display text-xl">{activeCourse.title}</div>
                <div className="mono text-[0.55rem] text-muted-foreground mt-1">
                  {pctByCourse(activeCourse.id)}% COMPLETE
                </div>
              </div>
              <span className="bg-primary text-primary-foreground rounded-md px-5 py-3 mono text-xs font-semibold text-center">
                CONTINUE LEARNING →
              </span>
            </Link>
          ) : (
            <div className="glass rounded-xl p-5 text-sm text-muted-foreground">
              No courses are available yet.
            </div>
          )}
        </section>

        <section className="mb-10">
          <h2 className="display text-2xl mb-3">Learning Divisions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                slug: "ai",
                label: "Artificial Intelligence",
                icon: <BrainCircuit className="h-5 w-5" />,
              },
              {
                slug: "cybersecurity",
                label: "Cybersecurity",
                icon: <ShieldCheck className="h-5 w-5" />,
              },
            ].map((phase) => {
              const stats = phaseStats(phase.slug);
              return (
                <Link
                  key={phase.slug}
                  to="/academy"
                  search={{ phase: phase.slug }}
                  className="glass rounded-xl p-5 hover:glow-cyber transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-cyber">{phase.icon}</span>
                    <h3 className="display text-lg">{phase.label}</h3>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 mono text-[0.6rem] text-muted-foreground">
                    <div>
                      <span className="block text-xl text-foreground">{stats.started}</span>COURSES
                      STARTED
                    </div>
                    <div>
                      <span className="block text-xl text-foreground">{stats.completed}</span>
                      COURSES COMPLETED
                    </div>
                  </div>
                  <div className="mt-4 mono text-[0.6rem] text-cyber">EXPLORE DIVISION →</div>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="glass rounded-lg p-4 flex items-center gap-3">
              <FlaskConical className="h-5 w-5 text-cyber" />
              <div>
                <div className="mono text-xl">{completedLabs?.length ?? 0}</div>
                <div className="mono text-[0.55rem] text-muted-foreground">
                  PRACTICAL LABS COMPLETED
                </div>
              </div>
            </div>
            <div className="glass rounded-lg p-4 flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-cyber" />
              <div>
                <div className="mono text-xl">—</div>
                <div className="mono text-[0.55rem] text-muted-foreground">
                  VERIFIED CERTIFICATES · NOT CONFIGURED
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="display text-2xl mb-3">My Learning</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {(courses ?? []).map((c) => {
              const pct = pctByCourse(c.id);
              const locked = c.tier === "paid";
              return (
                <Link
                  key={c.id}
                  to="/learn/$slug"
                  params={{ slug: c.slug }}
                  className="glass rounded-xl p-5 hover:glow-cyber transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded bg-primary/10 border border-primary/40 flex items-center justify-center text-cyber">
                      {locked ? <Lock className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    </div>
                    <span
                      className={`mono text-[0.5rem] px-2 py-1 rounded border ${locked ? "text-accent border-accent/40" : "text-success border-success/40"}`}
                    >
                      {locked ? "PREMIUM" : "FREE"}
                    </span>
                  </div>
                  <div className="display text-lg mb-2">{c.title}</div>
                  {!locked && (
                    <>
                      <div className="h-1 bg-border rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mono text-[0.55rem] text-muted-foreground">
                        {pct}% COMPLETE
                      </div>
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="display text-2xl mb-3">My Bookings</h2>
          <div className="glass rounded-xl overflow-hidden">
            {!bookings || bookings.length === 0 ? (
              <div className="p-6 text-muted-foreground text-sm">No bookings yet.</div>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-border/30 last:border-0"
                >
                  <div>
                    <div className="text-sm font-semibold">{b.topic}</div>
                    <div className="mono text-[0.6rem] text-muted-foreground">
                      {b.program_type} · {b.preferred_date ?? "no date"}
                    </div>
                  </div>
                  <StatusPill s={b.status} />
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="display text-2xl mb-3">My Complaints</h2>
          <div className="glass rounded-xl overflow-hidden">
            {!complaints || complaints.length === 0 ? (
              <div className="p-6 text-muted-foreground text-sm">No complaints yet.</div>
            ) : (
              complaints.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-border/30 last:border-0"
                >
                  <div className="min-w-0 pr-3">
                    <div className="text-sm truncate">{c.complaint_text}</div>
                    <div className="mono text-[0.6rem] text-muted-foreground">
                      {c.verdict ? `${c.verdict} · ${c.fraud_score}/100` : "Pending AI review"}
                    </div>
                  </div>
                  <StatusPill s={c.status} />
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function QuickCard({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="glass rounded-xl p-5 hover:glow-cyber transition flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded bg-primary/10 border border-primary/40 flex items-center justify-center text-cyber">
        {icon}
      </div>
      <div className="display text-lg">{label}</div>
    </Link>
  );
}
function StatusPill({ s }: { s: string }) {
  const cls =
    s === "approved" || s === "resolved"
      ? "text-success border-success/40"
      : s === "rejected"
        ? "text-destructive border-destructive/40"
        : "text-warning border-warning/40";
  return (
    <span className={`mono text-[0.55rem] px-2 py-1 rounded border ${cls}`}>{s.toUpperCase()}</span>
  );
}
