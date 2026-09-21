import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/profile")({ component: ProfilePage });
function ProfilePage() {
  const { user, profile } = useAuth();
  return (
    <main className="pt-24 min-h-screen px-4">
      <div className="max-w-2xl mx-auto glass rounded-xl p-8">
        <p className="mono text-xs text-cyber">// PROFILE</p>
        <h1 className="display text-4xl mt-2">{profile?.full_name ?? "Your profile"}</h1>
        <p className="text-muted-foreground mt-3">{user?.email}</p>
        <p className="mt-6 text-sm">
          Profile editing is available through the secured Supabase profile row.
        </p>
      </div>
    </main>
  );
}
