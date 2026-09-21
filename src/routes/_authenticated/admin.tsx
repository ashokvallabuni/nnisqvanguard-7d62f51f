import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  CalendarCheck,
  ShieldAlert,
  Users,
  FileText,
  School,
  LogOut,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Console — CyberShield India" }] }),
  component: AdminLayout,
});

const items = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/admin/complaints", label: "Complaints", icon: ShieldAlert },
  { to: "/admin/team", label: "Team", icon: Users },
  { to: "/admin/content", label: "CMS Content", icon: FileText },
  { to: "/admin/colleges", label: "Colleges", icon: School },
];

function AdminLayout() {
  const { profile, loading, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (loading || !profile)
    return (
      <main className="pt-24 px-6 mono text-xs text-muted-foreground">LOADING SESSION...</main>
    );
  if (profile.role !== "admin")
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center">
        <div className="glass rounded-xl p-10 text-center">
          <div className="display text-5xl text-destructive">403</div>
          <p className="mono text-xs mt-3 text-destructive">ACCESS DENIED</p>
        </div>
      </main>
    );

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground hidden md:flex flex-col">
        <Link to="/" className="flex items-center gap-2 p-5 border-b border-sidebar-border">
          <Shield className="w-6 h-6 text-cyber" />
          <div>
            <div className="display text-sm tracking-widest text-cyber">CYBERSHIELD</div>
            <div className="mono text-[0.55rem] text-muted-foreground">ADMIN CONSOLE</div>
          </div>
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((i) => {
            const active = i.exact ? pathname === i.to : pathname.startsWith(i.to);
            return (
              <Link
                key={i.to}
                to={i.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-md mono text-[0.7rem] transition ${active ? "bg-primary/15 text-cyber border border-primary/40" : "text-muted-foreground hover:bg-sidebar-accent"}`}
              >
                <i.icon className="w-4 h-4" /> {i.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={signOut}
          className="m-3 flex items-center gap-2 px-3 py-2 rounded-md mono text-[0.7rem] border border-border hover:bg-sidebar-accent"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="md:hidden flex items-center gap-2 p-3 border-b border-border">
          <Shield className="w-5 h-5 text-cyber" />
          <span className="display text-cyber">ADMIN</span>
          <nav className="ml-auto flex gap-1 overflow-auto">
            {items.map((i) => (
              <Link key={i.to} to={i.to} className="mono text-[0.55rem] px-2 py-1 rounded border">
                {i.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
