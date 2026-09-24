/**
 * Badge definitions for front-end display.
 *
 * SECURITY: This file is imported in browser bundles. It MUST NOT:
 *   - Import supabase client (causes RLS bypass attempts from browser)
 *   - Import server-only modules
 *   - Call any Supabase write operations
 *
 * Badge AWARDING lives in src/lib/badge.functions.ts (server-only createServerFn).
 */

export interface BadgeDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: "COURSE" | "PATHWAY" | "SPECIALTY";
  iconName: string;
  courseSlug?: string;
  skills: string[];
  criteria: string;
}

export const ACADEMY_BADGES: BadgeDefinition[] = [
  {
    id: "badge-net-fund",
    slug: "network-navigator",
    name: "Network Navigator",
    description:
      "Demonstrated mastery of TCP/IP protocol stack, 3-way handshake, subnetting & CIDR calculations, and network packet analysis.",
    category: "COURSE",
    iconName: "Network",
    courseSlug: "networking-fundamentals",
    skills: ["TCP/IP", "Subnetting", "CIDR", "DNS", "Packet Analysis"],
    criteria:
      "Complete all 25 modules of Networking Fundamentals, pass all module quizzes with >= 70%, and solve the Suricata Threat Hunting Lab.",
  },
  {
    id: "badge-lin-fund",
    slug: "linux-foundations",
    name: "Linux Foundations",
    description:
      "Verified competence in Linux terminal operations, Filesystem Hierarchy (FHS), POSIX permissions (chmod), process triage, and log parsing.",
    category: "COURSE",
    iconName: "Terminal",
    courseSlug: "linux-fundamentals",
    skills: ["Linux CLI", "POSIX Permissions", "Process Management", "Syslog Analysis"],
    criteria:
      "Complete all Linux Fundamentals modules and solve the Linux SSH Brute Force Investigation Cyber Lab.",
  },
  {
    id: "badge-cyber-found",
    slug: "cybersecurity-foundations-badge",
    name: "Cybersecurity Foundations",
    description:
      "Mastery of first-principles security: CIA Triad, threat modeling, attack surface reduction, and access control hygiene.",
    category: "COURSE",
    iconName: "ShieldCheck",
    courseSlug: "cybersecurity-foundations",
    skills: ["CIA Triad", "Threat Modeling", "Authentication & MFA", "Defense in Depth"],
    criteria: "Complete all modules in Cybersecurity Foundations and pass the course assessment.",
  },
  {
    id: "badge-soc-found",
    slug: "soc-analyst-foundations-badge",
    name: "SOC Analyst Foundations",
    description:
      "Demonstrated ability to ingest raw telemetry, correlate alerts, triage indicators of compromise (IOCs), and execute incident containment.",
    category: "COURSE",
    iconName: "Activity",
    courseSlug: "soc-analyst-foundations",
    skills: ["SIEM Triage", "Sigma Rules", "Log Correlation", "Incident Containment"],
    criteria:
      "Complete SOC Analyst Foundations and successfully triage real incident telemetry datasets.",
  },
  {
    id: "badge-dfir-investigator",
    slug: "digital-forensics-investigator-badge",
    name: "Digital Forensics Investigator",
    description:
      "Verified capability in memory dump analysis with Volatility 3, Windows registry persistence triage, and forensic timeline reconstruction.",
    category: "COURSE",
    iconName: "Zap",
    courseSlug: "digital-forensics-foundations",
    skills: ["Memory Forensics", "Volatility 3", "Registry Triage", "Timeline Reconstruction"],
    criteria:
      "Complete Digital Forensics Foundations and extract flags from memory dump dumps in Cyber Range.",
  },
  {
    id: "badge-cloud-sec",
    slug: "cloud-security-foundations-badge",
    name: "Cloud Security Foundations",
    description:
      "Mastery of container capability isolation, Docker breakout defenses, and cloud IAM policy enforcement.",
    category: "COURSE",
    iconName: "Layers",
    courseSlug: "cloud-security-fundamentals",
    skills: ["Docker Hardening", "Linux Capabilities", "Kubernetes Auditing", "Cloud IAM"],
    criteria: "Complete Cloud Security Fundamentals and solve the Container Breakout Defense Lab.",
  },
];

/**
 * Look up a badge definition by slug (browser-safe, no DB calls).
 */
export function getBadgeBySlug(slug: string): BadgeDefinition | undefined {
  return ACADEMY_BADGES.find((b) => b.slug === slug);
}
