import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/common/PageHeader";
import { Building, Shield, FileText, Calendar, Activity } from "lucide-react";

export function OrganizationDashboard() {
  const { user, profile, signOut } = useAuth();

  return (
    <div className="min-h-screen pt-16 pb-24">
      <PageHeader
        badge="ORGANIZATION PORTAL"
        badgeVariant="secondary"
        title={`Welcome back, ${profile?.full_name || profile?.organization || user?.email?.split("@")[0] || "Partner"}`}
        subtitle="Manage enterprise security services, incident reporting, and consulting appointments."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Organization Dashboard" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                ROLE WORKSPACE: <span className="text-accent font-bold">ORGANIZATION</span>
              </span>
            </div>
            <span className="font-mono text-[0.65rem] text-muted-foreground uppercase">
              Authenticated Session
            </span>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-2.5 items-center">
            <Link
              to="/"
              className="px-3.5 py-2 rounded-lg text-xs font-mono font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
            >
              HOME
            </Link>
            <Link
              to="/solutions"
              className="px-3.5 py-2 rounded-lg text-xs font-mono font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-colors"
            >
              SERVICES
            </Link>
            <Link
              to="/solutions/consulting"
              className="px-3.5 py-2 rounded-lg text-xs font-mono font-semibold bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 transition-colors"
            >
              REQUEST CONSULTATION
            </Link>
            <Link
              to="/complaint"
              className="px-3.5 py-2 rounded-lg text-xs font-mono font-semibold bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 transition-colors"
            >
              REPORT INCIDENT
            </Link>
            <Link
              to="/solutions/consulting"
              className="px-3.5 py-2 rounded-lg text-xs font-mono font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
            >
              APPOINTMENTS
            </Link>
            <Link
              to="/profile"
              className="px-3.5 py-2 rounded-lg text-xs font-mono font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
            >
              PROFILE
            </Link>
            <button
              onClick={() => void signOut()}
              className="px-3.5 py-2 rounded-lg text-xs font-mono font-semibold text-muted-foreground hover:text-destructive border border-border transition-colors"
            >
              LOGOUT
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/complaint"
            className="p-6 rounded-xl border border-border bg-card hover:border-destructive/40 transition-colors space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">Report Incident</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Submit a secure report regarding a breach, vulnerability, or active threat.
              </p>
            </div>
          </Link>

          <Link
            to="/solutions/consulting"
            className="p-6 rounded-xl border border-border bg-card hover:border-accent/40 transition-colors space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">Consulting Appointments</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your upcoming risk assessment and advisory bookings.
              </p>
            </div>
          </Link>

          <Link
            to="/solutions"
            className="p-6 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">Enterprise Services</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Explore compliance frameworks, vCISO integration, and advanced security solutions.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
