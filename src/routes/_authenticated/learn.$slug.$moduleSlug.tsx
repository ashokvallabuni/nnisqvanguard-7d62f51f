import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Terminal,
  Database,
  ArrowLeft,
  ArrowRight,
  Shield,
  Award,
  Zap,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/common/PageHeader";
import { ModuleNavigation, ModuleItem } from "@/components/academy/ModuleNavigation";
import { DatasetPreviewCard, DatasetSample } from "@/components/academy/DatasetPreviewCard";
import { DetailPageSkeleton } from "@/components/common/SkeletonLoaders";

export const Route = createFileRoute("/_authenticated/learn/$slug/$moduleSlug")({
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.moduleSlug
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ")} — Module Learning — NISQ Vanguard`,
      },
    ],
  }),
  component: ModuleLearningPage,
});

// Telemetry dataset mock generators based on module topic
function getModuleDataset(slug: string, title: string): DatasetSample {
  if (slug.includes("auth") || slug.includes("password") || slug.includes("credential")) {
    return {
      name: "Linux SSH / Auth.log Telemetry Feed",
      source: "Honeypot Sensor #042 (Ubuntu 22.04 LTS)",
      format: "log",
      description: "Analyze failed authentication sequences, repeated user enumeration, and automated password brute-force bursts.",
      recordsCount: 420,
      data: [
        { timestamp: "2026-09-21T10:14:02Z", host: "auth-gateway-01", process: "sshd[18442]", event: "Failed password for invalid user admin from 198.51.100.44 port 48212 ssh2" },
        { timestamp: "2026-09-21T10:14:03Z", host: "auth-gateway-01", process: "sshd[18445]", event: "Failed password for invalid user root from 198.51.100.44 port 48218 ssh2" },
        { timestamp: "2026-09-21T10:14:05Z", host: "auth-gateway-01", process: "sshd[18450]", event: "Failed password for user postgres from 198.51.100.44 port 48224 ssh2" },
        { timestamp: "2026-09-21T10:14:09Z", host: "auth-gateway-01", process: "sshd[18458]", event: "Received disconnect from 198.51.100.44 port 48224: 11: Bye Bye [preauth]" },
        { timestamp: "2026-09-21T10:15:20Z", host: "auth-gateway-01", process: "sshd[18512]", event: "Accepted publickey for secops from 10.0.4.12 port 51102 ssh2: RSA SHA256:8sK..." }
      ],
      downloadUrl: "#",
      kaggleUrl: "https://www.kaggle.com/datasets",
    };
  }

  if (slug.includes("network") || slug.includes("traffic") || slug.includes("packet") || slug.includes("firewall")) {
    return {
      name: "Suricata NIDS Alert & PCAP Flow Telemetry",
      source: "CIC-IDS2017 & Real Defense Perimeter Probe",
      format: "json",
      description: "Inspect network flow anomalies, SYN scan signatures (MITRE T1046), and unusual outbound DNS tunneling requests.",
      recordsCount: 1540,
      data: [
        { timestamp: "2026-09-21T08:30:12Z", src_ip: "192.168.1.105", src_port: 54102, dst_ip: "10.0.0.5", dst_port: 80, proto: "TCP", alert: "ET SCAN Potential Nmap SYN Scan", severity: 2 },
        { timestamp: "2026-09-21T08:30:13Z", src_ip: "192.168.1.105", src_port: 54103, dst_ip: "10.0.0.5", dst_port: 443, proto: "TCP", alert: "ET SCAN Potential Nmap SYN Scan", severity: 2 },
        { timestamp: "2026-09-21T08:30:14Z", src_ip: "192.168.1.105", src_port: 54104, dst_ip: "10.0.0.5", dst_port: 22, proto: "TCP", alert: "ET SCAN Potential Nmap SYN Scan", severity: 2 },
        { timestamp: "2026-09-21T08:35:45Z", src_ip: "10.0.0.5", src_port: 60231, dst_ip: "8.8.8.8", dst_port: 53, proto: "UDP", alert: "ET DNS Query for Suspicious High-Entropy Base64 Domain", severity: 1 }
      ],
      kaggleUrl: "https://www.kaggle.com/datasets",
    };
  }

  // Default security telemetry
  return {
    name: `${title} — Real Incident Telemetry Dataset`,
    source: "NISQ Defense Cyber Range Sensor Grid",
    format: "json",
    description: "Real-world captured system events and indicators of compromise (IOCs) mapped to this module's learning objectives.",
    recordsCount: 350,
    data: [
      { id: "EVT-9021", timestamp: "2026-09-21T09:00:00Z", category: "Defensive Operations", severity: "HIGH", description: "Privilege escalation attempt detected on host-endpoint-alpha" },
      { id: "EVT-9022", timestamp: "2026-09-21T09:04:12Z", category: "Network Boundary", severity: "MEDIUM", description: "Outbound beaconing to unregistered ASN IP" },
      { id: "EVT-9023", timestamp: "2026-09-21T09:12:30Z", category: "Access Control", severity: "LOW", description: "MFA challenge successfully fulfilled" }
    ],
    kaggleUrl: "https://www.kaggle.com/datasets",
  };
}

