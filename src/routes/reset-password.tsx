import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — NISQ Vanguard" }] }),
  component: ResetPasswordPage,
});

const passwordSchema = z.string().min(8, "Password must be at least 8 characters long");

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        toast.info("Please set your new password");
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }
    const pwdCheck = passwordSchema.safeParse(password);
    if (!pwdCheck.success) {
      return toast.error(pwdCheck.error.errors[0].message);
    }

    setBusy(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      toast.error(error.message);
      setBusy(false);
      return;
    }

    toast.success("Password successfully updated. You can now log in.");
    setBusy(false);
    navigate({ to: "/login" });
  };

  return (
    <main className="pt-24 pb-16 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass rounded-[16px] p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-nisq-blue-tint border border-nisq-border flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-nisq-blue" />
          </div>
          <h1 className="text-2xl font-bold text-nisq-ink">Set New Password</h1>
          <p className="text-sm text-nisq-muted mt-2">Enter your new password below</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-nisq-ink">New Password</label>
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
            {busy ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </main>
  );
}
