import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Shield, Target, BookOpen, Terminal, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { createPortal } from "react-dom";
import founderImg from "@/assets/founder.jpeg";

export function CyberIntelligenceHome() {
  // Track entry state. 
  const [hasEntered, setHasEntered] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const { scrollY } = useScroll();

  // Mouse position for parallax
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20; // -10 to 10
      const y = (e.clientY / innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Scroll animations for hero
  const contentY = useTransform(scrollY, [0, 500], [0, -50]);
  const contentOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  // Handle Enter sequence
  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      setHasEntered(true);
      window.scrollTo(0, 0);
    }, 1200); // 1.2s light sweep transition
  };

  return (
    <>
      {/* 1. CINEMATIC ENTRY EXPERIENCE */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {!hasEntered && (
            <motion.div 
              className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#05070B] overflow-hidden"
              exit={{ opacity: 0, scale: 1.05, filter: "brightness(2)" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              {/* Background Image */}
              <img 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isEntering ? 'opacity-0' : 'opacity-70'}`}
                src="/intro-bg.png"
                alt="Cyber Wolf Background"
              />
              {/* Cinematic overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#05070B]/80 via-[#05070B]/40 to-[#05070B] mix-blend-multiply pointer-events-none" />
              
              {/* Light sweep effect triggered on enter */}
              <motion.div 
                className="absolute inset-0 bg-[#20D9F5] mix-blend-overlay"
                initial={{ opacity: 0, x: "-100%" }}
                animate={isEntering ? { opacity: [0, 0.5, 0], x: ["-100%", "0%", "100%"] } : { opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />

              <div className="relative z-10 flex flex-col items-center gap-10">
                <button 
                  onClick={handleEnter}
                  disabled={isEntering}
                  className="group relative px-10 py-5 bg-[#0A0D14]/80 border border-[#20283A] hover:border-[#20D9F5] transition-all duration-500 overflow-hidden backdrop-blur-sm shadow-[0_0_20px_rgba(32,217,245,0.1)] hover:shadow-[0_0_40px_rgba(32,217,245,0.3)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#20D9F5]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
                  <span className="relative z-10 text-[#F4F3F1] font-mono tracking-[0.25em] text-sm uppercase">ENTER THE NISQ VANGUARD</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 2. MAIN HOME PAGE */}
      <main className="min-h-screen bg-[#05070B] text-[#F4F3F1] font-sans selection:bg-[#20D9F5]/30 selection:text-white">
        
        {/* CINEMATIC HERO SECTION */}
        <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-24 pb-16 bg-[#05070B]">
          {/* Parallax Background */}
          <motion.div 
            className="absolute inset-0 w-full h-full -z-20 bg-[#05070B]"
            animate={{ x: mousePosition.x * 1.5, y: mousePosition.y * 1.5 }}
            transition={{ type: "spring", stiffness: 50, damping: 40 }}
          >
            <img 
              src="/main-bg.png" 
              alt="NISQ Vanguard" 
              className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-screen scale-[1.05]"
            />
          </motion.div>
          
          {/* Subtle Grid and Gradient Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#20283A_1px,transparent_1px),linear-gradient(to_bottom,#20283A_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none -z-10 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070B]/40 via-[#05070B]/60 to-[#05070B] -z-10"></div>
          
          <motion.div 
            className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center justify-center pt-[20vh] pb-12"
            style={{ y: contentY, opacity: contentOpacity }}
          >
            <h2 className="font-mono text-xs sm:text-sm uppercase tracking-[0.4em] text-[#20D9F5] font-semibold mb-6 drop-shadow-[0_0_8px_rgba(32,217,245,0.4)]">
              NISQ Vanguard
            </h2>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight text-[#F4F3F1] pb-2 leading-tight">
              Defending the<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4F3F1] to-[#A8B0BF]">digital frontier.</span>
            </h1>
            
            <p className="mt-8 max-w-2xl text-lg sm:text-xl text-[#A8B0BF] font-light mx-auto leading-relaxed">
              Intelligent cybersecurity for infrastructure, AI systems, and the models that power them.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center w-full max-w-md mx-auto sm:max-w-none">
              <Link to="/reporting" className="w-full sm:w-auto bg-[#0D1220] border border-[#F43F8F]/40 text-[#F4F3F1] px-8 py-4 rounded-sm hover:bg-[#F43F8F]/10 hover:border-[#F43F8F] transition-all duration-300 text-center font-mono text-sm tracking-widest uppercase shadow-[0_0_15px_rgba(244,63,143,0.1)]">
                Report a Threat
              </Link>
              <Link to="/contact" className="w-full sm:w-auto bg-transparent border border-[#20283A] text-[#F4F3F1] px-8 py-4 rounded-sm hover:border-[#20D9F5]/60 hover:bg-[#20D9F5]/5 transition-all duration-300 text-center font-mono text-sm tracking-widest uppercase">
                Book a Demo
              </Link>
            </div>
          </motion.div>
        </section>

        {/* SERVICES OVERVIEW */}
        <section className="py-24 bg-[#05070B] relative z-10 border-t border-[#20283A]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-medium text-[#F4F3F1] mb-4">Core Capabilities</h2>
              <p className="text-[#A8B0BF] font-light max-w-2xl mx-auto">Enterprise-grade defense strategies and quantum-ready infrastructure.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Threat Intelligence", icon: Target, desc: "Actionable insights, zero-day reports, and AI model risk analysis.", link: "/intelligence" },
                { title: "IVVAB Labs", icon: Terminal, desc: "Containerized environments for hands-on offensive and defensive training.", link: "/cyber-range/labs" },
                { title: "Enterprise Academy", icon: BookOpen, desc: "Structured curriculums designed to upskill teams in advanced cyber warfare.", link: "/academy" }
              ].map((service, i) => (
                <div key={i} className="group p-8 bg-[#0A0D14] border border-[#20283A] hover:border-[#20D9F5]/40 transition-colors duration-500 flex flex-col">
                  <div className="w-12 h-12 mb-6 flex items-center justify-center bg-[#0D1220] border border-[#20283A] rounded-sm group-hover:border-[#20D9F5]/30 transition-colors">
                    <service.icon className="w-5 h-5 text-[#20D9F5]" />
                  </div>
                  <h3 className="text-lg font-medium text-[#F4F3F1] mb-3">{service.title}</h3>
                  <p className="text-sm font-light text-[#A8B0BF] leading-relaxed flex-grow">{service.desc}</p>
                  <Link to={service.link} className="mt-6 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#20D9F5] group-hover:text-[#00CFEF] transition-colors">
                    Explore <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOUNDER SECTION */}
        <section className="py-24 bg-[#0A0D14] border-t border-[#20283A]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-medium text-[#F4F3F1] mb-6">Vision & Architecture</h2>
              <p className="text-lg text-[#A8B0BF] font-light leading-relaxed mb-6">
                NISQ Vanguard was engineered to address the critical gap between theoretical cybersecurity education and the reality of modern, AI-augmented threat actors.
              </p>
              <p className="text-base text-[#A8B0BF] font-light leading-relaxed mb-10">
                Led by Ashok Vallabhuni, our focus remains strictly on practical defense, resilient infrastructure design, and preparing organizations for the quantum horizon.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm bg-[#0D1220] border border-[#20283A] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <div>
                  <h4 className="text-[#F4F3F1] font-medium">Ashok Vallabhuni</h4>
                  <p className="text-xs font-mono text-[#A8B0BF] uppercase tracking-widest">Founder / Chief Architect</p>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm aspect-[4/5] bg-[#0D1220] border border-[#20283A] p-2 shadow-2xl">
                <img 
                  src={founderImg} 
                  alt="Ashok Vallabhuni" 
                  className="w-full h-full object-cover grayscale contrast-125 opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* PRE-FOOTER CTA */}
        <section className="py-32 bg-[#05070B] border-t border-[#20283A] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-[#20D9F5]/30 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#20D9F5_0%,transparent_50%)] opacity-5 pointer-events-none" />
          
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl font-medium text-[#F4F3F1] mb-6 tracking-tight">Secure your infrastructure.</h2>
            <p className="text-lg text-[#A8B0BF] font-light mb-12">
              Enterprise protection, advanced team training, and vulnerability disclosure programs ready for deployment.
            </p>
            <Link to="/contact" className="inline-flex bg-[#0D1220] border border-[#20283A] text-[#F4F3F1] font-mono text-sm tracking-widest uppercase px-10 py-5 rounded-sm hover:bg-[#20D9F5]/10 hover:border-[#20D9F5]/50 transition-all duration-300">
              Initiate Consultation
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}
