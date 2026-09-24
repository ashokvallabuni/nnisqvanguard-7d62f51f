import { Link } from "@tanstack/react-router";
import { BookOpen, Clock, Award, ArrowRight, ShieldCheck, Database } from "lucide-react";

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

  return (
    <div className="group rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div className="p-5 sm:p-6 space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-[0.65rem] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-medium ${
              levelStyles[course.level.toLowerCase()] ||
              "bg-muted text-muted-foreground border-border"
            }`}
          >
            {course.level}
          </span>
          {course.category && (
            <span className="text-[0.65rem] font-mono text-muted-foreground uppercase tracking-tight">
              {course.category}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <h3 className="font-display font-bold text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1">
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

      <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-border/60 bg-muted/20 space-y-3">
        {currentProgress > 0 && (
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
          </div>

          <Link
            to="/learn/$slug"
            params={{ slug: course.slug }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 group/btn transition-colors"
          >
            <span>
              {currentProgress > 0 ? (isCompleted ? "Review" : "Continue") : "Start Course"}
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
