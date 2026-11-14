import React from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Terminal,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Radar,
  ArrowRight,
  Activity,
  Cpu,
  Lock,
  Layers,
  ChevronRight,
  School,
  Building2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { teamData } from "@/data/team";
import { CyberCircuitCanvas } from "@/components/vfx/CyberCircuitCanvas";
import { Interactive3DCard } from "@/components/vfx/Interactive3DCard";
import { PremiumButton } from "@/components/common/PremiumButton";
import { FounderFlipCard } from "@/components/home/FounderFlipCard";

const nisqLogo = "/assets/nisq-logo.webp";

const EASE = [0.22, 1, 0.36, 1] as const;
const TRANSITION = { duration: 0.6, ease: EASE };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITION,
  },
};

export function CyberIntelligenceHome() {
  const { user } = useAuth();

  return (
    <div className="relative bg-[#F8FAFC] dark:bg-[#050B14] text-[#050B14] dark:text-[#F8FAFC] selection:bg-[#00B8FF]/30 selection:text-white overflow-x-hidden min-h-screen transition-colors duration-200">
      {/* =========================================================================
          HERO COMMAND CENTER SECTION
          ========================================================================= */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[#E2E8F0] dark:border-[#16283A]">
        {/* Live Interactive Circuit Canvas VFX */}
        <CyberCircuitCanvas className="absolute inset-0 w-full h-full z-0 opacity-75" density="medium" />

        {/* Ambient Radial Lighting */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#0A7CFF]/10 dark:from-[#0A7CFF]/15 via-[#00B8FF]/5 dark:via-[#00B8FF]/10 to-transparent blur-[120px] pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* Subtle Cyber Grid Floor Effect */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,124,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,124,255,0.06)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(22,40,58,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(22,40,58,0.35)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-10"
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center text-center">
          {/* Live Telemetry Status Ticker */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/90 dark:bg-[#081522]/90 border border-[#CFE4FF] dark:border-[#16283A] shadow-xs dark:shadow-[0_0_15px_rgba(10,124,255,0.2)] mb-6"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B8FF] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B8FF]" />
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#0A7CFF] dark:text-[#38BDF8]">
              NISQ VANGUARD PLATFORM · ACTIVE DEFENCE ENGINE
            </span>
          </motion.div>

          {/* Branded Emblem */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative mb-6"
          >
            <div className="relative p-2.5 rounded-2xl bg-gradient-to-b from-[#0A7CFF]/20 to-transparent border border-[#00B8FF]/40 shadow-[0_0_35px_rgba(10,124,255,0.3)]">
              <img
                src={nisqLogo}
                alt="NISQ Vanguard official emblem"
                width={96}
                height={96}
                fetchPriority="high"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shadow-inner"
              />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-extrabold text-[clamp(2.4rem,6.5vw,5rem)] leading-[1.08] tracking-tight text-[#050B14] dark:text-white mb-6"
          >
            Secure Today. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A7CFF] via-[#00B8FF] to-[#38BDF8] drop-shadow-[0_0_35px_rgba(0,184,255,0.4)]">
              Defend Tomorrow.
            </span> <br />
            Empower Forever.
          </motion.h1>

          {/* Mission Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-[#475569] dark:text-[#94A3B8] max-w-3xl leading-relaxed mb-10"
          >
            NISQ Vanguard is a cyber defence and intelligence technology company protecting digital infrastructure. We unite institutional cybersecurity education, containerized hands-on IVVAB LABS, and AI-assisted threat analysis into one sovereign training ecosystem.
          </motion.p>

          {/* Premium CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <PremiumButton
              variant="cyber-glow"
              size="lg"
              to="/cyber-range/labs"
              icon={<Terminal className="w-4 h-4 text-[#00B8FF]" />}
              iconRight={<ArrowRight className="w-4 h-4" />}
              pulse
            >
              EXPLORE IVVAB LABS
            </PremiumButton>

            <PremiumButton
              variant="secondary"
              size="lg"
              to="/academy"
              icon={<GraduationCap className="w-4 h-4 text-[#38BDF8]" />}
            >
              EXPLORE ACADEMY
            </PremiumButton>

            <PremiumButton
              variant="outline"
              size="lg"
              to="/innovation/cybershieldai"
              icon={<Sparkles className="w-4 h-4 text-[#00B8FF]" />}
            >
              EXPLORE IVVAB AI
            </PremiumButton>
          </motion.div>

          {/* Live System Metrics Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-14 pt-8 border-t border-[#E2E8F0] dark:border-[#16283A] grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 text-center w-full max-w-4xl"
          >
            <div>
              <div className="font-display font-extrabold text-2xl md:text-3xl text-[#050B14] dark:text-white">4+</div>
              <div className="font-mono text-[11px] text-[#0A7CFF] dark:text-[#38BDF8] uppercase tracking-wider mt-1">Canonical Pathways</div>
            </div>
            <div>
              <div className="font-display font-extrabold text-2xl md:text-3xl text-[#00B8FF]">100%</div>
              <div className="font-mono text-[11px] text-[#0A7CFF] dark:text-[#38BDF8] uppercase tracking-wider mt-1">Isolated Virtual Labs</div>
            </div>
            <div>
              <div className="font-display font-extrabold text-2xl md:text-3xl text-[#050B14] dark:text-white">Offline</div>
              <div className="font-mono text-[11px] text-[#0A7CFF] dark:text-[#38BDF8] uppercase tracking-wider mt-1">First Lab Runtime</div>
            </div>
            <div>
              <div className="font-display font-extrabold text-2xl md:text-3xl text-[#00B8FF]">Zero-Trust</div>
              <div className="font-mono text-[11px] text-[#0A7CFF] dark:text-[#38BDF8] uppercase tracking-wider mt-1">Architecture Verified</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          PILLARS MATRIX: 4 Core Platform Capabilities (Layered 3D Cards)
          ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF4FF] dark:bg-[#081522] border border-[#CFE4FF] dark:border-[#16283A] text-xs font-mono text-[#0A7CFF] dark:text-[#00B8FF] mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>OPERATIONAL CAPABILITIES</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#050B14] dark:text-white tracking-tight mb-4">
            Unified Cyber Defence Architecture
          </h2>
          <p className="text-[#475569] dark:text-[#94A3B8] text-base leading-relaxed">
            From foundational network packet inspection to enterprise threat simulation, NISQ Vanguard provides continuous skills progression.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: Academy */}
          <Interactive3DCard className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#0A7CFF]/15 border border-[#0A7CFF]/40 flex items-center justify-center text-[#00B8FF] mb-5 shadow-[0_0_15px_rgba(10,124,255,0.25)]">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#050B14] dark:text-white mb-2">NISQ Academy</h3>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed mb-6">
                Structured cybersecurity curriculum covering Networking Fundamentals, Linux Command Quest, and Cybersecurity Foundations.
              </p>
            </div>
            <Link
              to="/academy"
              className="inline-flex items-center gap-2 font-mono text-xs text-[#0A7CFF] dark:text-[#00B8FF] font-semibold hover:text-[#050B14] dark:hover:text-white transition-colors group"
            >
              <span>EXPLORE COURSES</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Interactive3DCard>

          {/* Pillar 2: IVVAB LABS */}
          <Interactive3DCard className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#00B8FF]/15 border border-[#00B8FF]/40 flex items-center justify-center text-[#00B8FF] mb-5 shadow-[0_0_15px_rgba(0,184,255,0.25)]">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#050B14] dark:text-white mb-2">IVVAB LABS</h3>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed mb-6">
                Interactive in-browser cyber range terminal. Practice real Linux investigation, NIDS traffic analysis, and exploit forensics safely.
              </p>
            </div>
            <Link
              to="/cyber-range/labs"
              className="inline-flex items-center gap-2 font-mono text-xs text-[#0A7CFF] dark:text-[#00B8FF] font-semibold hover:text-[#050B14] dark:hover:text-white transition-colors group"
            >
              <span>LAUNCH LAB RUNNER</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Interactive3DCard>

          {/* Pillar 3: IVVAB AI Threat Defense */}
          <Interactive3DCard className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#0A7CFF]/15 border border-[#00B8FF]/40 flex items-center justify-center text-[#38BDF8] mb-5 shadow-[0_0_15px_rgba(10,124,255,0.25)]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#050B14] dark:text-white mb-2">IVVAB AI Defense</h3>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed mb-6">
                AI-driven threat correlation, automated incident triage, malware screenshot analysis, and intelligent adversary modeling.
              </p>
            </div>
            <Link
              to="/innovation/cybershieldai"
              className="inline-flex items-center gap-2 font-mono text-xs text-[#0A7CFF] dark:text-[#00B8FF] font-semibold hover:text-[#050B14] dark:hover:text-white transition-colors group"
            >
              <span>AI THREAT DEFENSE</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Interactive3DCard>

          {/* Pillar 4: Campus & Enterprise Consultations */}
          <Interactive3DCard className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#00B8FF]/15 border border-[#00B8FF]/40 flex items-center justify-center text-[#00B8FF] mb-5 shadow-[0_0_15px_rgba(0,184,255,0.25)]">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#050B14] dark:text-white mb-2">Advisory & Campus</h3>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed mb-6">
                Tactical cybersecurity consultations, enterprise red/blue drills, and college awareness programs across India.
              </p>
            </div>
            <Link
              to="/appointments"
              className="inline-flex items-center gap-2 font-mono text-xs text-[#0A7CFF] dark:text-[#00B8FF] font-semibold hover:text-[#050B14] dark:hover:text-white transition-colors group"
            >
              <span>BOOK BRIEFING</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Interactive3DCard>
        </div>
      </section>

      {/* =========================================================================
          FEATURED LAB SHOWCASE SECTION
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-[#E2E8F0] dark:border-[#16283A]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF4FF] dark:bg-[#081522] border border-[#CFE4FF] dark:border-[#16283A] text-xs font-mono text-[#0A7CFF] dark:text-[#00B8FF] mb-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>LIVE SCENARIOS</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl text-[#050B14] dark:text-white tracking-tight">
              Featured IVVAB Cyber Labs
            </h2>
            <p className="text-[#475569] dark:text-[#94A3B8] text-sm mt-1">
              Hands-on containerized environments. Execute real commands in an isolated virtual filesystem.
            </p>
          </div>
          <PremiumButton variant="outline" size="sm" to="/cyber-range/labs" icon={<Terminal className="w-3.5 h-3.5" />}>
            VIEW ALL LABS →
          </PremiumButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              id: "lab-ssh-bruteforce",
              title: "SSH Brute-Force Triage",
              course: "Linux Command Quest",
              difficulty: "BEGINNER",
              duration: "25 MIN",
              category: "AUTHENTICATION",
            },
            {
              id: "lab-suricata-nids",
              title: "Suricata NIDS Detection",
              course: "Basics of Networking",
              difficulty: "INTERMEDIATE",
              duration: "40 MIN",
              category: "NETWORK DEFENCE",
            },
            {
              id: "lab-sqli-investigation",
              title: "SQL Injection Analysis",
              course: "Cybersecurity Foundations",
              difficulty: "INTERMEDIATE",
              duration: "35 MIN",
              category: "APP SECURITY",
            },
            {
              id: "lab-memory-forensics",
              title: "Memory Volatility Forensics",
              course: "Cybersecurity Masterclass",
              difficulty: "ADVANCED",
              duration: "50 MIN",
              category: "INCIDENT RESPONSE",
            },
          ].map((lab) => (
            <Interactive3DCard key={lab.id} className="p-5 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-3">
                  <span className="px-2 py-0.5 rounded bg-[#EAF4FF] dark:bg-[#0A7CFF]/15 text-[#0A7CFF] dark:text-[#38BDF8] border border-[#CFE4FF] dark:border-[#0A7CFF]/30 font-semibold">
                    {lab.difficulty}
                  </span>
                  <span className="text-[#94A3B8] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#00B8FF]" />
                    {lab.duration}
                  </span>
                </div>
                <h4 className="font-bold text-[#050B14] dark:text-white text-lg mb-1">{lab.title}</h4>
                <p className="text-xs font-mono text-[#0A7CFF] dark:text-[#00B8FF] mb-4">{lab.course}</p>
                <div className="text-xs text-[#94A3B8] mb-6">
                  Category: <span className="text-[#050B14] dark:text-white font-mono">{lab.category}</span>
                </div>
              </div>

              <Link
                to={`/cyber-range/lab/${lab.id}` as any}
                className="w-full py-2.5 px-3 rounded-lg bg-[#EAF4FF] dark:bg-[#050B14] hover:bg-[#0A7CFF] text-[#0A7CFF] dark:text-white hover:text-white border border-[#CFE4FF] dark:border-[#16283A] hover:border-[#0A7CFF] font-mono text-xs font-semibold text-center transition-all flex items-center justify-center gap-2 group"
              >
                <span>ENTER LAB</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Interactive3DCard>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SIGNATURE FOUNDER 3D FLIP CARD SECTION (Standout Homepage Feature)
          ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10 border-t border-[#E2E8F0] dark:border-[#16283A]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF4FF] dark:bg-[#081522] border border-[#CFE4FF] dark:border-[#16283A] text-xs font-mono text-[#0A7CFF] dark:text-[#00B8FF] mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>EXECUTIVE ARCHITECTURE</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#050B14] dark:text-white tracking-tight mb-3">
            Founder & Chief Architect
          </h2>
          <p className="text-[#94A3B8] text-sm sm:text-base leading-relaxed">
            The architectural vision driving sovereign cyber defence, youth empowerment, and practical security education.
          </p>
        </div>

        {/* Signature Interactive 3D Flip Card */}
        <FounderFlipCard />
      </section>

      {/* =========================================================================
          COMMAND TEAM SECTION
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-[#E2E8F0] dark:border-[#16283A]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display font-extrabold text-3xl text-[#050B14] dark:text-white tracking-tight mb-2">
            Command Leadership
          </h2>
          <p className="text-[#94A3B8] text-sm">
            Guiding NISQ Vanguard's mission to protect critical systems and train the next generation of defenders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamData.map((member, i) => (
            <Interactive3DCard key={i} className="p-7 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full border border-[#0A7CFF]/30 dark:border-[#00B8FF]/40 flex items-center justify-center mb-5 overflow-hidden bg-[#EAF4FF] dark:bg-[#050B14] shadow-[0_0_15px_rgba(10,124,255,0.2)]">
                {member.imageUrl ? (
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    width={80}
                    height={80}
                    loading="lazy"
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <span className="font-mono text-xl text-[#00B8FF] font-bold">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-[#050B14] dark:text-white mb-1">{member.name}</h3>
              <p className="font-mono text-xs uppercase tracking-wider text-[#00B8FF] mb-3">{member.role}</p>
              <p className="text-[#94A3B8] text-xs leading-relaxed line-clamp-3">{member.bio}</p>
            </Interactive3DCard>
          ))}
        </div>
      </section>

      {/* =========================================================================
          CALL TO ACTION: Enterprise Briefing & Consultation
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#EAF4FF] via-white to-[#EAF4FF] dark:from-[#081522] dark:via-[#050B14] dark:to-[#081522] border border-[#0A7CFF]/30 dark:border-[#00B8FF]/40 shadow-card dark:shadow-[0_0_40px_rgba(0,184,255,0.15)] text-center relative overflow-hidden">
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-radial from-[#0A7CFF]/20 to-transparent blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#00B8FF] block mb-3">
            TACTICAL CYBER DEFENCE BRIEFINGS
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#050B14] dark:text-white tracking-tight mb-4">
            Ready to Strengthen Your Security Posture?
          </h2>
          <p className="text-sm sm:text-base text-[#475569] dark:text-[#94A3B8] max-w-2xl mx-auto leading-relaxed mb-8">
            Schedule a strategic operations briefing with our senior security architects to evaluate your organization's cyber defense or deploy campus training.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PremiumButton
              variant="cyber-glow"
              size="lg"
              to="/appointments"
              icon={<ShieldCheck className="w-4 h-4 text-[#00B8FF]" />}
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              SCHEDULE BRIEFING
            </PremiumButton>
            <PremiumButton variant="outline" size="lg" to="/services">
              EXPLORE SERVICES
            </PremiumButton>
          </div>
        </div>
      </section>
    </div>
  );
}
