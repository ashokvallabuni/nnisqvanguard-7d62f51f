import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Building2,
  ChartNoAxesCombined,
  ChevronRight,
  Crosshair,
  FlaskConical,
  GraduationCap,
  Network,
  Radar,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import wolfHero from "@/assets/cyber-wolf-hero.jpg";
const navItems = [
  { to: "/", label: "Home" },
  { to: "/solutions", label: "Solutions" },
  { to: "/campus", label: "Campus" },
  { to: "/academy", label: "Academy" },
  { to: "/intelligence", label: "Telemetry" },
] as const;

const solutions = [
  {
    icon: ShieldCheck,
    title: "Autonomous Defence",
    body: "AI-assisted threat analysis, incident triage and practical response workflows for modern teams.",
    to: "/fraud-check",
  },
  {
    icon: GraduationCap,
    title: "Vanguard Academy",
    body: "Structured learning paths, labs and assessments that turn cyber awareness into capability.",
    to: "/learn",
  },
  {
    icon: Network,
    title: "Vanguard Mesh",
    body: "Operational guidance for safer systems, stronger people and resilient digital campuses.",
    to: "/solutions/consulting",
  },
];

export function CyberIntelligenceHome() {
  return (
    <main className="intel-home min-h-screen overflow-x-hidden bg-[#030712] text-slate-200">
      <section id="hero" className="intel-hero relative flex min-h-[780px] items-center overflow-hidden pt-20">
        <div className="intel-grid absolute inset-0" aria-hidden="true" />
        <div className="intel-scanlines absolute inset-0" aria-hidden="true" />
        <div className="absolute left-1/2 top-1/4 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[130px]" aria-hidden="true" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-12">
          <div className="space-y-7 lg:col-span-7">
            <div className="inline-flex items-center gap-2 border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-cyan-300">
              <Radar className="h-3.5 w-3.5 animate-pulse" />
              QUANTUM THREAT MATRIX ONLINE · 99.98% DEFENCE EFFICIENCY
            </div>
            <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-7xl">
              NEXT-GEN{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
                CYBER WARFARE
              </span>{" "}
              &amp; INTELLIGENCE
            </h1>
            <p className="max-w-2xl font-mono text-sm leading-relaxed text-slate-300 sm:text-base">
              Deploy practical, AI-assisted defence workflows, cyber education and proactive threat
              awareness across your people, campus and organisation.
            </p>

            <div className="intel-hud-border relative max-w-2xl border border-cyan-400/30 bg-slate-950/80 p-5">
              <span className="absolute -top-3 left-4 bg-[#030712] px-2 font-mono text-[10px] tracking-widest text-cyan-300">
                <Terminal className="mr-1 inline h-3 w-3" />
                VANGUARD THREAT ADVISORY
              </span>
              <p className="font-mono text-xs italic leading-relaxed text-cyan-100 sm:text-sm">
                “Security is not a product. It is a process built around people, signals and
                decisive action.”
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/cyber-range"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-400 px-5 py-3 font-display text-xs font-bold tracking-wider text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110"
              >
                ENTER CYBER RANGE <Shield className="h-4 w-4" />
              </Link>
              <Link
                to="/cyber-range/labs"
                className="inline-flex items-center gap-2 border border-cyan-400/70 bg-slate-950/70 px-5 py-3 font-display text-xs font-bold tracking-wider text-cyan-300 transition hover:bg-cyan-400 hover:text-slate-950"
              >
                EXPLORE CYBER LABS <FlaskConical className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-4 border-t border-slate-700/70 pt-6">
              <IntelStat value="1,492" label="Threat signals reviewed" />
              <IntelStat value="0.04ms" label="Signal response target" />
              <IntelStat value="100%" label="Learning access uptime" />
            </div>
          </div>

          <div className="relative flex min-h-[390px] items-center justify-center lg:col-span-5">
            <div className="absolute bottom-12 h-24 w-72 rounded-[100%] bg-cyan-400/20 blur-2xl" />
            <div className="absolute bottom-14 h-14 w-56 rounded-[100%] border border-cyan-400/60 animate-ping" />
            <div className="relative w-full max-w-[480px] animate-[float_5s_ease-in-out_infinite]">
              <div className="absolute inset-8 rounded-full bg-cyan-400/20 blur-3xl" />
              <img
                src={wolfHero}
                alt="Cyber wolf representing the NISQ Vanguard defence platform"
                className="relative z-10 w-full object-contain drop-shadow-[0_0_30px_rgba(0,210,255,0.55)]"
              />
              <div className="absolute bottom-1 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap border border-cyan-400 bg-slate-950/90 px-4 py-1.5 font-mono text-[10px] tracking-wider text-cyan-300 shadow-[0_0_24px_rgba(0,210,255,0.3)]">
                <Crosshair className="mr-1 inline h-3 w-3" />
                UNIT: FENRIR-AI // ACTIVE
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="solutions" className="border-t border-slate-800 bg-slate-950/90 py-24">
        <SectionHeading
          eyebrow="VANGUARD DEFENCE SUITE"
          title="ADVANCED CYBER SOLUTIONS"
          body="Connect the platform's practical tools to your next security, learning or response objective."
        />
        <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 md:grid-cols-3">
          {solutions.map((solution) => {
            const Icon = solution.icon;
            return (
              <Link
                key={solution.title}
                to={solution.to}
                className="intel-card intel-hud-border group border border-slate-700 bg-[#0a0f1d] p-7 transition hover:border-cyan-400/70 hover:shadow-[0_0_24px_rgba(0,210,255,0.16)]"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 transition group-hover:bg-cyan-400 group-hover:text-slate-950">
                  <Icon />
                </div>
                <h3 className="font-display text-xl font-semibold text-white">{solution.title}</h3>
                <p className="mt-3 min-h-20 font-mono text-xs leading-relaxed text-slate-400">{solution.body}</p>
                <span className="mt-6 inline-flex items-center gap-1 font-display text-xs font-bold tracking-wider text-cyan-300">
                  OPEN MODULE <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="campus" className="border-t border-slate-800 bg-[#030712] py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
          <div>
            <span className="intel-eyebrow">GLOBAL OPERATIONS CAMPUS</span>
            <h2 className="mt-5 font-display text-4xl font-bold text-white sm:text-5xl">
              PRACTICAL <span className="text-cyan-300">CYBER READINESS</span>
            </h2>
            <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-slate-300">
              Give colleges, teams and digital citizens a clear path from awareness to action with
              guided programs, labs and incident support.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-2 gap-4">
              <IntelMetric value="24/7" label="Learning access" />
              <IntelMetric value="3" label="Response pathways" />
            </div>
            <Link
              to="/programs"
              className="mt-8 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-400 px-5 py-3 font-display text-xs font-bold tracking-wider text-slate-950"
            >
              REQUEST A CAMPUS PROGRAM <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="intel-hud-border border border-cyan-400/40 bg-[#0a0f1d] p-6 shadow-[0_0_25px_rgba(0,210,255,0.12)]">
            <div className="mb-5 flex items-center justify-between border-b border-slate-700 pb-4 font-mono text-xs text-cyan-300">
              <span><Terminal className="mr-2 inline h-4 w-4" />VANGUARD_DIAGNOSTIC_FEED.LOG</span>
              <span className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-red-400" /><i className="h-2.5 w-2.5 rounded-full bg-amber-400" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></span>
            </div>
            <div className="space-y-3 font-mono text-xs leading-relaxed text-slate-300">
              <p className="text-cyan-300">&gt; initializing awareness pathway...</p>
              <p>&gt; mapping learner objectives: <span className="text-emerald-400">READY</span></p>
              <p className="text-cyan-300">&gt; scanning response playbooks...</p>
              <p>&gt; guided labs connected to academy network.</p>
              <p className="text-amber-300">&gt; NOTICE: practice before the incident.</p>
              <p className="text-emerald-400">&gt; status: VANGUARD PERIMETER READY.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="academy" className="border-t border-slate-800 bg-slate-950/80 py-24">
        <SectionHeading
          eyebrow="VANGUARD ELITE ACADEMY"
          title="MASTER THE CYBER FRONTIER"
          body="Follow a real learning path, then continue into authenticated labs and progress tracking."
        />
        <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 md:grid-cols-3">
          <AcademyCard level="PATHWAY 01" title="Cyber foundations" to="/learn" icon={BookOpen} />
          <AcademyCard level="PATHWAY 02" title="Guided cyber labs" to="/cyber-range/labs" icon={FlaskConical} />
          <AcademyCard level="PATHWAY 03" title="Learning progress" to="/cyber-range/my-progress" icon={ChartNoAxesCombined} />
        </div>
      </section>

      <section id="telemetry" className="border-t border-slate-800 bg-[#030712] py-16">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 sm:px-8">
          <div>
            <span className="intel-eyebrow">PLATFORM TELEMETRY</span>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white">READY FOR YOUR NEXT SIGNAL</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/intelligence" className="intel-outline-link"><ChartNoAxesCombined className="h-4 w-4" /> VIEW INTELLIGENCE</Link>
            <Link to="/complaint" className="intel-outline-link"><Shield className="h-4 w-4" /> REPORT AN INCIDENT</Link>
            <Link to="/login" search={{ next: "/dashboard" }} className="intel-outline-link"><UserRound className="h-4 w-4" /> SIGN IN</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function IntelStat({ value, label }: { value: string; label: string }) {
  return <div><div className="font-display text-xl font-bold text-white sm:text-2xl">{value}</div><div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-cyan-300">{label}</div></div>;
}

function IntelMetric({ value, label }: { value: string; label: string }) {
  return <div className="border border-slate-700 bg-[#0a0f1d] p-4"><div className="font-display text-2xl font-bold text-cyan-300">{value}</div><div className="mt-1 font-mono text-[10px] text-slate-400">{label}</div></div>;
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <div className="mx-auto mb-14 max-w-3xl px-5 text-center sm:px-8"><span className="intel-eyebrow">{eyebrow}</span><h2 className="mt-5 font-display text-3xl font-bold tracking-wide text-white sm:text-5xl">{title}</h2><p className="mt-4 font-mono text-sm leading-relaxed text-slate-400">{body}</p></div>;
}

function AcademyCard({ level, title, to, icon: Icon }: { level: string; title: string; to: string; icon: LucideIcon }) {
  return <Link to={to} className="intel-card group border border-slate-700 bg-[#0a0f1d] p-6 transition hover:border-cyan-400/70"><Icon className="mb-5 h-8 w-8 text-cyan-300" /><div className="font-mono text-[10px] tracking-widest text-cyan-300">{level}</div><h3 className="mt-2 font-display text-lg font-semibold text-white">{title}</h3><div className="mt-8 flex items-center justify-between border-t border-slate-700 pt-4 font-mono text-xs text-slate-400"><span>Continue pathway</span><ArrowRight className="h-4 w-4 text-cyan-300 transition group-hover:translate-x-1" /></div></Link>;
}
