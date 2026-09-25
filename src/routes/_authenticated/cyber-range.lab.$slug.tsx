import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef, useMemo } from "react";
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
  Award,
  ChevronRight,
  ArrowLeft,
  ListChecks,
  BarChart3,
  Home,
  LogOut,
  FolderOpen
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { VirtualFileSystem } from "@/labs/engine/filesystem/vfs";
import { executeCommandString, CommandContext } from "@/labs/engine/commands";
import { TaskEngine } from "@/labs/engine/tasks/task-engine";
import { getLabDefinition } from "@/labs/definitions";
import { saveVfsState, loadVfsState, clearVfsState, saveLocalProgress, loadLocalProgress } from "@/labs/engine/persistence";

export const Route = createFileRoute("/_authenticated/cyber-range/lab/$slug")({
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.slug
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ")} — IVVAB LABS Workbench`,
      },
    ],
  }),
  component: CyberLabWorkbenchPage,
});

type MobileTab = "terminal" | "tasks" | "progress" | "files";

function CyberLabWorkbenchPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const labConfig = useMemo(() => getLabDefinition(slug), [slug]);
  
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(labConfig ? labConfig.estimated_minutes * 60 : 0);
  const [mobileTab, setMobileTab] = useState<MobileTab>("terminal");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Engine state
  const [vfs, setVfs] = useState<VirtualFileSystem | null>(null);
  const [cwd, setCwd] = useState("/home/analyst");
  const [taskEngine, setTaskEngine] = useState<TaskEngine | null>(null);

  // Terminal state
  const [commandInput, setCommandInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Hints and Flag state
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [flagInput, setFlagInput] = useState("");
  const [labSolved, setLabSolved] = useState(false);
  
  // Progress tracking
  const [tasksCompleted, setTasksCompleted] = useState(0);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
  }, []);

  // Fetch persistent progress from Supabase & Local
  const { data: dbProgress } = useQuery({
    queryKey: ["lab-progress", user?.id, labConfig?.id],
    queryFn: async () => {
      if (!user || !labConfig) return null;
      if (isOffline) return null; // skip if offline
      
      const { data } = await supabase
        .from("lab_progress")
        .select("completed, tasks_completed, total_tasks, points")
        .eq("user_id", user.id)
        .eq("lab_id", labConfig.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user && !!labConfig && !isOffline,
  });

  // Load progress
  useEffect(() => {
    if (!labConfig) return;
    const local = loadLocalProgress(labConfig.id);
    let solved = false;
    let completed = 0;
    
    if (dbProgress) {
      solved = dbProgress.completed;
      completed = dbProgress.tasks_completed ?? 0;
    } else if (local) {
      solved = local.completed;
      completed = local.tasksCompleted;
    }
    
    setLabSolved(solved);
    setTasksCompleted(completed);
  }, [dbProgress, labConfig]);

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
  const handleStartSession = () => {
    if (!labConfig) return;
    
    // Load VFS from local storage or initialize fresh
    let initialVfs = loadVfsState(labConfig.id);
    if (!initialVfs) {
      initialVfs = labConfig.setupFilesystem();
      saveVfsState(labConfig.id, initialVfs);
    }
    
    setVfs(initialVfs);
    setCwd("/home/analyst");
    
    // Init task engine
    const engine = new TaskEngine(labConfig.tasks);
    
    // Restore completed tasks
    const localProgress = loadLocalProgress(labConfig.id);
    if (localProgress) {
      localProgress.completedTaskIds.forEach(id => engine.completedIds.add(id));
    }
    setTaskEngine(engine);

    setSessionActive(true);
    setHistory([
      "IVVAB LABS Client-Side Engine v3.0 (Offline-First Sandbox)",
      `[${new Date().toLocaleTimeString()}] Local virtual filesystem mounted.`,
      "Type 'help' for available commands.",
      ""
    ]);
    toast.success("IVVAB LABS browser environment started successfully.");
    setMobileTab("terminal");
  };

  const handleStopSession = () => {
    setSessionActive(false);
    setVfs(null);
    setTaskEngine(null);
    setHistory((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Sandbox session stopped.`,
    ]);
    toast.info("Sandbox session stopped.");
  };

  const handleResetSession = () => {
    if (!labConfig) return;
    clearVfsState(labConfig.id);
    
    const freshVfs = labConfig.setupFilesystem();
    setVfs(freshVfs);
    saveVfsState(labConfig.id, freshVfs);
    setCwd("/home/analyst");
    
    const engine = new TaskEngine(labConfig.tasks);
    setTaskEngine(engine);
    setTasksCompleted(0);
    
    // reset local progress safely
    saveLocalProgress(labConfig.id, {
      completed: false,
      tasksCompleted: 0,
      points: 0,
      completedTaskIds: []
    });

    setHistory([
      "IVVAB LABS Client-Side Engine v3.0 (Offline-First Sandbox)",
      `[${new Date().toLocaleTimeString()}] Sandbox reset to clean state.`,
      ""
    ]);
    toast.success("Sandbox reset to clean state.");
  };

  // ── Terminal command execution ─────────────────────────────────────────────
  const handleExecuteCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || !vfs || !taskEngine || !labConfig) return;

    const cmd = commandInput.trim();
    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setCommandInput("");
    
    const ctx: CommandContext = {
      vfs,
      cwd,
      setCwd,
      stdout: [],
      stderr: []
    };

    const newLogs = [`analyst@ivvab-labs:${cwd}$ ${cmd}`];
    const lowerCmd = cmd.toLowerCase();

    if (lowerCmd === "clear") {
      setHistory([]);
      return;
    } else if (lowerCmd === "help") {
      newLogs.push(
        "Available commands in this simulated sandbox:",
        "  ls, cd, pwd, cat, grep, awk, sort, uniq, head, tail, wc, echo",
        "  clear          - Clear terminal screen",
        "  help           - Show this manual",
        "",
        "Note: This is an educational browser-based simulation. Real commands operate on the virtual dataset filesystem."
      );
    } else {
      executeCommandString(cmd, ctx);
      if (ctx.stdout.length > 0) newLogs.push(...ctx.stdout);
      if (ctx.stderr.length > 0) newLogs.push(...ctx.stderr);
      
      // Save VFS state in case of mutations
      saveVfsState(labConfig.id, vfs);
      
      // Evaluate tasks
      const newlyCompleted = taskEngine.evaluate(ctx, cmd);
      if (newlyCompleted.length > 0) {
        toast.success(`Task Completed!`);
        const totalDone = taskEngine.completedIds.size;
        setTasksCompleted(totalDone);
        
        saveLocalProgress(labConfig.id, {
          completed: labSolved,
          tasksCompleted: totalDone,
          points: labSolved ? labConfig.reward_points : 0,
          completedTaskIds: Array.from(taskEngine.completedIds)
        });
      }
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

  // ── Flag Submission ────────────────────────────────────────────────────────
  const handleSubmitFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim() || !labConfig || !sessionActive) return;

    if (!flagInput.trim().startsWith("FLAG{")) {
      toast.error("Invalid flag format. Expected FLAG{...}");
      return;
    }

    if (flagInput.trim() === labConfig.flag) {
      setLabSolved(true);
      setFlagInput("");
      
      const newProgress = {
        completed: true,
        tasksCompleted: taskEngine?.completedIds.size ?? labConfig.tasks.length,
        points: labConfig.reward_points,
        completedTaskIds: Array.from(taskEngine?.completedIds ?? [])
      };
      
      saveLocalProgress(labConfig.id, newProgress);

      if (!isOffline && user) {
        try {
          await supabase.from("lab_progress").upsert({
            user_id: user.id,
            lab_id: labConfig.id,
            completed: true,
            tasks_completed: newProgress.tasksCompleted,
            total_tasks: labConfig.tasks.length,
            points: labConfig.reward_points,
            completed_at: new Date().toISOString()
          }, { onConflict: "user_id, lab_id" });
          
          queryClient.invalidateQueries({ queryKey: ["lab-progress"] });
        } catch {
          toast.warning("Flag verified! Saved locally (offline). Will sync when online.");
        }
      } else {
        toast.success(`Flag Verified Offline! +${labConfig.reward_points} XP awarded locally.`, { duration: 5000 });
      }
    } else {
      toast.error("Incorrect flag. Inspect the logs and try again.");
    }
  };

  const revealHint = (index: number) => {
    if (revealedHints.includes(index)) return;
    setRevealedHints((prev) => [...prev, index]);
    toast.info("Hint revealed.");
  };

  if (!labConfig) {
    return <div className="p-8 text-center text-foreground font-mono">Lab definition not found.</div>;
  }

  // ── Derived progress stats ─────────────────────────────────────────────────
  const progressPct = labConfig.tasks.length > 0
    ? Math.round((tasksCompleted / labConfig.tasks.length) * 100)
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
            {tasksCompleted}/{labConfig.tasks.length} Done
          </span>
        </div>
        <div className="space-y-3">
          {labConfig.tasks.map((task, index) => {
            const isCompleted = labSolved || (taskEngine && taskEngine.completedIds.has(task.id)) || (index < tasksCompleted);
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
        <form onSubmit={handleSubmitFlag} className="flex gap-2">
          <input
            type="text"
            placeholder="FLAG{...}"
            value={flagInput}
            onChange={(e) => setFlagInput(e.target.value)}
            disabled={!sessionActive || labSolved}
            className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!sessionActive || !flagInput.trim() || labSolved}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shrink-0 font-mono disabled:opacity-40"
          >
            Verify
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
              <div key={idx} className="p-3 rounded-lg border border-border/80 bg-muted/20 text-xs">
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
              +{labConfig.reward_points} XP earned
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-mono text-muted-foreground">
            <span>Tasks</span>
            <span>{tasksCompleted} / {labConfig.tasks.length}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {sessionActive && (
        <div className="pt-3 border-t border-border flex gap-2">
          <button
            onClick={handleResetSession}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Lab State
          </button>
        </div>
      )}
    </div>
  );
  
  // ── File Explorer (New) ──────────────────────────────────────────────────
  const FilesPanel = () => (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
      <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
        <FolderOpen className="w-4 h-4 text-primary" />
        Dataset Browser
      </h3>
      <p className="text-xs text-muted-foreground">
        This lab operates on a virtual in-browser filesystem. You can use terminal commands like <code>ls</code> and <code>cat</code> to explore it.
      </p>
      
      {!sessionActive ? (
        <div className="p-4 text-center border rounded-lg bg-muted/20 text-xs text-muted-foreground font-mono">
          Start sandbox to load dataset.
        </div>
      ) : (
        <div className="p-4 border rounded-lg bg-slate-950 text-slate-300 text-xs font-mono overflow-auto max-h-[300px]">
          {/* Simple recursive tree renderer */}
          {vfs && (
            <pre>
              {JSON.stringify(
                Object.keys(vfs.root.children || {}).reduce((acc, key) => {
                  acc[key] = vfs.root.children![key].type;
                  return acc;
                }, {} as any),
                null,
                2
              )}
            </pre>
          )}
        </div>
      )}
    </div>
  );

  // ── Terminal Panel ─────────────────────────────────────────────────────────
  const TerminalPanel = () => (
    <div className="flex flex-col h-full rounded-xl border border-border bg-slate-950 overflow-hidden shadow-md">
      {/* Terminal top bar */}
      <div className="bg-slate-900 border-b border-border px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="font-mono text-xs text-slate-300 ml-2">IVVAB LABS Sandbox (Browser)</span>
        </div>
        <div className="flex items-center gap-3 text-[0.65rem] font-mono text-muted-foreground">
          {isOffline && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
              AVAILABLE OFFLINE
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                sessionActive
                  ? "bg-green-400 animate-pulse"
                  : "bg-slate-500"
              }`}
            />
            <span>
              {sessionActive ? "SANDBOX ONLINE" : "OFFLINE"}
            </span>
          </span>
        </div>
      </div>

      {/* Terminal body */}
      {!sessionActive ? (
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-3 font-mono text-muted-foreground">
          <Terminal className="w-8 h-8 text-muted-foreground" />
          <p className="text-xs max-w-md">
            Click <span className="text-primary font-semibold">&quot;Start Lab Sandbox&quot;</span>{" "}
            above to provision your client-side isolated environment. No server required.
          </p>
        </div>
      ) : (
        <div className="flex-1 p-4 overflow-y-auto overflow-x-auto font-mono text-xs text-slate-200 space-y-1 selection:bg-primary selection:text-white">
          {history.map((line, idx) => (
            <div key={idx} className="whitespace-pre leading-relaxed min-w-0 break-all">
              {line}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      )}

      {/* Command input */}
      <form
        onSubmit={handleExecuteCommand}
        className="border-t border-border bg-slate-900/60 p-2.5 flex items-center gap-2 shrink-0"
      >
        <span className="font-mono text-xs text-green-400 pl-2 shrink-0">
          analyst@ivvab-labs:{cwd}$
        </span>
        <input
          type="text"
          disabled={!sessionActive}
          placeholder={
            sessionActive
              ? "Type command (e.g. ls, cat, grep, awk)..."
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
          className="px-3 py-1 rounded bg-muted text-slate-200 font-mono text-xs hover:bg-slate-700 disabled:opacity-40 transition-colors shrink-0"
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

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground font-mono text-[0.7rem] font-semibold tracking-wide transition-colors"
              title="Home"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">HOME</span>
            </Link>
            <Link
              to="/cyber-range/labs"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground font-mono text-[0.7rem] font-semibold tracking-wide transition-colors"
              title="Back to Cyber Labs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">BACK TO LABS</span>
            </Link>
            {sessionActive && (
              <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-lg border border-border bg-muted/40">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="text-muted-foreground">Session:</span>
                <span className="font-semibold text-foreground">{formatTime(sessionTimer)}</span>
              </div>
            )}

            {labSolved ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-success text-success-foreground font-mono text-xs font-bold shadow-xs">
                <Award className="w-4 h-4" /> SOLVED (+
                {labConfig.reward_points} XP)
              </span>
            ) : sessionActive ? (
              <>
                <button
                  onClick={handleStopSession}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 font-mono text-xs font-semibold transition-colors"
                >
                  <Square className="w-3.5 h-3.5" /> Stop Sandbox
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleStartSession}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-primary-foreground" />
                  <span>Start Lab Sandbox</span>
                </button>
              </>
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
              { id: "files", label: "Files", icon: FolderOpen },
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
              <span className="hidden sm:inline">{label}</span>
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
          {mobileTab === "files" && (
            <div className="pb-6">
              <FilesPanel />
            </div>
          )}
        </div>

        {/* ── Desktop Split View (≥ 768px) ──────────────────────────────── */}
        <div className="hidden md:grid grid-cols-12 gap-6">
          {/* Left: Tasks + Hints + Flag (5 cols) */}
          <div className="col-span-5 space-y-4">
            <TasksPanel />
            <FilesPanel />
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
