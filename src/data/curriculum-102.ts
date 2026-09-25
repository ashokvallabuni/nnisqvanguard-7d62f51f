import { CitationSource } from "@/components/academy/AuthoritativeSources";
import { ConceptExplanations } from "@/components/academy/ExplainThisAssistant";

export interface CurriculumModule {
  id: string;
  slug: string;
  title: string;
  order_index: number;
  duration_minutes: number;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  tags: string[];
  summary: string;
  notes_md: string;
  diagram_type?:
    | "network_topology"
    | "tcp_handshake"
    | "ip_subnet"
    | "linux_fs"
    | "linux_perms"
    | "cia_triad"
    | "soc_pipeline";
  dataset_ref?: {
    name: string;
    source: string;
    description: string;
    format: string;
    recordsCount: number;
    sampleData: any;
    kaggleUrl?: string;
  };
  sources: CitationSource[];
  explanations?: ConceptExplanations;
  quizzes: Array<{
    question: string;
    options: string[];
    correct_option: number;
    explanation: string;
  }>;
  companion_lab_slug?: string;
}

export interface CurriculumCourse {
  id: string;
  number: number;
  path_id: string;
  path_name: string;
  slug: string;
  title: string;
  level: "BEGINNER" | "FOUNDATION" | "INTERMEDIATE" | "ADVANCED";
  tier: "free" | "pro";
  estimated_minutes: number;
  summary: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
  badge_slug: string;
  badge_name: string;
  skills: string[];
  companion_lab_slug?: string;
  modules: CurriculumModule[];
}

export interface LearningPathDefinition {
  id: string;
  slug: string;
  title: string;
  course_range: string;
  description: string;
  courses_count: number;
  target_roles: string[];
  icon: string;
  course_slugs: string[];
}

