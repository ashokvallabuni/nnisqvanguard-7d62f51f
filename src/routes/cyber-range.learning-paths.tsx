import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Compass,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  Shield,
  Layers,
  Terminal,
  Database,
  Sparkles,
  Zap,
  BookmarkCheck,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Lock,
  Play,
  HelpCircle,
  FileText,
  Activity,
  Bot,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useIvvabChat } from "@/lib/ivvab-chat";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/cyber-range/learning-paths")({
  head: () => ({
    meta: [
      { title: "Cybersecurity Learning Paths & Career Roadmaps — NISQ Vanguard" },
      {
        name: "description",
        content:
          "Structured cybersecurity learning paths mapped directly to NISQ Vanguard Academy courses, forensic datasets, and hands-on IVVAB LABS.",
      },
    ],
  }),
  component: LearningPathsPage,
});

interface PathStep {
  stepNumber: number;
  stageName: string; // The 12-step stage
  title: string;
  type: "theory" | "data" | "lab" | "assessment";
  duration: string;
  linkTo?: string;
  description: string;
  associatedLabSlug?: string;
}

interface CareerPath {
  id: string;
  slug: string;
  title: string;
  role: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Comprehensive";
  courseSlug: string;
  courseTitle: string;
  description: string;
  prerequisites: string[];
  learningObjectives: string[];
  totalDurationHours: number;
  skills: string[];
  associatedLab: {
    slug: string;
    title: string;
    difficulty: string;
    rewardPoints: number;
  };
  steps: PathStep[];
  nextPathRecommendation?: {
    title: string;
    slug: string;
  };
}

