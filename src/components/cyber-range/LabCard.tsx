import { Link } from "@tanstack/react-router";
import { Terminal, Clock, Award, ShieldCheck, ArrowRight, Activity, Zap } from "lucide-react";

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

  return (
    <div
      className={`group rounded-xl border bg-card hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        lab.is_active_session
          ? "border-primary ring-1 ring-primary/40 shadow-xs"
          : "border-border hover:border-primary/40"
      }`}
    >
      <div className="p-5 sm:p-6 space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-[0.65rem] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-medium ${
                difficultyStyles[lab.difficulty.toLowerCase()] || "bg-muted text-muted-foreground border-border"
              }`}
            >
              {lab.difficulty}
            </span>
            {lab.category && (
              <span className="text-[0.65rem] font-mono text-muted-foreground uppercase">
                {lab.category}
              </span>
            )}
          </div>

          {lab.is_active_session ? (
            <span className="flex items-center gap-1 text-[0.65rem] font-mono font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 animate-pulse">
              <Activity className="w-3 h-3" /> ACTIVE
            </span>
          ) : lab.completed ? (
            <span className="flex items-center gap-1 text-[0.65rem] font-mono font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
              <ShieldCheck className="w-3 h-3" /> SOLVED
            </span>
          ) : lab.points ? (
            <span className="flex items-center gap-1 text-[0.65rem] font-mono text-muted-foreground">
              <Zap className="w-3 h-3 text-warning" /> {lab.points} XP
            </span>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {lab.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {lab.summary}
          </p>
        </div>

        {lab.mitre_attack_ids && lab.mitre_attack_ids.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {lab.mitre_attack_ids.slice(0, 3).map((mitre, i) => (
              <span
                key={i}
                className="text-[0.6rem] font-mono px-2 py-0.5 rounded-xs bg-slate-900 text-slate-200 border border-slate-700"
              >
                ATT&CK: {mitre}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-border/60 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{lab.estimated_minutes ?? 45} min</span>
        </div>

        <Link
          to="/cyber-range/lab/$slug"
          params={{ slug: lab.slug }}
          className={`inline-flex items-center gap-1.5 text-xs font-mono px-3.5 py-1.5 rounded-md font-semibold transition-all ${
            lab.is_active_session
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
              : "border border-border bg-card text-foreground hover:border-primary hover:text-primary"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>{lab.is_active_session ? "Resume Lab" : "Enter Lab"}</span>
        </Link>
      </div>
    </div>
  );
}