export const LEARNING_PATHS: LearningPathDefinition[] = [
  {
    id: "path-1",
    slug: "absolute-beginner-cyber-awareness",
    title: "Path 1: Absolute Beginner & Cyber Awareness",
    course_range: "Courses 1–10",
    description:
      "Build cybersecurity intuition from zero. Master digital hygiene, social engineering triage, device defense, MFA, OPSEC, and cyber law.",
    courses_count: 10,
    target_roles: ["Security Generalist", "Awareness Champion", "IT Support Specialist"],
    icon: "ShieldAlert",
    course_slugs: [
      "digital-safety-hygiene",
      "social-engineering-phishing-defense",
      "financial-upi-fraud-prevention",
      "mobile-smartphone-security",
      "wifi-public-network-safety",
      "opsec-basics",
      "hardware-device-security",
      "password-managers-mfa-setup",
      "social-media-account-recovery",
      "cyber-ethics-legal-frameworks",
    ],
  },
  {
    id: "path-2",
    slug: "computer-networking-web-infrastructure",
    title: "Path 2: Computer Networking & Web Infrastructure",
    course_range: "Courses 11–20",
    description:
      "Deep dive into OSI layers, TCP/IP, DNS, routing, NAT, HTTP/S, packet captures, and network traffic filtering.",
    courses_count: 10,
    target_roles: ["Network Security Engineer", "SOC Analyst Tier 1", "Infrastructure Defender"],
    icon: "Network",
    course_slugs: [
      "networking-fundamentals-part-1",
      "networking-fundamentals-part-2",
      "transport-protocols-tcp-udp",
      "domain-name-system-dns",
      "subnetting-ip-addressing",
      "web-protocols-http-https",
      "network-ports-standard-services",
      "dhcp-protocol",
      "firewalls-network-traffic-control",
      "network-address-translation-nat",
    ],
  },
  {
    id: "path-3",
    slug: "operating-system-operations",
    title: "Path 3: Operating System Operations",
    course_range: "Courses 21–30",
    description:
      "Master Linux CLI, permissions, shell scripting, Windows architecture, registry, PowerShell, Active Directory, and containers.",
    courses_count: 10,
    target_roles: ["Systems Administrator", "Incident Responder", "Platform Engineer"],
    icon: "Terminal",
    course_slugs: [
      "linux-fundamentals-part-1",
      "linux-fundamentals-part-2",
      "linux-file-permissions-ownership",
      "linux-sysadmin-users",
      "linux-shell-scripting",
      "windows-architecture-admin",
      "windows-registry-services",
      "windows-cmd-powershell",
      "active-directory-foundations",
      "virtualization-containerization",
    ],
  },
  {
    id: "path-4",
    slug: "threat-landscape-security-fundamentals",
    title: "Path 4: Threat Landscape & Security Fundamentals",
    course_range: "Courses 31–40",
    description:
      "Understand the CIA triad, symmetric/asymmetric cryptography, hashing, threat actors, CVEs, IAM, and MITRE ATT&CK.",
    courses_count: 10,
    target_roles: ["Cybersecurity Analyst", "GRC Consultant", "Threat Intelligence Specialist"],
    icon: "Lock",
    course_slugs: [
      "cia-triad-core-principles",
      "defense-in-depth-strategy",
      "cryptography-symmetric",
      "cryptography-asymmetric",
      "cryptographic-hashing-integrity",
      "threat-actor-types-motivations",
      "vulnerability-management-cves",
      "identity-access-management-iam",
      "security-frameworks-nist-iso",
      "mitre-attack-framework",
    ],
  },
  {
    id: "path-5",
    slug: "reconnaissance-osint-footprinting",
    title: "Path 5: Reconnaissance, OSINT & Footprinting",
    course_range: "Courses 41–50",
    description:
      "Passive and active reconnaissance, OSINT domain tools, Nmap network scanning, web enumeration, and dark web monitoring.",
    courses_count: 10,
    target_roles: ["Threat Hunter", "Penetration Tester", "Intelligence Analyst"],
    icon: "Search",
    course_slugs: [
      "osint-web-search",
      "osint-domain-ip-research",
      "osint-social-media-human-recon",
      "network-footprinting-nmap-1",
      "network-footprinting-nmap-2",
      "web-app-footprinting-dir-enum",
      "subdomain-enumeration-techniques",
      "banner-grabbing-service-enum",
      "dark-web-credential-leak-monitoring",
      "threat-intel-vulnerability-scanning",
    ],
  },
  {
    id: "path-6",
    slug: "web-application-security",
    title: "Path 6: Web Application Security",
    course_range: "Courses 51–60",
    description:
      "Audit modern web architectures, Burp Suite interception, SQL injection, XSS, CSRF, IDOR, command injection, and OWASP Top 10.",
    courses_count: 10,
    target_roles: ["AppSec Engineer", "Web Penetration Tester", "Full-Stack Security Architect"],
    icon: "Globe",
    course_slugs: [
      "how-web-applications-work",
      "intercepting-proxies-burp-suite",
      "sql-injection-in-band",
      "sql-injection-advanced-blind",
      "xss-reflected-stored",
      "cross-site-request-forgery-csrf",
      "command-injection",
      "broken-auth-session-management",
      "idor-vulnerabilities",
      "owasp-top-10-comprehensive-audit",
    ],
  },
  {
    id: "path-7",
    slug: "system-hacking-privilege-escalation",
    title: "Path 7: System Hacking, Shells & Privilege Escalation",
    course_range: "Courses 61–70",
    description:
      "Controlled simulations of hash cracking, Metasploit, bind/reverse shells, Linux SUID/sudo abuse, Windows token manipulation, and AD attacks.",
    courses_count: 10,
    target_roles: [
      "Offensive Security Practitioner",
      "Red Team Operator",
      "Vulnerability Assessor",
    ],
    icon: "Flame",
    course_slugs: [
      "password-cracking-online-attacks",
      "password-cracking-offline-hashes",
      "metasploit-framework-essentials",
      "shells-payloads-bind-reverse",
      "linux-privesc-suid-misconfig",
      "linux-privesc-kernel-sudo",
      "windows-privesc-token-impersonation",
      "active-directory-enum-attacks",
      "evasion-techniques-av-bypassing",
      "post-exploitation-persistence",
    ],
  },
  {
    id: "path-8",
    slug: "defensive-security-soc-blue-team",
    title: "Path 8: Defensive Security, SOC & Blue Team",
    course_range: "Courses 71–80",
    description:
      "SOC workflows, log aggregation, Splunk/Elastic SIEM, Wireshark packet capture, Suricata IDS, EDR, YARA, and OS hardening.",
    courses_count: 10,
    target_roles: ["SOC Analyst Tier 2", "Blue Team Lead", "Detection Engineer"],
    icon: "ShieldCheck",
    course_slugs: [
      "intro-blue-team-operations",
      "log-analysis-management",
      "siem-essentials-splunk-elastic",
      "network-security-monitoring-wireshark",
      "ids-suricata-snort",
      "endpoint-detection-response-edr",
      "threat-hunting-foundations",
      "yara-rules-malware-detection",
      "email-security-phishing-analysis",
      "hardening-os-services",
    ],
  },
  {
    id: "path-9",
    slug: "digital-forensics-incident-response",
    title: "Path 9: Digital Forensics, Incident Response & Malware",
    course_range: "Courses 81–90",
    description:
      "DFIR methodologies, memory triage with Volatility, disk forensic imaging, Windows/Linux event artifacts, static/dynamic malware analysis, and Ghidra.",
    courses_count: 10,
    target_roles: ["Forensic Investigator", "Incident Response Lead", "Malware Reverse Engineer"],
    icon: "Binary",
    course_slugs: [
      "incident-response-lifecycles",
      "memory-forensics-volatility",
      "disk-forensics-filesystem-analysis",
      "windows-forensics-artifact-investigation",
      "linux-forensics-system-investigation",
      "static-malware-analysis-basics",
      "dynamic-malware-analysis-sandboxing",
      "reverse-engineering-ghidra-ida",
      "anti-forensics-investigation-obstacles",
      "digital-forensics-report-writing",
    ],
  },
  {
    id: "path-10",
    slug: "advanced-red-team-cloud-ai-quantum",
    title: "Path 10: Advanced Red Team, Cloud, AI & Quantum Security",
    course_range: "Courses 91–102",
    description:
      "Advanced red team operations, C2 frameworks, AWS/Azure/GCP cloud security, Kubernetes defense, prompt injection audits, and post-quantum migration.",
    courses_count: 12,
    target_roles: [
      "Principal Security Architect",
      "Cloud Security Leader",
      "AI & Quantum Defense Specialist",
    ],
    icon: "Cpu",
    course_slugs: [
      "red-team-campaign-planning",
      "command-and-control-frameworks",
      "cloud-security-foundations",
      "cloud-exploitation-misconfigs",
      "container-kubernetes-security",
      "api-security-testing-exploitation",
      "wireless-network-security",
      "physical-security-social-engineering",
      "ai-system-security-prompt-injection",
      "ai-ml-security-auditing",
      "post-quantum-cryptography-migration",
      "capstone-full-cyber-range",
    ],
  },
];

