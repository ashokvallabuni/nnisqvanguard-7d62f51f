import { Link } from "@tanstack/react-router";
import { ArrowRight, Award, BookOpen, Clock3, Database, Lock, Sparkles } from "lucide-react";

export interface CourseData {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description?: string;
  level: "beginner" | "intermediate" | "advanced" | "comprehensive" | string;
  category?: string;
  duration_hours?: number;
  tags?: string[];
  module_count?: number;
  lessons_count?: number;
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
  const isLocked = !!course.isLocked;
  const isComingSoon = !!course.comingSoon;
  const notAccessible = isLocked || isComingSoon;
  const levelClass = `academy-level academy-level-${course.level.toLowerCase()}`;

  return (
    <article className={`academy-course-card group ${notAccessible ? "is-locked" : ""}`}>
      <div className="academy-card-body">
        <div className="academy-card-topline">
          <span className={levelClass}>{course.level}</span>
          {course.category && !notAccessible && (
            <span className="academy-card-category">{course.category}</span>
          )}
          {isComingSoon && (
            <span className="academy-card-category">
              <Sparkles size={13} /> Coming soon
            </span>
          )}
          {isLocked && !isComingSoon && (
            <span className="academy-card-category">
              <Lock size={13} /> Locked
            </span>
          )}
        </div>
        <div>
          <h3 className="academy-course-title">{course.title}</h3>
          <p className="academy-course-summary">{course.summary}</p>
        </div>
        {course.tags?.length ? (
          <div className="academy-tags" aria-label="Course topics">
            {course.tags.slice(0, 3).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="academy-card-footer">
        {currentProgress > 0 && !notAccessible && (
          <div className="academy-progress">
            <div>
              <span>Your progress</span>
              <strong>{Math.round(currentProgress)}%</strong>
            </div>
            <div className="academy-progress-track">
              <span style={{ width: `${Math.min(100, currentProgress)}%` }} />
            </div>
          </div>
        )}
        <div className="academy-card-meta">
          <div>
            {course.module_count !== undefined && (
              <span>
                <BookOpen size={14} /> {course.module_count} modules
              </span>
            )}
            {course.duration_hours !== undefined && (
              <span>
                <Clock3 size={14} /> {course.duration_hours}h
              </span>
            )}
            {course.lessons_count !== undefined && <span>{course.lessons_count} lessons</span>}
            {course.has_real_dataset && (
              <span title="Includes real telemetry dataset">
                <Database size={14} />
              </span>
            )}
            {isCompleted && !notAccessible && (
              <span className="academy-complete">
                <Award size={14} /> Complete
              </span>
            )}
          </div>
          {notAccessible ? (
            <button type="button" disabled className="academy-card-action is-disabled">
              <Lock size={14} /> {isComingSoon ? "Soon" : "Locked"}
            </button>
          ) : (
            <Link
              to="/learn/$slug"
              params={{ slug: course.slug }}
              className="academy-card-action"
              aria-label={`${currentProgress > 0 ? "Continue" : "Start"} ${course.title}`}
            >
              {currentProgress > 0 ? "Continue" : "Start"} <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
