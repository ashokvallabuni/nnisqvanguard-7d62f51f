import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Info,
  Activity,
} from "lucide-react";

interface HandshakeStep {
  step: number;
  name: string;
  sender: "Client" | "Server";
  receiver: "Client" | "Server";
  flags: string;
  seqNumber: string;
  ackNumber: string;
  description: string;
  securityNotes: string;
}

const HANDSHAKE_STEPS: HandshakeStep[] = [
  {
    step: 1,
    name: "SYN (Synchronize)",
    sender: "Client",
    receiver: "Server",
    flags: "SYN=1, ACK=0",
    seqNumber: "ISN (e.g. 1000)",
    ackNumber: "0",
    description:
      "The client selects an Initial Sequence Number (ISN) and sends a TCP packet with the SYN flag set to request a new reliable connection on port 443.",
    securityNotes:
      "Adversaries exploit this step in SYN Flood attacks by transmitting thousands of spoofed SYN packets without completing the handshake, exhausting the server's TCP backlog queue.",
  },
  {
    step: 2,
    name: "SYN-ACK (Synchronize-Acknowledge)",
    sender: "Server",
    receiver: "Client",
    flags: "SYN=1, ACK=1",
    seqNumber: "Server ISN (e.g. 5000)",
    ackNumber: "Client ISN + 1 (1001)",
    description:
      "The server acknowledges the client's ISN by setting Ack = 1001, chooses its own random ISN (5000), and sends a SYN-ACK packet back to the client.",
    securityNotes:
      "Servers use SYN Cookies (cryptographically derived sequence numbers) to resist SYN flood resource exhaustion without allocating state in memory until step 3 arrives.",
  },
  {
    step: 3,
    name: "ACK (Acknowledge)",
    sender: "Client",
    receiver: "Server",
    flags: "SYN=0, ACK=1",
    seqNumber: "1001",
    ackNumber: "Server ISN + 1 (5001)",
    description:
      "The client acknowledges the server's sequence number by setting Ack = 5001. The connection transitions to ESTABLISHED on both endpoints.",
    securityNotes:
      "Once ESTABLISHED, TLS negotiation (ClientHello / ServerHello) begins over this reliable byte stream. TCP RST packets can be injected by adversaries if sequence numbers are guessable.",
  },
];

export function TcpHandshakeDiagram() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const current = HANDSHAKE_STEPS[activeStep - 1];

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-6 shadow-xs my-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div>
          <h4 className="font-display font-bold text-base text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span>Interactive TCP 3-Way Handshake Visualizer</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click each packet phase (01 $\to$ 02 $\to$ 03) to inspect the TCP header flags, sequence
            math, and security implications.
          </p>
        </div>
        <span className="text-[0.65rem] font-mono uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          RFC 793 / RFC 9293
        </span>
      </div>

      {/* Step Selector Pills */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/20 p-1">
          {HANDSHAKE_STEPS.map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                activeStep === s.step
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Phase 0{s.step}: {s.name.split(" ")[0]}
            </button>
          ))}
        </div>

        <button
          onClick={() => setActiveStep(activeStep < 3 ? activeStep + 1 : 1)}
          className="text-xs font-mono px-3 py-1.5 rounded-md border border-border bg-card hover:bg-muted text-foreground flex items-center gap-1.5"
        >
          <span>{activeStep < 3 ? "Next Packet →" : "Restart Sequence ↺"}</span>
        </button>
      </div>

      {/* Visual Sequence Animation Diagram */}
      <div className="p-6 rounded-xl border border-border bg-slate-950 text-slate-100 font-mono text-xs space-y-4">
        <div className="flex justify-between items-center text-muted-foreground border-b border-border pb-2">
          <span className="text-primary font-bold">CLIENT (192.168.1.10:54102)</span>
          <span className="text-xs text-slate-500">PACKET TRANSMISSION</span>
          <span className="text-accent font-bold">SERVER (203.0.113.50:443)</span>
        </div>

        <div className="space-y-4 py-2">
          {/* Packet 1 */}
          <div
            onClick={() => setActiveStep(1)}
            className={`cursor-pointer p-3 rounded-lg border transition-all ${
              activeStep === 1
                ? "border-primary bg-primary/20 ring-1 ring-primary text-white"
                : "border-border bg-slate-900/40 text-muted-foreground opacity-60 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary">1. [SYN]</span>
              <div className="flex items-center gap-2 text-[0.7rem]">
                <span>------------------- [ SYN=1, ACK=0, Seq=1000 ] ------------------&gt;</span>
              </div>
              <span className="text-slate-300">LISTEN $\to$ SYN-RCVD</span>
            </div>
          </div>

          {/* Packet 2 */}
          <div
            onClick={() => setActiveStep(2)}
            className={`cursor-pointer p-3 rounded-lg border transition-all ${
              activeStep === 2
                ? "border-accent bg-accent/20 ring-1 ring-accent text-white"
                : "border-border bg-slate-900/40 text-muted-foreground opacity-60 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-300">SYN-SENT</span>
              <div className="flex items-center gap-2 text-[0.7rem]">
                <span>
                  &lt;------------------ [ SYN=1, ACK=1, Seq=5000, Ack=1001 ] ----------------
                </span>
              </div>
              <span className="font-bold text-accent">2. [SYN-ACK]</span>
            </div>
          </div>

          {/* Packet 3 */}
          <div
            onClick={() => setActiveStep(3)}
            className={`cursor-pointer p-3 rounded-lg border transition-all ${
              activeStep === 3
                ? "border-success bg-success/20 ring-1 ring-success text-white"
                : "border-border bg-slate-900/40 text-muted-foreground opacity-60 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-success">3. [ACK]</span>
              <div className="flex items-center gap-2 text-[0.7rem]">
                <span>
                  ------------------- [ SYN=0, ACK=1, Seq=1001, Ack=5001 ] ------------------&gt;
                </span>
              </div>
              <span className="text-success font-bold">ESTABLISHED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Packet Technical Details Card */}
      <div className="rounded-xl border border-primary/30 bg-muted/20 p-5 space-y-4 animate-in fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[0.65rem] font-mono text-muted-foreground uppercase">
              Phase 0{current.step} Analysis
            </span>
            <h5 className="font-display font-bold text-base text-foreground">
              {current.name} ({current.sender} $\to$ {current.receiver})
            </h5>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-card border border-border">
            Flags: {current.flags}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
          {current.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-lg bg-card border border-border space-y-1">
            <span className="font-mono text-[0.65rem] uppercase text-muted-foreground font-semibold">
              Sequence Number Calculations
            </span>
            <div className="font-mono text-[0.7rem] text-foreground">
              <div>
                Sequence: <span className="text-primary font-bold">{current.seqNumber}</span>
              </div>
              <div>
                Acknowledgment: <span className="text-accent font-bold">{current.ackNumber}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-card border border-destructive/30 space-y-1">
            <span className="font-mono text-[0.65rem] uppercase text-destructive font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Security & Attack Vectors
            </span>
            <p className="text-foreground/90 leading-relaxed">{current.securityNotes}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