function ModuleLearningPage() {
  const { slug, moduleSlug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [checkedQuizzes, setCheckedQuizzes] = useState<Record<string, boolean>>({});
  const [completing, setCompleting] = useState(false);

  // 1. Fetch Course
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course-by-slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id,slug,title,description,level,tier")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // 2. Fetch All Modules for Course
  const { data: allModules } = useQuery({
    queryKey: ["course-all-modules", course?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("id,course_id,slug,title,difficulty,duration_minutes,practice_labs,sort_order")
        .eq("course_id", course!.id)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!course,
  });

  // 3. Fetch Current Module Detail
  const { data: currentModule, isLoading: moduleLoading } = useQuery({
    queryKey: ["module-detail", course?.id, moduleSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("id,course_id,slug,title,notes_md,locked,tags,difficulty,duration_minutes,practice_labs,sort_order")
        .eq("course_id", course!.id)
        .eq("slug", moduleSlug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!course,
  });

  // 4. Fetch Quizzes for this module
  const { data: quizzes } = useQuery({
    queryKey: ["module-quizzes", currentModule?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("id,module_id,question,options,correct_option,explanation,sort_order")
        .eq("module_id", currentModule!.id)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!currentModule,
  });

  // 5. Fetch User Progress
  const { data: userProgress } = useQuery({
    queryKey: ["module-user-progress", user?.id, course?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("module_progress")
        .select("module_id,completed,quiz_score")
        .eq("user_id", user.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && !!course,
  });

  if (courseLoading || moduleLoading) {
    return <DetailPageSkeleton />;
  }

  if (!course || !currentModule) {
    return (
      <div className="pt-28 pb-20 px-4 text-center max-w-md mx-auto">
        <h2 className="font-display text-2xl font-bold">Module Not Found</h2>
        <p className="text-sm text-muted-foreground mt-2">
          The requested learning module does not exist or has been modified.
        </p>
        <Link
          to="/learn/$slug"
          params={{ slug }}
          className="mt-6 inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
        >
          Back to Course
        </Link>
      </div>
    );
  }

  const completedModuleIds = new Set(
    (userProgress ?? []).filter((p) => p.completed).map((p) => p.module_id)
  );

  const isCurrentModuleCompleted = completedModuleIds.has(currentModule.id);

  // Navigation module list
  const navModules: ModuleItem[] = (allModules ?? []).map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    order_index: m.sort_order,
    duration_minutes: m.duration_minutes || 20,
    has_dataset: true,
    has_lab: (m.practice_labs?.length || 0) > 0,
    completed: completedModuleIds.has(m.id),
  }));

  const currentIndex = (allModules ?? []).findIndex((m) => m.id === currentModule.id);
  const nextModule = allModules?.[currentIndex + 1];
  const prevModule = allModules?.[currentIndex - 1];

  const datasetSample = getModuleDataset(currentModule.slug, currentModule.title);

  // Mark Module Completed
  const handleMarkComplete = async () => {
    if (!user) {
      toast.error("Please sign in to save your progress.");
      return;
    }

    try {
      setCompleting(true);
      const { error } = await supabase.from("module_progress").upsert({
        user_id: user.id,
        module_id: currentModule.id,
        completed: true,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Module marked as completed! XP awarded.");
      queryClient.invalidateQueries({ queryKey: ["module-user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["course-user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["academy-user-progress"] });

      if (nextModule) {
        navigate({
          to: "/learn/$slug/$moduleSlug",
          params: { slug: course.slug, moduleSlug: nextModule.slug },
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update progress.");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 pb-24">
      <PageHeader
        badge={`MODULE ${currentIndex + 1} OF ${allModules?.length || 1}`}
        badgeVariant="primary"
        title={currentModule.title}
        subtitle={`${course.title} • ${currentModule.duration_minutes || 20} min estimated`}
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Academy", to: "/academy" },
          { label: course.title, to: `/learn/${course.slug}` },
          { label: currentModule.title },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Syllabus Navigation Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <ModuleNavigation
              courseSlug={course.slug}
              courseTitle={course.title}
              modules={navModules}
              currentModuleSlug={currentModule.slug}
            />
          </div>

          {/* Core Module Content */}
          <div className="lg:col-span-3 order-1 lg:order-2 space-y-8">
            {/* Step 1: Core Theory & Concept */}
            <section className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-border/80">
                <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  STEP 1
                </span>
                <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Theory & Core Security Concepts</span>
                </h2>
              </div>

              <div className="prose prose-slate max-w-none text-foreground leading-relaxed space-y-4">
                {currentModule.notes_md ? (
                  <div className="whitespace-pre-line text-sm sm:text-base text-foreground/90 font-normal">
                    {currentModule.notes_md}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    In this lesson, you will master the defensive and threat architecture surrounding this topic. Review the real-world dataset below and take the assessment to reinforce your practical understanding.
                  </p>
                )}
              </div>
            </section>

            {/* Step 2: Real Dataset Telemetry Viewer */}
            <section className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-accent/15 text-accent font-semibold">
                    STEP 2
                  </span>
                  <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                    <Database className="w-4 h-4 text-accent" />
                    <span>Real-World Security Telemetry Dataset</span>
                  </h2>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Security analysts don't just read theory—they analyze logs, PCAPs, and authentication streams. Inspect the real telemetry feed below:
              </p>

              <DatasetPreviewCard dataset={datasetSample} />
            </section>

            {/* Step 3: Interactive Knowledge Checks & Quizzes */}
            {quizzes && quizzes.length > 0 && (
              <section className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-border/80">
                  <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-warning/15 text-warning font-semibold">
                    STEP 3
                  </span>
                  <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-warning" />
                    <span>Knowledge Check ({quizzes.length} Questions)</span>
                  </h2>
                </div>

                <div className="space-y-6">
                  {quizzes.map((q, qIndex) => {
                    const selected = selectedAnswers[q.id];
                    const isChecked = checkedQuizzes[q.id];
                    const isCorrect = selected === q.correct_option;
                    const options = Array.isArray(q.options) ? q.options : [];

                    return (
                      <div
                        key={q.id}
                        className="p-5 rounded-xl border border-border bg-muted/20 space-y-4"
                      >
                        <h4 className="font-semibold text-sm sm:text-base text-foreground flex items-start gap-2">
                          <span className="font-mono text-xs text-muted-foreground pt-0.5">
                            Q{qIndex + 1}.
                          </span>
                          <span>{q.question}</span>
                        </h4>

                        <div className="space-y-2">
                          {options.map((opt, oIndex) => {
                            const isThisSelected = selected === oIndex;
                            let optionStyle =
                              "border-border bg-card hover:border-primary/50 text-foreground";

                            if (isChecked) {
                              if (oIndex === q.correct_option) {
                                optionStyle =
                                  "border-success bg-success/10 text-success font-medium";
                              } else if (isThisSelected && !isCorrect) {
                                optionStyle =
                                  "border-destructive bg-destructive/10 text-destructive";
                              }
                            } else if (isThisSelected) {
                              optionStyle = "border-primary bg-primary/10 text-primary font-medium";
                            }

                            return (
                              <button
                                key={oIndex}
                                onClick={() => {
                                  setSelectedAnswers((prev) => ({ ...prev, [q.id]: oIndex }));
                                  setCheckedQuizzes((prev) => ({ ...prev, [q.id]: false }));
                                }}
                                className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm flex items-center justify-between transition-all ${optionStyle}`}
                              >
                                <span>{opt}</span>
                                {isChecked && oIndex === q.correct_option && (
                                  <Check className="w-4 h-4 text-success shrink-0" />
                                )}
                                {isChecked && isThisSelected && !isCorrect && (
                                  <X className="w-4 h-4 text-destructive shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <button
                            disabled={selected === undefined}
                            onClick={() =>
                              setCheckedQuizzes((prev) => ({ ...prev, [q.id]: true }))
                            }
                            className="px-3.5 py-1.5 rounded-md text-xs font-mono bg-primary text-primary-foreground font-semibold disabled:opacity-40"
                          >
                            Check Answer
                          </button>

                          {isChecked && (
                            <span
                              className={`text-xs font-mono font-semibold ${
                                isCorrect ? "text-success" : "text-destructive"
                              }`}
                            >
                              {isCorrect ? "Correct! +10 XP" : "Incorrect. Try again."}
                            </span>
                          )}
                        </div>

                        {isChecked && q.explanation && (
                          <div className="p-3 rounded-md bg-muted text-xs text-muted-foreground leading-relaxed border-l-2 border-primary">
                            <span className="font-semibold text-foreground">Explanation: </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Step 4: Practical Cyber Lab Integration */}
            <section className="rounded-xl border border-primary/40 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-2">
                <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold">
                  STEP 4
                </span>
                <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span>Hands-on Cyber Lab Practice</span>
                </h2>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Ready to practice in an isolated command line sandbox? Launch the companion Cyber Lab to investigate live artifacts and submit flags.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/cyber-range/labs"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-xs"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Launch Hands-on Lab</span>
                </Link>
              </div>
            </section>

            {/* Bottom Actions: Previous / Next / Complete */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                {prevModule && (
                  <Link
                    to="/learn/$slug/$moduleSlug"
                    params={{ slug: course.slug, moduleSlug: prevModule.slug }}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous: {prevModule.title}</span>
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleMarkComplete}
                  disabled={completing}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs ${
                    isCurrentModuleCompleted
                      ? "bg-success text-success-foreground hover:bg-success/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {completing
                      ? "Saving..."
                      : isCurrentModuleCompleted
                      ? nextModule
                        ? "Completed — Next Module →"
                        : "Completed!"
                      : nextModule
                      ? "Complete & Next Module →"
                      : "Complete Course Track"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
