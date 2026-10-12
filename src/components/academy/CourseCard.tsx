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
  lesson_count?: number;
  assessment_status?: string;
  imageUrl?: string;
}

interface CourseCardProps {
  course: CourseData;
  progress?: number;
}

export function CourseCard({ course, progress }: CourseCardProps) {
  const currentProgress = progress ?? course.progress_percent ?? 0;
  const isCompleted = currentProgress >= 100;

  const isLocked = !!course.isLocked;
  const isComingSoon = !!course.comingSoon;
  const notAccessible = isLocked || isComingSoon;

  return (
    <div
      className={`group h-full flex flex-col justify-between overflow-hidden transition-all duration-200 hover:-translate-y-1 ${
        notAccessible ? "opacity-70 grayscale-[0.3]" : ""
      }`}
      style={{
        backgroundColor: "var(--course-card-bg)",
        borderColor: "var(--course-card-border)",
        borderWidth: "1px",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(10, 124, 255, 0.05)",
      }}
      aria-label={`${course.title} ${notAccessible ? "locked course" : "course"}`}
    >
      {/* Thumbnail Area */}
      <div className="h-40 w-full relative overflow-hidden bg-white/50 border-b border-[var(--course-card-border)] flex items-center justify-center">
        {course.imageUrl ? (
          <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--course-card-bg)] to-[var(--course-card-border)] opacity-50 flex items-center justify-center">
            <ShieldCheck className="w-12 h-12 text-[var(--course-btn-bg)] opacity-30" />
          </div>
        )}
        
        {/* Badges Overlay on Thumbnail */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isComingSoon && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-1 rounded border bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              <span>Coming Soon</span>
            </span>
          )}
          {isLocked && !isComingSoon && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-1 rounded border bg-red-50/90 text-red-600 border-red-200 shadow-sm backdrop-blur-sm">
              <Lock className="w-3 h-3" />
              <span>Locked</span>
            </span>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 justify-between">
        <div className="space-y-2 flex-1">
          <h3
            className="font-bold text-lg leading-snug line-clamp-2"
            style={{ color: "var(--course-title)" }}
          >
            {course.title}
          </h3>
          <p
            className="text-sm line-clamp-3 leading-relaxed"
            style={{ color: "var(--course-text)" }}
          >
            {course.summary}
          </p>
        </div>

        {/* Meta Row */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium" style={{ color: "var(--course-text)" }}>
          <span className="flex items-center gap-1.5 capitalize">
            <ShieldCheck className="w-4 h-4" />
            {course.level}
          </span>
          {course.duration_hours && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {course.duration_hours}H
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            {course.lesson_count || (course.module_count || 5) * 3} Lessons
          </span>
        </div>

        {currentProgress > 0 && !notAccessible && (
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold" style={{ color: "var(--course-title)" }}>
              <span>Progress</span>
              <span>{Math.round(currentProgress)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--course-card-border)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, currentProgress)}%`,
                  backgroundColor: isCompleted ? "#10B981" : "var(--course-btn-bg)"
                }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 pt-2">
          {notAccessible ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-[10px] bg-[var(--course-card-border)]/60 text-[var(--course-title)]/60 cursor-not-allowed opacity-60 select-none transition-all duration-200"
            >
              <Lock className="w-4 h-4" />
              <span>{isComingSoon ? "COMING SOON" : "LOCKED"}</span>
            </button>
          ) : (
            <Link
              to="/learn/$slug"
              params={{ slug: course.slug }}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-[10px] bg-[var(--course-btn-bg)] text-[var(--course-btn-text)] shadow-card hover:bg-[var(--course-btn-hover)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer select-none"
            >
              <span>{currentProgress >= 100 ? "View Course" : currentProgress > 0 ? "Continue Learning" : "Enroll"}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
