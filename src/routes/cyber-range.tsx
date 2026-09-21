import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Database, Network, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import wolfHero from "@/assets/cyber-wolf-hero.jpg";
import logoAsset from "@/assets/nisq-logo.asset.json";
import { buttonVariants } from "@/components/ui/button";
import { getCyberLabsCounts, type CyberLabsCounts } from "@/lib/cyber-labs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cyber-range")({
  head: () => ({
    meta: [
      { title: "NISQ Cyber Range — Professional Cyber Training" },
      {
        name: "description",
        content:
          "Enter NISQ Vanguard's professional cyber training environment for guided learning and practical labs.",
      },
      { property: "og:title", content: "NISQ Cyber Range — Professional Cyber Training" },
      {
        property: "og:description",
        content:
          "A professional cyber training environment for guided learning and practical labs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CyberRangePage,
});

function CyberRangePage() {
  const [counts, setCounts] = useState<CyberLabsCounts | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    void getCyberLabsCounts()
      .then(setCounts)
      .catch(() => setLoadError(true));
  }, []);

  return (
    <main className="pt-16 min-h-screen">
      <section className="range-hero px-4 md:px-8 py-20">
        <img
          src={wolfHero}
          width={1920}
          height={1080}
          alt="Cyber wolf guarding the NISQ training range"
          className="range-wolf"
        />
        <div className="range-overlay" />
        <div className="relative max-w-6xl mx-auto min-h-[68vh] flex items-center justify-end">
          <div className="max-w-xl text-center lg:text-left">
            <img
              src={logoAsset.url}
              width={112}
              height={112}
              alt="NISQ Vanguard official logo"
              className="size-24 object-contain mx-auto lg:mx-0 mb-5 rounded-full"
            />
            <p className="mono text-xs text-cyber mb-3">// PROFESSIONAL TRAINING ENVIRONMENT</p>
            <h1 className="display text-6xl md:text-8xl leading-none mb-5">NISQ Cyber Range</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Build practical cybersecurity skills through real-world security datasets, structured
              learning paths, isolated laboratories, investigations and challenges.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <Link
                to="/cyber-range/labs"
                className={cn(buttonVariants({ size: "lg" }), "glow-cyber")}
              >
                Explore Labs <ArrowRight />
              </Link>
              <Link
                to="/cyber-range/learning-paths"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Learning Paths <BookOpen />
              </Link>
            </div>
            <Link
              to="/dashboard"
              className="mono inline-block mt-5 text-xs text-cyber hover:underline"
            >
              View My Progress
            </Link>
          </div>
        </div>
      </section>
      <section className="px-4 md:px-8 py-10">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-4">
          <RangeMetric label="Published Labs" value={counts?.labs} icon={<ShieldCheck />} />
          <RangeMetric label="Connected Datasets" value={counts?.datasets} icon={<Database />} />
          <RangeMetric label="Learning Paths" value={counts?.learningPaths} icon={<BookOpen />} />
        </div>
        {loadError && (
          <p className="max-w-6xl mx-auto mt-4 mono text-xs text-warning">
            CYBER LABS DATA IS CURRENTLY UNAVAILABLE. NO DEMO COUNTS ARE DISPLAYED.
          </p>
        )}
      </section>
      <section className="px-4 md:px-8 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
          <RangeFeature
            icon={<BookOpen />}
            title="Guided Learning"
            text="Start with structured cybersecurity awareness and foundations."
          />
          <RangeFeature
            icon={<Network />}
            title="Connected Practice"
            text="Move from lessons into available exercises and knowledge checks."
          />
          <RangeFeature
            icon={<ShieldCheck />}
            title="Tracked Progress"
            text="Your authenticated account keeps course progress in one place."
          />
        </div>
      </section>
    </main>
  );
}

function RangeMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value?: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="glass rounded-lg p-5">
      <div className="flex items-center gap-3 text-cyber">
        {icon}
        <span className="mono text-[0.65rem]">{label}</span>
      </div>
      <p className="display text-4xl mt-3">{value === undefined ? "—" : value}</p>
      {value === 0 && (
        <p className="mono text-[0.6rem] text-muted-foreground mt-1">NOT YET CONNECTED</p>
      )}
    </div>
  );
}

function RangeFeature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="glass rounded-lg p-6">
      <div className="text-cyber mb-4">{icon}</div>
      <h2 className="display text-2xl mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
