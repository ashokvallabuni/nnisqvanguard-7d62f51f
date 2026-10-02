import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { animate, stagger } from "animejs";
import { BackgroundStage } from "./BackgroundStage";
import { HUDOverlay } from "./HUDOverlay";
import { useAuth } from "@/lib/auth-context";
import { CyberButton } from "./common/CyberButton";

const EASE = [0.22, 1, 0.36, 1] as const;
const TRANSITION = { duration: 0.6, ease: EASE };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: TRANSITION,
  },
};

export function CyberIntelligenceHome() {
  const { scrollYProgress } = useScroll();
  const { user, profile } = useAuth();

  const accountType = profile?.account_type || "STUDENT";
  const dashboardLink =
    accountType === "ORGANIZATION" || accountType === "COLLEGE"
      ? "/organization/dashboard"
      : "/dashboard";

  const homeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = homeRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = root.querySelectorAll<HTMLElement>("[data-anime-hero]");
    animate(targets, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 650,
      delay: stagger(90, { start: 160 }),
      ease: "out(3)",
    });
  }, []);

  return (
    <div
      ref={homeRef}
      className="relative bg-[var(--obsidian)] text-white font-sans selection:bg-[var(--cyan)] selection:text-black overflow-x-hidden h-[100svh]"
    >
      <BackgroundStage scrollYProgress={scrollYProgress} />
      <HUDOverlay scrollYProgress={scrollYProgress} />

      <main className="relative z-10 w-full h-full flex flex-col justify-center">
        <section className="flex flex-col justify-center w-full max-w-[1280px] mx-auto px-[clamp(16px,4vw,48px)] relative z-10">
          <motion.div
            data-anime-hero
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-12 gap-6 min-w-0 items-center relative"
          >
            <motion.div
              data-anime-hero
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.15, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
            >
              <img
                src="/assets/nisq-logo.jpeg"
                alt="NISQ VANGUARD Crest"
                className="w-full max-w-[420px] md:max-w-[520px] object-contain rounded-full border border-[#00D2FF]/20 shadow-[0_0_100px_rgba(0,210,255,0.15)]"
              />
            </motion.div>

            <div className="col-span-1 md:col-span-12 flex flex-col items-center text-center gap-6 min-w-0 z-10 relative mt-16">
              <motion.div
                variants={itemVariants}
                className="font-mono text-xs tracking-[0.2em] text-[var(--cyan)]"
              >
                DEFENCE TECHNOLOGIES · CYBERSECURITY · AI SECURITY
              </motion.div>
              <motion.h1
                data-anime-hero
                variants={itemVariants}
                className="font-display font-bold text-[clamp(40px,5vw,72px)] leading-[1.1] tracking-tight text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
              >
                Secure Today.
                <br />
                <span className="text-[var(--cyan)]">Defend Tomorrow.</span>
                <br />
                Empower Forever.
              </motion.h1>

              <motion.p
                data-anime-hero
                variants={itemVariants}
                className="text-[16px] md:text-[18px] leading-[1.6] text-[var(--chrome)] max-w-[70ch]"
              >
                NISQ Vanguard is a cybersecurity and defence technology company focused on
                protecting people, organizations, and emerging digital infrastructure from evolving
                cyber threats. We combine cybersecurity consulting, practical security education,
                hands-on laboratories, and research into emerging technologies.
              </motion.p>

              <motion.p
                data-anime-hero
                variants={itemVariants}
                className="text-[14px] md:text-[15px] font-mono leading-[1.6] text-[var(--cyan)] max-w-[65ch] opacity-80"
              >
                Security is no longer only about protecting systems. It is about protecting the
                intelligence, people, infrastructure, and decisions that depend on them.
              </motion.p>

              <motion.div
                data-anime-hero
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 mt-8"
              >
                {user ? (
                  <CyberButton variant="primary" to={dashboardLink as any}>
                    Enter workspace
                  </CyberButton>
                ) : (
                  <CyberButton variant="primary" to="/login">
                    Enter the Vanguard
                  </CyberButton>
                )}
                <CyberButton variant="secondary" to="/about">
                  Explore NISQ Vanguard
                </CyberButton>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scan {
          0% { top: 0%; opacity: 1; }
          50% { top: 100%; opacity: 0; }
          100% { top: 0%; opacity: 0; }
        }
      `,
        }}
      />
    </div>
  );
}
