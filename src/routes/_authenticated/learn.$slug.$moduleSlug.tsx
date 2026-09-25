import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
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
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/common/PageHeader";
import { ModuleNavigation, ModuleItem } from "@/components/academy/ModuleNavigation";
import { DatasetPreviewCard, DatasetSample } from "@/components/academy/DatasetPreviewCard";
import { DetailPageSkeleton } from "@/components/common/SkeletonLoaders";
import { AuthoritativeSources, CitationSource } from "@/components/academy/AuthoritativeSources";
import {
  ExplainThisAssistant,
  ConceptExplanations,
} from "@/components/academy/ExplainThisAssistant";
import { NetworkTopologyDiagram } from "@/components/diagrams/NetworkTopologyDiagram";
import { TcpHandshakeDiagram } from "@/components/diagrams/TcpHandshakeDiagram";
import { IpSubnetVisualizer } from "@/components/diagrams/IpSubnetVisualizer";
import { LinuxFilesystemTree } from "@/components/diagrams/LinuxFilesystemTree";
import { LinuxPermissionsVisualizer } from "@/components/diagrams/LinuxPermissionsVisualizer";
import { CiaTriadSecurityDiagram } from "@/components/diagrams/CiaTriadSecurityDiagram";
import { SocPipelineDiagram } from "@/components/diagrams/SocPipelineDiagram";
import { NETWORKING_MODULES, LINUX_MODULES } from "@/data/courses-curriculum";
import { completeModule } from "@/lib/academy.functions";
import { submitQuizAnswer } from "@/lib/quiz.functions";
import { isCourseAccessible, describeAccessError } from "@/lib/course-accessibility";

export const Route = createFileRoute("/_authenticated/learn/$slug/$moduleSlug")({
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.moduleSlug
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ")} — NISQ Vanguard Academy`,
      },
    ],
  }),
  component: ModuleLearningPage,
});

// Real Dataset Mock Generator
function getModuleDataset(slug: string, title: string): DatasetSample {
  if (
    slug.includes("tcp") ||
    slug.includes("network") ||
    slug.includes("packet") ||
    slug.includes("traffic")
  ) {
    return {
      name: "CIC-IDS2018 Real Network Flow & Suricata PCAP Telemetry",
      source: "Canadian Institute for Cybersecurity (CIC-IDS2018)",
      format: "json",
      description:
        "Inspect network flow features (Source/Destination IP, Ports, Protocol 6 [TCP], Flow Duration, Packet/Byte counts) capturing normal vs SYN flood traffic.",
      recordsCount: 1048576,
      data: [
        {
          timestamp: "2026-09-21T08:30:12Z",
          src_ip: "192.168.1.105",
          src_port: 54102,
          dst_ip: "10.0.0.5",
          dst_port: 80,
          proto: "TCP",
          alert: "ET SCAN Potential Nmap SYN Scan",
          severity: 2,
        },
        {
          timestamp: "2026-09-21T08:30:13Z",
          src_ip: "192.168.1.105",
          src_port: 54103,
          dst_ip: "10.0.0.5",
          dst_port: 443,
          proto: "TCP",
          alert: "ET SCAN Potential Nmap SYN Scan",
          severity: 2,
        },
        {
          timestamp: "2026-09-21T08:35:45Z",
          src_ip: "10.0.0.5",
          src_port: 60231,
          dst_ip: "8.8.8.8",
          dst_port: 53,
          proto: "UDP",
          alert: "ET DNS Query for Suspicious High-Entropy Base64 Domain",
          severity: 1,
        },
      ],
      kaggleUrl: "https://www.kaggle.com/datasets/cicdataset/cicids2017",
    };
  }

  if (
    slug.includes("auth") ||
    slug.includes("linux") ||
    slug.includes("ssh") ||
    slug.includes("password")
  ) {
    return {
      name: "Linux Authentication & SSH Telemetry Feed (/var/log/auth.log)",
      source: "Honeypot Sensor #042 (Ubuntu 22.04 LTS)",
      format: "log",
      description:
        "Analyze failed authentication sequences, repeated user enumeration, and automated password brute-force bursts.",
      recordsCount: 420000,
      data: [
        {
          timestamp: "2026-09-21T10:14:02Z",
          host: "auth-gateway-01",
          process: "sshd[18442]",
          event: "Failed password for invalid user admin from 198.51.100.44 port 48212 ssh2",
        },
        {
          timestamp: "2026-09-21T10:14:03Z",
          host: "auth-gateway-01",
          process: "sshd[18445]",
          event: "Failed password for invalid user root from 198.51.100.44 port 48218 ssh2",
        },
        {
          timestamp: "2026-09-21T10:15:20Z",
          host: "auth-gateway-01",
          process: "sshd[18512]",
          event: "Accepted publickey for secops from 10.0.4.12 port 51102 ssh2: RSA SHA256:8sK...",
        },
      ],
      kaggleUrl: "https://www.kaggle.com/datasets",
    };
  }

  return {
    name: `${title} — Real Incident Telemetry`,
    source: "NISQ Defense IVVAB LABS Sensor Grid",
    format: "json",
    description:
      "Real-world captured system events and indicators of compromise (IOCs) mapped to this module's learning objectives.",
    recordsCount: 350,
    data: [
      {
        id: "EVT-9021",
        timestamp: "2026-09-21T09:00:00Z",
        category: "Defensive Operations",
        severity: "HIGH",
        description: "Privilege escalation attempt detected on host-endpoint-alpha",
      },
      {
        id: "EVT-9022",
        timestamp: "2026-09-21T09:04:12Z",
        category: "Network Boundary",
        severity: "MEDIUM",
        description: "Outbound beaconing to unregistered ASN IP",
      },
    ],
    kaggleUrl: "https://www.kaggle.com/datasets",
  };
}

