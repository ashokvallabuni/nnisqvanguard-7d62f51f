import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/_authenticated/profile")({ component: ProfilePage });
function ProfilePage() {
  const { user, profile } = useAuth();
  return (
    <main className="min-h-screen">
      <PageHeader
        badge="USER WORKSPACE"
        badgeVariant="accent"
        title="Profile"
        subtitle="Manage your NISQ Vanguard identity and preferences."
        breadcrumbs={[{ label: "PROFILE" }]}
      />
      <div className="px-4 md:px-8 py-8 max-w-3xl mx-auto">
        <div className="glass rounded-xl p-6 md:p-8 border border-border">
          <p className="mono text-xs text-cyber">// PROFILE</p>
          <h2 className="display text-2xl md:text-3xl mt-2 font-bold">{profile?.full_name ?? "Your profile"}</h2>
          <p className="text-muted-foreground mt-3 font-mono text-sm">{user?.email}</p>
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Profile editing is available through the secured Supabase profile row.
              Additional settings and preferences will appear here as the platform matures.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
