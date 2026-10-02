import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll } from "framer-motion";
import { animate, stagger } from "animejs";
import { ArrowRight, CalendarDays, ShieldAlert, User } from "lucide-react";
import { BackgroundStage } from "./BackgroundStage";
import { HUDOverlay } from "./HUDOverlay";
import { useAuth } from "@/lib/auth-context";
import { CyberButton } from "./common/CyberButton";
import { supabase } from "@/integrations/supabase/client";

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
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: TRANSITION },
};

interface HomeTeamMember {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  image_url: string | null;
}

export function CyberIntelligenceHome() {
  const { scrollYProgress } = useScroll();
  const { user, profile } = useAuth();
  const accountType = profile?.account_type || "STUDENT";
  const dashboardLink =
    accountType === "ORGANIZATION" || accountType === "COLLEGE"
      ? "/organization/dashboard"
      : "/dashboard";
  const homeRef = useRef<HTMLDivElement>(null);
  const { data: teamMembers } = useQuery({
    queryKey: ["home-team"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("id,name,role,bio,image_url")
        .order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

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
      className="relative bg-[var(--obsidian)] text-white font-sans selection:bg-[var(--cyan)] selection:text-black overflow-x-hidden"
    >
      <BackgroundStage scrollYProgress={scrollYProgress} />
      <HUDOverlay scrollYProgress={scrollYProgress} />
      <main className="relative z-10">
        <section className="h-[100svh] flex flex-col justify-center w-full max-w-[1280px] mx-auto px-[clamp(16px,4vw,48px)] relative z-10">
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
        <HomeSupportingSections teamMembers={teamMembers ?? []} />
      </main>
    </div>
  );
}

function HomeSupportingSections({ teamMembers }: { teamMembers: HomeTeamMember[] }) {
  return (
    <div className="home-supporting">
      <section className="home-support-section" aria-labelledby="report-threat-heading">
        <div>
          <span className="home-section-kicker">Secure intake</span>
          <h2 id="report-threat-heading">Report a threat</h2>
          <p>
            Share a suspected cyber fraud, account compromise, malware incident, or other security
            concern through the existing NISQ Vanguard reporting flow.
          </p>
        </div>
        <Link to="/reporting" className="home-section-action">
          Open secure reporting <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
      <section className="home-support-section" aria-labelledby="demo-booking-heading">
        <div>
          <span className="home-section-kicker">Operations briefing</span>
          <h2 id="demo-booking-heading">Book a demonstration</h2>
          <p>
            Request a briefing with the existing consultation flow to discuss security education,
            labs, architecture, or incident response needs.
          </p>
        </div>
        <Link to="/appointments" className="home-section-action">
          Schedule a briefing <CalendarDays size={16} aria-hidden="true" />
        </Link>
      </section>
      <section className="home-team-section" aria-labelledby="home-team-heading">
        <div className="home-team-heading">
          <div>
            <span className="home-section-kicker">NISQ Vanguard people</span>
            <h2 id="home-team-heading">Our team</h2>
          </div>
          <Link to="/team" className="home-inline-link">
            Meet the team <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        {teamMembers.length ? (
          <div className="home-team-grid">
            {teamMembers.map((member) => (
              <article className="home-team-card" key={member.id}>
                <div className="home-team-avatar">
                  {member.image_url ? (
                    <img src={member.image_url} alt={member.name} />
                  ) : (
                    <User size={28} aria-hidden="true" />
                  )}
                </div>
                <div>
                  <h3>{member.name}</h3>
                  <p className="home-team-role">{member.role}</p>
                  {member.bio && <p className="home-team-bio">{member.bio}</p>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="home-team-empty">
            <ShieldAlert size={20} aria-hidden="true" />
            <span>Team information will appear here when published.</span>
          </div>
        )}
      </section>
      <footer className="home-footer">
        <span>NISQ Vanguard</span>
        <nav aria-label="Footer navigation">
          <Link to="/academy">Academy</Link>
          <Link to="/cyber-range/labs">IVVAB Labs</Link>
          <Link to="/reporting">Report a threat</Link>
          <Link to="/team">Our team</Link>
        </nav>
        <span className="home-footer-copy">Security, intelligence, and education.</span>
      </footer>
    </div>
  );
}
