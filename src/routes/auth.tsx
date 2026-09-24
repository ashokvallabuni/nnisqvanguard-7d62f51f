import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, User, Building } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — NISQ Vanguard" }] }),
  component: AuthPage,
});

export function AuthPage() {
  const { user, loading, signInWithGoogle, profile } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [next, setNext] = useState("/dashboard");
  const [intent, setIntent] = useState<"STUDENT" | "ORGANIZATION" | null>(null);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("next");
    if (requested?.startsWith("/")) setNext(requested);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      const targetNext =
        profile?.account_type === "ORGANIZATION" ? "/organization/dashboard" : "/dashboard";
      const finalRoute = next !== "/dashboard" ? next : targetNext;
      void navigate({ to: finalRoute, replace: true });
    }
  }, [loading, user, next, navigate, profile]);

  const google = async () => {
    setBusy(true);
    if (intent) {
      sessionStorage.setItem("nisq:intent", intent);
    }
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

        {!intent ? (
          <div className="space-y-4 fade-in">
            <p className="text-center text-sm font-semibold mb-4">
              HOW WILL YOU USE NISQ VANGUARD?
            </p>
            <button
              onClick={() => setIntent("STUDENT")}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-bold">PERSONAL / LEARNER</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Learn cybersecurity, practice through Cyber Labs, earn badges and certificates.
                </div>
              </div>
            </button>

            <button
              onClick={() => setIntent("ORGANIZATION")}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-accent/40 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="font-bold">ORGANIZATION / BUSINESS</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Request consulting, access enterprise services, and manage incident reports.
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-6 fade-in">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 text-sm">
              <span className="text-muted-foreground">Selected:</span>
              <span className="font-bold">
                {intent === "STUDENT" ? "Personal / Learner" : "Organization / Business"}
              </span>
              <button
                onClick={() => setIntent(null)}
                className="ml-auto text-xs text-primary hover:underline"
              >
                Change
              </button>
            </div>
            <button
              onClick={google}
              disabled={busy || loading}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-md disabled:opacity-50"
            >
              {busy ? "AUTHENTICATING..." : "CONTINUE WITH GOOGLE"}
            </button>
            <p className="mt-6 text-center mono text-[0.55rem] text-muted-foreground">
              BY CONTINUING YOU AGREE TO OUR TERMS & PRIVACY POLICY
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