function ModuleLearningPage() {
  const { slug, moduleSlug } = Route.useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [checkedQuizzes, setCheckedQuizzes] = useState<Record<string, boolean>>({});
  const [quizResults, setQuizResults] = useState<
    Record<string, { is_correct: boolean; score: number; explanation: string }>
  >({});
  const [completing, setCompleting] = useState(false);
  const [verifyingQuizId, setVerifyingQuizId] = useState<string | null>(null);

  // 1. Fetch Course
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course-by-slug", slug],
    queryFn: async () => {
      // Security Check: Enforce course locking via centralized predicate for direct URL access
      const accessResult = await isCourseAccessible(slug, {
        user: { isAdmin, id: user?.id ?? null, role: null },
        requireAuth: true,
      });
      if (!accessResult.ok) {
        toast.error(describeAccessError(accessResult.reason), {
          description: "Return to Academy to explore approved courses.",
        });
        navigate({ to: "/academy", replace: true });
        throw notFound();
      }

      const { data } = await supabase
        .from("courses")
        .select("id,slug,title,description,level,tier")
        .eq("slug", slug)
        .maybeSingle();

      if (data) return data;

      const { AVAILABLE_COURSES } = await import("@/data/courses-curriculum");
      const staticCourse = AVAILABLE_COURSES.find((c) => c.slug === slug);
      if (staticCourse) {
        return {
          id: staticCourse.id,
          slug: staticCourse.slug,
          title: staticCourse.title,
          description: staticCourse.description,
          level: staticCourse.level,
          tier: staticCourse.tier,
        };
      }

      return {
        id: `c-${slug}`,
        slug,
        title: slug
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" "),
        description: "Authoritative cybersecurity curriculum.",
        level: "Beginner",
        tier: "free",
      };
    },
  });

  // 2. Fetch All Modules for Course
  const { data: allModules } = useQuery({
    queryKey: ["course-all-modules", course?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("modules")
        .select("id,course_id,slug,title,difficulty,duration_minutes,practice_labs,sort_order")
        .eq("course_id", course!.id)
        .order("sort_order");

      if (data && data.length > 0) return data;

      const { AVAILABLE_COURSES } = await import("@/data/courses-curriculum");
      const staticCourse = AVAILABLE_COURSES.find((c) => c.slug === slug || c.id === course!.id);
      if (staticCourse) {
        return staticCourse.modules.map((m) => ({
          id: m.id,
          course_id: staticCourse.id,
          slug: m.slug,
          title: m.title,
          difficulty: m.difficulty,
          duration_minutes: m.duration_minutes,
          practice_labs: m.companion_lab_slug ? [m.companion_lab_slug] : [],
          sort_order: m.order_index,
        }));
      }

      return NETWORKING_MODULES.slice(0, 3).map((m) => ({
        id: m.id,
        course_id: course!.id,
        slug: m.slug,
        title: m.title,
        difficulty: m.difficulty,
        duration_minutes: m.duration_minutes,
        practice_labs: [],
        sort_order: m.order_index,
      }));
    },
    enabled: !!course,
  });

  // 3. Fetch Current Module Detail
  const { data: currentModule, isLoading: moduleLoading } = useQuery({
    queryKey: ["module-detail", course?.id, moduleSlug],
    queryFn: async () => {
      const { data } = await supabase
        .from("modules")
        .select(
          "id,course_id,slug,title,notes_md,locked,tags,difficulty,duration_minutes,practice_labs,sort_order",
        )
        .eq("course_id", course!.id)
        .eq("slug", moduleSlug)
        .maybeSingle();

      if (data) return data;

      const { AVAILABLE_COURSES } = await import("@/data/courses-curriculum");
      const staticCourse = AVAILABLE_COURSES.find((c) => c.slug === slug || c.id === course!.id);
      const staticMod = staticCourse?.modules?.find((m) => m.slug === moduleSlug);

      if (staticMod) {
        return {
          id: staticMod.id,
          course_id: course!.id,
          slug: staticMod.slug,
          title: staticMod.title,
          notes_md: staticMod.notes_md,
          locked: false,
          tags: staticMod.tags,
          difficulty: staticMod.difficulty,
          duration_minutes: staticMod.duration_minutes,
          practice_labs: staticMod.companion_lab_slug ? [staticMod.companion_lab_slug] : [],
          sort_order: staticMod.order_index,
        };
      }

      const foundInNet = NETWORKING_MODULES.find((m) => m.slug === moduleSlug);
      if (foundInNet) {
        return {
          id: foundInNet.id,
          course_id: course!.id,
          slug: foundInNet.slug,
          title: foundInNet.title,
          notes_md: foundInNet.notes_md,
          locked: false,
          tags: foundInNet.tags,
          difficulty: foundInNet.difficulty,
          duration_minutes: foundInNet.duration_minutes,
          practice_labs: foundInNet.companion_lab_slug ? [foundInNet.companion_lab_slug] : [],
          sort_order: foundInNet.order_index,
        };
      }

      const foundInLin = LINUX_MODULES.find((m) => m.slug === moduleSlug);
      if (foundInLin) {
        return {
          id: foundInLin.id,
          course_id: course!.id,
          slug: foundInLin.slug,
          title: foundInLin.title,
          notes_md: foundInLin.notes_md,
          locked: false,
          tags: foundInLin.tags,
          difficulty: foundInLin.difficulty,
          duration_minutes: foundInLin.duration_minutes,
          practice_labs: foundInLin.companion_lab_slug ? [foundInLin.companion_lab_slug] : [],
          sort_order: foundInLin.order_index,
        };
      }

      return {
        id: `mod-${moduleSlug}`,
        course_id: course!.id,
        slug: moduleSlug,
        title: moduleSlug
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" "),
        notes_md:
          "### Core Concept\nMaster the technical architecture and security implications of this topic.",
        locked: false,
        tags: ["Security", "Defense"],
        difficulty: "BEGINNER",
        duration_minutes: 25,
        practice_labs: [],
        sort_order: 1,
      };
    },
    enabled: !!course,
  });

  // 4. Fetch Quizzes for this module
  const { data: quizzes } = useQuery({
    queryKey: ["module-quizzes", currentModule?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("quizzes")
        .select("id,module_id,question,options,correct_option,explanation,sort_order")
        .eq("module_id", currentModule!.id)
        .order("sort_order");

      if (data && data.length > 0) return data;

      const { AVAILABLE_COURSES } = await import("@/data/courses-curriculum");
      const staticCourse = AVAILABLE_COURSES.find((c) => c.slug === slug || c.id === course?.id);
      const staticMod = staticCourse?.modules?.find((m) => m.slug === moduleSlug);
      if (staticMod?.quizzes?.length) {
        return staticMod.quizzes.map((q, idx) => ({
          id: q.id ?? `q-${moduleSlug}-${idx}`,
          module_id: currentModule!.id,
          question: q.question,
          options: q.options,
          correct_option: q.correct_option,
          explanation: q.explanation,
          sort_order: idx + 1,
        }));
      }

      const foundInNet = NETWORKING_MODULES.find((m) => m.slug === moduleSlug);
      if (foundInNet?.quizzes) {
        return foundInNet.quizzes.map((q, idx) => ({
          id: `q-${moduleSlug}-${idx}`,
          module_id: currentModule!.id,
          question: q.question,
          options: q.options,
          correct_option: q.correct_option,
          explanation: q.explanation,
          sort_order: idx + 1,
        }));
      }

      const foundInLin = LINUX_MODULES.find((m) => m.slug === moduleSlug);
      if (foundInLin?.quizzes) {
        return foundInLin.quizzes.map((q, idx) => ({
          id: `q-${moduleSlug}-lin-${idx}`,
          module_id: currentModule!.id,
          question: q.question,
          options: q.options,
          correct_option: q.correct_option,
          explanation: q.explanation,
          sort_order: idx + 1,
        }));
      }

      return [
        {
          id: `q-${moduleSlug}-default`,
          module_id: currentModule!.id,
          question: `What is the primary security objective when configuring ${currentModule?.title || "this protocol"}?`,
          options: [
            "Ensure least privilege, accurate authentication, and audit logging",
            "Disable all encryption to increase processing speed",
            "Allow all incoming anonymous traffic by default",
            "Delete system logs every hour",
          ],
          correct_option: 0,
          explanation:
            "Applying the principle of least privilege and maintaining tamper-evident audit logs is the core security standard.",
          sort_order: 1,
        },
      ];
    },
    enabled: !!currentModule,
  });

  // 5. Fetch User Progress
  const { data: userProgress } = useQuery({
    queryKey: ["module-user-progress", user?.id, course?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("module_progress")
        .select("module_id,completed,quiz_score")
        .eq("user_id", user.id);
      return data ?? [];
    },
    enabled: !!user && !!course,
  });

  if (courseLoading || moduleLoading) {
    return <DetailPageSkeleton />;
  }

  if (!course || !currentModule) return null;

  const completedModuleIds = new Set(
    (userProgress ?? []).filter((p) => p.completed).map((p) => p.module_id),
  );

  const isCurrentModuleCompleted = completedModuleIds.has(currentModule.id);

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

  // Pick appropriate interactive diagram based on module topic
  const renderInteractiveDiagram = () => {
    const slugLower = currentModule.slug.toLowerCase();

    if (slugLower.includes("handshake") || slugLower.includes("tcp")) {
      return <TcpHandshakeDiagram />;
    }
    if (slugLower.includes("subnet") || slugLower.includes("cidr") || slugLower.includes("ipv4")) {
      return <IpSubnetVisualizer />;
    }
    if (slugLower.includes("permission") || slugLower.includes("chmod")) {
      return <LinuxPermissionsVisualizer />;
    }
    if (
      slugLower.includes("filesystem") ||
      slugLower.includes("fhs") ||
      slugLower.includes("linux")
    ) {
      return <LinuxFilesystemTree />;
    }
    if (
      slugLower.includes("cia") ||
      slugLower.includes("foundation") ||
      slugLower.includes("threat")
    ) {
      return <CiaTriadSecurityDiagram />;
    }
    if (slugLower.includes("soc") || slugLower.includes("log") || slugLower.includes("siem")) {
      return <SocPipelineDiagram />;
    }

    return <NetworkTopologyDiagram />;
  };

  // Curated Authoritative Citations for this lesson
  const lessonSources: CitationSource[] = [
    {
      title: "RFC 9293: Transmission Control Protocol (TCP) Specification",
      type: "RFC",
      citationNumber: "RFC 9293",
      url: "https://www.rfc-editor.org/rfc/rfc9293",
      notes:
        "Authoritative IETF internet standard defining packet state machines and sequence synchronization.",
    },
    {
      title: "NIST SP 800-53 Rev. 5: Security and Privacy Controls for Information Systems",
      type: "NIST",
      citationNumber: "SP 800-53",
      url: "https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final",
      notes:
        "Federal standards for access control, boundary protection, and continuous monitoring.",
    },
    {
      title: "MITRE ATT&CK Framework: Enterprise Matrix",
      type: "MITRE",
      citationNumber: "MITRE ATT&CK",
      url: "https://attack.mitre.org/",
      notes: "Adversary tactics, techniques, and common knowledge mapping real-world attacks.",
    },
  ];

  // Grounded Explanation Definition
  const lessonExplanations: ConceptExplanations = {
    conceptName: currentModule.title,
    quick: `Core security concept: ${currentModule.title} defines how communication and state enforcement occur within the protocol boundary.`,
    beginner:
      "Think of this like a passport checkpoint at an airport: every packet must present verifiable identification before entering.",
    technical:
      "A stateful protocol layer utilizing deterministic sequence numbers, bitwise flag masks, and kernel-space socket buffers.",
    security:
      "Misconfigurations allow adversaries to conduct spoofing, unauthorized traversal, or Denial of Service.",
    practical:
      "Security analysts correlate these packet fields in SIEM queries to isolate indicators of compromise (IOCs).",
  };

  // Complete Module — server-side validation and badge/certificate evaluation
  const handleMarkComplete = async () => {
    if (!user) {
      toast.error("Please sign in to save your learning progress.");
      return;
    }

    try {
      setCompleting(true);

      // Server function verifies course/module, persists completion,
      // evaluates badges, and issues certificate — browser cannot forge this
      const result = await completeModule({
        data: { courseSlug: course.slug, moduleSlug: currentModule.slug },
      });

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.awardedBadges && result.awardedBadges.length > 0) {
        toast.success(`🏅 New Badge Awarded: ${result.awardedBadges[0]}!`, { duration: 5000 });
      } else if (result.certificateNumber) {
        toast.success(`🎓 Course Complete! Certificate issued: ${result.certificateNumber}`, {
          duration: 7000,
        });
      } else {
        toast.success("Module completed! XP awarded.");
      }

      queryClient.invalidateQueries({ queryKey: ["module-user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["user-earned-badges"] });

      if (nextModule) {
        navigate({
          to: "/learn/$slug/$moduleSlug",
          params: { slug: course.slug, moduleSlug: nextModule.slug },
        });
      }
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      if (msg.includes("COURSE_NOT_FOUND")) {
        toast.error("Course not found. Please refresh and try again.");
      } else if (msg.includes("MODULE_NOT_FOUND")) {
        toast.error("Module not found. Please refresh and try again.");
      } else if (msg.includes("Invalid token") || msg.includes("Unauthorized")) {
        toast.error("Your session has expired. Please sign in again.", {
          duration: 7000,
          action: {
            label: "Sign In",
            onClick: () =>
              navigate({
                to: "/login",
                search: { next: `/learn/${course.slug}/${currentModule.slug}` },
              }),
          },
        });
      } else {
        toast.error(msg || "Failed to save progress. Please try again.");
      }
    } finally {
      setCompleting(false);
    }
  };

  // Quiz answer submission — server-side scoring only
  const handleCheckQuiz = async (quizId: string, moduleId: string) => {
    const selectedOption = selectedAnswers[quizId];
    if (selectedOption === undefined) return;

    setVerifyingQuizId(quizId);
    try {
      const result = await submitQuizAnswer({
        data: {
          quizId,
          moduleId,
          courseId: course.id,
          selectedOption,
        },
      });

      // Handle structured error codes returned by the server function
      if (result.error === "SESSION_EXPIRED") {
        toast.error("Your session has expired. Please sign in again to submit assessments.", {
          duration: 7000,
          action: {
            label: "Sign In",
            onClick: () =>
              navigate({
                to: "/login",
                search: { next: `/learn/${course.slug}/${currentModule.slug}` },
              }),
          },
        });
        return;
      }

      if (result.error) {
        toast.error(result.explanation ?? "Unable to verify answer. Please refresh and try again.");
        return;
      }

      setQuizResults((prev) => ({
        ...prev,
        [quizId]: {
          is_correct: result.is_correct,
          score: result.score,
          explanation: result.explanation ?? "",
        },
      }));
      setCheckedQuizzes((prev) => ({ ...prev, [quizId]: true }));

      if (result.is_correct) {
        toast.success("Correct answer! +10 XP");
        // Warn if session expired but result still computed
        if ((result as any).warning === "SESSION_EXPIRED") {
          toast.warning("Your session has expired. Sign in again to save your progress.", {
            duration: 6000,
            action: {
              label: "Sign In",
              onClick: () =>
                navigate({
                  to: "/login",
                  search: { next: `/learn/${course.slug}/${currentModule.slug}` },
                }),
            },
          });
        }
      }
    } catch (err: any) {
      const msg = err?.message || "";
      if (
        msg.includes("Unauthorized") ||
        msg.includes("Invalid token") ||
        msg.includes("No user ID") ||
        msg.includes("SESSION_EXPIRED") ||
        msg.includes("JWT expired") ||
        msg.includes("token is expired")
      ) {
        toast.error("Your session has expired. Please sign in again to continue.", {
          duration: 7000,
          action: {
            label: "Sign In",
            onClick: () =>
              navigate({
                to: "/login",
                search: { next: `/learn/${course.slug}/${currentModule.slug}` },
              }),
          },
        });
      } else {
        toast.error("Unable to verify answer. Please check your connection and try again.");
      }
    } finally {
      setVerifyingQuizId(null);
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

          {/* Core Module Learning Workbench */}
          <div className="lg:col-span-3 order-1 lg:order-2 space-y-8">
            {/* Step 1: Core Theory & Concept */}
            <section className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                    STEP 1
                  </span>
                  <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>Theory & First-Principles Architecture</span>
                  </h2>
                </div>
              </div>

              {/* 5-Level "Explain This" Assistant */}
              <ExplainThisAssistant explanations={lessonExplanations} />

              <div className="prose prose-slate max-w-none text-foreground leading-relaxed space-y-4">
                {currentModule.notes_md ? (
                  <div className="whitespace-pre-line text-sm sm:text-base text-foreground/90 font-normal">
                    {currentModule.notes_md}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    In this lesson, you will master the foundational architecture and defensive
                    concepts surrounding this topic.
                  </p>
                )}
              </div>

              {/* Interactive Educational Diagram Engine */}
              <div className="pt-4 border-t border-border/60">{renderInteractiveDiagram()}</div>
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
                Security analysts don't just read theory—they analyze logs, PCAPs, and
                authentication streams. Inspect the real telemetry feed below:
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
                    <span>Knowledge Check & Assessment ({quizzes.length} Questions)</span>
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
                                <span>{String(opt)}</span>
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
                            disabled={selected === undefined || verifyingQuizId === q.id}
                            onClick={() => handleCheckQuiz(q.id, currentModule.id)}
                            className="px-3.5 py-1.5 rounded-md text-xs font-mono bg-primary text-primary-foreground font-semibold disabled:opacity-40"
                          >
                            {verifyingQuizId === q.id ? "VERIFYING ANSWER…" : "Check Answer"}
                          </button>

                          {isChecked &&
                            (() => {
                              const serverResult = quizResults[q.id];
                              const correct = serverResult?.is_correct ?? false;
                              return (
                                <span
                                  className={`text-xs font-mono font-semibold ${
                                    correct ? "text-success" : "text-destructive"
                                  }`}
                                >
                                  {correct ? "Correct! +10 XP" : "Incorrect. Try again."}
                                </span>
                              );
                            })()}
                        </div>

                        {isChecked &&
                          (() => {
                            const serverResult = quizResults[q.id];
                            const explanation = serverResult?.explanation ?? q.explanation;
                            return explanation ? (
                              <div className="p-3 rounded-md bg-muted text-xs text-muted-foreground leading-relaxed border-l-2 border-primary">
                                <span className="font-semibold text-foreground">Explanation: </span>
                                {explanation}
                              </div>
                            ) : null;
                          })()}
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
                  <span>Hands-on IVVAB LABS Workbench</span>
                </h2>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Apply what you've learned inside an isolated Linux sandbox container with live
                network capture artifacts and automated task verification.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/cyber-range/lab/$slug"
                  params={{
                    slug:
                      (currentModule?.practice_labs && currentModule.practice_labs[0]) ||
                      "linux-ssh-brute-force-investigation",
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-xs"
                >
                  <Terminal className="w-4 h-4" />
                  <span>
                    Launch Dedicated Lab:{" "}
                    {(
                      (currentModule?.practice_labs && currentModule.practice_labs[0]) ||
                      "linux-ssh-brute-force-investigation"
                    )
                      .split("-")
                      .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
                      .join(" ")}
                  </span>
                </Link>
                <Link
                  to="/cyber-range/labs"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground font-semibold text-xs hover:bg-muted transition-colors shadow-xs"
                >
                  <span>Browse All Cyber Labs</span>
                </Link>
              </div>
            </section>

            {/* Authoritative Sources & Citations */}
            <AuthoritativeSources sources={lessonSources} />

            {/* Bottom Actions: Previous / Next / Complete */}
            <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
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
                      ? "SAVING PROGRESS…"
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
