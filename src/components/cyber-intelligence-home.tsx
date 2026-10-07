import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { CyberButton } from './common/CyberButton';
import { Section } from './common/Section';

const EASE = [0.22, 1, 0.36, 1] as const;
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

export function CyberIntelligenceHome() {
  const { user, profile } = useAuth();
  
  const accountType = profile?.account_type || "STUDENT";
  const dashboardLink = (accountType === "ORGANIZATION" || accountType === "COLLEGE") ? "/organization/dashboard" : "/dashboard";

  return (
    <div className="relative bg-nisq-white text-nisq-navy font-sans selection:bg-nisq-blue-soft selection:text-nisq-white overflow-x-hidden min-h-[100svh]">
      <main className="relative z-10 w-full h-full flex flex-col justify-center min-h-[90vh]">
        <Section className="flex flex-col justify-center w-full max-w-[1280px] mx-auto relative z-10 py-20">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-12 gap-6 min-w-0 items-center relative"
          >
            <div className="col-span-1 md:col-span-12 flex flex-col items-center text-center gap-6 min-w-0 z-10 relative">
              <motion.div variants={itemVariants} className="font-mono text-sm font-semibold tracking-[0.2em] text-nisq-blue uppercase bg-nisq-offwhite px-4 py-1 rounded-full border border-nisq-border">
                DEFENCE TECHNOLOGIES · CYBERSECURITY · AI SECURITY
              </motion.div>
              <motion.h1 
                variants={itemVariants}
                className="font-orbitron font-bold text-[clamp(40px,5vw,72px)] leading-[1.1] tracking-tight text-nisq-navy"
              >
                Secure Today.<br />
                <span className="text-nisq-blue">Defend Tomorrow.</span><br />
                Empower Forever.
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-[16px] md:text-[18px] leading-[1.6] text-nisq-ash max-w-[70ch]"
              >
                NISQ Vanguard is a cybersecurity and defence technology company focused on protecting people, organizations, and emerging digital infrastructure from evolving cyber threats. We combine cybersecurity consulting, practical security education, hands-on laboratories, and research into emerging technologies.
              </motion.p>
              
              <motion.p 
                variants={itemVariants}
                className="text-[14px] md:text-[15px] font-mono leading-[1.6] text-nisq-blue-soft max-w-[65ch]"
              >
                Security is no longer only about protecting systems. It is about protecting the intelligence, people, infrastructure, and decisions that depend on them.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-8">
                <CyberButton variant="primary" to={(user ? dashboardLink : "/about") as any}>
                  EXPLORE NISQ VANGUARD
                </CyberButton>
                {!user && (
                  <CyberButton variant="secondary" to="/login">
                    SIGN IN
                  </CyberButton>
                )}
              </motion.div>
            </div>
          </motion.div>
        </Section>
      </main>
    </div>
  );
}
