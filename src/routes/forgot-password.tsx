import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — NISQ Vanguard" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email.");
    setBusy(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message);
      setBusy(false);
      return;
    }

    setSuccess(true);
    setBusy(false);
  };

  if (success) {
    return (
      <main className="pt-24 pb-16 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md glass rounded-[16px] p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-green-100 border border-green-200 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-nisq-ink">Check Your Email</h1>
          <p className="text-sm text-nisq-muted mt-2">
            If an account exists for <span className="font-semibold text-nisq-ink">{email}</span>, you will receive a password reset link.
          </p>
          <div className="mt-8">
            <Button asChild className="w-full">
              <Link to="/login">Return to Login</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-16 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass rounded-[16px] p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-nisq-blue-tint border border-nisq-border flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-nisq-blue" />
          </div>
          <h1 className="text-2xl font-bold text-nisq-ink">Forgot Password</h1>
          <p className="text-sm text-nisq-muted mt-2">Enter your email to receive a reset link.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
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

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Sending link..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-nisq-muted">
          Remember your password?{" "}
          <Link to="/login" className="text-nisq-blue font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
