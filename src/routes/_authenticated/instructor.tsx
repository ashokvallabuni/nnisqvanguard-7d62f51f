import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
export const Route = createFileRoute("/_authenticated/instructor")({ component: InstructorPage });
function InstructorPage() {
  const { profile, loading } = useAuth();
  if (loading)
    return (
      <main className="pt-24 px-4 mono text-xs text-muted-foreground">LOADING SESSION...</main>
    );
  const allowed = profile?.role === "admin";
  if (!allowed)
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center">
        <div className="glass rounded-xl p-10 text-center">
          <div className="display text-5xl text-destructive">403</div>
          <p className="mono text-xs mt-3 text-destructive">ACCESS DENIED</p>
        </div>
      </main>
    );
  return (
    <main className="pt-24 min-h-screen px-4">
      <div className="max-w-5xl mx-auto glass rounded-xl p-8">
        <p className="mono text-xs text-cyber">// INSTRUCTOR</p>
        <h1 className="display text-4xl mt-2">Instructor console</h1>
        <p className="text-muted-foreground mt-4">
          Instructor access is controlled by the authenticated database role.
        </p>
      </div>
    </main>
  );
}
