import { useState, useMemo } from "react";
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
  Zap,
  Flame,
  ChevronDown
} from "lucide-react";

const nisqLogoUrl = "/assets/nisq-logo.jpeg";

export function TelemetryTicker() {
  return (
    <div className="fixed top-0 inset-x-0 z-[60] bg-zinc-950 text-white border-b border-cyan-900/50 text-[0.65rem] font-mono flex items-center justify-center px-4 py-1.5 shadow-md overflow-hidden">
      <div className="flex items-center gap-2 whitespace-nowrap animate-in fade-in slide-in-from-top-1">
        <span className="text-cyan-400 animate-pulse">●</span>
        <span className="font-bold tracking-widest text-cyan-50">NISQ DEFENSE ENGINE: ONLINE</span>
        <span className="text-cyan-900/80 mx-1">//</span>
        <span className="text-emerald-400 tracking-wider">DEFENSE GRID: ACTIVE</span>
        <span className="text-cyan-900/80 mx-1">//</span>
        <span className="text-amber-400 tracking-wider">THREAT TELEMETRY: REAL-TIME</span>
        <span className="text-cyan-900/80 mx-1">//</span>
        <span className="text-violet-400 tracking-wider">CITIZEN INTAKE: OPEN 24/7</span>
      </div>
    </div>
  );
}

