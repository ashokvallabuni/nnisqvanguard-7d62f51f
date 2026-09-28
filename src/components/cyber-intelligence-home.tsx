import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ShieldCheck,
  GraduationCap,
  Terminal,
  Radar,
  ArrowRight,
  Shield,
  Search,
  Lock,
  Globe,
  Users,
  Target
} from "lucide-react";
import founderImg from "@/assets/founder.jpeg";
import nisqLogo from "@/assets/nisq-logo.jpeg";

import { MotionValue } from "framer-motion";

const LayeredBadgeAnimation = ({ progress }: { progress: MotionValue<number> }) => {
  // Global slow push-in effect
  const globalScale = useTransform(progress, [0, 1], [1, 1.2]);

  // Helper to create staggered, round-trip depth animations based on scroll progress
  const useStaggeredDepth = (
    startOut: number, 
    endOut: number, 
    yOffset: number, 
    sOffset: number
  ) => {
    // Symmetrical timing for the reassembly phase
    const startIn = 1 - endOut;
    const endIn = 1 - startOut;
    
    return {
      y: useTransform(progress, [0, startOut, endOut, startIn, endIn, 1], [0, 0, yOffset, yOffset, 0, 0]),
      scale: useTransform(progress, [0, startOut, endOut, startIn, endIn, 1], [1, 1, sOffset, sOffset, 1, 1])
    };
  };

  // 1. Cube & Pins (Highest, earliest)
  const cube = useStaggeredDepth(0.0, 0.2, -150, 1.4);
  
  // 2. Lightning Bolt
  const bolt = useStaggeredDepth(0.05, 0.25, -90, 1.25);
  
  // 3. Wolf Head
  const wolf = useStaggeredDepth(0.1, 0.3, -40, 1.15);
  
  // 4. Shield
  const shield = useStaggeredDepth(0.15, 0.35, 0, 1.05);
  
  // 5. Arcs & 6. Disc (moving backwards)
  const arcs = useStaggeredDepth(0.2, 0.4, 40, 0.95);
  const disc = useStaggeredDepth(0.2, 0.4, 50, 0.93);
  
  // 7. Outer Ring (Furthest back, latest)
  const ring = useStaggeredDepth(0.25, 0.45, 100, 0.85);

  // Soft pulsing glow for the arcs
  const glowOpacity = useTransform(progress, (v) => 0.6 + Math.sin(v * 25) * 0.4);

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none overflow-hidden">
      <motion.div 
        style={{ scale: globalScale }} 
        className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px]"
      >
        {/* Layer 7: Ring */}
        <motion.img 
          src="/badge/layer-7-ring.png" 
          style={{ y: ring.y, scale: ring.scale }} 
          className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl" 
          alt="Badge Ring"
        />
        
        {/* Layer 6: Disc */}
        <motion.img 
          src="/badge/layer-6-disc.png" 
          style={{ y: disc.y, scale: disc.scale }} 
          className="absolute inset-0 w-full h-full object-contain drop-shadow-xl" 
          alt="Badge Disc"
        />

        {/* Layer 5: Glowing Arcs */}
        <motion.img 
          src="/badge/layer-5-arcs.png" 
          style={{ y: arcs.y, scale: arcs.scale, opacity: glowOpacity }} 
          className="absolute inset-0 w-full h-full object-contain" 
          alt="Glowing Arcs"
        />

        {/* Layer 4: Shield */}
        <motion.img 
          src="/badge/layer-4-shield.png" 
          style={{ y: shield.y, scale: shield.scale }} 
          className="absolute inset-0 w-full h-full object-contain drop-shadow-lg" 
          alt="Badge Shield"
        />

        {/* Layer 3: Wolf */}
        <motion.img 
          src="/badge/layer-3-wolf.png" 
          style={{ y: wolf.y, scale: wolf.scale }} 
          className="absolute inset-0 w-full h-full object-contain drop-shadow-md" 
          alt="Wolf Plate"
        />

        {/* Layer 2: Bolt */}
        <motion.img 
          src="/badge/layer-2-bolt.png" 
          style={{ y: bolt.y, scale: bolt.scale }} 
          className="absolute inset-0 w-full h-full object-contain drop-shadow-md" 
          alt="Lightning Bolt"
        />

        {/* Layer 1: Cube & Pins */}
        <motion.img 
          src="/badge/layer-1-cube.png" 
          style={{ y: cube.y, scale: cube.scale }} 
          className="absolute inset-0 w-full h-full object-contain drop-shadow-xl" 
          alt="Cube Core"
        />
      </motion.div>
    </div>
  );
};

