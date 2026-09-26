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

import founderImg from "@/assets/founder.jpeg";
import nisqLogo from "@/assets/nisq-logo.jpeg";

export const Route = createFileRoute("/about/founder")({
  head: () => ({
    meta: [
      { title: "Ashok Vallabhuni — Founder & Chief Architect · NISQ Vanguard" },
      {
        name: "description",
        content:
          "Ashok Vallabhuni is the Founder and Chief Architect of NISQ Vanguard Defence Technologies — building accessible, practical, and impactful cybersecurity education for India and beyond.",
      },
    ],
  }),
  component: FounderProfilePage,
});

const ARCHITECTURE_CONTRIBUTIONS = [
  {
    icon: Shield,
    title: "IVVAB Labs Engine",
    body: "Designed and architected the IVVAB Labs engine — the technical core that powers NISQ Vanguard's IVVAB LABS, Academy Labs, and containerised training environments.",
  },
  {
    icon: GraduationCap,
    title: "Canonical Curriculum Design",
    body: "Authored the canonical cybersecurity learning pathways used in the NISQ Academy — from Networking Fundamentals and Linux Command Quest to the complete Cybersecurity Foundations course.",
  },
  {
    icon: Terminal,
    title: "IVVAB LABS Architecture",
    body: "Designed the isolated network environments, scenario-based lab infrastructure, and verification systems that power hands-on practitioner training at NISQ Vanguard.",
  },
  {
    icon: Eye,
    title: "Threat Intelligence Framework",
    body: "Established the threat intelligence methodology and data pipeline that ingests real incident telemetry into Academy modules and IVVAB LABS scenarios.",
  },
  {
    icon: Building2,
    title: "College Outreach Infrastructure",
    body: "Built the partnerships and program frameworks that deliver NISQ Vanguard cybersecurity awareness to colleges across India, including guest sessions and campus CTF events.",
  },
  {
    icon: Globe,
    title: "AI · Security Integration",
    body: "Pioneered the integration of AI-assisted threat analysis and guidance into the NISQ Vanguard platform — making advanced defensive analysis accessible to learners at every level.",
  },
] as const;

const PHILOSOPHY_POINTS = [
  {
    heading: "Proactive Defence",
    body: "Security posture is determined by the choices made before an incident — not during. NISQ Vanguard is built on the principle that proactive defence through education is the most impactful form of protection.",
  },
  {
    heading: "Youth Education",
    body: "The next generation of cyber defenders must be empowered early. By embedding cybersecurity literacy into colleges and youth programs, we invest in India's long-term digital resilience.",
  },
  {
    heading: "Accessible Cyber Hygiene",
    body: "Advanced security should not be reserved for large enterprises. Every individual, every family, every small organisation deserves access to simple, actionable security guidance.",
  },
  {
    heading: "AI Safety in Cyber",
    body: "As AI systems become embedded in critical infrastructure, the attack surface expands. NISQ Vanguard addresses this by training analysts to understand AI-enabled threats and defences.",
  },
] as const;

function FounderProfilePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header bar ────────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-background/90 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-3 font-mono text-[10px] tracking-widest text-slate-500">
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
                <span className="absolute -top-3 -left-3 h-6 w-6 border-t-2 border-l-2 border-cyan-400" />
                <span className="absolute -top-3 -right-3 h-6 w-6 border-t-2 border-r-2 border-cyan-400" />
                <span className="absolute -bottom-3 -left-3 h-6 w-6 border-b-2 border-l-2 border-cyan-400" />
                <span className="absolute -bottom-3 -right-3 h-6 w-6 border-b-2 border-r-2 border-cyan-400" />

                <div className="absolute inset-0 rounded-lg bg-cyan-400/8 blur-2xl" />
                <img
                  src={founderImg}
                  alt="Ashok Vallabhuni — Founder & Chief Architect, NISQ Vanguard Defence Technologies"
                  className="relative z-10 h-80 w-80 rounded-lg object-cover shadow-[0_0_48px_rgba(0,210,255,0.25)]"
                />

                {/* NISQ badge */}
                <div className="absolute -bottom-5 -right-5 z-20 flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan-400 bg-background shadow-[0_0_20px_rgba(0,210,255,0.4)]">
                  <img
                    src={nisqLogo}
                    alt="NISQ Vanguard"
                    className="h-11 w-11 rounded-full object-cover"
                  />
                </div>

                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap border border-cyan-400 bg-background px-3 py-1 font-mono text-[9px] tracking-[0.2em] text-primary">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
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
                  ASHOK VALLABHUNI
                </h1>
                <p className="mt-2 font-mono text-xs text-slate-500 tracking-wider">
                  NISQ VANGUARD DEFENCE TECHNOLOGIES · IVVAB LABS ENGINE
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  "Cyber Strategy",
                  "AI · Security",
                  "Cyber Defence Architecture",
                  "Security Education",
                  "College Outreach",
                  "NISQ Vanguard Academy",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="border border-primary/30 bg-cyan-400/8 px-3 py-1 font-mono text-[10px] tracking-wider text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="border border-border bg-card p-6 space-y-3 font-mono text-xs leading-relaxed text-muted-foreground">
                <p>
                  Ashok Vallabhuni is the{" "}
                  <strong className="text-foreground">Founder and Chief Architect</strong> of NISQ
                  Vanguard Defence Technologies — an organisation dedicated to making cybersecurity
                  education accessible, practical, and impactful across India and beyond.
                </p>
                <p>
                  He founded NISQ Vanguard with a singular conviction: that the gap between
                  cybersecurity knowledge and the people who need it most is not a technical problem
                  — it is an access problem. Through the{" "}
                  <strong className="text-primary">IVVAB Labs engine</strong>, he architects
                  real-world IVVAB LABSs, structured course curriculums, and threat intelligence
                  frameworks designed for learners at every stage of their security journey.
                </p>
                <p>
                  His work spans strategic security architecture, college outreach programs,
                  AI-assisted threat analysis integration, and the development of verifiable,
                  career-ready certifications through the NISQ Academy.
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
            <p>
              NISQ Vanguard was born from a direct observation: cybersecurity as a discipline was
              fragmented, inaccessible, and often disconnected from the realities of how attacks
              actually happen. Theory without practice. Certifications without comprehension.
              Awareness without action.
            </p>
            <p>
              Ashok Vallabhuni set out to build something different — a platform where every module
              is grounded in real threat data, every lab simulates an authentic attack scenario, and
              every learner walks away with skills that are immediately deployable. The name{" "}
              <strong className="text-foreground">NISQ Vanguard</strong> reflects this forward
              posture: always at the leading edge of the defence frontier.
            </p>
            <p>
              The <strong className="text-primary">IVVAB Labs engine</strong> powers the technical
              core — providing the containerised environments, real-data pipelines, and verification
              systems that make NISQ Vanguard's IVVAB LABS and academy uniquely authentic. Every lab
              scenario, every telemetry dataset, every curriculum module passes through the IVVAB
              Labs architecture before it reaches a learner.
            </p>
            <p>
              Today, NISQ Vanguard stands as a mission-driven cybersecurity organisation — bringing
              college outreach, enterprise security education, community-building, and a world-class
              academy together under one defence-first vision.
            </p>
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
            {PHILOSOPHY_POINTS.map(({ heading, body }) => (
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
            {ARCHITECTURE_CONTRIBUTIONS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="border border-border bg-card p-7 hover:border-cyan-400/40 transition-colors"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            ))}
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
              className="inline-flex items-center gap-2 border border-slate-600 px-6 py-3 font-mono text-xs tracking-wider text-muted-foreground hover:border-primary/60 hover:text-primary transition"
            >
              BACK TO HOME <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
