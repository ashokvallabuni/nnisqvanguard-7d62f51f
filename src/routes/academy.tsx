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
          "Enterprise cybersecurity education: foundational concepts, threat telemetry analysis, defensive engineering, and hands-on cyber range labs.",
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        {/* Learning Philosophy Track */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-card/80 backdrop-blur-xs">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-mono text-xs font-bold">
              01
            </div>
            <div>
              <div className="text-xs font-mono text-muted-foreground uppercase">Step 1</div>
              <div className="font-semibold text-sm text-foreground">LEARN Theory</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent-foreground flex items-center justify-center shrink-0 font-mono text-xs font-bold">
              02
            </div>
            <div>
              <div className="text-xs font-mono text-muted-foreground uppercase">Step 2</div>
              <div className="font-semibold text-sm text-foreground">EXPLORE Data</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-lg bg-warning/15 text-warning flex items-center justify-center shrink-0 font-mono text-xs font-bold">
              03
            </div>
            <div>
              <div className="text-xs font-mono text-muted-foreground uppercase">Step 3</div>
              <div className="font-semibold text-sm text-foreground">PRACTICE Labs</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-lg bg-success/15 text-success flex items-center justify-center shrink-0 font-mono text-xs font-bold">
              04
            </div>
            <div>
              <div className="text-xs font-mono text-muted-foreground uppercase">Step 4</div>
              <div className="font-semibold text-sm text-foreground">ASSESS & DEFEND</div>
            </div>
          </div>
        </div>

        {/* Recommended First Step / Start Here Card */}
        {beginnerCourse && (
          <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-mono font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>RECOMMENDED STARTING POINT</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  {beginnerCourse.title}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Start your cybersecurity journey with the foundational architecture: threat
                  modeling, network traffic protocols, access controls, and authentication hygiene.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-primary" /> {beginnerCourse.module_count}{" "}
                    Modules
                  </span>
                  <span className="flex items-center gap-1">
                    <Database className="w-4 h-4 text-accent" /> Real Telemetry Included
                  </span>
                  <span className="flex items-center gap-1">
                    <Terminal className="w-4 h-4 text-success" /> Hands-on Labs Connected
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/learn/$slug"
                  params={{ slug: beginnerCourse.slug }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 shadow-md transition-all group"
                >
                  <span>START COURSE</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topics, modules, or tags (e.g. TCP, Ransomware)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 text-xs font-mono">
              <span className="px-2 text-muted-foreground">Level:</span>
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

        {/* Course Catalog Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <span>All Learning Tracks ({filteredCourses.length})</span>
            </h3>
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
        </div>

        {/* Practice in Cyber Labs Banner */}
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-muted-foreground uppercase">
                PRACTICAL EXTENSION
              </span>
            </div>
            <h4 className="font-display font-bold text-xl text-foreground">
              Ready for live command-line execution?
            </h4>
            <p className="text-sm text-muted-foreground max-w-xl">
              Apply what you've learned inside real Docker-isolated virtual environments with live
              attack traffic and forensic telemetry.
            </p>
          </div>
          <Link
            to="/cyber-range/labs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-primary/40 bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors shrink-0"
          >
            <span>OPEN CYBER LABS</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
