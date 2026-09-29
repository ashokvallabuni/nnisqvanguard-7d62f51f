import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Shield, ShieldAlert, Target, Search, Lock, Zap, ChevronRight, Activity, Terminal, Crosshair, Cpu, Fingerprint, BookOpen, Users, ArrowRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import founderImg from "@/assets/founder.jpeg";

const FadeIn = ({ children, delay = 0, y = 20 }: { children: React.ReactNode, delay?: number, y?: number }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    {children}
  </motion.div>
);

export function CyberIntelligenceHome() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('hasEnteredVanguard') === 'true') {
      setHasEntered(true);
    }
  }, []);

  const handleEnter = () => {
    sessionStorage.setItem('hasEnteredVanguard', 'true');
    setHasEntered(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20;
      const y = (e.clientY / innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!hasEntered && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05070B] overflow-hidden"
          >
            {/* Background image for the intro screen */}
            <div className="absolute inset-0 z-0">
              <img 
                src="/hero-bg-new.png" 
                alt="NISQ Vanguard Intro Background" 
                className="w-full h-full object-cover opacity-40 mix-blend-screen"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-[#05070B]/80 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-8"
              >
                <div className="w-24 h-24 rounded-full border border-[#20D9F5]/30 bg-[#0D1220] flex items-center justify-center mb-6 mx-auto shadow-[0_0_30px_rgba(32,217,245,0.15)]">
                  <Shield className="w-10 h-10 text-[#20D9F5]" />
                </div>
                <h1 className="text-3xl md:text-5xl font-mono tracking-[0.2em] text-[#F4F3F1] font-bold">
                  NISQ VANGUARD
                </h1>
                <p className="text-[#A8B0BF] mt-4 max-w-md mx-auto text-sm md:text-base font-light tracking-wide uppercase">
                  Advanced Cyber Defence & Threat Intelligence
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                onClick={handleEnter}
                className="group flex items-center gap-3 bg-[#20D9F5] text-[#05070B] px-8 py-4 rounded-sm font-mono text-sm tracking-widest font-bold uppercase transition-all hover:bg-[#00CFEF] hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(32,217,245,0.3)]"
              >
                ENTER THE NISQ VANGUARD
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-[#05070B] text-[#F4F3F1] font-sans selection:bg-[#20D9F5]/30 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden pt-24 pb-16 bg-transparent">
        {/* Dynamic Parallax Background */}
        <motion.div 
          className="absolute inset-0 w-full h-full z-0"
          animate={{ x: mousePosition.x, y: mousePosition.y }}
          transition={{ type: "spring", stiffness: 40, damping: 30 }}
        >
          <div className="absolute inset-0 bg-[#05070B]" />
          <img 
            src="/hero-bg-new.png" 
            alt="NISQ Vanguard Background" 
            className="absolute inset-0 w-full h-full object-cover opacity-[0.85] scale-[1.05]"
          />
          {/* Subtle grid and glowing nodes */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#20283A_1px,transparent_1px),linear-gradient(to_bottom,#20283A_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070B]/70 via-[#05070B]/50 to-[#05070B]" />
        </motion.div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-start justify-center pt-[10vh]">
          <FadeIn>
            <div className="flex flex-col mb-4">
              <h2 className="font-mono text-sm sm:text-base md:text-lg uppercase tracking-[0.4em] text-[#20D9F5] font-semibold drop-shadow-[0_0_8px_rgba(32,217,245,0.4)]">
                NISQ VANGUARD
              </h2>
              <h3 className="font-mono text-xs sm:text-sm uppercase tracking-[0.2em] text-[#A8B0BF] mt-1">
                DEFENCE TECHNOLOGIES
              </h3>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.1}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#F4F3F1] pb-2 leading-[1.1] mb-6 flex flex-col">
              <span>SECURE TODAY.</span>
              <span className="text-[#A8B0BF]">DEFEND TOMORROW.</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20D9F5] to-[#F43F8F]">EMPOWER FOREVER.</span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <p className="max-w-2xl text-base sm:text-lg md:text-xl text-[#A8B0BF] font-light leading-relaxed mb-10">
              Advanced cybersecurity infrastructure, threat intelligence, and containerized defense environments for the quantum era.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/" className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center bg-[#20D9F5] hover:bg-[#00CFEF] text-[#05070B] px-8 py-4 rounded-sm transition-all duration-300 text-center font-mono text-sm tracking-widest uppercase font-bold shadow-[0_0_20px_rgba(32,217,245,0.3)] hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#20D9F5] focus:ring-offset-2 focus:ring-offset-[#05070B]">
                ENTER THE VANGUARD
              </Link>
              <Link to="/cyber-range/labs" className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center bg-transparent border border-[#20283A] hover:border-[#20D9F5]/50 hover:bg-[#20D9F5]/5 text-[#F4F3F1] px-8 py-4 rounded-sm transition-all duration-300 text-center font-mono text-sm tracking-widest uppercase hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#20D9F5] focus:ring-offset-2 focus:ring-offset-[#05070B]">
                EXPLORE IVVAB LABS
              </Link>
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="mt-16 pt-8 border-t border-[#20283A]/50 flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-[#20283A] shrink-0">
                  <img src={founderImg} alt="Ashok Vallabhuni" className="w-full h-full object-cover grayscale opacity-90" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F4F3F1]">Ashok Vallabhuni</p>
                  <p className="text-xs font-mono text-[#A8B0BF] uppercase tracking-wider">Founder / Chief Architect</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-[#20283A]" />
              <div className="flex gap-8">
                <div>
                  <p className="text-2xl font-bold text-[#F4F3F1]">1M+</p>
                  <p className="text-xs font-mono text-[#A8B0BF] uppercase tracking-wider">Threats Analyzed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#F4F3F1]">100%</p>
                  <p className="text-xs font-mono text-[#A8B0BF] uppercase tracking-wider">Isolated Labs</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 2. FOUR PILLARS */}
      <section className="py-24 bg-[#0A0D14] border-t border-[#20283A] relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl font-medium text-[#F4F3F1] mb-4">The Vanguard Pillars</h2>
              <p className="text-[#A8B0BF] font-light max-w-2xl text-lg">Comprehensive cyber defense methodologies integrated into a singular architecture.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "PROTECTION", icon: Shield, desc: "Proactive infrastructure hardening and resilient architecture design." },
              { title: "EDUCATION", icon: BookOpen, desc: "Enterprise academy delivering rigorous, verifiable cybersecurity training." },
              { title: "INTELLIGENCE", icon: Target, desc: "Actionable threat research and zero-day vulnerability tracking." },
              { title: "COMMUNITY", icon: Users, desc: "Cultivating the next generation of digital guardians and defenders." }
            ].map((pillar, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="group h-full p-8 bg-[#05070B] border border-[#20283A] hover:border-[#20D9F5]/40 transition-colors duration-500 flex flex-col">
                  <div className="w-12 h-12 mb-6 flex items-center justify-center bg-[#0D1220] border border-[#20283A] rounded-sm group-hover:border-[#20D9F5]/30 transition-colors">
                    <pillar.icon className="w-5 h-5 text-[#20D9F5]" />
                  </div>
                  <h3 className="text-lg font-mono tracking-widest text-[#F4F3F1] mb-3">{pillar.title}</h3>
                  <p className="text-sm font-light text-[#A8B0BF] leading-relaxed flex-grow">{pillar.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SIX MISSION AREAS */}
      <section className="py-24 bg-[#05070B] relative z-10 border-t border-[#20283A]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="mb-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-medium text-[#F4F3F1] mb-4">Mission Parameters</h2>
              <p className="text-[#A8B0BF] font-light max-w-2xl mx-auto text-lg">Strategic focus areas driving our defensive operations.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Network Forensics", icon: Activity, desc: "Deep packet inspection and anomaly detection across complex topographies." },
              { title: "AI Model Security", icon: Cpu, desc: "Defending neural networks from adversarial attacks and data poisoning." },
              { title: "Zero Trust Architecture", icon: Lock, desc: "Continuous verification and micro-segmentation deployment." },
              { title: "Quantum Resilience", icon: Zap, desc: "Post-quantum cryptographic readiness and infrastructure upgrades." },
              { title: "Identity Governance", icon: Fingerprint, desc: "Strict access controls, IAM audits, and privilege escalation prevention." },
              { title: "Offensive Security", icon: Crosshair, desc: "Authorized penetration testing and red-teaming simulations." }
            ].map((mission, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="group p-6 bg-[#0A0D14] border border-[#20283A] hover:bg-[#0D1220] transition-colors duration-300 flex items-start gap-4 h-full">
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-transparent border border-[#20D9F5]/20 rounded-sm">
                    <mission.icon className="w-4 h-4 text-[#20D9F5]" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-[#F4F3F1] mb-2">{mission.title}</h4>
                    <p className="text-sm font-light text-[#A8B0BF] leading-relaxed">{mission.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FOUNDER / LEADERSHIP SECTION */}
      <section className="py-24 bg-[#0A0D14] border-t border-[#20283A]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div className="order-2 lg:order-1">
                <h2 className="text-3xl sm:text-4xl font-medium text-[#F4F3F1] mb-6">Vision & Architecture</h2>
                <p className="text-lg text-[#A8B0BF] font-light leading-relaxed mb-6">
                  NISQ Vanguard was engineered to address the critical gap between theoretical cybersecurity education and the reality of modern, AI-augmented threat actors.
                </p>
                <p className="text-base text-[#A8B0BF] font-light leading-relaxed mb-10">
                  Our focus remains strictly on practical defense, resilient infrastructure design, and preparing organizations for the quantum horizon.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-[#05070B] border border-[#20283A] hover:border-[#20D9F5]/40 transition-colors">
                    <div className="w-12 h-12 rounded-sm bg-[#0D1220] border border-[#20D9F5]/30 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-[#20D9F5]" />
                    </div>
                    <div>
                      <h4 className="text-[#F4F3F1] font-medium">Ashok Vallabhuni</h4>
                      <p className="text-xs font-mono text-[#A8B0BF] uppercase tracking-widest">Founder · Chief Architect</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[#05070B] border border-[#20283A] hover:border-[#20D9F5]/40 transition-colors">
                    <div className="w-12 h-12 rounded-sm bg-[#0D1220] border border-[#20283A] flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-[#A8B0BF]" />
                    </div>
                    <div>
                      <h4 className="text-[#F4F3F1] font-medium">Varun Gajula</h4>
                      <p className="text-xs font-mono text-[#A8B0BF] uppercase tracking-widest">Co-Founder</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[#05070B] border border-[#20283A] hover:border-[#20D9F5]/40 transition-colors">
                    <div className="w-12 h-12 rounded-sm bg-[#0D1220] border border-[#20283A] flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-[#A8B0BF]" />
                    </div>
                    <div>
                      <h4 className="text-[#F4F3F1] font-medium">Sannith Reddy</h4>
                      <p className="text-xs font-mono text-[#A8B0BF] uppercase tracking-widest">CPO · Product Marketer</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.2} y={0}>
              <div className="order-1 lg:order-2 relative flex justify-center lg:justify-end">
                <div className="relative w-full max-w-sm aspect-[4/5] bg-[#0D1220] border border-[#20283A] p-2 shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#0A0D14_100%)] z-10 opacity-60" />
                  <img 
                    src={founderImg} 
                    alt="Ashok Vallabhuni" 
                    className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="absolute bottom-6 left-6 right-6 z-20 border-l-2 border-[#20D9F5] pl-4">
                    <p className="text-[#F4F3F1] font-medium text-lg">"Security is not a product, but a continuous process of verification."</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* PRE-FOOTER CTA */}
      <section className="py-32 bg-[#05070B] border-t border-[#20283A] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-[#20D9F5]/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#20D9F5_0%,transparent_50%)] opacity-5 pointer-events-none" />
        
        <FadeIn>
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl font-medium text-[#F4F3F1] mb-6 tracking-tight">Secure your infrastructure.</h2>
            <p className="text-lg text-[#A8B0BF] font-light mb-12">
              Enterprise protection, advanced team training, and vulnerability disclosure programs ready for deployment.
            </p>
            <Link to="/contact" className="min-h-[48px] inline-flex items-center justify-center bg-[#0D1220] border border-[#20283A] text-[#F4F3F1] font-mono text-sm tracking-widest uppercase px-10 py-4 rounded-sm hover:bg-[#20D9F5]/10 hover:border-[#20D9F5]/50 active:scale-95 transition-all duration-300">
              Initiate Consultation
            </Link>
          </div>
        </FadeIn>
      </section>
    </main>
    </>
  );
}
