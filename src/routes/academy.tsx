import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  GraduationCap,
  Layers3,
  Search,
  Shield,
  Sparkles,
  Terminal,
} from "lucide-react";
import wolfHero from "@/assets/cyber-wolf-hero.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { CourseCard, CourseData } from "@/components/academy/CourseCard";
import { GridSkeleton } from "@/components/common/SkeletonLoaders";
import { getLockedComingSoonCoursesStatic } from "@/lib/course-accessibility";

export const Route = createFileRoute("/academy")({
  head: () => ({
    meta: [
      { title: "Academy | NISQ Vanguard" },
      {
        name: "description",
        content:
          "Build practical cybersecurity skills through structured courses and hands-on labs.",
      },
    ],
  }),
  component: AcademyPage,
});

function AcademyPage() {
  const { user, isAdmin, adminView } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");

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
      if (isAdmin && adminView === "LEARNER") query = query.eq("status", "PUBLISHED");
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

  const coursesWithDetails: CourseData[] = useMemo(() => {
    const completedSet = new Set(
      (userProgress ?? []).filter((p) => p.completed).map((p) => p.module_id),
    );
    const mapped = (courses ?? []).map((course) => {
      const courseModules = (modules ?? []).filter((module) => module.course_id === course.id);
      const completed = courseModules.filter((module) => completedSet.has(module.id)).length;
      const duration = courseModules.reduce(
        (total, module) => total + (module.duration_minutes || 20),
        0,
      );
      const tags = Array.from(new Set(courseModules.flatMap((module) => module.tags || [])));
      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        summary: course.description || "Build practical defensive and threat analysis skills.",
        level: course.level || "beginner",
        category: course.tier === "paid" ? "Specialization" : "Core curriculum",
        duration_hours: Math.max(1, Math.round(duration / 60)),
        tags: tags.length ? tags : ["Security", "Defense"],
        module_count: courseModules.length || 5,
        lessons_count: courseModules.length ? courseModules.length * 3 : 15,
        progress_percent: courseModules.length ? (completed / courseModules.length) * 100 : 0,
      };
    });
    const seen = new Set<string>();
    const unique = mapped.filter((course) => {
      const key = course.slug || course.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const existingSlugs = new Set(unique.map((course) => course.slug));
    return [
      ...unique,
      ...getLockedComingSoonCoursesStatic().filter((course) => !existingSlugs.has(course.slug)),
    ];
  }, [courses, modules, userProgress]);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return coursesWithDetails
      .filter((course) => {
        const matchesSearch =
          !query ||
          course.title.toLowerCase().includes(query) ||
          course.summary.toLowerCase().includes(query) ||
          course.tags?.some((tag) => tag.toLowerCase().includes(query));
        return (
          matchesSearch && (selectedLevel === "all" || course.level.toLowerCase() === selectedLevel)
        );
      })
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "duration") return (a.duration_hours || 0) - (b.duration_hours || 0);
        return (b.progress_percent || 0) - (a.progress_percent || 0);
      });
  }, [coursesWithDetails, searchQuery, selectedLevel, sortBy]);

  const featuredCourse =
    coursesWithDetails.find((course) => course.slug === "cybersecurity-foundations") ||
    coursesWithDetails[0];

  return (
    <div className="academy-page min-h-screen pb-16">
      <main className="academy-shell">
        <nav className="academy-breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-cyan-300">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Academy</span>
        </nav>

        <section className="academy-hero" aria-labelledby="academy-heading">
          <img src={wolfHero} alt="" className="academy-hero-art" aria-hidden="true" />
          <div className="academy-hero-content">
            <span className="academy-eyebrow">NISQ Vanguard Academy</span>
            <h1 id="academy-heading">
              Learn how systems work.
              <br />
              Then learn how to defend them.
            </h1>
            <p>
              Build practical cybersecurity judgment through structured lessons, real evidence, and
              safe hands-on practice.
            </p>
            <div className="academy-hero-actions">
              <Link
                to="/learn/$slug"
                params={{ slug: featuredCourse?.slug || "cybersecurity-foundations" }}
                className="academy-button academy-button-primary"
              >
                Start learning <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a href="#learning-tracks" className="academy-button academy-button-secondary">
                View roadmap
              </a>
            </div>
          </div>
          <div className="academy-hero-stat" aria-label="Academy course statistics">
            <span>
              <strong>{coursesWithDetails.length || 6}</strong> courses
            </span>
            <span>
              <strong>100%</strong> practical focus
            </span>
          </div>
        </section>

        <div className="academy-layout" id="learning-tracks">
          <section className="academy-catalog" aria-labelledby="tracks-heading">
            <div className="academy-section-heading">
              <div>
                <span className="academy-kicker">
                  <Layers3 size={15} aria-hidden="true" /> Learning tracks
                </span>
                <h2 id="tracks-heading">Choose your next skill</h2>
              </div>
              <span className="academy-result-count" aria-live="polite">
                {filteredCourses.length} results
              </span>
            </div>

            <div className="academy-toolbar">
              <label className="academy-search">
                <Search size={17} aria-hidden="true" />
                <span className="sr-only">Search courses</span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search courses, topics, or tags"
                  type="search"
                />
              </label>
              <div className="academy-filters" role="group" aria-label="Filter by level">
                {["all", "beginner", "intermediate", "advanced"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={selectedLevel === level}
                    className={selectedLevel === level ? "is-selected" : ""}
                    onClick={() => setSelectedLevel(level)}
                  >
                    {level === "all" ? "All levels" : level}
                  </button>
                ))}
              </div>
              <label className="academy-sort">
                <span>Sort</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  aria-label="Sort courses"
                >
                  <option value="recommended">Recommended</option>
                  <option value="title">Title</option>
                  <option value="duration">Shortest</option>
                </select>
                <ChevronDown size={15} aria-hidden="true" />
              </label>
            </div>

            {coursesLoading ? (
              <GridSkeleton count={6} />
            ) : coursesError ? (
              <div className="academy-empty">
                <Shield size={28} />
                <h3>We couldn’t load the curriculum</h3>
                <p>
                  {courseError instanceof Error ? courseError.message : "Please try again shortly."}
                </p>
              </div>
            ) : filteredCourses.length ? (
              <div className="academy-course-grid">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} progress={course.progress_percent} />
                ))}
              </div>
            ) : (
              <div className="academy-empty">
                <GraduationCap size={28} />
                <h3>No courses match that search</h3>
                <p>Try a different keyword or choose all levels.</p>
              </div>
            )}
          </section>

          {featuredCourse && (
            <aside className="academy-sidebar">
              <section className="academy-featured" aria-labelledby="featured-heading">
                <span className="academy-kicker">
                  <Sparkles size={15} aria-hidden="true" /> Featured
                </span>
                <span className="academy-featured-label">Recommended start</span>
                <h2 id="featured-heading">{featuredCourse.title}</h2>
                <p>
                  Start with the foundations: understand threats, network traffic, access controls,
                  and authentication hygiene.
                </p>
                <div className="academy-featured-meta">
                  <span>
                    <BookOpen size={14} /> {featuredCourse.module_count} modules
                  </span>
                  <span>
                    <Clock3 size={14} /> {featuredCourse.duration_hours} hours
                  </span>
                  <span>
                    <Terminal size={14} /> Labs connected
                  </span>
                </div>
                <Link
                  to="/learn/$slug"
                  params={{ slug: featuredCourse.slug }}
                  className="academy-button academy-button-primary"
                >
                  Start course <ArrowRight size={16} />
                </Link>
              </section>
              <section className="academy-note" aria-label="Learning approach">
                <span className="academy-kicker">
                  <CheckCircle2 size={15} aria-hidden="true" /> Learn by doing
                </span>
                <p>Move from a clear concept to evidence, investigation, and a confident answer.</p>
                <Link to="/cyber-range/labs">
                  Explore IVVAB Labs <ArrowRight size={15} />
                </Link>
              </section>
            </aside>
          )}
        </div>
      </main>
      <footer className="academy-footer">
        <span>© {new Date().getFullYear()} NISQ Vanguard</span>
        <div>
          <Link to="/about">About</Link>
          <Link to="/academy/glossary">Glossary</Link>
          <Link to="/cyber-range/labs">IVVAB Labs</Link>
        </div>
        <span className="academy-footer-mono">
          <Database size={13} /> Built for curious defenders
        </span>
      </footer>
    </div>
  );
}
