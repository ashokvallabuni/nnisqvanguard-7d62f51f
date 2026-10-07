import { useState, useEffect, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, User as UserIcon, LayoutDashboard, Settings, LogOut, ShieldCheck } from "lucide-react";
import { CyberButton } from "./CyberButton";

const nisqLogoUrl = "/assets/nisq-logo.jpeg";

/* ─── Telemetry Ticker ─────────────────────────────────────────────── */
export function TelemetryTicker() {
  return (
    <div className="w-full bg-background border-b border-border text-[0.6rem] font-mono flex items-center justify-center px-4 py-1 overflow-hidden select-none">
      <div className="flex items-center gap-3 whitespace-nowrap text-muted-foreground">
        <span className="text-primary text-[0.5rem] drop-shadow-[0_0_8px_var(--primary)]">●</span>
        <span className="text-primary tracking-[0.15em]">NISQ DEFENSE ENGINE: ONLINE</span>
        <span className="text-border">—</span>
        <span className="text-success text-[0.5rem] drop-shadow-[0_0_8px_var(--success)]">●</span>
        <span className="text-success tracking-[0.15em]">DEFENSE GRID: ACTIVE</span>
        <span className="text-warning text-[0.5rem] drop-shadow-[0_0_8px_var(--warning)]">●</span>
        <span className="text-warning tracking-[0.15em]">THREAT TELEMETRY: REAL-TIME</span>
        <span className="text-border">—</span>
        <span className="text-muted-foreground tracking-[0.15em]">CITIZEN INTAKE: OPEN 24/7</span>
      </div>
    </div>
  );
}

/* ─── Account Dropdown ─────────────────────────────────────────────── */
function AccountDropdown() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const accountType = profile?.account_type || "STUDENT";
  const displayName = profile?.full_name || user?.email?.split('@')[0] || "User";
  const dashboardLink = (accountType === "ORGANIZATION" || accountType === "COLLEGE") ? "/organization/dashboard" : "/dashboard";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white/5 border border-border hover:border-primary/50 transition-colors px-3 h-12 rounded-sm"
      >
        <div className="w-8 h-8 rounded-sm overflow-hidden bg-background border border-border flex items-center justify-center">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="font-mono text-[12px] text-white font-bold tracking-wider leading-none truncate max-w-[120px]">{displayName}</span>
          <span className="font-mono text-[10px] text-primary tracking-widest leading-none mt-1">{accountType}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-sm shadow-xl shadow-black/50 z-50 flex flex-col py-1"
          >
            {isAdmin && (
              <Link to={"/admin" as any} className="flex items-center gap-3 px-4 h-12 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-white/5 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                <ShieldCheck className="w-4 h-4" /> Admin Console
              </Link>
            )}
            <Link to={dashboardLink as any} className="flex items-center gap-3 px-4 h-12 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-white/5 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link to={"/profile" as any} className="flex items-center gap-3 px-4 h-12 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-white/5 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
              <UserIcon className="w-4 h-4" /> Profile
            </Link>
            <Link to={"/settings" as any} className="flex items-center gap-3 px-4 h-12 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-white/5 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
              <Settings className="w-4 h-4" /> Settings
            </Link>
            <div className="h-px bg-white/10 my-1" />
            <button 
              onClick={() => { signOut(); setIsOpen(false); }}
              className="flex items-center gap-3 px-4 h-12 font-mono text-[11px] uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Top Nav ──────────────────────────────────────────────────────── */
