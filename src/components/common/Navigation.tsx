import { useState, useEffect } from "react";
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
    <div className="w-full bg-[#050B14] border-b border-[#123047] text-[0.6rem] font-mono flex items-center justify-center px-4 py-1 overflow-hidden select-none">
      <div className="flex items-center gap-3 whitespace-nowrap text-muted-foreground">
        <span className="text-[#00D9FF] text-[0.5rem] drop-shadow-[0_0_8px_#00D9FF]">●</span>
        <span className="text-[#00D9FF] tracking-[0.15em]">NISQ DEFENSE ENGINE: ONLINE</span>
        <span className="text-[#123047]">—</span>
        <span className="text-[#00D68F] text-[0.5rem] drop-shadow-[0_0_8px_#00D68F]">●</span>
        <span className="text-[#00D68F] tracking-[0.15em]">DEFENSE GRID: ACTIVE</span>
        <span className="text-[#123047]">—</span>
        <span className="text-[#FFB020] text-[0.5rem] drop-shadow-[0_0_8px_#FFB020]">●</span>
        <span className="text-[#FFB020] tracking-[0.15em]">THREAT TELEMETRY: REAL-TIME</span>
        <span className="text-[#123047]">—</span>
        <span className="text-[#F5FAFF] tracking-[0.15em]">CITIZEN INTAKE: OPEN 24/7</span>
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
    { to: "/cyber-range/labs", label: "IVVAB LABS", icon: Terminal },
    { to: "/services", label: "SERVICES", icon: Shield },
    { to: "/intelligence", label: "THREAT INTEL", icon: Radar },
  ];
}

function getLearnerNav(): NavItem[] {
  return [
    { to: "/", label: "HOME", icon: Home },
    { to: "/academy", label: "ACADEMY", icon: BookOpen },
    { to: "/cyber-range/labs", label: "IVVAB LABS", icon: Terminal },
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
    { to: "/cyber-range/labs", label: "IVVAB LABS", icon: Terminal },
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
  if (
    profile?.account_type === "ORGANIZATION" ||
    rawRole === "ORGANIZATION" ||
    profile?.organization
  )
    return "ORGANIZATION";
  if (profile?.account_type === "COLLEGE" || rawRole === "COLLEGE" || profile?.college)
    return "COLLEGE";
  return "STUDENT";
}

function getNavForRole(role: ActiveRole, isPublic: boolean): NavItem[] {
  if (isPublic) return getPublicNav();
  switch (role) {
    case "ORGANIZATION":
      return getOrgNav();
    case "COLLEGE":
      return getCollegeNav();
    case "ADMIN":
      return getAdminNav();
    default:
      return getLearnerNav();
  }
}

/* ─── Top Nav ──────────────────────────────────────────────────────── */
export function TopNav() {
  const { user, profile, isAdmin, adminView, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Added scroll effect for transparent top nav
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/_authenticated/admin") || pathname.startsWith("/admin")) return null;

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b ${
        scrolled
          ? "bg-[#05070B]/80 backdrop-blur-md border-[#20283A] py-3"
          : "bg-transparent border-transparent py-5"
      }`}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-md overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
            <img src={nisqLogoUrl} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-mono text-xs font-bold tracking-widest text-white/90 uppercase">
            NISQ Vanguard
          </span>
        </Link>

        {/* Center: Links */}
        <div className="hidden lg:flex items-center gap-8 font-mono text-xs uppercase tracking-widest">
          <Link to="/services" className="text-[#A8B0BF] hover:text-[#20D9F5] transition-colors">Services</Link>
          <Link to="/academy" className="text-[#A8B0BF] hover:text-[#20D9F5] transition-colors">Academy</Link>
          <Link to="/cyber-range/labs" className="text-[#A8B0BF] hover:text-[#20D9F5] transition-colors">IVVAB Labs</Link>
          <Link to="/intelligence" className="text-[#A8B0BF] hover:text-[#20D9F5] transition-colors">Threat Intel</Link>
          <Link to="/about" className="text-[#A8B0BF] hover:text-[#20D9F5] transition-colors">About</Link>
        </div>

        {/* Right: Actions */}
        <div className="hidden lg:flex items-center gap-6">
          <Link to="/reporting" className="flex items-center gap-2 group">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F43F8F] animate-pulse group-hover:animate-none" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#F4F3F1]/50 group-hover:text-[#F43F8F] transition-colors">
              Report Threat
            </span>
          </Link>
          
          <div className="h-4 w-px bg-[#20283A]" />
          
          <Link to="/login" className="font-mono text-xs uppercase tracking-widest text-[#F4F3F1]/80 hover:text-[#20D9F5] transition-colors">
            Sign In
          </Link>
          <Link to="/contact" className="bg-[#20D9F5]/10 border border-[#20D9F5]/30 text-[#20D9F5] font-mono text-xs uppercase tracking-widest px-5 py-2.5 hover:bg-[#20D9F5]/20 hover:border-[#20D9F5] transition-all">
            Book Demo
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-white/80 hover:text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden absolute top-full inset-x-0 bg-[#05070D]/95 backdrop-blur-xl border-b border-white/5 p-6 flex flex-col gap-4 shadow-xl">
          <Link to="/services" className="text-lg text-white/80" onClick={() => setOpen(false)}>Services</Link>
          <Link to="/academy" className="text-lg text-white/80" onClick={() => setOpen(false)}>Academy</Link>
          <Link to="/cyber-range/labs" className="text-lg text-white/80" onClick={() => setOpen(false)}>IVVAB Labs</Link>
          <Link to="/intelligence" className="text-lg text-white/80" onClick={() => setOpen(false)}>Threat Intelligence</Link>
          <Link to="/about" className="text-lg text-white/80" onClick={() => setOpen(false)}>About</Link>
          <Link to="/team" className="text-lg text-white/80" onClick={() => setOpen(false)}>Team</Link>
          <div className="h-px bg-white/10 my-2" />
          <Link to="/reporting" className="text-sm text-[#2F9BFF]" onClick={() => setOpen(false)}>Report a Threat</Link>
          <Link to="/login" className="text-lg text-white" onClick={() => setOpen(false)}>Sign In</Link>
          <Link to="/services" className="mt-2 text-center bg-gradient-to-r from-[#8B3DFF] to-[#2F9BFF] text-white py-3 rounded-full" onClick={() => setOpen(false)}>
            Request a Demo
          </Link>
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
      { to: "/cyber-range/labs", label: "IVVAB LABS", icon: Terminal },
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
      { to: "/cyber-range/labs", label: "IVVAB LABS", icon: Terminal },
      { to: "/reporting", label: "REPORT", icon: AlertTriangle },
      { to: "/profile", label: "PROFILE", icon: User },
    ];
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden pointer-events-auto safe-area-bottom"
      aria-label="Mobile navigation"
    >
      <div className="mx-3 mb-3 h-16 glass rounded-2xl border border-border/60 shadow-sm">
        <ul
          className="h-full grid items-center px-1"
          style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
        >
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.to ||
              (item.to !== "/" && item.to !== "/login" && pathname.startsWith(item.to));
            const isWarning = item.icon === AlertTriangle;
            return (
              <li key={item.to} className="h-full">
                <Link
                  to={item.to}
                  className={`h-full w-full flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[48px] ${
                    isActive
                      ? isWarning
                        ? "text-warning"
                        : "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                >
                  <div
                    className={`p-1 rounded-lg ${isActive ? (isWarning ? "bg-amber-400/15" : "bg-primary/15") : ""}`}
                  >
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
