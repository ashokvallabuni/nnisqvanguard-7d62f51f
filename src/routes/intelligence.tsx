import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Shield,
  AlertTriangle,
  Globe,
  FileText,
  Microscope,
  Radio,
  Target,
  BarChart3,
  Bug,
  Database,
  ExternalLink,
  Clock,
  AlertOctagon,
  ChevronRight,
  Activity,
  AlertCircle,
  Lock,
} from "lucide-react";

export const Route = createFileRoute("/intelligence")({
  head: () => ({
    meta: [
      { title: "NISQ Vanguard Threat Intelligence — Live Defensive Telemetry" },
      {
        name: "description",
        content:
          "Consolidated threat intelligence: adversary TTPs, IOCs, CVE advisories, severity triage, and defensive research from the NISQ Vanguard sensor grid.",
      },
    ],
  }),
  component: ThreatIntelligenceDashboard,
});

type DataAccuracy = "LIVE" | "RESEARCH" | "STATIC" | "COMING SOON";

function AccuracyBadge({ accuracy }: { accuracy: DataAccuracy }) {
  const styles: Record<DataAccuracy, string> = {
    LIVE: "bg-emerald-500/15 text-success border-emerald-500/40 animate-pulse",
    RESEARCH: "bg-violet-500/15 text-primary border-violet-500/40",
    STATIC: "bg-sky-500/15 text-sky-400 border-sky-500/40",
    "COMING SOON": "bg-amber-500/15 text-warning border-amber-500/40",
  };
  const icon: Record<DataAccuracy, typeof Radio> = {
    LIVE: Radio,
    RESEARCH: Microscope,
    STATIC: Database,
    "COMING SOON": Lock,
  };
  const Icon = icon[accuracy];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[0.65rem] font-mono font-bold tracking-wider ${styles[accuracy]}`}
    >
      <Icon className="w-3 h-3" />
      <span>{accuracy}</span>
    </span>
  );
}

function SectionHeader({
  step,
  stepVariant = "primary",
  icon: Icon,
  title,
  accuracy,
  description,
}: {
  step?: string;
  stepVariant?: "primary" | "accent" | "warning" | "success" | "destructive";
  icon: typeof Shield;
  title: string;
  accuracy: DataAccuracy;
  description?: string;
}) {
  const stepStyles = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent-foreground",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/15 text-success",
    destructive: "bg-destructive/15 text-destructive",
  };
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 border-b border-border/80">
      <div className="flex items-start gap-2">
        {step && (
          <span
            className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-full font-semibold shrink-0 ${stepStyles[stepVariant]}`}
          >
            {step}
          </span>
        )}
        <div>
          <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            <span>{title}</span>
          </h2>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      <AccuracyBadge accuracy={accuracy} />
    </div>
  );
}

const THREAT_CATEGORIES = [
  { slug: "ransomware", label: "Ransomware", count: 42, severity: "critical" },
  { slug: "phishing", label: "Phishing & Social Engineering", count: 118, severity: "high" },
  { slug: "apt", label: "APT & Nation-State", count: 11, severity: "critical" },
  { slug: "malware", label: "Malware & Trojans", count: 76, severity: "high" },
  { slug: "ddos", label: "DDoS & Network Attack", count: 54, severity: "medium" },
  { slug: "supply-chain", label: "Supply Chain", count: 8, severity: "high" },
  { slug: "insider", label: "Insider Threat", count: 14, severity: "medium" },
  { slug: "zero-day", label: "Zero-Day Exploits", count: 3, severity: "critical" },
  { slug: "iot", label: "IoT Compromise", count: 23, severity: "low" },
  { slug: "cloud", label: "Cloud Misconfiguration", count: 37, severity: "medium" },
  { slug: "data-exfil", label: "Data Exfiltration", count: 19, severity: "high" },
  { slug: "fraud", label: "Financial Fraud", count: 9, severity: "medium" },
] as const;

