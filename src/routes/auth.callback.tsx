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
        // Strip sensitive OAuth hash or query parameters from browser URL
        if (typeof window !== "undefined" && window.history?.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
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
      const searchParams = new URLSearchParams(window.location.search);
      const rawHash = window.location.hash.startsWith("#")
        ? window.location.hash.substring(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(rawHash);

      const oauthError =
        searchParams.get("error_description") ??
        searchParams.get("error") ??
        hashParams.get("error_description") ??
        hashParams.get("error");

      if (oauthError) {
        if (active) setMessage(`Authentication error: ${oauthError}`);
        return;
      }

      // Handle PKCE code exchange if present in query or hash params
      const code = searchParams.get("code") ?? hashParams.get("code");
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session?.user) {
          await finalizeLogin(data.session.user);
          return;
        }
      }

      // Handle implicit flow (access_token / refresh_token in hash fragment)
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token") ?? "";
      if (accessToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error && data.session?.user) {
          await finalizeLogin(data.session.user);
          return;
        }
      }

      // Check existing session
      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session?.user) {
        await finalizeLogin(data.session.user);
        return;
      }
    })().catch(() => {
      if (active) setMessage("Unable to complete authentication. Please try again.");
    });

    // Listen for auth state change in case session detection is asynchronous
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
