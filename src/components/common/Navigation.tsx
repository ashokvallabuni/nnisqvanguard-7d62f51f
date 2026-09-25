import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import {
  Home,
  BookOpen,
  Terminal,
  Shield,
  Radar,
  User,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  Award,
  Calendar,
  ChevronDown,
  GraduationCap,
  Building2,
  Settings,
  FileText,
  BarChart3,
  Users,
  MessageSquare,
} from "lucide-react";

const nisqLogoUrl = "/assets/nisq-logo.jpeg";

/* ─── Telemetry Ticker ─────────────────────────────────────────────── */
export function TelemetryTicker() {
  return (
    <div className="w-full bg-zinc-950 border-b border-slate-800/60 text-[0.6rem] font-mono flex items-center justify-center px-4 py-1 overflow-hidden select-none">
      <div className="flex items-center gap-3 whitespace-nowrap text-slate-500">
        <span className="text-emerald-500 text-[0.5rem]">●</span>
        <span className="text-slate-400 tracking-[0.15em]">NISQ VANGUARD</span>
        <span className="text-slate-700">—</span>
        <span className="text-slate-500 tracking-wider">DEFENCE TECHNOLOGIES</span>
        <span className="text-slate-700">—</span>
        <span className="text-emerald-500/70 tracking-wider">SYSTEMS OPERATIONAL</span>
      </div>
    </div>
  );
}

/* ─── Role-based nav items ─────────────────────────────────────────── */
type NavItem = { to: string; label: string; icon: typeof Home };

function getPublicNav(): NavItem[] {
  return [
    { to: "/", label: "HOME", icon: Home },
    { to: "/academy", label: "ACADEMY", icon: BookOpen },
    { to: "/cyber-range/labs", label: "CYBER LABS", icon: Terminal },
    { to: "/services", label: "SERVICES", icon: Shield },
    { to: "/intelligence", label: "THREAT INTEL", icon: Radar },
  ];
}

function getLearnerNav(): NavItem[] {
  return [
    { to: "/", label: "HOME", icon: Home },
    { to: "/academy", label: "ACADEMY", icon: BookOpen },
    { to: "/cyber-range/labs", label: "CYBER LABS", icon: Terminal },
    { to: "/dashboard", label: "PROGRESS", icon: BarChart3 },
    { to: "/intelligence", label: "THREAT INTEL", icon: Radar },
  ];
}

function getOrgNav(): NavItem[] {
  return [
    { to: "/", label: "HOME", icon: Home },
    { to: "/services", label: "SERVICES", icon: Shield },
    { to: "/intelligence", label: "THREAT INTEL", icon: Radar },
    { to: "/appointments", label: "APPOINTMENTS", icon: Calendar },
    { to: "/reporting", label: "REPORT INCIDENT", icon: AlertTriangle },
  ];
}

function getCollegeNav(): NavItem[] {
  return [
    { to: "/", label: "HOME", icon: Home },
    { to: "/campus", label: "CAMPUS", icon: Building2 },
    { to: "/programs", label: "PROGRAMS", icon: GraduationCap },
    { to: "/appointments", label: "APPOINTMENTS", icon: Calendar },
    { to: "/reporting", label: "REPORT INCIDENT", icon: AlertTriangle },
  ];
}

function getAdminNav(): NavItem[] {
  return [
    { to: "/", label: "HOME", icon: Home },
    { to: "/academy", label: "ACADEMY", icon: BookOpen },
    { to: "/cyber-range/labs", label: "CYBER LABS", icon: Terminal },
    { to: "/intelligence", label: "THREAT INTEL", icon: Radar },
    { to: "/admin", label: "ADMIN", icon: Settings },
  ];
}

type ActiveRole = "STUDENT" | "ORGANIZATION" | "COLLEGE" | "ADMIN";

