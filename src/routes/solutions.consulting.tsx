import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, CheckCircle2, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/solutions/consulting")({
  head: () => ({
    meta: [
      { title: "Cybersecurity Consulting — NISQ Vanguard" },
      {
        name: "description",
        content:
          "Practical cybersecurity consulting and awareness planning for Indian colleges and organizations.",
      },
      { property: "og:title", content: "Cybersecurity Consulting — NISQ Vanguard" },
      {
        property: "og:description",
        content:
          "Practical cybersecurity consulting and awareness planning for Indian colleges and organizations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConsultingPage,
});

function ConsultingPage() {
  return (
    <main className="pt-16 min-h-screen">
      <section className="range-band px-4 md:px-8 py-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          <div>
            <p className="mono text-xs text-cyber mb-3">// SECURITY ADVISORY</p>
            <h1 className="display text-5xl md:text-7xl leading-none mb-6">
              Cybersecurity built for real organizations.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-8">
              Start with a focused conversation about awareness, risk and practical next steps for
              your campus or team.
            </p>
            <Link to="/programs" className={cn(buttonVariants({ size: "lg" }), "glow-cyber")}>
              Book a consultation <ArrowRight />
            </Link>
          </div>
          <div className="glass p-6 rounded-lg">
            <ShieldCheck className="size-10 text-cyber mb-5" />
            <h2 className="display text-3xl mb-5">Consultation areas</h2>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex gap-3">
                <CheckCircle2 className="size-5 text-cyber shrink-0" /> Cyber awareness planning
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="size-5 text-cyber shrink-0" /> Campus and workforce
                readiness
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="size-5 text-cyber shrink-0" /> Practical fraud-prevention
                education
              </li>
              <li className="flex gap-3">
                <Building2 className="size-5 text-cyber shrink-0" /> Webinar, seminar and workshop
                delivery
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
