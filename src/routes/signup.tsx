import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign Up — NISQ Vanguard" }] }),
  component: SignupPage,
});

const passwordSchema = z.string().min(8, "Password must be at least 8 characters long");

function SignupPage() {
  const { signInWithGoogle } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "ORGANIZATION">("STUDENT");
  const [organization, setOrganization] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }
    const pwdCheck = passwordSchema.safeParse(password);
    if (!pwdCheck.success) {
      return toast.error(pwdCheck.error.errors[0].message);
    }
    if (!fullName || !email) {
      return toast.error("Please fill in all required fields.");
    }

    setBusy(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          account_type: role,
          organization: role === "ORGANIZATION" ? organization : undefined,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setBusy(false);
      return;
    }

    // Call server function for welcome email
    fetch("/_server/sendWelcomeEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { email, name: fullName } }),
    }).catch(console.error);

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
            We've sent a verification link to <span className="font-semibold text-nisq-ink">{email}</span>. Please verify your email before logging in.
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
          <h1 className="text-2xl font-bold text-nisq-ink">Create an Account</h1>
          <p className="text-sm text-nisq-muted mt-2">Join NISQ Vanguard today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-nisq-ink">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-nisq-offwhite border border-nisq-border rounded-[8px] px-3 py-2 text-sm text-nisq-ink focus:outline-none focus:border-nisq-blue transition-colors"
              placeholder="John Doe"
              disabled={busy}
              required
            />
          </div>
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
            <label className="text-xs font-semibold text-nisq-ink">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-nisq-offwhite border border-nisq-border rounded-[8px] px-3 py-2 text-sm text-nisq-ink focus:outline-none focus:border-nisq-blue transition-colors"
              disabled={busy}
            >
              <option value="STUDENT">Student / Personal</option>
              <option value="ORGANIZATION">Organization / College</option>
            </select>
          </div>
          {role === "ORGANIZATION" && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-nisq-ink">Organization Name (Optional)</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full bg-nisq-offwhite border border-nisq-border rounded-[8px] px-3 py-2 text-sm text-nisq-ink focus:outline-none focus:border-nisq-blue transition-colors"
                placeholder="Acme Corp"
                disabled={busy}
              />
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-nisq-ink">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-nisq-offwhite border border-nisq-border rounded-[8px] px-3 py-2 text-sm text-nisq-ink focus:outline-none focus:border-nisq-blue transition-colors pr-10"
                placeholder="Min 8 characters"
                disabled={busy}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-nisq-muted hover:text-nisq-ink"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password && (
              <div className="flex gap-1 mt-2">
                <div className={`h-1 flex-1 rounded-full ${password.length > 0 ? (password.length >= 8 ? "bg-green-500" : "bg-red-400") : "bg-nisq-border"}`}></div>
                <div className={`h-1 flex-1 rounded-full ${password.length >= 10 ? "bg-green-500" : "bg-nisq-border"}`}></div>
                <div className={`h-1 flex-1 rounded-full ${password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? "bg-green-500" : "bg-nisq-border"}`}></div>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-nisq-ink">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-nisq-offwhite border border-nisq-border rounded-[8px] px-3 py-2 text-sm text-nisq-ink focus:outline-none focus:border-nisq-blue transition-colors"
              placeholder="••••••••"
              disabled={busy}
              required
            />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={busy}>
            {busy ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-nisq-border"></div>
          <div className="text-xs text-nisq-muted uppercase font-semibold">Or</div>
          <div className="flex-1 h-px bg-nisq-border"></div>
        </div>

        <Button variant="outline" className="w-full" onClick={() => signInWithGoogle("/dashboard")} disabled={busy}>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-nisq-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-nisq-blue font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
