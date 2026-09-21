import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — NISQ Vanguard" }] }),
  component: AuthPage,
});

export function AuthPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [next, setNext] = useState("/dashboard");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("next");
    if (requested?.startsWith("/")) setNext(requested);
  }, []);

  useEffect(() => {
    if (!loading && user) void navigate({ to: next, replace: true });
  }, [loading, user, next, navigate]);

  const google = async () => {
    setBusy(true);
    const result = await signInWithGoogle(next);
    if (result.error) {
      setBusy(false);
      toast.error("Unable to complete authentication. Please try again.");
    }
  };

  return (
    <main className="pt-16 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass rounded-2xl p-8 glow-cyber">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center glow-cyber">
            <Shield className="w-7 h-7 text-cyber" />
          </div>
          <h1 className="display text-3xl mt-4 text-cyber">WELCOME TO NISQ VANGUARD</h1>
          <p className="text-sm text-muted-foreground mt-3">
            Access your cybersecurity learning, labs and security platform.
          </p>
        </div>
        <button
          onClick={google}
          disabled={busy || loading}
          className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-md disabled:opacity-50"
        >
          {busy ? "AUTHENTICATING..." : "CONTINUE WITH GOOGLE"}
        </button>
        <p className="mt-6 text-center mono text-[0.55rem] text-muted-foreground">
          BY CONTINUING YOU AGREE TO OUR TERMS &amp; PRIVACY POLICY
        </p>
      </div>
    </main>
  );
}
