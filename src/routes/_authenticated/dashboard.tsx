import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  GraduationCap,
  Terminal,
  Award,
  Zap,
  Clock,
  Play,
  CheckCircle2,
  Shield,
  Activity,
  ArrowRight,
  BookOpen,
  Layers,
  Database,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Student Command Center — NISQ Vanguard Academy" },
      {
        name: "description",
        content: "Track your cybersecurity learning progress, active cyber labs, and certifications.",
      },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { user, profile } = useAuth();

  // 1. Fetch courses
  const { data: courses } = useQuery({
    queryKey: ["dash-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id,slug,title,tier,description,level")
        .order("sort_order");
      if (error) return [];
      return data ?? [];
    },
  });

  // 2. Fetch all modules
  const { data: allModules } = useQuery({
    queryKey: ["dash-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("id,course_id,slug,title,duration_minutes,sort_order")
        .order("sort_order");
      if (error) return [];
      return data ?? [];
    },
  });

  // 3. Fetch module progress
  const { data: progress } = useQuery({
    queryKey: ["dash-user-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("module_progress")
        .select("module_id,completed,updated_at")
        .eq("user_id", user.id);
      if (error) return [];
      return data ?? [];
    },
    enabled: !!user,
  });

  // 4. Fetch lab progress
  const { data: labProgress } = useQuery({
    queryKey: ["dash-lab-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("lab_progress")
        .select("lab_id,completed,score,updated_at")
        .eq("user_id", user.id);
      if (error) return [];
      return data ?? [];
    },
    enabled: !!user,
  });

  // 5. Fetch Bookings (for institutional students)
  const { data: bookings } = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("bookings")
        .select("id,topic,program_type,status,preferred_date,created_at")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const completedModuleIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.module_id)
  );

  const completedModulesCount = completedModuleIds.size;
  const completedLabsCount = (labProgress ?? []).filter((l) => l.completed).length;
  const totalXp = completedModulesCount * 25 + completedLabsCount * 100;

  // Find active course to resume
  const foundationsCourse =
    courses?.find((c) => c.slug === "cybersecurity-foundations") || courses?.[0];
  const courseModules = (allModules ?? []).filter(
    (m) => m.course_id === foundationsCourse?.id
  );
  const nextModuleToResume =
    courseModules.find((m) => !completedModuleIds.has(m.id)) || courseModules[0];

  return (
    <div className="min-h-screen pt-16 pb-24">
      <PageHeader
        badge="STUDENT COMMAND CENTER"
        badgeVariant="primary"
        title={`Welcome back, ${profile?.full_name || user?.email?.split("@")[0] || "Defender"}`}
        subtitle="Manage your learning trajectory, active sandbox sessions, and defense competencies."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Command Center" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-border bg-card space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-mono uppercase">Total XP</span>
              <Zap className="w-4 h-4 text-warning" />
            </div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-foreground">
              {totalXp}
            </div>
            <div className="text-[0.65rem] font-mono text-muted-foreground">Level 1 Defender</div>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-mono uppercase">Completed Modules</span>
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-foreground">
              {completedModulesCount}
            </div>
            <div className="text-[0.65rem] font-mono text-muted-foreground">
              Across all tracks
            </div>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-mono uppercase">Labs Solved</span>
              <Terminal className="w-4 h-4 text-success" />
            </div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-foreground">
              {completedLabsCount}
            </div>
            <div className="text-[0.65rem] font-mono text-muted-foreground">
              In Cyber Range
            </div>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-mono uppercase">Certificates</span>
              <Award className="w-4 h-4 text-accent" />
            </div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-foreground">
              {completedModulesCount >= 5 ? 1 : 0}
            </div>
            <div className="text-[0.65rem] font-mono text-muted-foreground">
              Verified credentials
            </div>
          </div>
        </div>

        {/* Continue Where You Left Off Hero */}
        {foundationsCourse && nextModuleToResume && (
          <div className="rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/10 via-card to-accent/5 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold">
                  RESUME LEARNING
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {foundationsCourse.title}
                </span>
              </div>
              <h3 className="font-display font-bold text-2xl text-foreground">
                {nextModuleToResume.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Continue your progress on core defensive fundamentals and real-world telemetry inspection.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/learn/$slug/$moduleSlug"
                params={{
                  slug: foundationsCourse.slug,
                  moduleSlug: nextModuleToResume.slug,
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 shadow-md transition-all"
              >
                <Play className="w-4 h-4 fill-primary-foreground" />
                <span>Continue Module</span>
              </Link>
            </div>
          </div>
        )}

        {/* Academy Tracks Progress Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>My Enrolled Tracks</span>
            </h3>
            <Link to="/academy" className="text-xs font-mono text-primary hover:underline">
              Browse All Courses →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(courses ?? []).map((c) => {
              const cModules = (allModules ?? []).filter((m) => m.course_id === c.id);
              const cDone = cModules.filter((m) => completedModuleIds.has(m.id)).length;
              const pct = cModules.length ? Math.round((cDone / cModules.length) * 100) : 0;

              return (
                <div
                  key={c.id}
                  className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.65rem] font-mono uppercase px-2 py-0.5 rounded-full border bg-muted text-muted-foreground">
                        {c.level}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground font-semibold">
                        {pct}% Complete
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-lg text-foreground line-clamp-1">
                      {c.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {c.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-border/60">
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground">
                        {cDone} / {cModules.length || 5} Modules
                      </span>
                      <Link
                        to="/learn/$slug"
                        params={{ slug: c.slug }}
                        className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <span>{pct > 0 ? "Continue" : "Start"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cyber Range Hands-on Quick Links */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <span>Cyber Range Practical Workbenches</span>
            </h3>
            <Link to="/cyber-range/labs" className="text-xs font-mono text-primary hover:underline">
              View All Labs →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link
              to="/_authenticated/cyber-range/lab/$slug"
              params={{ slug: "linux-ssh-brute-force-investigation" }}
              className="p-4 rounded-lg border border-border bg-muted/20 hover:border-primary/40 transition-colors flex items-center justify-between"
            >
              <div>
                <span className="text-[0.6rem] font-mono text-success uppercase font-semibold">Easy • Host</span>
                <div className="font-medium text-xs text-foreground mt-0.5">Linux SSH Brute Force</div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            <Link
              to="/_authenticated/cyber-range/lab/$slug"
              params={{ slug: "suricata-network-threat-hunting" }}
              className="p-4 rounded-lg border border-border bg-muted/20 hover:border-primary/40 transition-colors flex items-center justify-between"
            >
              <div>
                <span className="text-[0.6rem] font-mono text-primary uppercase font-semibold">Medium • Network</span>
                <div className="font-medium text-xs text-foreground mt-0.5">Suricata Threat Hunting</div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            <Link
              to="/cyber-range/datasets"
              className="p-4 rounded-lg border border-border bg-muted/20 hover:border-accent/40 transition-colors flex items-center justify-between"
            >
              <div>
                <span className="text-[0.6rem] font-mono text-accent uppercase font-semibold">Real Data</span>
                <div className="font-medium text-xs text-foreground mt-0.5">Telemetry Datasets</div>
              </div>
              <Database className="w-4 h-4 text-accent" />
            </Link>
          </div>
        </div>

        {/* Institutional Bookings & History */}
        {bookings && bookings.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
            <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Institutional Campus Bookings</span>
            </h3>
            <div className="divide-y divide-border">
              {bookings.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-foreground">{b.topic}</div>
                    <div className="text-muted-foreground font-mono">{b.program_type}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full border text-[0.65rem] font-mono uppercase bg-muted">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
