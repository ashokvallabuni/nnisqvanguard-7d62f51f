import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  Terminal,
  Shield,
  Radar,
  User,
  AlertTriangle,
  Calendar,
  GraduationCap,
  Building2,
  Settings,
  FileText,
  BarChart3,
  Users,
  Menu,
  X
} from "lucide-react";
import { CyberButton } from "./CyberButton";

const nisqLogoUrl = "/assets/nisq-logo.jpeg";

/* ─── Telemetry Ticker ─────────────────────────────────────────────── */
export function TelemetryTicker() {
  return (
    <div className="w-full bg-[#050B14] border-b border-[var(--line)] text-[0.6rem] font-mono flex items-center justify-center px-4 py-1 overflow-hidden select-none">
      <div className="flex items-center gap-3 whitespace-nowrap text-[var(--chrome)]">
        <span className="text-[var(--cyan)] text-[0.5rem] drop-shadow-[0_0_8px_var(--cyan)]">●</span>
        <span className="text-[var(--cyan)] tracking-[0.15em]">NISQ DEFENSE ENGINE: ONLINE</span>
        <span className="text-[var(--line)]">—</span>
        <span className="text-[#00D68F] text-[0.5rem] drop-shadow-[0_0_8px_#00D68F]">●</span>
        <span className="text-[#00D68F] tracking-[0.15em]">DEFENSE GRID: ACTIVE</span>
        <span className="text-[var(--line)]">—</span>
        <span className="text-[#FFB020] text-[0.5rem] drop-shadow-[0_0_8px_#FFB020]">●</span>
        <span className="text-[#FFB020] tracking-[0.15em]">THREAT TELEMETRY: REAL-TIME</span>
        <span className="text-[var(--line)]">—</span>
        <span className="text-[var(--chrome)] tracking-[0.15em]">CITIZEN INTAKE: OPEN 24/7</span>
      </div>
    </div>
  );
}

/* ─── Top Nav ──────────────────────────────────────────────────────── */
export function TopNav() {
  const { user } = useAuth();
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
            ? "bg-[var(--obsidian)]/80 backdrop-blur-md border-b border-[var(--line)]"
            : "bg-transparent border-b border-transparent"
        }`}
        aria-label="Main navigation"
      >
        <div className="w-full max-w-[1280px] mx-auto px-[clamp(16px,4vw,48px)] flex items-center justify-between">
          
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-4 group mr-8">
            <div className="w-10 h-10 rounded-sm overflow-hidden bg-white/5 border border-[var(--line)] flex items-center justify-center group-hover:border-[var(--cyan)]/50 transition-colors">
              <img src={nisqLogoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-mono text-[14px] font-bold tracking-[0.2em] text-white/90 uppercase">
              NISQ Vanguard
            </span>
          </Link>

          {/* Center: Links */}
          <div className="hidden min-[1100px]:flex items-center gap-8 font-mono text-[13px] uppercase tracking-widest">
            <Link to="/services" className="text-white hover:text-[#00D2FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D2FF]">Security Consulting</Link>
            <Link to="/academy" className="text-white hover:text-[#00D2FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D2FF]">Academy</Link>
            <Link to="/cyber-range/labs" className="text-white hover:text-[#00D2FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D2FF]">IVVAB LABS</Link>
            <Link to="/learn" className="text-white hover:text-[#00D2FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D2FF]">Courses</Link>
            <Link to="/team" className="text-white hover:text-[#00D2FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D2FF]">Leadership</Link>
          </div>

          {/* Right: Actions */}
          <div className="hidden min-[1100px]:flex items-center gap-6">
            {user ? (
              <CyberButton variant="primary" to="/dashboard">Access Dashboard</CyberButton>
            ) : (
              <CyberButton variant="primary" to="/login">ENTER THE VANGUARD</CyberButton>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="min-[1100px]:hidden text-[var(--chrome)] hover:text-white"
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
            className="fixed inset-0 z-40 bg-[var(--obsidian)]/95 backdrop-blur-xl flex flex-col pt-24 px-[clamp(16px,4vw,48px)] min-[1100px]:hidden"
          >
            <div className="flex flex-col gap-6 font-orbitron text-2xl uppercase font-bold tracking-wider">
              <Link to="/services" className="text-white hover:text-[#00D2FF]">Security Consulting</Link>
              <Link to="/academy" className="text-white hover:text-[#00D2FF]">Academy</Link>
              <Link to="/cyber-range/labs" className="text-white hover:text-[#00D2FF]">IVVAB LABS</Link>
              <Link to="/learn" className="text-white hover:text-[#00D2FF]">Courses</Link>
              <Link to="/team" className="text-white hover:text-[#00D2FF]">Leadership</Link>
            </div>
            
            <div className="h-px bg-white/10 my-8" />
            
            <div className="flex flex-col gap-4 w-full mt-auto mb-24">
              {user ? (
                <CyberButton variant="primary" to="/dashboard" className="w-full">Access Dashboard</CyberButton>
              ) : (
                <CyberButton variant="primary" to="/login" className="w-full">ENTER THE VANGUARD</CyberButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Keep BottomNav for specific role-based mobile dock inside the app
// Removing for now to stick strictly to the new requirement of the full-screen mobile menu on the main site.
export function BottomNav() {
  return null;
}
