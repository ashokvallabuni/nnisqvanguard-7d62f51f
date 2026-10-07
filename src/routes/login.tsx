import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { sendNewLoginEmail } from "@/lib/email.functions";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ next: z.string().optional() }),
  head: () => ({ meta: [{ title: "Login — NISQ Vanguard" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const next = search.next || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please enter both email and password.");
    setBusy(true);
    
    // IP and time for notification
    const time = new Date().toLocaleString();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast.error(error.message || "Invalid email or password");
      setBusy(false);
      return;
    }
    
    // We send a new login email (fire and forget)
    sendNewLoginEmail({ data: { email, time } }).catch(console.error);

    toast.success("Successfully logged in");
    
    // Redirect based on role if needed, or rely on auth context router
    window.location.href = next;
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await signInWithGoogle(next);
    if (result.error) {
      toast.error("Unable to complete authentication. Please try again.");
      setBusy(false);
    }
  };

  return (
    <main className="pt-24 pb-16 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass rounded-[16px] p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-nisq-blue-tint border border-nisq-border flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-nisq-blue" />
          </div>
          <h1 className="text-2xl font-bold text-nisq-ink">Welcome Back</h1>
          <p className="text-sm text-nisq-muted mt-2">Log in to your NISQ Vanguard account</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-nisq-ink">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-nisq-offwhite border border-nisq-border rounded-[8px] px-3 py-2 text-sm text-nisq-ink focus:outline-none focus:border-nisq-blue transition-colors"
              placeholder="name@example.com"
              disabled={busy}
              required
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-nisq-ink">Password</label>
              <Link to="/forgot-password" className="text-xs text-nisq-blue hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-nisq-offwhite border border-nisq-border rounded-[8px] px-3 py-2 text-sm text-nisq-ink focus:outline-none focus:border-nisq-blue transition-colors"
              placeholder="••••••••"
              disabled={busy}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Authenticating..." : "Login"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-nisq-border"></div>
          <div className="text-xs text-nisq-muted uppercase font-semibold">Or</div>
          <div className="flex-1 h-px bg-nisq-border"></div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-nisq-muted">
          Don't have an account?{" "}
          <Link to="/signup" className="text-nisq-blue font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