const STATIC_REPORTS = [
  {
    id: "TI-2026-0921-014",
    title: "Rise in dual-use Cobalt Strike stagers masquerading as Windows Update packages",
    category: "Malware",
    severity: "HIGH",
    published: "2026-09-21",
    source: "NISQ Vanguard SOC Telemetry",
    summary:
      "SOC sensors detected an increase in signed-binary abuse where threat actors distribute weaponized Windows Update stand-alone installers containing Cobalt Strike beacon payloads with 20-minute sleep jitter.",
    accuracy: "STATIC" as DataAccuracy,
  },
  {
    id: "TI-2026-0920-009",
    title: "Phishing campaign targets higher-education remote-access VPN portals",
    category: "Phishing",
    severity: "MEDIUM",
    published: "2026-09-20",
    source: "Sector ISAC Sharing",
    summary:
      "Clone portals for three major enterprise VPN vendors were observed redirecting credentials to attacker-controlled infrastructure in the 198.51.100.0/24 test range. Domain registrar flags raised.",
    accuracy: "STATIC" as DataAccuracy,
  },
  {
    id: "TI-2026-0919-022",
    title: "Open-source dependency confusion observed in npm supply chain niche packages",
    category: "Supply Chain",
    severity: "HIGH",
    published: "2026-09-19",
    source: "Package Registry Monitor",
    summary:
      "Nine packages in the developer-tooling niche were published with matching names to internal packages; CI/CD runners without strict registry scoping pulled attacker-controlled dependencies during nightly builds.",
    accuracy: "STATIC" as DataAccuracy,
  },
];

const STATIC_IOCS = [
  {
    type: "IPv4",
    value: "198.51.100.44",
    context: "SSH brute-force source — 48,221 attempts / 24h",
    firstSeen: "2026-09-20",
    severity: "HIGH",
  },
  {
    type: "Domain",
    value: "update-windows-verification[.]top",
    context: "Phishing landing — Cobalt Strike dropper",
    firstSeen: "2026-09-21",
    severity: "CRITICAL",
  },
  {
    type: "SHA-256",
    value: "a7f3c9d2e8b4…f1a2 (sample masked)",
    context: "Signed fake Windows Update installer",
    firstSeen: "2026-09-21",
    severity: "HIGH",
  },
  {
    type: "JA3",
    value: "e7dec6137f9a8c…3b42d",
    context: "Cobalt Strike beacon HTTPS fingerprint",
    firstSeen: "2026-09-19",
    severity: "MEDIUM",
  },
];

const RESEARCH_TOPICS = [
  {
    title: "Adversary Emulation: TTP mapping from MITRE ATT&CK to CTF scenario blueprint",
    researcher: "Defensive Research Unit",
    eta: "In Review",
    summary:
      "Mapping real intrusions detected on the sensor grid into reusable, student-safe CTF scenario blueprints for the IVVAB LABS with verifiable detection engineering outcomes.",
  },
  {
    title: "LLM-based SOC alert triage — hallucination mitigation & deterministic guardrails",
    researcher: "AI Red Team Lab",
    eta: "Draft",
    summary:
      "Evaluation of frontier LLM assistants for SOC tier-1 triage; measuring false-positive rates when models encounter zero-day malware signatures absent from training corpora.",
  },
  {
    title: "Quantum-resistant VPN tunnel performance on commodity x86 edge hardware",
    researcher: "Post-Quantum Crypto Unit",
    eta: "Preprint",
    summary:
      "CRYSTALS-Kyber + Classic McEliece hybrid handshakes benchmarked against IKEv2/IPsec on 1Gbps edge links; CPU overhead, latency delta, and MTU implications for remote-access deployments.",
  },
];

const ADVISORIES = [
  {
    id: "CVE-2026-21412",
    title: "Remote code execution in enterprise VPN gateway web management interface",
    severity: "CRITICAL",
    cvss: 9.8,
    status: "Patch Available",
    accuracy: "STATIC" as DataAccuracy,
  },
  {
    id: "CVE-2026-18877",
    title: "Privilege escalation via crafted configuration file import in SIEM appliance",
    severity: "HIGH",
    cvss: 8.1,
    status: "Vendor Advisory",
    accuracy: "STATIC" as DataAccuracy,
  },
  {
    id: "NISQ-SA-2026-003",
    title: "Recommended hardening baseline for student-accessible Linux lab images",
    severity: "INFO",
    cvss: 0,
    status: "Internal Guidance",
    accuracy: "STATIC" as DataAccuracy,
  },
  {
    id: "CVE-2026-?????",
    title: "Active exploitation window — reserved tracking for emerging zero-day cluster",
    severity: "CRITICAL",
    cvss: null,
    status: "Under embargo",
    accuracy: "COMING SOON" as DataAccuracy,
  },
];

