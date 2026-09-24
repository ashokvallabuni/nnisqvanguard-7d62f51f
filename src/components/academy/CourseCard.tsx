import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Clock,
  Award,
  ArrowRight,
  ShieldCheck,
  Database,
  Lock,
  Sparkles,
} from "lucide-react";

export interface CourseData {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description?: string;
  level: "beginner" | "intermediate" | "advanced" | string;
  category?: string;
  duration_hours?: number;
  tags?: string[];
  module_count?: number;
  has_real_dataset?: boolean;
  progress_percent?: number;
  isLocked?: boolean;
  comingSoon?: boolean;
}

interface CourseCardProps {
  course: CourseData;
  progress?: number;
}

export function CourseCard({ course, progress }: CourseCardProps) {
  const currentProgress = progress ?? course.progress_percent ?? 0;
  const isCompleted = currentProgress >= 100;

  const levelStyles: Record<string, string> = {
    beginner: "bg-success/10 text-success border-success/20",
    intermediate: "bg-primary/10 text-primary border-primary/20",
    advanced: "bg-warning/10 text-warning border-warning/20",
  };

  const isLocked = !!course.isLocked;
  const isComingSoon = !!course.comingSoon;
  const notAccessible = isLocked || isComingSoon;

  return (
    <div
      className={`group rounded-xl border bg-card flex flex-col justify-between overflow-hidden transition-all duration-200 ${
        notAccessible
          ? "border-border/70 opacity-80 grayscale-[0.4]"
          : "border-border hover:border-primary/40 hover:shadow-md"
      }`}
      aria-label={`${course.title} ${notAccessible ? "locked course" : "course"}`}
    >
      <div className="p-5 sm:p-6 space-y-3.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span
            className={`text-[0.65rem] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-medium ${
              levelStyles[course.level.toLowerCase()] ||
              "bg-muted text-muted-foreground border-border"
            }`}
          >
            {course.level}
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            {course.category && !notAccessible && (
              <span className="text-[0.65rem] font-mono text-muted-foreground uppercase tracking-tight">
                {course.category}
              </span>
            )}
            {isComingSoon && (
              <span className="inline-flex items-center gap-1 text-[0.6rem] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-warning/40 bg-warning/10 text-warning font-semibold">
                <Sparkles className="w-3 h-3" />
                <span>Coming Soon</span>
              </span>
            )}
            {isLocked && !isComingSoon && (
              <span className="inline-flex items-center gap-1 text-[0.6rem] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-destructive/30 bg-destructive/5 text-destructive font-semibold">
                <Lock className="w-3 h-3" />
                <span>Locked</span>
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <h3
            className={`font-display font-bold text-lg sm:text-xl group-hover:text-primary transition-colors line-clamp-1 ${
              notAccessible ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {course.summary}
          </p>
        </div>

        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {course.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[0.65rem] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className={`px-5 sm:px-6 pb-5 pt-3 border-t border-border/60 bg-muted/20 space-y-3 ${
          notAccessible ? "bg-muted/10" : ""
        }`}
      >
        {currentProgress > 0 && !notAccessible && (
          <div className="space-y-1">
            <div className="flex justify-between text-[0.7rem] font-mono text-muted-foreground">
              <span>Progress</span>
              <span className="font-semibold text-foreground">{Math.round(currentProgress)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isCompleted ? "bg-success" : "bg-primary"
                }`}
                style={{ width: `${Math.min(100, currentProgress)}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
            {course.module_count !== undefined && (
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {course.module_count} modules
              </span>
            )}
            {course.duration_hours && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {course.duration_hours}h
              </span>
            )}
            {course.has_real_dataset && (
              <span
                className="flex items-center gap-1 text-accent"
                title="Includes real telemetry dataset"
              >
                <Database className="w-3.5 h-3.5" />
              </span>
            )}
            {isCompleted && !notAccessible && (
              <span className="flex items-center gap-1 text-success">
                <Award className="w-3.5 h-3.5" />
                Completed
              </span>
            )}
          </div>

          {notAccessible ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              aria-label={`${course.title} is locked`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground cursor-not-allowed bg-muted/60 border border-border/80 rounded-md px-2.5 py-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isComingSoon ? "COMING SOON" : "LOCKED"}</span>
            </button>
          ) : currentProgress >= 100 ? (
            <Link
              to="/learn/$slug"
              params={{ slug: course.slug }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 group/btn transition-colors"
              aria-label={`View ${course.title} course`}
            >
              <span>VIEW COURSE</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          ) : currentProgress > 0 ? (
            <Link
              to="/learn/$slug"
              params={{ slug: course.slug }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 group/btn transition-colors"
              aria-label={`Continue ${course.title}`}
            >
              <span>CONTINUE</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <Link
              to="/learn/$slug"
              params={{ slug: course.slug }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 group/btn transition-colors"
              aria-label={`Start ${course.title} course`}
            >
              <span>START COURSE</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
