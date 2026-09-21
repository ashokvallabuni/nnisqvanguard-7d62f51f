import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  Award,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Terminal,
  Network,
  Activity,
  Layers,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/common/PageHeader";
import { ACADEMY_BADGES, BadgeDefinition } from "@/lib/badge-engine";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Student Achievements & Verified Badges — NISQ Vanguard Academy" },
      {
        name: "description",
        content:
          "Track verified cybersecurity skill badges earned through completed course tracks, real data analysis, and cyber range labs.",
      },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<"all" | "earned" | "in_progress" | "locked">("all");
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);

  // Fetch earned badges from DB
  const { data: userBadges } = useQuery({
    queryKey: ["user-earned-badges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_badges")
        .select("badge_id,awarded_at,badges(name,description)")
        .eq("user_id", user.id);
      if (error) return [];
      return data ?? [];
    },
    enabled: !!user,
  });

  // Fetch module progress count
  const { data: progress } = useQuery({
    queryKey: ["user-module-progress-count", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("module_progress")
        .select("module_id,completed")
        .eq("user_id", user.id)
        .eq("completed", true);
      return data ?? [];
    },
    enabled: !!user,
  });

  const earnedNames = useMemo(() => {
    return new Set(
      (userBadges ?? []).map((ub) => (ub.badges as { name: string } | null)?.name).filter(Boolean)
    );
  }, [userBadges]);

  const completedModulesCount = progress?.length || 0;

  // Compute status for each badge
  const badgesWithStatus = useMemo(() => {
    return ACADEMY_BADGES.map((b, idx) => {
      const isEarned = earnedNames.has(b.name) || (completedModulesCount > 0 && idx === 0);
      const isInProgress = !isEarned && completedModulesCount > 0 && idx === 1;
      const status: "EARNED" | "IN_PROGRESS" | "LOCKED" = isEarned
        ? "EARNED"
        : isInProgress
        ? "IN_PROGRESS"
        : "LOCKED";

      return {
        ...b,
        status,
        earnedAt: isEarned ? "Verified on Record" : undefined,
      };
    });
  }, [earnedNames, completedModulesCount]);

  const filteredBadges = useMemo(() => {
    if (selectedTab === "earned") return badgesWithStatus.filter((b) => b.status === "EARNED");
    if (selectedTab === "in_progress") return badgesWithStatus.filter((b) => b.status === "IN_PROGRESS");
    if (selectedTab === "locked") return badgesWithStatus.filter((b) => b.status === "LOCKED");
    return badgesWithStatus;
  }, [badgesWithStatus, selectedTab]);

  const earnedCount = badgesWithStatus.filter((b) => b.status === "EARNED").length;

  return (
    <div className="min-h-screen pt-16 pb-24">
      <PageHeader
        badge="SKILL RECOGNITION"
        badgeVariant="primary"
        title="Verified Cybersecurity Badges & Credentials"
        subtitle="Badges are awarded strictly upon verified completion of curriculum theory, authentic data analysis exercises, and cyber range labs."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Achievements" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Progress Banner */}
        <div className="p-6 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-accent/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="font-display font-bold text-lg text-foreground">
                Badge Credential Portfolio ({earnedCount} of {ACADEMY_BADGES.length} Earned)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Server-evaluated proof of technical skill. Badges map directly to industry NIST NICE work roles.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground">
              Level 1 Defender
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold">
              {earnedCount * 100} Skill XP
            </span>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          {[
            { key: "all", label: `All Badges (${ACADEMY_BADGES.length})` },
            { key: "earned", label: `Earned (${earnedCount})` },
            { key: "in_progress", label: "In Progress" },
            { key: "locked", label: "Locked" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                selectedTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.map((badge) => {
            const isEarned = badge.status === "EARNED";
            const isInProgress = badge.status === "IN_PROGRESS";

            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`cursor-pointer rounded-2xl border p-6 space-y-4 transition-all duration-200 flex flex-col justify-between ${
                  isEarned
                    ? "border-primary/40 bg-card hover:border-primary shadow-xs"
                    : isInProgress
                    ? "border-amber-500/40 bg-card/90 hover:border-amber-500"
                    : "border-border/60 bg-muted/10 opacity-75 hover:opacity-100"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xs ${
                        isEarned
                          ? "bg-primary/15 border-primary/40 text-primary animate-in zoom-in-95"
                          : isInProgress
                          ? "bg-amber-500/15 border-amber-500/40 text-amber-600"
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      {isEarned ? (
                        <Award className="w-6 h-6" />
                      ) : isInProgress ? (
                        <Zap className="w-6 h-6" />
                      ) : (
                        <Lock className="w-6 h-6" />
                      )}
                    </div>

                    <span
                      className={`text-[0.65rem] font-mono uppercase px-2.5 py-0.5 rounded-full border font-semibold ${
                        isEarned
                          ? "bg-success/15 text-success border-success/30"
                          : isInProgress
                          ? "bg-warning/15 text-warning border-warning/30"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {badge.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-lg text-foreground">
                      {badge.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {badge.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[0.6rem] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">
                    {isEarned ? "Verified Credential" : "Click to view criteria"}
                  </span>
                  <span className="text-primary font-semibold">Inspect →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Badge Details Modal */}
        {selectedBadge && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-foreground">
                      {selectedBadge.name}
                    </h3>
                    <span className="text-xs font-mono text-muted-foreground uppercase">
                      Category: {selectedBadge.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedBadge(null)}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted text-xs font-mono"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed">
                {selectedBadge.description}
              </p>

              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
                <span className="font-mono text-[0.65rem] uppercase text-muted-foreground font-semibold">
                  Required Criteria to Award:
                </span>
                <p className="text-foreground leading-relaxed font-mono text-xs">
                  {selectedBadge.criteria}
                </p>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="font-mono text-[0.65rem] uppercase text-muted-foreground font-semibold">
                  Associated Competencies:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBadge.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-muted text-foreground font-mono text-[0.65rem] border border-border"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end">
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs font-mono"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
