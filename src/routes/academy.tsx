import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  GraduationCap,
  Sparkles,
  Shield,
  Terminal,
  Database,
  Search,
  Filter,
  ArrowRight,
  BookOpen,
  Award,
  Layers,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/common/PageHeader";
import { CourseCard, CourseData } from "@/components/academy/CourseCard";
import { GridSkeleton } from "@/components/common/SkeletonLoaders";
import { getLockedComingSoonCoursesStatic } from "@/lib/course-accessibility";

export const Route = createFileRoute("/academy")({
  head: () => ({
    meta: [
      { title: "NISQ Vanguard Academy — Structured Cybersecurity Learning Platform" },
      {
        name: "description",
        content:
          "Enterprise cybersecurity education: foundational concepts, threat telemetry analysis, defensive engineering, and hands-on IVVAB LABS labs.",
      },
    ],
  }),
  component: AcademyPage,
});

function AcademyPage() {
  const { user, isAdmin, adminView } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const {
    data: courses,
    isLoading: coursesLoading,
    isError: coursesError,
    error: courseError,
  } = useQuery({
    queryKey: ["academy-courses", isAdmin, adminView],
    queryFn: async () => {
      let query = supabase
        .from("courses")
        .select("id,slug,title,description,level,tier,sort_order,status")
        .order("sort_order");

      if (isAdmin && adminView === "LEARNER") {
        query = query.eq("status", "PUBLISHED");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: modules } = useQuery({
    queryKey: ["academy-modules-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("id,course_id,slug,title,difficulty,duration_minutes,tags");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: userProgress } = useQuery({
    queryKey: ["academy-user-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("module_progress")
        .select("module_id,completed")
        .eq("user_id", user.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  // Calculate course stats & progress
  const coursesWithDetails: CourseData[] = useMemo(() => {
    const completedSet = new Set(
      (userProgress ?? []).filter((p) => p.completed).map((p) => p.module_id),
    );

    const dbCourses: CourseData[] = (courses ?? []).map((c) => {
      const courseModules = (modules ?? []).filter((m) => m.course_id === c.id);
      const completedCourseModules = courseModules.filter((m) => completedSet.has(m.id));
      const progressPercent = courseModules.length
        ? (completedCourseModules.length / courseModules.length) * 100
        : 0;

      const durationSum = courseModules.reduce((acc, m) => acc + (m.duration_minutes || 20), 0);
      const allTags = Array.from(new Set(courseModules.flatMap((m) => m.tags || [])));

      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        summary: c.description || "Master core defensive and threat analysis competencies.",
        level: c.level || "beginner",
        category: c.tier === "paid" ? "Specialization" : "Core Curriculum",
        duration_hours: Math.max(1, Math.round(durationSum / 60)),
        tags: allTags.length > 0 ? allTags : ["Security", "Defense", "Telemetry"],
        module_count: courseModules.length || 5,
        progress_percent: progressPercent,
      };
    });

    const existingSlugs = new Set(dbCourses.map((c) => c.slug));
    const lockedCourses = getLockedComingSoonCoursesStatic().filter(
      (lc) => !existingSlugs.has(lc.slug),
    );

    return [...dbCourses, ...lockedCourses];
  }, [courses, modules, userProgress]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return coursesWithDetails.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLevel =
        selectedLevel === "all" || c.level.toLowerCase() === selectedLevel.toLowerCase();

      const matchesCategory =
        selectedCategory === "all" || c.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [coursesWithDetails, searchQuery, selectedLevel, selectedCategory]);

  const beginnerCourse =
    coursesWithDetails.find((c) => c.slug === "cybersecurity-foundations") || coursesWithDetails[0];

  return (
    <div className="min-h-screen pt-16 pb-24">
      <PageHeader
        badge="NISQ Vanguard Academy"
        badgeVariant="primary"
        title="Structured Cybersecurity Education"
        subtitle="Learn theory, analyze real-world threat telemetry datasets, and seamlessly transition to hands-on Cyber Labs."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Academy" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 xl:grid-cols-4 gap-8 lg:gap-10">
        
        {/* Main Content Column (Catalog) */}
        <div className="xl:col-span-3 space-y-8">
          
          <section aria-label="Course Catalog">
            <h2 className="text-[0.65rem] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Learning Tracks
            </h2>
            
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search topics, modules, or tags (e.g. TCP, Ransomware)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 text-xs font-mono shadow-sm">
                  <span className="px-2 text-muted-foreground font-semibold uppercase tracking-wider text-[0.65rem]">Level</span>
                  {["all", "beginner", "intermediate", "advanced"].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                        selectedLevel === lvl
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {coursesLoading ? (
              <GridSkeleton count={6} />
            ) : coursesError ? (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-12 text-center space-y-3">
                <Shield className="w-10 h-10 text-destructive mx-auto" />
                <h4 className="font-semibold text-foreground">Database Connection Error</h4>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Unable to load curriculum courses from the production database. Please ensure
                  migrations have been applied.
                </p>
                <div className="text-xs font-mono text-destructive/80">
                  {courseError instanceof Error
                    ? courseError.message
                    : "Error connecting to Supabase"}
                </div>
              </div>
            ) : !courses || courses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
                <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto" />
                <h4 className="font-semibold text-foreground">No courses published yet</h4>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  The database curriculum tables are currently being prepared. Check back shortly.
                </p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
                <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto" />
                <h4 className="font-semibold text-foreground">No courses match your filter</h4>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Try adjusting your search keywords or resetting the level filter.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedLevel("all");
                    setSelectedCategory("all");
                  }}
                  className="text-xs font-mono text-primary underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} progress={course.progress_percent} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8 xl:col-span-1">
          
          {/* Recommended First Step / Start Here Card */}
          {beginnerCourse && (
            <section aria-label="Recommended Start">
              <h2 className="text-[0.65rem] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Recommended Start
              </h2>
              <div className="relative overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-5 shadow-sm flex flex-col gap-4">
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-lg text-foreground leading-tight">
                    {beginnerCourse.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Start your cybersecurity journey with the foundational architecture: threat
                    modeling, network traffic protocols, access controls, and authentication hygiene.
                  </p>
                </div>
                <div className="flex flex-col gap-2 text-[0.65rem] font-mono text-muted-foreground pt-1 pb-2 border-b border-border/60">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-primary" /> {beginnerCourse.module_count} Modules
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-accent" /> Real Telemetry Included
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-success" /> Hands-on Labs Connected
                  </span>
                </div>
                <Link
                  to="/learn/$slug"
                  params={{ slug: beginnerCourse.slug }}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 shadow-sm transition-all group uppercase tracking-wide"
                >
                  <span>Start Course</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </section>
          )}

          <section aria-label="Methodology">
            <h2 className="text-[0.65rem] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5" /> Methodology
            </h2>
            <div className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card/80 backdrop-blur-xs shadow-sm">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                  01
                </div>
                <div>
                  <div className="text-[0.6rem] font-mono text-muted-foreground uppercase">Step 1</div>
                  <div className="font-semibold text-xs text-foreground uppercase tracking-wide">Learn Theory</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent-foreground flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                  02
                </div>
                <div>
                  <div className="text-[0.6rem] font-mono text-muted-foreground uppercase">Step 2</div>
                  <div className="font-semibold text-xs text-foreground uppercase tracking-wide">Explore Data</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-warning/15 text-warning flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                  03
                </div>
                <div>
                  <div className="text-[0.6rem] font-mono text-muted-foreground uppercase">Step 3</div>
                  <div className="font-semibold text-xs text-foreground uppercase tracking-wide">Practice Labs</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-success/15 text-success flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                  04
                </div>
                <div>
                  <div className="text-[0.6rem] font-mono text-muted-foreground uppercase">Step 4</div>
                  <div className="font-semibold text-xs text-foreground uppercase tracking-wide">Assess & Defend</div>
                </div>
              </div>
            </div>
          </section>

          <section aria-label="Practice Area">
            <h2 className="text-[0.65rem] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" /> Practice
            </h2>
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 shadow-sm">
              <div className="space-y-1.5">
                <h4 className="font-display font-bold text-sm text-foreground">
                  Ready for live command-line execution?
                </h4>
                <p className="text-[0.7rem] text-muted-foreground">
                  Apply what you've learned inside real Docker-isolated virtual environments with live
                  attack traffic and forensic telemetry.
                </p>
              </div>
              <Link
                to="/cyber-range/labs"
                className="inline-flex justify-center items-center gap-2 w-full py-2.5 rounded-lg border border-primary/40 bg-primary/10 text-primary font-semibold text-xs hover:bg-primary/20 transition-colors uppercase tracking-wide"
              >
                <span>OPEN IVVAB LABS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
