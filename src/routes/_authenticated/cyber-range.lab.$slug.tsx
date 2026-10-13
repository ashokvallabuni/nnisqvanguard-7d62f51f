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
  ChevronDown,
  ArrowLeft,
  ListChecks,
  BarChart3,
  Home,
  FolderOpen,
  BookOpen,
  Bot,
  Sparkles,
  FileText,
  Lightbulb,
  ExternalLink,
  Check,
  X,
  Eye,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useIvvabChat } from "@/lib/ivvab-chat";
import { supabase } from "@/integrations/supabase/client";
import { VirtualFileSystem } from "@/labs/engine/filesystem/vfs";
import { executeCommandString, CommandContext } from "@/labs/engine/commands";
import { TaskEngine } from "@/labs/engine/tasks/task-engine";
import { getLabDefinition } from "@/labs/definitions";
import {
  saveVfsState,
  loadVfsState,
  clearVfsState,
  saveLocalProgress,
  loadLocalProgress,
} from "@/labs/engine/persistence";

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

type WorkspaceTab = "terminal" | "theory" | "dataset" | "assessment";
type MobileTab = "terminal" | "tasks" | "theory" | "dataset" | "progress";

interface VfsFileEntry {
  path: string;
  size: number;
  type: "file" | "directory";
}

function extractAllFiles(vfs: VirtualFileSystem): VfsFileEntry[] {
  const list: VfsFileEntry[] = [];
  function walk(node: any, currentPath: string) {
    if (!node) return;
    if (node.type === "file") {
      list.push({ path: currentPath, size: node.content?.length || 0, type: "file" });
    } else if (node.type === "directory" && node.children) {
      list.push({ path: currentPath || "/", size: 0, type: "directory" });
      for (const [name, child] of Object.entries(node.children)) {
        const next = currentPath === "" || currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
        walk(child, next);
      }
    }
  }
  if (vfs && vfs.root) walk(vfs.root, "");
  return list.filter((e) => e.type === "file");
}

function CyberLabWorkbenchPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const { openIvvab, setLearningContext } = useIvvabChat();
  const queryClient = useQueryClient();

  const labConfig = useMemo(() => getLabDefinition(slug), [slug]);

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(
    labConfig ? labConfig.estimated_minutes * 60 : 0,
  );
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("terminal");
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
  const terminalScrollRef = useRef<HTMLDivElement>(null);

  // Hints and Flag state
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [flagInput, setFlagInput] = useState("");
  const [labSolved, setLabSolved] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Assessment Quiz State inside Lab
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  // Dataset Explorer State
  const [selectedFilePreview, setSelectedFilePreview] = useState<{ path: string; content: string } | null>(null);

  // Progress tracking
  const [tasksCompleted, setTasksCompleted] = useState(0);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Set learning context for IVVAB assistant when entering workbench
  useEffect(() => {
    if (labConfig) {
      setLearningContext({
        labSlug: labConfig.slug,
        taskTitle: labConfig.tasks[tasksCompleted]?.title,
        datasetInfo: labConfig.dataset_description,
        learningMode: "lab",
      });
    }
  }, [labConfig, tasksCompleted, setLearningContext]);

  // Fetch persistent progress from Supabase & Local
  const { data: dbProgress } = useQuery({
    queryKey: ["lab-progress", user?.id, labConfig?.id],
    queryFn: async () => {
      if (!user || !labConfig) return null;
      if (isOffline) return null;

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
    const el = terminalScrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
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

    let initialVfs = loadVfsState(labConfig.id);
    if (!initialVfs) {
      initialVfs = labConfig.setupFilesystem();
      saveVfsState(labConfig.id, initialVfs);
    }

    setVfs(initialVfs);
    setCwd("/home/analyst");

    const engine = new TaskEngine(labConfig.tasks);
    const localProgress = loadLocalProgress(labConfig.id);
    if (localProgress) {
      localProgress.completedTaskIds.forEach((id) => engine.completedIds.add(id));
    }
    setTaskEngine(engine);

    setSessionActive(true);
    setHistory([
      "IVVAB LABS Client-Side Sandbox v3.5 (Offline-First Defensive Workspace)",
      `[${new Date().toLocaleTimeString()}] Local virtual filesystem mounted. Isolated sandbox active.`,
      `Scenario: ${labConfig.title}`,
      "Type 'help' for available commands or 'ls -la' to explore evidence.",
      "",
    ]);
    toast.success("IVVAB LABS sandbox initialized. Evidence files loaded.");
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

    saveLocalProgress(labConfig.id, {
      completed: false,
      tasksCompleted: 0,
      points: 0,
      completedTaskIds: [],
    });

    setHistory([
      "IVVAB LABS Client-Side Sandbox v3.5 (Offline-First Defensive Workspace)",
      `[${new Date().toLocaleTimeString()}] Sandbox reset to clean state.`,
      "",
    ]);
    setSelectedFilePreview(null);
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
      stderr: [],
    };

    const newLogs = [`analyst@ivvab-labs:${cwd}$ ${cmd}`];
    const lowerCmd = cmd.toLowerCase();

    if (lowerCmd === "clear") {
      setHistory([]);
      return;
    } else if (lowerCmd === "help") {
      newLogs.push(
        "Available commands in this educational sandbox:",
        " ls, cd, pwd, cat, grep, awk, sort, uniq, head, tail, wc, echo, base64",
        " clear - Clear terminal screen",
        " help  - Show this manual",
        "",
        "Note: This is an isolated client-side virtual environment for educational investigations.",
      );
    } else {
      executeCommandString(cmd, ctx);
      if (ctx.stdout.length > 0) newLogs.push(...ctx.stdout);
      if (ctx.stderr.length > 0) newLogs.push(...ctx.stderr);

      saveVfsState(labConfig.id, vfs);

      const newlyCompleted = taskEngine.evaluate(ctx, cmd);
      if (newlyCompleted.length > 0) {
        toast.success(`Task Completed: ${taskEngine.tasks.find(t => t.id === newlyCompleted[0])?.title || "Objective Met"}`);
        const totalDone = taskEngine.completedIds.size;
        setTasksCompleted(totalDone);

        saveLocalProgress(labConfig.id, {
          completed: labSolved,
          tasksCompleted: totalDone,
          points: labSolved ? labConfig.reward_points : 0,
          completedTaskIds: Array.from(taskEngine.completedIds),
        });
      }
    }

    setHistory((prev) => [...prev, ...newLogs]);
  };

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

  // ── Flag Submission & Educational Feedback ──────────────────────────────
  const handleSubmitFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim() || !labConfig || !sessionActive) return;

    if (!flagInput.trim().startsWith("FLAG{")) {
      toast.error("Invalid flag format. Expected syntax: FLAG{...}");
      return;
    }

    if (flagInput.trim() === labConfig.flag) {
      setLabSolved(true);
      setFlagInput("");
      setShowCompletionModal(true);

      const newProgress = {
        completed: true,
        tasksCompleted: taskEngine?.completedIds.size ?? labConfig.tasks.length,
        points: labConfig.reward_points,
        completedTaskIds: Array.from(taskEngine?.completedIds ?? []),
      };

      saveLocalProgress(labConfig.id, newProgress);

      if (!isOffline && user) {
        try {
          await supabase.from("lab_progress").upsert(
            {
              user_id: user.id,
              lab_id: labConfig.id,
              completed: true,
              tasks_completed: newProgress.tasksCompleted,
              total_tasks: labConfig.tasks.length,
              points: labConfig.reward_points,
              completed_at: new Date().toISOString(),
            },
            { onConflict: "user_id, lab_id" },
          );

          queryClient.invalidateQueries({ queryKey: ["lab-progress"] });
          queryClient.invalidateQueries({ queryKey: ["user-lab-progress-all"] });
          toast.success("Flag verified! Progress synced to your profile.");
        } catch {
          toast.warning("Flag verified! Saved locally (offline). Will sync when online.");
        }
      } else {
        toast.success(`Flag Verified! +${labConfig.reward_points} XP awarded.`, {
          duration: 5000,
        });
      }
    } else {
      toast.error("Incorrect flag token. Examine the dataset telemetry and command output carefully.");
    }
  };

  const revealHint = (index: number) => {
    if (revealedHints.includes(index)) return;
    setRevealedHints((prev) => [...prev, index]);
    toast.info(`Progressive Hint ${index + 1} revealed.`);
  };

  const handleAskIvvabAboutLab = () => {
    if (!labConfig) return;
    openIvvab(
      `I am working on the lab "${labConfig.title}". Can you give me a conceptual hint on how to approach the investigation without revealing the protected flag?`,
      {
        labSlug: labConfig.slug,
        taskTitle: labConfig.tasks[tasksCompleted]?.title,
        datasetInfo: labConfig.dataset_description,
        learningMode: "lab",
      },
    );
  };

  const handleAskIvvabAboutTask = (taskTitle: string) => {
    if (!labConfig) return;
    openIvvab(
      `I need guidance for Task: "${taskTitle}" in the "${labConfig.title}" lab. What concepts and terminal tools should I consider?`,
      {
        labSlug: labConfig.slug,
        taskTitle,
        datasetInfo: labConfig.dataset_description,
        learningMode: "lab",
      },
    );
  };

  const handlePreviewFile = (path: string) => {
    if (!vfs) return;
    try {
      const content = vfs.readFile(path);
      setSelectedFilePreview({ path, content });
      setActiveTab("dataset");
      setMobileTab("dataset");
    } catch {
      toast.error(`Unable to read ${path}`);
    }
  };

  const handleSelectQuiz = (qId: string, optIdx: number) => {
    setSelectedQuizAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmitQuizQuestion = (qId: string) => {
    setQuizSubmitted((prev) => ({ ...prev, [qId]: true }));
  };

  if (!labConfig) {
    return (
      <div className="min-h-screen pt-20 p-8 text-center text-foreground font-mono">
        <h2 className="text-xl font-bold mb-2">Lab Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested lab slug could not be located in the catalog.</p>
        <Link to="/cyber-range/labs" className="text-primary hover:underline">Return to Lab Catalog</Link>
      </div>
    );
  }

  const progressPct =
    labConfig.tasks.length > 0 ? Math.round((tasksCompleted / labConfig.tasks.length) * 100) : 0;

  const datasetFiles = vfs ? extractAllFiles(vfs) : [];

  return (
    <div className="min-h-screen pt-16 pb-20 bg-background">
      {/* Workbench Navigation & Status Header */}
      <div className="border-b border-border bg-card py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/cyber-range/labs"
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="Back to Labs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20 font-semibold">
                  {labConfig.difficulty}
                </span>
                <span className="text-xs font-mono text-muted-foreground uppercase">
                  {labConfig.category}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  +{labConfig.reward_points} XP
                </span>
              </div>
              <h1 className="font-display font-bold text-xl sm:text-2xl text-foreground mt-0.5">
                {labConfig.title}
              </h1>
            </div>
          </div>

          {/* Action buttons & Session controls */}
          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            <button
              onClick={handleAskIvvabAboutLab}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-mono text-xs font-semibold transition-colors shadow-xs"
              title="Ask IVVAB AI about this lab"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask IVVAB</span>
            </button>

            {sessionActive && (
              <div className="flex items-center gap-2 font-mono text-xs px-3 py-2 rounded-lg border border-border bg-muted/40">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="text-muted-foreground">Session:</span>
                <span className="font-semibold text-foreground">{formatTime(sessionTimer)}</span>
              </div>
            )}

            {labSolved ? (
              <button
                onClick={() => setShowCompletionModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white font-mono text-xs font-bold shadow-xs cursor-pointer hover:bg-emerald-600 transition-colors"
              >
                <Award className="w-4 h-4" />
                <span>SOLVED (+{labConfig.reward_points} XP)</span>
              </button>
            ) : sessionActive ? (
              <button
                onClick={handleStopSession}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 font-mono text-xs font-semibold transition-colors"
              >
                <Square className="w-3.5 h-3.5" /> Stop Sandbox
              </button>
            ) : (
              <button
                onClick={handleStartSession}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-primary-foreground" />
                <span>Start Lab Sandbox</span>
              </button>
            )}
          </div>
        </div>

        {/* Workspace Tab Switcher (Terminal | Theory | Dataset | Assessment) */}
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-border/60 flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab("terminal")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "terminal"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab("theory")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "theory"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Theory & Objectives</span>
          </button>

          <button
            onClick={() => setActiveTab("dataset")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "dataset"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Dataset Explorer {datasetFiles.length > 0 && `(${datasetFiles.length})`}</span>
          </button>

          {labConfig.final_assessment && labConfig.final_assessment.length > 0 && (
            <button
              onClick={() => setActiveTab("assessment")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === "assessment"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Knowledge Check</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Mobile Tab Bar (< 768px) */}
        <div className="flex md:hidden border border-border rounded-xl overflow-hidden mb-4 text-xs font-mono">
          {[
            { id: "terminal", label: "Terminal", icon: Terminal },
            { id: "tasks", label: "Tasks", icon: ListChecks },
            { id: "theory", label: "Theory", icon: BookOpen },
            { id: "dataset", label: "Dataset", icon: FolderOpen },
            { id: "progress", label: "Progress", icon: BarChart3 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMobileTab(id as MobileTab)}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 transition-colors ${
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

        {/* Desktop Split Grid (12 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Panel: Tasks & Progressive Guidance (4 cols on desktop) */}
          <div className="md:col-span-4 space-y-4">
            {/* Tasks Checklist */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Investigation Tasks</span>
                </h3>
                <span className="text-xs font-mono text-muted-foreground">
                  {tasksCompleted}/{labConfig.tasks.length} Done
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-1.5 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="space-y-3">
                {labConfig.tasks.map((task, index) => {
                  const isCompleted =
                    labSolved ||
                    (taskEngine && taskEngine.completedIds.has(task.id)) ||
                    index < tasksCompleted;

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-lg border text-xs space-y-2 transition-colors ${
                        isCompleted
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-border bg-muted/20"
                      }`}
                    >
                      <div className="flex items-start gap-2 justify-between">
                        <div className="flex items-start gap-2">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div
                              className={`font-semibold ${
                                isCompleted ? "text-emerald-400" : "text-foreground"
                              }`}
                            >
                              Task {index + 1}: {task.title}
                            </div>
                            <p className="text-muted-foreground mt-0.5 leading-relaxed">
                              {task.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Educational Explanation when completed */}
                      {isCompleted && task.explanation && (
                        <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                          <strong className="block font-semibold mb-0.5">Defensive Insight:</strong>
                          <span>{task.explanation}</span>
                        </div>
                      )}

                      {/* Command hint & Ask IVVAB */}
                      <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                        {task.command_hint ? (
                          <code className="font-mono text-[10px] bg-background px-2 py-0.5 rounded border border-border text-primary">
                            $ {task.command_hint}
                          </code>
                        ) : <span />}

                        <button
                          onClick={() => handleAskIvvabAboutTask(task.title)}
                          className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Bot className="w-2.5 h-2.5" />
                          <span>Ask IVVAB</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Flag Submission Card */}
            <div className="rounded-xl border border-primary/40 bg-card p-5 space-y-3 shadow-xs">
              <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                <Flag className="w-4 h-4 text-primary" />
                <span>Submit Incident Containment Flag</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Once you locate the flag in the virtual filesystem, submit it here for cryptographic verification.
              </p>
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

            {/* Progressive 3-Tiered Hints */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Progressive Hints</span>
                </h3>
                <span className="text-xs font-mono text-muted-foreground">
                  {labConfig.progressive_hints ? labConfig.progressive_hints.length : labConfig.hints.length} Tiers
                </span>
              </div>

              <div className="space-y-2">
                {(labConfig.progressive_hints || labConfig.hints.map((h, i) => ({
                  level: (i + 1) as 1 | 2 | 3,
                  title: `Hint ${i + 1}`,
                  hint: h,
                }))).map((hItem, idx) => {
                  const isRevealed = revealedHints.includes(idx);
                  return (
                    <div key={idx} className="p-3 rounded-lg border border-border/80 bg-muted/20 text-xs">
                      {isRevealed ? (
                        <div className="text-foreground leading-relaxed">
                          <span className="font-mono font-semibold text-primary">
                            Level {hItem.level} ({hItem.title}):{" "}
                          </span>
                          {hItem.hint}
                        </div>
                      ) : (
                        <button
                          onClick={() => revealHint(idx)}
                          className="w-full text-left font-mono text-muted-foreground hover:text-primary transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>Reveal Level {hItem.level} Hint: {hItem.title}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reset Controls */}
            {sessionActive && (
              <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">Clean Sandbox:</span>
                <button
                  onClick={handleResetSession}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Sandbox</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Active Workspace Tab (8 cols on desktop) */}
          <div className="md:col-span-8">
            {/* Tab 1: Terminal Workbench */}
            {activeTab === "terminal" && (
              <div className="flex flex-col h-[680px] rounded-xl border border-border bg-[#050b14] overflow-hidden shadow-2xl">
                {/* Terminal top bar */}
                <div className="bg-[#0a1220] border-b border-border/60 px-4 py-2.5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="font-mono text-xs text-slate-300 ml-2">
                      IVVAB LABS Terminal Sandbox
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          sessionActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                        }`}
                      />
                      <span className="text-slate-300">
                        {sessionActive ? "VFS ACTIVE | PRIVILEGED ANALYST" : "SANDBOX READY"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Terminal body */}
                {!sessionActive ? (
                  <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4 font-mono text-slate-300">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Terminal className="w-6 h-6 text-primary" />
                    </div>
                    <div className="max-w-md space-y-1">
                      <h4 className="font-display font-bold text-sm text-foreground">
                        Virtual Sandbox Not Running
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Click &quot;Start Lab Sandbox&quot; in the header above to mount the virtual dataset filesystem and begin your investigation.
                      </p>
                    </div>
                    <button
                      onClick={handleStartSession}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-colors shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Lab Sandbox</span>
                    </button>
                  </div>
                ) : (
                  <div
                    ref={terminalScrollRef}
                    className="flex-1 p-4 overflow-y-auto overflow-x-auto font-mono text-xs text-slate-100 space-y-1 selection:bg-primary/30"
                  >
                    {history.map((line, idx) => (
                      <div key={idx} className="whitespace-pre leading-relaxed min-w-0 break-all">
                        {line}
                      </div>
                    ))}
                  </div>
                )}

                {/* Command Input Bar */}
                <form
                  onSubmit={handleExecuteCommand}
                  className="border-t border-border/60 bg-[#070e1a] p-2.5 flex items-center gap-2 shrink-0"
                >
                  <span className="font-mono text-xs text-emerald-400 pl-2 shrink-0">
                    analyst@ivvab-labs:{cwd}$
                  </span>
                  <input
                    type="text"
                    disabled={!sessionActive}
                    placeholder={
                      sessionActive
                        ? "Enter command (e.g. ls, cat, grep, awk, sort, uniq)..."
                        : "Start sandbox container above to run commands"
                    }
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent font-mono text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:opacity-50 min-w-0"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!sessionActive || !commandInput.trim()}
                    className="px-3 py-1 rounded bg-primary/20 border border-primary/40 text-primary font-mono text-xs hover:bg-primary hover:text-primary-foreground disabled:opacity-30 transition-colors shrink-0"
                  >
                    Run ↵
                  </button>
                </form>
              </div>
            )}

            {/* Tab 2: Theory & Conceptual Objectives */}
            {activeTab === "theory" && (
              <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-xs max-h-[680px] overflow-y-auto">
                <div className="space-y-2 border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary uppercase font-semibold">
                      Pedagogical Foundation
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      Estimated Duration: {labConfig.estimated_minutes} Minutes
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-xl text-foreground">
                    {labConfig.title}: Theoretical Background
                  </h2>
                </div>

                {/* Conceptual Intro Text */}
                {labConfig.conceptual_intro ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed space-y-4">
                    {labConfig.conceptual_intro.split("\n\n").map((para, pIdx) => {
                      if (para.startsWith("###")) {
                        return (
                          <h3 key={pIdx} className="font-display font-bold text-base text-foreground mt-4 mb-2">
                            {para.replace(/###\s*/, "")}
                          </h3>
                        );
                      }
                      if (para.startsWith("####")) {
                        return (
                          <h4 key={pIdx} className="font-display font-semibold text-sm text-primary mt-3 mb-1">
                            {para.replace(/####\s*/, "")}
                          </h4>
                        );
                      }
                      return (
                        <p key={pIdx} className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {para}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {labConfig.description}
                  </p>
                )}

                {/* Prerequisites checklist */}
                {labConfig.prerequisites && (
                  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                    <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Prerequisite Knowledge
                    </h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {labConfig.prerequisites.map((prereq, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dataset Environment Breakdown */}
                {labConfig.dataset_description && (
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                    <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5" /> Investigation Dataset Environment
                    </h4>
                    <p className="text-xs text-foreground/90 leading-relaxed">
                      {labConfig.dataset_description}
                    </p>
                  </div>
                )}

                {/* Suggested Next Activity */}
                {labConfig.next_recommended && (
                  <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">
                        Recommended Next Activity
                      </span>
                      <h5 className="font-display font-semibold text-sm text-foreground">
                        {labConfig.next_recommended.title}
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        {labConfig.next_recommended.description}
                      </p>
                    </div>
                    <Link
                      to={labConfig.next_recommended.route}
                      className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 shrink-0"
                    >
                      View Next
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Dataset Explorer */}
            {activeTab === "dataset" && (
              <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-xs max-h-[680px] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-primary" />
                      <span>Virtual Dataset Filesystem</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Explore the isolated forensic artifacts and evidence logs loaded into your browser sandbox.
                    </p>
                  </div>

                  {!sessionActive && (
                    <button
                      onClick={handleStartSession}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90"
                    >
                      Start Sandbox to Browse
                    </button>
                  )}
                </div>

                {!sessionActive ? (
                  <div className="p-8 text-center border rounded-xl bg-muted/20 text-xs font-mono text-muted-foreground">
                    Sandbox not running. Start the lab sandbox to populate virtual filesystem telemetry.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* File list (5 cols) */}
                    <div className="md:col-span-5 space-y-2">
                      <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
                        Files in VFS ({datasetFiles.length}):
                      </span>
                      <div className="space-y-1.5">
                        {datasetFiles.map((file) => (
                          <div
                            key={file.path}
                            onClick={() => handlePreviewFile(file.path)}
                            className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between cursor-pointer transition-colors ${
                              selectedFilePreview?.path === file.path
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-muted/20 hover:bg-muted text-foreground"
                            }`}
                          >
                            <span className="truncate flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{file.path}</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                              {file.size} B
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* File preview (7 cols) */}
                    <div className="md:col-span-7 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                          {selectedFilePreview ? `Preview: ${selectedFilePreview.path}` : "Select a file to inspect"}
                        </span>
                        {selectedFilePreview && (
                          <button
                            onClick={() => {
                              setCommandInput(`cat ${selectedFilePreview.path}`);
                              setActiveTab("terminal");
                            }}
                            className="text-[11px] font-mono text-primary hover:underline"
                          >
                            Run cat in terminal →
                          </button>
                        )}
                      </div>

                      {selectedFilePreview ? (
                        <div className="rounded-lg border border-border bg-[#050b14] p-3 text-xs font-mono text-slate-200 max-h-[420px] overflow-auto">
                          <pre className="whitespace-pre-wrap leading-relaxed">
                            {selectedFilePreview.content}
                          </pre>
                        </div>
                      ) : (
                        <div className="p-8 text-center border rounded-lg bg-muted/10 text-xs font-mono text-muted-foreground">
                          Click any file on the left to preview its raw evidence records.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Knowledge Check Assessment */}
            {activeTab === "assessment" && (
              <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-xs max-h-[680px] overflow-y-auto">
                <div className="border-b border-border pb-4">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary uppercase font-semibold">
                    Knowledge Check
                  </span>
                  <h3 className="font-display font-bold text-lg text-foreground mt-1">
                    {labConfig.title}: Concept Verification Questions
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Test your understanding of the threat mechanisms, logs, and forensics methods used in this lab.
                  </p>
                </div>

                <div className="space-y-6">
                  {labConfig.final_assessment?.map((q, idx) => {
                    const selected = selectedQuizAnswers[q.id];
                    const isSubmitted = quizSubmitted[q.id];
                    const isCorrect = selected === q.correct_index;

                    return (
                      <div
                        key={q.id}
                        className="p-5 rounded-xl border border-border bg-muted/20 space-y-4 text-xs"
                      >
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <h4 className="font-semibold text-sm text-foreground">
                            {q.question}
                          </h4>
                        </div>

                        {/* Options */}
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            let optStyle = "border-border bg-card text-foreground hover:bg-muted";
                            if (isSubmitted) {
                              if (optIdx === q.correct_index) {
                                optStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold";
                              } else if (selected === optIdx) {
                                optStyle = "border-destructive bg-destructive/10 text-destructive";
                              }
                            } else if (selected === optIdx) {
                              optStyle = "border-primary bg-primary/10 text-primary font-semibold";
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={isSubmitted}
                                onClick={() => handleSelectQuiz(q.id, optIdx)}
                                className={`w-full text-left p-3 rounded-lg border text-xs transition-colors flex items-center justify-between cursor-pointer ${optStyle}`}
                              >
                                <span>{opt}</span>
                                {isSubmitted && optIdx === q.correct_index && (
                                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Feedback & explanation */}
                        {isSubmitted ? (
                          <div
                            className={`p-3 rounded-lg border text-xs leading-relaxed ${
                              isCorrect
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                                : "bg-destructive/10 border-destructive/20 text-destructive-foreground"
                            }`}
                          >
                            <strong className="block font-semibold mb-1">
                              {isCorrect ? "Correct!" : "Incorrect — Educational Insight:"}
                            </strong>
                            <span>{q.explanation}</span>
                          </div>
                        ) : (
                          <button
                            disabled={selected === undefined}
                            onClick={() => handleSubmitQuizQuestion(q.id)}
                            className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-colors disabled:opacity-40"
                          >
                            Check Answer
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion & Results Feedback Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-emerald-500/40 bg-card p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Investigation Successfully Solved!
                  </h3>
                  <p className="text-xs font-mono text-emerald-400">
                    +{labConfig.reward_points} Skill XP Awarded
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCompletionModal(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Why This Attack Happened & Real-World Operations */}
            <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20 text-xs text-foreground/90 leading-relaxed">
              <h4 className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Why This Investigation Matters in SOC Operations</span>
              </h4>
              <p>
                You successfully detected the attack vectors, isolated the indicators of compromise (IOCs), and captured the incident sign-off flag.
              </p>
              <div className="p-3 rounded-lg bg-background border border-border/80 font-mono text-[11px] space-y-1">
                <div>✓ Evidence Analyzed: {labConfig.title}</div>
                <div>✓ Validation Flag: {labConfig.flag}</div>
                <div>✓ Status: Resolved & Logged in Enterprise Telemetry</div>
              </div>
            </div>

            {/* Recommended Next Learning Milestone */}
            {labConfig.next_recommended && (
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-primary uppercase font-bold">
                    Next Recommended Milestone
                  </span>
                  <h5 className="font-display font-semibold text-sm text-foreground">
                    {labConfig.next_recommended.title}
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    {labConfig.next_recommended.description}
                  </p>
                </div>
                <Link
                  to={labConfig.next_recommended.route}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shrink-0 inline-flex items-center gap-1"
                >
                  <span>Launch Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-foreground text-xs font-semibold"
              >
                Close & Continue Sandbox
              </button>
              <Link
                to="/cyber-range/labs"
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
              >
                Return to Lab Catalog
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
