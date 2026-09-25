import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Target, Crosshair, Server, Activity, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Enterprise Defense Services — NISQ Vanguard" },
      { name: "description", content: "Professional cybersecurity services, audits, and threat simulations for organizations." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const services = [
    {
      id: "cyber-ranges",
      title: "Enterprise IVVAB LABSs",
      icon: Server,
      desc: "Custom-built, isolated virtual environments replicating your corporate network. Train your blue and red teams on real-world exploits without risking production data.",
      features: ["Custom Network Topologies", "Live Attack Simulation", "Automated Grading & Metrics", "Vulnerability Injection"]
    },
    {
      id: "audits",
      title: "Security Audits & Compliance",
      icon: Shield,
      desc: "Comprehensive security architecture reviews and compliance readiness assessments. We identify structural vulnerabilities before adversaries do.",
      features: ["Infrastructure Review", "Cloud Security Posture", "Zero-Trust Architecture", "ISO/SOC2 Readiness"]
    },
    {
      id: "threat-simulation",
      title: "Adversary Threat Simulation",
      icon: Target,
      desc: "Full-scope Red Team engagements mimicking advanced persistent threats (APTs). Test your detection and response capabilities under realistic pressure.",
      features: ["Assume Breach Scenarios", "Social Engineering", "Lateral Movement Testing", "Actionable Remediation Reports"]
    },
    {
      id: "incident-response",
      title: "Incident Response & Forensics",
      icon: Activity,
      desc: "Rapid deployment for breach containment, eradication, and digital forensics. Limit damage and restore operations with tactical precision.",
      features: ["24/7 SLA Available", "Malware Reverse Engineering", "Root Cause Analysis", "Post-Incident Hardening"]
    }
  ];

  return (
    <main className="min-h-screen bg-[#112240] text-[#F0F4F9]">
      <PageHeader
        badge="DEFENSE SERVICES"
        badgeVariant="primary"
        title="Enterprise Defense & Tactical Operations"
        subtitle="Elite cybersecurity services for organizations requiring military-grade resilience. Defend your perimeter, test your teams, and neutralize threats."
      />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div key={service.id} className="nv-card p-8 group flex flex-col hover:border-primary/40 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-[#F0F4F9] mb-3">{service.title}</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed mb-6 flex-grow">{service.desc}</p>
              
              <ul className="space-y-2 mb-8">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#F0F4F9] font-mono text-[0.7rem]">
                    <Crosshair className="w-3.5 h-3.5 text-[#059669]" /> {feature}
                  </li>
                ))}
              </ul>

              <Link 
                to="/appointments"
                search={{ service: service.id }}
                className="mt-auto inline-flex items-center justify-between w-full px-5 py-3 rounded-xl bg-background border border-border text-sm font-semibold text-primary hover:bg-primary/10 hover:border-primary/50 transition-all group/btn"
              >
                REQUEST CONSULTATION
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
