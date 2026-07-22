import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, ShieldCheck, ScanSearch, GraduationCap, AlertTriangle } from "lucide-react";

const founderImageUrl = "/assets/founder.jpeg";
const logoImageUrl = "/assets/nisq-logo.jpeg";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CyberShield India — AI Fraud Detection & College Cyber Awareness" },
      { name: "description", content: "AI-powered scam screenshot analysis, cybercrime complaint filing, and cyber-awareness programs booked by colleges across India." },
      { property: "og:title", content: "CyberShield India — AI Fraud Detection & College Cyber Awareness" },
      { property: "og:description", content: "AI-powered scam screenshot analysis, cybercrime complaint filing, and cyber-awareness programs booked by colleges across India." },
    ],
  }),
  component: Home,
});

function Home() {
  const nav = useNavigate();
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
      {/* HERO */}
      <section
        className="relative min-h-[85vh] flex items-center px-4 md:px-8 overflow-hidden"
        style={{
          backgroundImage: `url(${logoImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative max-w-6xl mx-auto w-full py-16 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="mono text-[0.7rem] text-cyber mb-4 inline-block px-3 py-1 rounded-full border border-primary/40 bg-primary/5">
              ● SYSTEM ONLINE · NATIONAL CYBERSHIELD
            </div>
            <h1 className="display text-5xl md:text-7xl leading-none mb-6">
              {hero?.title ?? "Cyber Awareness, Fraud Detection & College Outreach"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-8">
              {hero?.description ?? "A national platform protecting citizens from digital fraud and empowering colleges across India with cybersecurity awareness programs."}
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => nav({ to: "/fraud-check" })} className="glow-cyber bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-md flex items-center gap-2">
                <ScanSearch className="w-4 h-4" /> Scan a Screenshot
              </button>
              <button onClick={() => nav({ to: "/programs" })} className="border border-primary/40 px-6 py-3 rounded-md flex items-center gap-2 hover:bg-primary/10">
                Book an Awareness Program <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              <Stat n="24/7" l="AI DETECTION" />
              <Stat n="500+" l="COLLEGES" />
              <Stat n="AI×AI" l="VISION MODEL" />
            </div>
          </div>
          <div className="relative">
            <div className="glass rounded-2xl p-8 glow-cyber">
              <div className="mono text-xs text-muted-foreground mb-4">// LIVE THREAT FEED</div>
              <ThreatRow verdict="Fraud" text="Fake UPI refund request" score={92} />
              <ThreatRow verdict="Suspicious" text="Unverified job offer" score={68} />
              <ThreatRow verdict="Fraud" text="OTP phishing SMS" score={95} />
              <ThreatRow verdict="Safe" text="Genuine bank notification" score={12} />
              <ThreatRow verdict="Suspicious" text="Investment scheme DM" score={74} />
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="px-4 md:px-8 py-20 border-t border-primary/10">
        <div className="max-w-6xl mx-auto">
          <div className="mono text-xs text-cyber mb-2">// CAPABILITIES</div>
          <h2 className="display text-4xl md:text-5xl mb-10">Three shields. One mission.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Pillar icon={<ScanSearch />} title="AI Fraud Detection" body="Upload a screenshot. Our vision model returns a fraud score, verdict and next steps in seconds." link={{ to: "/fraud-check", label: "Try it now" }} />
            <Pillar icon={<AlertTriangle />} title="Complaint Filing" body="Log cybercrime complaints with evidence. Every submission gets AI-triaged before human review." link={{ to: "/complaint", label: "File complaint" }} />
            <Pillar icon={<GraduationCap />} title="College Awareness" body="Colleges across India can request webinars, seminars and workshops led by cyber experts." link={{ to: "/programs", label: "Book a program" }} />
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
            <h2 className="display text-4xl md:text-5xl mb-4">{programs?.title ?? "Awareness Programs"}</h2>
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
                <img src={founderImageUrl} alt="Ashok Vallabhuni" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-md border border-primary/40 bg-background flex items-center justify-center glow-cyber overflow-hidden">
                <img src={logoImageUrl} alt="NISQ Vanguard logo" className="w-full h-full object-contain p-1" />
              </div>
            </div>

            <div>
              <div className="mono text-[0.65rem] text-cyber mb-2">FOUNDER · CHIEF ARCHITECT</div>
              <h3 className="display text-3xl md:text-4xl mb-3">Ashok Vallabhuni</h3>
              <p className="text-muted-foreground mb-4">
                Founder of <span className="text-cyber">NISQ Vanguard</span> — an independent cybersecurity awareness
                and protection initiative dedicated to safeguarding India's students, colleges, and digital citizens
                from evolving cyber threats.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Driving a mission to make cyber safety accessible: real-time scam alerts, AI-assisted fraud detection,
                incident reporting, and campus-scale awareness programs.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="mono text-[0.6rem] px-3 py-1 rounded-full border border-primary/40 text-cyber">CYBER STRATEGY</span>
                <span className="mono text-[0.6rem] px-3 py-1 rounded-full border border-primary/40 text-cyber">AI · SECURITY</span>
                <span className="mono text-[0.6rem] px-3 py-1 rounded-full border border-primary/40 text-cyber">COLLEGE OUTREACH</span>
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
          <p className="text-muted-foreground mb-6">Create an account and start protecting yourself and your college community today.</p>
          <Link to="/auth" className="inline-block bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-md glow-cyber">Get Started</Link>
        </div>
      </section>

      <footer className="px-4 md:px-8 py-10 border-t border-primary/10 text-center mono text-[0.65rem] text-muted-foreground space-y-2">
        <div>© NISQ VANGUARD · CYBER PROTECTION & AWARENESS PLATFORM · FOUNDED BY ASHOK VALLABHUNI</div>
        <div className="text-muted-foreground/70 normal-case tracking-normal font-sans text-xs max-w-2xl mx-auto">
          This is an independent cybersecurity awareness platform and not affiliated with any government authority.
        </div>
      </footer>

    </main>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="display text-2xl text-cyber">{n}</div>
      <div className="mono text-[0.55rem] text-muted-foreground">{l}</div>
    </div>
  );
}
function ThreatRow({ verdict, text, score }: { verdict: "Safe" | "Suspicious" | "Fraud"; text: string; score: number }) {
  const color = verdict === "Fraud" ? "text-destructive" : verdict === "Suspicious" ? "text-warning" : "text-success";
  return (
    <div className="flex items-center justify-between py-2 border-b border-primary/10 last:border-0">
      <div>
        <div className="text-sm">{text}</div>
        <div className={`mono text-[0.6rem] ${color}`}>{verdict.toUpperCase()}</div>
      </div>
      <div className={`mono text-lg ${color}`}>{score}</div>
    </div>
  );
}
function Pillar({ icon, title, body, link }: { icon: React.ReactNode; title: string; body: string; link: { to: string; label: string } }) {
  return (
    <div className="glass rounded-xl p-6 hover:glow-cyber transition">
      <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-cyber mb-4">{icon}</div>
      <h3 className="display text-xl mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{body}</p>
      <Link to={link.to} className="mono text-xs text-cyber inline-flex items-center gap-1">{link.label} <ArrowRight className="w-3 h-3" /></Link>
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
