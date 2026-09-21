import { Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Lock, Play, Terminal, Database } from "lucide-react";

export interface ModuleItem {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  order_index: number;
  duration_minutes?: number;
  has_dataset?: boolean;
  has_lab?: boolean;
  completed?: boolean;
}

interface ModuleNavigationProps {
  courseSlug: string;
  courseTitle: string;
  modules: ModuleItem[];
  currentModuleSlug?: string;
}

export function ModuleNavigation({
  courseSlug,
  courseTitle,
  modules,
  currentModuleSlug,
}: ModuleNavigationProps) {
  const sortedModules = [...modules].sort((a, b) => a.order_index - b.order_index);
  const completedCount = sortedModules.filter((m) => m.completed).length;
  const progressPercent = Math.round((completedCount / (sortedModules.length || 1)) * 100);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden sticky top-20">
      <div className="p-4 border-b border-border bg-muted/30">
        <Link
          to="/learn/$slug"
          params={{ slug: courseSlug }}
          className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors line-clamp-1 mb-1"
        >
          ← {courseTitle}
        </Link>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-semibold text-foreground">Course Syllabus</span>
          <span className="text-muted-foreground">
            {completedCount}/{sortedModules.length} Done ({progressPercent}%)
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted mt-2 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="p-2 divide-y divide-border/40 max-h-[calc(100vh-280px)] overflow-y-auto">
        {sortedModules.map((m, index) => {
          const isActive = m.slug === currentModuleSlug;
          return (
            <Link
              key={m.id}
              to="/learn/$slug/$moduleSlug"
              params={{ slug: courseSlug, moduleSlug: m.slug }}
              className={`flex items-start gap-3 p-3 rounded-lg transition-all text-left ${
                isActive
                  ? "bg-primary/10 border border-primary/30 text-foreground"
                  : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="pt-0.5 shrink-0">
                {m.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : isActive ? (
                  <Play className="w-4 h-4 text-primary fill-primary" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/60" />
                )}
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[0.65rem] font-mono text-muted-foreground uppercase">
                    Module {index + 1}
                  </span>
                  {m.duration_minutes && (
                    <span className="text-[0.65rem] font-mono text-muted-foreground">
                      {m.duration_minutes}m
                    </span>
                  )}
                </div>
                <div className={`text-xs font-medium leading-snug line-clamp-2 ${isActive ? "text-primary font-semibold" : ""}`}>
                  {m.title}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  {m.has_dataset && (
                    <span className="inline-flex items-center gap-1 text-[0.6rem] font-mono text-accent">
                      <Database className="w-3 h-3" /> Real Data
                    </span>
                  )}
                  {m.has_lab && (
                    <span className="inline-flex items-center gap-1 text-[0.6rem] font-mono text-primary">
                      <Terminal className="w-3 h-3" /> Cyber Lab
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
