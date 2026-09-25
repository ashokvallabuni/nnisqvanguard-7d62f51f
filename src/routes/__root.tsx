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
import { useRegisterSW } from "virtual:pwa-register/react";
import { TopNav, BottomNav, TelemetryTicker } from "@/components/common/Navigation";
import { CommandPalette } from "@/components/common/CommandPalette";
import {
  Shield,
  LogOut,
  Menu,
  X,
  Home,
  BookOpen,
  Terminal,
  Radar,
  User,
  Award,
  LineChart,
} from "lucide-react";
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
          "NISQ Vanguard Academy & Cyber Labs: Enterprise-grade cybersecurity training, real data threat investigations, and hands-on IVVAB LABS labs.",
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
          "Real-data cybersecurity learning platform, containerized IVVAB LABSs, and defense intelligence.",
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
          "Master defensive operations, network forensics, and threat hunting with real data and live IVVAB LABSs.",
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

// Removed TopNav and BottomNav, imported from Navigation.tsx

function AdminTacticalPreviewBar() {
  const { isAdmin, adminView, setAdminView } = useAuth();
  if (!isAdmin) return null;

  return (
    <div className="w-full bg-zinc-950/90 text-white border-b border-zinc-800 text-[0.65rem] font-mono flex items-center justify-between px-4 py-1.5">
      <div className="flex items-center gap-2 text-accent">
        <Shield className="w-3.5 h-3.5" />
        <span className="font-bold tracking-wider text-cyan-400">ADMIN CONSOLE ACTIVE</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-zinc-400 hidden sm:inline">VIEWING AS:</span>
        <div className="flex items-center gap-3">
          {(["ADMIN", "LEARNER", "ORGANIZATION"] as const).map((view) => (
            <label
              key={view}
              className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                adminView === view
                  ? "text-cyan-400 font-semibold"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              <input
                type="radio"
                name="adminView"
                value={view}
                checked={adminView === view}
                onChange={() => setAdminView(view)}
                className="w-3 h-3 accent-cyan-400"
              />
              <span>
                {view === "ADMIN" ? "Admin" : view === "LEARNER" ? "Learner" : "Organization"}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function PWARegister() {
  useRegisterSW({
    onRegistered(r: any) {
      console.log("SW Registered: " + r);
    },
    onRegisterError(error: any) {
      console.log("SW registration error", error);
    },
  });
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PWARegister />
        <AuthListener />
        <AdminTacticalPreviewBarWrapper />
        <Toaster theme="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AdminTacticalPreviewBarWrapper() {
  const { isAdmin } = useAuth();
  return (
    <div className="min-h-screen relative pb-20 md:pb-0">
      <header className="sticky top-0 z-50 w-full flex flex-col bg-background/90 backdrop-blur-md shadow-md border-b border-border">
        {isAdmin && <AdminTacticalPreviewBar />}
        <TelemetryTicker />
        <TopNav />
      </header>
      <div className="fixed inset-0 grid-bg opacity-[0.12] pointer-events-none" />
      <BottomNav />
      <CommandPalette />
      <div className="relative z-10 pt-4">
        <Outlet />
      </div>
    </div>
  );
}
