import { useState, useEffect, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Sun,
  Moon,
  Sparkles,
  Home,
  GraduationCap,
  Terminal,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumButton } from "@/components/common/PremiumButton";
import { useIvvabChat } from "@/lib/ivvab-chat";
import { InstallAppButton } from "./InstallAppButton";

const nisqLogoUrl = "/assets/nisq-logo.webp";

type NavItem = { to: string; label: string };

const PUBLIC_LINKS: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/academy", label: "Academy" },
  { to: "/cyber-range/labs", label: "IVVAB LABS" },
  { to: "/services", label: "Services" },
  { to: "/appointments", label: "Briefings" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const LEARNER_LINKS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/academy", label: "Academy" },
  { to: "/cyber-range/labs", label: "IVVAB LABS" },
  { to: "/appointments", label: "Briefings" },
  { to: "/cyber-range/my-progress", label: "Progress" },
];

const ORG_LINKS: NavItem[] = [
  { to: "/organization/dashboard", label: "Dashboard" },
  { to: "/services", label: "Consulting" },
  { to: "/academy", label: "Academy" },
  { to: "/appointments", label: "Briefings" },
  { to: "/campus", label: "Campus" },
];

/* ─── Account Dropdown ─────────────────────────────────────────────── */
function AccountDropdown() {
  const { user, profile, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const accountType = profile?.account_type || "STUDENT";
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const dashboardLink =
    accountType === "ORGANIZATION" || accountType === "COLLEGE"
      ? "/organization/dashboard"
      : "/dashboard";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const itemClass =
    "flex items-center gap-3 px-3.5 h-10 mx-1 rounded-lg text-sm font-medium text-[#cbd5e1] hover:bg-[#00B8FF]/15 hover:text-[#00B8FF] transition-colors select-none";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-2.5 bg-[#081522] border border-[#16283A] hover:border-[#00B8FF] transition-all px-3 h-10 rounded-xl shadow-xs active:scale-[0.98] cursor-pointer select-none text-white"
      >
        <div className="w-7 h-7 rounded-full overflow-hidden bg-[#0A7CFF]/20 border border-[#00B8FF]/40 flex items-center justify-center">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-4 h-4 text-[#00B8FF]" />
          )}
        </div>
        <div className="flex flex-col items-start text-left leading-tight">
          <span className="text-xs text-white font-semibold truncate max-w-[110px]">
            {displayName}
          </span>
          <span className="text-[9px] text-[#38BDF8] tracking-wider uppercase font-mono">
            {accountType}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute right-0 mt-2 w-56 bg-[#081522]/98 backdrop-blur-xl border border-[#16283A] rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.6)] z-50 flex flex-col py-1.5 overflow-hidden"
          >
            {isAdmin && (
              <Link
                to={"/admin" as any}
                className={itemClass}
                onClick={() => setIsOpen(false)}
              >
                <ShieldCheck className="w-4 h-4 text-[#00B8FF]" /> Admin Console
              </Link>
            )}
            <Link to={dashboardLink as any} className={itemClass} onClick={() => setIsOpen(false)}>
              <LayoutDashboard className="w-4 h-4 text-[#38BDF8]" /> Dashboard
            </Link>
            <Link to={"/profile" as any} className={itemClass} onClick={() => setIsOpen(false)}>
              <UserIcon className="w-4 h-4 text-[#38BDF8]" /> Profile
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("course-theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const applyTheme = (next: "light" | "dark") => {
    setTheme(next);
    localStorage.setItem("course-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    if (document.startViewTransition) {
      document.startViewTransition(() => applyTheme(next));
    } else {
      applyTheme(next);
    }
  };

  return (
    <button
      onClick={toggle}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#081522] border border-[#16283A] text-white hover:border-[#00B8FF]/60 hover:bg-[#0A7CFF]/10 active:scale-95 transition-all cursor-pointer select-none"
      aria-label="Toggle theme"
    >
      <div className={`transition-all duration-300 absolute ${theme === "light" ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}>
        <Sun className="w-4 h-4 text-[#38BDF8]" />
      </div>
      <div className={`transition-all duration-300 absolute ${theme === "dark" ? "rotate-0 opacity-100" : "rotate-90 opacity-0"}`}>
        <Moon className="w-4 h-4 text-[#00B8FF]" />
      </div>
    </button>
  );
}

/* ─── Top Nav ──────────────────────────────────────────────────────── */
export function TopNav() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { toggleIvvab, openIvvab } = useIvvabChat();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/_authenticated/admin") || pathname.startsWith("/admin")) return null;

  const isPersonal = profile?.account_type === "STUDENT" || !profile?.account_type;
  const isOrg = profile?.account_type === "ORGANIZATION" || profile?.account_type === "COLLEGE";

  const links = !user ? PUBLIC_LINKS : isOrg ? ORG_LINKS : isPersonal ? LEARNER_LINKS : [];

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(path + "/");

  return (
    <>
      <nav
        className={`w-full bg-[#050B14]/92 backdrop-blur-xl border-b border-[#16283A] transition-all duration-300 sticky top-0 z-50 ${
          scrolled ? "shadow-[0_4px_30px_rgba(0,0,0,0.55)] border-[#00B8FF]/20" : ""
        }`}
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-[72px] items-center justify-between gap-6">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group" aria-label="NISQ Vanguard home">
            <div className="relative p-1 rounded-xl bg-gradient-to-b from-[#0A7CFF]/20 to-transparent border border-[#00B8FF]/30 group-hover:border-[#00B8FF] transition-colors shadow-[0_0_15px_rgba(10,124,255,0.2)]">
              <img
                src={nisqLogoUrl}
                alt="NISQ Vanguard logo"
                width={36}
                height={36}
                fetchPriority="high"
                className="w-9 h-9 rounded-lg object-cover"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-display font-extrabold tracking-tight text-white leading-tight group-hover:text-[#00B8FF] transition-colors">
                NISQ VANGUARD
              </span>
              <span className="text-[9px] text-[#38BDF8] tracking-widest uppercase font-mono font-semibold hidden min-[440px]:block">
                DEFENCE TECHNOLOGIES
              </span>
            </div>
          </Link>

          {/* Desktop Center Links */}
          <ul className="hidden min-[1100px]:flex items-center gap-1 flex-1 justify-center">
            {isAdmin && (
              <li>
                <Link
                  to={"/admin" as any}
                  className="relative h-[72px] flex items-center px-3.5 text-xs font-mono font-semibold text-[#00B8FF] hover:text-white"
                >
                  ADMIN CONSOLE
                </Link>
              </li>
            )}
            {links.map((l) => {
              const active = isActive(l.to);
              return (
                <li key={l.to + l.label}>
                  <Link
                    to={l.to as any}
                    aria-current={active ? "page" : undefined}
                    className={`relative h-[72px] flex items-center px-3 text-xs font-mono font-medium transition-colors ${
                      active
                        ? "text-[#00B8FF] font-semibold after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-gradient-to-r after:from-[#0A7CFF] after:to-[#00B8FF] after:shadow-[0_0_8px_#00B8FF]"
                        : "text-[#94A3B8] hover:text-white"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop Actions */}
          <div className="hidden min-[1100px]:flex items-center justify-end gap-3 shrink-0">
            <InstallAppButton variant="header" />

            <button
              onClick={() => toggleIvvab()}
              className="flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-[#081522] hover:bg-[#00B8FF]/15 border border-[#00B8FF]/40 text-[#00B8FF] hover:text-white text-xs font-mono font-semibold tracking-wider active:scale-[0.98] transition-all cursor-pointer select-none shadow-[0_0_15px_rgba(0,184,255,0.15)]"
              aria-label="Open IVVAB AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00B8FF] animate-pulse" />
              <span>IVVAB AI</span>
            </button>

            <ThemeToggle />

            {user ? (
              <>
                <AccountDropdown />
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#081522] border-[#16283A] text-[#94A3B8] hover:text-white hover:border-red-500/40 hover:bg-red-500/10 active:scale-[0.98] transition-all font-mono text-xs"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="h-10 px-3.5 inline-flex items-center text-xs font-mono font-semibold text-[#94A3B8] hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <PremiumButton
                  variant="primary"
                  size="sm"
                  to="/signup"
                  iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  GET STARTED
                </PremiumButton>
              </>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="min-[1100px]:hidden flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleIvvab()}
              className="flex items-center gap-1 px-2.5 h-9 rounded-lg bg-[#081522] border border-[#00B8FF]/40 text-[#00B8FF] text-xs font-mono font-bold active:scale-95 transition-all cursor-pointer shadow-xs"
              aria-label="Open IVVAB AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00B8FF]" />
              <span className="hidden min-[380px]:inline">IVVAB</span>
            </button>
            <ThemeToggle />
            <button
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#081522] border border-[#16283A] text-white hover:border-[#00B8FF] active:scale-95 transition-all cursor-pointer"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X className="w-5 h-5 text-[#00B8FF]" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Expandable Mobile Secondary Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="min-[1100px]:hidden fixed inset-x-0 top-[72px] z-[90] bg-[#050B14]/98 backdrop-blur-2xl border-b border-[#16283A] shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-h-[calc(100svh-72px)] overflow-y-auto"
          >
            <div className="max-w-md mx-auto py-6 px-4 flex flex-col space-y-1">
              {/* Branded Drawer Top */}
              <div className="flex items-center gap-3 pb-4 mb-3 border-b border-[#16283A]">
                <img
                  src={nisqLogoUrl}
                  alt="NISQ Vanguard"
                  className="w-10 h-10 rounded-xl object-cover border border-[#00B8FF]/30"
                />
                <div className="flex flex-col text-left">
                  <span className="font-display font-bold text-base text-white leading-tight">
                    NISQ Vanguard
                  </span>
                  <span className="font-mono text-[10px] text-[#00B8FF] tracking-wider uppercase font-semibold">
                    Defence Technologies
                  </span>
                </div>
              </div>

              {isAdmin && (
                <Link
                  to={"/admin" as any}
                  onClick={() => setOpen(false)}
                  className="h-12 flex items-center px-3 rounded-xl font-mono text-sm font-semibold text-[#00B8FF] hover:bg-[#081522]"
                >
                  Admin Console
                </Link>
              )}

              {links.map((l) => (
                <Link
                  key={l.to + l.label}
                  to={l.to as any}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(l.to) ? "page" : undefined}
                  className={`h-12 flex items-center px-3 rounded-xl font-mono text-sm font-medium transition-colors ${
                    isActive(l.to)
                      ? "bg-[#0A7CFF]/15 text-[#00B8FF] font-semibold border-l-2 border-[#00B8FF]"
                      : "text-[#cbd5e1] hover:bg-[#081522] hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              ))}

              <button
                onClick={() => {
                  setOpen(false);
                  openIvvab();
                }}
                className="h-12 flex items-center gap-2.5 px-3 rounded-xl font-mono text-sm font-semibold text-[#00B8FF] hover:bg-[#081522] w-full text-left cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#00B8FF]" />
                <span>IVVAB AI Threat Assistant</span>
              </button>

              <div className="flex flex-col gap-3 pt-6 pb-4 border-t border-[#16283A] mt-4">
                <InstallAppButton variant="drawer" />

                {user ? (
                  <>
                    <Link
                      to={"/profile" as any}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 p-3.5 border border-[#16283A] rounded-xl bg-[#081522]"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#0A7CFF]/20 border border-[#00B8FF]/40 flex items-center justify-center">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-[#00B8FF]" />
                        )}
                      </div>
                      <div className="flex flex-col text-left leading-tight">
                        <span className="text-sm text-white font-semibold">
                          {profile?.full_name || user?.email?.split("@")[0] || "User"}
                        </span>
                        <span className="text-[10px] text-[#38BDF8] uppercase tracking-wider font-mono">
                          {isOrg ? "Organization" : "Student"}
                        </span>
                      </div>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full h-11 bg-[#081522] border-[#16283A] text-[#94A3B8] hover:text-white"
                      onClick={() => signOut()}
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-11 bg-[#081522] border-[#16283A] text-white" asChild>
                      <Link to="/login" onClick={() => setOpen(false)}>Sign In</Link>
                    </Button>
                    <PremiumButton variant="primary" to="/signup" onClick={() => setOpen(false)}>
                      Get Started
                    </PremiumButton>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── App-Style Mobile Bottom Navigation ────────────────────────────── */
export function BottomNav() {
  const { user } = useAuth();
  const location = useRouterState({ select: (s) => s.location });
  const pathname = location.pathname;

  // Do not display bottom bar on active interactive cyber range terminal labs
  if (
    pathname.startsWith("/cyber-range/lab/") ||
    pathname.startsWith("/cyber-range/interactive/")
  ) {
    return null;
  }

  const items = [
    {
      to: "/",
      label: "Home",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      to: "/academy",
      label: "Academy",
      icon: GraduationCap,
      isActive: pathname.startsWith("/academy") || pathname.startsWith("/learn"),
    },
    {
      to: "/cyber-range/labs",
      label: "IVVAB LABS",
      icon: Terminal,
      isActive: pathname.startsWith("/cyber-range/labs"),
    },
    {
      to: "/appointments",
      label: "Briefing",
      icon: Calendar,
      isActive: pathname.startsWith("/appointments") || pathname.startsWith("/programs"),
    },
    {
      to: user ? "/profile" : "/login",
      label: user ? "Profile" : "Sign In",
      icon: UserIcon,
      isActive:
        pathname.startsWith("/profile") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/dashboard"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#050B14]/95 backdrop-blur-2xl border-t border-[#16283A] shadow-[0_-8px_30px_rgba(0,0,0,0.6)] px-2 pt-1 pb-[calc(env(safe-area-inset-bottom,0px)+0.3rem)]"
    >
      <div className="grid grid-cols-5 h-14 max-w-md mx-auto items-center">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to + item.label}
              to={item.to as any}
              aria-current={item.isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] py-1 select-none transition-all duration-200 active:scale-95 ${
                item.isActive ? "text-[#00B8FF]" : "text-[#94A3B8] hover:text-white"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    item.isActive ? "scale-110 stroke-[2.25] text-[#00B8FF]" : "stroke-[1.75]"
                  }`}
                />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#00B8FF] shadow-[0_0_8px_#00B8FF]" />
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 font-mono transition-colors ${
                  item.isActive ? "font-bold text-[#00B8FF]" : "text-[#94A3B8] font-normal"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
