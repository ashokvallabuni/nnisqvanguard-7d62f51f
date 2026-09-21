import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";

import logoAsset from "@/assets/nisq-logo.asset.json";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/cyber-range/labs")({
  head: () => ({
    meta: [
      { title: "Cyber Labs — NISQ Vanguard" },
      { name: "description", content: "Your authenticated NISQ Vanguard cyber lab entry and guided training pathways." },
      { property: "og:title", content: "Cyber Labs — NISQ Vanguard" },
      { property: "og:description", content: "Authenticated entry to NISQ Vanguard guided training pathways." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CyberLabsPage,
});

function CyberLabsPage() {
  return (
    <main className="pt-16 min-h-screen range-band px-4 md:px-8 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <img src={logoAsset.url} width={80} height={80} alt="NISQ Vanguard official logo" className="size-16 rounded-full object-contain" />
          <div><p className="mono text-xs text-cyber">// AUTHENTICATED ACCESS</p><h1 className="display text-5xl">Cyber Labs</h1></div>
        </div>
        <section className="glass rounded-lg p-8 md:p-10 border-primary/30">
          <ShieldCheck className="size-10 text-cyber mb-5" />
          <h2 className="display text-3xl mb-3">Training console ready</h2>
          <p className="text-muted-foreground max-w-2xl mb-8">Choose a current learning path to continue. Practical lab modules remain clearly marked in the academy and will never display fabricated scans or results.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/learn" className={cn(buttonVariants({ size: "lg" }), "glow-cyber")}>Open learning paths <ArrowRight /></Link>
            <Link to="/dashboard" className={buttonVariants({ variant: "outline", size: "lg" })}>View my progress <BookOpen /></Link>
          </div>
        </section>
      </div>
    </main>
  );
}