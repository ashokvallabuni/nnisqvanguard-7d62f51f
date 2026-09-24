import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";

export function BackendPage({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main className="pt-20 pb-10 md:pt-24 min-h-screen px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-end mb-5">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-border bg-background hover:bg-muted text-foreground font-mono text-[0.7rem] font-semibold tracking-wide transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">HOME</span>
          </Link>
        </div>
        <div className="glass rounded-xl p-6 md:p-10 border border-border">
          <p className="mono text-xs text-cyber">// {eyebrow}</p>
          <h1 className="display text-3xl md:text-5xl mt-2">{title}</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl">{description}</p>
          <p className="mono text-[0.65rem] text-muted-foreground mt-8">
            BACKEND DATA WILL APPEAR HERE WHEN CONFIGURED
          </p>
        </div>
      </div>
    </main>
  );
}
