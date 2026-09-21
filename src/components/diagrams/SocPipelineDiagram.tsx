import { useState } from "react";
import { Activity, Database, Filter, Bell, UserCheck, ShieldAlert, ArrowRight, Info } from "lucide-react";

interface PipelineStage {
  step: number;
  name: string;
  role: string;
  exampleData: string;
  analystAction: string;
}

const SOC_STAGES: PipelineStage[] = [
  {
    step: 1,
    name: "Raw Log Ingestion",
    role: "Sensors, endpoints, and network devices stream unformatted event text via Syslog, Winlogbeat, or API hooks.",
    exampleData: "Sep 21 10:14:02 auth-gw sshd[18442]: Failed password for root from 198.51.100.44 port 48212 ssh2",
    analystAction: "Verify log collection health, ensure time synchronization via NTP, and validate agent telemetry heartbeat.",
  },
  {
    step: 2,
    name: "Parsing & Schema Normalization",
    role: "Regex and Grok parsers extract structured key-value pairs and map fields into standard schemas (OCSF, ECS, CEF).",
    exampleData: '{"event.category": "authentication", "event.outcome": "failure", "source.ip": "198.51.100.44", "user.name": "root"}',
    analystAction: "Audit parser regex accuracy and ensure geo-IP enrichment pipelines are functioning properly.",
  },
  {
    step: 3,
    name: "Correlation & Rule Detection",
    role: "SIEM correlation engines (e.g. Sigma rules, Splunk, Elastic) evaluate statistical thresholds across multiple events.",
    exampleData: "RULE_TRIGGER: Count(event.outcome == 'failure') > 100 within 60s WHERE user == 'root'",
    analystAction: "Tune detection thresholds to eliminate false positives from automated service accounts.",
  },
  {
    step: 4,
    name: "Alert Generation & Prioritization",
    role: "The SIEM elevates the correlated finding to an actionable high-severity security alert with MITRE ATT&CK tags.",
    exampleData: "ALERT-8812: [HIGH] SSH Credential Stuffing / Brute Force (MITRE T1110.001)",
    analystAction: "Acknowledge alert in the ticketing queue within the defined SLA response window (e.g. < 15 min).",
  },
  {
    step: 5,
    name: "Analyst Triage & Investigation",
    role: "SOC Analyst queries historical telemetry, determines scope, checks reputation databases (VirusTotal/AbuseIPDB).",
    exampleData: "Finding: Attacker IP 198.51.100.44 is listed in 42 malicious botnet blocklists; 0 logins succeeded.",
    analystAction: "Document indicators of compromise (IOCs), escalate to Tier-2 incident response if host was breached.",
  },
  {
    step: 6,
    name: "Containment & Response (SOAR)",
    role: "Automated playbooks or manual analyst actions block attacker IP at firewall, isolate host, or revoke credentials.",
    exampleData: "ACTION_EXECUTED: iptables -A INPUT -s 198.51.100.44 -j DROP; ticket closed as CONTAINED.",
    analystAction: "Verify containment effectiveness and feed new threat intelligence indicators into detection rules.",
  },
];

export function SocPipelineDiagram() {
  const [activeStage, setActiveStage] = useState<number>(1);
  const current = SOC_STAGES[activeStage - 1];

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-6 shadow-xs my-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div>
          <h4 className="font-display font-bold text-base text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span>Interactive SOC Telemetry & Detection Pipeline</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Trace how a raw security event transforms from initial log ingestion into an analyst-verified incident response.
          </p>
        </div>
        <span className="text-[0.65rem] font-mono uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          SIEM Architecture
        </span>
      </div>

      {/* Sequential Pipeline Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {SOC_STAGES.map((s) => (
          <button
            key={s.step}
            onClick={() => setActiveStage(s.step)}
            className={`p-3 rounded-xl border text-left transition-all space-y-1 ${
              activeStage === s.step
                ? "border-primary bg-primary/15 ring-2 ring-primary/30 text-primary font-semibold"
                : "border-border bg-muted/20 hover:border-primary/40 text-foreground"
            }`}
          >
            <div className="flex items-center justify-between text-[0.65rem] font-mono">
              <span>0{s.step}</span>
              <span className="uppercase">{s.name.split(" ")[0]}</span>
            </div>
            <div className="font-semibold text-xs truncate">{s.name}</div>
          </button>
        ))}
      </div>

      {/* Stage Inspection Details */}
      {current && (
        <div className="rounded-xl border border-primary/30 bg-muted/20 p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h5 className="font-display font-bold text-base text-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <span>Step 0{current.step}: {current.name}</span>
            </h5>
          </div>

          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
            {current.role}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 text-slate-100 border border-slate-800 space-y-1">
              <span className="text-[0.65rem] text-slate-400 uppercase font-semibold">
                Telemetry Payload / Data Representation
              </span>
              <div className="text-[0.7rem] break-all leading-relaxed text-green-400">
                {current.exampleData}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-card border border-border space-y-1">
              <span className="text-[0.65rem] uppercase text-primary font-semibold">
                Security Analyst Operation
              </span>
              <p className="text-foreground/90 font-sans text-xs leading-relaxed">
                {current.analystAction}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
