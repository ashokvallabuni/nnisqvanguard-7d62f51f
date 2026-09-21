import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Compass,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  Shield,
  Layers,
  Terminal,
  Database,
  Sparkles,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/cyber-range/learning-paths")({
  head: () => ({
    meta: [
      { title: "Cybersecurity Learning Paths & Career Roadmaps — NISQ Vanguard" },
      {
        name: "description",
        content:
          "Structured cybersecurity career progressions: SOC Analyst Level 1, Digital Forensics & Incident Response (DFIR), and Cloud Security Engineer.",
      },
    ],
  }),
  component: LearningPathsPage,
});

interface PathStep {
  stepNumber: number;
  title: string;
  type: "theory" | "data" | "lab" | "assessment";
  duration: string;
  linkTo?: string;
}

interface CareerPath {
  id: string;
  slug: string;
  title: string;
  role: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  totalDurationHours: number;
  skills: string[];
  steps: PathStep[];
}

const CAREER_PATHS: CareerPath[] = [
  {
    id: "path-soc-l1",
    slug: "soc-analyst-tier-1",
    title: "SOC Analyst Tier-1 Career Track",
    role: "Security Operations Center (SOC) Analyst",
    level: "Beginner",
    description: "Master real-time alert triage, packet inspection, authentication brute-force analysis, and incident escalations with industry-standard telemetry.",
    totalDurationHours: 12,
    skills: ["SIEM Triage", "Suricata / Wireshark", "Auth.log Parsing", "Incident Ticketing"],
    steps: [
      { stepNumber: 1, title: "Cybersecurity Foundations & Threat Architecture", type: "theory", duration: "2h", linkTo: "/learn/cybersecurity-foundations" },
      { stepNumber: 2, title: "Auth.log & Linux Credential Stuffing Telemetry", type: "data", duration: "1.5h", linkTo: "/learn/cybersecurity-foundations/authentication-and-access-control" },
      { stepNumber: 3, title: "Lab: Linux SSH Brute Force Investigation", type: "lab", duration: "45m", linkTo: "/cyber-range/labs" },
      { stepNumber: 4, title: "Network Defense & Traffic Flow Telemetry", type: "theory", duration: "2h", linkTo: "/learn/cybersecurity-foundations/network-security-and-protocols" },
      { stepNumber: 5, title: "Lab: Suricata Network Threat Hunting & PCAP", type: "lab", duration: "1h", linkTo: "/cyber-range/labs" },
    ],
  },
  {
    id: "path-dfir",
    slug: "digital-forensics-and-incident-response",
    title: "Digital Forensics & Incident Response (DFIR)",
    role: "DFIR Investigator / Incident Handler",
    level: "Intermediate",
    description: "Hunt advanced persistent threats (APTs), reconstruct memory dumps with Volatility 3, triage ransomware persistence, and build forensic timelines.",
    totalDurationHours: 18,
    skills: ["Memory Forensics (Volatility 3)", "Windows Event Logs", "Ransomware Triage", "Timeline Reconstruction"],
    steps: [
      { stepNumber: 1, title: "Host Artifacts & Windows Registry Persistence", type: "theory", duration: "3h", linkTo: "/academy" },
      { stepNumber: 2, title: "Real Malware Registry Telemetry & IOC Extraction", type: "data", duration: "2h", linkTo: "/cyber-range/datasets" },
      { stepNumber: 3, title: "Lab: Ransomware Registry Persistence & Triage", type: "lab", duration: "1h", linkTo: "/cyber-range/labs" },
      { stepNumber: 4, title: "Memory Dump Acquisition & Process Injections", type: "theory", duration: "2.5h", linkTo: "/academy" },
      { stepNumber: 5, title: "Lab: Memory Forensics with Volatility 3", type: "lab", duration: "1.5h", linkTo: "/cyber-range/labs" },
    ],
  },
  {
    id: "path-cloud-sec",
    slug: "cloud-and-container-security",
    title: "Cloud & Container Security Defense",
    role: "Cloud Security Engineer / DevSecOps",
    level: "Advanced",
    description: "Audit Docker daemon capabilities, secure Kubernetes clusters, hunt IAM misconfigurations, and defend containerized microservices against breakouts.",
    totalDurationHours: 15,
    skills: ["Docker Breakout Defense", "Linux Capabilities", "Kubernetes Auditing", "Cloud IAM Policy Hardening"],
    steps: [
      { stepNumber: 1, title: "Linux Namespaces, Cgroups & Capabilities Architecture", type: "theory", duration: "2.5h", linkTo: "/academy" },
      { stepNumber: 2, title: "Container Escape Attack Vectors & MITRE Matrix", type: "theory", duration: "2h", linkTo: "/academy" },
      { stepNumber: 3, title: "Lab: Docker Container Security & Escape Defense", type: "lab", duration: "1h", linkTo: "/cyber-range/labs" },
      { stepNumber: 4, title: "Container Runtime Hardening (AppArmor & Seccomp)", type: "assessment", duration: "2h", linkTo: "/academy" },
    ],
  },
];

function LearningPathsPage() {
  const stepTypeBadges = {
    theory: { label: "Theory", class: "bg-primary/10 text-primary border-primary/20" },
    data: { label: "Real Data", class: "bg-accent/15 text-accent border-accent/30" },
    lab: { label: "Cyber Lab", class: "bg-success/15 text-success border-success/30" },
    assessment: { label: "Exam / Quiz", class: "bg-warning/15 text-warning border-warning/30" },
  };

  return (
    <div className="min-h-screen pt-16 pb-24">
      <PageHeader
        badge="Career Roadmaps"
        badgeVariant="primary"
        title="Structured Cybersecurity Learning Paths"
        subtitle="Follow step-by-step career tracks connecting foundational theory, real telemetry datasets, and isolated cyber range workbenches."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Learning Paths" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-12">
        {CAREER_PATHS.map((path) => (
          <div
            key={path.id}
            className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:border-primary/40 transition-colors"
          >
            {/* Path Header */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-muted/40 via-card to-muted/20 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-[0.65rem] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20 font-semibold">
                    {path.level} Track
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    Target Role: {path.role}
                  </span>
                </div>
                <h3 className="font-display font-bold text-2xl text-foreground">
                  {path.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {path.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {path.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[0.65rem] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3">
                <div className="text-right text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>~{path.totalDurationHours} Hours Total</span>
                </div>
                {path.steps[0]?.linkTo && (
                  <Link
                    to={path.steps[0].linkTo}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-xs"
                  >
                    <span>Start This Path</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Path Progression Steps */}
            <div className="p-6 sm:p-8 space-y-4">
              <h4 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider">
                Sequential Progression (01 → 0{path.steps.length})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {path.steps.map((step) => {
                  const badge = stepTypeBadges[step.type];
                  return (
                    <div
                      key={step.stepNumber}
                      className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col justify-between gap-3 hover:border-primary/40 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">
                            0{step.stepNumber}
                          </span>
                          <span
                            className={`text-[0.6rem] font-mono uppercase px-2 py-0.5 rounded-full border ${badge.class}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <h5 className="font-semibold text-sm text-foreground line-clamp-2">
                          {step.title}
                        </h5>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs font-mono text-muted-foreground">
                        <span>{step.duration}</span>
                        {step.linkTo && (
                          <Link
                            to={step.linkTo}
                            className="text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
