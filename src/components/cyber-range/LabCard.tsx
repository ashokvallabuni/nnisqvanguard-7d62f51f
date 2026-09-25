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
    beginner: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
    easy: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
    medium: "bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]",
    hard: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
    insane: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
  };

  const normalizedDiff = (lab.difficulty || "medium").toLowerCase();

  let statusLabel = "AVAILABLE";
  let statusVariant = "bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]";
  let ctaLabel = "OPEN LAB";
  let ctaIcon: typeof Play = Play;
  let ctaVariant =
    "border border-[#CBD5E1] bg-white text-[#0A192F] hover:bg-[#F8FAFC]";

  if (lab.is_active_session) {
    statusLabel = "IN PROGRESS";
    statusVariant = "bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]";
    ctaLabel = "CONTINUE LAB";
    ctaIcon = RotateCcw;
    ctaVariant = "bg-[#0284C7] text-white hover:bg-[#0369A1] shadow-sm";
  } else if (lab.completed) {
    statusLabel = "COMPLETED";
    statusVariant = "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]";
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
              className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                difficultyStyles[normalizedDiff] || "bg-[#E2E8F0] text-[#64748B] border-[#CBD5E1]"
              }`}
            >
              {lab.difficulty}
            </span>
            {lab.category && (
              <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wide">
                · {lab.category}
              </span>
            )}
          </div>

          <span
            className={`flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
              lab.is_active_session
                ? "bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD] animate-pulse"
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
              <div className="grid grid-cols-2 gap-2">
                {lab.mitre_attack_ids.slice(0, 4).map((mitre, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#0A192F] text-white border border-[#CBD5E1] truncate text-center"
                  >
                    ATT&CK® {mitre}
                  </span>
                ))}
              </div>
            )}
            {lab.skills && lab.skills.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {lab.skills.slice(0, 4).map((skill, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#E2E8F0] text-[#64748B] border border-[#CBD5E1] truncate text-center"
                  >
                    {skill}
                  </span>
                ))}
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
