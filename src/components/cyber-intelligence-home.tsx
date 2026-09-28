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
import nisqLogo from "@/assets/nisq-logo.jpeg";

export function CyberIntelligenceHome() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#05070D] text-white/60 font-sans selection:bg-[#2F9BFF] selection:text-white">
      
      {/* New Hero Section */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Full-screen video background */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover -z-20" 
          src="/intro-video.mp4"
        ></video>
        
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-b from-black/80 via-transparent to-black -z-10"></div>
        
        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4 text-center space-y-6">
          <img src="/logo.png" alt="NISQ Vanguard" className="h-32 w-32 mb-6" />
          
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#2F9BFF]">
            NISQ Vanguard
          </h2>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white/90 bg-gradient-to-b from-white to-[#2F9BFF]/60 bg-clip-text text-transparent">
            Defending the digital frontier.
          </h1>
          
          <p className="max-w-2xl text-lg md:text-xl text-white/60 font-light">
            Next-generation cybersecurity for infrastructure, AI systems, and the models that power them.
          </p>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white/90 bg-gradient-to-b from-white to-[#8B3DFF]/60 bg-clip-text text-transparent mt-4">
            Protect what matters.<br/>Report what threatens it.
          </h2>

          <div className="flex flex-row flex-wrap justify-center gap-4 mt-8">
            <Link to="/services" className="bg-gradient-to-r from-[#8B3DFF] to-[#2F9BFF] text-white font-medium px-8 py-3 rounded-full shadow-[0_0_20px_rgba(47,155,255,0.3)] hover:opacity-90 transition-all">
              Request a Demo
            </Link>
            <Link to="/academy" className="bg-[#1E2B40] border border-[#2F9BFF]/30 hover:border-[#2F9BFF] text-white px-8 py-3 rounded-full transition-all">
              Enroll in Academy
            </Link>
            <Link to="/reporting" className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-full hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all">
              Report a Threat
            </Link>
          </div>
        </div>
      </section>

      {/* Founder & Mission */}
      <section className="py-32 bg-[#0A0F1A] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#8B3DFF]/20 to-[#2F9BFF]/20 blur-xl rounded-full opacity-50" />
            <div className="relative rounded-2xl w-full max-w-md mx-auto aspect-square bg-[#05070D] border border-white/10 flex items-center justify-center">
              <span className="text-white/20 font-mono text-sm">IMAGE REDACTED</span>
            </div>
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
