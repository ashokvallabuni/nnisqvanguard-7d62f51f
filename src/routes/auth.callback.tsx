import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ensureUserProfile } from "@/lib/auth-context";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("AUTHENTICATING...");
  const handledRef = useRef(false);

  useEffect(() => {
    let active = true;

    const finalizeLogin = async (user: any) => {
      if (handledRef.current) return;
      handledRef.current = true;
      try {
        await ensureUserProfile(user);
        const storedNext = sessionStorage.getItem("nisq:auth-next");
        sessionStorage.removeItem("nisq:auth-next");
        const next = storedNext?.startsWith("/") ? storedNext : "/dashboard";
        if (active) {
          void navigate({ to: next, replace: true });
        }
      } catch {
        if (active) {
          void navigate({ to: "/dashboard", replace: true });
        }
      }
    };

    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const oauthError = params.get("error_description") ?? params.get("error");
      if (oauthError) {
        if (active) setMessage(`Authentication error: ${oauthError}`);
        return;
      }

      // Handle PKCE code exchange if present in query params
      const code = params.get("code");
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session?.user) {
          await finalizeLogin(data.session.user);
          return;
        }
      }

      // Check current session
      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session?.user) {
        await finalizeLogin(data.session.user);
        return;
      }
    })().catch(() => {
      if (active) setMessage("Unable to complete authentication. Please try again.");
    });

    // Listen for auth state change in case session detection is asynchronous (e.g. hash fragment)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
        await finalizeLogin(session.user);
      }
    });

    const timeout = setTimeout(() => {
      if (active && !handledRef.current) {
        setMessage("Session resolution timed out. Please try logging in again.");
      }
    }, 8000);

    return () => {
      active = false;
      clearTimeout(timeout);
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <main className="pt-24 min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mono text-xs text-cyber">{message}</p>
      </div>
    </main>
  );
}
