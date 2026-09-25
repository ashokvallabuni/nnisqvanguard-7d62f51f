import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  Terminal,
  Shield,
  Activity,
  Filter,
  Search,
  Zap,
  Clock,
  Layers,
  Sparkles,
  Database,
  Award,
  WifiOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/common/PageHeader";
import { LabCard, LabData } from "@/components/cyber-range/LabCard";
import { GridSkeleton } from "@/components/common/SkeletonLoaders";
import { COURSE_LAB_MAPPINGS } from "@/data/lab-registry";
import { AVAILABLE_COURSES } from "@/data/courses-curriculum";

export const Route = createFileRoute("/cyber-range/labs")({
  head: () => ({
    meta: [
      { title: "IVVAB LABS — Hands-on Cybersecurity Practice Environment" },
      {
        name: "description",
        content:
          "Launch isolated Docker sandbox environments to solve real-world cybersecurity tasks, analyze network captures, and submit flags.",
      },
    ],
  }),
  component: CyberLabsCatalogPage,
});

// Canonical defense & threat investigation labs
const CANONICAL_LABS: LabData[] = [
  {
    id: "lab-ssh-bruteforce",
    slug: "linux-ssh-brute-force-investigation",
    title: "Linux SSH Brute Force Investigation",
    summary:
      "Analyze live syslog and auth.log streams in an isolated Linux environment to detect automated credential stuffing, identify attacker IP ranges, and construct automated fail2ban rules.",
    difficulty: "easy",
    category: "Host Forensics",
    estimated_minutes: 30,
    mitre_attack_ids: ["T1110.001", "T1078"],
    points: 100,
    skills: ["Syslog Analysis", "Bash Scripting", "Log Parsing"],
  },
  {
    id: "lab-suricata-nids",
    slug: "suricata-network-threat-hunting",
    title: "Suricata Network Threat Hunting & PCAP Analysis",
    summary:
      "Reconstruct malicious packet streams, isolate command-and-control (C2) beaconing intervals, and extract hidden base64 encoded data exfiltration channels from raw PCAPs.",
    difficulty: "medium",
    category: "Network Defense",
    estimated_minutes: 45,
    mitre_attack_ids: ["T1046", "T1071.001", "T1041"],
    points: 150,
    skills: ["Wireshark / TShark", "Suricata Rules", "Network Forensics"],
  },
  {
    id: "lab-sqli-investigation",
    slug: "sql-injection-forensics-and-mitigation",
    title: "SQL Injection Incident Forensics & Hardening",
    summary:
      "Investigate database access logs following a data exfiltration incident, identify the vulnerable parameterized query bypass, and remediate the backend application code.",
    difficulty: "medium",
    category: "App Security",
    estimated_minutes: 40,
    mitre_attack_ids: ["T1190", "T1005"],
    points: 150,
    skills: ["SQLi Exploitation & Defense", "Web Log Analysis", "Secure Code Review"],
  },
  {
    id: "lab-ransomware-triage",
    slug: "ransomware-registry-persistence-triage",
    title: "Ransomware Registry Persistence & Triage",
    summary:
      "Inspect Windows event logs and registry run keys in a simulated enterprise workstation to locate encrypted shadow copies and extract the attacker's staging script.",
    difficulty: "hard",
    category: "Endpoint Triage",
    estimated_minutes: 60,
    mitre_attack_ids: ["T1547.001", "T1486", "T1059.001"],
    points: 250,
    skills: ["Windows Event Logs", "Sysinternals", "Malware Triage"],
  },
  {
    id: "lab-container-security",
    slug: "docker-container-breakout-defense",
    title: "Docker Container Security & Escape Defense",
    summary:
      "Identify misconfigured privileged container capabilities, audit mounted host sockets, and harden the Docker daemon security profile against privilege escalation.",
    difficulty: "hard",
    category: "Cloud Security",
    estimated_minutes: 50,
    mitre_attack_ids: ["T1611", "T1068"],
    points: 200,
    skills: ["Container Auditing", "Capabilities", "AppArmor / Seccomp"],
  },
  {
    id: "lab-memory-forensics",
    slug: "volatility-memory-dump-analysis",
    title: "Memory Forensics with Volatility 3",
    summary:
      "Parse raw memory dumps from a compromised domain controller, hunt for injected DLLs, unhooked processes, and recover plaintext credentials from memory.",
    difficulty: "insane",
    category: "Threat Hunting",
    estimated_minutes: 75,
    mitre_attack_ids: ["T1055", "T1003.001"],
    points: 300,
    skills: ["Volatility 3", "Process Injection Analysis", "Memory Forensics"],
  },
];

function CyberLabsCatalogPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // Fetch labs from Supabase
  const { data: dbLabs, isLoading } = useQuery({
    queryKey: ["cyber-range-published-labs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("labs")
        .select("*")
        .eq("status", "PUBLISHED")
        .order("created_at", { ascending: false });
      if (error) return [];
      return data ?? [];
    },
  });

  // Fetch active lab sessions for user
  const { data: activeSessions } = useQuery({
    queryKey: ["user-active-lab-sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("lab_sessions")
        .select("lab_id,status")
        .eq("user_id", user.id)
        .eq("status", "RUNNING");
      if (error) return [];
      return data ?? [];
    },
    enabled: !!user,
  });

  // Fetch completed labs
  const { data: completedLabs } = useQuery({
    queryKey: ["user-completed-labs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("lab_progress")
        .select("lab_id,completed")
        .eq("user_id", user.id)
        .eq("completed", true);
      if (error) return [];
      return data ?? [];
    },
    enabled: !!user,
  });

  // Combine DB labs with canonical labs
  const allLabs: LabData[] = useMemo(() => {
    const activeLabIds = new Set((activeSessions ?? []).map((s) => s.lab_id));
    const completedLabIds = new Set((completedLabs ?? []).map((l) => l.lab_id));

    const formattedDbLabs: LabData[] = (dbLabs ?? []).map((l: any) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      summary: l.description || "Hands-on isolated cybersecurity exercise.",
      difficulty: (l.difficulty || "medium").toLowerCase(),
      category: l.lab_type || "Cyber Defense",
      estimated_minutes: l.estimated_time_minutes || l.estimated_minutes || 45,
      mitre_attack_ids: (l.mitre_attack_ids as string[]) || [],
      points: l.reward_points || 100,
      is_active_session: activeLabIds.has(l.id),
      completed: completedLabIds.has(l.id),
    }));

    // If DB labs are present, merge; otherwise use canonical labs
    const existingSlugs = new Set(formattedDbLabs.map((l) => l.slug));
    const merged = [
      ...formattedDbLabs,
      ...CANONICAL_LABS.filter((c) => !existingSlugs.has(c.slug)),
    ];

    return merged.map((lab) => ({
      ...lab,
      is_active_session: activeLabIds.has(lab.id) || lab.is_active_session,
      completed: completedLabIds.has(lab.id) || lab.completed,
    }));
  }, [dbLabs, activeSessions, completedLabs]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(allLabs.map((l) => l.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [allLabs]);

  const STANDARD_CATEGORIES = [
    "NETWORKING",
    "LINUX",
    "WEB SECURITY",
    "ETHICAL HACKING",
    "PHISHING DEFENCE",
    "OSINT",
    "DIGITAL FORENSICS",
    "SOC",
    "INCIDENT RESPONSE",
    "PENETRATION TESTING",
    "CLOUD SECURITY",
    "MALWARE ANALYSIS",
  ] as const;

  const stats = useMemo(() => {
    const available = allLabs.length;
    const inProgress = allLabs.filter((l) => l.is_active_session).length;
    const completed = allLabs.filter((l) => l.completed).length;
    const learningPaths = categories.length > 1 ? categories.length - 1 : 0;
    return { available, inProgress, completed, learningPaths };
  }, [allLabs, categories]);

  // Filtered labs
  const filteredLabs = useMemo(() => {
    return allLabs.filter((lab) => {
      const matchesSearch =
        lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.mitre_attack_ids?.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" ||
        lab.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesDifficulty =
        selectedDifficulty === "all" ||
        lab.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [allLabs, searchQuery, selectedCategory, selectedDifficulty]);

  const activeSessionLab = allLabs.find((l) => l.is_active_session);

  const existingCategoryNorm = new Set(
    (categories.slice(1).filter(Boolean) as string[]).map((c) =>
      c.toLowerCase().replace(/[\s\-_]/g, ""),
    ),
  );

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="IVVAB LABS"
        badgeVariant="primary"
        title={
          <div className="flex items-center gap-3">
            <span>Lab Command Center</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#059669]/30 bg-[#059669]/10 text-[#059669] text-[10px] font-mono tracking-widest font-bold">
              <WifiOff className="w-3 h-3" />
              AVAILABLE OFFLINE
            </div>
          </div>
        }
        subtitle="Practical cybersecurity training through controlled laboratories and real-world security exercises."
        breadcrumbs={[{ label: "PLATFORM", to: "/" }, { label: "IVVAB LABS" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10 pb-24">
        {/* ── KPI STAT ROW ─────────────────────────────────────────────── */}
        <section
          aria-label="Cyber labs statistics"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
        >
          {[
            { label: "AVAILABLE LABS", value: stats.available, icon: Layers, variant: "primary" },
            {
              label: "IN PROGRESS",
              value: stats.inProgress,
              icon: Activity,
              variant: "warning",
              showPulse: stats.inProgress > 0,
            },
            { label: "COMPLETED", value: stats.completed, icon: Award, variant: "success" },
            {
              label: "LEARNING PATHS",
              value: stats.learningPaths,
              icon: Sparkles,
              variant: "accent",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            const variantClasses: Record<string, string> = {
              primary: "border-primary/30 bg-primary/5 text-primary",
              warning: "border-warning/30 bg-warning/5 text-warning",
              success: "border-success/30 bg-success/5 text-success",
              accent: "border-accent/30 bg-accent/10 text-accent-foreground",
            };
            return (
              <div
                key={i}
                className="relative rounded-xl border bg-card p-4 sm:p-5 flex flex-col gap-2 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[0.6rem] sm:text-[0.65rem] uppercase tracking-wider text-muted-foreground font-semibold">
                    {stat.label}
                  </span>
                  <div
                    className={`p-1.5 rounded-md border ${variantClasses[stat.variant]} ${stat.showPulse ? "animate-pulse" : ""}`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-2xl sm:text-3xl font-black text-foreground tabular-nums leading-none">
                    {stat.value}
                  </span>
                  <span className="font-mono text-[0.65rem] text-muted-foreground uppercase">
                    total
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-60" />
              </div>
            );
          })}
        </section>

        {/* Active Session Notification Card */}
        {activeSessionLab && (
          <div className="rounded-xl border border-primary bg-primary/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary text-primary-foreground animate-pulse shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                  ACTIVE CONTAINER SESSION RUNNING
                </div>
                <div className="font-display font-bold text-base text-foreground mt-0.5">
                  {activeSessionLab.title}
                </div>
              </div>
            </div>

            <Link
              to="/cyber-range/lab/$slug"
              params={{ slug: activeSessionLab.slug }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-semibold hover:bg-primary/90 transition-colors shadow-xs shrink-0"
            >
              <Terminal className="w-4 h-4" />
              <span>CONTINUE LAB</span>
            </Link>
          </div>
        )}

        {/* ── CATEGORY / CAPABILITY CHIPS ──────────────────────────────── */}
        <section aria-label="Lab categories" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground font-semibold flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" /> CAPABILITY MAP
            </h2>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedDifficulty("all");
                setSearchQuery("");
              }}
              className="font-mono text-[0.65rem] uppercase tracking-wider text-primary font-semibold hover:underline"
            >
              Reset filters
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-2 rounded-md text-[0.7rem] font-mono font-semibold tracking-wide border transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted/40"
              }`}
              aria-current={selectedCategory === "all" ? "page" : undefined}
            >
              ALL LABS · {allLabs.length}
            </button>
            {STANDARD_CATEGORIES.map((std) => {
              const stdKey = std.toLowerCase().replace(/[\s\-_]/g, "");
              const match = (categories.slice(1).filter(Boolean) as string[]).find(
                (c) => c.toLowerCase().replace(/[\s\-_]/g, "") === stdKey,
              );
              const hasContent = !!match || existingCategoryNorm.has(stdKey);
              const isSelected =
                match && selectedCategory.toLowerCase().replace(/[\s\-_]/g, "") === stdKey;
              const count =
                hasContent && match
                  ? allLabs.filter(
                      (l) => (l.category || "").toLowerCase().replace(/[\s\-_]/g, "") === stdKey,
                    ).length
                  : 0;
              return (
                <button
                  key={std}
                  disabled={!hasContent}
                  onClick={() => match && setSelectedCategory(match)}
                  className={`px-3 py-2 rounded-md text-[0.7rem] font-mono font-semibold tracking-wide border transition-all inline-flex items-center gap-2 ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : hasContent
                        ? "bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted/40 disabled:opacity-50"
                        : "bg-muted/30 text-muted-foreground border-dashed border-border/80"
                  }`}
                >
                  <span>{std}</span>
                  {hasContent ? (
                    <span
                      className={`px-1.5 py-0.5 rounded-xs text-[0.6rem] ${
                        isSelected ? "bg-primary-foreground/20" : "bg-muted"
                      }`}
                    >
                      {count}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-xs text-[0.6rem] font-semibold tracking-wider bg-muted-foreground/10">
                      COMING SOON
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-2">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, technique, or ATT&CK ID (e.g. Volatility, T1110, SQLi)…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 text-xs font-mono">
              <span className="px-2 text-muted-foreground font-semibold uppercase tracking-wider text-[0.65rem]">
                Difficulty
              </span>
              {(["all", "easy", "medium", "hard", "insane"] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1.5 rounded-md capitalize transition-colors text-[0.7rem] font-semibold tracking-wide ${
                    selectedDifficulty === diff
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Labs Grid */}
        <section aria-label="Available labs" className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              <span>Available IVVAB LABS</span>
              <span className="font-mono text-[0.7rem] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border font-semibold ml-1">
                {filteredLabs.length}
              </span>
            </h3>
          </div>

          {isLoading ? (
            <GridSkeleton count={6} />
          ) : filteredLabs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 md:p-14 text-center space-y-4">
              <Database className="w-10 h-10 text-muted-foreground mx-auto" />
              <h4 className="font-semibold text-foreground text-lg">
                No labs match your current filters
              </h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Try clearing your search query, choosing a different difficulty level, or browse all
                categories using the capability chips above.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDifficulty("all");
                  setSelectedCategory("all");
                }}
                className="text-xs font-mono font-semibold text-primary tracking-wider hover:underline uppercase"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {COURSE_LAB_MAPPINGS.map(mapping => {
                const course = AVAILABLE_COURSES.find(c => c.id === mapping.courseId);
                const courseLabs = filteredLabs.filter(l => mapping.labs.includes(l.id));
                if (courseLabs.length === 0) return null;
                
                return (
                  <div key={mapping.courseId} className="space-y-4">
                    <h4 className="font-display text-lg font-bold text-foreground border-b border-border pb-2 uppercase tracking-wide flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" />
                      {course ? course.title : mapping.courseId} IVVAB LABS
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {courseLabs.map((lab) => (
                        <LabCard key={lab.id} lab={lab} />
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {(() => {
                const mappedLabIds = new Set(COURSE_LAB_MAPPINGS.flatMap(m => m.labs));
                const unmappedLabs = filteredLabs.filter(l => !mappedLabIds.has(l.id));
                if (unmappedLabs.length === 0) return null;
                
                return (
                  <div className="space-y-4">
                    <h4 className="font-display text-lg font-bold text-foreground border-b border-border pb-2 uppercase tracking-wide flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-muted-foreground" />
                      OTHER IVVAB LABS
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {unmappedLabs.map((lab) => (
                        <LabCard key={lab.id} lab={lab} />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