const STRUCTURED_PATHS: CareerPath[] = [
  {
    id: "path-foundations",
    slug: "cybersecurity-foundations-track",
    title: "Cybersecurity Foundations & Threat Architecture",
    role: "Junior Cyber Defender",
    level: "Beginner",
    courseSlug: "cybersecurity-foundations",
    courseTitle: "Cybersecurity Foundations",
    description:
      "Master the core mental models of cybersecurity: CIA Triad, Parkerian Hexad, AAA authentication framework, Lockheed Martin kill chain, and host access logs.",
    prerequisites: [
      "Basic computer literacy",
      "Familiarity with web browsing and operating systems",
    ],
    learningObjectives: [
      "Evaluate security events using Confidentiality, Integrity, and Availability",
      "Deconstruct multi-stage attacks across the Cyber Kill Chain",
      "Analyze Linux authentication failure telemetry in /var/log/auth.log",
      "Contain automated credential-stuffing probes in IVVAB LABS",
    ],
    totalDurationHours: 10,
    skills: ["CIA Triad", "Kill Chain Analysis", "Auth Log Parsing", "Fail2Ban Principles"],
    associatedLab: {
      slug: "linux-ssh-brute-force-investigation",
      title: "Linux SSH Brute Force Investigation",
      difficulty: "EASY",
      rewardPoints: 100,
    },
    nextPathRecommendation: {
      title: "Networking Fundamentals & Threat Detection Track",
      slug: "networking-fundamentals-track",
    },
    steps: [
      {
        stepNumber: 1,
        stageName: "1. Learning Objectives",
        title: "Define Threat Modeling & Core Defense Mindset",
        type: "theory",
        duration: "1h",
        linkTo: "/learn/cybersecurity-foundations",
        description: "Establish defensive mental models, threat actors, and attack surfaces.",
      },
      {
        stepNumber: 2,
        stageName: "2. Prerequisite Knowledge",
        title: "The CIA Triad & Parkerian Hexad Foundations",
        type: "theory",
        duration: "1.5h",
        linkTo: "/learn/cybersecurity-foundations/what-is-networking",
        description: "Understand Confidentiality, Integrity, and Availability in production systems.",
      },
      {
        stepNumber: 3,
        stageName: "3. Concept Introduction",
        title: "Authentication, Authorization & Accounting (AAA)",
        type: "theory",
        duration: "1h",
        linkTo: "/learn/cybersecurity-foundations/authentication-and-access-control",
        description: "Pluggable Authentication Modules (PAM) and identity verification models.",
      },
      {
        stepNumber: 4,
        stageName: "4. Detailed Theoretical Explanation",
        title: "The Cyber Kill Chain & MITRE ATT&CK Mapping",
        type: "theory",
        duration: "2h",
        linkTo: "/learn/cybersecurity-foundations/the-cyber-threat-landscape",
        description: "From Reconnaissance to Actions on Objectives: how adversaries progress.",
      },
      {
        stepNumber: 5,
        stageName: "5. Practical Demonstration",
        title: "Linux Auth.log Structure & Syslog Telemetry",
        type: "data",
        duration: "1h",
        linkTo: "/learn/cybersecurity-foundations/authentication-and-access-control",
        description: "Inspect authentic failed password timestamps, source ports, and daemons.",
      },
      {
        stepNumber: 6,
        stageName: "6. Hands-on Investigation",
        title: "Lab: Linux SSH Brute Force Investigation",
        type: "lab",
        duration: "45m",
        linkTo: "/cyber-range/lab/linux-ssh-brute-force-investigation",
        associatedLabSlug: "linux-ssh-brute-force-investigation",
        description: "Isolate attacker IP 192.168.1.105 and calculate attack volume in sandbox.",
      },
      {
        stepNumber: 7,
        stageName: "7. Knowledge-Check Assessment",
        title: "Host Forensics & Log Parsing Assessment",
        type: "assessment",
        duration: "30m",
        linkTo: "/learn/cybersecurity-foundations",
        description: "Validate understanding of grep, awk, and authentication security.",
      },
    ],
  },
  {
    id: "path-networking",
    slug: "networking-fundamentals-track",
    title: "Networking Fundamentals & Perimeter Threat Hunting",
    role: "Network Security Analyst",
    level: "Beginner",
    courseSlug: "networking-fundamentals",
    courseTitle: "Networking Fundamentals",
    description:
      "A complete guide to OSI Layer 2–7 architecture, TCP 3-way handshakes, IPv4 subnetting, DNS resolution, and Suricata NIDS packet analysis.",
    prerequisites: [
      "Cybersecurity Foundations",
      "Basic understanding of IP addresses and binary counting",
    ],
    learningObjectives: [
      "Map protocols and threat vectors across the 7 OSI layers",
      "Analyze TCP SYN, SYN-ACK, ACK packet states and port exhaustion attacks",
      "Detect DNS tunneling and high-entropy domain data exfiltration",
      "Investigate Suricata EVE JSON alerts and PCAP telemetry",
    ],
    totalDurationHours: 12,
    skills: ["OSI Model", "TCP 3-Way Handshake", "DNS Tunneling", "Suricata NIDS", "PCAP Triage"],
    associatedLab: {
      slug: "suricata-network-threat-hunting",
      title: "Suricata Network Threat Hunting & PCAP Analysis",
      difficulty: "MEDIUM",
      rewardPoints: 150,
    },
    nextPathRecommendation: {
      title: "Linux Command Quest & Host Defense Track",
      slug: "linux-command-quest-track",
    },
    steps: [
      {
        stepNumber: 1,
        stageName: "1. Learning Objectives",
        title: "Network Fundamentals & Physical Topologies",
        type: "theory",
        duration: "1.5h",
        linkTo: "/learn/networking-fundamentals/network-fundamentals-topologies",
        description: "LAN vs WAN classifications, star/bus/mesh networks, and packet routing.",
      },
      {
        stepNumber: 2,
        stageName: "2. Prerequisite Knowledge",
        title: "OSI 7 Layers & TCP/IP Model Protocol Architecture",
        type: "theory",
        duration: "2h",
        linkTo: "/learn/networking-fundamentals/osi-vs-tcp-ip-models",
        description: "Encapsulation, headers, transport protocols (TCP vs UDP), and port binding.",
      },
      {
        stepNumber: 3,
        stageName: "3. Concept Introduction",
        title: "IP Addressing, CIDR Subnetting & Packet Routing",
        type: "theory",
        duration: "2h",
        linkTo: "/learn/networking-fundamentals/ipv4-ipv6-subnetting",
        description: "Network masks, broadcast domains, default gateways, and NAT translation.",
      },
      {
        stepNumber: 4,
        stageName: "4. Practical Demonstration",
        title: "TCP 3-Way Handshake & Connection State Telemetry",
        type: "data",
        duration: "1.5h",
        linkTo: "/learn/networking-fundamentals/tcp-udp-deep-dive",
        description: "SYN flood mechanics, TCP sequence numbers, and packet capture dissection.",
      },
      {
        stepNumber: 5,
        stageName: "5. Hands-on Investigation",
        title: "Lab: Suricata Network Threat Hunting & PCAP",
        type: "lab",
        duration: "45m",
        linkTo: "/cyber-range/lab/suricata-network-threat-hunting",
        associatedLabSlug: "suricata-network-threat-hunting",
        description: "Hunt C2 beaconing and decode Base64 DNS tunneling payloads in sandbox.",
      },
      {
        stepNumber: 6,
        stageName: "6. Knowledge-Check Assessment",
        title: "Network Protocol Security & NIDS Exam",
        type: "assessment",
        duration: "45m",
        linkTo: "/learn/networking-fundamentals",
        description: "Evaluate packet filtering rules, DNS protocols, and Suricata telemetry.",
      },
    ],
  },
  {
    id: "path-linux",
    slug: "linux-command-quest-track",
    title: "Linux Command Quest & System Operations",
    role: "Security Systems Engineer",
    level: "Intermediate",
    courseSlug: "linux-command-quest",
    courseTitle: "Linux Command Quest",
    description:
      "Transform from terminal novice to cyber operative across 7 skill zones: Filesystem navigation, chmod/chown permissions, sockets, processes, and log forensics.",
    prerequisites: [
      "Cybersecurity Foundations",
      "Comfort with basic shell prompts",
    ],
    learningObjectives: [
      "Navigate and manipulate UNIX directory structures efficiently",
      "Audit and enforce standard and special file permissions (SUID, SGID, Sticky bit)",
      "Inspect listening network sockets with ss and netstat",
      "Manage process lifecycles and defeat Operation Dark Horizon boss battle",
    ],
    totalDurationHours: 14,
    skills: ["Linux Navigation", "chmod / chown Permissions", "Socket Auditing", "Process Warfare"],
    associatedLab: {
      slug: "linux-ssh-brute-force-investigation",
      title: "Linux SSH Brute Force Investigation",
      difficulty: "EASY",
      rewardPoints: 100,
    },
    nextPathRecommendation: {
      title: "Web Application Security & Forensics Track",
      slug: "web-application-security-track",
    },
    steps: [
      {
        stepNumber: 1,
        stageName: "1. Learning Objectives",
        title: "Skill Zone 1: Filesystem Reconnaissance (pwd/ls/cd)",
        type: "theory",
        duration: "1.5h",
        linkTo: "/learn/linux-command-quest/zone-1-recon-navigation",
        description: "Essential navigation, absolute vs relative paths, and hidden dotfiles.",
      },
      {
        stepNumber: 2,
        stageName: "2. Prerequisite Knowledge",
        title: "Skill Zone 2: Object Manipulation & Pipes",
        type: "theory",
        duration: "2h",
        linkTo: "/learn/linux-command-quest/zone-2-object-manipulation",
        description: "touch, mkdir, cp, mv, rm, and shell redirection operators (> >> |).",
      },
      {
        stepNumber: 3,
        stageName: "3. Concept Introduction",
        title: "Skill Zone 3: Permission Matrix (chmod, chown, SUID)",
        type: "theory",
        duration: "2h",
        linkTo: "/learn/linux-command-quest/zone-3-permission-fortress",
        description: "Read, write, execute octal masks and privilege escalation traps.",
      },
      {
        stepNumber: 4,
        stageName: "4. Practical Demonstration",
        title: "Skill Zone 4: Log Forensics (grep, awk, sed, sort)",
        type: "data",
        duration: "2h",
        linkTo: "/learn/linux-command-quest/zone-4-log-forensics",
        description: "High-speed text analysis pipelines for security incident triage.",
      },
      {
        stepNumber: 5,
        stageName: "5. Hands-on Investigation",
        title: "Boss Battle Quest: Operation Dark Horizon",
        type: "lab",
        duration: "1h",
        linkTo: "/learn/linux-command-quest/zone-7-boss-battle",
        description: "Synthesize all 6 zones to locate the adversary's root access token.",
      },
    ],
  },
  {
    id: "path-web-sec",
    slug: "web-application-security-track",
    title: "Web Application Security & Incident Forensics",
    role: "AppSec Engineer / Web Forensic Analyst",
    level: "Intermediate",
    courseSlug: "cyber-security-master-curriculum",
    courseTitle: "Cyber Security Master Curriculum (Module 3)",
    description:
      "Investigate web application attacks: SQL injection in-band and blind, Cross-Site Scripting (XSS), URL encoding in HTTP access logs, and database patching.",
    prerequisites: [
      "Networking Fundamentals (HTTP methods, response status codes)",
      "Basic SQL query syntax",
    ],
    learningObjectives: [
      "Decode URL-encoded attack parameters (%27, %20, %22) in access logs",
      "Differentiate between authentication bypass probes and UNION SELECT data exfiltration",
      "Correlate HTTP response sizes to confirm unauthorized record extraction",
      "Implement parameterized prepared statements to eradicate injection vectors",
    ],
    totalDurationHours: 16,
    skills: ["SQL Injection", "HTTP Access Logs", "UNION SELECT Forensics", "Parameterized Queries"],
    associatedLab: {
      slug: "sql-injection-incident-forensics",
      title: "SQL Injection Incident Forensics",
      difficulty: "MEDIUM",
      rewardPoints: 125,
    },
    nextPathRecommendation: {
      title: "Digital Forensics & Memory Analysis Track",
      slug: "digital-forensics-memory-track",
    },
    steps: [
      {
        stepNumber: 1,
        stageName: "1. Learning Objectives",
        title: "How Web Applications Work & HTTP Protocol Telemetry",
        type: "theory",
        duration: "2h",
        linkTo: "/learn/cyber-security-master-curriculum",
        description: "Client-server architecture, GET/POST methods, headers, and cookies.",
      },
      {
        stepNumber: 2,
        stageName: "2. Prerequisite Knowledge",
        title: "SQL Fundamentals & Relational Database Architecture",
        type: "theory",
        duration: "2h",
        linkTo: "/academy/glossary",
        description: "Tables, columns, SELECT queries, WHERE clauses, and UNION operators.",
      },
      {
        stepNumber: 3,
        stageName: "3. Concept Introduction",
        title: "SQL Injection Vectors (In-Band, Blind & Tautologies)",
        type: "theory",
        duration: "2.5h",
        linkTo: "/academy",
        description: "How untrusted string concatenation allows query alteration.",
      },
      {
        stepNumber: 4,
        stageName: "4. Practical Demonstration",
        title: "Apache & Nginx Access Logs in Combined Format",
        type: "data",
        duration: "1.5h",
        linkTo: "/cyber-range/datasets",
        description: "Reconstructing adversary IP timelines and payload byte expansions.",
      },
      {
        stepNumber: 5,
        stageName: "5. Hands-on Investigation",
        title: "Lab: SQL Injection Incident Forensics",
        type: "lab",
        duration: "40m",
        linkTo: "/cyber-range/lab/sql-injection-incident-forensics",
        associatedLabSlug: "sql-injection-incident-forensics",
        description: "Inspect /var/log/apache2/access.log, identify UNION queries, and capture flag.",
      },
      {
        stepNumber: 6,
        stageName: "6. Knowledge-Check Assessment",
        title: "Application Security & Prepared Statements Exam",
        type: "assessment",
        duration: "45m",
        linkTo: "/academy",
        description: "Verify knowledge of secure coding and SQLi prevention.",
      },
    ],
  },
  {
    id: "path-dfir",
    slug: "digital-forensics-memory-track",
    title: "Digital Forensics & Memory Analysis (DFIR)",
    role: "Incident Responder / DFIR Specialist",
    level: "Advanced",
    courseSlug: "digital-forensics",
    courseTitle: "Digital Forensics & Memory Analysis",
    description:
      "Triage volatile RAM captures under RFC 3227. Spot abnormal process trees with Volatility 3 windows.pslist, identify reverse shells with windows.netscan, and isolate rootkits.",
    prerequisites: [
      "Operating System Architecture (PIDs, PPIDs, Windows Services)",
      "Network connection states (TCP ESTABLISHED, listening sockets)",
    ],
    learningObjectives: [
      "Apply the Order of Volatility (RFC 3227) during active breaches",
      "Walk kernel EPROCESS structures using Volatility 3 plugins",
      "Trace stealthy reverse shell connections linked to rogue processes",
      "Formulate incident scoping reports with indicators of compromise (IOCs)",
    ],
    totalDurationHours: 18,
    skills: ["RFC 3227 Volatility", "Volatility 3 Plugins", "Process Tree Auditing", "Rootkit Triage"],
    associatedLab: {
      slug: "memory-forensics-with-volatility-3",
      title: "Memory Forensics with Volatility 3 (Simulation)",
      difficulty: "HARD",
      rewardPoints: 200,
    },
    nextPathRecommendation: {
      title: "Cyber Security Master Curriculum Track",
      slug: "master-cyber-curriculum-track",
    },
    steps: [
      {
        stepNumber: 1,
        stageName: "1. Learning Objectives",
        title: "The Order of Volatility & Digital Forensic Methodology",
        type: "theory",
        duration: "2h",
        linkTo: "/academy/glossary",
        description: "RFC 3227: Registers, cache, RAM, swap space, disk, and remote archives.",
      },
      {
        stepNumber: 2,
        stageName: "2. Prerequisite Knowledge",
        title: "Windows OS Process Architecture & System Daemons",
        type: "theory",
        duration: "2.5h",
        linkTo: "/academy",
        description: "Legitimate process parentage: System -> smss -> csrss/wininit -> services -> svchost.",
      },
      {
        stepNumber: 3,
        stageName: "3. Concept Introduction",
        title: "Volatility 3 Kernel Analysis Framework",
        type: "theory",
        duration: "2h",
        linkTo: "/academy",
        description: "Understanding windows.pslist, windows.netscan, and windows.malfind.",
      },
      {
        stepNumber: 4,
        stageName: "4. Practical Demonstration",
        title: "Correlating Process IDs with Network Sockets",
        type: "data",
        duration: "1.5h",
        linkTo: "/cyber-range/datasets",
        description: "Matching foreign C2 IPs on port 4444 to rogue memory allocations.",
      },
      {
        stepNumber: 5,
        stageName: "5. Hands-on Investigation",
        title: "Lab: Memory Forensics with Volatility 3",
        type: "lab",
        duration: "1h",
        linkTo: "/cyber-range/lab/memory-forensics-with-volatility-3",
        associatedLabSlug: "memory-forensics-with-volatility-3",
        description: "Inspect /evidence/pslist.txt and netscan.txt to locate malware.exe and flag.",
      },
      {
        stepNumber: 6,
        stageName: "6. Practical Assessment",
        title: "DFIR Case Closure & Incident Reporting Exam",
        type: "assessment",
        duration: "45m",
        linkTo: "/academy",
        description: "Drafting forensic reports and proving evidentiary chain of custody.",
      },
    ],
  },
  {
    id: "path-master",
    slug: "master-cyber-curriculum-track",
    title: "Cyber Security Master Track (52-Lesson Capstone)",
    role: "Lead Security Architect / SOC Specialist",
    level: "Comprehensive",
    courseSlug: "cyber-security-master-curriculum",
    courseTitle: "Cyber Security Master Curriculum",
    description:
      "A complete 52-lesson roadmap spanning OSINT reconnaissance, system exploitation, web defenses, and enterprise Active Directory with end-to-end IVVAB LABS verification.",
    prerequisites: [
      "All previous foundational and intermediate paths",
      "Demonstrated completion of IVVAB LABS practical challenges",
    ],
    learningObjectives: [
      "Conduct passive and active intelligence gathering with Nmap & OSINT tools",
      "Audit Kerberoasting and Active Directory delegation vulnerabilities",
      "Perform multi-stage lateral movement detection",
      "Achieve Capstone Enterprise Certification from Chief Architect Ashok Vallabuni",
    ],
    totalDurationHours: 24,
    skills: ["OSINT & Recon", "Active Directory", "Lateral Movement", "Enterprise Defense"],
    associatedLab: {
      slug: "memory-forensics-with-volatility-3",
      title: "Memory Forensics with Volatility 3 (Simulation)",
      difficulty: "HARD",
      rewardPoints: 200,
    },
    steps: [
      {
        stepNumber: 1,
        stageName: "1. Reconnaissance & OSINT",
        title: "Passive Intelligence & Port Footprinting",
        type: "theory",
        duration: "4h",
        linkTo: "/learn/cyber-security-master-curriculum",
        description: "Google Dorking, Shodan enumeration, and Nmap timing templates.",
      },
      {
        stepNumber: 2,
        stageName: "2. System Exploitation & Payloads",
        title: "Buffer Overflow Principles & Shell Handlers",
        type: "theory",
        duration: "5h",
        linkTo: "/learn/cyber-security-master-curriculum",
        description: "Bind vs reverse shells, Netcat listeners, and privilege escalation.",
      },
      {
        stepNumber: 3,
        stageName: "3. Web Application Defenses",
        title: "OWASP Top 10 Enterprise Hardening",
        type: "theory",
        duration: "5h",
        linkTo: "/learn/cyber-security-master-curriculum",
        description: "Deep dive into IDOR, SSRF, broken object-level authorization, and SQLi.",
      },
      {
        stepNumber: 4,
        stageName: "4. Active Directory Warfare",
        title: "Kerberos TGT/TGS, AS-REP Roasting & BloodHound",
        type: "theory",
        duration: "6h",
        linkTo: "/learn/cyber-security-master-curriculum",
        description: "Domain controller architecture, GPO poisoning, and ticket attacks.",
      },
      {
        stepNumber: 5,
        stageName: "5. Practical Capstone Exam",
        title: "Comprehensive Defensive Certification Exam",
        type: "assessment",
        duration: "4h",
        linkTo: "/learn/cyber-security-master-curriculum",
        description: "Final exam awarding the Junior Cyber Defense Operative badge.",
      },
    ],
  },
];