function resolveRole(profile: any, isAdmin: boolean, adminView: string): ActiveRole {
  if (isAdmin) {
    if (adminView === "LEARNER") return "STUDENT";
    if (adminView === "ORGANIZATION") return "ORGANIZATION";
    return "ADMIN";
  }
  const rawRole = profile?.role?.toString()?.toUpperCase();
  if (profile?.account_type === "ORGANIZATION" || rawRole === "ORGANIZATION" || profile?.organization)
    return "ORGANIZATION";
  if (profile?.account_type === "COLLEGE" || rawRole === "COLLEGE" || profile?.college)
    return "COLLEGE";
  return "STUDENT";
}

function getNavForRole(role: ActiveRole, isPublic: boolean): NavItem[] {
  if (isPublic) return getPublicNav();
  switch (role) {
    case "ORGANIZATION": return getOrgNav();
    case "COLLEGE": return getCollegeNav();
    case "ADMIN": return getAdminNav();
    default: return getLearnerNav();
  }
}

/* ─── Top Nav ──────────────────────────────────────────────────────── */
export function TopNav() {
  const { user, profile, isAdmin, adminView, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/_authenticated/admin") || pathname.startsWith("/admin")) return null;

  const activeRole = resolveRole(profile, isAdmin, adminView);
  const isPublic = !user;
  const navItems = getNavForRole(activeRole, isPublic);

  return (
    <nav className="w-full z-50 px-4 py-3 pointer-events-none flex items-center justify-between transition-all" aria-label="Main navigation">
      {/* Logo */}
      <Link to="/" className="pointer-events-auto flex items-center gap-2.5 group shrink-0" aria-label="NISQ Vanguard home">
        <div className="w-10 h-10 rounded-lg border border-cyan-500/30 bg-black/50 backdrop-blur-md overflow-hidden shadow-[0_0_12px_rgba(0,240,255,0.1)] flex items-center justify-center">
          <img src={nisqLogoUrl} alt="NISQ Vanguard logo" className="w-full h-full object-cover" />
        </div>
      </Link>

      {/* Desktop: Floating Glass Pill Nav */}
      <div className="pointer-events-auto hidden md:flex items-center gap-0.5 glass px-1.5 py-1.5 rounded-full mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono font-semibold text-[0.65rem] tracking-wider transition-all duration-200 ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_12px_rgba(0,240,255,0.08)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Right: Auth Actions */}
      <div className="pointer-events-auto flex items-center gap-2 glass px-3 py-1.5 rounded-full shrink-0">
        {isPublic ? (
          <>
            <Link to="/login" className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors tracking-wide">
              SIGN IN
            </Link>
            <Link to="/auth" className="px-4 py-1.5 rounded-full bg-cyan-500 text-black font-semibold text-xs hover:bg-cyan-400 transition-all duration-200 tracking-wide">
              GET STARTED
            </Link>
          </>
        ) : (
          <div className="relative group/profile flex items-center gap-2 pl-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
              <User className="w-4 h-4 text-slate-400" />
            </div>
            <ChevronDown className="w-3 h-3 text-slate-500 group-hover/profile:text-white transition-colors" />
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-200 py-1.5 z-50">
              <div className="px-4 py-2.5 border-b border-slate-800/60 mb-1">
                <div className="text-[0.6rem] font-mono text-cyan-400/80 tracking-wider">ACCOUNT</div>
                <div className="text-xs text-slate-300 truncate mt-0.5">{user?.email}</div>
              </div>
              <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
                <BarChart3 className="w-3.5 h-3.5" /> VIEW PROGRESS
              </Link>
              <Link to="/achievements" className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
                <Award className="w-3.5 h-3.5" /> CERTIFICATES & BADGES
              </Link>
              <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
                <User className="w-3.5 h-3.5" /> ACCOUNT SETTINGS
              </Link>
              <Link to="/reporting" className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
                <AlertTriangle className="w-3.5 h-3.5" /> REPORT INCIDENT
              </Link>
              <div className="h-px bg-slate-800/60 my-1" />
              <button
                onClick={() => void signOut()}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> SIGN OUT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="pointer-events-auto md:hidden p-2 rounded-full glass text-slate-300 hover:text-white ml-2"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Menu Overlay */}
      {open && (
        <div className="md:hidden absolute top-20 inset-x-4 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 flex flex-col gap-1 shadow-2xl pointer-events-auto animate-in slide-in-from-top-4 z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          {!isPublic && (
            <div className="border-t border-slate-800 mt-2 pt-2 space-y-1">
              <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800/50">
                <BarChart3 className="w-4 h-4" /> VIEW PROGRESS
              </Link>
              <Link to="/achievements" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800/50">
                <Award className="w-4 h-4" /> CERTIFICATES & BADGES
              </Link>
              <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800/50">
                <User className="w-4 h-4" /> ACCOUNT SETTINGS
              </Link>
              <Link to="/reporting" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800/50">
                <AlertTriangle className="w-4 h-4" /> REPORT INCIDENT
              </Link>
              <button
                onClick={() => { setOpen(false); void signOut(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" /> SIGN OUT
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

/* ─── Bottom Nav (Mobile Dock) ─────────────────────────────────────── */
export function BottomNav() {
  const { user, profile, isAdmin, adminView } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/_authenticated/admin") || pathname.startsWith("/admin")) return null;

  const activeRole = resolveRole(profile, isAdmin, adminView);
  const isPublic = !user;

  // Role-specific bottom nav items
  let items: NavItem[];
  if (isPublic) {
    items = [
      { to: "/", label: "HOME", icon: Home },
      { to: "/academy", label: "ACADEMY", icon: BookOpen },
      { to: "/cyber-range/labs", label: "LABS", icon: Terminal },
      { to: "/services", label: "SERVICES", icon: Shield },
      { to: "/login", label: "SIGN IN", icon: User },
    ];
  } else if (activeRole === "ORGANIZATION") {
    items = [
      { to: "/", label: "HOME", icon: Home },
      { to: "/services", label: "SERVICES", icon: Shield },
      { to: "/reporting", label: "REPORT", icon: AlertTriangle },
      { to: "/appointments", label: "BOOKINGS", icon: Calendar },
      { to: "/profile", label: "PROFILE", icon: User },
    ];
  } else if (activeRole === "COLLEGE") {
    items = [
      { to: "/", label: "HOME", icon: Home },
      { to: "/programs", label: "PROGRAMS", icon: GraduationCap },
      { to: "/reporting", label: "REPORT", icon: AlertTriangle },
      { to: "/appointments", label: "BOOKINGS", icon: Calendar },
      { to: "/profile", label: "PROFILE", icon: User },
    ];
  } else if (activeRole === "ADMIN") {
    items = [
      { to: "/admin", label: "ADMIN", icon: Settings },
      { to: "/academy", label: "COURSES", icon: BookOpen },
      { to: "/reporting", label: "REPORTS", icon: FileText },
      { to: "/dashboard", label: "USERS", icon: Users },
      { to: "/profile", label: "PROFILE", icon: User },
    ];
  } else {
    // STUDENT / LEARNER
    items = [
      { to: "/", label: "HOME", icon: Home },
      { to: "/academy", label: "ACADEMY", icon: BookOpen },
      { to: "/cyber-range/labs", label: "LABS", icon: Terminal },
      { to: "/reporting", label: "REPORT", icon: AlertTriangle },
      { to: "/profile", label: "PROFILE", icon: User },
    ];
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden pointer-events-auto safe-area-bottom" aria-label="Mobile navigation">
      <div className="mx-3 mb-3 h-16 glass rounded-2xl border border-slate-800/60 shadow-2xl">
        <ul className="h-full grid items-center px-1" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.to || (item.to !== "/" && item.to !== "/login" && pathname.startsWith(item.to));
            const isWarning = item.icon === AlertTriangle;
            return (
              <li key={item.to} className="h-full">
                <Link
                  to={item.to}
                  className={`h-full w-full flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[48px] ${
                    isActive
                      ? isWarning ? "text-amber-400" : "text-cyan-400"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                >
                  <div className={`p-1 rounded-lg ${isActive ? (isWarning ? "bg-amber-400/15" : "bg-cyan-500/15") : ""}`}>
                    <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.2 : 1.6} />
                  </div>
                  <span className="font-mono text-[7px] font-semibold tracking-wider leading-none truncate w-full text-center px-0.5">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
