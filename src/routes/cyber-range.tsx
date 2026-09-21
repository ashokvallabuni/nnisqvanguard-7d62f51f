import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Network, ShieldCheck } from "lucide-react";

import wolfHero from "@/assets/cyber-wolf-hero.jpg";
import logoAsset from "@/assets/nisq-logo.asset.json";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cyber-range")({
  head: () => ({
    meta: [
      { title: "NISQ Cyber Range — Professional Cyber Training" },
      { name: "description", content: "Enter NISQ Vanguard's professional cyber training environment for guided learning and practical labs." },
      { property: "og:title", content: "NISQ Cyber Range — Professional Cyber Training" },
      { property: "og:description", content: "A professional cyber training environment for guided learning and practical labs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CyberRangePage,
});

function CyberRangePage() {
  return (
    <main className="pt-16 min-h-screen">
      <section className="range-hero px-4 md:px-8 py-20">
        <img src={wolfHero} width={1920} height={1080} alt="Cyber wolf guarding the NISQ training range" className="range-wolf" />
        <div className="range-overlay" />
        <div className="relative max-w-6xl mx-auto min-h-[68vh] flex items-center justify-end">
          <div className="max-w-xl text-center lg:text-left">
            <img src={logoAsset.url} width={112} height={112} alt="NISQ Vanguard official logo" className="size-24 object-contain mx-auto lg:mx-0 mb-5 rounded-full" />
            <p className="mono text-xs text-cyber mb-3">// PROFESSIONAL TRAINING ENVIRONMENT</p>
            <h1 className="display text-6xl md:text-8xl leading-none mb-5">NISQ Cyber Range</h1>
            <p className="text-lg text-muted-foreground mb-8">Build knowledge through guided learning, quizzes and practical lab pathways. No simulated results—only real progress through the existing academy.</p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <Link to="/cyber-range/labs" className={cn(buttonVariants({ size: "lg" }), "glow-cyber")}>Enter Cyber Labs <ArrowRight /></Link>
              <Link to="/learn" className={buttonVariants({ variant: "outline", size: "lg" })}>Browse Academy <BookOpen /></Link>
            </div>
          </div>
        </div>
      </section>
      <section className="px-4 md:px-8 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
          <RangeFeature icon={<BookOpen />} title="Guided Learning" text="Start with structured cybersecurity awareness and foundations." />
          <RangeFeature icon={<Network />} title="Connected Practice" text="Move from lessons into available exercises and knowledge checks." />
          <RangeFeature icon={<ShieldCheck />} title="Tracked Progress" text="Your authenticated account keeps course progress in one place." />
        </div>
      </section>
    </main>
  );
}

function RangeFeature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="glass rounded-lg p-6"><div className="text-cyber mb-4">{icon}</div><h2 className="display text-2xl mb-2">{title}</h2><p className="text-sm text-muted-foreground">{text}</p></div>;
}