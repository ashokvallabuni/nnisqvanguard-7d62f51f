import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { buttonVariants } from "@/components/ui/button";
import { listPublishedLabs } from "@/lib/cyber-labs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cyber-range/labs")({
  head: () => ({ meta: [{ title: "Cyber Labs — NISQ Vanguard" }] }),
  component: CyberLabsPage,
});

function CyberLabsPage() {
  const { user } = useAuth();
  const [labs, setLabs] = useState<Awaited<ReturnType<typeof listPublishedLabs>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    void listPublishedLabs()
      .then(setLabs)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="pt-16 min-h-screen range-band px-4 md:px-8 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <ShieldCheck className="size-14 text-cyber" />
          <div>
            <p className="mono text-xs text-cyber">// PUBLIC TRAINING CATALOG</p>
            <h1 className="display text-5xl">Cyber Labs</h1>
          </div>
        </div>
        <section className="glass rounded-lg p-8 md:p-10 border-primary/30">
          <h2 className="display text-3xl mb-3">Real practice, clearly connected</h2>
          <p className="text-muted-foreground max-w-2xl">
            Labs are published only after their dataset source, learning objectives and isolated
            execution requirements are reviewed.
          </p>
        </section>
        <div className="mt-8 grid md:grid-cols-2 gap-5">
          {loading && (
            <p className="mono text-xs text-muted-foreground">LOADING PUBLISHED LABS...</p>
          )}
          {error && (
            <p className="mono text-xs text-warning">
              LAB CATALOG UNAVAILABLE. PLEASE TRY AGAIN LATER.
            </p>
          )}
          {!loading && !error && labs.length === 0 && (
            <div className="glass rounded-lg p-8 md:col-span-2">
              <p className="mono text-xs text-cyber">// NO PUBLISHED LABS</p>
              <h2 className="display text-2xl mt-2">Labs are being connected</h2>
              <p className="text-sm text-muted-foreground mt-3">
                No production lab records are available yet. Dataset-derived content will appear
                here after validation and review.
              </p>
            </div>
          )}
          {labs.map((lab) => (
            <article key={lab.id} className="glass rounded-lg p-6">
              <p className="mono text-[0.65rem] text-cyber">
                {lab.difficulty} · {lab.lab_type}
              </p>
              <h2 className="display text-2xl mt-2">{lab.title}</h2>
              <p className="text-sm text-muted-foreground mt-3">{lab.description}</p>
              <Link
                to="/cyber-range/lab/$slug"
                params={{ slug: lab.slug }}
                className={cn(buttonVariants({ size: "sm" }), "mt-5")}
              >
                View lab <ArrowRight />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
