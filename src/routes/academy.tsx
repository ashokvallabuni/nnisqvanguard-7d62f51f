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
          "Cybersecurity cannot be mastered by memorizing definitions. Develop the ability to observe a system, understand its behaviour, identify abnormal activity, investigate evidence, and make informed security decisions.",
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

  return (
    <div className="min-h-screen pt-16 pb-24 academy-theme">
      <style>{`
        .academy-theme {
          --course-card-bg: #EAF4FF;
          --course-card-border: #CFE4FF;
          --course-title: #050B14;
          --course-text: #94A3B8;
          --course-btn-bg: #0A7CFF;
          --course-btn-hover: #00B8FF;
          --course-btn-text: #FFFFFF;
        }
        :root[data-theme="dark"] .academy-theme {
          --course-card-bg: #081522;
          --course-card-border: #16283A;
          --course-title: #FFFFFF;
          --course-text: #94A3B8;
          --course-btn-bg: #0A7CFF;
          --course-btn-hover: #00B8FF;
          --course-btn-text: #FFFFFF;
        }
      `}</style>
      <PageHeader
        badge="NISQ Vanguard Academy"
        badgeVariant="primary"
        title="Learn Cybersecurity by Understanding How Systems Actually Work"
        subtitle="Cybersecurity cannot be mastered by memorizing definitions. Develop the ability to observe a system, understand its behaviour, identify abnormal activity, investigate evidence, and make informed security decisions."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Academy" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-12">
        <section aria-label="Course Catalog">
          <div className="flex flex-col items-center justify-center text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">Course Catalog</h2>
            <p className="text-muted-foreground max-w-2xl">
              Explore our structured learning paths and specialized modules designed for practical cybersecurity capability building.
            </p>
          </div>

          {/* Filter & Search Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search topics, modules, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>
            
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm w-full sm:w-auto overflow-x-auto">
              {["all", "beginner", "intermediate", "advanced"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-4 py-1.5 rounded-md text-sm capitalize transition-colors whitespace-nowrap ${
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

          {coursesLoading ? (
            <GridSkeleton count={6} />
          ) : coursesError ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-12 text-center space-y-3">
              <Shield className="w-10 h-10 text-destructive mx-auto" />
              <h4 className="font-semibold text-foreground">Database Connection Error</h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Unable to load curriculum courses from the production database.
              </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} progress={course.progress_percent} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
