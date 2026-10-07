import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Shield,
  GraduationCap,
  Globe,
  Building2,
  Sparkles,
  ShieldCheck,
  Terminal,
  Eye,
  ChevronRight,
  Heart,
} from "lucide-react";

import { teamData, founderPhilosophy, founderArchitecturalContributions } from "@/data/team";
import nisqLogo from "@/assets/nisq-logo.jpeg";

export const Route = createFileRoute("/about/founder")({
  head: () => ({
    meta: [
      { title: "Ashok Vallabuni — Founder & Chief Architect · NISQ Vanguard" },
      {
        name: "description",
        content:
          "Ashok Vallabuni is the Founder and Chief Architect of NISQ Vanguard Defence Technologies — building accessible, practical, and impactful cybersecurity education for India and beyond.",
      },
    ],
  }),
  component: FounderProfilePage,
});

const ICON_MAP: Record<string, any> = {
  Shield: Shield,
  GraduationCap: GraduationCap,
  Terminal: Terminal,
  Eye: Eye,
  Building2: Building2,
  Globe: Globe
};

function FounderProfilePage() {
  const founder = teamData.find(t => t.name === "Ashok Vallabuni");
  
  if (!founder) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header bar ────────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-background/90 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-3 font-mono text-[10px] tracking-widest text-nisq-muted">
          <Link to="/" className="hover:text-primary transition-colors">
            HOME
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary">FOUNDER PROFILE</span>
        </div>
      </div>

      {/* ── Hero section ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 intel-grid opacity-30" aria-hidden="true" />
        <div
          className="absolute left-1/4 top-1/3 h-[24rem] w-[24rem] rounded-full bg-primary/8 blur-[120px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            {/* Photo */}
            <div className="flex justify-center">
              <div className="relative inline-block">
                <span className="absolute -top-3 -left-3 h-6 w-6 border-t-2 border-l-2 border-nisq-blue" />
                <span className="absolute -top-3 -right-3 h-6 w-6 border-t-2 border-r-2 border-nisq-blue" />
                <span className="absolute -bottom-3 -left-3 h-6 w-6 border-b-2 border-l-2 border-nisq-blue" />
                <span className="absolute -bottom-3 -right-3 h-6 w-6 border-b-2 border-r-2 border-nisq-blue" />

                <div className="absolute inset-0 rounded-lg bg-nisq-blue blur-2xl" />
                <img
                  src={founder.imageUrl}
                  alt={founder.name}
                  className="relative z-10 h-80 w-80 rounded-lg object-cover shadow-card"
                  style={{ objectPosition: 'center top' }}
                />

                {/* NISQ badge */}
                <div className="absolute -bottom-5 -right-5 z-20 flex h-16 w-16 items-center justify-center rounded-full border-2 border-nisq-blue bg-background shadow-card">
                  <img
                    src={nisqLogo}
                    alt="NISQ Vanguard"
                    className="h-11 w-11 rounded-full object-cover"
                  />
                </div>

                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap border border-nisq-blue bg-background px-3 py-1 font-mono text-[9px] tracking-[0.2em] text-primary">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-nisq-blue" />
                  VERIFIED · CHIEF ARCHITECT
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-6">
              <div>
                <p className="font-mono text-[11px] tracking-[0.3em] text-primary uppercase mb-2">
                  FOUNDER · CHIEF ARCHITECT
                </p>
                <h1 className="font-display text-4xl font-bold tracking-wide text-foreground sm:text-5xl">
                  {founder.name}
                </h1>
                <p className="mt-2 font-mono text-xs text-nisq-muted tracking-wider">
                  NISQ VANGUARD DEFENCE TECHNOLOGIES · IVVAB LABS ENGINE
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {founder.skills?.map((tag) => (
                  <span
                    key={tag}
                    className="border border-primary/30 bg-nisq-blue-tint px-3 py-1 font-mono text-[10px] tracking-wider text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="border border-border bg-card p-6 space-y-3 font-mono text-xs leading-relaxed text-muted-foreground">
                <p>
                  Ashok Vallabuni is the{" "}
                  <strong className="text-foreground">Founder and Chief Architect</strong> of NISQ Vanguard, a cybersecurity and defence technology initiative focused on building practical security capabilities for the evolving digital world.
                </p>
                <p>
                  His work is driven by a strong interest in cybersecurity, artificial intelligence, security engineering, and the emerging security challenges created by increasingly intelligent and connected systems.
                </p>
                <p>
                  Through NISQ Vanguard, Ashok is working toward building an ecosystem that brings together cybersecurity consulting, practical security education, hands-on laboratories, research, and community-driven learning.
                </p>
                <p>
                  His particular interest lies at the intersection of <strong className="text-foreground">cybersecurity and artificial intelligence</strong>, including the security of large language models, AI agents, AI-enabled infrastructure, applications, and the systems that connect intelligent models to real-world tools and data.
                </p>
                <p>
                  He believes cybersecurity education should move beyond theoretical knowledge and give learners opportunities to investigate, experiment, fail safely, and develop the ability to think like both an attacker and a defender.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Founding Story ────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-card text-card-foreground py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mb-10">
            <span className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase">
              The Founding Story
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
              Why NISQ Vanguard Was Built
            </h2>
          </div>

          <div className="space-y-5 font-mono text-sm leading-relaxed text-muted-foreground">
            <div className="p-8 border border-primary/20 bg-primary/5 rounded-xl">
              <p className="text-xl italic text-foreground text-center font-serif tracking-wide leading-relaxed">
                "The future will not be secured by technology alone. It will be secured by the people who understand how that technology can fail."
              </p>
              <p className="text-center font-mono text-[10px] tracking-[0.3em] text-primary uppercase mt-6">
                — Ashok Vallabuni
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Philosophy ───────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12">
            <span className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase">
              Core Philosophy
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
              Principles That Drive the Platform
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {founderPhilosophy.map(({ heading, body }) => (
              <div key={heading} className="border border-border bg-card p-7">
                <h3 className="font-display text-lg font-bold text-foreground mb-3">{heading}</h3>
                <p className="font-mono text-xs leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architectural Contributions ───────────────────────────────────── */}
      <section className="border-t border-border bg-card text-card-foreground py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12">
            <span className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase">
              Architectural Contributions
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
              What Ashok Has Built
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {founderArchitecturalContributions.map(({ icon, title, body }) => {
              const Icon = ICON_MAP[icon] || Shield;
              return (
                <div
                  key={title}
                  className="border border-border bg-card p-7 hover:border-nisq-blue transition-colors"
                >
                  <div className="mb-5 flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
                  <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            EXPLORE <span className="text-primary">NISQ VANGUARD</span>
          </h2>
          <p className="mt-4 font-mono text-sm leading-relaxed text-muted-foreground">
            Visit the Academy, enter the IVVAB LABS, or connect with the NISQ Vanguard community.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/learn"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 px-6 py-3 font-display text-xs font-bold tracking-wider text-primary-foreground hover:brightness-110 transition"
            >
              ENTER ACADEMY <GraduationCap className="h-4 w-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 border border-nisq-border px-6 py-3 font-mono text-xs tracking-wider text-muted-foreground hover:border-primary/60 hover:text-primary transition"
            >
              BACK TO HOME <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
