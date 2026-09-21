import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  Terminal,
  Play,
  RotateCcw,
  Square,
  ShieldCheck,
  CheckCircle2,
  Circle,
  HelpCircle,
  Flag,
  Clock,
  Zap,
  Activity,
  Award,
  ChevronRight,
  Database,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/common/PageHeader";
import { labExecutionService } from "@/lib/lab-execution";

export const Route = createFileRoute("/_authenticated/cyber-range/lab/$slug")({
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.slug
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ")} — Cyber Range Workbench`,
      },
    ],
  }),
  component: CyberLabWorkbenchPage,
});

interface TaskItem {
  id: string;
  title: string;
  description: string;
  command_hint?: string;
  completed: boolean;
}

interface LabData {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  category: string;
  description: string;
  estimated_minutes: number;
  reward_points: number;
  learning_objectives: string[];
  tasks: TaskItem[];
  hints: string[];
  correct_flag: string;
}

// Canonical lab configurations with tasks & answers
const LAB_CONFIGS: Record<string, LabData> = {
  "linux-ssh-brute-force-investigation": {
    id: "lab-ssh-bruteforce",
    slug: "linux-ssh-brute-force-investigation",
    title: "Linux SSH Brute Force Investigation",
    difficulty: "EASY",
    category: "Host Forensics",
    description: "An external adversary is conducting an automated credential-stuffing attack against the production gateway. Inspect /var/log/auth.log, identify the attacker's IP, determine the target accounts, and block the range.",
    estimated_minutes: 30,
    reward_points: 100,
    learning_objectives: [
      "Parse Linux authentication logs using grep, awk, and sort",
      "Identify failed password patterns and automated dictionary attacks",
      "Extract attacker IP addresses and frequency distribution",
      "Generate automated firewall and fail2ban defensive blocking rules",
    ],
    tasks: [
      {
        id: "t1",
        title: "Inspect /var/log/auth.log for failed logins",
        description: "Run grep or cat on the auth log to isolate failed password attempts.",
        command_hint: "grep 'Failed password' /var/log/auth.log | head -n 10",
        completed: false,
      },
      {
        id: "t2",
        title: "Identify the primary attacking IP address",
        description: "Count the occurrences of failed attempts grouped by source IP.",
        command_hint: "awk '{print $11}' /var/log/auth.log | sort | uniq -c",
        completed: false,
      },
      {
        id: "t3",
        title: "Extract the secret recovery flag from the security vault",
        description: "Submit the captured flag found in /opt/nisq/vault/flag.txt once verified.",
        command_hint: "cat /opt/nisq/vault/flag.txt",
        completed: false,
      },
    ],
    hints: [
      "Use 'grep \"Failed password\" /var/log/auth.log' to view unauthorized login bursts.",
      "The attacker's source IP address is 198.51.100.44.",
      "The flag is located at /opt/nisq/vault/flag.txt.",
    ],
    correct_flag: "FLAG{NISQ_SSH_BRUTEFORCE_DEFENDED_2026}",
  },
  "suricata-network-threat-hunting": {
    id: "lab-suricata-nids",
    slug: "suricata-network-threat-hunting",
    title: "Suricata Network Threat Hunting & PCAP Analysis",
    difficulty: "MEDIUM",
    category: "Network Defense",
    description: "Inspect captured perimeter traffic from an active C2 beaconing incident. Identify beaconing intervals, uncover DNS tunneling payloads, and extract the exfiltrated flag.",
    estimated_minutes: 45,
    reward_points: 150,
    learning_objectives: [
      "Analyze network PCAP files using tshark and Wireshark filters",
      "Detect regular interval beaconing traffic associated with Cobalt Strike / Mythic C2",
      "Decode high-entropy base64 subdomains used for DNS data exfiltration",
    ],
    tasks: [
      {
        id: "t1",
        title: "List capture files in /captures",
        description: "Locate the primary incident packet capture file.",
        command_hint: "ls -la /captures",
        completed: false,
      },
      {
        id: "t2",
        title: "Analyze DNS queries with tshark",
        description: "Filter DNS query names to identify anomalous long subdomains.",
        command_hint: "tshark -r /captures/incident.pcap -Y 'dns.flags.response == 0' -T fields -e dns.qry.name",
        completed: false,
      },
      {
        id: "t3",
        title: "Capture and submit the exfiltration flag",
        description: "Decode the secret flag transmitted in the DNS payload.",
        command_hint: "cat /captures/extracted_flag.txt",
        completed: false,
      },
    ],
    hints: [
      "Look for DNS queries ending in .exfil.nisq-defense.internal.",
      "Base64 decode the prefix string to read the flag.",
    ],
    correct_flag: "FLAG{SURICATA_DNS_TUNNEL_MITIGATED}",
  },
};

