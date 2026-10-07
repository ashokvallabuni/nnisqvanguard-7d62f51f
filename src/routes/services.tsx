import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Target, Crosshair, Server, Activity, ChevronRight, Search, FileCode2, Map, LayoutDashboard } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Enterprise Cybersecurity Consulting — NISQ Vanguard" },
      {
        name: "description",
        content:
          "Cybersecurity Consulting for Organizations: Security assessments, vulnerability analysis, application security, incident response, and strategy.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const services = [
    {
      id: "security-assessment",
      title: "Security Assessment",
      icon: Shield,
      desc: "Reviewing systems, applications, infrastructure, configurations, and security controls to identify weaknesses and areas of exposure.",
      features: [
        "Control Effectiveness Review",
        "Architecture Analysis",
        "Configuration Auditing",
        "Exposure Mapping",
      ],
    },
    {
      id: "vulnerability-assessment",
      title: "Vulnerability Assessment",
      icon: Search,
      desc: "Identifying vulnerabilities and helping organizations understand their severity, impact, and remediation priorities.",
      features: [
        "Automated Scanning",
        "Manual Verification",
        "Impact Analysis",
        "Prioritization Roadmaps",
      ],
    },
    {
      id: "application-security",
      title: "Application Security",
      icon: FileCode2,
      desc: "Assessing web applications, APIs, authentication mechanisms, authorization controls, and application architecture.",
      features: [
        "Web App Penetration Testing",
        "API Security Testing",
        "Authentication Audits",
        "Business Logic Testing",
      ],
    },
    {
      id: "infrastructure-security",
      title: "Infrastructure Security",
      icon: Server,
      desc: "Reviewing network architecture, endpoint security, cloud environments, access controls, and defensive configurations.",
      features: [
        "Cloud Security Posture",
        "Network Segmentation",
        "Endpoint Controls",
        "Zero-Trust Architecture",
      ],
    },
    {
      id: "incident-response",
      title: "Incident Response & Forensics",
      icon: Activity,
      desc: "Supporting organizations in understanding security incidents, containing impact, identifying root causes, and strengthening systems after an incident.",
      features: [
        "Breach Containment",
        "Digital Forensics",
        "Root Cause Analysis",
        "Post-Incident Hardening",
      ],
    },
    {
      id: "security-strategy",
      title: "Security Strategy",
      icon: Map,
      desc: "Helping organizations develop practical security roadmaps rather than relying on disconnected security tools.",
      features: [
        "Defensive Strategy Planning",
        "Security Investment Alignment",
        "Capability Maturation",
        "Executive Reporting",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHeader
        badge="CYBERSECURITY CONSULTING"
        badgeVariant="primary"
        title="Consulting for Organizations"
        subtitle="Organizations need more than vulnerability reports. They need a clear understanding of their security exposure and a practical path toward improvement."
      />

      {/* Web & App Security Focus */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 border-b border-border">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground mb-6">Protecting the Applications Behind Modern Business</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Applications are now the primary interface between organizations and their customers, employees, data, and infrastructure. A vulnerable application can become an entry point into an entire organization.
              </p>
              <p>
                NISQ Vanguard approaches application security from an attacker-aware and defender-focused perspective, examining vulnerabilities across web applications, APIs, authentication systems, authorization controls, data handling, configuration, and application architecture.
              </p>
              <p>
                Our approach focuses on identifying meaningful security weaknesses, understanding their potential impact, and providing practical recommendations for remediation.
              </p>
            </div>
          </div>
          <div className="bg-card border border-border p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 intel-grid opacity-10"></div>
            <LayoutDashboard className="w-12 h-12 text-primary mb-6 relative z-10" />
            <h3 className="text-xl font-bold text-foreground mb-4 relative z-10">Web & App Security capabilities</h3>
            <ul className="space-y-3 font-mono text-sm text-muted-foreground relative z-10">
              <li className="flex items-center gap-3"><Crosshair className="w-4 h-4 text-primary" /> API Security Assessments</li>
              <li className="flex items-center gap-3"><Crosshair className="w-4 h-4 text-primary" /> Architecture Reviews</li>
              <li className="flex items-center gap-3"><Crosshair className="w-4 h-4 text-primary" /> Authentication Audits</li>
              <li className="flex items-center gap-3"><Crosshair className="w-4 h-4 text-primary" /> Cloud Posture Evaluation</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">Our Consulting Capabilities</h2>
          <p className="text-muted-foreground">NISQ Vanguard works with organizations and institutions to identify weaknesses across their digital environments and develop security strategies aligned with their operational requirements.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="nv-card p-8 group flex flex-col hover:border-primary/40 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">
                {service.desc}
              </p>

              <ul className="space-y-2 mb-8">
                {service.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-foreground font-mono text-[0.7rem]"
                  >
                    <Crosshair className="w-3 h-3 text-success" /> {feature}
                  </li>
                ))}
              </ul>

              <Link
                to={`/appointments?service=${service.id}` as any}
                className="mt-auto inline-flex items-center justify-between w-full px-5 py-3 rounded-xl bg-background border border-border text-xs font-semibold text-primary hover:bg-primary/10 hover:border-primary/50 transition-all group/btn"
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
