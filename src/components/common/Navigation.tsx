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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const nisqLogoUrl = "/assets/nisq-logo.jpeg";

type NavItem = { to: string; label: string };

const PUBLIC_LINKS: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/academy", label: "Academy" },
  { to: "/cyber-range/labs", label: "IVVAB LABS" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const LEARNER_LINKS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/academy", label: "Academy" },
  { to: "/cyber-range/labs", label: "IVVAB LABS" },
  { to: "/programs", label: "Programs" },
  { to: "/cyber-range/my-progress", label: "Progress" },
];

const ORG_LINKS: NavItem[] = [
  { to: "/organization/dashboard", label: "Dashboard" },
  { to: "/services", label: "Consulting" },
  { to: "/academy", label: "Academy" },
  { to: "/programs", label: "Programs" },
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
    "flex items-center gap-3 px-4 h-11 text-sm font-medium text-nisq-text hover:bg-nisq-blue-tint hover:text-nisq-blue transition-colors";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-3 bg-nisq-white border border-nisq-border hover:border-nisq-blue transition-colors px-3 h-11 rounded-lg"
      >
        <div className="w-7 h-7 rounded-full overflow-hidden bg-nisq-blue-tint flex items-center justify-center">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-4 h-4 text-nisq-blue" />
          )}
        </div>
        <div className="flex flex-col items-start text-left leading-tight">
          <span className="text-sm text-nisq-ink font-semibold truncate max-w-[120px]">
            {displayName}
          </span>
          <span className="text-[10px] text-nisq-muted tracking-wider uppercase">
            {accountType}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-nisq-muted" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute right-0 mt-2 w-56 bg-nisq-white border border-nisq-border rounded-xl shadow-pop z-50 flex flex-col py-1 overflow-hidden"
          >
            {isAdmin && (
              <Link
                to={"/admin" as any}
                className={itemClass}
                onClick={() => setIsOpen(false)}
              >
                <ShieldCheck className="w-4 h-4" /> Admin Console
              </Link>
            )}
            <Link to={dashboardLink as any} className={itemClass} onClick={() => setIsOpen(false)}>
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link to={"/profile" as any} className={itemClass} onClick={() => setIsOpen(false)}>
              <UserIcon className="w-4 h-4" /> Profile
            </Link>
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
        className={`w-full bg-nisq-white border-b border-nisq-border transition-shadow duration-200 ${
          scrolled ? "shadow-nav" : ""
        }`}
        aria-label="Main navigation"
      >
        <div className="container-nv flex h-[72px] items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="NISQ Vanguard home">
            <img
              src={nisqLogoUrl}
              alt="NISQ Vanguard logo"
              className="w-10 h-10 rounded-lg object-cover border border-nisq-border"
            />
            <span className="text-base font-bold tracking-tight text-nisq-ink hidden sm:block">
              NISQ Vanguard
            </span>
          </Link>

          {/* Links */}
          <ul className="hidden min-[1100px]:flex items-center gap-1 flex-1 justify-center">
            {isAdmin && (
              <li>
                <Link
                  to={"/admin" as any}
                  className="relative h-[72px] flex items-center px-3 text-sm font-semibold text-nisq-blue hover:text-nisq-blue-bright"
                >
                  Admin Console
                </Link>
              </li>
            )}
            {links.map((l) => (
              <li key={l.to + l.label}>
                <Link
                  to={l.to as any}
                  aria-current={isActive(l.to) ? "page" : undefined}
                  className={`relative h-[72px] flex items-center px-3 text-sm font-medium transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors ${
                    isActive(l.to)
                      ? "text-nisq-blue after:bg-nisq-blue"
                      : "text-nisq-ink hover:text-nisq-blue after:bg-transparent"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="hidden min-[1100px]:flex items-center justify-end gap-3 shrink-0">
            {user ? (
              <>
                <AccountDropdown />
                <Button variant="outline" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/login">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="min-[1100px]:hidden h-11 w-11 flex items-center justify-center rounded-lg border border-nisq-border text-nisq-ink hover:bg-nisq-blue-tint"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
            className="min-[1100px]:hidden absolute inset-x-0 top-full z-[90] bg-nisq-white border-b border-nisq-border shadow-pop max-h-[calc(100svh-72px)] overflow-y-auto"
          >
            <div className="container-nv py-4 flex flex-col">
              {isAdmin && (
                <Link
                  to={"/admin" as any}
                  onClick={() => setOpen(false)}
                  className="h-12 flex items-center text-base font-semibold text-nisq-blue"
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
                  className={`h-12 flex items-center text-base font-medium border-b border-nisq-border last:border-b-0 ${
                    isActive(l.to) ? "text-nisq-blue" : "text-nisq-ink"
                  }`}
                >
                  {l.label}
                </Link>
              ))}

              <div className="flex flex-col gap-3 pt-4 pb-2">
                {user ? (
                  <>
                    <Link
                      to={"/profile" as any}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 p-3 border border-nisq-border rounded-xl bg-nisq-offwhite"
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-nisq-blue-tint flex items-center justify-center">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-4 h-4 text-nisq-blue" />
                        )}
                      </div>
                      <div className="flex flex-col text-left leading-tight">
                        <span className="text-sm text-nisq-ink font-semibold">
                          {profile?.full_name || user?.email?.split("@")[0] || "User"}
                        </span>
                        <span className="text-[11px] text-nisq-muted uppercase tracking-wider">
                          {isOrg ? "Organization" : "Student"}
                        </span>
                      </div>
                    </Link>
                    <Button variant="outline" className="w-full" onClick={() => signOut()}>
                      <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link to="/login">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
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
