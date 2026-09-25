import { Link } from "@tanstack/react-router";
import {
  Terminal,
  Clock,
  Award,
  ShieldCheck,
  ArrowRight,
  Activity,
  Zap,
  Play,
  RotateCcw,
  Eye,
} from "lucide-react";

export interface LabData {
  id: string;
  slug: string;
  title: string;
  summary: string;
  difficulty: "beginner" | "easy" | "medium" | "hard" | "insane" | string;
  category?: string;
  estimated_minutes?: number;
  mitre_attack_ids?: string[];
  points?: number;
  skills?: string[];
  is_active_session?: boolean;
  completed?: boolean;
}

interface LabCardProps {
  lab: LabData;
}

export function LabCard({ lab }: LabCardProps) {
  const difficultyStyles: Record<string, string> = {
    beginner: "bg-success/10 text-success border-success/20",
    easy: "bg-success/10 text-success border-success/20",
    medium: "bg-primary/10 text-primary border-primary/20",
    hard: "bg-warning/10 text-warning border-warning/20",
    insane: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const normalizedDiff = (lab.difficulty || "medium").toLowerCase();

  let statusLabel = "AVAILABLE";
  let statusVariant = "bg-muted/70 text-muted-foreground border-border";
  let ctaLabel = "OPEN LAB";
  let ctaIcon: typeof Play = Play;
  let ctaVariant =
    "border border-border bg-card text-foreground hover:border-primary hover:text-primary hover:bg-primary/5";

  if (lab.is_active_session) {
    statusLabel = "IN PROGRESS";
    statusVariant = "bg-primary/15 text-primary border-primary/30";
    ctaLabel = "CONTINUE LAB";
    ctaIcon = RotateCcw;
    ctaVariant = "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs";
  } else if (lab.completed) {
    statusLabel = "COMPLETED";
    statusVariant = "bg-success/15 text-success border-success/30";
    ctaLabel = "VIEW LAB DETAILS";
    ctaIcon = Award;
    ctaVariant = "border border-success/40 bg-success/5 text-success hover:bg-success/10";
  }

  return (
    <article
      aria-label={`Lab: ${lab.title}`}
      className={`group rounded-xl border bg-card hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        lab.is_active_session
          ? "border-primary ring-1 ring-primary/40 shadow-xs"
          : "border-border hover:border-primary/40"
      }`}
    >
      <div className="p-5 sm:p-6 space-y-4 flex-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[0.65rem] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-semibold ${
                difficultyStyles[normalizedDiff] || "bg-muted text-muted-foreground border-border"
              }`}
            >
              {lab.difficulty}
            </span>
            {lab.category && (
              <span className="text-[0.65rem] font-mono text-muted-foreground uppercase tracking-wide">
                · {lab.category}
              </span>
            )}
          </div>

          <span
            className={`flex items-center gap-1 text-[0.65rem] font-mono font-semibold px-2 py-0.5 rounded-full border ${
              lab.is_active_session
                ? "bg-primary/15 text-primary border-primary/30 animate-pulse"
                : statusVariant
            }`}
          >
            {lab.is_active_session ? (
              <Activity className="w-3 h-3" />
            ) : lab.completed ? (
              <ShieldCheck className="w-3 h-3" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
            {statusLabel}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-snug">
            {lab.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {lab.summary}
          </p>
        </div>

        {(lab.mitre_attack_ids && lab.mitre_attack_ids.length > 0) ||
        (lab.skills && lab.skills.length > 0) ? (
          <div className="space-y-2">
            {lab.mitre_attack_ids && lab.mitre_attack_ids.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {lab.mitre_attack_ids.slice(0, 3).map((mitre, i) => (
                  <span
                    key={i}
                    className="text-[0.6rem] font-mono px-2 py-0.5 rounded-xs bg-slate-900 text-slate-200 border border-slate-700"
                  >
                    ATT&CK® {mitre}
                  </span>
                ))}
              </div>
            )}
            {lab.skills && lab.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {lab.skills.slice(0, 3).map((skill, i) => (
                  <span
                    key={i}
                    className="text-[0.65rem] font-mono px-2 py-0.5 rounded-xs bg-muted text-muted-foreground border border-border/80"
                  >
                    {skill}
                  </span>
                ))}
                {lab.skills.length > 3 && (
                  <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded-xs bg-muted text-muted-foreground border border-border/80">
                    +{lab.skills.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="px-5 sm:px-6 py-4 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{lab.estimated_minutes ?? 45} min</span>
          </span>
          {typeof lab.points === "number" && !lab.completed && (
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-warning" />
              <span>{lab.points} XP</span>
            </span>
          )}
          {lab.completed && (
            <span className="flex items-center gap-1.5 text-success">
              <Award className="w-3.5 h-3.5" />
              <span>Awarded</span>
            </span>
          )}
        </div>

        <Link
          to="/cyber-range/lab/$slug"
          params={{ slug: lab.slug }}
          className={`inline-flex items-center gap-1.5 text-xs font-mono px-3.5 py-2 rounded-md font-semibold transition-all ${ctaVariant}`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>{ctaLabel}</span>
          <ArrowRight className="w-3 h-3 opacity-70 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