function LearningPathsPage() {
  const { user } = useAuth();
  const { openIvvab } = useIvvabChat();
  const queryClient = useQueryClient();

  const [expandedPathId, setExpandedPathId] = useState<string>("path-foundations");

  const stepTypeBadges = {
    theory: { label: "Theory Lesson", class: "bg-primary/10 text-primary border-primary/20" },
    data: { label: "Telemetry Data", class: "bg-accent/15 text-accent border-accent/30" },
    lab: { label: "IVVAB LABS Sandbox", class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    assessment: { label: "Assessment Exam", class: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  };

  // Fetch enrolled paths for this user
  const { data: enrolledSlugs = [] } = useQuery({
    queryKey: ["user-learning-paths", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("user_learning_paths")
        .select("path_slug")
        .eq("user_id", user.id);
      return (data ?? []).map((r) => r.path_slug).filter((slug): slug is string => Boolean(slug));
    },
    enabled: !!user,
  });

  // Fetch lab progress to show real completion status
  const { data: labProgressList = [] } = useQuery({
    queryKey: ["user-lab-progress-all", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("lab_progress")
        .select("lab_id, completed, points")
        .eq("user_id", user.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const completedLabMap = useMemo(() => {
    const map = new Map<string, boolean>();
    labProgressList.forEach((lp) => {
      if (lp.completed) map.set(lp.lab_id, true);
    });
    return map;
  }, [labProgressList]);

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: async (pathSlug: string) => {
      if (!user) {
        toast.info("Sign in to sync your learning progress across devices.");
        return pathSlug;
      }
      const { error } = await supabase
        .from("user_learning_paths")
        .upsert(
          { user_id: user.id, path_slug: pathSlug, enrolled_at: new Date().toISOString() },
          { onConflict: "user_id,path_slug" },
        );
      if (error) throw error;
      return pathSlug;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-learning-paths"] });
      toast.success("Enrolled in learning path! Real-time progress is now tracking.");
    },
    onError: () => {
      toast.error("Failed to enroll. Please try again.");
    },
  });

  const isEnrolled = useCallback((slug: string) => enrolledSlugs.includes(slug), [enrolledSlugs]);

  const toggleExpand = (id: string) => {
    setExpandedPathId((prev) => (prev === id ? "" : id));
  };

  const handleAskIvvab = (path: CareerPath) => {
    openIvvab(
      `Can you explain the learning path for "${path.title}", what prerequisite skills I need, and how the "${path.associatedLab.title}" lab connects to this career track?`,
      {
        courseSlug: path.courseSlug,
        labSlug: path.associatedLab.slug,
        learningMode: "general",
      },
    );
  };

  return (
    <div className="min-h-screen pt-16 pb-24 bg-background">
      <PageHeader
        badge="Structured Learning"
        badgeVariant="primary"
        title="IVVAB LABS Guided Learning Paths"
        subtitle="Step-by-step educational journeys mapped to NISQ Vanguard Academy courses, forensic telemetry datasets, hands-on lab workbenches, and interactive AI tutoring."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Learning Paths" }]}
      />

      {/* 12-Step Progression Lifecycle Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wider">
              Consistent 12-Step Educational Journey Progression
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Every learning experience follows a rigorous pedagogical progression: Understand why you perform each task, observe real security telemetry, and connect discoveries to actual SOC and defensive operations.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-[11px] font-mono">
            {[
              "1. Objectives",
              "2. Prerequisites",
              "3. Concept Intro",
              "4. Detailed Theory",
              "5. Guided Demo",
              "6. Investigation",
              "7. Lab Tasks",
              "8. Knowledge Check",
              "9. Assessment",
              "10. Results & Feedback",
              "11. Completion Track",
              "12. Next Activity",
            ].map((step, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1.5 rounded-lg border border-border/70 bg-card/60 text-foreground flex items-center gap-1.5 font-medium"
              >
                <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="truncate">{step.split(". ")[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Path List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        {STRUCTURED_PATHS.map((path) => {
          const isExpanded = expandedPathId === path.id;
          const enrolled = isEnrolled(path.slug);
          const labSolved = completedLabMap.get(path.associatedLab.slug) || false;

          return (
            <div
              key={path.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? "border-primary/60 bg-card shadow-lg shadow-primary/5"
                  : "border-border bg-card/80 hover:border-border/90"
              }`}
            >
              {/* Path Header Bar */}
              <div className="p-6 sm:p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20 font-semibold">
                      {path.level} Track
                    </span>
                    <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" /> ~{path.totalDurationHours} Hours
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      Target Role: <strong className="text-foreground">{path.role}</strong>
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
                    {path.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {path.description}
                  </p>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {path.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/70"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions & Status */}
                <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3">
                  <div className="flex items-center gap-2">
                    {enrolled ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-xs">
                        <BookmarkCheck className="w-4 h-4" /> Enrolled
                      </span>
                    ) : (
                      <button
                        onClick={() => enrollMutation.mutate(path.slug)}
                        disabled={enrollMutation.isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-colors shadow-xs"
                      >
                        <span>Enroll Path</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleAskIvvab(path)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-medium transition-colors"
                      title="Ask IVVAB AI about this learning path"
                    >
                      <Bot className="w-3.5 h-3.5 text-primary" />
                      <span>Ask IVVAB</span>
                    </button>
                  </div>

                  <button
                    onClick={() => toggleExpand(path.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:underline cursor-pointer pt-1"
                  >
                    <span>{isExpanded ? "Collapse Syllabus" : "View 12-Step Progression"}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Associated Practical Lab Highlight */}
              <div className="px-6 py-3.5 bg-muted/20 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-muted-foreground font-mono">Associated Practical Lab:</span>
                  <strong className="text-foreground font-semibold truncate">
                    {path.associatedLab.title}
                  </strong>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">
                    +{path.associatedLab.rewardPoints} XP
                  </span>
                  {labSolved && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Solved ✓
                    </span>
                  )}
                </div>

                <Link
                  to={`/cyber-range/lab/${path.associatedLab.slug}`}
                  className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline shrink-0"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Launch Lab Workbench</span>
                </Link>
              </div>

              {/* Expanded 12-Step Detail Area */}
              {isExpanded && (
                <div className="p-6 sm:p-8 space-y-6 bg-card">
                  {/* Prerequisites & Objectives */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl border border-border/70 bg-muted/20">
                    <div className="space-y-2">
                      <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Prerequisite Knowledge
                      </h4>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {path.prerequisites.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" /> Learning Objectives
                      </h4>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {path.learningObjectives.map((obj, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Sequential Progression Steps */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Sequential Progression (01 → 0{path.steps.length})
                      </h4>
                      <span className="text-xs font-mono text-muted-foreground">
                        Verified Course: <Link to={`/learn/${path.courseSlug}`} className="text-primary hover:underline">{path.courseTitle}</Link>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {path.steps.map((step) => {
                        const badge = stepTypeBadges[step.type];
                        const isAssociatedLab = Boolean(step.associatedLabSlug);
                        const isLabCompleted = isAssociatedLab && completedLabMap.get(step.associatedLabSlug!) === true;

                        return (
                          <div
                            key={step.stepNumber}
                            className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-colors ${
                              isLabCompleted
                                ? "border-emerald-500/40 bg-emerald-500/5"
                                : "border-border bg-muted/15 hover:border-primary/40"
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">
                                  0{step.stepNumber}
                                </span>
                                <span
                                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${badge.class}`}
                                >
                                  {badge.label}
                                </span>
                              </div>

                              <span className="text-[10px] font-mono text-primary/80 uppercase tracking-wide block">
                                {step.stageName}
                              </span>

                              <h5 className="font-semibold text-sm text-foreground line-clamp-2">
                                {step.title}
                              </h5>

                              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                {step.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs font-mono text-muted-foreground">
                              <span>{step.duration}</span>
                              {step.linkTo && (
                                <Link
                                  to={step.linkTo}
                                  className="text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                                >
                                  <span>{step.type === "lab" ? "Launch Lab" : "Open Lesson"}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Next Step Recommendation */}
                  {path.nextPathRecommendation && (
                    <div className="p-4 rounded-xl border border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">
                          Recommended next milestone:
                        </span>
                        <strong className="text-foreground">{path.nextPathRecommendation.title}</strong>
                      </div>
                      <button
                        onClick={() => {
                          const target = STRUCTURED_PATHS.find(
                            (p) => p.slug === path.nextPathRecommendation?.slug,
                          );
                          if (target) setExpandedPathId(target.id);
                        }}
                        className="text-primary hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Next Roadmap</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
