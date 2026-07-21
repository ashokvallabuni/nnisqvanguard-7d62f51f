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



function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-xl p-10 glow-cyber">
        <h1 className="display text-7xl text-cyber">404</h1>
        <p className="mono text-xs text-muted-foreground mt-2">SIGNAL LOST</p>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <Link to="/" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Return home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-xl p-8">
        <h1 className="display text-2xl text-cyber">SYSTEM FAULT</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message.slice(0, 200)}</p>
        <div className="mt-6 flex gap-2 justify-center">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Retry</button>
          <a href="/" className="rounded-md border px-4 py-2 text-sm">Home</a>
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
      { title: "CyberShield India — AI Fraud Detection & College Cyber Awareness" },
      { name: "description", content: "AI-powered scam screenshot analysis, cybercrime complaint filing, and cyber-awareness programs booked by colleges across India." },
      { name: "author", content: "CyberShield India" },
      { property: "og:title", content: "CyberShield India — AI Fraud Detection & College Cyber Awareness" },
      { property: "og:description", content: "AI-powered scam screenshot analysis, cybercrime complaint filing, and cyber-awareness programs booked by colleges across India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "CyberShield India — AI Fraud Detection & College Cyber Awareness" },
      { name: "twitter:description", content: "AI-powered scam screenshot analysis, cybercrime complaint filing, and cyber-awareness programs booked by colleges across India." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/7644f823-8e64-4f93-a61d-f9212f6ef494" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/7644f823-8e64-4f93-a61d-f9212f6ef494" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap" },
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
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
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

  const links = [
    { to: "/", label: "Home" },
    { to: "/learn", label: "Learn" },
    { to: "/programs", label: "Programs" },
    { to: "/fraud-check", label: "Fraud Check" },
    { to: "/complaint", label: "File Complaint" },
    { to: "/team", label: "Team" },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-4 md:px-8 glass border-b">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/40 glow-cyber bg-background">
          <img src={nisqLogo.url} alt="NISQ Vanguard logo" className="w-full h-full object-cover" />
        </div>
        <div className="leading-tight">
          <div className="display text-lg tracking-widest text-cyber">NISQ VANGUARD</div>
          <div className="mono text-[0.55rem] text-muted-foreground">CYBER PROTECTION · INDIA</div>
        </div>
      </Link>

      <ul className="hidden lg:flex gap-6 items-center">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="mono text-[0.7rem] text-muted-foreground hover:text-cyber transition">{l.label}</Link>
          </li>
        ))}
      </ul>
      <div className="hidden lg:flex gap-2 items-center">
        {user ? (
          <>
            {isAdmin && <Link to="/admin" className="mono text-[0.7rem] px-3 py-2 rounded-md border border-accent/40 text-accent hover:bg-accent/10">ADMIN</Link>}
            <Link to="/dashboard" className="mono text-[0.7rem] px-3 py-2 rounded-md border">Account</Link>
            <button onClick={signOut} className="p-2 rounded-md hover:bg-muted"><LogOut className="w-4 h-4" /></button>
          </>
        ) : (
          <Link to="/auth" className="mono text-[0.7rem] px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold glow-cyber">SIGN IN</Link>
        )}
      </div>
      <button className="lg:hidden p-2" onClick={() => setOpen((o) => !o)} aria-label="Menu">
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      {open && (
        <div className="lg:hidden absolute top-16 inset-x-0 glass border-b p-4 flex flex-col gap-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="mono text-xs text-muted-foreground hover:text-cyber">{l.label}</Link>
          ))}
          <div className="border-t pt-3 flex gap-2 flex-wrap">
            {user ? (
              <>
                {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="mono text-[0.7rem] px-3 py-2 rounded-md border border-accent/40 text-accent">ADMIN</Link>}
                <Link to="/dashboard" onClick={() => setOpen(false)} className="mono text-[0.7rem] px-3 py-2 rounded-md border">Account</Link>
                <button onClick={() => { setOpen(false); void signOut(); }} className="mono text-[0.7rem] px-3 py-2 rounded-md border">Sign out</button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="mono text-[0.7rem] px-4 py-2 rounded-md bg-primary text-primary-foreground">SIGN IN</Link>
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
        <Toaster theme="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
