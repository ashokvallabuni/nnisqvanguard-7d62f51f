import React, { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  RotateCcw,
  Shield,
  GraduationCap,
  Terminal,
  Cpu,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { founderPhilosophy, founderArchitecturalContributions } from "@/data/team";
import { PremiumButton } from "@/components/common/PremiumButton";

const founderImg = "/assets/founder.webp";
const nisqLogo = "/assets/nisq-logo.webp";

export function FounderFlipCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const toggleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFlip();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      rx: -(y / (rect.height / 2)) * 4,
      ry: (x / (rect.width / 2)) * 4,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  return (
    <div
      className="relative w-full max-w-4xl mx-auto [perspective:1200px] select-none"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Outer Card Container with 3D Flip */}
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-label="Founder profile for Ashok Vallabhuni. Press Space or Enter to flip between dossier and architectural matrix."
        aria-expanded={isFlipped}
        onClick={toggleFlip}
        onKeyDown={handleKeyDown}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry + (isFlipped ? 180 : 0)}deg)`,
          transformStyle: "preserve-3d",
        }}
        className={cn(
          "relative w-full min-h-[580px] rounded-3xl transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#0A7CFF] dark:focus-visible:ring-[#00B8FF] focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#050B14]"
        )}
      >
        {/* =========================================================================
            FRONT FACE: Professional Cyber Dossier
            ========================================================================= */}
        <div
          style={{ backfaceVisibility: "hidden" }}
          aria-hidden={isFlipped}
          className="absolute inset-0 w-full h-full rounded-3xl bg-white/95 dark:bg-[#081522]/95 border border-[#E2E8F0] dark:border-[#16283A] p-6 sm:p-8 md:p-10 shadow-card dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between overflow-hidden"
        >
          {/* Subtle Ambient Circuit Glow & Watermark */}
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#0A7CFF]/15 via-transparent to-transparent pointer-events-none -z-10"
            aria-hidden="true"
          />
          <img
            src={nisqLogo}
            alt=""
            className="absolute -bottom-10 -right-10 w-64 h-64 opacity-5 pointer-events-none select-none -z-10 object-contain"
            aria-hidden="true"
          />

          {/* Top Status Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#16283A] pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00B8FF] animate-pulse shadow-[0_0_8px_#00B8FF]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#0A7CFF] dark:text-[#00B8FF] font-semibold">
                ARCHITECT DOSSIER · VERIFIED
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#0A7CFF] dark:text-[#94A3B8] bg-[#EAF4FF] dark:bg-[#050B14] px-3 py-1 rounded-full border border-[#CFE4FF] dark:border-[#16283A]">
              <RotateCcw className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="hidden sm:inline">CLICK OR TAP TO FLIP</span>
            </div>
          </div>

          {/* Main Dossier Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1">
            {/* Founder Portrait with Holographic Frame */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative group/photo p-2.5 rounded-2xl bg-gradient-to-b from-[#0A7CFF]/15 dark:from-[#0A7CFF]/25 via-[#00B8FF]/5 dark:via-[#00B8FF]/10 to-transparent border border-[#0A7CFF]/30 dark:border-[#00B8FF]/40 shadow-sm dark:shadow-[0_0_30px_rgba(10,124,255,0.25)]">
                {/* Cyber Corner Markers */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00B8FF] rounded-tl" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00B8FF] rounded-tr" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00B8FF] rounded-bl" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00B8FF] rounded-br" />

                <img
                  src={founderImg}
                  alt="Ashok Vallabhuni — Founder & Chief Architect"
                  width={280}
                  height={320}
                  className="w-48 sm:w-56 md:w-60 h-auto aspect-[4/5] object-cover object-top rounded-xl shadow-md border border-[#E2E8F0] dark:border-[#16283A]"
                />
              </div>
              <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-[#0A7CFF] dark:text-[#38BDF8]">
                <Shield className="w-3.5 h-3.5 text-[#00B8FF]" />
                <span>NISQ DEFENCE TECHNOLOGIES</span>
              </div>
            </div>

            {/* Profile Bio & Skills */}
            <div className="md:col-span-7 flex flex-col justify-center text-left">
              <div className="space-y-1 mb-4">
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[#050B14] dark:text-white tracking-tight">
                  Ashok Vallabhuni
                </h3>
                <p className="font-mono text-sm sm:text-base font-semibold text-[#0A7CFF] dark:text-[#00B8FF] tracking-wider">
                  Founder · Chief Architect
                </p>
              </div>

              <p className="text-sm sm:text-base text-[#475569] dark:text-[#94A3B8] leading-relaxed mb-6">
                Founder of NISQ Vanguard, focused on cybersecurity, AI security, security engineering, and practical cybersecurity education. His work explores the intersection of modern cyber defence and emerging technologies including LLMs, AI agents, and intelligent infrastructure.
              </p>

              {/* Verified Expertise Tags */}
              <div className="space-y-2 mb-6">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block">
                  Core Architectural Domains:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Cyber Defence Strategy",
                    "AI Security Architecture",
                    "IVVAB Labs Engine",
                    "Security Engineering",
                    "Campus Cyber Outreach",
                    "Zero-Trust Infrastructure",
                  ].map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#050B14] border border-[#E2E8F0] dark:border-[#16283A] text-xs font-mono text-[#050B14] dark:text-[#F8FAFC] flex items-center gap-1.5 shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0A7CFF]" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Flip Button CTA */}
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 text-xs font-mono text-[#0A7CFF] dark:text-[#00B8FF] font-semibold hover:underline group-hover:text-[#0A7CFF] dark:group-hover:text-white transition-colors">
                  <span>INSPECT MISSION MATRIX & CORE PHILOSOPHY</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </div>

          {/* Card Footer Bar */}
          <div className="border-t border-[#E2E8F0] dark:border-[#16283A] pt-4 mt-6 flex flex-wrap items-center justify-between text-xs font-mono text-[#64748B] dark:text-[#94A3B8] gap-2">
            <span>NISQ VANGUARD · HYDERABAD / INDIA</span>
            <span className="text-[#38BDF8]">SPACE / ENTER OR TAP TO FLIP ↵</span>
          </div>
        </div>

        {/* =========================================================================
            REVERSE FACE: Mission Philosophy & Architectural Contributions
            ========================================================================= */}
        <div
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
          }}
          aria-hidden={!isFlipped}
          className="absolute inset-0 w-full h-full rounded-3xl bg-white/98 dark:bg-[#081522]/98 border border-[#0A7CFF]/30 dark:border-[#00B8FF]/40 p-6 sm:p-8 md:p-10 shadow-lg dark:shadow-[0_20px_50px_rgba(0,184,255,0.15)] flex flex-col justify-between overflow-y-auto"
        >
          {/* Top Return Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#16283A] pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#00B8FF]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#00B8FF] font-bold">
                MISSION MATRIX & ARCHITECTURAL CONTRIBUTIONS
              </span>
            </div>
            <button
              type="button"
              tabIndex={isFlipped ? 0 : -1}
              onClick={(e) => {
                e.stopPropagation();
                toggleFlip();
              }}
              className="flex items-center gap-1.5 text-xs font-mono text-[#0A7CFF] dark:text-[#38BDF8] hover:text-[#0A7CFF] dark:hover:text-white bg-[#EAF4FF] dark:bg-[#050B14] px-3 py-1 rounded-full border border-[#CFE4FF] dark:border-[#16283A] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RETURN TO DOSSIER</span>
            </button>
          </div>

          {/* Grid of Contributions & Philosophy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left mb-6">
            {/* Core Philosophy Section */}
            <div className="space-y-3.5">
              <h4 className="font-mono text-xs uppercase tracking-wider text-[#0A7CFF] dark:text-[#38BDF8] font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#00B8FF]" />
                <span>Foundational Principles</span>
              </h4>
              <div className="space-y-2.5">
                {founderPhilosophy.slice(0, 3).map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#050B14]/70 border border-[#E2E8F0] dark:border-[#16283A] text-xs space-y-1 shadow-2xs"
                  >
                    <span className="font-bold text-[#050B14] dark:text-[#F8FAFC] font-mono block">
                      {item.heading}
                    </span>
                    <p className="text-[#475569] dark:text-[#94A3B8] leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Contributions */}
            <div className="space-y-3.5">
              <h4 className="font-mono text-xs uppercase tracking-wider text-[#0A7CFF] dark:text-[#38BDF8] font-semibold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#00B8FF]" />
                <span>Key Platform Inventions</span>
              </h4>
              <div className="space-y-2.5">
                {founderArchitecturalContributions.slice(0, 3).map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#050B14]/70 border border-[#E2E8F0] dark:border-[#16283A] text-xs space-y-1 shadow-2xs"
                  >
                    <span className="font-bold text-[#050B14] dark:text-[#F8FAFC] font-mono block">
                      {item.title}
                    </span>
                    <p className="text-[#475569] dark:text-[#94A3B8] leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Call to Action */}
          <div className="border-t border-[#E2E8F0] dark:border-[#16283A] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <p className="font-mono text-xs text-[#050B14] dark:text-[#F8FAFC] font-semibold">
                Interested in strategic cybersecurity collaboration or campus training?
              </p>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Connect directly with our security architects.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                to="/appointments"
                tabIndex={isFlipped ? 0 : -1}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0A7CFF] to-[#00B8FF] text-white text-xs font-mono font-bold tracking-wide shadow-[0_0_15px_rgba(0,184,255,0.4)] hover:brightness-110 active:scale-95 transition-all"
              >
                <span>BOOK BRIEFING</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
