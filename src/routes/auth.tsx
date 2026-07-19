import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Mail, Shield, Lock } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({ next: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in — NISQ Vanguard" }, { name: "description", content: "Sign in with email or Google to access the NISQ Vanguard cybersecurity learning platform." }] }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading, isAdmin } = useAuth();
  const nav = useNavigate();
  const { next } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const dest = next && next.startsWith("/") ? next : (isAdmin ? "/admin" : "/dashboard");
      nav({ to: dest, replace: true });
    }
  }, [user, loading, isAdmin, next, nav]);

  const submit = async () => {
    if (!email || password.length < 6) { toast.error("Enter email and a password (6+ chars)"); return; }
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin + "/auth", data: { full_name: fullName || null } },
      });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Signed in");
    }
  };

  const google = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (res.error) { setBusy(false); toast.error(res.error.message || "Google sign-in failed"); return; }
    if (res.redirected) return;
  };

  return (
    <main className="pt-16 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass rounded-2xl p-8 glow-cyber">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center glow-cyber">
            <Shield className="w-7 h-7 text-cyber" />
          </div>
          <h1 className="display text-3xl mt-4 text-cyber">SECURE ACCESS</h1>
          <p className="mono text-[0.65rem] text-muted-foreground mt-1">NISQ VANGUARD IDENTITY GATE</p>
        </div>

        <div className="flex gap-2 mb-4 mono text-[0.6rem]">
          <button onClick={() => setMode("signin")} className={`flex-1 py-2 rounded border ${mode === "signin" ? "border-primary text-cyber" : "border-border text-muted-foreground"}`}>SIGN IN</button>
          <button onClick={() => setMode("signup")} className={`flex-1 py-2 rounded border ${mode === "signup" ? "border-primary text-cyber" : "border-border text-muted-foreground"}`}>CREATE ACCOUNT</button>
        </div>

        <div className="space-y-3">
          {mode === "signup" && (
            <>
              <label className="mono text-[0.6rem] text-muted-foreground">FULL NAME</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ashok Vallabhuni"
                className="w-full bg-input/40 border border-border rounded-md px-3 py-3 focus:outline-none focus:border-primary" />
            </>
          )}
          <label className="mono text-[0.6rem] text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> EMAIL</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
            className="w-full bg-input/40 border border-border rounded-md px-3 py-3 focus:outline-none focus:border-primary" />
          <label className="mono text-[0.6rem] text-muted-foreground flex items-center gap-1"><Lock className="w-3 h-3" /> PASSWORD</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
            className="w-full bg-input/40 border border-border rounded-md px-3 py-3 focus:outline-none focus:border-primary" />
          <button disabled={busy} onClick={submit} className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-md disabled:opacity-50">
            {busy ? "..." : (mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT")}
          </button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="mono text-[0.55rem] text-muted-foreground">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button onClick={google} disabled={busy} className="w-full border border-border rounded-md py-3 flex items-center justify-center gap-2 hover:bg-secondary disabled:opacity-50">
          <Mail className="w-4 h-4" /> Continue with Google
        </button>

        <p className="mt-6 text-center mono text-[0.55rem] text-muted-foreground">
          BY CONTINUING YOU AGREE TO OUR TERMS & PRIVACY POLICY
        </p>
      </div>
    </main>
  );
}
