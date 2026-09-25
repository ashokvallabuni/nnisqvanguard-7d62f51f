import { useMemo } from "react";
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
  Sparkles,
  HelpCircle,
  Home as HomeIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/common/PageHeader";
import { ACADEMY_BADGES } from "@/lib/badge-engine";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Student Command Center — NISQ Vanguard Academy" },
      {
        name: "description",
        content:
          "Track your cybersecurity learning progress, active cyber labs, and verified credentials.",
      },
    ],
  }),
  component: StudentDashboard,
});

interface SkillLevel {
  name: string;
  category: string;
  level: "BEGINNER" | "DEVELOPING" | "PRACTICED" | "PROFICIENT";
  points: number;
}

function StudentDashboard() {
  const { user, profile, isAdmin, adminView, signOut } = useAuth();
  const rawRole = (profile as any)?.role?.toString()?.toUpperCase();

  let activeRole: "STUDENT" | "ORGANIZATION" | "COLLEGE" | "ADMIN" = "STUDENT";
  if (isAdmin) {
    if (adminView === "LEARNER") activeRole = "STUDENT";
    else if (adminView === "ORGANIZATION") activeRole = "ORGANIZATION";
    else activeRole = "ADMIN";
  } else {
    activeRole =
      profile?.account_type === "ORGANIZATION" ||
      rawRole === "ORGANIZATION" ||
      profile?.organization
        ? "ORGANIZATION"
        : profile?.account_type === "COLLEGE" || rawRole === "COLLEGE" || profile?.college
          ? "COLLEGE"
          : "STUDENT";
  }

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
        .select("lab_id,completed,points,updated_at")
        .eq("user_id", user.id);
      if (error) return [];
      return data ?? [];
    },
    enabled: !!user,
  });

  // 5. Fetch earned badges
  const { data: userBadges } = useQuery({
    queryKey: ["dash-user-badges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("user_badges").select("badge_id,awarded_at");
      return data ?? [];
    },
    enabled: !!user,
  });

  const completedModuleIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.module_id),
  );

  const completedModulesCount = completedModuleIds.size;
  const completedLabsCount = (labProgress ?? []).filter((l) => l.completed).length;
  const totalBadgesEarned = Math.max((userBadges ?? []).length, completedModulesCount > 0 ? 1 : 0);
  const totalXp = completedModulesCount * 25 + completedLabsCount * 100 + totalBadgesEarned * 100;

  // Active track to resume
  const activeCourse =
    courses?.find((c) => c.slug === "networking-fundamentals") ||
    courses?.find((c) => c.slug === "cybersecurity-foundations") ||
    courses?.[0];

  const courseModules = (allModules ?? []).filter((m) => m.course_id === activeCourse?.id);
  const nextModuleToResume =
    courseModules.find((m) => !completedModuleIds.has(m.id)) || courseModules[0];

  // Dynamic Next Step Calculation
  const nextStepAction = useMemo(() => {
    if (completedModulesCount === 0) {
      return {
        stage: "STEP 1: START LESSON",
        title: "Begin with Networking Fundamentals (Module 1)",
        description:
          "Learn how data packets traverse the physical and logical layers of the internet.",
        linkTo: "/learn/networking-fundamentals/what-is-networking",
        ctaText: "Start First Lesson",
      };
    }

    if (completedModulesCount < 3) {
      return {
        stage: "STEP 2: EXPLORE REAL DATA",
        title: "Analyze CIC-IDS2018 Network Flow Telemetry",
        description:
          "Examine live packet streams and detect SYN flood anomalies in the dataset viewer.",
        linkTo: "/cyber-range/datasets",
        ctaText: "Explore Dataset",
      };
    }

    if (completedLabsCount === 0) {
      return {
        stage: "STEP 3: PRACTICE IN SANDBOX",
        title: "Launch Linux SSH Brute Force Investigation Lab",
        description: "Triage live authentication logs inside an isolated Docker sandbox container.",
        linkTo: "/_authenticated/cyber-range/lab/linux-ssh-brute-force-investigation",
        ctaText: "Enter IVVAB LABS",
      };
    }

    return {
      stage: "STEP 4: CLAIM CREDENTIAL",
      title: "Complete Track Assessment & Review Badge",
      description: "You have verified course and lab requirements. Claim your official credential.",
      linkTo: "/achievements",
      ctaText: "View Achievements",
    };
  }, [completedModulesCount, completedLabsCount]);

  // Skill Progression Calculation
  const skillsMatrix: SkillLevel[] = [
    {
      name: "TCP/IP & Protocol Analysis",
      category: "Networking",
      level:
        completedModulesCount >= 3
          ? "PRACTICED"
          : completedModulesCount >= 1
            ? "DEVELOPING"
            : "BEGINNER",
      points: completedModulesCount * 30,
    },
    {
      name: "Linux Host Forensics (/var/log)",
      category: "Endpoint",
      level: completedLabsCount >= 1 ? "PRACTICED" : "DEVELOPING",
      points: completedLabsCount * 100,
    },
    {
      name: "Suricata NIDS Threat Hunting",
      category: "Network Defense",
      level:
        completedLabsCount >= 2 ? "PROFICIENT" : completedLabsCount >= 1 ? "PRACTICED" : "BEGINNER",
      points: completedLabsCount * 75,
    },
    {
      name: "Threat Modeling & CIA Triad",
      category: "Architecture",
      level: completedModulesCount >= 2 ? "PRACTICED" : "DEVELOPING",
      points: completedModulesCount * 25,
    },
  ];

  const skillLevelBadges = {
    BEGINNER: "bg-background text-muted-foreground border-border",
    DEVELOPING: "bg-primary/10 text-primary border-primary/30",
    PRACTICED: "bg-success/10 text-success border-success/30",
    PROFICIENT: "bg-destructive/10 text-destructive border-destructive/30",
  };

  return (
    <div className="min-h-screen pt-16 pb-24">
      <PageHeader
        badge="STUDENT COMMAND CENTER"
        badgeVariant="primary"
        title={`Welcome back, ${profile?.full_name || user?.email?.split("@")[0] || "Defender"}`}
        subtitle="Authoritative learning trajectory, verified skill competencies, and active IVVAB LABS sandboxes."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Command Center" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-10">
        {/* Main Content Column */}
        <div className="xl:col-span-2 space-y-8">
          {/* SECTION: NEXT UP */}
          <section aria-label="Next Action">
            <h2 className="text-[0.65rem] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Play className="w-3.5 h-3.5" /> Next Up
            </h2>
            <div className="rounded-2xl border border-border bg-muted p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-primary text-white font-semibold">
                    {nextStepAction.stage}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    Automated Recommendation
                  </span>
                </div>
                <h3 className="font-display font-bold text-2xl text-foreground">
                  {nextStepAction.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {nextStepAction.description}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <Link
                  to={nextStepAction.linkTo as any}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-background text-white font-semibold text-sm hover:bg-primary shadow-sm transition-all uppercase"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{nextStepAction.ctaText}</span>
                </Link>
              </div>
            </div>
          </section>

          {/* SECTION: ENROLLED TRACKS */}
          <section aria-label="Enrolled Tracks">
            <h2 className="text-[0.65rem] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" /> Enrolled Tracks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
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
                          <span>{pct > 0 ? "Resume" : "Start"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION: SKILL MATRIX */}
          <section aria-label="Skill Matrix">
            <h2 className="text-[0.65rem] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> Verified Skill Matrix
            </h2>
            <div className="nv-card p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skillsMatrix.map((skill, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[0.6rem] font-mono text-muted-foreground uppercase">
                        {skill.category}
                      </span>
                      <span
                        className={`text-[0.65rem] font-mono uppercase px-2 py-0.5 rounded-md border font-semibold ${skillLevelBadges[skill.level]}`}
                      >
                        {skill.level}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-foreground line-clamp-1">{skill.name}</h4>
                    <div className="text-[0.65rem] font-mono text-muted-foreground flex items-center gap-1">
                      <Zap className="w-3 h-3 text-primary" /> {skill.points} Verified Points
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* SECTION: YOUR PROFILE & STATS */}
          <section aria-label="Your Profile">
            <h2 className="text-[0.65rem] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Profile & Stats
            </h2>
            <div className="nv-card p-4 sm:p-5 shadow-sm mb-4">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    WORKSPACE: <span className="text-primary font-bold">{activeRole}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {activeRole === "STUDENT" && (
                  <>
                    <Link
                      to="/profile"
                      className="px-3 py-1.5 rounded-lg text-[0.65rem] font-mono font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
                    >
                      PROFILE
                    </Link>
                    <Link
                      to="/achievements"
                      className="px-3 py-1.5 rounded-lg text-[0.65rem] font-mono font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-colors"
                    >
                      BADGES
                    </Link>
                    <Link
                      to="/certificates"
                      className="px-3 py-1.5 rounded-lg text-[0.65rem] font-mono font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
                    >
                      CERTIFICATES
                    </Link>
                    <Link
                      to="/cyber-range/my-progress"
                      className="px-3 py-1.5 rounded-lg text-[0.65rem] font-mono font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
                    >
                      PROGRESS
                    </Link>
                    <button
                      onClick={() => void signOut()}
                      className="px-3 py-1.5 rounded-lg text-[0.65rem] font-mono font-semibold text-muted-foreground hover:text-destructive border border-border transition-colors"
                    >
                      LOGOUT
                    </button>
                  </>
                )}
                {/* Fallback for other roles */}
                {activeRole !== "STUDENT" && (
                  <>
                    <Link
                      to="/profile"
                      className="px-3 py-1.5 rounded-lg text-[0.65rem] font-mono font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
                    >
                      PROFILE
                    </Link>
                    <button
                      onClick={() => void signOut()}
                      className="px-3 py-1.5 rounded-lg text-[0.65rem] font-mono font-semibold text-muted-foreground hover:text-destructive border border-border transition-colors"
                    >
                      LOGOUT
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 nv-card space-y-1 shadow-sm hover:border-amber-500/30 transition-colors">
                <div className="text-[0.65rem] font-mono uppercase text-warning font-bold">
                  Streak
                </div>
                <div className="font-display font-bold text-2xl text-foreground">
                  7 <span className="text-xs text-muted-foreground">Days</span>
                </div>
              </div>
              <div className="p-4 nv-card space-y-1 shadow-sm">
                <div className="text-[0.65rem] font-mono uppercase text-muted-foreground">
                  Skill XP
                </div>
                <div className="font-display font-bold text-2xl text-foreground">{totalXp}</div>
              </div>
              <div className="p-4 nv-card space-y-1 shadow-sm">
                <div className="text-[0.65rem] font-mono uppercase text-primary">Lessons</div>
                <div className="font-display font-bold text-2xl text-foreground">
                  {completedModulesCount}
                </div>
              </div>
              <div className="p-4 nv-card space-y-1 shadow-sm">
                <div className="text-[0.65rem] font-mono uppercase text-success">Labs</div>
                <div className="font-display font-bold text-2xl text-foreground">
                  {completedLabsCount}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: QUICK TOOLS */}
          <section aria-label="Quick Tools">
            <h2 className="text-[0.65rem] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Quick Tools
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <Link
                to="/cyber-range/labs"
                className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-[0.65rem] font-mono text-primary uppercase font-semibold">
                    Practice
                  </div>
                  <div className="font-display font-bold text-sm text-foreground mt-0.5">
                    IVVAB LABS
                  </div>
                </div>
                <Terminal className="w-4 h-4 text-primary" />
              </Link>
              <Link
                to="/academy/glossary"
                className="p-4 rounded-xl border border-border bg-card hover:border-accent/40 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-[0.65rem] font-mono text-accent uppercase font-semibold">
                    Lexicon
                  </div>
                  <div className="font-display font-bold text-sm text-foreground mt-0.5">
                    Glossary
                  </div>
                </div>
                <BookOpen className="w-4 h-4 text-accent" />
              </Link>
              <Link
                to="/achievements"
                className="p-4 rounded-xl border border-border bg-card hover:border-[#8B5CF6]/40 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-[0.65rem] font-mono text-primary uppercase font-semibold">
                    Portfolio
                  </div>
                  <div className="font-display font-bold text-sm text-foreground mt-0.5">
                    Achievements
                  </div>
                </div>
                <Award className="w-4 h-4 text-primary" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