export function TopNav() {
  const { user, profile, isAdmin, adminView, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  
  if (pathname.startsWith("/_authenticated/admin") || pathname.startsWith("/admin")) return null;

  const rawRole = (profile as any)?.role?.toString()?.toUpperCase();
  let activeRole: "STUDENT" | "ORGANIZATION" | "COLLEGE" | "ADMIN" = "STUDENT";
  
  if (isAdmin) {
    if (adminView === "LEARNER") activeRole = "STUDENT";
    else if (adminView === "ORGANIZATION") activeRole = "ORGANIZATION";
    else activeRole = "ADMIN";
  } else {
    activeRole = 
      profile?.account_type === "ORGANIZATION" || rawRole === "ORGANIZATION" || profile?.organization
        ? "ORGANIZATION"
        : profile?.account_type === "COLLEGE" || rawRole === "COLLEGE" || profile?.college
          ? "COLLEGE"
          : "STUDENT";
  }

  const isPublic = !user;
  const isLearner = activeRole === "STUDENT" || activeRole === "ADMIN";
  const isOrg = activeRole === "ORGANIZATION" || activeRole === "COLLEGE";

  // Navigation Items
  const navItems = isPublic
    ? [
        { to: "/", label: "HOME", icon: Home },
        { to: "/academy", label: "ACADEMY", icon: BookOpen },
        { to: "/services", label: "SERVICES", icon: Shield },
        { to: "/intelligence", label: "THREAT INTEL", icon: Radar },
      ]
    : isOrg
    ? [
        { to: "/", label: "HOME", icon: Home },
        { to: "/services", label: "DEFENSE SERVICES", icon: Shield },
        { to: "/intelligence", label: "THREAT INTEL", icon: Radar },
        { to: "/appointments", label: "APPOINTMENTS", icon: Calendar },
        { to: "/events", label: "COMMUNITY", icon: User },
      ]
    : [
        { to: "/", label: "HOME", icon: Home },
        { to: "/academy", label: "ACADEMY", icon: BookOpen },
        { to: "/cyber-range/labs", label: "CYBER LABS", icon: Terminal },
        { to: "/events", label: "COMMUNITY", icon: User },
      ];

  const DropdownTrigger = () => (
    <div className="relative group/profile flex items-center gap-2 pl-3 cursor-pointer">
      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
        <User className="w-4 h-4 text-slate-400" />
      </div>
      <ChevronDown className="w-3 h-3 text-slate-500 group-hover/profile:text-white transition-colors" />
      <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-200 py-1">
        <div className="px-3 py-2 border-b border-slate-800/60 mb-1">
          <div className="text-[0.65rem] font-mono text-cyan-400">OPERATIVE</div>
          <div className="text-xs text-slate-300 truncate">{user?.email}</div>
        </div>
        <Link to="/dashboard" className="block px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50">My Learning Progress</Link>
        <Link to="/achievements" className="block px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50">Certificates & Badges</Link>
        <Link to="/profile" className="block px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50">Account Settings</Link>
        <div className="h-px bg-slate-800/60 my-1"></div>
        <button onClick={() => void signOut()} className="w-full text-left px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10">Sign Out</button>
      </div>
    </div>
  );

  return (
    <nav className="fixed inset-x-0 z-50 top-8 px-4 py-3 pointer-events-none flex items-center justify-between transition-all">
      {/* Left side: Logo */}
      <Link to="/" className="pointer-events-auto flex items-center gap-2.5 group">
        <div className="w-10 h-10 rounded-lg border border-cyan-500/30 bg-black/50 backdrop-blur-md overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.15)] flex items-center justify-center">
          <img src={nisqLogoUrl} alt="NISQ Vanguard logo" className="w-full h-full object-cover" />
        </div>
      </Link>

      {/* Center side: Floating Glass Pill */}
      <div className="pointer-events-auto hidden md:flex items-center gap-1 glass px-1.5 py-1.5 rounded-full mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono font-semibold text-[0.65rem] tracking-wider transition-all duration-300 ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_12px_rgba(0,240,255,0.1)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Right side: User/Auth Actions */}
      <div className="pointer-events-auto flex items-center gap-3 glass px-3 py-1.5 rounded-full">
        {isPublic ? (
          <>
            <Link to="/login" className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors">Sign In</Link>
            <Link to="/auth" className="px-4 py-1.5 rounded-full bg-cyan-500 text-black font-semibold text-xs hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all duration-300">Get Started →</Link>
          </>
        ) : (
          <div className="flex items-center divide-x divide-slate-800">
            <div className="flex items-center gap-3 pr-3 hidden sm:flex">
              <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold font-mono">
                <Flame className="w-3.5 h-3.5 fill-amber-500" /> 3 Days
              </div>
              <div className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full text-violet-400 text-[0.65rem] font-bold font-mono">
                <Zap className="w-3 h-3 fill-violet-400" /> 450 XP
              </div>
            </div>
            <DropdownTrigger />
          </div>
        )}
      </div>
      
      {/* Mobile Menu Button */}
      <button
        className="pointer-events-auto md:hidden p-2 rounded-full glass text-slate-300 hover:text-white ml-2"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Menu Overlay */}
      {open && (
        <div className="md:hidden absolute top-20 inset-x-4 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 shadow-2xl pointer-events-auto animate-in slide-in-from-top-4">
           {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          {!isPublic && (
            <div className="border-t border-slate-800 mt-2 pt-2">
              <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800/50">
                <User className="w-4.5 h-4.5" /> My Progress
              </Link>
              <button onClick={() => { setOpen(false); void signOut(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10">
                <LogOut className="w-4.5 h-4.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export function BottomNav() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/_authenticated/admin") || pathname.startsWith("/admin")) return null;

  const items = [
    { to: "/", label: "HOME", icon: Home },
    { to: "/academy", label: "ACADEMY", icon: BookOpen },
    { to: "/cyber-range/labs", label: "LABS", icon: Terminal },
    { to: "/reporting", label: "REPORT FRAUD", icon: AlertTriangle, warning: true },
    { to: user ? "/profile" : "/login", label: user ? "PROFILE" : "SIGN IN", icon: User },
  ];

  return (
    <nav className="fixed bottom-4 inset-x-4 z-50 h-16 md:hidden glass rounded-2xl pointer-events-auto">
      <ul className="h-full grid grid-cols-5 items-center px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.to || (item.to !== "/" && item.to !== "/login" && pathname.startsWith(item.to));
          return (
            <li key={item.to} className="h-full relative">
              <Link
                to={item.to}
                className={`h-full w-full flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive ? (item.warning ? "text-amber-400" : "text-cyan-400") : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? (item.warning ? "bg-amber-400/20" : "bg-cyan-500/20") : ""}`}>
                  <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className="font-mono text-[8px] font-semibold tracking-wider leading-none truncate w-full text-center px-0.5">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
