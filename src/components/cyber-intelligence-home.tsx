import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  ChartNoAxesCombined,
  ChevronRight,
  Crosshair,
  FlaskConical,
  GraduationCap,
  Globe,
  Lock,
  Network,
  Radar,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Terminal,
  Users,
  Zap,
  Target,
  Eye,
  Building2,
  Heart,
  AlertTriangle,
  Key,
  type LucideIcon,
} from "lucide-react";

import wolfHero from "@/assets/cyber-wolf-hero.jpg";
import founderImg from "@/assets/founder.jpeg";
import nisqLogo from "@/assets/nisq-logo.jpeg";

// ─── Navigation ───────────────────────────────────────────────────────────────
const navItems = [
  { to: "/", label: "Home" },
  { to: "/academy", label: "Academy" },
  { to: "/cyber-range", label: "IVVAB LABS" },
  { to: "/intelligence", label: "Threat Intel" },
  { to: "/programs", label: "Campus" },
] as const;

// ─── Leadership team ──────────────────────────────────────────────────────────
const LEADERSHIP = [
  {
    name: "Ashok Vallabhuni",
    title: "Founder · Chief Architect",
    initials: "AV",
    color: "from-[#E0F2FE] to-[#BAE6FD]",
    focus: ["Cyber Strategy", "AI · Security", "Cyber Defence Architecture", "Security Education"],
  },
  {
    name: "Varun Gajula",
    title: "Co-Founder",
    initials: "VG",
    color: "from-[#ECFDF5] to-[#A7F3D0]",
    focus: ["Product Vision", "Platform Architecture", "Growth"],
  },
  {
    name: "Sannith Reddy",
    title: "Product Manager",
    initials: "SR",
    color: "from-[#F5F3FF] to-[#DDD6FE]",
    focus: ["Product Strategy", "Go-to-Market", "Campus Programs", "Brand Storytelling"],
  },
  {
    name: "Chitireddy Janaki Raghu Rami Reddy",
    title: "Chief Technology Officer",
    initials: "CR",
    color: "from-[#ECFEFF] to-[#CFFAFE]",
    focus: ["Platform Architecture", "Infrastructure", "Engineering Excellence"],
  },
] as const;

// ─── Locked courses catalog ────────────────────────────────────────────────────
const LOCKED_COURSES = [
  { title: "Ethical Hacking", category: "Offensive" },
  { title: "Penetration Testing", category: "Offensive" },
  { title: "Web Security", category: "AppSec" },
  { title: "OWASP Security", category: "AppSec" },
  { title: "SOC Analyst", category: "Defensive" },
  { title: "Digital Forensics", category: "DFIR" },
  { title: "Threat Intelligence", category: "Intel" },
  { title: "Malware Analysis", category: "Reverse Eng" },
  { title: "Cloud Security", category: "Cloud" },
  { title: "Active Directory Security", category: "Enterprise" },
  { title: "OSINT", category: "Intel" },
  { title: "API Security", category: "AppSec" },
  { title: "AI Security & LLM Defense", category: "AI Safety" },
  { title: "Incident Response", category: "DFIR" },
  { title: "Bug Bounty Mastery", category: "Bounty" },
] as const;

