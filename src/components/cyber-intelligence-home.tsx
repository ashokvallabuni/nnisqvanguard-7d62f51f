import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Shield, Target, BookOpen, Users, ArrowRight, ExternalLink, Mail, ArrowDown } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import founderImg from "@/assets/founder.jpeg";
import { BackgroundStage } from './BackgroundStage';
import { HUDOverlay } from './HUDOverlay';

// Easing for all entrances
const customEase = [0.22, 1, 0.36, 1];

const FadeIn = ({ children, delay = 0, y = 24 }: { children: React.ReactNode, delay?: number, y?: number }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay, ease: customEase }}
    className="h-full flex flex-col"
  >
    {children}
  </motion.div>
);

const SectionBridge = () => (
  <div className="w-full h-32 relative z-10 flex items-center justify-center pointer-events-none">
    <div className="w-full max-w-7xl px-12 border-t border-[var(--line)] shadow-[0_-1px_10px_rgba(32,217,245,0.05)]" />
  </div>
);

export function CyberIntelligenceHome() {
  const [hasEntered, setHasEntered] = useState(false);
  
  // Use scroll with window for full page scroll tracking
  const { scrollYProgress } = useScroll();
  const smoothScrollY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    if (sessionStorage.getItem('hasEnteredVanguard') === 'true') {
      setHasEntered(true);
    }
  }, []);

  const handleEnter = () => {
    sessionStorage.setItem('hasEnteredVanguard', 'true');
    setHasEntered(true);
  };

  return (
    <>
      <AnimatePresence>
        {!hasEntered && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8, ease: customEase }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--obsidian)] overflow-hidden"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src="/intro-bg.png" 
                alt="NISQ Vanguard Intro Background" 
                className="w-full h-full object-cover opacity-60 mix-blend-screen"
                onError={(e) => { e.currentTarget.src = '/hero-bg-new.png'; }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--obsidian)_80%)]" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-8"
              >
                <h1 className="text-4xl md:text-6xl font-display tracking-[0.2em] text-[var(--chrome)] font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  NISQ VANGUARD
                </h1>
                <p className="text-[var(--chrome)]/70 mt-4 max-w-md mx-auto text-sm md:text-base font-mono font-light tracking-wide uppercase">
                  Advanced Cyber Defence & Threat Intelligence
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                onClick={handleEnter}
                className="group flex items-center gap-3 bg-[var(--cyan)] text-[var(--obsidian)] px-8 py-4 rounded-sm font-mono text-sm tracking-widest font-bold uppercase transition-all hover:bg-[#00CFEF] hover:scale-98 active:scale-95 shadow-[0_0_20px_rgba(32,217,245,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--cyan)] focus-visible:ring-offset-[var(--obsidian)] min-h-[48px]"
              >
                ENTER THE NISQ VANGUARD
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-transparent text-[var(--chrome)] font-body selection:bg-[var(--cyan)]/30 selection:text-white relative">
        
        <BackgroundStage scrollYProgress={scrollYProgress} />
        <HUDOverlay scrollYProgress={smoothScrollY} />

        {/* 1. HERO SECTION */}
        <section data-frame="1" className="relative min-h-[100dvh] w-full flex flex-col justify-center items-center z-10 pt-20">
          <div className="w-full max-w-[1280px] mx-auto px-6 grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-6">
            <div className="col-span-4 md:col-span-8 lg:col-span-10 lg:col-start-2 text-center">
              <FadeIn>
                <h2 className="font-mono text-sm uppercase tracking-[0.4em] text-[var(--cyan)] font-semibold drop-shadow-[0_0_8px_rgba(32,217,245,0.4)] mb-2">
                  // 01 HERO
                </h2>
              </FadeIn>
              
              <FadeIn delay={0.1}>
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-bold tracking-tight text-[var(--chrome)] pb-2 leading-[1.1] mb-6 drop-shadow-2xl">
                  SECURE TODAY.<br/>
                  <span className="text-[var(--chrome)]/70">DEFEND TOMORROW.</span><br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--cyan)] to-[var(--violet)]">EMPOWER FOREVER.</span>
                </h1>
              </FadeIn>
              
              <FadeIn delay={0.2}>
                <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[var(--chrome)]/80 font-mono font-light leading-relaxed mb-12">
                  Advanced cybersecurity infrastructure, threat intelligence, and containerized defense environments for the quantum era.
                </p>
              </FadeIn>
              
              <FadeIn delay={0.4} y={10}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link to="/login" className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center bg-[var(--cyan)] hover:bg-[#00CFEF] hover:shadow-[0_0_25px_rgba(32,217,245,0.4)] text-[var(--obsidian)] px-10 py-4 rounded-sm transition-all duration-300 text-center font-mono text-sm tracking-widest uppercase font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--cyan)] active:scale-[0.98] -translate-y-1 hover:-translate-y-2">
                    ENTER THE VANGUARD
                  </Link>
                  <Link to="/cyber-range/labs" className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center bg-[var(--obsidian)]/50 border border-[var(--line)] hover:border-[var(--cyan)]/50 hover:bg-[var(--cyan)]/10 text-[var(--chrome)] px-10 py-4 rounded-sm transition-all duration-300 text-center font-mono text-sm tracking-widest uppercase active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--obsidian)] backdrop-blur-sm">
                    EXPLORE IVVAB LABS
                  </Link>
                </div>
              </FadeIn>
              <FadeIn delay={0.6}>
                <div className="mt-16 animate-bounce opacity-50 flex justify-center">
                  <ArrowDown className="w-5 h-5 text-[var(--cyan)]" />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        <SectionBridge />

        {/* 2. SERVICES & PILLARS */}
        <section data-frame="2" className="py-32 relative z-10 min-h-[100dvh] flex flex-col justify-center">
          <div className="w-full max-w-[1280px] mx-auto px-6">
            <FadeIn>
              <div className="mb-16 border-b border-[var(--line)] pb-4 flex items-end justify-between">
                <div>
                  <div className="font-mono text-xs text-[var(--chrome)]/50 mb-2 tracking-widest">// 02 SERVICES</div>
                  <h2 className="text-3xl sm:text-4xl font-display text-[var(--chrome)] font-semibold">Vanguard Infrastructure</h2>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--cyan)] animate-pulse" />
                  <span className="font-mono text-xs text-[var(--chrome)]/70 uppercase tracking-widest">System Active</span>
                </div>
              </div>
            </FadeIn>

            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-6 items-stretch">
              {[
                { title: "PROTECTION", span: "col-span-4 md:col-span-4 lg:col-span-3", icon: Shield, desc: "Proactive infrastructure hardening and resilient architecture design." },
                { title: "EDUCATION", span: "col-span-4 md:col-span-4 lg:col-span-3", icon: BookOpen, desc: "Enterprise academy delivering rigorous, verifiable cybersecurity training." },
                { title: "INTELLIGENCE", span: "col-span-4 md:col-span-4 lg:col-span-3", icon: Target, desc: "Actionable threat research and vulnerability tracking." },
                { title: "COMMUNITY", span: "col-span-4 md:col-span-4 lg:col-span-3", icon: Users, desc: "Cultivating the next generation of digital guardians and defenders." }
              ].map((pillar, i) => (
                <div key={i} className={`${pillar.span} flex h-full`}>
                  <FadeIn delay={i * 0.1}>
                    <div className="group h-full w-full p-8 bg-[var(--panel)] border border-[var(--line)] hover:border-[var(--cyan)] hover:shadow-[inset_0_0_30px_rgba(32,217,245,0.1)] transition-all duration-300 flex flex-col relative overflow-hidden transform hover:-translate-y-2">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-transparent group-hover:border-[var(--cyan)]/80 transition-colors m-2" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-transparent group-hover:border-[var(--cyan)]/80 transition-colors m-2" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-transparent group-hover:border-[var(--cyan)]/80 transition-colors m-2" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-transparent group-hover:border-[var(--cyan)]/80 transition-colors m-2" />
                      
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 flex items-center justify-center bg-[var(--obsidian)] border border-[var(--line)] rounded-sm group-hover:border-[var(--cyan)] group-hover:text-[var(--cyan)] transition-colors">
                          <pillar.icon className="w-5 h-5 text-[var(--chrome)] group-hover:text-[var(--cyan)] transition-colors" />
                        </div>
                        <div className="font-mono text-[10px] text-[var(--chrome)]/40 group-hover:text-[var(--cyan)]/70 transition-colors">SYS.OP.0{i+1}</div>
                      </div>
                      <h3 className="text-xl font-display font-semibold tracking-wide text-[var(--chrome)] mb-3 group-hover:text-white transition-colors">{pillar.title}</h3>
                      <p className="text-sm font-mono font-light text-[var(--chrome)]/70 leading-relaxed flex-grow">{pillar.desc}</p>
                    </div>
                  </FadeIn>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SectionBridge />

        {/* 3. FOUNDER (Editorial Dossier) */}
        <section data-frame="3" className="py-32 relative z-10 min-h-[100dvh] flex flex-col justify-center">
          <div className="w-full max-w-[1280px] mx-auto px-6">
            <FadeIn>
              <div className="font-mono text-xs text-[var(--chrome)]/50 mb-12 tracking-widest">// 03 ORIGIN</div>
            </FadeIn>
            
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
              <div className="col-span-4 md:col-span-8 lg:col-span-5 relative order-2 lg:order-1">
                <FadeIn delay={0.2}>
                  <div className="relative aspect-[3/4] bg-[var(--panel)] p-3 border border-[var(--line)] shadow-2xl group mx-auto max-w-[400px] lg:max-w-none">
                    <div className="absolute inset-0 border border-[var(--cyan)]/30 scale-105 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 pointer-events-none" />
                    
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-[var(--cyan)] z-10" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-[var(--cyan)] z-10" />
                    
                    <div className="w-full h-full relative overflow-hidden bg-[#0D1220]">
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--obsidian)] via-transparent to-transparent z-10 opacity-80" />
                      <img 
                        src={founderImg} 
                        alt="Ashok Vallabuni - Founder & Chief Architect" 
                        className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 hover:scale-105 transition-all duration-1000"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  </div>
                </FadeIn>
              </div>

              <div className="col-span-4 md:col-span-8 lg:col-span-7 order-1 lg:order-2">
                <FadeIn delay={0.3}>
                  <h3 className="text-[var(--cyan)] font-mono text-sm tracking-widest mb-4 uppercase">Founder Dossier</h3>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-[var(--chrome)] mb-8 leading-[1.1]">
                    <span className="block overflow-hidden"><motion.span className="block" initial={{ y: "100%" }} whileInView={{ y: 0 }} transition={{ duration: 0.6, ease: customEase }}>"Security is not a</motion.span></span>
                    <span className="block overflow-hidden"><motion.span className="block text-[var(--chrome)]/50" initial={{ y: "100%" }} whileInView={{ y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: customEase }}>product, but a continuous</motion.span></span>
                    <span className="block overflow-hidden"><motion.span className="block" initial={{ y: "100%" }} whileInView={{ y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: customEase }}>process of verification."</motion.span></span>
                  </h2>
                </FadeIn>
                
                <FadeIn delay={0.4}>
                  <div className="flex flex-col gap-6">
                    <p className="text-lg font-mono font-light text-[var(--chrome)]/80 leading-relaxed border-l-2 border-[var(--cyan)] pl-6 bg-gradient-to-r from-[var(--cyan)]/5 to-transparent py-4">
                      NISQ Vanguard was engineered to address the critical gap between theoretical cybersecurity education and the reality of modern, AI-augmented threat actors. Our architecture focuses strictly on practical defense, resilient infrastructure, and quantum horizon readiness.
                    </p>
                    
                    <div className="mt-8 pt-8 flex items-center gap-6 border-t border-[var(--line)]">
                      <div>
                        <h4 className="text-[var(--chrome)] font-display font-semibold text-xl">Ashok Vallabuni</h4>
                        <p className="text-xs font-mono text-[var(--cyan)] uppercase tracking-widest mt-1">Founder · Chief Architect</p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        {/* 4. TEAM DIRECTORY */}
        <section data-frame="4" className="py-32 relative z-10 min-h-[100dvh] flex flex-col justify-center bg-[var(--obsidian)]/80 backdrop-blur-md border-y border-[var(--line)]">
          <div className="w-full max-w-[1280px] mx-auto px-6">
            <FadeIn>
              <div className="mb-16 border-b border-[var(--line)] pb-4 flex items-end justify-between">
                <div>
                  <div className="font-mono text-xs text-[var(--chrome)]/50 mb-2 tracking-widest">// 04 LEADERSHIP ROSTER</div>
                  <h2 className="text-3xl sm:text-4xl font-display text-[var(--chrome)] font-semibold">Command Center</h2>
                </div>
              </div>
            </FadeIn>

            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-6 justify-center">
              {[
                { name: "Varun Gajula", role: "Co-Founder" },
                { name: "Sannith Reddy", role: "Accountant" }
              ].map((member, i) => (
                <div key={i} className="col-span-4 md:col-span-4 lg:col-span-4 lg:col-start-[calc(3+i*4)]">
                  <FadeIn delay={i * 0.2}>
                    <div className="group p-8 bg-[var(--panel)] border border-[var(--line)] hover:border-[var(--cyan)] hover:shadow-[0_10px_40px_-10px_rgba(32,217,245,0.2)] hover:-translate-y-2 transition-all duration-500 h-full flex flex-col items-center text-center">
                      <div className="w-24 h-24 bg-[var(--obsidian)] border border-[var(--line)] rounded-sm mb-6 flex items-center justify-center relative overflow-hidden group-hover:border-[var(--cyan)] transition-colors">
                        <Users className="w-10 h-10 text-[var(--chrome)]/30 group-hover:text-[var(--cyan)] transition-colors" />
                        
                        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-transparent group-hover:border-[var(--cyan)] transition-colors m-1" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-transparent group-hover:border-[var(--cyan)] transition-colors m-1" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-transparent group-hover:border-[var(--cyan)] transition-colors m-1" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-transparent group-hover:border-[var(--cyan)] transition-colors m-1" />
                        
                        <div className="absolute inset-0 bg-[var(--cyan)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="mb-4">
                        <h4 className="text-xl font-display font-semibold text-[var(--chrome)] mb-2 group-hover:text-white transition-colors">{member.name}</h4>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--obsidian)] border border-[var(--line)] rounded-sm group-hover:border-[var(--cyan)]/30 transition-colors">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)]" />
                          <span className="font-mono text-xs text-[var(--chrome)]/80 tracking-wider uppercase">{member.role}</span>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. PRE-FOOTER CTA */}
        <section data-frame="5" className="py-32 relative z-10 min-h-[60dvh] flex flex-col justify-center">
          <FadeIn>
            <div className="w-full max-w-3xl mx-auto px-6 text-center">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-[var(--chrome)] mb-6 tracking-tight">Secure your infrastructure.</h2>
              <p className="text-lg font-mono text-[var(--chrome)]/60 font-light mb-12">
                Enterprise protection, advanced team training, and vulnerability disclosure programs ready for deployment.
              </p>
              <Link to="/contact" className="min-h-[48px] inline-flex items-center justify-center bg-[var(--panel)] border border-[var(--line)] text-[var(--chrome)] font-mono text-sm tracking-widest uppercase px-12 py-4 rounded-sm hover:bg-[var(--cyan)] hover:text-[var(--obsidian)] hover:border-[var(--cyan)] hover:shadow-[0_0_20px_rgba(32,217,245,0.4)] active:scale-95 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)] font-bold">
                Initiate Consultation
              </Link>
            </div>
          </FadeIn>
        </section>
      </main>
    </>
  );
}
