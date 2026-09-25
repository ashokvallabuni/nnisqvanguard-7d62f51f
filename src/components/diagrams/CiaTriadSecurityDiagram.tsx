import { useState } from "react";
import { Shield, Lock, CheckCircle2, Server, AlertTriangle, Info, ArrowRight } from "lucide-react";

interface PillarDetail {
  id: string;
  name: string;
  definition: string;
  realWorldExample: string;
  attackVector: string;
  defensiveControls: string[];
}

const CIA_PILLARS: Record<string, PillarDetail> = {
  confidentiality: {
    id: "confidentiality",
    name: "Confidentiality",
    definition:
      "Ensuring that sensitive information is accessible only to authorized entities and protected from unauthorized disclosure.",
    realWorldExample:
      "Protecting patient medical records, source code repositories, and user passwords from being leaked.",
    attackVector:
      "Data exfiltration, eavesdropping, SQL injection database dumps, unauthorized file reading.",
    defensiveControls: [
      "AES-256 / TLS Encryption",
      "Role-Based Access Control (RBAC)",
      "MFA Authentication",
      "Data Loss Prevention (DLP)",
    ],
  },
  integrity: {
    id: "integrity",
    name: "Integrity",
    definition:
      "Guarding against improper information modification, deletion, or tampering to ensure authenticity and accuracy.",
    realWorldExample: "Ensuring a bank transfer of $100 cannot be modified in transit to $10,000.",
    attackVector:
      "Man-in-the-Middle (MitM) payload alteration, unauthorized database updates, software supply-chain tampering.",
    defensiveControls: [
      "Cryptographic Hashes (SHA-256)",
      "Digital Signatures",
      "HMAC Verification",
      "Audit Logging & File Integrity Monitoring (FIM)",
    ],
  },
  availability: {
    id: "availability",
    name: "Availability",
    definition:
      "Ensuring timely, reliable, and uninterrupted access to systems and data for authorized users whenever needed.",
    realWorldExample:
      "Ensuring 911 dispatch networks, emergency healthcare portals, and banking APIs remain online during traffic spikes.",
    attackVector:
      "Distributed Denial of Service (DDoS) attacks, ransomware encryption of critical databases, hardware failures.",
    defensiveControls: [
      "Redundant Infrastructure / High Availability",
      "DDoS Mitigation Scrubbing",
      "Disaster Recovery Backups",
      "Load Balancing",
    ],
  },
};

export function CiaTriadSecurityDiagram() {
  const [selectedPillar, setSelectedPillar] = useState<string>("confidentiality");
  const current = CIA_PILLARS[selectedPillar];

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-6 shadow-xs my-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div>
          <h4 className="font-display font-bold text-base text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>The CIA Triad & Core Cybersecurity Architecture</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click each pillar to examine definitions, attack mechanisms, and defensive technical
            controls.
          </p>
        </div>
        <span className="text-[0.65rem] font-mono uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          NIST SP 800-53
        </span>
      </div>

      {/* CIA Interactive Triangle */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setSelectedPillar("confidentiality")}
          className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
            selectedPillar === "confidentiality"
              ? "border-primary bg-primary/10 ring-2 ring-primary/30 text-primary"
              : "border-border bg-muted/20 hover:border-primary/40 text-foreground"
          }`}
        >
          <div className="flex items-center justify-between">
            <Lock className="w-5 h-5" />
            <span className="text-[0.65rem] font-mono uppercase">C</span>
          </div>
          <div className="font-display font-bold text-sm">Confidentiality</div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            Prevent unauthorized viewing or disclosure of sensitive data.
          </p>
        </button>

        <button
          onClick={() => setSelectedPillar("integrity")}
          className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
            selectedPillar === "integrity"
              ? "border-accent bg-accent/15 ring-2 ring-accent/30 text-accent"
              : "border-border bg-muted/20 hover:border-accent/40 text-foreground"
          }`}
        >
          <div className="flex items-center justify-between">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[0.65rem] font-mono uppercase">I</span>
          </div>
          <div className="font-display font-bold text-sm">Integrity</div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            Prevent unauthorized modification or tampering of information.
          </p>
        </button>

        <button
          onClick={() => setSelectedPillar("availability")}
          className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
            selectedPillar === "availability"
              ? "border-warning bg-warning/15 ring-2 ring-warning/30 text-warning"
              : "border-border bg-muted/20 hover:border-warning/40 text-foreground"
          }`}
        >
          <div className="flex items-center justify-between">
            <Server className="w-5 h-5" />
            <span className="text-[0.65rem] font-mono uppercase">A</span>
          </div>
          <div className="font-display font-bold text-sm">Availability</div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            Ensure systems and data are accessible to authorized users at all times.
          </p>
        </button>
      </div>

      {/* Selected Pillar Detailed Breakdown */}
      {current && (
        <div className="rounded-xl border border-primary/30 bg-muted/20 p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h5 className="font-display font-bold text-base text-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <span>{current.name} Breakdown</span>
            </h5>
          </div>

          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
            {current.definition}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-lg bg-card border border-border space-y-1">
              <span className="font-mono text-[0.65rem] uppercase text-muted-foreground font-semibold">
                Real-World Scenario
              </span>
              <p className="text-foreground/90 leading-relaxed">{current.realWorldExample}</p>
            </div>

            <div className="p-3 rounded-lg bg-card border border-destructive/30 space-y-1">
              <span className="font-mono text-[0.65rem] uppercase text-destructive font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Attack Vectors
              </span>
              <p className="text-foreground/90 leading-relaxed">{current.attackVector}</p>
            </div>

            <div className="p-3 rounded-lg bg-card border border-success/30 space-y-1.5">
              <span className="font-mono text-[0.65rem] uppercase text-success font-semibold flex items-center gap-1">
                <Shield className="w-3 h-3" /> Defensive Controls
              </span>
              <ul className="space-y-1 text-foreground/90 font-mono text-[0.65rem]">
                {current.defensiveControls.map((c, i) => (
                  <li key={i}>✓ {c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Threat Modeling Flow Diagram */}
      <div className="p-4 rounded-xl border border-border bg-slate-950 text-slate-100 font-mono text-xs space-y-3">
        <div className="text-muted-foreground text-[0.7rem] uppercase border-b border-border pb-1">
          The Universal Threat Model Lifecycle:
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 text-center py-2 text-[0.7rem]">
          <span className="px-2.5 py-1 rounded bg-primary/20 text-primary font-bold">ASSET</span>
          <span className="text-slate-500">$\longrightarrow$</span>
          <span className="px-2.5 py-1 rounded bg-red-950/60 text-red-400 font-bold">THREAT</span>
          <span className="text-slate-500">$\longrightarrow$</span>
          <span className="px-2.5 py-1 rounded bg-amber-950/60 text-amber-400 font-bold">
            VULNERABILITY
          </span>
          <span className="text-slate-500">$\longrightarrow$</span>
          <span className="px-2.5 py-1 rounded bg-purple-950/60 text-purple-400 font-bold">
            RISK
          </span>
          <span className="text-slate-500">$\longrightarrow$</span>
          <span className="px-2.5 py-1 rounded bg-green-950/60 text-green-400 font-bold">
            CONTROL
          </span>
        </div>
      </div>
    </div>
  );
}