// ─── Available courses ─────────────────────────────────────────────────────────
const AVAILABLE_COURSES = [
  {
    slug: "cybersecurity-foundations",
    title: "Cybersecurity Foundations",
    level: "Beginner",
    modules: 20,
    duration: "12 Hours",
    description:
      "CIA Triad, Kill Chain, Social Engineering, Cryptography, Firewalls, Zero Trust, SOC, Incident Response & Capstone.",
    skills: ["CIA Triad", "Kill Chain", "Cryptography", "Zero Trust"],
    icon: ShieldCheck,
  },
  {
    slug: "networking-fundamentals",
    title: "Basics of Networking",
    level: "Beginner",
    modules: 10,
    duration: "6 Hours",
    description:
      "Network Fundamentals, OSI/TCP-IP, IP & Subnets, Packet Switching, DNS/HTTP/SSH, Firewalls, CLI Diagnostics.",
    skills: ["OSI Model", "TCP/IP", "Subnetting", "CLI Diagnostics"],
    icon: Network,
  },
  {
    slug: "linux-command-quest",
    title: "Linux Command Quest",
    level: "Beginner",
    modules: 7,
    duration: "5 Hours",
    description:
      "7 Skill Zones: Map Reading, Object Manipulation, Permissions, Log Forensics, Network Diagnostics, Process Warfare, Boss Battle.",
    skills: ["Navigation", "chmod/chown", "grep/pipes", "Netcat"],
    icon: Terminal,
  },
  {
    slug: "cyber-security-master-curriculum",
    title: "Cyber Security Master Curriculum",
    level: "Comprehensive",
    modules: 52,
    duration: "24 Hours",
    description:
      "The complete 52-lesson beginner-to-analyst roadmap: Recon, OSINT, Exploitation, Web Security, Active Directory.",
    skills: ["OSINT", "Nmap", "Metasploit", "SQL Injection", "Active Directory"],
    icon: ShieldAlert,
  },
] as const;

// ─── Services ──────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: ShieldCheck,
    title: "Cybersecurity Consultation",
    body: "Strategic security advisory for organisations of all sizes — architecture reviews, threat modelling, and hardening roadmaps.",
  },
  {
    icon: GraduationCap,
    title: "Security Awareness Training",
    body: "Transform your workforce into a human firewall with engaging, scenario-based cybersecurity awareness programs.",
  },
  {
    icon: Building2,
    title: "College Awareness Programs",
    body: "Bringing cybersecurity education directly to campuses — practical labs, guest sessions, and career pathways.",
  },
  {
    icon: Globe,
    title: "Enterprise Security Education",
    body: "Structured learning paths for enterprise teams — from SOC fundamentals to advanced threat hunting.",
  },
  {
    icon: AlertTriangle,
    title: "Fraud Awareness",
    body: "Recognise, report and recover from digital fraud, phishing, and social engineering attacks before they succeed.",
  },
  {
    icon: Heart,
    title: "Cyber Hygiene Programs",
    body: "Actionable daily habits, password management, device security, and safe browsing for individuals and families.",
  },
] as const;

