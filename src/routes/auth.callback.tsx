import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ensureUserProfile } from "@/lib/auth-context";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("AUTHENTICATING...");

  useEffect(() => {
    let active = true;
    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const oauthError = params.get("error_description") ?? params.get("error");
      if (oauthError) {
        if (active) setMessage("Unable to complete authentication. Please try again.");
        return;
      }
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user) {
        if (active) setMessage("No active session was returned. Please try again.");
        return;
      }
      await ensureUserProfile(data.session.user);
      const storedNext = sessionStorage.getItem("nisq:auth-next");
      sessionStorage.removeItem("nisq:auth-next");
      const next = storedNext?.startsWith("/") ? storedNext : "/dashboard";
      void navigate({ to: next, replace: true });
    })().catch(() => {
      if (active) setMessage("Unable to complete authentication. Please try again.");
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main className="pt-24 min-h-screen flex items-center justify-center">
      <p className="mono text-xs text-cyber">{message}</p>
    </main>
  );
}
