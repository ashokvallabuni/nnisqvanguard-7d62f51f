import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cyber-range/labs")({
  head: () => ({ meta: [{ title: "Cyber Labs — NISQ Vanguard" }] }),
  component: CyberLabsPage,
});

function CyberLabsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const startLab = () => {
    if (!user) {
      void navigate({ to: "/login", search: { next: "/cyber-range/lab/intro" } });
      return;
    }
    void navigate({ to: "/cyber-range/lab/$slug", params: { slug: "intro" } });
  };

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
          <h2 className="display text-3xl mb-3">Guided practice, clearly connected</h2>
          <p className="text-muted-foreground max-w-2xl mb-8">
            Browse the Cyber Range publicly. Live isolated lab execution is not enabled until the
            execution provider is configured.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={startLab} className={cn(buttonVariants({ size: "lg" }), "glow-cyber")}>
              Start lab <ArrowRight />
            </button>
            <Link to="/learn" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Browse academy <BookOpen />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
