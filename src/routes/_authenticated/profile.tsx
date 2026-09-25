import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/common/PageHeader";
import {
  User,
  Mail,
  Shield,
  Building2,
  GraduationCap,
  MapPin,
  Briefcase,
  ArrowRight,
  BookOpen,
  Terminal,
  Award,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user, profile } = useAuth();

  const accountType = profile?.account_type ?? "STUDENT";
  const accountLabel =
    accountType === "ORGANIZATION"
      ? "Organization"
      : accountType === "COLLEGE"
        ? "College"
        : "Learner";

  return (
    <main className="min-h-screen">
      <PageHeader
        badge="USER WORKSPACE"
        badgeVariant="accent"
        title="Profile"
        subtitle="Manage your NISQ Vanguard identity and preferences."
        breadcrumbs={[{ label: "PROFILE" }]}
      />

      <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="rounded-xl border border-border bg-card p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-border flex items-center justify-center shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <h2 className="font-display text-2xl font-bold text-foreground truncate">
                {profile?.full_name ?? "Your Profile"}
              </h2>
              <p className="text-sm text-muted-foreground font-mono truncate">{user?.email}</p>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={`inline-flex items-center gap-1.5 text-[0.65rem] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                    accountType === "ORGANIZATION"
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                      : accountType === "COLLEGE"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-violet-500/40 bg-violet-500/10 text-violet-400"
                  }`}
                >
                  {accountType === "ORGANIZATION" ? (
                    <Building2 className="w-3 h-3" />
                  ) : accountType === "COLLEGE" ? (
                    <GraduationCap className="w-3 h-3" />
                  ) : (
                    <Shield className="w-3 h-3" />
                  )}
                  {accountLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Contact
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-foreground truncate">{user?.email ?? "Not set"}</span>
              </div>
              {profile?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-4 h-4 text-muted-foreground text-center shrink-0">📱</span>
                  <span className="text-foreground">{profile.phone}</span>
                </div>
              )}
              {profile?.country && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{profile.country}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Details
            </h3>
            <div className="space-y-2.5">
              {profile?.organization && (
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{profile.organization}</span>
                </div>
              )}
              {profile?.designation && (
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{profile.designation}</span>
                </div>
              )}
              {profile?.college && (
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{profile.college}</span>
                </div>
              )}
              {profile?.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
              )}
              {!profile?.organization &&
                !profile?.designation &&
                !profile?.college &&
                !profile?.bio && (
                  <p className="text-sm text-muted-foreground">
                    Profile details will appear here as you update your account.
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/dashboard"
              className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted/50 hover:border-primary/30 transition-all text-sm font-semibold text-foreground group"
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-primary" /> VIEW PROGRESS
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link
              to="/achievements"
              className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted/50 hover:border-primary/30 transition-all text-sm font-semibold text-foreground group"
            >
              <span className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-primary" /> VIEW CERTIFICATES
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link
              to="/cyber-range/labs"
              className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted/50 hover:border-primary/30 transition-all text-sm font-semibold text-foreground group"
            >
              <span className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-primary" /> OPEN CYBER LABS
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link
              to="/reporting"
              className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted/50 hover:border-warning/30 transition-all text-sm font-semibold text-foreground group"
            >
              <span className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-warning" /> REPORT INCIDENT
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-warning transition-colors" />
            </Link>
          </div>
        </div>

        {/* Info Note */}
        <div className="rounded-lg border border-border/60 bg-muted/20 px-5 py-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Profile editing is managed through your secured NISQ Vanguard account. Additional
            settings and preferences will appear here as the platform develops.
          </p>
        </div>
      </div>
    </main>
  );
}
