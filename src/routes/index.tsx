import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight,
  ShieldCheck,
  ScanSearch,
  GraduationCap,
  AlertTriangle,
  BriefcaseBusiness,
  Building2,
  BrainCircuit,
  RadioTower,
  Shield,
} from "lucide-react";
import { CinematicHero } from "@/components/cinematic-hero";

const founderImageUrl = "/assets/founder.jpeg";
const logoImageUrl = "/assets/nisq-logo.jpeg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CyberShield India — AI Fraud Detection & College Cyber Awareness" },
      {
        name: "description",
        content:
          "AI-powered scam screenshot analysis, cybercrime complaint filing, and cyber-awareness programs booked by colleges across India.",
      },
      {
        property: "og:title",
        content: "CyberShield India — AI Fraud Detection & College Cyber Awareness",
      },
      {
        property: "og:description",
        content:
          "AI-powered scam screenshot analysis, cybercrime complaint filing, and cyber-awareness programs booked by colleges across India.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: content } = useQuery({
    queryKey: ["site_content"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("*");
      return (data ?? []) as Array<{ section_name: string; title: string; description: string }>;
    },
  });

  const bySection = (name: string) => content?.find((c) => c.section_name === name);
  const hero = bySection("home_hero");
  const about = bySection("home_about");
  const programs = bySection("home_programs");

  return (
    <main className="pt-16">
      <CinematicHero />

      {/* PLATFORM CAPABILITIES */}
      <section className="px-4 md:px-8 py-20 border-t border-primary/10">
        <div className="max-w-6xl mx-auto">
          <div className="mono text-xs text-cyber mb-2">// EDUCATE · ASSESS · DEFEND</div>
          <h2 className="display text-4xl md:text-5xl mb-4">
            One security mission. Six capabilities.
          </h2>
          <p className="text-muted-foreground max-w-2xl mb-10">
            Practical awareness, assessment and defence for people, campuses and organizations
            across India.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 reveal-grid">
            <Pillar
              icon={<BriefcaseBusiness />}
              title="Cybersecurity Consulting"
              body="Structured guidance for safer systems, teams and operating practices."
              link={{ to: "/solutions/consulting", label: "Consult with us" }}
            />
            <Pillar
              icon={<GraduationCap />}
              title="NISQ Academy"
              body="Progressive cybersecurity learning paths built for practical understanding."
              link={{ to: "/learn", label: "Browse academy" }}
            />
            <Pillar
              icon={<RadioTower />}
              title="NISQ Cyber Range"
              body="A professional training environment connected to guided learning and labs."
              link={{ to: "/cyber-range", label: "Explore range" }}
            />
            <Pillar
              icon={<Building2 />}
              title="CyberSecure Campus"
              body="Awareness programs for colleges through webinars, seminars and workshops."
              link={{ to: "/programs", label: "Book a program" }}
            />
            <Pillar
              icon={<BrainCircuit />}
              title="CyberShieldAI"
              body="AI-assisted screenshot analysis with clear risk signals and next steps."
              link={{ to: "/fraud-check", label: "Check a threat" }}
            />
            <Pillar
              icon={<Shield />}
              title="NISQ Intelligence"
              body="Actionable cyber awareness designed to help people recognize emerging risks."
              link={{ to: "/complaint", label: "Report an incident" }}
            />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="px-4 md:px-8 py-20 border-t border-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mono text-xs text-cyber mb-2">// OUR MISSION</div>
          <h2 className="display text-4xl md:text-5xl mb-6">{about?.title ?? "Our Mission"}</h2>
          <p className="text-lg text-muted-foreground">{about?.description}</p>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="px-4 md:px-8 py-20 border-t border-primary/10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="mono text-xs text-cyber mb-2">// COLLEGE OUTREACH</div>
            <h2 className="display text-4xl md:text-5xl mb-4">
              {programs?.title ?? "Awareness Programs"}
            </h2>
            <p className="text-lg text-muted-foreground mb-6">{programs?.description}</p>
            <Link to="/programs" className="inline-flex items-center gap-2 mono text-cyber text-sm">
              Book Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="glass rounded-xl p-6 space-y-3">
            <FormatRow title="Webinar" duration="60 min" reach="Nationwide" />
            <FormatRow title="Seminar" duration="90 min" reach="On-campus" />
            <FormatRow title="Workshop" duration="Half day" reach="Hands-on lab" />
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="px-4 md:px-8 py-20 border-t border-primary/10">
        <div className="max-w-5xl mx-auto">
          <div className="mono text-xs text-cyber mb-2 text-center">// LEADERSHIP</div>
          <h2 className="display text-4xl md:text-5xl mb-10 text-center">Meet the Founder</h2>
          <div className="glass rounded-2xl p-6 md:p-10 grid md:grid-cols-[auto_1fr] gap-8 items-center glow-cyber">
            <div className="relative mx-auto">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl border-2 border-primary/40 glow-cyber overflow-hidden">
                <img
                  src={founderImageUrl}
                  alt="Ashok Vallabhuni"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-md border border-primary/40 bg-background flex items-center justify-center glow-cyber overflow-hidden">
                <img
                  src={logoImageUrl}
                  alt="NISQ Vanguard logo"
                  className="w-full h-full object-contain p-1"
                />
              </div>
            </div>

            <div>
              <div className="mono text-[0.65rem] text-cyber mb-2">FOUNDER · CHIEF ARCHITECT</div>
              <h3 className="display text-3xl md:text-4xl mb-3">Ashok Vallabhuni</h3>
              <p className="text-muted-foreground mb-4">
                Founder of <span className="text-cyber">NISQ Vanguard</span> — an independent
                cybersecurity awareness and protection initiative dedicated to safeguarding India's
                students, colleges, and digital citizens from evolving cyber threats.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Driving a mission to make cyber safety accessible: real-time scam alerts,
                AI-assisted fraud detection, incident reporting, and campus-scale awareness
                programs.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="mono text-[0.6rem] px-3 py-1 rounded-full border border-primary/40 text-cyber">
                  CYBER STRATEGY
                </span>
                <span className="mono text-[0.6rem] px-3 py-1 rounded-full border border-primary/40 text-cyber">
                  AI · SECURITY
                </span>
                <span className="mono text-[0.6rem] px-3 py-1 rounded-full border border-primary/40 text-cyber">
                  COLLEGE OUTREACH
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-8 py-20 border-t border-primary/10">
        <div className="max-w-3xl mx-auto glass rounded-2xl p-10 text-center glow-cyber">
          <ShieldCheck className="w-12 h-12 text-cyber mx-auto mb-4" />
          <h2 className="display text-3xl md:text-4xl mb-3">Stay ahead of scammers.</h2>
          <p className="text-muted-foreground mb-6">
            Create an account and start protecting yourself and your college community today.
          </p>
          <Link
            to="/login"
            className="inline-block bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-md glow-cyber"
          >
            Get Started
          </Link>
        </div>
      </section>

      <footer className="px-4 md:px-8 py-10 border-t border-primary/10 text-center mono text-[0.65rem] text-muted-foreground space-y-2">
        <div>
          © NISQ VANGUARD · CYBER PROTECTION & AWARENESS PLATFORM · FOUNDED BY ASHOK VALLABHUNI
        </div>
        <div className="text-muted-foreground/70 normal-case tracking-normal font-sans text-xs max-w-2xl mx-auto">
          This is an independent cybersecurity awareness platform and not affiliated with any
          government authority.
        </div>
      </footer>
    </main>
  );
}

function Pillar({
  icon,
  title,
  body,
  link,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  link: { to: string; label: string };
}) {
  return (
    <div className="glass rounded-xl p-6 hover:glow-cyber transition">
      <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-cyber mb-4">
        {icon}
      </div>
      <h3 className="display text-xl mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{body}</p>
      <Link to={link.to} className="mono text-xs text-cyber inline-flex items-center gap-1">
        {link.label} <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
function FormatRow({ title, duration, reach }: { title: string; duration: string; reach: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
      <div className="display text-lg">{title}</div>
      <div className="text-right">
        <div className="mono text-[0.6rem] text-cyber">{duration}</div>
        <div className="mono text-[0.55rem] text-muted-foreground">{reach}</div>
      </div>
    </div>
  );
}
