import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Phone, Mail, Shield } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({ next: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in — CyberShield India" }, { name: "description", content: "Sign in with phone OTP or Google." }] }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading, isAdmin } = useAuth();
  const nav = useNavigate();
  const { next } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const dest = next && next.startsWith("/") ? next : (isAdmin ? "/admin" : "/dashboard");
      nav({ to: dest, replace: true });
    }
  }, [user, loading, isAdmin, next, nav]);

  const sendOtp = async () => {
    if (!/^\+\d{10,15}$/.test(phone)) { toast.error("Enter phone as +91XXXXXXXXXX"); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("OTP sent to your phone");
    setMode("otp");
  };

  const verifyOtp = async () => {
    if (otp.length < 4) { toast.error("Enter the OTP code"); return; }
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Signed in");
  };

  const google = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (res.error) { setBusy(false); toast.error(res.error.message || "Google sign-in failed"); return; }
    if (res.redirected) return;
    // else session was set
  };

  return (
    <main className="pt-16 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass rounded-2xl p-8 glow-cyber">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center glow-cyber">
            <Shield className="w-7 h-7 text-cyber" />
          </div>
          <h1 className="display text-3xl mt-4 text-cyber">SECURE ACCESS</h1>
          <p className="mono text-[0.65rem] text-muted-foreground mt-1">CYBERSHIELD IDENTITY GATE</p>
        </div>

        {mode === "phone" ? (
          <div className="space-y-3">
            <label className="mono text-[0.6rem] text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> PHONE NUMBER</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+919876543210"
              className="w-full bg-input/40 border border-border rounded-md px-3 py-3 focus:outline-none focus:border-primary" />
            <button disabled={busy} onClick={sendOtp} className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-md disabled:opacity-50">
              {busy ? "SENDING..." : "SEND OTP"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="mono text-[0.6rem] text-muted-foreground">OTP CODE FOR {phone}</label>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit code"
              className="w-full bg-input/40 border border-border rounded-md px-3 py-3 tracking-widest text-center text-lg focus:outline-none focus:border-primary" />
            <button disabled={busy} onClick={verifyOtp} className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-md disabled:opacity-50">
              {busy ? "VERIFYING..." : "VERIFY & SIGN IN"}
            </button>
            <button onClick={() => setMode("phone")} className="w-full text-xs text-muted-foreground mono">← CHANGE NUMBER</button>
          </div>
        )}

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
