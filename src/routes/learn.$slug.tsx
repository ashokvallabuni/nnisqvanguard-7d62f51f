import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  Circle,
  Play,
  Terminal,
  Database,
  ArrowRight,
  Shield,
  Layers,
  Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/common/PageHeader";
import { DetailPageSkeleton } from "@/components/common/SkeletonLoaders";
import { isCourseAccessible, getLockedComingSoonCoursesStatic, describeAccessError } from "@/lib/course-accessibility";

export const Route = createFileRoute("/learn/$slug")({
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.slug
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ")} — NISQ Vanguard Academy`,
      },
      {
        name: "description",
        content: "Explore course syllabus, modules, telemetry datasets, and cyber labs.",
      },
    ],
  }),
  component: CourseDetailPage,
  notFoundComponent: () => (
    <div className="pt-28 pb-20 px-4 text-center max-w-md mx-auto">
      <h2 className="font-display text-2xl font-bold">Course Not Found</h2>
      <p className="text-sm text-muted-foreground mt-2">
        The course track you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/academy"
        className="mt-6 inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
      >
        Back to Academy
      </Link>
    </div>
  ),
});

function CourseDetailPage() {
  const { slug } = Route.useParams();
  const { user, isAdmin } = useAuth();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course-detail", slug],
    queryFn: async () => {
      // 1. Check centralized course accessibility predicate (server-side friendly)
      const accessResult = await isCourseAccessible(slug, {
        user: { isAdmin, id: user?.id ?? null, role: null },
      });

      // 2. Check locked Coming Soon catalog first (canonical COMING SOON list)
      const lockedList = getLockedComingSoonCoursesStatic();
      const lockedFound = lockedList.find((c) => c.slug === slug);
      if (!accessResult.ok && lockedFound) {
        return {
          id: lockedFound.id,
          slug: lockedFound.slug,
          title: lockedFound.title,
          description: describeAccessError("locked"),
          level: lockedFound.level,
          tier: "pro",
          sort_order: 99,
          isLocked: true,
          comingSoon: true,
        };
      }

      // 3. Query Supabase
      const { data, error } = await supabase
        .from("courses")
        .select("id,slug,title,description,level,tier,sort_order")
        .eq("slug", slug)
        .maybeSingle();

      if (data) {
        if (accessResult.ok) return { ...data, isLocked: false, comingSoon: false };
        // DB has course but predicate locked it
        return {
          ...data,
          description: describeAccessError(accessResult.reason),
          isLocked: true,
          comingSoon: accessResult.reason !== "locked",
        };
      }

      // 4. Fallback to canonical available courses
      const { AVAILABLE_COURSES } = await import("@/data/courses-curriculum");
      const canonical = AVAILABLE_COURSES.find((c) => c.slug === slug);
      if (canonical && accessResult.ok) {
        return {
          id: canonical.id,
          slug: canonical.slug,
          title: canonical.title,
          description: canonical.description,
          level: canonical.level,
          tier: canonical.tier,
          sort_order: 1,
          isLocked: false,
          comingSoon: false,
        };
      }

      throw notFound();
    },
  });

  const { data: modules, isLoading: modulesLoading } = useQuery({
    queryKey: ["course-modules", course?.id, slug],
    queryFn: async () => {
      if (course?.isLocked) return [];

      const { data } = await supabase
        .from("modules")
        .select(
          "id,course_id,slug,title,notes_md,difficulty,duration_minutes,tags,practice_labs,sort_order",
        )
        .eq("course_id", course!.id)
        .order("sort_order");

      if (data && data.length > 0) return data;

      const { AVAILABLE_COURSES } = await import("@/data/courses-curriculum");
      const found = AVAILABLE_COURSES.find((c) => c.slug === slug);
      if (found) {
        return found.modules.map((m) => ({
          id: m.id,
          course_id: found.id,
          slug: m.slug,
          title: m.title,
          notes_md: m.notes_md,
          difficulty: m.difficulty,
          duration_minutes: m.duration_minutes,
          tags: m.tags,
          practice_labs: m.companion_lab_slug ? [m.companion_lab_slug] : [],
          sort_order: m.order_index,
        }));
      }

      return [];
    },
    enabled: !!course,
  });

  const { data: userProgress } = useQuery({
    queryKey: ["course-user-progress", user?.id, course?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("module_progress")
        .select("module_id,completed")
        .eq("user_id", user.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && !!course,
  });

  if (courseLoading || modulesLoading) {
    return <DetailPageSkeleton />;
  }

  if (!course) return null;

  const completedModuleIds = new Set(
    (userProgress ?? []).filter((p) => p.completed).map((p) => p.module_id),
  );
  const totalModules = modules?.length || 0;
  const completedCount = modules?.filter((m) => completedModuleIds.has(m.id)).length || 0;
  const progressPercent = totalModules ? Math.round((completedCount / totalModules) * 100) : 0;
  const totalDuration = (modules ?? []).reduce((acc, m) => acc + (m.duration_minutes || 25), 0);

  // First uncompleted module or the first module
  const nextModule = modules?.find((m) => !completedModuleIds.has(m.id)) || modules?.[0];

  return (
    <div className="min-h-screen pt-16 pb-24">
      <PageHeader
        badge={course.level.toUpperCase()}
        badgeVariant="primary"
        title={course.title}
        subtitle={
          course.description ||
          "Master critical cybersecurity defense foundations with structured theory and live data analysis."
        }
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Academy", to: "/academy" },
          { label: course.title },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Course Syllabus & Overview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Card */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-display font-bold text-xl text-foreground">
                Course Curriculum Overview
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This curriculum combines fundamental principles with telemetry logs and hands-on
                exercises. Each module ends with practical knowledge checks and references to
                isolated Cyber Labs.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                  <div className="text-[0.65rem] font-mono text-muted-foreground uppercase">
                    Duration
                  </div>
                  <div className="font-semibold text-sm text-foreground flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>~{Math.max(1, Math.round(totalDuration / 60))} Hours</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                  <div className="text-[0.65rem] font-mono text-muted-foreground uppercase">
                    Structure
                  </div>
                  <div className="font-semibold text-sm text-foreground flex items-center gap-1.5 mt-0.5">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span>{totalModules} Modules</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                  <div className="text-[0.65rem] font-mono text-muted-foreground uppercase">
                    Practice
                  </div>
                  <div className="font-semibold text-sm text-foreground flex items-center gap-1.5 mt-0.5">
                    <Terminal className="w-4 h-4 text-success" />
                    <span>Cyber Labs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  <span>Syllabus Modules ({totalModules})</span>
                </h3>
                <span className="text-xs font-mono text-muted-foreground">
                  {completedCount} of {totalModules} Completed
                </span>
              </div>

              <div className="space-y-3">
                {(modules ?? []).map((m, index) => {
                  const isCompleted = completedModuleIds.has(m.id);
                  return (
                    <div
                      key={m.id}
                      className={`rounded-xl border transition-all p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isCompleted
                          ? "border-success/30 bg-card/60"
                          : "border-border bg-card hover:border-primary/40 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="pt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center font-mono text-[0.65rem] text-muted-foreground">
                              {index + 1}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[0.65rem] font-mono text-muted-foreground uppercase">
                              Module {index + 1}
                            </span>
                            {m.duration_minutes && (
                              <span className="text-[0.65rem] font-mono text-muted-foreground">
                                • {m.duration_minutes} min
                              </span>
                            )}
                          </div>
                          <h4 className="font-display font-bold text-base text-foreground line-clamp-1">
                            {m.title}
                          </h4>
                          {m.tags && m.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {m.tags.slice(0, 3).map((t, i) => (
                                <span
                                  key={i}
                                  className="text-[0.6rem] font-mono px-2 py-0.5 rounded-xs bg-muted text-muted-foreground"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                        <Link
                          to="/learn/$slug/$moduleSlug"
                          params={{ slug: course.slug, moduleSlug: m.slug }}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                            isCompleted
                              ? "border border-border hover:bg-muted text-foreground"
                              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                          }`}
                        >
                          <span>{isCompleted ? "Review Module" : "Start Module"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Action / Progress Widget */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-5 sticky top-20 shadow-xs">
              <div className="space-y-2">
                <span className="text-[0.65rem] font-mono uppercase px-2.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20 font-medium">
                  {course.tier === "paid" ? "SPECIALIZATION" : "INCLUDED TRACK"}
                </span>
                <h3 className="font-display font-bold text-lg text-foreground">Track Completion</h3>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Course Progress</span>
                  <span className="font-semibold text-foreground">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {nextModule && (
                <div className="pt-2">
                  <Link
                    to="/learn/$slug/$moduleSlug"
                    params={{ slug: course.slug, moduleSlug: nextModule.slug }}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 shadow-sm transition-all"
                  >
                    <Play className="w-4 h-4 fill-primary-foreground" />
                    <span>{progressPercent > 0 ? "Resume Learning" : "Start First Module"}</span>
                  </Link>
                </div>
              )}

              <div className="border-t border-border/80 pt-4 space-y-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary shrink-0" />
                  <span>Real threat actor telemetry & scenario logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-success shrink-0" />
                  <span>Hands-on practice labs in NISQ Cyber Labs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-accent shrink-0" />
                  <span>Digital Skill Points & Certificate on completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