export function TopNav() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setScrolled(latest > 40);
  });

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/_authenticated/admin") || pathname.startsWith("/admin")) return null;

  const isPersonal = profile?.account_type === "STUDENT" || !profile?.account_type;
  const isOrg = profile?.account_type === "ORGANIZATION" || profile?.account_type === "COLLEGE";

  const linkClass = "h-12 flex items-center px-2 text-muted-foreground hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
  const activeLinkClass = "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] border-b-2 border-primary";

  const getLinkClass = (path: string) => {
    return `${linkClass} ${pathname === path || pathname.startsWith(path + '/') ? activeLinkClass : 'border-b-2 border-transparent'}`;
  };

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-[100] transition-colors duration-300 h-[72px] flex items-center ${
          scrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border"
            : "bg-transparent border-b border-transparent"
        }`}
        aria-label="Main navigation"
      >
        <div className="w-full max-w-[1440px] mx-auto px-[clamp(16px,4vw,48px)] flex items-center justify-between">
          
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-4 group mr-8 h-12">
            <div className="w-10 h-10 rounded-sm overflow-hidden bg-white/5 border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
              <img src={nisqLogoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-mono text-[14px] font-bold tracking-[0.2em] text-white/90 uppercase hidden sm:block">
              NISQ Vanguard
            </span>
          </Link>

          {/* Center: Links */}
          <div className="hidden min-[1100px]:flex items-center justify-center gap-8 font-medium text-sm flex-1">
            {!user && (
              <>
                <Link to="/" className={getLinkClass('/')}>Home</Link>
                <Link to="/about" className={getLinkClass('/about')}>About</Link>
                <Link to="/academy" className={getLinkClass('/academy')}>Academy</Link>
                <Link to="/services" className={getLinkClass('/services')}>Services</Link>
              </>
            )}
            
            {user && isPersonal && (
              <>
                <Link to="/dashboard" className={getLinkClass('/dashboard')}>Dashboard</Link>
                <Link to="/academy" className={getLinkClass('/academy')}>Academy</Link>
                <Link to="/cyber-range/labs" className={getLinkClass('/cyber-range/labs')}>IVVAB LABS</Link>
                <Link to={"/internships" as any} className={getLinkClass('/internships')}>Internships</Link>
                <Link to="/cyber-range/my-progress" className={getLinkClass('/cyber-range/my-progress')}>Progress</Link>
              </>
            )}

            {user && isOrg && (
              <>
                <Link to={"/organization/dashboard" as any} className={getLinkClass('/organization/dashboard')}>Dashboard</Link>
                <Link to="/services" className={getLinkClass('/services')}>Consulting</Link>
                <Link to={"/services/security" as any} className={getLinkClass('/services/security')}>Security Services</Link>
                <Link to={"/assessments" as any} className={getLinkClass('/assessments')}>Assessments</Link>
                <Link to={"/incidents" as any} className={getLinkClass('/incidents')}>Incidents</Link>
                <Link to={"/organization" as any} className={getLinkClass('/organization')}>Organization Profile</Link>
              </>
            )}
          </div>

          {/* Right: Actions */}
          <div className="hidden min-[1100px]:flex items-center justify-end gap-4 min-w-[280px]">
            {user ? (
              <>
                <AccountDropdown />
                <button
                  onClick={() => signOut()}
                  className="px-4 h-12 flex items-center justify-center border border-red-500/30 text-red-400 text-xs font-mono font-bold tracking-wider hover:bg-red-500/10 transition-colors uppercase"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <CyberButton variant="tertiary" to="/login">Sign In</CyberButton>
                <CyberButton variant="primary" to="/login">Get Started</CyberButton>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="min-[1100px]:hidden h-12 w-12 flex items-center justify-center text-muted-foreground hover:text-white"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-[#05070B] flex flex-col pt-24 px-[clamp(16px,4vw,48px)] min-[1100px]:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-6 font-display text-2xl font-bold tracking-wide">
              {isAdmin && (
                <Link to={"/admin" as any} onClick={() => setOpen(false)} className="text-primary hover:text-white h-12 flex items-center">Admin Console</Link>
              )}
              {!user && (
                <>
                  <Link to="/" onClick={() => setOpen(false)} className="text-white hover:text-primary h-12 flex items-center">Home</Link>
                  <Link to="/about" onClick={() => setOpen(false)} className="text-white hover:text-primary h-12 flex items-center">About</Link>
                  <Link to="/academy" onClick={() => setOpen(false)} className="text-white hover:text-primary h-12 flex items-center">Academy</Link>
                  <Link to="/services" onClick={() => setOpen(false)} className="text-white hover:text-primary h-12 flex items-center">Services</Link>
                </>
              )}
              
              {user && isPersonal && (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="text-white hover:text-primary h-12 flex items-center">Dashboard</Link>
                  <Link to="/academy" onClick={() => setOpen(false)} className="text-white hover:text-primary h-12 flex items-center">Academy</Link>
                  <Link to="/cyber-range/labs" onClick={() => setOpen(false)} className="text-white hover:text-primary h-12 flex items-center">IVVAB LABS</Link>
                  <Link to={"/internships" as any} onClick={() => setOpen(false)} className="text-white hover:text-primary h-12 flex items-center">Internships</Link>
                  <Link to="/cyber-range/my-progress" onClick={() => setOpen(false)} className="text-white hover:text-primary h-12 flex items-center">Progress</Link>
                </>
              )}

              {user && isOrg && (
                <>
                  <Link to={"/organization/dashboard" as any} onClick={() => setOpen(false)} className="text-white hover:text-primary h-12 flex items-center">Dashboard</Link>
                  <Link to="/services" onClick={() => setOpen(false)} className="text-white hover:text-primary h-12 flex items-center">Consulting</Link>
                  <Link to={"/services/security" as any} onClick={() => setOpen(false)} className="text-white hover:text-primary h-12 flex items-center">Security Services</Link>
                  <Link to={"/assessments" as any} onClick={() => setOpen(false)} className="text-white hover:text-primary h-12 flex items-center">Assessments</Link>
                  <Link to={"/incidents" as any} onClick={() => setOpen(false)} className="text-white hover:text-primary h-12 flex items-center">Incidents</Link>
                  <Link to={"/organization" as any} onClick={() => setOpen(false)} className="text-white hover:text-primary h-12 flex items-center">Organization Profile</Link>
                </>
              )}
            </div>
            
            <div className="h-px bg-white/10 my-8" />
            
            <div className="flex flex-col gap-4 w-full mt-8 pb-12">
              {user ? (
                <>
                  <Link to={"/profile" as any} className="w-full flex items-center gap-3 p-4 border border-border rounded-sm bg-white/5 h-16">
                    <div className="w-8 h-8 rounded-sm overflow-hidden bg-background border border-border flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-mono text-[12px] text-white font-bold tracking-wider">{profile?.full_name || user?.email?.split('@')[0] || "User"}</span>
                      <span className="font-mono text-[10px] text-primary tracking-widest">{isOrg ? "ORGANIZATION" : "STUDENT"}</span>
                    </div>
                  </Link>
                  <CyberButton variant="tertiary" onClick={() => signOut()} className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10">Sign Out</CyberButton>
                </>
              ) : (
                <>
                  <CyberButton variant="tertiary" to="/login" className="w-full">Sign In</CyberButton>
                  <CyberButton variant="primary" to="/login" className="w-full mt-2">Get Started</CyberButton>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function BottomNav() {
  return null;
}