// ─── Community sections ────────────────────────────────────────────────────────
const COMMUNITY = [
  {
    icon: Users,
    title: "Digital Guardians",
    body: "Join a community of cyber defenders — shared threat intelligence, peer support, and mission-driven collaboration.",
  },
  {
    icon: Building2,
    title: "College Programs",
    body: "We partner with universities across India to embed cybersecurity into campus culture and career pathways.",
  },
  {
    icon: Zap,
    title: "Internships & Bounties",
    body: "Real-world security research opportunities, internship pipelines, and guided bug bounty programs for emerging talent.",
  },
  {
    icon: Target,
    title: "Cybersecurity Events",
    body: "Capture-the-Flag competitions, workshops, and live tabletop exercises for colleges and corporate teams.",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function CyberIntelligenceHome() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Navigation is provided by the root layout TopNav */}

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section id="hero" className="relative flex min-h-[720px] items-center overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-background" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-15 bg-[radial-gradient(#00D9FF_1px,transparent_1px)] [background-size:16px_16px]"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-12">
          <div className="space-y-7 lg:col-span-7">
            <div className="inline-flex items-center gap-2 border border-border bg-muted px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-foreground uppercase font-semibold">
              <Radar className="h-3.5 w-3.5 text-primary" />
              NISQ VANGUARD — DEFENCE TECHNOLOGIES
            </div>
            <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-7xl">
              SECURE TODAY. <span className="text-primary">DEFEND TOMORROW.</span> EMPOWER FOREVER.
            </h1>
            <p className="max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground sm:text-base">
              Enterprise-grade cybersecurity training, real data threat investigations, and hands-on
              IVVAB LABS labs — built by defenders for defenders.
            </p>

            <div className="relative max-w-2xl border border-border bg-muted p-5 rounded-md shadow-sm">
              <span className="absolute -top-2.5 left-4 bg-muted px-2 font-mono text-[10px] font-bold tracking-widest text-foreground">
                <Terminal className="mr-1 inline h-3 w-3 text-muted-foreground" />
                VANGUARD THREAT ADVISORY
              </span>
              <p className="font-mono text-xs italic leading-relaxed text-foreground sm:text-sm">
                "Security is not a product. It is a process built around people, signals and
                decisive action."
              </p>
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                — Ashok Vallabhuni, Founder · Chief Architect, NISQ Vanguard
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/learn"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] bg-[#00D9FF] px-5 py-2 font-display text-xs font-bold tracking-widest text-[#02060D] transition-all hover:bg-[#00F0FF] shadow-[0_0_20px_rgba(0,217,255,0.12)] hover:shadow-[0_0_28px_rgba(0,217,255,0.22)] rounded-md uppercase"
              >
                START YOUR DEFENCE JOURNEY <GraduationCap className="h-4 w-4" />
              </Link>
              <Link
                to="/cyber-range"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] border border-[#00D9FF] bg-transparent px-5 py-2 font-display text-xs font-bold tracking-widest text-[#00D9FF] transition-all hover:bg-[#00D9FF]/10 shadow-[inset_0_0_12px_rgba(0,217,255,0.08)] rounded-md uppercase"
              >
                EXPLORE IVVAB LABS <FlaskConical className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-4 border-t border-border pt-6">
              <IntelStat value="1,492" label="Threat signals reviewed" />
              <IntelStat value="0.04ms" label="Signal response target" />
              <IntelStat value="100%" label="Learning access uptime" />
            </div>
          </div>

          <div className="relative flex min-h-[390px] items-center justify-center lg:col-span-5">
            <div className="relative w-full max-w-[480px]">
              <img
                src={wolfHero}
                alt="NISQ Vanguard cyber defence platform"
                className="relative z-10 w-full object-contain"
              />
              <div className="absolute bottom-1 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap border border-border bg-muted px-4 py-1.5 font-mono text-[10px] tracking-wider text-foreground uppercase font-bold rounded-md shadow-sm">
                <Crosshair className="mr-1 inline h-3 w-3 text-primary" />
                UNIT: FENRIR-AI // ACTIVE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRIORITY 1: FOUNDER SECTION ─────────────────────────────────────── */}
      <section id="founder" className="border-t border-border bg-muted py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-6 text-center">
            <span className="inline-block border border-border bg-background px-4 py-1 font-mono text-[10px] tracking-[0.2em] text-foreground uppercase font-bold rounded">
              PRIORITY · FOUNDER PROFILE
            </span>
          </div>

          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            {/* Founder photo + badge */}
            <div className="relative flex justify-center">
              {/* Outer frame */}
              <div className="relative inline-block border border-border p-2 bg-muted rounded-xl shadow-sm">
                {/* Founder photograph */}
                <img
                  src={founderImg}
                  alt="Ashok Vallabhuni — Founder & Chief Architect, NISQ Vanguard"
                  className="relative z-10 h-72 w-72 rounded-lg object-cover sm:h-80 sm:w-80"
                />

                {/* NISQ Logo badge — bottom right overlay */}
                <div className="absolute -bottom-5 -right-5 z-20 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-muted shadow-md">
                  <img
                    src={nisqLogo}
                    alt="NISQ Vanguard emblem"
                    className="h-11 w-11 rounded-full object-cover"
                  />
                </div>

                {/* Active status badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap border border-border bg-muted px-3 py-1 font-mono text-[9px] tracking-[0.2em] text-foreground font-bold rounded-full shadow-sm">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-success" />
                  AUTHENTICATED · CHIEF ARCHITECT
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="space-y-6">
              <div>
                <p className="font-mono text-[11px] tracking-[0.3em] text-primary uppercase mb-2">
                  FOUNDER · CHIEF ARCHITECT
                </p>
                <h2 className="font-display text-4xl font-bold tracking-wide text-foreground sm:text-5xl">
                  ASHOK VALLABHUNI
                </h2>
                <p className="mt-2 font-mono text-xs text-muted-foreground tracking-wider">
                  NISQ VANGUARD DEFENCE TECHNOLOGIES · IVVAB LABS ENGINE
                </p>
              </div>

              {/* Focus tags */}
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
                    className="border border-border bg-background px-3 py-1 font-mono text-[10px] tracking-wider text-muted-foreground font-semibold rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="font-mono text-sm leading-relaxed text-muted-foreground">
                Ashok Vallabhuni is the Founder and Chief Architect of NISQ Vanguard Defence
                Technologies — an organisation dedicated to making cybersecurity education
                accessible, practical, and impactful across India and beyond. Through the IVVAB Labs
                engine, he architects real-world IVVAB LABSs, structured course curriculums, and
                threat intelligence frameworks.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/about/founder"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] border border-[#123047] bg-[#0B1624] px-5 py-2 font-mono text-[11px] font-bold tracking-widest text-[#F5FAFF] transition-all hover:bg-[#0B1624]/80 shadow-[0_0_12px_rgba(0,217,255,0.05)] rounded-md uppercase"
                >
                  VIEW FOUNDER PROFILE <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRIORITY 2: ABOUT FOUNDER ────────────────────────────────────────── */}
      <section id="about-founder" className="border-t border-border bg-background py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <span className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase">
              Why NISQ Vanguard Was Created
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
              THE MISSION BEHIND THE PLATFORM
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Shield,
                heading: "Cybersecurity Mission",
                body: "To democratise defensive cybersecurity knowledge and place it directly in the hands of students, professionals, and organisations across India.",
              },
              {
                icon: Sparkles,
                heading: "Technology Vision",
                body: "Build AI-augmented threat intelligence tools and interactive IVVAB LABSs that replicate real-world attack scenarios for authentic learning.",
              },
              {
                icon: GraduationCap,
                heading: "Education Vision",
                body: "Structure clear, no-jargon learning pathways from absolute beginner to professional analyst — freely available and verifiably certified.",
              },
              {
                icon: ShieldCheck,
                heading: "Cyber Protection",
                body: "Help individuals, colleges, and enterprises identify threats early, respond confidently, and build resilient digital postures.",
              },
              {
                icon: Building2,
                heading: "College Outreach",
                body: "Embed cybersecurity thinking directly into campus culture through partnerships, workshops, internships and live CTF events.",
              },
              {
                icon: Globe,
                heading: "Building an Ecosystem",
                body: "Create a thriving network of cyber defenders, researchers, and educators — the NISQ Vanguard community that grows stronger together.",
              },
            ].map(({ icon: Icon, heading, body }) => (
              <div
                key={heading}
                className="border border-border bg-card p-6 hover:border-cyan-400/40 transition-colors"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">{heading}</h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIORITY 3: LEADERSHIP TEAM ──────────────────────────────────────── */}
      <section id="leadership" className="border-t border-border bg-background py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="NISQ VANGUARD LEADERSHIP"
            title="THE COMMAND TEAM"
            body="The founding team behind NISQ Vanguard Defence Technologies."
          />

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {LEADERSHIP.map((member) => (
              <div
                key={member.name}
                className="relative border border-border bg-card p-8 text-center hover:border-cyan-400/40 transition-all"
              >
                {/* Corner decorators */}
                <span className="absolute top-0 left-0 h-4 w-4 border-t border-l border-cyan-400/40" />
                <span className="absolute top-0 right-0 h-4 w-4 border-t border-r border-cyan-400/40" />
                <span className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-cyan-400/40" />
                <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-cyan-400/40" />

                {/* Avatar */}
                <div
                  className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${member.color} font-display text-xl font-bold text-foreground shadow-lg`}
                >
                  {member.initials}
                </div>

                <h3 className="font-display text-xl font-bold text-foreground">{member.name}</h3>
                <p className="mt-1 font-mono text-[10px] tracking-widest text-primary uppercase">
                  {member.title}
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {member.focus.map((f) => (
                    <span
                      key={f}
                      className="rounded-none border border-slate-600 bg-background px-2 py-0.5 font-mono text-[9px] text-muted-foreground"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIORITY 4: ABOUT NISQ VANGUARD — 4 PILLARS ────────────────────── */}
      <section id="about" className="border-t border-border bg-background py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="ABOUT NISQ VANGUARD"
            title="FOUR PILLARS OF CYBER DEFENCE"
            body="Everything NISQ Vanguard builds is grounded in four interconnected pillars of cyber defence."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                pillar: "PROTECTION",
                desc: "Proactive security consultation, threat detection, and incident support for individuals and organisations.",
              },
              {
                icon: GraduationCap,
                pillar: "EDUCATION",
                desc: "Structured courses, live labs, and certifications that turn awareness into deployable capability.",
              },
              {
                icon: Eye,
                pillar: "INTELLIGENCE",
                desc: "Real-data threat research, vulnerability advisories, and defensive intelligence for the defender community.",
              },
              {
                icon: Users,
                pillar: "COMMUNITY",
                desc: "A thriving network of cyber defenders, students, researchers, and educators building India's cyber future.",
              },
            ].map(({ icon: Icon, pillar, desc }) => (
              <div
                key={pillar}
                className="group border border-border bg-card p-8 text-center transition hover:border-primary/60 hover:shadow-[0_0_24px_rgba(0,210,255,0.12)]"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-primary/30 bg-primary/10 text-primary transition group-hover:bg-primary hover:text-primary-foreground group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-primary">{pillar}</div>
                <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIORITY 5: SERVICES ─────────────────────────────────────────────── */}
      <section id="services" className="border-t border-border bg-background py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="CYBERSECURITY PROTECTION"
            title="SERVICES WE PROVIDE"
            body="From strategic consultation to campus awareness — NISQ Vanguard delivers meaningful cybersecurity impact."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group border border-border bg-card p-7 transition hover:border-primary/60 hover:shadow-[0_0_20px_rgba(0,210,255,0.1)]"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center border border-primary/30 bg-primary/10 text-primary transition group-hover:bg-primary hover:text-primary-foreground group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/programs"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] border border-[#00D9FF] bg-transparent px-6 py-2 font-mono text-[11px] font-bold tracking-widest text-[#00D9FF] transition-all hover:bg-[#00D9FF]/10 shadow-[inset_0_0_12px_rgba(0,217,255,0.08)] rounded-md uppercase"
            >
              REQUEST A PROGRAM <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRIORITY 6: NISQ ACADEMY ─────────────────────────────────────────── */}
      <section id="academy" className="border-t border-border bg-background/90 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-14 text-center">
            <span className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase">
              NISQ VANGUARD ACADEMY
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-wide text-foreground sm:text-5xl">
              LEARN. <span className="text-primary">PRACTICE.</span> PROVE.{" "}
              <span className="text-primary">VERIFY.</span> CERTIFY.
            </h2>
            <p className="mt-5 mx-auto max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground">
              The NISQ Academy is the primary pillar of NISQ Vanguard — a structured, verifiable,
              hands-on cybersecurity education engine powered by the IVVAB Labs platform.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                icon: BookOpen,
                label: "PATHWAY 01",
                title: "Structured Courses",
                to: "/learn",
                desc: "Canonical curriculums with real telemetry datasets and authoritative citations.",
              },
              {
                icon: FlaskConical,
                label: "PATHWAY 02",
                title: "Guided Cyber Labs",
                to: "/cyber-range/labs",
                desc: "Containerised lab environments for hands-on skill application and CTF flags.",
              },
              {
                icon: ChartNoAxesCombined,
                label: "PATHWAY 03",
                title: "Progress & Certificates",
                to: "/dashboard",
                desc: "Track learning milestones, earn skill badges, and receive verifiable certificates.",
              },
            ].map(({ icon: Icon, label, title, to, desc }) => (
              <Link
                key={title}
                to={to}
                className="group border border-border bg-card p-7 transition hover:border-primary/70 hover:shadow-[0_0_24px_rgba(0,210,255,0.14)]"
              >
                <Icon className="mb-5 h-8 w-8 text-primary" />
                <div className="font-mono text-[10px] tracking-widest text-primary">{label}</div>
                <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                  {desc}
                </p>
                <div className="mt-8 flex items-center justify-between border-t border-border pt-4 font-mono text-xs text-muted-foreground">
                  <span>Continue pathway</span>
                  <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIORITY 7a: AVAILABLE COURSES ───────────────────────────────────── */}
      <section id="courses" className="border-t border-border bg-muted py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="AVAILABLE NOW"
            title="CORE COURSE CATALOG"
            body="Start with our available courses — structured, expert-authored, and enriched with real threat data."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {AVAILABLE_COURSES.map(
              ({ slug, title, level, modules, duration, description, skills, icon: Icon }) => (
                <div
                  key={slug}
                  className="group border border-border bg-background p-7 flex flex-col transition hover:border-primary hover:shadow-sm"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center border border-border bg-muted text-foreground transition group-hover:bg-primary group-hover:border-primary group-hover:text-foreground rounded">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex gap-2">
                      <span className="border border-slate-600 bg-background px-2 py-0.5 font-mono text-[9px] tracking-wider text-muted-foreground">
                        {level}
                      </span>
                      <span className="border border-slate-600 bg-background px-2 py-0.5 font-mono text-[9px] tracking-wider text-muted-foreground">
                        {modules} modules
                      </span>
                      <span className="border border-slate-600 bg-background px-2 py-0.5 font-mono text-[9px] tracking-wider text-muted-foreground">
                        {duration}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
                  <p className="mt-2 flex-1 font-mono text-xs leading-relaxed text-muted-foreground">
                    {description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="border border-border bg-background px-2 py-0.5 font-mono text-[9px] text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                    <span className="font-mono text-[10px] text-success font-bold">
                      ● AVAILABLE NOW
                    </span>
                    <Link
                      to="/learn/$slug"
                      params={{ slug }}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[40px] bg-[#00D9FF] px-4 py-2 font-mono text-[10px] tracking-wider text-[#02060D] font-bold hover:bg-[#00F0FF] shadow-[0_0_15px_rgba(0,217,255,0.1)] hover:shadow-[0_0_20px_rgba(0,217,255,0.2)] transition-all uppercase rounded-md"
                    >
                      START COURSE <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── PRIORITY 7b: LOCKED COURSES (COMING SOON) ────────────────────────── */}
      <section id="coming-soon" className="border-t border-border bg-background py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="COMING SOON"
            title="ADVANCED COURSE PIPELINE"
            body="Elite specialisations currently under review by the Chief Architect. Enrollment opens progressively."
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {LOCKED_COURSES.map(({ title, category }) => (
              <div
                key={title}
                className="relative border border-border bg-muted p-5 text-center opacity-80 rounded shadow-sm"
              >
                <div className="mb-3 flex justify-center">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="font-mono text-[8px] tracking-widest text-muted-foreground mb-1 font-bold">
                  {category}
                </div>
                <div className="font-display text-xs font-semibold text-foreground">{title}</div>
                <div className="mt-2 font-mono text-[8px] tracking-widest text-warning font-bold">
                  COMING SOON
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIORITY 5: IVVAB LABS ──────────────────────────────────────────── */}
      <section id="cyber-range" className="border-t border-border bg-muted py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase font-bold">
                Practical Training Infrastructure
              </span>
              <h2 className="mt-4 font-display text-4xl font-bold text-foreground sm:text-5xl">
                IVVAB <span className="text-primary">LABS</span>
              </h2>
              <p className="mt-5 font-mono text-sm leading-relaxed text-foreground">
                The IVVAB LABS provides isolated, containerised lab environments for hands-on
                practitioner training. Each lab scenario is built around real incident telemetry,
                adversary simulation, and defensive verification objectives.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  {
                    icon: Target,
                    label: "Scenario-Based Labs",
                    desc: "Real attack chains mapped to MITRE ATT&CK TTPs",
                  },
                  {
                    icon: ShieldCheck,
                    label: "Verified Objectives",
                    desc: "Complete tasks and capture verified flags",
                  },
                  {
                    icon: Terminal,
                    label: "Live CLI Environments",
                    desc: "Browser-based terminals for direct system interaction",
                  },
                  {
                    icon: ChartNoAxesCombined,
                    label: "Progress Tracking",
                    desc: "Track lab completions, scores, and skill growth",
                  },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-muted text-foreground rounded-md">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="font-display text-sm font-semibold text-foreground">
                        {label}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to="/cyber-range"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] bg-[#00D9FF] px-5 py-2 font-mono text-[11px] tracking-widest text-[#02060D] font-bold transition-all hover:bg-[#00F0FF] shadow-[0_0_20px_rgba(0,217,255,0.12)] hover:shadow-[0_0_28px_rgba(0,217,255,0.22)] rounded-md uppercase"
                >
                  ENTER IVVAB LABS <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/cyber-range/labs"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] border border-[#00D9FF] bg-transparent px-5 py-2 font-mono text-[11px] tracking-widest text-[#00D9FF] font-bold transition-all hover:bg-[#00D9FF]/10 shadow-[inset_0_0_12px_rgba(0,217,255,0.08)] rounded-md uppercase"
                >
                  BROWSE LABS <FlaskConical className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Terminal widget */}
            <div className="border border-border bg-muted rounded-md shadow-sm p-6 overflow-hidden">
              <div className="mb-5 flex items-center justify-between border-b border-border pb-4 font-mono text-xs text-foreground font-bold">
                <span>
                  <Terminal className="mr-2 inline h-4 w-4 text-muted-foreground" />
                  VANGUARD_IVVAB_LABS.LOG
                </span>
                <span className="flex gap-1.5">
                  <i className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0] border border-border" />
                  <i className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0] border border-border" />
                  <i className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0] border border-border" />
                </span>
              </div>
              <div className="space-y-3 font-mono text-xs leading-relaxed text-muted-foreground">
                <p className="text-primary">&gt; initializing IVVAB LABS environment...</p>
                <p>
                  &gt; loading lab:{" "}
                  <span className="text-success font-bold">
                    LAB-07 — Network Intrusion Detection
                  </span>
                </p>
                <p className="text-primary">&gt; provisioning isolated subnet: 10.0.99.0/24</p>
                <p>
                  &gt; deploying attacker node:{" "}
                  <span className="text-destructive font-bold">192.168.1.105 [THREAT ACTOR]</span>
                </p>
                <p>
                  &gt; deploying defender node:{" "}
                  <span className="text-success font-bold">10.0.99.5 [YOU]</span>
                </p>
                <p className="text-warning font-bold">
                  &gt; OBJECTIVE: Detect and block the SYN flood attack
                </p>
                <p className="text-success font-bold">&gt; status: RANGE ACTIVE — GOOD HUNTING.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRIORITY 6: THREAT INTELLIGENCE ─────────────────────────────────── */}
      <section id="intelligence" className="border-t border-border bg-background py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="THREAT INTELLIGENCE"
            title="REAL-DATA DEFENCE RESEARCH"
            body="Live threat research, security advisories, vulnerability tracking, and defensive guidance from the NISQ Vanguard intelligence division."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Radar,
                label: "Threat Research",
                desc: "Emerging threat actor profiles, campaign tracking, and IOC feeds.",
              },
              {
                icon: ShieldAlert,
                label: "Security Advisories",
                desc: "Timely vulnerability disclosures and recommended defensive postures.",
              },
              {
                icon: Eye,
                label: "Vulnerability Tracking",
                desc: "CVE monitoring, patch prioritisation, and risk scoring dashboards.",
              },
              {
                icon: Shield,
                label: "Defensive Guidance",
                desc: "Playbooks, mitigation strategies, and incident response templates.",
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="border border-border bg-muted p-6 hover:border-primary transition-colors rounded-md shadow-sm"
              >
                <Icon className="mb-4 h-6 w-6 text-foreground" />
                <h3 className="font-display text-base font-semibold text-foreground">{label}</h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/intelligence"
              className="inline-flex items-center gap-2 border border-border bg-muted px-6 py-3 font-mono text-[11px] tracking-wider text-foreground font-bold hover:bg-background hover:text-primary transition rounded uppercase"
            >
              VIEW INTELLIGENCE PLATFORM <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRIORITY 7: COMMUNITY ────────────────────────────────────────────── */}
      <section id="community" className="border-t border-border bg-muted py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="NISQ VANGUARD COMMUNITY"
            title="JOIN THE DIGITAL GUARDIANS"
            body="Be part of a growing network of cyber defenders, students, and educators building India's cybersecurity future."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {COMMUNITY.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group border border-border bg-background p-7 transition hover:border-primary rounded-md shadow-sm"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center border border-border bg-muted text-foreground transition group-hover:bg-primary group-hover:border-primary group-hover:text-foreground rounded">
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

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-background py-24">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <div className="mb-6 flex justify-center">
            <img
              src={nisqLogo}
              alt="NISQ Vanguard"
              className="h-14 w-14 rounded-full object-cover shadow-sm border border-border"
            />
          </div>
          <h2 className="font-display text-4xl font-bold tracking-wide text-foreground sm:text-5xl">
            BEGIN YOUR <span className="text-primary">DEFENCE JOURNEY</span>
          </h2>
          <p className="mt-5 font-mono text-sm leading-relaxed text-muted-foreground">
            Access the full NISQ Vanguard Academy, IVVAB LABS, and Threat Intelligence platform.
            Learning is free. Your defence starts now.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/learn"
              className="inline-flex items-center gap-2 bg-muted px-8 py-4 font-display text-sm font-bold tracking-wider text-foreground shadow-sm transition hover:bg-primary rounded"
            >
              START LEARNING FREE <GraduationCap className="h-4 w-4" />
            </Link>
            <Link
              to="/reporting"
              className="inline-flex items-center gap-2 border border-border bg-muted px-8 py-4 font-mono text-sm tracking-wider text-foreground hover:bg-background hover:text-primary hover:border-primary transition rounded"
            >
              <Shield className="h-4 w-4" /> REPORT A THREAT
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-muted py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-4">
            <div className="sm:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={nisqLogo}
                  alt="NISQ Vanguard"
                  className="h-8 w-8 rounded-sm object-cover"
                />
                <span className="font-display text-xs font-bold tracking-widest text-foreground">
                  NISQ VANGUARD
                </span>
              </div>
              <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
                Defence Technologies · Cyber Education · Threat Intelligence
                <br />
                Secure Today. Defend Tomorrow. Empower Forever.
              </p>
            </div>

            <div>
              <div className="font-mono text-[9px] tracking-[0.2em] text-primary mb-4 uppercase">
                Academy
              </div>
              <div className="space-y-2">
                {[
                  ["Courses", "/learn"],
                  ["IVVAB LABS", "/cyber-range"],
                  ["Learning Paths", "/cyber-range/learning-paths"],
                  ["My Progress", "/dashboard"],
                ].map(([label, to]) => (
                  <div key={label}>
                    <Link
                      to={to as any}
                      className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      {label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="font-mono text-[9px] tracking-[0.2em] text-primary mb-4 uppercase">
                Organisation
              </div>
              <div className="space-y-2">
                {[
                  ["About Founder", "/about/founder"],
                  ["Campus Programs", "/programs"],
                  ["Intelligence", "/intelligence"],
                  ["Report Incident", "/complaint"],
                ].map(([label, to]) => (
                  <div key={label}>
                    <Link
                      to={to as any}
                      className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      {label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="font-mono text-[9px] tracking-[0.2em] text-primary mb-4 uppercase">
                Legal
              </div>
              <div className="space-y-2">
                {[
                  ["Privacy Policy", "/privacy"],
                  ["Terms of Service", "/terms"],
                  ["Security", "/security"],
                  ["Responsible Disclosure", "/responsible-disclosure"],
                ].map(([label, to]) => (
                  <div key={label}>
                    <Link
                      to={to as any}
                      className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      {label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-mono text-[10px] text-muted-foreground">
              © 2025 NISQ Vanguard Defence Technologies · IVVAB Labs Engine · All rights reserved.
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              Founder & Chief Architect: Ashok Vallabhuni
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ─── Small shared components ─────────────────────────────────────────────────
function IntelStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-xl font-bold text-foreground sm:text-2xl">{value}</div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
        {label}
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      <span className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase">
        {eyebrow}
      </span>
      <h2 className="mt-4 font-display text-3xl font-bold tracking-wide text-foreground sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 font-mono text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
