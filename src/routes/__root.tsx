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
import { Shield, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const nisqLogoUrl = "/assets/nisq-logo.jpeg";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-xl p-10 glow-cyber">
        <h1 className="display text-7xl text-cyber">404</h1>
        <p className="mono text-xs text-muted-foreground mt-2">SIGNAL LOST</p>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Return home
        </Link>
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
      { rel: "icon", href: "/assets/nisq-logo.jpeg", type: "image/jpeg" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/assets/nisq-logo.jpeg" },
      { rel: "shortcut icon", href: "/assets/nisq-logo.jpeg", type: "image/jpeg" },
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
    { to: "/academy", label: "Academy", badge: "Theory" },
    { to: "/cyber-range/labs", label: "Cyber Labs", badge: "Hands-on" },
    { to: "/cyber-range/learning-paths", label: "Learning Paths" },
    { to: "/achievements", label: "Badges", badge: "Verified" },
    { to: "/academy/glossary", label: "Glossary" },
  ];

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
            ACADEMY
          </div>
        </div>
      </Link>

      <ul className="hidden lg:flex gap-1 items-center">
        {mainNav.map((item) => {
          const isActive =
            pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[0.6rem] px-1.5 py-0.5 rounded-xs font-mono uppercase ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="hidden lg:flex gap-2.5 items-center">
        {user ? (
          <>
            {isAdmin && (
              <Link
                to="/admin"
                className="font-mono text-xs px-2.5 py-1.5 rounded-md border border-accent/40 text-accent hover:bg-accent/10 transition-colors"
              >
                ADMIN
              </Link>
            )}
            <Link
              to="/dashboard"
              className={`font-mono text-xs px-3.5 py-1.5 rounded-md border transition-all flex items-center gap-1.5 ${
                pathname === "/dashboard"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background border-border text-foreground hover:border-primary/50"
              }`}
            >
              <span>Command Center</span>
            </Link>
            <button
              onClick={() => void signOut()}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="font-mono text-xs px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-xs"
          >
            SIGN IN
          </Link>
        )}
      </div>

      <button
        className="lg:hidden p-2 rounded-md text-foreground hover:bg-muted"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="lg:hidden absolute top-16 inset-x-0 bg-card/95 backdrop-blur-md border-b border-border p-4 flex flex-col gap-2 shadow-lg animate-in slide-in-from-top-2">
          <div className="font-mono text-[0.65rem] text-muted-foreground uppercase px-2 mb-1">
            Navigation
          </div>
          {mainNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted font-medium"
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[0.65rem] px-1.5 py-0.5 rounded-xs bg-muted font-mono text-muted-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
          <div className="border-t border-border pt-3 mt-1 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="w-full text-center py-2 rounded-md bg-primary text-primary-foreground font-mono text-xs font-semibold"
                >
                  Student Command Center
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="w-full text-center py-2 rounded-md border border-accent/40 text-accent font-mono text-xs"
                  >
                    Admin Console
                  </Link>
                )}
                <button
                  onClick={() => {
                    setOpen(false);
                    void signOut();
                  }}
                  className="w-full text-center py-2 rounded-md border border-border text-muted-foreground hover:text-destructive font-mono text-xs"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="w-full text-center py-2 rounded-md bg-primary text-primary-foreground font-mono text-xs font-semibold"
              >
                SIGN IN
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthListener />
        <div className="min-h-screen relative">
          <div className="fixed inset-0 grid-bg opacity-20 pointer-events-none" />
          <TopNav />
          <div className="relative z-10">
            <Outlet />
          </div>
        </div>
        <Toaster theme="light" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