const RAW_COURSES_META = [
  // Path 1 (1-10)
  {
    num: 1,
    path: "path-1",
    slug: "digital-safety-hygiene",
    title: "Digital Safety & Hygiene",
    level: "BEGINNER" as const,
    duration: 45,
    lab: "linux-ssh-brute-force-investigation",
  },
  {
    num: 2,
    path: "path-1",
    slug: "social-engineering-phishing-defense",
    title: "Social Engineering & Phishing Defense",
    level: "BEGINNER" as const,
    duration: 40,
  },
  {
    num: 3,
    path: "path-1",
    slug: "financial-upi-fraud-prevention",
    title: "Financial & UPI Fraud Prevention",
    level: "BEGINNER" as const,
    duration: 35,
  },
  {
    num: 4,
    path: "path-1",
    slug: "mobile-smartphone-security",
    title: "Mobile & Smartphone Security",
    level: "BEGINNER" as const,
    duration: 40,
  },
  {
    num: 5,
    path: "path-1",
    slug: "wifi-public-network-safety",
    title: "Wi-Fi & Public Network Safety",
    level: "BEGINNER" as const,
    duration: 35,
  },
  {
    num: 6,
    path: "path-1",
    slug: "opsec-basics",
    title: "Operational Security (OPSEC) Basics",
    level: "BEGINNER" as const,
    duration: 45,
  },
  {
    num: 7,
    path: "path-1",
    slug: "hardware-device-security",
    title: "Introduction to Hardware & Device Security",
    level: "BEGINNER" as const,
    duration: 40,
  },
  {
    num: 8,
    path: "path-1",
    slug: "password-managers-mfa-setup",
    title: "Password Managers & MFA Setup",
    level: "BEGINNER" as const,
    duration: 30,
  },
  {
    num: 9,
    path: "path-1",
    slug: "social-media-account-recovery",
    title: "Social Media & Account Recovery Protection",
    level: "BEGINNER" as const,
    duration: 35,
  },
  {
    num: 10,
    path: "path-1",
    slug: "cyber-ethics-legal-frameworks",
    title: "Cyber Ethics & Legal Frameworks",
    level: "BEGINNER" as const,
    duration: 45,
  },

  // Path 2 (11-20)
  {
    num: 11,
    path: "path-2",
    slug: "networking-fundamentals-part-1",
    title: "Networking Fundamentals — Part 1",
    level: "FOUNDATION" as const,
    duration: 60,
    lab: "suricata-network-threat-hunting",
  },
  {
    num: 12,
    path: "path-2",
    slug: "networking-fundamentals-part-2",
    title: "Networking Fundamentals — Part 2",
    level: "FOUNDATION" as const,
    duration: 60,
    lab: "suricata-network-threat-hunting",
  },
  {
    num: 13,
    path: "path-2",
    slug: "transport-protocols-tcp-udp",
    title: "Transport Protocols — TCP vs. UDP",
    level: "FOUNDATION" as const,
    duration: 50,
  },
  {
    num: 14,
    path: "path-2",
    slug: "domain-name-system-dns",
    title: "The Domain Name System (DNS)",
    level: "FOUNDATION" as const,
    duration: 45,
  },
  {
    num: 15,
    path: "path-2",
    slug: "subnetting-ip-addressing",
    title: "Subnetting & IP Addressing",
    level: "FOUNDATION" as const,
    duration: 55,
  },
  {
    num: 16,
    path: "path-2",
    slug: "web-protocols-http-https",
    title: "Web Protocols — HTTP & HTTPS",
    level: "FOUNDATION" as const,
    duration: 50,
  },
  {
    num: 17,
    path: "path-2",
    slug: "network-ports-standard-services",
    title: "Network Ports & Standard Services",
    level: "FOUNDATION" as const,
    duration: 45,
  },
  {
    num: 18,
    path: "path-2",
    slug: "dhcp-protocol",
    title: "Dynamic Host Configuration Protocol (DHCP)",
    level: "FOUNDATION" as const,
    duration: 40,
  },
  {
    num: 19,
    path: "path-2",
    slug: "firewalls-network-traffic-control",
    title: "Firewalls & Network Traffic Control",
    level: "FOUNDATION" as const,
    duration: 55,
  },
  {
    num: 20,
    path: "path-2",
    slug: "network-address-translation-nat",
    title: "Network Address Translation (NAT)",
    level: "FOUNDATION" as const,
    duration: 45,
  },

  // Path 3 (21-30)
  {
    num: 21,
    path: "path-3",
    slug: "linux-fundamentals-part-1",
    title: "Linux Fundamentals — Part 1",
    level: "FOUNDATION" as const,
    duration: 60,
    lab: "linux-ssh-brute-force-investigation",
  },
  {
    num: 22,
    path: "path-3",
    slug: "linux-fundamentals-part-2",
    title: "Linux Fundamentals — Part 2",
    level: "FOUNDATION" as const,
    duration: 60,
    lab: "linux-ssh-brute-force-investigation",
  },
  {
    num: 23,
    path: "path-3",
    slug: "linux-file-permissions-ownership",
    title: "Linux File Permissions & Ownership",
    level: "FOUNDATION" as const,
    duration: 50,
  },
  {
    num: 24,
    path: "path-3",
    slug: "linux-sysadmin-users",
    title: "Linux System Administration & Users",
    level: "FOUNDATION" as const,
    duration: 55,
  },
  {
    num: 25,
    path: "path-3",
    slug: "linux-shell-scripting",
    title: "Linux Shell Scripting Basics",
    level: "INTERMEDIATE" as const,
    duration: 65,
  },
  {
    num: 26,
    path: "path-3",
    slug: "windows-architecture-admin",
    title: "Windows Architecture & Administration",
    level: "FOUNDATION" as const,
    duration: 60,
  },
  {
    num: 27,
    path: "path-3",
    slug: "windows-registry-services",
    title: "Windows Registry & Services",
    level: "INTERMEDIATE" as const,
    duration: 55,
  },
  {
    num: 28,
    path: "path-3",
    slug: "windows-cmd-powershell",
    title: "Windows Command Line & PowerShell Basics",
    level: "FOUNDATION" as const,
    duration: 60,
  },
  {
    num: 29,
    path: "path-3",
    slug: "active-directory-foundations",
    title: "Active Directory Foundations",
    level: "INTERMEDIATE" as const,
    duration: 70,
  },
  {
    num: 30,
    path: "path-3",
    slug: "virtualization-containerization",
    title: "System Virtualization & Containerization",
    level: "INTERMEDIATE" as const,
    duration: 60,
  },

  // Path 4 (31-40)
  {
    num: 31,
    path: "path-4",
    slug: "cia-triad-core-principles",
    title: "The CIA Triad & Core Principles",
    level: "BEGINNER" as const,
    duration: 40,
  },
  {
    num: 32,
    path: "path-4",
    slug: "defense-in-depth-strategy",
    title: "Defense-in-Depth Strategy",
    level: "FOUNDATION" as const,
    duration: 45,
  },
  {
    num: 33,
    path: "path-4",
    slug: "cryptography-symmetric",
    title: "Cryptography Foundations — Symmetric Encryption",
    level: "FOUNDATION" as const,
    duration: 55,
  },
  {
    num: 34,
    path: "path-4",
    slug: "cryptography-asymmetric",
    title: "Cryptography Foundations — Asymmetric Encryption",
    level: "FOUNDATION" as const,
    duration: 55,
  },
  {
    num: 35,
    path: "path-4",
    slug: "cryptographic-hashing-integrity",
    title: "Cryptographic Hashing & Integrity",
    level: "FOUNDATION" as const,
    duration: 45,
  },
  {
    num: 36,
    path: "path-4",
    slug: "threat-actor-types-motivations",
    title: "Threat Actor Types & Motivations",
    level: "BEGINNER" as const,
    duration: 40,
  },
  {
    num: 37,
    path: "path-4",
    slug: "vulnerability-management-cves",
    title: "Vulnerability Management & CVEs",
    level: "FOUNDATION" as const,
    duration: 50,
  },
  {
    num: 38,
    path: "path-4",
    slug: "identity-access-management-iam",
    title: "Identity & Access Management (IAM)",
    level: "FOUNDATION" as const,
    duration: 55,
  },
  {
    num: 39,
    path: "path-4",
    slug: "security-frameworks-nist-iso",
    title: "Security Control Frameworks (NIST & ISO 27001)",
    level: "INTERMEDIATE" as const,
    duration: 60,
  },
  {
    num: 40,
    path: "path-4",
    slug: "mitre-attack-framework",
    title: "The MITRE ATT&CK Framework",
    level: "INTERMEDIATE" as const,
    duration: 65,
    lab: "suricata-network-threat-hunting",
  },

  // Path 5 (41-50)
  {
    num: 41,
    path: "path-5",
    slug: "osint-web-search",
    title: "Open Source Intelligence (OSINT) — Web Search",
    level: "FOUNDATION" as const,
    duration: 50,
  },
  {
    num: 42,
    path: "path-5",
    slug: "osint-domain-ip-research",
    title: "OSINT — Domain & IP Research",
    level: "FOUNDATION" as const,
    duration: 55,
  },
  {
    num: 43,
    path: "path-5",
    slug: "osint-social-media-human-recon",
    title: "OSINT — Social Media & Human Reconnaissance",
    level: "FOUNDATION" as const,
    duration: 50,
  },
  {
    num: 44,
    path: "path-5",
    slug: "network-footprinting-nmap-1",
    title: "Network Footprinting with Nmap — Part 1",
    level: "INTERMEDIATE" as const,
    duration: 60,
  },
  {
    num: 45,
    path: "path-5",
    slug: "network-footprinting-nmap-2",
    title: "Network Footprinting with Nmap — Part 2",
    level: "INTERMEDIATE" as const,
    duration: 60,
  },
  {
    num: 46,
    path: "path-5",
    slug: "web-app-footprinting-dir-enum",
    title: "Web Application Footprinting & Directory Enumeration",
    level: "INTERMEDIATE" as const,
    duration: 55,
  },
  {
    num: 47,
    path: "path-5",
    slug: "subdomain-enumeration-techniques",
    title: "Subdomain Enumeration Techniques",
    level: "INTERMEDIATE" as const,
    duration: 50,
  },
  {
    num: 48,
    path: "path-5",
    slug: "banner-grabbing-service-enum",
    title: "Banner Grabbing & Service Enumeration",
    level: "INTERMEDIATE" as const,
    duration: 50,
  },
  {
    num: 49,
    path: "path-5",
    slug: "dark-web-credential-leak-monitoring",
    title: "Dark Web & Credential Leak Monitoring",
    level: "INTERMEDIATE" as const,
    duration: 55,
  },
  {
    num: 50,
    path: "path-5",
    slug: "threat-intel-vulnerability-scanning",
    title: "Threat Intelligence & Vulnerability Scanning",
    level: "INTERMEDIATE" as const,
    duration: 60,
  },

  // Path 6 (51-60)
  {
    num: 51,
    path: "path-6",
    slug: "how-web-applications-work",
    title: "How Web Applications Work",
    level: "FOUNDATION" as const,
    duration: 50,
  },
  {
    num: 52,
    path: "path-6",
    slug: "intercepting-proxies-burp-suite",
    title: "Intercepting Proxies — Burp Suite Basics",
    level: "INTERMEDIATE" as const,
    duration: 65,
  },
  {
    num: 53,
    path: "path-6",
    slug: "sql-injection-in-band",
    title: "SQL Injection — In-Band",
    level: "INTERMEDIATE" as const,
    duration: 70,
    lab: "sql-injection-fundamentals",
  },
  {
    num: 54,
    path: "path-6",
    slug: "sql-injection-advanced-blind",
    title: "SQL Injection — Advanced & Blind",
    level: "ADVANCED" as const,
    duration: 75,
  },
  {
    num: 55,
    path: "path-6",
    slug: "xss-reflected-stored",
    title: "Cross-Site Scripting — Reflected & Stored",
    level: "INTERMEDIATE" as const,
    duration: 65,
  },
  {
    num: 56,
    path: "path-6",
    slug: "cross-site-request-forgery-csrf",
    title: "Cross-Site Request Forgery",
    level: "INTERMEDIATE" as const,
    duration: 55,
  },
  {
    num: 57,
    path: "path-6",
    slug: "command-injection",
    title: "Command Injection",
    level: "ADVANCED" as const,
    duration: 65,
  },
  {
    num: 58,
    path: "path-6",
    slug: "broken-auth-session-management",
    title: "Broken Authentication & Session Management",
    level: "INTERMEDIATE" as const,
    duration: 60,
  },
  {
    num: 59,
    path: "path-6",
    slug: "idor-vulnerabilities",
    title: "Insecure Direct Object References",
    level: "INTERMEDIATE" as const,
    duration: 55,
  },
  {
    num: 60,
    path: "path-6",
    slug: "owasp-top-10-comprehensive-audit",
    title: "OWASP Top 10 Comprehensive Audit",
    level: "ADVANCED" as const,
    duration: 80,
  },

  // Path 7 (61-70)
  {
    num: 61,
    path: "path-7",
    slug: "password-cracking-online-attacks",
    title: "Password Cracking — Online Attacks",
    level: "INTERMEDIATE" as const,
    duration: 60,
  },
  {
    num: 62,
    path: "path-7",
    slug: "password-cracking-offline-hashes",
    title: "Password Cracking — Offline Hash Cracking",
    level: "INTERMEDIATE" as const,
    duration: 65,
  },
  {
    num: 63,
    path: "path-7",
    slug: "metasploit-framework-essentials",
    title: "Metasploit Framework Essentials",
    level: "ADVANCED" as const,
    duration: 75,
  },
  {
    num: 64,
    path: "path-7",
    slug: "shells-payloads-bind-reverse",
    title: "Shells & Payloads — Bind vs. Reverse Shells",
    level: "ADVANCED" as const,
    duration: 70,
  },
  {
    num: 65,
    path: "path-7",
    slug: "linux-privesc-suid-misconfig",
    title: "Linux Privilege Escalation — Misconfigurations & SUID",
    level: "ADVANCED" as const,
    duration: 75,
  },
  {
    num: 66,
    path: "path-7",
    slug: "linux-privesc-kernel-sudo",
    title: "Linux Privilege Escalation — Kernel & Sudo Abuse",
    level: "ADVANCED" as const,
    duration: 75,
  },
  {
    num: 67,
    path: "path-7",
    slug: "windows-privesc-token-impersonation",
    title: "Windows Privilege Escalation — Token Impersonation",
    level: "ADVANCED" as const,
    duration: 80,
  },
  {
    num: 68,
    path: "path-7",
    slug: "active-directory-enum-attacks",
    title: "Active Directory Enumeration & Attacks",
    level: "ADVANCED" as const,
    duration: 85,
  },
  {
    num: 69,
    path: "path-7",
    slug: "evasion-techniques-av-bypassing",
    title: "Evasion Techniques — Antivirus Bypassing",
    level: "ADVANCED" as const,
    duration: 80,
  },
  {
    num: 70,
    path: "path-7",
    slug: "post-exploitation-persistence",
    title: "Post-Exploitation & Persistence",
    level: "ADVANCED" as const,
    duration: 80,
  },

  // Path 8 (71-80)
  {
    num: 71,
    path: "path-8",
    slug: "intro-blue-team-operations",
    title: "Introduction to Blue Team Operations",
    level: "FOUNDATION" as const,
    duration: 55,
  },
  {
    num: 72,
    path: "path-8",
    slug: "log-analysis-management",
    title: "Log Analysis & Management",
    level: "INTERMEDIATE" as const,
    duration: 65,
    lab: "linux-ssh-brute-force-investigation",
  },
  {
    num: 73,
    path: "path-8",
    slug: "siem-essentials-splunk-elastic",
    title: "SIEM Essentials — Splunk & Elastic",
    level: "INTERMEDIATE" as const,
    duration: 70,
  },
  {
    num: 74,
    path: "path-8",
    slug: "network-security-monitoring-wireshark",
    title: "Network Security Monitoring — Wireshark",
    level: "INTERMEDIATE" as const,
    duration: 70,
    lab: "suricata-network-threat-hunting",
  },
  {
    num: 75,
    path: "path-8",
    slug: "ids-suricata-snort",
    title: "Intrusion Detection Systems — Suricata & Snort",
    level: "INTERMEDIATE" as const,
    duration: 70,
    lab: "suricata-network-threat-hunting",
  },
  {
    num: 76,
    path: "path-8",
    slug: "endpoint-detection-response-edr",
    title: "Endpoint Detection & Response",
    level: "INTERMEDIATE" as const,
    duration: 65,
  },
  {
    num: 77,
    path: "path-8",
    slug: "threat-hunting-foundations",
    title: "Threat Hunting Foundations",
    level: "ADVANCED" as const,
    duration: 75,
  },
  {
    num: 78,
    path: "path-8",
    slug: "yara-rules-malware-detection",
    title: "YARA Rules for Malware Detection",
    level: "INTERMEDIATE" as const,
    duration: 65,
  },
  {
    num: 79,
    path: "path-8",
    slug: "email-security-phishing-analysis",
    title: "Email Security & Phishing Analysis",
    level: "FOUNDATION" as const,
    duration: 55,
  },
  {
    num: 80,
    path: "path-8",
    slug: "hardening-os-services",
    title: "Hardening Operating Systems & Services",
    level: "INTERMEDIATE" as const,
    duration: 65,
  },

  // Path 9 (81-90)
  {
    num: 81,
    path: "path-9",
    slug: "incident-response-lifecycles",
    title: "Incident Response Lifecycles",
    level: "FOUNDATION" as const,
    duration: 60,
  },
  {
    num: 82,
    path: "path-9",
    slug: "memory-forensics-volatility",
    title: "Memory Forensics — Volatility Framework",
    level: "ADVANCED" as const,
    duration: 80,
  },
  {
    num: 83,
    path: "path-9",
    slug: "disk-forensics-filesystem-analysis",
    title: "Disk Forensics & File System Analysis",
    level: "ADVANCED" as const,
    duration: 75,
  },
  {
    num: 84,
    path: "path-9",
    slug: "windows-forensics-artifact-investigation",
    title: "Windows Forensics — Artifact Investigation",
    level: "ADVANCED" as const,
    duration: 80,
  },
  {
    num: 85,
    path: "path-9",
    slug: "linux-forensics-system-investigation",
    title: "Linux Forensics — System Investigation",
    level: "ADVANCED" as const,
    duration: 80,
    lab: "linux-ssh-brute-force-investigation",
  },
  {
    num: 86,
    path: "path-9",
    slug: "static-malware-analysis-basics",
    title: "Static Malware Analysis Basics",
    level: "ADVANCED" as const,
    duration: 75,
  },
  {
    num: 87,
    path: "path-9",
    slug: "dynamic-malware-analysis-sandboxing",
    title: "Dynamic Malware Analysis & Sandboxing",
    level: "ADVANCED" as const,
    duration: 80,
  },
  {
    num: 88,
    path: "path-9",
    slug: "reverse-engineering-ghidra-ida",
    title: "Reverse Engineering Basics — Ghidra / IDA",
    level: "ADVANCED" as const,
    duration: 90,
  },
  {
    num: 89,
    path: "path-9",
    slug: "anti-forensics-investigation-obstacles",
    title: "Anti-Forensics & Investigation Obstacles",
    level: "ADVANCED" as const,
    duration: 70,
  },
  {
    num: 90,
    path: "path-9",
    slug: "digital-forensics-report-writing",
    title: "Digital Forensics Report Writing",
    level: "INTERMEDIATE" as const,
    duration: 60,
  },

  // Path 10 (91-102)
  {
    num: 91,
    path: "path-10",
    slug: "red-team-campaign-planning",
    title: "Red Team Operations & Campaign Planning",
    level: "ADVANCED" as const,
    duration: 80,
  },
  {
    num: 92,
    path: "path-10",
    slug: "command-and-control-frameworks",
    title: "Command & Control Frameworks",
    level: "ADVANCED" as const,
    duration: 85,
  },
  {
    num: 93,
    path: "path-10",
    slug: "cloud-security-foundations",
    title: "Cloud Security Foundations — AWS / Azure / GCP",
    level: "FOUNDATION" as const,
    duration: 65,
  },
  {
    num: 94,
    path: "path-10",
    slug: "cloud-exploitation-misconfigs",
    title: "Cloud Exploitation & Misconfiguration Auditing",
    level: "ADVANCED" as const,
    duration: 80,
  },
  {
    num: 95,
    path: "path-10",
    slug: "container-kubernetes-security",
    title: "Container & Kubernetes Security",
    level: "ADVANCED" as const,
    duration: 80,
  },
  {
    num: 96,
    path: "path-10",
    slug: "api-security-testing-exploitation",
    title: "API Security Testing & Exploitation",
    level: "ADVANCED" as const,
    duration: 75,
  },
  {
    num: 97,
    path: "path-10",
    slug: "wireless-network-security",
    title: "Wireless Network Security",
    level: "INTERMEDIATE" as const,
    duration: 60,
  },
  {
    num: 98,
    path: "path-10",
    slug: "physical-security-social-engineering",
    title: "Physical Security & Social Engineering Operations",
    level: "INTERMEDIATE" as const,
    duration: 60,
  },
  {
    num: 99,
    path: "path-10",
    slug: "ai-system-security-prompt-injection",
    title: "AI System Security — Prompt Injection & Model Security",
    level: "ADVANCED" as const,
    duration: 80,
  },
  {
    num: 100,
    path: "path-10",
    slug: "ai-ml-security-auditing",
    title: "AI Security — Machine Learning Security Auditing",
    level: "ADVANCED" as const,
    duration: 85,
  },
  {
    num: 101,
    path: "path-10",
    slug: "post-quantum-cryptography-migration",
    title: "Post-Quantum Cryptography Migration",
    level: "ADVANCED" as const,
    duration: 85,
  },
  {
    num: 102,
    path: "path-10",
    slug: "capstone-full-cyber-range-assault-defense",
    title: "Capstone Project — Full IVVAB LABS Assault & Defense",
    level: "ADVANCED" as const,
    duration: 180,
    lab: "suricata-network-threat-hunting",
  },
];

