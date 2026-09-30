import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { BackgroundStage } from './BackgroundStage';
import { HUDOverlay } from './HUDOverlay';
import { Shield, Cpu, Activity, Radar, ArrowRight, User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

// ============================================================================
// MOTION & ANIMATION CONFIG
// ============================================================================
const EASE = [0.22, 1, 0.36, 1];
const TRANSITION = { duration: 0.6, ease: EASE };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: TRANSITION
  }
};

// ============================================================================
// COMPONENT SYSTEM
// ============================================================================

import { CyberButton } from './common/CyberButton';

const SectionWrapper = ({ children, id, className = '' }: { children: React.ReactNode, id?: string, className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  
  return (
    <motion.section 
      id={id}
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`min-h-[auto] md:min-h-[100svh] py-[64px] md:py-[112px] flex flex-col justify-center w-full max-w-[1280px] mx-auto px-[clamp(16px,4vw,48px)] relative z-10 ${className}`}
    >
      {children}
    </motion.section>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export function CyberIntelligenceHome() {
  const { scrollYProgress } = useScroll();
  const { user } = useAuth();

  return (
    <div className="relative bg-[var(--obsidian)] text-white font-sans selection:bg-[var(--cyan)] selection:text-black overflow-x-hidden">
      <BackgroundStage scrollYProgress={scrollYProgress} />
      <HUDOverlay scrollYProgress={scrollYProgress} />

      <main className="relative z-10 w-full lg:snap-y lg:snap-proximity">
        
        {/* ==================== FRAME 1: HERO ==================== */}
        <section className="min-h-[100svh] pt-32 pb-[64px] md:pb-[112px] flex flex-col justify-end w-full max-w-[1280px] mx-auto px-[clamp(16px,4vw,48px)] relative z-10 lg:snap-center">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-12 gap-6 min-w-0 items-center relative"
          >
            {/* Center Crest Background Image - dead center behind hero text */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.15, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
            >
              <img src="/assets/nisq-logo.jpeg" alt="NISQ VANGUARD Crest" className="w-full max-w-[420px] md:max-w-[520px] object-contain rounded-full border border-[#00D2FF]/20 shadow-[0_0_100px_rgba(0,210,255,0.15)]" />
            </motion.div>

            <div className="col-span-1 md:col-span-12 flex flex-col items-center text-center gap-6 min-w-0 z-10 relative">
              <motion.h1 
                variants={itemVariants}
                className="font-orbitron font-bold text-[clamp(48px,6vw,96px)] leading-[1.05] tracking-tight uppercase drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
              >
                SECURE<br />
                THE FUTURE.
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-[16px] md:text-[17px] leading-[1.6] text-[var(--chrome)] max-w-[65ch]"
              >
                Advanced cybersecurity intelligence, rigorous defense-in-depth methodologies, and active threat neutralization for critical infrastructure.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
                {user ? (
                  <CyberButton variant="primary" to="/dashboard">Access Dashboard</CyberButton>
                ) : (
                  <CyberButton variant="primary" to="/login">Enter the NISQ VANGUARD</CyberButton>
                )}
                <CyberButton variant="secondary" to="/services">Explore Capabilities</CyberButton>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ==================== FRAME 2: SERVICES ==================== */}
        <SectionWrapper id="services" className="lg:snap-center">
          <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-6 min-w-0 mb-16">
            <motion.div variants={itemVariants} className="col-span-4 md:col-span-8 lg:col-span-12 min-w-0">
              <div className="font-mono text-[12px] md:text-[13px] text-[var(--cyan)] tracking-widest mb-4">SERVICES</div>
              <h2 className="font-orbitron text-[clamp(32px,4vw,48px)] leading-[1.1] font-bold">Strategic Defense Operations</h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-w-0">
            {[
              { icon: Shield, title: "Protection", desc: "Enterprise grade hardening and continuous attack surface reduction." },
              { icon: Cpu, title: "Intelligence", desc: "Proactive threat hunting and zero-day vulnerability research." },
              { icon: Radar, title: "Operations", desc: "24/7 security operations center and rapid incident response protocols." },
              { icon: Activity, title: "Academy", desc: "Immersive cyber range environments and professional education." }
            ].map((srv, i) => (
              <motion.div 
                key={i}
                variants={itemVariants}
                className="group relative flex flex-col p-6 bg-[var(--obsidian)]/80 border border-[var(--line)] backdrop-blur-md min-w-0 h-full transition-colors duration-500 hover:border-[#00D2FF]/50"
              >
                {/* HUD Corner Ticks */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--line)] group-hover:border-[#00D2FF] transition-colors" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--line)] group-hover:border-[#00D2FF] transition-colors" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--line)] group-hover:border-[#00D2FF] transition-colors" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--line)] group-hover:border-[#00D2FF] transition-colors" />
                
                {/* Subtle inner glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,210,255,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="w-[44px] h-[44px] mb-6 flex items-center justify-center border border-[var(--line)] bg-black/50 text-[#00D2FF] group-hover:scale-110 transition-transform duration-500 shrink-0">
                  <srv.icon size={20} />
                </div>
                
                <h3 className="font-orbitron text-[clamp(20px,3vw,24px)] font-semibold mb-3 text-white">{srv.title}</h3>
                <p className="text-[16px] md:text-[17px] text-[var(--chrome)] leading-[1.6] mb-8 grow">
                  {srv.desc}
                </p>
                
                <div className="mt-auto pt-4 border-t border-[var(--line)]">
                  <CyberButton variant="secondary" className="w-full flex items-center justify-center" to="/services">
                    Learn More <ArrowRight className="ml-2" size={16} />
                  </CyberButton>
                </div>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>

        {/* ==================== FRAME 3: FOUNDER ==================== */}
        <SectionWrapper id="founder" className="lg:snap-center">
          <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-6 lg:gap-12 min-w-0 items-center">
            
            <motion.div variants={itemVariants} className="col-span-4 md:col-span-4 lg:col-span-5 relative group min-w-0">
              <div className="relative aspect-[3/4] w-full overflow-hidden border border-[var(--line)] group-hover:border-[var(--cyan)]/50 transition-all duration-600 bg-black/50">
                <img 
                  src="/assets/founder.jpeg" 
                  alt="Ashok Vallabuni" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                  className="w-full h-full object-cover object-[center_20%] grayscale contrast-105 group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] relative z-10"
                />
                
                {/* Fallback monogram */}
                <div className="absolute inset-0 bg-[var(--obsidian)] hidden items-center justify-center z-0">
                  <span className="font-orbitron text-[4rem] text-[var(--chrome)] font-bold tracking-widest">AV</span>
                </div>
                
                {/* Soft dark gradient at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent z-20 pointer-events-none" />

                {/* Scan-line sweep */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--cyan)] opacity-0 group-hover:opacity-100 group-hover:animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_10px_var(--cyan)] pointer-events-none z-30" />
                
                {/* Expanding corner brackets */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[var(--cyan)] opacity-0 group-hover:opacity-100 -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 z-30 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[var(--cyan)] opacity-0 group-hover:opacity-100 translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 z-30 pointer-events-none" />
                
                <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(32,217,245,0)] group-hover:shadow-[inset_0_0_50px_rgba(32,217,245,0.15)] transition-shadow duration-600 pointer-events-none z-30" />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="col-span-4 md:col-span-4 lg:col-span-7 flex flex-col justify-center min-w-0">
              <div className="font-mono text-[12px] md:text-[13px] text-[#00D2FF] tracking-widest mb-4">FOUNDER</div>
              <h2 className="font-orbitron text-[clamp(32px,4vw,48px)] leading-[1.1] font-bold mb-8 text-white">
                Building resilient security architectures for tomorrow.
              </h2>
              
              <div className="space-y-6 text-[16px] md:text-[17px] text-[var(--chrome)] leading-[1.6] max-w-[65ch]">
                <p>
                  Ashok Vallabhuni is a seasoned cybersecurity engineer, architect of the NISQ VANGUARD platform, and a frequent mentor at advanced security events. He specializes in designing resilient networks capable of withstanding state-sponsored and zero-day threats.
                </p>
                <p className="italic text-[#00D2FF]/80">
                  "Cybersecurity is not a product you buy, but an architecture you build. At NISQ VANGUARD, we engineer defensive systems designed to adapt and outsmart adversarial operations in highly complex environments."
                </p>
                <div className="pt-6 border-t border-[var(--line)]">
                  <div className="font-orbitron text-white text-xl font-medium tracking-wide">Ashok Vallabhuni</div>
                  <div className="font-mono text-[12px] md:text-[13px] text-[#00D2FF] tracking-widest mt-1">Founder & Chief Architect</div>
                </div>
              </div>
            </motion.div>
            
          </div>
        </SectionWrapper>

        {/* ==================== FRAME 4: LEADERSHIP ==================== */}
        <SectionWrapper id="leadership" className="lg:snap-center flex flex-col items-center text-center">
          <motion.div variants={itemVariants} className="w-full max-w-[880px] min-w-0">
            <div className="font-mono text-[12px] md:text-[13px] text-[var(--cyan)] tracking-widest mb-4">LEADERSHIP</div>
            <h2 className="font-orbitron text-[clamp(32px,4vw,48px)] leading-[1.1] font-bold mb-16">Command Center</h2>

            <div className="flex flex-col gap-6 w-full text-left">
              {[
                { name: "Varun Gajjala", role: "Co-Founder", avatar: null },
                { name: "Sannith Reddy", role: "Team Member", avatar: null }
              ].map((member, i) => (
                <motion.div 
                  key={i}
                  variants={itemVariants}
                  className="group flex flex-row items-center gap-6 p-6 border border-[var(--line)] bg-[var(--obsidian)]/50 hover:bg-[#00D2FF]/5 hover:border-[#00D2FF]/50 transition-colors duration-300 backdrop-blur-sm"
                >
                  <div className="w-16 h-16 shrink-0 bg-black border border-[var(--line)] group-hover:border-[#00D2FF] flex items-center justify-center text-[var(--chrome)] group-hover:text-[#00D2FF] transition-colors">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-[clamp(20px,3vw,24px)] font-semibold text-white">{member.name}</h3>
                    <div className="font-mono text-[12px] md:text-[13px] text-[#00D2FF] tracking-widest mt-1">{member.role}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={itemVariants} className="mt-16 pt-8 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h3 className="font-orbitron text-xl font-bold text-white">Join the NISQ VANGUARD</h3>
                <p className="text-[16px] text-[var(--chrome)] mt-1">We are always looking for elite operators.</p>
              </div>
              <CyberButton variant="secondary" to="/about">View Positions</CyberButton>
            </motion.div>
          </motion.div>
        </SectionWrapper>

        {/* ==================== FRAME 5: CTA ==================== */}
        <SectionWrapper id="cta" className="lg:snap-center flex flex-col items-center justify-center text-center">
          <motion.div variants={itemVariants} className="max-w-[65ch] w-full min-w-0">
            <h2 className="font-orbitron text-[clamp(32px,4vw,48px)] leading-[1.1] font-bold mb-6 text-white">
              Initiate Secure Operations
            </h2>
            <p className="text-[16px] md:text-[17px] text-[var(--chrome)] leading-[1.6] mb-10 mx-auto">
              Deploy our advanced defense architecture to protect your critical infrastructure.
            </p>
            {user ? (
              <CyberButton variant="primary" to="/dashboard">Access Dashboard</CyberButton>
            ) : (
              <CyberButton variant="primary" to="/login">Enter the NISQ VANGUARD</CyberButton>
            )}
          </motion.div>
        </SectionWrapper>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 1; }
          50% { top: 100%; opacity: 0; }
          100% { top: 0%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