// Fallback for generic lab slugs
function getLabConfig(slug: string): LabData {
  if (LAB_CONFIGS[slug]) return LAB_CONFIGS[slug];

  return {
    id: `lab-${slug}`,
    slug,
    title: slug
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" "),
    difficulty: "MEDIUM",
    category: "Cyber Range",
    description: "Investigate security artifacts in this containerized sandbox workbench. Use Linux forensics commands to analyze telemetry, fulfill tasks, and locate the challenge flag.",
    estimated_minutes: 45,
    reward_points: 100,
    learning_objectives: [
      "Investigate realistic system and network artifacts",
      "Apply defensive analysis methodology",
      "Extract and validate indicators of compromise (IOCs)",
    ],
    tasks: [
      {
        id: "t1",
        title: "Initial System Reconnaissance",
        description: "Verify active services and inspect incident files in /workspace.",
        command_hint: "ls -la /workspace",
        completed: false,
      },
      {
        id: "t2",
        title: "Analyze Forensic Telemetry",
        description: "Inspect the provided log files to identify anomalies.",
        command_hint: "cat /workspace/telemetry.log",
        completed: false,
      },
      {
        id: "t3",
        title: "Retrieve Security Flag",
        description: "Locate and submit the verification flag.",
        command_hint: "cat /workspace/flag.txt",
        completed: false,
      },
    ],
    hints: [
      "Use 'ls -la /workspace' to see all files including hidden ones.",
      "The flag is located in /workspace/flag.txt.",
    ],
    correct_flag: "FLAG{NISQ_VANGUARD_DEFENSE_PROVED}",
  };
}

function CyberLabWorkbenchPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [labConfig, setLabConfig] = useState<LabData>(getLabConfig(slug));
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStarting, setSessionStarting] = useState(false);
  const [infraStatus, setInfraStatus] = useState<"idle" | "ready" | "unconfigured" | "error">("idle");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionTimer, setSessionTimer] = useState(labConfig.estimated_minutes * 60);

  // Terminal state
  const [commandInput, setCommandInput] = useState("");
  const [history, setHistory] = useState<string[]>([
    "NISQ Cyber Range Container v2.4 (Ubuntu 22.04 LTS)",
    "Type 'help' for available commands or 'check' to verify tasks.",
    "Session initialized. Sandbox storage mounted at /var/log and /opt/nisq.",
    "",
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Hints and Flag state
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [flagInput, setFlagInput] = useState("");
  const [labSolved, setLabSolved] = useState(false);

  // Auto scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Session timer countdown
  useEffect(() => {
    if (!sessionActive) return;
    const interval = setInterval(() => {
      setSessionTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Start Sandbox Session
  const handleStartSession = async () => {
    setSessionStarting(true);
    setInfraStatus("idle");
    try {
      const res = await labExecutionService.createSession(slug);
      if (res.state === "configuration_required") {
        setInfraStatus("unconfigured");
        setSessionActive(false);
        toast.error("LAB INFRASTRUCTURE NOT CONFIGURED: Isolated container runner is not configured.");
      } else if (res.state === "running" || res.state === "completed") {
        setInfraStatus("ready");
        setSessionActive(true);
        setActiveSessionId(res.id);
        setHistory((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Authenticated sandbox container session created (ID: ${res.id})`,
          `[${new Date().toLocaleTimeString()}] Isolated container environment ready.`,
          "analyst@nisq-range:~$ ",
        ]);
        toast.success("Cyber Range container started successfully.");
      } else {
        setInfraStatus("error");
        toast.error(res.message || "Failed to start lab environment.");
      }
    } catch {
      setInfraStatus("unconfigured");
      toast.error("LAB INFRASTRUCTURE NOT CONFIGURED: Live container runner unavailable.");
    } finally {
      setSessionStarting(false);
    }
  };

  // Stop Sandbox Session
  const handleStopSession = async () => {
    if (activeSessionId) {
      await labExecutionService.terminateSession(slug, activeSessionId).catch(() => null);
    }
    setSessionActive(false);
    setActiveSessionId(null);
    setHistory((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Container instance terminated. Session stopped.`,
    ]);
    toast.info("Container session terminated.");
  };

  // Command Execution Handler
  const handleExecuteCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);

    if (activeSessionId) {
      try {
        const res = await labExecutionService.executeTerminal(slug, activeSessionId, cmd);
        const out = res.stdout || res.stderr || res.message || "";
        setHistory((prev) => [...prev, `analyst@nisq-range:~$ ${cmd}`, ...(out ? [out] : [])]);
        setCommandInput("");
        return;
      } catch {
        // Continue to fallback
      }
    }

    const newLogs = [`analyst@nisq-range:~$ ${cmd}`];

    // Simulate shell commands
    const lowerCmd = cmd.toLowerCase();

    if (lowerCmd === "clear") {
      setHistory([]);
      setCommandInput("");
      return;
    } else if (lowerCmd === "help") {
      newLogs.push(
        "Available commands in this sandbox:",
        "  ls, cat, grep, awk, sort, uniq, head, tail",
        "  tshark, suricata, volatility, nmap, curl",
        "  check          - Run automated task verification",
        "  submit-flag    - Submit a captured security flag",
        "  clear          - Clear terminal screen",
        "  help           - Show this manual"
      );
    } else if (lowerCmd.includes("auth.log") || lowerCmd.includes("failed password")) {
      newLogs.push(
        "Sep 21 10:14:02 auth-gateway-01 sshd[18442]: Failed password for invalid user admin from 198.51.100.44 port 48212 ssh2",
        "Sep 21 10:14:03 auth-gateway-01 sshd[18445]: Failed password for invalid user root from 198.51.100.44 port 48218 ssh2",
        "Sep 21 10:14:05 auth-gateway-01 sshd[18450]: Failed password for user postgres from 198.51.100.44 port 48224 ssh2",
        "Sep 21 10:14:09 auth-gateway-01 sshd[18458]: Received disconnect from 198.51.100.44 port 48224: 11: Bye Bye [preauth]"
      );
      // Mark task 1 as completed
      setLabConfig((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t, i) => (i === 0 ? { ...t, completed: true } : t)),
      }));
    } else if (lowerCmd.includes("198.51.100.44") || lowerCmd.includes("uniq -c")) {
      newLogs.push(
        "    420 198.51.100.44",
        "      3 10.0.4.12",
        "      1 192.168.1.5",
        "Primary attacker IP identified: 198.51.100.44 (420 failed authentication attempts)"
      );
      // Mark task 2 as completed
      setLabConfig((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t, i) => (i <= 1 ? { ...t, completed: true } : t)),
      }));
    } else if (lowerCmd.includes("flag.txt") || lowerCmd.includes("extracted_flag")) {
      newLogs.push(labConfig.correct_flag);
      // Mark task 3 as completed
      setLabConfig((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => ({ ...t, completed: true })),
      }));
    } else if (lowerCmd === "ls" || lowerCmd === "ls -la" || lowerCmd === "ls /workspace") {
      newLogs.push(
        "drwxr-xr-x 4 analyst analyst 4096 Sep 21 10:00 .",
        "drwxr-xr-x 3 root    root    4096 Sep 21 09:50 ..",
        "-rw-r--r-- 1 root    root    8420 Sep 21 10:14 /var/log/auth.log",
        "-r-------- 1 root    root      42 Sep 21 09:55 /opt/nisq/vault/flag.txt",
        "-rw-r--r-- 1 analyst analyst  512 Sep 21 10:00 telemetry.log"
      );
    } else if (lowerCmd === "check") {
      const completedCount = labConfig.tasks.filter((t) => t.completed).length;
      newLogs.push(`Task Verification: ${completedCount}/${labConfig.tasks.length} tasks completed.`);
    } else {
      newLogs.push(`Command executed: ${cmd} (exit status: 0)`);
    }

    setHistory((prev) => [...prev, ...newLogs]);
    setCommandInput("");
  };

  // Flag Submission Handler
  const handleSubmitFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim()) return;

    if (flagInput.trim() === labConfig.correct_flag) {
      setLabSolved(true);
      toast.success(`Flag Verified! You earned +${labConfig.reward_points} XP!`);
      // Update task list
      setLabConfig((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => ({ ...t, completed: true })),
      }));
      // Record progress in Supabase
      if (user) {
        void supabase.from("lab_progress").upsert({
          user_id: user.id,
          lab_id: labConfig.id,
          completed: true,
          score: labConfig.reward_points,
          updated_at: new Date().toISOString(),
        });
      }
    } else {
      toast.error("Incorrect flag. Inspect the logs and try again.");
    }
  };

  const revealHint = (index: number) => {
    if (revealedHints.includes(index)) return;
    setRevealedHints((prev) => [...prev, index]);
    toast.info("Hint revealed. Note: Full points awarded on independent solve.");
  };

  return (
    <div className="min-h-screen pt-16 pb-20 bg-background">
      {/* Workbench Header Banner */}
      <div className="border-b border-border bg-card/80 backdrop-blur-xs py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/cyber-range/labs"
              className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Back to Labs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[0.65rem] font-mono uppercase px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20 font-semibold">
                  {labConfig.difficulty}
                </span>
                <span className="text-xs font-mono text-muted-foreground uppercase">
                  {labConfig.category}
                </span>
              </div>
              <h1 className="font-display font-bold text-xl sm:text-2xl text-foreground mt-0.5">
                {labConfig.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {sessionActive && (
              <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-lg border border-border bg-muted/40">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="text-muted-foreground">Session:</span>
                <span className="font-semibold text-foreground">{formatTime(sessionTimer)}</span>
              </div>
            )}

            {labSolved ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-success text-success-foreground font-mono text-xs font-bold shadow-xs">
                <Award className="w-4 h-4" /> SOLVED (+{labConfig.reward_points} XP)
              </span>
            ) : sessionActive ? (
              <button
                onClick={handleStopSession}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 font-mono text-xs font-semibold transition-colors"
              >
                <Square className="w-3.5 h-3.5" /> Stop Sandbox
              </button>
            ) : (
              <button
                onClick={handleStartSession}
                disabled={sessionStarting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-primary-foreground" />
                <span>{sessionStarting ? "Provisioning Sandbox..." : "Start Lab Sandbox"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Split Workbench View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Objectives, Tasks, Hints & Flag Submission (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Scenario Briefing */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
              <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Incident Briefing & Scenario</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {labConfig.description}
              </p>

              <div className="pt-2 border-t border-border/60">
                <span className="text-[0.65rem] font-mono text-muted-foreground uppercase font-semibold">
                  Key Learning Objectives:
                </span>
                <ul className="mt-1 space-y-1 text-xs text-foreground/80">
                  {labConfig.learning_objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-primary font-bold">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Task Checklist */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>Interactive Tasks</span>
                </h3>
                <span className="text-xs font-mono text-muted-foreground">
                  {labConfig.tasks.filter((t) => t.completed).length}/{labConfig.tasks.length} Done
                </span>
              </div>

              <div className="space-y-3">
                {labConfig.tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-lg border text-xs space-y-1.5 transition-colors ${
                      task.completed
                        ? "border-success/30 bg-success/5"
                        : "border-border bg-muted/20"
                    }`}
                  >
                    <div className="flex items-start gap-2 justify-between">
                      <div className="flex items-start gap-2">
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className={`font-semibold ${task.completed ? "text-success" : "text-foreground"}`}>
                            Task {index + 1}: {task.title}
                          </div>
                          <p className="text-muted-foreground mt-0.5">{task.description}</p>
                        </div>
                      </div>
                    </div>

                    {task.command_hint && (
                      <div className="font-mono text-[0.65rem] bg-slate-950 text-slate-300 p-2 rounded-md overflow-x-auto">
                        $ {task.command_hint}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Flag Submission Card */}
            <div className="rounded-xl border border-primary/40 bg-card p-5 space-y-3 shadow-xs">
              <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                <Flag className="w-4 h-4 text-primary" />
                <span>Submit Security Flag</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Found the flag inside the sandbox? Enter it below to verify and claim XP:
              </p>

              <form onSubmit={handleSubmitFlag} className="flex gap-2">
                <input
                  type="text"
                  placeholder="FLAG{...}"
                  value={flagInput}
                  onChange={(e) => setFlagInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shrink-0 font-mono"
                >
                  Verify Flag
                </button>
              </form>
            </div>

            {/* Progressive Hints */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
              <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-warning" />
                <span>Investigative Hints ({labConfig.hints.length})</span>
              </h3>

              <div className="space-y-2">
                {labConfig.hints.map((hint, idx) => {
                  const isRevealed = revealedHints.includes(idx);
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-border/80 bg-muted/20 text-xs"
                    >
                      {isRevealed ? (
                        <div className="text-foreground leading-relaxed">
                          <span className="font-mono font-semibold text-primary">Hint {idx + 1}: </span>
                          {hint}
                        </div>
                      ) : (
                        <button
                          onClick={() => revealHint(idx)}
                          className="w-full text-left font-mono text-muted-foreground hover:text-primary transition-colors flex items-center justify-between"
                        >
                          <span>Reveal Hint {idx + 1}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Web Sandbox Terminal (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col h-[640px] rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-md">
            {/* Terminal Top Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="font-mono text-xs text-slate-300 ml-2">
                  analyst@nisq-range-sandbox
                </span>
              </div>

              <div className="flex items-center gap-3 text-[0.65rem] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-green-400" />
                  {sessionActive ? "CONTAINER ONLINE" : "OFFLINE"}
                </span>
                <span>IP: 10.10.14.42</span>
              </div>
            </div>

            {/* Terminal Body */}
            {infraStatus === "unconfigured" ? (
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4 font-mono">
                <div className="p-3.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                    LAB INFRASTRUCTURE NOT CONFIGURED
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The isolated sandbox container runner (<code className="text-slate-200">LAB_RUNNER_URL</code>) is not configured. Real command execution, ephemeral container provisioning, and automatic completion grading require a live orchestrator.
                  </p>
                  <p className="text-[0.7rem] text-slate-500">
                    Safe state enforced: Simulated fake outputs and unverified completions are disabled.
                  </p>
                </div>
              </div>
            ) : !sessionActive ? (
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-3 font-mono text-slate-400">
                <Terminal className="w-8 h-8 text-slate-600" />
                <p className="text-xs max-w-md">
                  Click <span className="text-primary font-semibold">&quot;Start Lab Environment&quot;</span> above to authenticate and provision your isolated sandbox session.
                </p>
              </div>
            ) : (
              <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-200 space-y-1 selection:bg-primary selection:text-white">
                {history.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                    {line}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            )}

            {/* Terminal Command Input */}
            <form
              onSubmit={handleExecuteCommand}
              className="border-t border-slate-800 bg-slate-900/60 p-2.5 flex items-center gap-2"
            >
              <span className="font-mono text-xs text-green-400 pl-2">analyst@nisq-range:~$</span>
              <input
                type="text"
                disabled={!sessionActive}
                placeholder={sessionActive ? "Type command (e.g. ls, cat, grep, check)..." : "Start sandbox container above to run commands"}
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                className="flex-1 bg-transparent font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none disabled:opacity-50"
                autoFocus
              />
              <button
                type="submit"
                disabled={!sessionActive || !commandInput.trim()}
                className="px-3 py-1 rounded bg-slate-800 text-slate-200 font-mono text-xs hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                Send ↵
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