export const ALL_102_COURSES: CurriculumCourse[] = RAW_COURSES_META.map((meta) => {
  const path = LEARNING_PATHS.find((p) => p.id === meta.path) || LEARNING_PATHS[0];

  return {
    id: `course-${meta.num}`,
    number: meta.num,
    path_id: meta.path,
    path_name: path.title,
    slug: meta.slug,
    title: `${meta.num}. ${meta.title}`,
    level: meta.level,
    tier: meta.num <= 20 ? "free" : "pro",
    estimated_minutes: meta.duration,
    summary: `Structured enterprise curriculum for ${meta.title}. Covers threat surface, protocol details, practical defensive analysis, and validation.`,
    description: `Complete standard course in ${meta.title}. Develops verifiable expertise through rigorous technical documentation, interactive diagrams, real dataset exercises, and IVVAB LABS verification.`,
    objectives: [
      `Analyze fundamental mechanics and threat models of ${meta.title}`,
      `Identify attack vectors, misconfigurations, and telemetry anomalies`,
      `Evaluate standard defensive controls and compliance frameworks`,
      `Execute hands-on analysis on authentic cyber datasets`,
      `Synthesize actionable remediation and security posture recommendations`,
    ],
    prerequisites:
      meta.num === 1 ? [] : [`Course ${Math.max(1, meta.num - 1)} or equivalent background`],
    badge_slug: `${meta.slug}-badge`,
    badge_name: `${meta.title} Specialist Badge`,
    skills: [meta.title, path.target_roles[0], "Defensive Security", "Telemetry Analysis"],
    companion_lab_slug: meta.lab,
    modules: [
      {
        id: `mod-${meta.num}-1`,
        slug: `${meta.slug}-foundations`,
        title: `01. Core Architecture & Fundamentals`,
        order_index: 1,
        duration_minutes: Math.round(meta.duration * 0.4),
        difficulty: meta.level === "ADVANCED" ? "ADVANCED" : "BEGINNER",
        tags: [meta.title, "Architecture", "Foundations"],
        summary: `Establish the theoretical framework, operational requirements, and core terminology of ${meta.title}.`,
        notes_md: `### 1. Concept Definition & Architecture
${meta.title} represents a core pillar of modern cybersecurity resilience.

### 2. Why Does This Exist?
In modern distributed networks and enterprise environments, organizations must maintain strict boundaries, continuous telemetry, and verifiable security controls to mitigate hostile threats.

### 3. Step-by-Step Technical Execution
1. **Discovery & Ingestion**: Baseline identification of entities and protocols.
2. **Analysis & Validation**: Continuous inspection of state, credentials, and telemetry streams.
3. **Control Enforcement**: Application of zero trust principles and defense-in-depth mitigations.

### 4. Authoritative Compliance
Ground your implementation in NIST SP 800-53, ISO/IEC 27001, and CISA Zero Trust Maturity Model guidelines.`,
        sources: [
          {
            title: "NIST Special Publication Guidelines",
            type: "NIST",
            url: "https://csrc.nist.gov/",
          },
          {
            title: "CISA Cybersecurity Advisories & Standards",
            type: "CISA",
            url: "https://www.cisa.gov/cybersecurity-best-practices",
          },
        ],
        quizzes: [
          {
            question: `What is the primary operational objective of ${meta.title}?`,
            options: [
              "Reduce organizational attack surface and guarantee integrity of assets",
              "Bypass standard host authentication protocols",
              "Disable network encryption entirely",
              "Store unhashed credentials in plain text",
            ],
            correct_option: 0,
            explanation:
              "The core objective of modern defensive measures is mitigating risk, reducing attack surfaces, and upholding the CIA triad.",
          },
        ],
        companion_lab_slug: meta.lab,
      },
      {
        id: `mod-${meta.num}-2`,
        slug: `${meta.slug}-practical-analysis`,
        title: `02. Practical Analysis, Telemetry & Defense`,
        order_index: 2,
        duration_minutes: Math.round(meta.duration * 0.6),
        difficulty: meta.level === "ADVANCED" ? "ADVANCED" : "INTERMEDIATE",
        tags: [meta.title, "Investigation", "Hands-on"],
        summary: `Analyze genuine telemetry, examine malicious patterns, and execute defensive countermeasures.`,
        notes_md: `### Practical Investigation Guide
When investigating incidents related to ${meta.title}, defenders must correlate multiple independent log sources.

### Key Investigation Checklist
- Verify timestamp synchronization (NTP).
- Extract Indicators of Compromise (IoCs) including SHA256 hashes, IP addresses, and domain names.
- Correlate events with MITRE ATT&CK tactics and techniques.
- Formulate an isolation and containment strategy before remediation.`,
        sources: [
          {
            title: "MITRE ATT&CK Framework Enterprise Matrix",
            type: "MITRE",
            url: "https://attack.mitre.org/",
          },
        ],
        quizzes: [
          {
            question:
              "Which phase of the incident response lifecycle follows initial identification and containment?",
            options: [
              "Eradication and Recovery",
              "Uncontrolled Lateral Movement",
              "Public Disclosure Without Validation",
              "Premature Log Deletion",
            ],
            correct_option: 0,
            explanation:
              "According to NIST SP 800-61 Rev 2, after Containment comes Eradication (removing malware/artifacts) and Recovery (restoring systems safely).",
          },
        ],
        companion_lab_slug: meta.lab,
      },
    ],
  };
});

// Helper lookup functions
export function getCourseBySlug(slug: string): CurriculumCourse | undefined {
  return ALL_102_COURSES.find((c) => c.slug === slug || c.id === slug);
}

export function getCoursesByPath(pathId: string): CurriculumCourse[] {
  return ALL_102_COURSES.filter((c) => c.path_id === pathId);
}

export function getLearningPathBySlug(slug: string): LearningPathDefinition | undefined {
  return LEARNING_PATHS.find((p) => p.slug === slug || p.id === slug);
}
