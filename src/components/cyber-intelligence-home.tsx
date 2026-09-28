import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
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
import { motion, useScroll, useTransform } from "framer-motion";
import founderImg from "@/assets/founder.jpeg";
import nisqLogo from "@/assets/nisq-logo.jpeg";

export function CyberIntelligenceHome() {
  const { scrollY } = useScroll();
  
  // Parallax and Cross-fade effects
  const bgY = useTransform(scrollY, [0, 1000], ["0%", "30%"]);
  const bgScale = useTransform(scrollY, [0, 1000], [1, 1.05]);
  const contentY = useTransform(scrollY, [0, 500], [0, -50]);
  const contentOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  
  // Cross-fade opacity between the two images
  const image1Opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const image2Opacity = useTransform(scrollY, [0, 400], [0, 1]);
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#05070D] text-white/60 font-sans selection:bg-[#2F9BFF] selection:text-white">
      
      {/* New Hero Section */}
      <section className="relative min-h-[100vh] w-full flex items-center justify-center overflow-hidden pt-24 pb-16 bg-[#05070D]">
        
        {/* Parallax Background Container */}
        <motion.div 
          className="absolute inset-0 w-full h-full -z-20 bg-black"
          style={{ y: bgY, scale: bgScale }}
        >
          {/* First Image: Starting Background (Dark Wolf) */}
          <motion.img 
            src="/hero-bg-1.png" 
            alt="NISQ Vanguard Startup" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
            style={{ opacity: image1Opacity }}
          />
          {/* Second Image: Scroll Background (Logo Badge) */}
          <motion.img 
            src="/hero-bg-2.png" 
            alt="NISQ Vanguard Logo" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
            style={{ opacity: image2Opacity }}
          />
        </motion.div>
        
        {/* Advanced Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none -z-10"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        {/* Dark gradient overlay for text readability at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05070D]/40 via-[#05070D]/60 to-[#05070D] -z-10"></div>
        
        {/* Content Container */}
        <motion.div 
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center pt-[35vh] pb-12"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 pb-2 drop-shadow-2xl">
            Defending the<br/>digital frontier.
          </h1>
          
          <p className="max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl text-white/60 font-light leading-relaxed mt-6">
            Next-generation cybersecurity for infrastructure, AI systems, and the models that power them.
          </p>

          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#8B3DFF] to-[#2F9BFF] mt-8 pb-2">
            Protect what matters. Report what threatens it.
          </h3>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 mt-12 pt-6">
            <Link to="/services" className="w-full sm:w-auto bg-gradient-to-r from-[#8B3DFF] to-[#2F9BFF] text-white font-medium px-8 py-4 rounded-full shadow-[0_0_30px_rgba(47,155,255,0.3)] hover:shadow-[0_0_50px_rgba(47,155,255,0.5)] hover:scale-105 transition-all duration-300 text-center">
              Request a Demo
            </Link>
            <Link to="/academy" className="w-full sm:w-auto bg-[#1E2B40] border border-[#2F9BFF]/30 hover:border-[#2F9BFF] text-white px-8 py-4 rounded-full hover:bg-[#1E2B40]/80 hover:scale-105 transition-all duration-300 text-center">
              Enroll in Academy
            </Link>
            <Link to="/reporting" className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 hover:scale-105 transition-all duration-300 text-center">
              Report a Threat
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Trust Banner */}
      <section className="border-y border-white/5 bg-[#0A0F1A] py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-6">Trusted to protect next-gen infrastructure</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
            {/* Logos could go here */}
            <ShieldCheck className="w-8 h-8" />
            <Target className="w-8 h-8" />
            <Radar className="w-8 h-8" />
            <Globe className="w-8 h-8" />
            <Lock className="w-8 h-8" />
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="py-32 bg-[#05070D] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#8B3DFF]/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white/90 mb-6 tracking-tight">Ecosystem of Defense</h2>
            <p className="text-xl max-w-2xl mx-auto font-light text-white/60">
              A comprehensive approach to cybersecurity, spanning elite services, immersive education, and actionable threat intelligence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/services" className="group p-8 rounded-3xl bg-[#0A0F1A] border border-white/5 hover:border-[#2F9BFF]/30 transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-[#2F9BFF]/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Shield className="w-8 h-8 text-[#2F9BFF]" />
              </div>
              <h3 className="text-2xl font-bold text-white/90 mb-4">Defense Services</h3>
              <p className="font-light leading-relaxed mb-6">Elite penetration testing, architecture reviews, and AI model red-teaming for critical systems.</p>
              <span className="text-[#2F9BFF] font-medium inline-flex items-center group-hover:gap-2 transition-all">Explore Services <ArrowRight className="w-4 h-4 ml-1" /></span>
            </Link>

            <Link to="/academy" className="group p-8 rounded-3xl bg-[#0A0F1A] border border-white/5 hover:border-[#8B3DFF]/30 transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-[#8B3DFF]/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <GraduationCap className="w-8 h-8 text-[#8B3DFF]" />
              </div>
              <h3 className="text-2xl font-bold text-white/90 mb-4">Vanguard Academy</h3>
              <p className="font-light leading-relaxed mb-6">Immersive curriculum for the next generation of cyber operators, featuring realistic simulated attacks.</p>
              <span className="text-[#8B3DFF] font-medium inline-flex items-center group-hover:gap-2 transition-all">View Academy <ArrowRight className="w-4 h-4 ml-1" /></span>
            </Link>

            <Link to="/intelligence" className="group p-8 rounded-3xl bg-[#0A0F1A] border border-white/5 hover:border-[#2F9BFF]/30 transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-[#2F9BFF]/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Radar className="w-8 h-8 text-[#2F9BFF]" />
              </div>
              <h3 className="text-2xl font-bold text-white/90 mb-4">Threat Intel</h3>
              <p className="font-light leading-relaxed mb-6">Continuous monitoring, zero-day research, and strategic insights for infrastructure and AI models.</p>
              <span className="text-[#2F9BFF] font-medium inline-flex items-center group-hover:gap-2 transition-all">Read Reports <ArrowRight className="w-4 h-4 ml-1" /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* Cyber Range Promo */}
      <section className="py-24 bg-[#0A0F1A] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white/90 mb-2">The Cyber Range</h2>
              <p className="text-white/50 font-light">Practical environments for real-world scenarios.</p>
            </div>
            <Link to="/cyber-range" className="hidden sm:inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/10 hover:bg-white/5 transition-all font-medium text-white/80">
              Enter the Range
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/academy" className="group block relative overflow-hidden rounded-3xl border border-[#1E2B40] bg-[#05070D] p-10 hover:border-[#8B3DFF]/50 transition-all text-left">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <GraduationCap className="w-32 h-32 text-[#8B3DFF]" />
              </div>
              <h3 className="text-2xl font-bold text-white/90 mb-4">Course Catalogue</h3>
              <p className="text-white/60 font-light mb-8 max-w-sm">From SOC Analyst fundamentals to advanced AI Security & LLM Defense.</p>
              <span className="inline-flex items-center text-[#8B3DFF] font-medium text-sm">Explore Courses <ArrowRight className="ml-2 w-4 h-4" /></span>
            </Link>
            
            <Link to="/cyber-range/labs" className="group block relative overflow-hidden rounded-3xl border border-[#1E2B40] bg-[#05070D] p-10 hover:border-[#2F9BFF]/50 transition-all text-left">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Terminal className="w-32 h-32 text-[#2F9BFF]" />
              </div>
              <h3 className="text-2xl font-bold text-white/90 mb-4">IVVAB Labs Spotlight</h3>
              <p className="text-white/60 font-light mb-8 max-w-sm">Isolated, real-world cyber ranges. Complete objectives, capture flags, and prove your skills.</p>
              <span className="inline-flex items-center text-[#2F9BFF] font-medium text-sm">Start a Lab <ArrowRight className="ml-2 w-4 h-4" /></span>
            </Link>
          </div>
          
          <div className="mt-8 sm:hidden">
             <Link to="/cyber-range" className="w-full inline-flex items-center justify-center px-6 py-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-medium text-white/80">
              Enter the Range
            </Link>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-32 bg-[#05070D] relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B3DFF]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="order-2 lg:order-1">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#8B3DFF] mb-4">Founder & Mission</h3>
            <h2 className="text-4xl md:text-5xl font-bold text-white/90 mb-8 leading-tight">
              "We must build defenses that evolve faster than the threats."
            </h2>
            <div className="space-y-6 text-lg font-light text-white/60">
              <p>
                As AI models and automated infrastructure scale, the attack surface expands exponentially. Traditional security paradigms are no longer sufficient.
              </p>
              <p>
                At NISQ Vanguard, we are building a holistic ecosystem—combining offensive security expertise with elite education and proactive threat intelligence—to secure the future of technology.
              </p>
            </div>
            <div className="mt-12 flex items-center gap-4">
              <div className="w-12 h-1 bg-gradient-to-r from-[#8B3DFF] to-transparent rounded-full" />
              <p className="font-medium text-white/80">Ashok Vallabhuni</p>
              <p className="font-mono text-xs text-[#2F9BFF] uppercase tracking-widest ml-2">Chief Architect</p>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#8B3DFF]/20 to-[#2F9BFF]/20 blur-2xl rounded-full opacity-60" />
            <div className="relative rounded-3xl w-full max-w-md mx-auto aspect-[4/5] bg-[#0A0F1A] border border-white/10 overflow-hidden group shadow-2xl">
              <img 
                src={founderImg} 
                alt="Ashok Vallabhuni - Founder" 
                className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                onError={(e) => { 
                  // Fallback if image breaks
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if(parent) {
                    const fallback = document.createElement('div');
                    fallback.className = "w-full h-full flex flex-col items-center justify-center bg-[#05070D]";
                    fallback.innerHTML = `<span class="text-white/20 font-mono text-sm mb-4">FOUNDER / ARCHITECT</span><div class="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center"><span class="text-3xl text-[#8B3DFF]">AV</span></div>`;
                    parent.appendChild(fallback);
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-transparent to-transparent opacity-80 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* The Vanguard Team */}
      <section className="py-24 bg-[#0A0F1A] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white/90 mb-4">The Vanguard Team</h2>
            <p className="text-lg text-white/50 font-light">Defenders, architects, and educators united by mission.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            {[
              { name: "Ashok Vallabhuni", role: "Founder & Chief Architect", bio: "Cyber Strategy & AI Security" },
              { name: "Varun Gajula", role: "Co-Founder", bio: "Product Vision & Growth" },
              { name: "Sannith Reddy", role: "Product Manager", bio: "Campus Programs & Brand Storytelling" }
            ].map((member, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#05070D] border border-white/5 hover:border-white/10 transition-all">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#1E2B40] mb-6 flex items-center justify-center border border-[#2F9BFF]/20 shadow-[0_0_15px_rgba(47,155,255,0.05)]">
                  <span className="font-mono text-xl text-[#2F9BFF]">{member.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <h3 className="text-lg font-medium text-white/90 mb-1">{member.name}</h3>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#8B3DFF] mb-3">{member.role}</p>
                <p className="text-sm font-light text-white/50">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Threat Intelligence */}
      <section className="py-32 bg-[#05070D] border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <h2 className="text-3xl md:text-5xl font-bold text-white/90 mb-6">Threat Intelligence</h2>
            <p className="text-lg font-light leading-relaxed mb-8">
              Stay ahead of the curve. Our research team continuously monitors the cyber landscape to provide actionable insights, zero-day vulnerability reports, and AI infrastructure threat models.
            </p>
            <Link to="/intelligence" className="inline-flex items-center gap-2 bg-[#1E2B40] border border-[#2F9BFF]/30 text-white px-6 py-4 rounded-full hover:border-[#2F9BFF] transition-all">
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
              <Link key={i} to="/intelligence" className="group block bg-[#0A0F1A] border border-white/10 p-6 hover:border-[#2F9BFF]/40 rounded-2xl transition-all hover:bg-[#0A0F1A]/80">
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

      {/* Contact Section */}
      <section className="py-32 bg-[#0A0F1A] border-t border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#8B3DFF]/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white/90 mb-6">Ready to fortify your defenses?</h2>
          <p className="text-xl font-light text-white/60 mb-12 max-w-2xl mx-auto">
            Whether you need enterprise protection, team training, or a cyber awareness program for your college, we are ready to assist.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/contact" className="bg-white/10 hover:bg-white/20 text-white font-medium px-10 py-4 rounded-full transition-all">
              Contact Us
            </Link>
            <Link to="/services" className="bg-gradient-to-r from-[#8B3DFF] to-[#2F9BFF] text-white font-medium px-10 py-4 rounded-full shadow-[0_0_20px_rgba(47,155,255,0.4)] hover:shadow-[0_0_40px_rgba(47,155,255,0.6)] hover:scale-105 transition-all">
              Request a Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer className="py-12 bg-[#05070D] border-t border-[#1E2B40]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img 
              src={nisqLogo} 
              alt="NISQ Vanguard" 
              className="w-10 h-10 rounded-md object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
            />
            <span className="font-mono text-xs font-bold text-white/80 tracking-widest">NISQ VANGUARD DEFENCE TECHNOLOGIES</span>
          </div>
          <div className="flex gap-8 text-sm font-light text-white/60">
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/reporting" className="hover:text-white transition-colors">Report Threat</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
