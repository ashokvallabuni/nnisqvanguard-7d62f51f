import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { Shield, Target, Lock, Zap, Activity, Cpu, Fingerprint, BookOpen, Users, ArrowRight, ExternalLink, Mail, ArrowDown } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import founderImg from "@/assets/founder.jpeg";

const Logo3D = React.lazy(() => import('@/components/three/LogoBackground'));

// Easing for all entrances
const customEase = [0.22, 1, 0.36, 1];

const FadeIn = ({ children, delay = 0, y = 24 }: { children: React.ReactNode, delay?: number, y?: number }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay, ease: customEase }}
  >
    {children}
  </motion.div>
);

const SectionBridge = () => (
  <div className="w-full h-32 bg-gradient-to-b from-[var(--obsidian)] via-[var(--panel)] to-[var(--obsidian)] relative z-10 flex items-center justify-center">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_10%,transparent_100%)]"></div>
    <div className="w-full max-w-7xl px-12 border-t border-[var(--line)] shadow-[0_-1px_10px_rgba(32,217,245,0.05)]" />
  </div>
);

export function CyberIntelligenceHome() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasEntered, setHasEntered] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

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
      // Disable parallax on mobile
      if (window.innerWidth < 768) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 12; // 6-8px parallax
      const y = (e.clientY / innerHeight - 0.5) * 12;
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

      <main className="min-h-screen bg-[var(--obsidian)] text-[var(--chrome)] font-body selection:bg-[var(--cyan)]/30 selection:text-white">
        
        {/* Scroll Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--cyan)] origin-left z-50 shadow-[0_0_10px_var(--cyan)]"
          style={{ scaleX }}
        />

        {/* 1. HERO SECTION */}
        <section className="relative min-h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-transparent">
          {/* Dynamic Parallax Background */}
          <motion.div 
            className="absolute inset-0 w-full h-full z-0 pointer-events-none"
            animate={{ x: mousePosition.x, y: mousePosition.y }}
            transition={{ type: "spring", stiffness: 40, damping: 30 }}
          >
            <div className="absolute inset-0 bg-[var(--obsidian)]" />
            <motion.img 
              src="/hero-wolf.png" 
              alt="NISQ Vanguard Background" 
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              initial={{ scale: 1.0 }}
              animate={{ scale: 1.04 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
            />
            {/* Glowing Eyes overlay simulation via radial gradients and faint cyan circuit shimmer */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_45%,rgba(32,217,245,0.15)_0%,transparent_100%)] animate-pulse" />
            
            {/* Dark vignette blending into obsidian */}
            <div className="absolute inset-0 shadow-[inset_0_0_200px_100px_var(--obsidian)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--obsidian)]/40 to-[var(--obsidian)]" />
          </motion.div>
          
          {/* 3D Logo Background (Behind text, in front of hero-wolf) */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen hidden md:block">
            <Suspense fallback={null}>
              <Logo3D />
            </Suspense>
          </div>
          
          {/* Top/Middle Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-[25vh] flex-grow flex flex-col items-center text-center">
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
              <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[var(--chrome)]/80 font-mono font-light leading-relaxed mb-8">
                Advanced cybersecurity infrastructure, threat intelligence, and containerized defense environments for the quantum era.
              </p>
            </FadeIn>
            
            {/* Trust Badges / Stats */}
            <FadeIn delay={0.3}>
              <div className="flex gap-8 justify-center items-center border border-[var(--line)] bg-[var(--panel)]/50 backdrop-blur-sm px-6 py-3 rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                 <div className="text-left">
                   <div className="font-mono text-[var(--cyan)] font-bold text-lg">1M+</div>
                   <div className="font-mono text-[10px] text-[var(--chrome)]/60 tracking-widest uppercase">Threats Analyzed</div>
                 </div>
                 <div className="w-px h-8 bg-[var(--line)]" />
                 <div className="text-left">
                   <div className="font-mono text-[var(--cyan)] font-bold text-lg">100%</div>
                   <div className="font-mono text-[10px] text-[var(--chrome)]/60 tracking-widest uppercase">Isolated Labs</div>
                 </div>
              </div>
            </FadeIn>
          </div>

          {/* Bottom CTA Area */}
          <div className="relative z-10 w-full pb-[10vh] flex flex-col items-center">
            <FadeIn delay={0.4} y={10}>
              <div className="flex flex-col sm:flex-row gap-4 w-full px-6 sm:w-auto">
                <Link to="/login" className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center bg-[var(--cyan)] hover:bg-[#00CFEF] hover:shadow-[0_0_25px_rgba(32,217,245,0.4)] text-[var(--obsidian)] px-10 py-4 rounded-sm transition-all duration-300 text-center font-mono text-sm tracking-widest uppercase font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--cyan)] active:scale-[0.98] -translate-y-1 hover:-translate-y-2">
                  ENTER THE VANGUARD
                </Link>
                <Link to="/cyber-range/labs" className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center bg-transparent border border-[var(--line)] hover:border-[var(--cyan)]/50 hover:bg-[var(--cyan)]/5 text-[var(--chrome)] px-10 py-4 rounded-sm transition-all duration-300 text-center font-mono text-sm tracking-widest uppercase active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--obsidian)]">
                  EXPLORE IVVAB LABS
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.6}>
              <div className="mt-12 animate-bounce opacity-50">
                <ArrowDown className="w-5 h-5 text-[var(--cyan)]" />
              </div>
            </FadeIn>
          </div>
        </section>

        <SectionBridge />

        {/* 2. SERVICES & PILLARS (Bento Grid) */}
        <section className="py-24 bg-[var(--obsidian)] relative z-10">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-6">
            <FadeIn>
              <div className="mb-12 border-b border-[var(--line)] pb-4 flex items-end justify-between">
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

            <div className="grid grid-cols-1 md:grid-cols-8 gap-6">
              {[
                { title: "PROTECTION", span: "md:col-span-4", icon: Shield, desc: "Proactive infrastructure hardening and resilient architecture design." },
                { title: "EDUCATION", span: "md:col-span-4", icon: BookOpen, desc: "Enterprise academy delivering rigorous, verifiable cybersecurity training." },
                { title: "INTELLIGENCE", span: "md:col-span-3", icon: Target, desc: "Actionable threat research and zero-day vulnerability tracking." },
                { title: "COMMUNITY", span: "md:col-span-5", icon: Users, desc: "Cultivating the next generation of digital guardians and defenders." }
              ].map((pillar, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className={`group h-full p-8 bg-[var(--panel)] border border-[var(--line)] hover:border-[var(--cyan)]/40 hover:shadow-[inset_0_0_30px_rgba(32,217,245,0.05)] transition-all duration-500 flex flex-col relative overflow-hidden ${pillar.span}`}>
                    {/* Corner Ticks (HUD style) */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-transparent group-hover:border-[var(--cyan)]/50 transition-colors m-2" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-transparent group-hover:border-[var(--cyan)]/50 transition-colors m-2" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-transparent group-hover:border-[var(--cyan)]/50 transition-colors m-2" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-transparent group-hover:border-[var(--cyan)]/50 transition-colors m-2" />
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 flex items-center justify-center bg-[var(--obsidian)] border border-[var(--line)] rounded-sm group-hover:border-[var(--cyan)]/30 transition-colors">
                        <pillar.icon className="w-5 h-5 text-[var(--cyan)]" />
                      </div>
                      <div className="font-mono text-[10px] text-[var(--chrome)]/40">SYS.OP.0{i+1}</div>
                    </div>
                    <h3 className="text-xl font-display font-semibold tracking-wide text-[var(--chrome)] mb-3">{pillar.title}</h3>
                    <p className="text-sm font-mono font-light text-[var(--chrome)]/70 leading-relaxed flex-grow">{pillar.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <SectionBridge />

        {/* 3. FOUNDER (Editorial Dossier) */}
        <section className="py-24 bg-[var(--panel)] border-y border-[var(--line)] relative overflow-hidden">
          {/* Subtle Background Elements */}
          <div className="absolute right-0 top-0 w-1/3 h-full bg-[radial-gradient(ellipse_at_right,var(--violet)_0%,transparent_70%)] opacity-5" />
          
          <div className="max-w-[1280px] mx-auto px-6 lg:px-6">
            <FadeIn>
              <div className="font-mono text-xs text-[var(--chrome)]/50 mb-12 tracking-widest">// 03 ORIGIN</div>
            </FadeIn>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
              
              {/* Image Side (Asymmetric) */}
              <div className="lg:col-span-5 relative order-2 lg:order-1">
                <FadeIn delay={0.2}>
                  <div className="relative aspect-[3/4] bg-[var(--obsidian)] p-3 border border-[var(--line)] shadow-2xl group">
                    <div className="absolute inset-0 border border-[var(--cyan)]/20 scale-105 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 pointer-events-none" />
                    
                    {/* Corner Brackets */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-[var(--cyan)] z-10" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-[var(--cyan)] z-10" />
                    
                    <div className="w-full h-full relative overflow-hidden bg-[#0D1220]">
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--obsidian)] via-transparent to-transparent z-10 opacity-80" />
                      <img 
                        src={founderImg} 
                        alt="Ashok Vallabhuni - Founder & Chief Architect" 
                        className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 hover:scale-105 transition-all duration-1000"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  </div>
                </FadeIn>
              </div>

              {/* Content Side (Editorial) */}
              <div className="lg:col-span-7 order-1 lg:order-2">
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
                    <p className="text-lg font-mono font-light text-[var(--chrome)]/80 leading-relaxed border-l-2 border-[var(--line)] pl-6">
                      NISQ Vanguard was engineered to address the critical gap between theoretical cybersecurity education and the reality of modern, AI-augmented threat actors. Our architecture focuses strictly on practical defense, resilient infrastructure, and quantum horizon readiness.
                    </p>
                    
                    <div className="grid grid-cols-3 gap-6 pt-6 mt-6 border-t border-[var(--line)]">
                      <div>
                        <div className="font-display text-2xl font-bold text-[var(--chrome)]">15+</div>
                        <div className="font-mono text-xs text-[var(--chrome)]/50 tracking-widest mt-1">YRS ENG</div>
                      </div>
                      <div>
                        <div className="font-display text-2xl font-bold text-[var(--chrome)]">ISO</div>
                        <div className="font-mono text-xs text-[var(--chrome)]/50 tracking-widest mt-1">27001 ADVISOR</div>
                      </div>
                      <div>
                        <div className="font-display text-2xl font-bold text-[var(--chrome)]">0-DAY</div>
                        <div className="font-mono text-xs text-[var(--chrome)]/50 tracking-widest mt-1">RESEARCH</div>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 flex items-center gap-6">
                      <div>
                        <h4 className="text-[var(--chrome)] font-display font-semibold text-xl">Ashok Vallabhuni</h4>
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
        <section className="py-24 bg-[var(--obsidian)] relative z-10">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-6">
            <FadeIn>
              <div className="mb-12 border-b border-[var(--line)] pb-4 flex items-end justify-between">
                <div>
                  <div className="font-mono text-xs text-[var(--chrome)]/50 mb-2 tracking-widest">// 04 LEADERSHIP ROSTER</div>
                  <h2 className="text-3xl sm:text-4xl font-display text-[var(--chrome)] font-semibold">Command Center</h2>
                </div>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Varun Gajula", role: "Co-Founder", focus: "Product Vision & Growth" },
                { name: "Sannith Reddy", role: "CPO · Product Marketer", focus: "Campus Programs & Storytelling" }
              ].map((member, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="group p-6 bg-[var(--panel)] border border-[var(--line)] hover:border-[var(--cyan)]/40 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-20 h-20 bg-[var(--obsidian)] border border-[var(--line)] rounded-sm mb-6 flex items-center justify-center relative overflow-hidden group-hover:border-[var(--cyan)]/30">
                      <Users className="w-8 h-8 text-[var(--chrome)]/30" />
                      <div className="absolute inset-0 bg-[var(--cyan)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="mb-4">
                      <h4 className="text-lg font-display font-semibold text-[var(--chrome)] mb-1">{member.name}</h4>
                      <div className="inline-flex items-center gap-2 px-2 py-1 bg-[var(--obsidian)] border border-[var(--line)] rounded-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)]" />
                        <span className="font-mono text-[10px] text-[var(--chrome)]/80 tracking-wider uppercase">{member.role}</span>
                      </div>
                    </div>
                    <p className="font-mono text-xs text-[var(--chrome)]/60 pt-4 border-t border-[var(--line)]">
                      FOCUS: {member.focus}
                    </p>
                    <div className="flex gap-3 mt-6">
                      <button className="w-8 h-8 rounded-sm bg-[var(--obsidian)] border border-[var(--line)] hover:border-[var(--cyan)]/50 flex items-center justify-center transition-colors">
                        <Mail className="w-4 h-4 text-[var(--chrome)]/70" />
                      </button>
                      <button className="w-8 h-8 rounded-sm bg-[var(--obsidian)] border border-[var(--line)] hover:border-[var(--cyan)]/50 flex items-center justify-center transition-colors">
                        <ExternalLink className="w-4 h-4 text-[var(--chrome)]/70" />
                      </button>
                    </div>
                  </div>
                </FadeIn>
              ))}
              
              {/* Hiring / Open Position Card */}
              <FadeIn delay={0.2}>
                <div className="h-full p-6 bg-[var(--obsidian)] border border-dashed border-[var(--line)] hover:border-[var(--cyan)]/30 transition-all duration-300 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 cursor-pointer">
                  <div className="w-12 h-12 rounded-full border border-[var(--line)] flex items-center justify-center mb-4">
                     <span className="text-[var(--chrome)] font-mono">+</span>
                  </div>
                  <h4 className="font-mono text-sm tracking-widest text-[var(--chrome)] uppercase mb-2">Open Requisitions</h4>
                  <p className="text-xs font-mono text-[var(--chrome)]/50">Join the Vanguard</p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* PRE-FOOTER CTA */}
        <section className="py-32 bg-[var(--obsidian)] border-t border-[var(--line)] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-[var(--cyan)]/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--cyan)_0%,transparent_60%)] opacity-[0.03] pointer-events-none" />
          
          <FadeIn>
            <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-[var(--chrome)] mb-6 tracking-tight">Secure your infrastructure.</h2>
              <p className="text-lg font-mono text-[var(--chrome)]/60 font-light mb-12">
                Enterprise protection, advanced team training, and vulnerability disclosure programs ready for deployment.
              </p>
              <Link to="/contact" className="min-h-[48px] inline-flex items-center justify-center bg-[var(--panel)] border border-[var(--line)] text-[var(--chrome)] font-mono text-sm tracking-widest uppercase px-12 py-4 rounded-sm hover:bg-[var(--cyan)]/10 hover:border-[var(--cyan)]/50 active:scale-95 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)]">
                Initiate Consultation
              </Link>
            </div>
          </FadeIn>
        </section>
      </main>
    </>
  );
}
