import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Activity,
  Award,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  ListChecks,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/common/PageHeader";
import { labExecutionService } from "@/lib/lab-execution";
import {
  submitLabFlag,
  stopLabSession,
  resetLabSession,
} from "@/lib/lab-runner.functions";

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

// ─── Safe error code → user message mapping ────────────────────────────────
const ERROR_MESSAGES: Record<string, string> = {
  LAB_INFRASTRUCTURE_NOT_CONFIGURED:
    "The lab container runner is not reachable. Please start the Lab Runner (scripts/start-nisq-labs.ps1) and try again.",
  LAB_EXECUTION_UNAVAILABLE:
    "The lab execution service is temporarily unavailable. Please try again in a moment.",
  UNAUTHORIZED: "Your session has expired. Please sign out and sign back in.",
  SESSION_NOT_FOUND:
    "Your lab session was not found. It may have expired — click 'Start Lab' to create a new session.",
  INVALID_COMMAND:
    "That command is not permitted inside the sandbox environment.",
  TASK_INVALID: "The task you attempted to submit could not be verified.",
  FLAG_INVALID: "The flag format is invalid. Expected FLAG{…}.",
  SESSION_INACTIVE: "Your session is no longer active. Start a new session to continue.",
};

function safeErrorMessage(code?: string): string {
  if (!code) return "An unexpected error occurred. Please try again.";
  return ERROR_MESSAGES[code] ?? "An error occurred. Please try again.";
}

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
}

// Canonical lab configurations — correct_flag is NEVER stored here (runner validates it)
const LAB_CONFIGS: Record<string, LabData> = {
  "linux-ssh-brute-force-investigation": {
    id: "lab-ssh-bruteforce",
    slug: "linux-ssh-brute-force-investigation",
    title: "Linux SSH Brute Force Investigation",
    difficulty: "EASY",
    category: "Host Forensics",
    description:
      "An external adversary is conducting an automated credential-stuffing attack against the production gateway. Inspect /var/log/auth.log, identify the attacker's IP, determine the target accounts, and block the range.",
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
        title: "Extract the security flag from the vault",
        description: "Submit the captured flag found in /opt/nisq/vault/flag.txt once verified.",
        command_hint: "cat /opt/nisq/vault/flag.txt",
        completed: false,
      },
    ],
    hints: [
      "Use 'grep \"Failed password\" /var/log/auth.log' to view unauthorized login bursts.",
      "The attacker's source IP address can be found in the log entries.",
      "The flag is located at /opt/nisq/vault/flag.txt.",
    ],
  },
  "suricata-network-threat-hunting": {
    id: "lab-suricata-nids",
    slug: "suricata-network-threat-hunting",
    title: "Suricata Network Threat Hunting & PCAP Analysis",
    difficulty: "MEDIUM",
    category: "Network Defense",
    description:
      "Inspect captured perimeter traffic from an active C2 beaconing incident. Identify beaconing intervals, uncover DNS tunneling payloads, and extract the exfiltrated flag.",
    estimated_minutes: 45,
    reward_points: 150,
    learning_objectives: [
      "Analyze network PCAP files using tshark and Wireshark filters",
      "Detect regular interval beaconing traffic associated with C2 frameworks",
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
        command_hint:
          "tshark -r /captures/incident.pcap -Y 'dns.flags.response == 0' -T fields -e dns.qry.name",
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
  },
};

function getLabConfig(slug: string): LabData {
  if (LAB_CONFIGS[slug]) return LAB_CONFIGS[slug];
  return {
    id: `lab-${slug}`,
    slug,
    title: slug.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
    difficulty: "MEDIUM",
    category: "Cyber Range",
    description:
      "Investigate security artifacts in this containerized sandbox workbench. Use Linux forensics commands to analyze telemetry, fulfill tasks, and locate the challenge flag.",
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
  };
}

// Mobile tab options
type MobileTab = "terminal" | "tasks" | "progress";

function CyberLabWorkbenchPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [labConfig] = useState<LabData>(getLabConfig(slug));
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStarting, setSessionStarting] = useState(false);
  const [infraStatus, setInfraStatus] = useState<"idle" | "ready" | "unconfigured" | "error">(
    "idle",
  );
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionTimer, setSessionTimer] = useState(labConfig.estimated_minutes * 60);
  const [mobileTab, setMobileTab] = useState<MobileTab>("terminal");

  // Terminal state
  const [commandInput, setCommandInput] = useState("");
  const [history, setHistory] = useState<string[]>([
    "NISQ Cyber Range Container v2.4 (Ubuntu 22.04 LTS)",
    "Type 'help' for available commands.",
    "Session initialized. Sandbox storage mounted at /var/log and /opt/nisq.",
    "",
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Hints and Flag state
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [flagInput, setFlagInput] = useState("");
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [labSolved, setLabSolved] = useState(false);

  // ── Fetch persistent progress from Supabase ───────────────────────────────
  const { data: persistedProgress } = useQuery({
    queryKey: ["lab-progress", user?.id, labConfig.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("lab_progress")
        .select("completed, tasks_completed, total_tasks, points")
        .eq("user_id", user.id)
        .eq("lab_id", labConfig.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Sync persisted solved state on mount
  useEffect(() => {
    if (persistedProgress?.completed) setLabSolved(true);
  }, [persistedProgress]);

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

  // ── Session management ────────────────────────────────────────────────────
  const handleStartSession = async () => {
    setSessionStarting(true);
    setInfraStatus("idle");
    try {
      const res = await labExecutionService.createSession(slug);
      if (res.state === "configuration_required") {
        setInfraStatus("unconfigured");
        setSessionActive(false);
        toast.error(safeErrorMessage("LAB_INFRASTRUCTURE_NOT_CONFIGURED"));
      } else if (res.state === "running" || res.state === "completed") {
        setInfraStatus("ready");
        setSessionActive(true);
        setActiveSessionId(res.id);
        setHistory((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Authenticated sandbox session created (ID: ${res.id})`,
          `[${new Date().toLocaleTimeString()}] Isolated container environment ready.`,
          "analyst@nisq-range:~$ ",
        ]);
        toast.success("Cyber Range container started successfully.");
        // Switch to terminal tab on mobile after start
        setMobileTab("terminal");
      } else {
        setInfraStatus("error");
        toast.error(safeErrorMessage(res.message));
      }
    } catch {
      setInfraStatus("unconfigured");
      toast.error(safeErrorMessage("LAB_INFRASTRUCTURE_NOT_CONFIGURED"));
    } finally {
      setSessionStarting(false);
    }
  };

  const handleStopSession = async () => {
    if (activeSessionId) {
      await stopLabSession({ data: { labId: slug, sessionId: activeSessionId } }).catch(() => null);
    }
    setSessionActive(false);
    setActiveSessionId(null);
    setHistory((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Container instance terminated. Session stopped.`,
    ]);
    toast.info("Container session terminated.");
  };

  const handleResetSession = async () => {
    if (!activeSessionId) return;
    try {
      await resetLabSession({ data: { labId: slug, sessionId: activeSessionId } });
      setHistory([
        "NISQ Cyber Range Container v2.4 (Ubuntu 22.04 LTS)",
        `[${new Date().toLocaleTimeString()}] Container reset. Fresh environment ready.`,
        "analyst@nisq-range:~$ ",
      ]);
      toast.success("Container reset to clean state.");
    } catch {
      toast.error("Failed to reset container.");
    }
  };

  // ── Terminal command execution ─────────────────────────────────────────────
  const handleExecuteCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setCommandInput("");

    // Try real runner first
    if (activeSessionId) {
      try {
        const res = await labExecutionService.executeTerminal(slug, activeSessionId, cmd);
        if (res.error) {
          setHistory((prev) => [
            ...prev,
            `analyst@nisq-range:~$ ${cmd}`,
            safeErrorMessage(res.error),
          ]);
          return;
        }
        const out = res.stdout || res.stderr || "";
        setHistory((prev) => [...prev, `analyst@nisq-range:~$ ${cmd}`, ...(out ? [out] : [])]);
        return;
      } catch {
        // fallthrough — session may be transiently unavailable
      }
    }

    // Offline-mode fallback (no mock completions, no fake flag output)
    const newLogs = [`analyst@nisq-range:~$ ${cmd}`];
    const lowerCmd = cmd.toLowerCase();

    if (lowerCmd === "clear") {
      setHistory([]);
      return;
    } else if (lowerCmd === "help") {
      newLogs.push(
        "Available commands in this sandbox:",
        "  ls, cat, grep, awk, sort, uniq, head, tail",
        "  tshark, suricata, volatility, nmap",
        "  check          - Run task verification",
        "  clear          - Clear terminal screen",
        "  help           - Show this manual",
        "",
        "Note: Start a live sandbox session to execute commands against real data.",
      );
    } else if (lowerCmd === "check") {
      const completed = persistedProgress?.tasks_completed ?? 0;
      const total = persistedProgress?.total_tasks ?? labConfig.tasks.length;
      newLogs.push(`Task Verification: ${completed}/${total} tasks verified.`);
    } else {
      newLogs.push(
        `Command queued: ${cmd}`,
        "Note: Connect a live sandbox session to execute commands.",
      );
    }

    setHistory((prev) => [...prev, ...newLogs]);
  };

  // Keyboard history navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIndex + 1, commandHistory.length - 1);
      setHistoryIndex(next);
      setCommandInput(commandHistory[commandHistory.length - 1 - next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(historyIndex - 1, -1);
      setHistoryIndex(next);
      setCommandInput(next === -1 ? "" : (commandHistory[commandHistory.length - 1 - next] ?? ""));
    }
  };

  // ── Flag Submission — server-side validation only ─────────────────────────
  const handleSubmitFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim() || !activeSessionId) return;

    if (!flagInput.trim().startsWith("FLAG{")) {
      toast.error(safeErrorMessage("FLAG_INVALID"));
      return;
    }

    setFlagSubmitting(true);
    try {
      const result = await submitLabFlag({
        data: { labId: slug, sessionId: activeSessionId, flag: flagInput.trim() },
      });

      if (result.error) {
        toast.error(safeErrorMessage(result.error));
        return;
      }

      if (result.correct) {
        setLabSolved(true);
        setFlagInput("");
        queryClient.invalidateQueries({ queryKey: ["lab-progress"] });
        queryClient.invalidateQueries({ queryKey: ["user-active-lab-sessions"] });
        queryClient.invalidateQueries({ queryKey: ["user-earned-badges"] });

        if (result.alreadyAwarded) {
          toast.info("Flag already verified — progress previously recorded.");
        } else {
          toast.success(`Flag Verified! +${result.score} XP awarded.`, { duration: 5000 });
        }
      } else {
        toast.error("Incorrect flag. Inspect the logs and try again.");
      }
    } catch {
      toast.error(safeErrorMessage("LAB_EXECUTION_UNAVAILABLE"));
    } finally {
      setFlagSubmitting(false);
    }
  };

  const revealHint = (index: number) => {
    if (revealedHints.includes(index)) return;
    setRevealedHints((prev) => [...prev, index]);
    toast.info("Hint revealed. Full points awarded on independent solve.");
  };

  // ── Derived progress stats ─────────────────────────────────────────────────
  const progressPct = persistedProgress?.total_tasks
    ? Math.round(
        ((persistedProgress.tasks_completed ?? 0) / persistedProgress.total_tasks) * 100,
      )
    : 0;

  // ── Tasks Panel ────────────────────────────────────────────────────────────
  const TasksPanel = () => (
    <div className="space-y-4 overflow-y-auto">
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
            {persistedProgress?.tasks_completed ?? 0}/{persistedProgress?.total_tasks ?? labConfig.tasks.length} Done
          </span>
        </div>
        <div className="space-y-3">
          {labConfig.tasks.map((task, index) => {
            const isCompleted =
              labSolved ||
              (index < (persistedProgress?.tasks_completed ?? 0));
            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-lg border text-xs space-y-1.5 transition-colors ${
                  isCompleted ? "border-success/30 bg-success/5" : "border-border bg-muted/20"
                }`}
              >
                <div className="flex items-start gap-2 justify-between">
                  <div className="flex items-start gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div
                        className={`font-semibold ${isCompleted ? "text-success" : "text-foreground"}`}
                      >
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
            );
          })}
        </div>
      </div>

      {/* Flag Submission */}
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
            disabled={!activeSessionId || labSolved || flagSubmitting}
            className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!activeSessionId || !flagInput.trim() || labSolved || flagSubmitting}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shrink-0 font-mono disabled:opacity-40"
          >
            {flagSubmitting ? "Verifying…" : "Verify Flag"}
          </button>
        </form>
        {!activeSessionId && (
          <p className="text-[0.65rem] font-mono text-muted-foreground">
            Start a sandbox session to submit flags.
          </p>
        )}
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
  );

  // ── Progress Panel ─────────────────────────────────────────────────────────
  const ProgressPanel = () => (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
      <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        Lab Progress
      </h3>
      {labSolved ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/30">
          <Award className="w-8 h-8 text-success" />
          <div>
            <div className="font-bold text-success text-sm">LAB SOLVED</div>
            <div className="text-xs text-muted-foreground">
              +{persistedProgress?.points ?? labConfig.reward_points} XP earned
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-mono text-muted-foreground">
            <span>Tasks</span>
            <span>
              {persistedProgress?.tasks_completed ?? 0} /{" "}
              {persistedProgress?.total_tasks ?? labConfig.tasks.length}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {progressPct > 0
              ? `${progressPct}% complete — progress saved to your account.`
              : "Start the sandbox and complete tasks to earn XP."}
          </div>
        </div>
      )}

      {sessionActive && activeSessionId && (
        <div className="pt-3 border-t border-border flex gap-2">
          <button
            onClick={handleResetSession}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Container
          </button>
        </div>
      )}
    </div>
  );

  // ── Terminal Panel ─────────────────────────────────────────────────────────
  const TerminalPanel = () => (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-md">
      {/* Terminal top bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="font-mono text-xs text-slate-300 ml-2">analyst@nisq-range-sandbox</span>
        </div>
        <div className="flex items-center gap-3 text-[0.65rem] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-green-400" />
            {sessionActive ? "CONTAINER ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* Terminal body */}
      {infraStatus === "unconfigured" ? (
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4 font-mono">
          <div className="p-3.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              Lab Infrastructure Not Configured
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {safeErrorMessage("LAB_INFRASTRUCTURE_NOT_CONFIGURED")}
            </p>
          </div>
        </div>
      ) : !sessionActive ? (
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-3 font-mono text-slate-400">
          <Terminal className="w-8 h-8 text-slate-600" />
          <p className="text-xs max-w-md">
            Click <span className="text-primary font-semibold">&quot;Start Lab Sandbox&quot;</span>{" "}
            above to authenticate and provision your isolated sandbox session.
          </p>
        </div>
      ) : (
        <div className="flex-1 p-4 overflow-y-auto overflow-x-auto font-mono text-xs text-slate-200 space-y-1 selection:bg-primary selection:text-white">
          {history.map((line, idx) => (
            <div key={idx} className="whitespace-pre leading-relaxed min-w-0">
              {line}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      )}

      {/* Command input */}
      <form
        onSubmit={handleExecuteCommand}
        className="border-t border-slate-800 bg-slate-900/60 p-2.5 flex items-center gap-2 shrink-0"
      >
        <span className="font-mono text-xs text-green-400 pl-2 shrink-0">
          analyst@nisq-range:~$
        </span>
        <input
          type="text"
          disabled={!sessionActive}
          placeholder={
            sessionActive
              ? "Type command (e.g. ls, cat, grep, check)..."
              : "Start sandbox container above to run commands"
          }
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none disabled:opacity-50 min-w-0"
          autoFocus
        />
        <button
          type="submit"
          disabled={!sessionActive || !commandInput.trim()}
          className="px-3 py-1 rounded bg-slate-800 text-slate-200 font-mono text-xs hover:bg-slate-700 disabled:opacity-40 transition-colors shrink-0"
        >
          Send ↵
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen pt-16 pb-20 bg-background">
      {/* Workbench Header */}
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
                <Award className="w-4 h-4" /> SOLVED (+{persistedProgress?.points ?? labConfig.reward_points} XP)
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
                <span>{sessionStarting ? "Provisioning Sandbox…" : "Start Lab Sandbox"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* ── Mobile Tab Bar (< 768px) ──────────────────────────────────── */}
        <div className="flex md:hidden border border-border rounded-xl overflow-hidden mb-4 text-xs font-mono">
          {(
            [
              { id: "terminal", label: "Terminal", icon: Terminal },
              { id: "tasks", label: "Tasks", icon: ListChecks },
              { id: "progress", label: "Progress", icon: BarChart3 },
            ] as { id: MobileTab; label: string; icon: React.ElementType }[]
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMobileTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 transition-colors ${
                mobileTab === id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Mobile View ──────────────────────────────────────────────── */}
        <div className="md:hidden">
          {mobileTab === "terminal" && (
            <div className="h-[65vh] flex flex-col">
              <TerminalPanel />
            </div>
          )}
          {mobileTab === "tasks" && (
            <div className="overflow-y-auto pb-6">
              <TasksPanel />
            </div>
          )}
          {mobileTab === "progress" && (
            <div className="pb-6">
              <ProgressPanel />
            </div>
          )}
        </div>

        {/* ── Desktop Split View (≥ 768px) ──────────────────────────────── */}
        <div className="hidden md:grid grid-cols-12 gap-6">
          {/* Left: Tasks + Hints + Flag (5 cols) */}
          <div className="col-span-5 space-y-4">
            <TasksPanel />
            <ProgressPanel />
          </div>

          {/* Right: Terminal (7 cols) */}
          <div className="col-span-7 h-[680px] flex flex-col">
            <TerminalPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
