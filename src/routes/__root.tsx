import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider, useAuth } from "../lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Shield, LogOut, Menu, X, Home, BookOpen, Terminal, Radar, User, Award, LineChart } from "lucide-react";
import { useState } from "react";

const nisqLogoUrl = "/assets/nisq-logo.jpeg";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md w-full text-center glass rounded-2xl p-8 md:p-10 glow-cyber border border-border">
        <div className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground mb-2">
          SIGNAL LOST
        </div>
        <h1 className="display text-6xl md:text-7xl text-cyber font-black">404</h1>
        <p className="mono text-xs md:text-sm text-muted-foreground mt-3 tracking-wide">
          PAGE NOT FOUND
        </p>
        <h2 className="mt-5 text-lg md:text-xl font-semibold text-foreground">
          The requested route could not be located.
        </h2>
        <div className="mt-8 flex flex-col gap-2.5">
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs font-mono tracking-wide"
          >
            RETURN HOME
          </Link>
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              to="/academy"
              className="w-full inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors font-mono tracking-wide"
            >
              OPEN ACADEMY
            </Link>
            <Link
              to="/cyber-range/labs"
              className="w-full inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors font-mono tracking-wide"
            >
              OPEN CYBER LABS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-xl p-8">
        <h1 className="display text-2xl text-cyber">SYSTEM FAULT</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message.slice(0, 200)}</p>
        <div className="mt-6 flex gap-2 justify-center">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Retry
          </button>
          <a href="/" className="rounded-md border px-4 py-2 text-sm">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0ea5e9" },
      {
        title:
          "NISQ Vanguard Academy & Cyber Labs — Advanced Cybersecurity & Threat Intelligence Platform",
      },
      {
        name: "description",
        content:
          "NISQ Vanguard Academy & Cyber Labs: Enterprise-grade cybersecurity training, real data threat investigations, and hands-on cyber range labs.",
      },
      { name: "author", content: "NISQ Vanguard — Defence Technologies" },
      { name: "application-name", content: "NISQ Vanguard" },
      { name: "apple-mobile-web-app-title", content: "NISQ Vanguard" },
      {
        property: "og:title",
        content: "NISQ Vanguard Academy & Cyber Labs — Hands-on Cyber Defense",
      },
      {
        property: "og:description",
        content:
          "Real-data cybersecurity learning platform, containerized cyber ranges, and defense intelligence.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "NISQ Vanguard" },
      { property: "og:image", content: "/assets/nisq-logo.jpeg" },
      { property: "og:image:type", content: "image/jpeg" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "NISQ Vanguard Academy & Cyber Labs",
      },
      {
        name: "twitter:description",
        content:
          "Master defensive operations, network forensics, and threat hunting with real data and live cyber ranges.",
      },
      { name: "twitter:image", content: "/assets/nisq-logo.jpeg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.jpeg", sizes: "180x180" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthListener() {
  const router = useRouter();
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);
  return null;
}

function TopNav() {
  const { user, isAdmin, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  if (pathname.startsWith("/_authenticated/admin") || pathname.startsWith("/admin")) return null;

  const mainNav = [
    { to: "/", label: "HOME", icon: Home },
    { to: "/academy", label: "ACADEMY", icon: BookOpen },
    { to: "/cyber-range/labs", label: "CYBER LABS", icon: Terminal },
    { to: "/intelligence", label: "THREAT INTEL", icon: Radar },
    { to: "/solutions", label: "SERVICES", icon: Shield },
    { to: "/events", label: "COMMUNITY", icon: User },
  ];

  const authedNav = user ? [
    { to: "/cyber-range/my-progress", label: "PROGRESS", icon: LineChart },
    { to: "/certificates", label: "CERTIFICATES", icon: Award },
    { to: "/profile", label: "PROFILE", icon: User },
  ] : [];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-4 md:px-8 bg-card/90 backdrop-blur-md border-b border-border/80 shadow-xs">
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 rounded-md border border-primary/40 bg-white overflow-hidden shadow-xs flex items-center justify-center">
          <img src={nisqLogoUrl} alt="NISQ Vanguard logo" className="w-full h-full object-cover" />
        </div>
        <div className="leading-tight">
          <div className="font-display font-bold text-sm md:text-base tracking-wider text-foreground group-hover:text-primary transition-colors">
            NISQ <span className="text-primary">VANGUARD</span>
          </div>
          <div className="font-mono text-[0.6rem] text-muted-foreground tracking-tight">
            DEFENCE TECHNOLOGIES
          </div>
        </div>
      </Link>

      <ul className="hidden xl:flex gap-0.5 items-center">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-semibold text-[0.7rem] tracking-wide transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
        {authedNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.to || pathname.startsWith(item.to);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-semibold text-[0.7rem] tracking-wide transition-colors ${
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="hidden xl:flex gap-2 items-center">
        {user ? (
          <>
            {isAdmin && (
              <Link
                to="/admin"
                className="font-mono text-[0.65rem] px-2.5 py-1.5 rounded-md border border-accent/40 text-accent hover:bg-accent/10 transition-colors font-semibold tracking-wide"
              >
                ADMIN CONSOLE
              </Link>
            )}
            <Link
              to="/dashboard"
              className={`font-mono text-[0.65rem] px-3.5 py-1.5 rounded-md border transition-all flex items-center gap-1.5 font-semibold tracking-wide ${
                pathname === "/dashboard"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background border-border text-foreground hover:border-primary/50"
              }`}
            >
              <span>DASHBOARD</span>
            </Link>
            <button
              onClick={() => void signOut()}
              className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex gap-2">
            <Link
              to="/login"
              className="font-mono text-[0.65rem] px-4 py-2 rounded-md border border-border text-foreground font-semibold hover:bg-muted transition-colors tracking-wide"
            >
              SIGN IN
            </Link>
            <Link
              to="/auth"
              className="font-mono text-[0.65rem] px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-xs tracking-wide"
            >
              CREATE ACCOUNT
            </Link>
          </div>
        )}
      </div>

      <button
        className="xl:hidden p-2 rounded-md text-foreground hover:bg-muted"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="xl:hidden absolute top-16 inset-x-0 bg-card/95 backdrop-blur-md border-b border-border p-4 flex flex-col gap-1 shadow-lg animate-in slide-in-from-top-2 max-h-[80vh] overflow-y-auto">
          <div className="font-mono text-[0.6rem] text-muted-foreground uppercase px-2 py-1 tracking-wider">
            Platform
          </div>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          {authedNav.length > 0 && (
            <>
              <div className="font-mono text-[0.6rem] text-muted-foreground uppercase px-2 py-1 mt-2 tracking-wider border-t border-border pt-3">
                My Workspace
              </div>
              {authedNav.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.to || pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
          <div className="border-t border-border pt-3 mt-2 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="w-full text-center py-3 rounded-md bg-primary text-primary-foreground font-mono text-xs font-semibold tracking-wide"
                >
                  OPEN DASHBOARD
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="w-full text-center py-3 rounded-md border border-accent/40 text-accent font-mono text-xs font-semibold tracking-wide"
                  >
                    ADMIN CONSOLE
                  </Link>
                )}
                <button
                  onClick={() => {
                    setOpen(false);
                    void signOut();
                  }}
                  className="w-full text-center py-3 rounded-md border border-border text-muted-foreground hover:text-destructive font-mono text-xs font-semibold tracking-wide"
                >
                  SIGN OUT
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="w-full text-center py-3 rounded-md border border-border text-foreground font-mono text-xs font-semibold tracking-wide"
                >
                  SIGN IN
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="w-full text-center py-3 rounded-md bg-primary text-primary-foreground font-mono text-xs font-semibold tracking-wide"
                >
                  CREATE ACCOUNT
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function BottomNav() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/_authenticated/admin") || pathname.startsWith("/admin")) return null;

  const items = [
    { to: "/", label: "HOME", icon: Home },
    { to: "/academy", label: "ACADEMY", icon: BookOpen },
    { to: "/cyber-range/labs", label: "LABS", icon: Terminal },
    { to: "/intelligence", label: "INTEL", icon: Radar },
    { to: user ? "/profile" : "/login", label: user ? "PROFILE" : "SIGN IN", icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 h-12 md:hidden bg-card/95 backdrop-blur-md border-t border-border/80 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]"
      role="navigation"
      aria-label="Mobile primary navigation"
    >
      <ul className="h-full grid grid-cols-5 items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.to || (item.to !== "/" && item.to !== "/login" && pathname.startsWith(item.to));
          return (
            <li key={item.to} className="h-full">
              <Link
                to={item.to}
                className={`h-full w-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
                <span className="font-mono text-[9px] font-semibold tracking-wider leading-none">
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthListener />
        <div className="min-h-screen relative pt-16 pb-12 md:pb-0">
          <div className="fixed inset-0 grid-bg opacity-20 pointer-events-none" />
          <TopNav />
          <BottomNav />
          <div className="relative z-10">
            <Outlet />
          </div>
        </div>
        <Toaster theme="light" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