export function CyberIntelligenceHome() {
  const targetRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });
  
  // We no longer need the number state since we pass the MotionValue directly
  // to LayeredBadgeAnimation to avoid React re-renders on scroll
  useEffect(() => {
    // Left empty or use for other global side-effects
  }, [scrollYProgress]);

  // Scroll Beats Transformations
  // 0-15% Hero Center
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);
  
  // 15-40% Left Threat
  const threatOpacity = useTransform(scrollYProgress, [0.15, 0.2, 0.35, 0.4], [0, 1, 1, 0]);
  const threatX = useTransform(scrollYProgress, [0.15, 0.2, 0.35, 0.4], [-50, 0, 0, -50]);

  // 40-65% Right Enterprise
  const entOpacity = useTransform(scrollYProgress, [0.4, 0.45, 0.6, 0.65], [0, 1, 1, 0]);
  const entX = useTransform(scrollYProgress, [0.4, 0.45, 0.6, 0.65], [50, 0, 0, 50]);

  // 65-85% Left Academy
  const acadOpacity = useTransform(scrollYProgress, [0.65, 0.7, 0.8, 0.85], [0, 1, 1, 0]);
  const acadX = useTransform(scrollYProgress, [0.65, 0.7, 0.8, 0.85], [-50, 0, 0, -50]);

  // 85-100% Center Final CTA
  const ctaOpacity = useTransform(scrollYProgress, [0.85, 0.9, 1], [0, 1, 1]);
  const ctaY = useTransform(scrollYProgress, [0.85, 0.9], [50, 0]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#05070D] text-white/60 font-sans selection:bg-[#2F9BFF] selection:text-white">
      
      {/* 400vh Scrollytelling Section */}
      <section ref={targetRef} className="relative h-[400vh] bg-[#05070D]">
        
        {/* Sticky Container */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          <LayeredBadgeAnimation progress={scrollYProgress} />
          
          {/* Subtle Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#8B3DFF]/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="absolute inset-0 max-w-7xl mx-auto px-6 lg:px-12 pointer-events-none">
            
            {/* 0-15% Hero */}
            <motion.div 
              style={{ opacity: heroOpacity, y: heroY }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
            >
              <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#2F9BFF] mb-4">NISQ Vanguard</h2>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white/90 mb-6 bg-gradient-to-b from-white to-[#2F9BFF]/60 bg-clip-text text-transparent">
                Defending the digital frontier.
              </h1>
              <p className="max-w-2xl text-lg md:text-xl text-white/60 font-light">
                Next-generation cybersecurity for infrastructure, AI systems, and the models that power them.
              </p>
            </motion.div>

            {/* 15-40% Threat */}
            <motion.div 
              style={{ opacity: threatOpacity, x: threatX }}
              className="absolute left-6 lg:left-12 inset-y-0 w-full max-w-md flex flex-col justify-center"
            >
              <h2 className="text-4xl font-bold tracking-tight text-white/90 mb-4 bg-gradient-to-b from-white to-[#2F9BFF]/60 bg-clip-text text-transparent">
                Built for threats that don't wait.
              </h2>
              <p className="text-lg text-white/60 font-light leading-relaxed">
                Attackers now target networks, cloud, and AI models alike. Layered defense that detects, contains, and responds in real time.
              </p>
            </motion.div>

            {/* 40-65% Enterprise */}
            <motion.div 
              style={{ opacity: entOpacity, x: entX }}
              className="absolute right-6 lg:right-12 inset-y-0 w-full max-w-md flex flex-col justify-center items-start md:items-end text-left md:text-right"
            >
              <h2 className="text-4xl font-bold tracking-tight text-white/90 mb-4 bg-gradient-to-b from-white to-[#8B3DFF]/60 bg-clip-text text-transparent">
                Enterprise protection,<br/>engineered end to end.
              </h2>
              <p className="text-lg text-white/60 font-light leading-relaxed mb-8">
                Consulting, security assessment, threat simulation, incident response, and AI/LLM security.
              </p>
              <Link to="/services" className="pointer-events-auto bg-gradient-to-r from-[#8B3DFF] to-[#2F9BFF] hover:opacity-90 text-white font-medium px-8 py-3 rounded-full transition-all shadow-[0_0_20px_rgba(47,155,255,0.3)]">
                Request a Demo
              </Link>
            </motion.div>

            {/* 65-85% Academy */}
            <motion.div 
              style={{ opacity: acadOpacity, x: acadX }}
              className="absolute left-6 lg:left-12 inset-y-0 w-full max-w-md flex flex-col justify-center"
            >
              <h2 className="text-4xl font-bold tracking-tight text-white/90 mb-4 bg-gradient-to-b from-white to-[#2F9BFF]/60 bg-clip-text text-transparent">
                Learn. Practice. Defend.
              </h2>
              <p className="text-lg text-white/60 font-light leading-relaxed mb-8">
                NISQ Academy courses and hands-on IVVAB Labs build elite defenders.
              </p>
              <div className="pointer-events-auto flex gap-4">
                <Link to="/academy" className="bg-[#1E2B40] border border-[#2F9BFF]/30 hover:border-[#2F9BFF] text-white px-6 py-3 rounded-full transition-all">
                  Explore Academy
                </Link>
                <Link to="/login" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full transition-all backdrop-blur-sm">
                  Sign Up
                </Link>
              </div>
            </motion.div>

            {/* 85-100% Final CTA */}
            <motion.div 
              style={{ opacity: ctaOpacity, y: ctaY }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
            >
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white/90 mb-8 bg-gradient-to-b from-white to-[#8B3DFF]/60 bg-clip-text text-transparent">
                Protect what matters.<br/>Report what threatens it.
              </h2>
              <div className="pointer-events-auto flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/services" className="bg-gradient-to-r from-[#8B3DFF] to-[#2F9BFF] text-white font-medium px-8 py-3 rounded-full shadow-[0_0_20px_rgba(47,155,255,0.3)]">
                  Request a Demo
                </Link>
                <Link to="/academy" className="bg-[#1E2B40] border border-[#2F9BFF]/30 text-white px-8 py-3 rounded-full">
                  Enroll in Academy
                </Link>
                <Link to="/reporting" className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-full hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all">
                  Report a Threat
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Founder & Mission */}
      <section className="py-32 bg-[#0A0F1A] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#8B3DFF]/20 to-[#2F9BFF]/20 blur-xl rounded-full opacity-50" />
            <img src={founderImg} alt="Founder" className="relative rounded-2xl w-full max-w-md mx-auto border border-white/10 grayscale hover:grayscale-0 transition-all duration-700" />
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#8B3DFF] mb-4">Founder & Mission</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-white/90 mb-6">Engineered for the next generation of threats.</h2>
            <p className="text-lg font-light leading-relaxed mb-8">
              "We built NISQ Vanguard to democratize defense. Whether you are securing enterprise infrastructure, auditing LLMs, or taking your first steps in cybersecurity, we provide the tools, intelligence, and education to protect what matters."
            </p>
            <p className="font-mono text-sm">— Ashok Vallabhuni</p>
          </div>
        </div>
      </section>

      {/* Services Cards */}
      <section className="py-32 bg-[#05070D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white/90 mb-6">Enterprise Services</h2>
            <p className="text-xl max-w-2xl mx-auto font-light">Comprehensive protection tailored for modern attack vectors.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "Cybersecurity Consulting", desc: "Strategic architecture and defense planning." },
              { icon: Target, title: "Security Assessment", desc: "Rigorous testing of infrastructure and AI models." },
              { icon: Radar, title: "Threat Simulation", desc: "Real-world red teaming and attack modeling." },
              { icon: Shield, title: "Incident Response", desc: "24/7 rapid containment and eradication." },
              { icon: Users, title: "Security Awareness", desc: "Transform your workforce into a human firewall." },
              { icon: GraduationCap, title: "College Programs", desc: "Building the next generation of cyber talent." }
            ].map((s, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-[#0A0F1A] border border-[#1E2B40] hover:border-[#2F9BFF]/50 transition-all duration-300">
                <s.icon className="w-8 h-8 text-[#2F9BFF] mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-medium text-white/90 mb-3">{s.title}</h3>
                <p className="font-light text-sm text-white/50">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academy & Labs */}
      <section className="py-32 bg-[#0A0F1A] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white/90 mb-6">NISQ Academy & IVVAB Labs</h2>
          <p className="text-xl max-w-2xl mx-auto font-light mb-16">Hands-on, containerized environments. Real threat data. Verified certification.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/academy" className="group block relative overflow-hidden rounded-3xl border border-[#1E2B40] bg-[#05070D] p-12 hover:border-[#8B3DFF]/50 transition-all text-left">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <GraduationCap className="w-32 h-32 text-[#8B3DFF]" />
              </div>
              <h3 className="text-2xl font-bold text-white/90 mb-4">Course Catalogue</h3>
              <p className="text-white/60 font-light mb-8 max-w-sm">From SOC Analyst fundamentals to advanced AI Security & LLM Defense.</p>
              <span className="inline-flex items-center text-[#8B3DFF] font-medium text-sm">Explore Courses <ArrowRight className="ml-2 w-4 h-4" /></span>
            </Link>
            
            <Link to="/cyber-range/labs" className="group block relative overflow-hidden rounded-3xl border border-[#1E2B40] bg-[#05070D] p-12 hover:border-[#2F9BFF]/50 transition-all text-left">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Terminal className="w-32 h-32 text-[#2F9BFF]" />
              </div>
              <h3 className="text-2xl font-bold text-white/90 mb-4">IVVAB Labs Spotlight</h3>
              <p className="text-white/60 font-light mb-8 max-w-sm">Isolated, real-world cyber ranges. Complete objectives, capture flags, and prove your skills.</p>
              <span className="inline-flex items-center text-[#2F9BFF] font-medium text-sm">Start a Lab <ArrowRight className="ml-2 w-4 h-4" /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* Threat Intelligence */}
      <section className="py-32 bg-[#05070D] border-t border-white/5 relative overflow-hidden">
        {/* Glow behind section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-4xl max-h-4xl bg-[#2F9BFF]/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <h2 className="text-3xl md:text-5xl font-bold text-white/90 mb-6">Threat Intelligence</h2>
            <p className="text-lg font-light leading-relaxed mb-8">
              Stay ahead of the curve. Our research team continuously monitors the cyber landscape to provide actionable insights, zero-day vulnerability reports, and AI infrastructure threat models.
            </p>
            <Link to="/intelligence" className="inline-flex items-center gap-2 bg-[#1E2B40] border border-[#2F9BFF]/30 text-white px-6 py-3 rounded-full hover:border-[#2F9BFF] transition-all">
              View Latest Reports <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "0-DAY VULNERABILITY", title: "LLM Prompt Injection via Exfiltration", date: "24 HOURS AGO" },
              { label: "THREAT ACTOR", title: "Operation Midnight Sun Analysis", date: "3 DAYS AGO" },
              { label: "MALWARE REPORT", title: "Quantum-Resistant Ransomware", date: "1 WEEK AGO" },
              { label: "INFRASTRUCTURE", title: "Supply Chain Attacks in CI/CD", date: "2 WEEKS AGO" }
            ].map((report, i) => (
              <Link key={i} to="/intelligence" className="group block bg-[#0A0F1A] border border-white/10 p-6 hover:border-[#2F9BFF]/40 rounded-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] text-[#2F9BFF] font-medium tracking-wider">{report.label}</span>
                  <span className="font-mono text-[10px] text-white/40">{report.date}</span>
                </div>
                <h3 className="text-white/80 font-medium group-hover:text-white transition-colors">{report.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 bg-[#0A0F1A] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white/90 mb-6">The Vanguard Team</h2>
            <p className="text-xl max-w-2xl mx-auto font-light">Defenders, architects, and educators united by mission.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { name: "Ashok Vallabhuni", role: "Founder · Chief Architect", bio: "Cyber Strategy & AI Security" },
              { name: "Varun Gajula", role: "Co-Founder", bio: "Product Vision & Growth" },
              { name: "Sannith Reddy", role: "Product Manager", bio: "Campus Programs & Brand Storytelling" }
            ].map((member, i) => (
              <div key={i} className="p-8">
                <div className="w-24 h-24 mx-auto rounded-full bg-[#1E2B40] mb-6 flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(47,155,255,0.1)]">
                  <span className="font-mono text-xl text-[#2F9BFF]">{member.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <h3 className="text-xl font-medium text-white/90 mb-2">{member.name}</h3>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#8B3DFF] mb-3">{member.role}</p>
                <p className="text-sm font-light text-white/50">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-32 bg-[#05070D] border-t border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#8B3DFF]/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white/90 mb-6">Ready to fortify your defenses?</h2>
          <p className="text-lg font-light text-white/60 mb-10 max-w-2xl mx-auto">
            Whether you need enterprise protection, team training, or a cyber awareness program for your college, we are ready to assist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-4 rounded-full transition-all">
              Contact Us
            </Link>
            <Link to="/services" className="bg-gradient-to-r from-[#8B3DFF] to-[#2F9BFF] text-white font-medium px-8 py-4 rounded-full hover:shadow-[0_0_20px_rgba(47,155,255,0.4)] transition-all">
              Request a Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer className="py-12 bg-[#05070D] border-t border-[#1E2B40]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={nisqLogo} alt="NISQ" className="w-8 h-8 rounded-md" />
            <span className="font-mono text-xs font-bold text-white/80">NISQ VANGUARD DEFENCE TECHNOLOGIES</span>
          </div>
          <div className="flex gap-6 text-sm font-light">
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/reporting" className="hover:text-white transition-colors">Report Threat</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