function severityBadgeClass(severity: string) {
  switch (severity.toLowerCase()) {
    case "critical":
      return "bg-destructive/15 text-destructive border-destructive/40 border";
    case "high":
      return "bg-orange-500/15 text-orange-400 border-orange-500/40 border";
    case "medium":
      return "bg-amber-500/15 text-warning border-amber-500/40 border";
    case "low":
      return "bg-emerald-500/15 text-success border-emerald-500/40 border";
    case "info":
      return "bg-sky-500/15 text-sky-400 border-sky-500/40 border";
    default:
      return "bg-muted text-muted-foreground border-border border";
  }
}

function ThreatIntelligenceDashboard() {
  return (
    <div className="min-h-screen pt-16 pb-24">
      <PageHeader
        badge="THREAT INTEL COMMAND CENTER"
        badgeVariant="destructive"
        title="Consolidated Threat Intelligence"
        subtitle="Adversary TTPs · Indicators of Compromise · Vulnerability Advisories · Defensive Research"
        breadcrumbs={[{ label: "HOME", to: "/" }, { label: "THREAT INTEL" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* THREAT OVERVIEW KPI ROW */}
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-xs">
          <SectionHeader
            step="SECTION 01"
            stepVariant="primary"
            icon={Activity}
            title="Threat Overview"
            accuracy="STATIC"
            description="Aggregated posture snapshot across the NISQ Vanguard defensive sensor grid. Figures are static reference baselines for Academy training; live telemetry activates when Supabase intelligence tables are populated by the SOC team."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "ACTIVE ALERTS",
                value: "24",
                icon: AlertTriangle,
                tone: "text-orange-400",
                sub: "+3 in last 1h",
              },
              {
                label: "IOCS INGESTED",
                value: "1,284",
                icon: Target,
                tone: "text-cyber",
                sub: "7-day rolling window",
              },
              {
                label: "CVEs TRACKED",
                value: "312",
                icon: Bug,
                tone: "text-primary",
                sub: "42 critical severity",
              },
              {
                label: "RESEARCH NOTES",
                value: "18",
                icon: Microscope,
                tone: "text-success",
                sub: "6 in peer review",
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-lg border border-border bg-muted/20 p-4 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[0.65rem] font-mono font-semibold tracking-wider text-muted-foreground">
                    {kpi.label}
                  </span>
                  <kpi.icon className={`w-4 h-4 ${kpi.tone}`} />
                </div>
                <div className={`text-2xl sm:text-3xl font-display font-bold ${kpi.tone}`}>
                  {kpi.value}
                </div>
                <div className="text-[0.65rem] font-mono text-muted-foreground">{kpi.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* THREAT CATEGORIES */}
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-xs">
          <SectionHeader
            step="SECTION 02"
            stepVariant="warning"
            icon={Globe}
            title="Threat Categories"
            accuracy="STATIC"
            description="Classified threat taxonomy used by Academy modules. Category chips link to filtered course tracks; COMING SOON tags denote catalog sections pending content population by the Chief Architect."
          />
          <div className="flex flex-wrap gap-2">
            {THREAT_CATEGORIES.map((cat) => {
              const isSoon = cat.severity === "critical" && cat.count <= 3;
              return (
                <div
                  key={cat.slug}
                  className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[0.6rem] font-mono font-bold ${severityBadgeClass(cat.severity)}`}
                  >
                    {cat.severity.toUpperCase()}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-foreground">
                    {cat.label}
                  </span>
                  <span className="text-[0.65rem] font-mono text-muted-foreground">
                    {cat.count}
                  </span>
                  {isSoon && (
                    <span className="text-[0.6rem] font-mono px-1.5 py-0.5 rounded border border-amber-500/30 bg-warning/10 text-warning">
                      COMING SOON
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              );
            })}
          </div>
        </section>

        {/* TWO-COL: LATEST REPORTS + IOC */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LATEST REPORTS */}
          <section className="lg:col-span-2 rounded-xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-xs">
            <SectionHeader
              step="SECTION 03"
              stepVariant="accent"
              icon={FileText}
              title="Latest Intelligence Reports"
              accuracy="STATIC"
              description="Sample reports used for Academy reading comprehension and analyst triage drills. LIVE reports stream from the SOC ingestion pipeline when Supabase `intel_reports` RLS is enabled."
            />
            <div className="space-y-4">
              {STATIC_REPORTS.map((r) => (
                <article
                  key={r.id}
                  className="rounded-lg border border-border bg-muted/15 p-4 sm:p-5 space-y-2 hover:border-primary/40 hover:bg-muted/25 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.65rem] font-mono font-bold text-muted-foreground">
                      {r.id}
                    </span>
                    <span
                      className={`text-[0.6rem] font-mono font-bold px-1.5 py-0.5 rounded ${severityBadgeClass(r.severity)}`}
                    >
                      {r.severity}
                    </span>
                    <span className="text-[0.65rem] font-mono text-muted-foreground">
                      {r.category}
                    </span>
                    <span className="text-[0.65rem] font-mono text-muted-foreground ml-auto inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {r.published}
                    </span>
                    <AccuracyBadge accuracy={r.accuracy} />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-foreground leading-snug">
                    {r.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {r.summary}
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[0.65rem] font-mono text-muted-foreground">
                      Source: {r.source}
                    </span>
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[0.7rem] font-mono font-semibold border border-border bg-background hover:bg-muted hover:border-primary/50 transition-colors">
                      <span>OPEN REPORT</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </article>
              ))}
              <div className="rounded-lg border border-dashed border-border p-5 text-center space-y-2">
                <Lock className="w-5 h-5 text-warning mx-auto" />
                <p className="text-xs font-mono font-bold text-warning tracking-wider">
                  COMING SOON
                </p>
                <p className="text-xs text-muted-foreground">
                  Additional reports will load from the Supabase intel_reports table when SOC
                  ingestion is online and RLS grants authenticated analyst access.
                </p>
              </div>
            </div>
          </section>

          {/* IOC INFORMATION */}
          <section className="lg:col-span-1 rounded-xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-xs">
            <SectionHeader
              step="SECTION 04"
              stepVariant="destructive"
              icon={Target}
              title="IOC Information"
              accuracy="STATIC"
              description="Sanitized, training-safe indicators. Production IOC stream integrates via MISP-compatible webhook and is restricted to signed-in SOC analysts."
            />
            <div className="space-y-3">
              {STATIC_IOCS.map((ioc, idx) => (
                <div
                  key={`${ioc.type}-${idx}`}
                  className="rounded-md border border-border bg-background p-3 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[0.6rem] font-mono font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      {ioc.type}
                    </span>
                    <span
                      className={`text-[0.6rem] font-mono font-bold px-1.5 py-0.5 rounded ${severityBadgeClass(ioc.severity)}`}
                    >
                      {ioc.severity}
                    </span>
                    <span className="text-[0.6rem] font-mono text-muted-foreground ml-auto">
                      firstSeen {ioc.firstSeen}
                    </span>
                  </div>
                  <code className="block text-[0.7rem] font-mono bg-muted/50 text-foreground rounded px-2 py-1.5 break-all">
                    {ioc.value}
                  </code>
                  <p className="text-[0.7rem] text-muted-foreground leading-snug">{ioc.context}</p>
                </div>
              ))}
              <div className="rounded-md border border-dashed border-border p-3 text-center">
                <p className="text-[0.65rem] font-mono font-bold text-warning tracking-wider">
                  COMING SOON
                </p>
                <p className="text-[0.65rem] text-muted-foreground mt-1">
                  STIX/TAXII feed & MISP export — analyst role only
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* SEVERITY DISTRIBUTION */}
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-xs">
          <SectionHeader
            step="SECTION 05"
            stepVariant="warning"
            icon={BarChart3}
            title="Severity Distribution"
            accuracy="STATIC"
            description="Static reference distribution for the Academy Threat Intel curriculum module. Live severity charts require the Supabase intel_events table populated by the SOC ingestion pipeline."
          />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "CRITICAL", pct: 6, color: "bg-destructive", count: 19 },
              { label: "HIGH", pct: 22, color: "bg-orange-500", count: 69 },
              { label: "MEDIUM", pct: 41, color: "bg-amber-500", count: 128 },
              { label: "LOW", pct: 26, color: "bg-emerald-500", count: 82 },
              { label: "INFO", pct: 5, color: "bg-sky-500", count: 15 },
            ].map((s) => (
              <div key={s.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[0.65rem] font-mono font-bold tracking-wider text-muted-foreground">
                    {s.label}
                  </span>
                  <span className="text-[0.65rem] font-mono text-foreground font-semibold">
                    {s.count}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
                <div className="text-[0.6rem] font-mono text-muted-foreground text-right">
                  {s.pct}%
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-md border border-dashed border-border p-4 text-center">
            <AlertCircle className="w-4 h-4 text-warning mx-auto mb-1" />
            <p className="text-[0.7rem] font-mono text-warning tracking-wider font-bold">
              CHART VISUALIZATION — COMING SOON
            </p>
            <p className="text-[0.65rem] text-muted-foreground mt-1">
              Recharts/d3-based interactive timeline, MITRE ATT&CK heatmap, and sensor-by-sensor
              drilldown will render live when the SOC pipeline populates intel_events.
            </p>
          </div>
        </section>

        {/* RESEARCH CORNER */}
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-xs">
          <SectionHeader
            step="SECTION 06"
            stepVariant="success"
            icon={Microscope}
            title="Defensive Research Corner"
            accuracy="RESEARCH"
            description="Working papers, preprints, and adversary-emulation blueprints authored by the NISQ Vanguard research unit. Content is explicitly marked RESEARCH — not finalized SOC guidance, suitable for Academy reading and critique."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RESEARCH_TOPICS.map((r, idx) => (
              <article
                key={idx}
                className="rounded-lg border border-border bg-gradient-to-br from-violet-500/5 via-card to-accent/5 p-4 sm:p-5 space-y-2.5 hover:border-violet-500/40 transition-colors"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <AccuracyBadge accuracy="RESEARCH" />
                  <span className="text-[0.6rem] font-mono font-bold text-muted-foreground">
                    {r.eta.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-foreground leading-snug">
                  {r.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.summary}</p>
                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[0.65rem] font-mono text-muted-foreground">
                    {r.researcher}
                  </span>
                  <button className="inline-flex items-center gap-1 text-[0.65rem] font-mono font-semibold px-2.5 py-1 rounded border border-border bg-background hover:bg-muted hover:border-violet-500/40 text-primary">
                    <Microscope className="w-3 h-3" />
                    <span>READ DRAFT</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SECURITY ADVISORIES */}
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-xs">
          <SectionHeader
            step="SECTION 07"
            stepVariant="destructive"
            icon={AlertOctagon}
            title="Security Advisories"
            accuracy="STATIC"
            description="CVE and internal NISQ-SA tracking. Patch status is static and shown for training; production environments must cross-reference vendor CNA databases directly before remediation planning."
          />
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-3 text-[0.7rem] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      ID
                    </th>
                    <th className="text-left py-3 px-3 text-[0.7rem] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      Advisory Title
                    </th>
                    <th className="text-left py-3 px-3 text-[0.7rem] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      Severity
                    </th>
                    <th className="text-left py-3 px-3 text-[0.7rem] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      CVSS
                    </th>
                    <th className="text-left py-3 px-3 text-[0.7rem] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right py-3 px-3 text-[0.7rem] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ADVISORIES.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-border/60 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono text-[0.7rem] text-foreground font-semibold whitespace-nowrap">
                        {a.id}
                      </td>
                      <td className="py-3 px-3 text-xs sm:text-sm text-foreground leading-snug">
                        {a.title}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[0.6rem] font-mono font-bold px-2 py-0.5 rounded ${severityBadgeClass(a.severity)}`}
                        >
                          {a.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[0.7rem] text-foreground whitespace-nowrap">
                        {a.cvss === null ? "—" : a.cvss.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-[0.7rem] font-mono text-foreground whitespace-nowrap">
                        {a.status}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <AccuracyBadge accuracy={a.accuracy} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-md border border-dashed border-border p-4 text-center">
            <Shield className="w-4 h-4 text-success mx-auto mb-1" />
            <p className="text-[0.7rem] font-mono font-bold tracking-wider text-success">
              LIVE FEED — COMING SOON
            </p>
            <p className="text-[0.65rem] text-muted-foreground mt-1">
              CVE & NVD RSS auto-ingestion, vendor webhook subscribers, and automated patch-status
              emails will activate when Chief Architect enables intel_advisories Supabase RLS.
            </p>
          </div>
        </section>

        {/* FOOTER LEGAL NOTE */}
        <div className="rounded-lg border border-border bg-muted/20 p-4 sm:p-5">
          <p className="text-[0.65rem] font-mono text-muted-foreground leading-relaxed">
            <span className="font-bold text-foreground">DISCLAIMER: </span>
            All content on the Threat Intelligence dashboard is explicitly tagged with one of LIVE,
            RESEARCH, STATIC, or COMING SOON. STATIC and RESEARCH content is provided solely for
            NISQ Vanguard Academy training and defensive research purposes. Do NOT rely on this page
            for production remediation or incident response; always verify against authoritative
            vendor CNA databases and your own SOC telemetry. LIVE-tagged sections require valid
            authenticated analyst credentials and SOC ingestion pipeline online status.
          </p>
        </div>
      </div>
    </div>
  );
}
