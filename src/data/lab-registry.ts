export type LabStatus = "Available" | "In-Development";

export interface LabDefinition {
  id: string;
  slug: string;
  title: string;
  status: LabStatus;
  dataset: string;
  summary: string;
  difficulty: "beginner" | "easy" | "medium" | "hard" | "insane" | string;
  estimated_minutes: number;
  skills: string[];
  mitre_attack_ids: string[];
}

export interface CourseLabMapping {
  courseId: string;
  labs: string[]; // Array of lab IDs
}

export const LAB_DEFINITIONS: LabDefinition[] = [
  {
    id: "lab-ssh-bruteforce",
    slug: "linux-ssh-brute-force-investigation",
    title: "Linux SSH Brute Force Investigation",
    status: "Available",
    dataset: "syslog, auth.log",
    summary:
      "Analyze live syslog and auth.log streams in an isolated Linux environment to detect automated credential stuffing, identify attacker IP ranges, and construct automated fail2ban blocking rules.",
    difficulty: "easy",
    estimated_minutes: 30,
    skills: ["Log Analysis", "Linux CLI", "Fail2Ban"],
    mitre_attack_ids: ["T1110", "T1078"],
  },
  {
    id: "lab-suricata-nids",
    slug: "suricata-network-threat-hunting",
    title: "Suricata Network Threat Hunting & PCAP Analysis",
    status: "Available",
    dataset: "pcap, suricata.yaml, fast.log",
    summary:
      "Deploy and configure a Suricata Network Intrusion Detection System. Ingest a captured PCAP containing malicious C2 traffic and write custom rules to detect beaconing behavior.",
    difficulty: "medium",
    estimated_minutes: 45,
    skills: ["Packet Analysis", "Suricata", "Threat Hunting"],
    mitre_attack_ids: ["T1071", "T1571"],
  },
  {
    id: "lab-sqli-investigation",
    slug: "sql-injection-forensics-and-mitigation",
    title: "SQL Injection Incident Forensics & Hardening",
    status: "Available",
    dataset: "nginx access.log, mysql general_log",
    summary:
      "Perform post-incident forensic analysis on a compromised web server. Trace SQL injection payloads in access logs, determine data exfiltration, and implement parameterized queries.",
    difficulty: "medium",
    estimated_minutes: 45,
    skills: ["Web App Security", "Forensics", "SQL"],
    mitre_attack_ids: ["T1190", "T1566"],
  },
  {
    id: "lab-memory-forensics",
    slug: "volatility-memory-dump-analysis",
    title: "Memory Forensics with Volatility 3",
    status: "Available",
    dataset: "Windows memory dump (.vmem)",
    summary:
      "Use Volatility 3 to analyze a provided Windows memory dump. Identify hidden processes, extract injected DLLs, and map out the attacker's in-memory footprint.",
    difficulty: "hard",
    estimated_minutes: 60,
    skills: ["Memory Forensics", "Volatility", "Malware Analysis"],
    mitre_attack_ids: ["T1055", "T1014"],
  },
];

export const COURSE_LAB_MAPPINGS: CourseLabMapping[] = [
  {
    courseId: "c-lin-quest",
    labs: ["lab-ssh-bruteforce"],
  },
  {
    courseId: "c-net-fund",
    labs: ["lab-suricata-nids"],
  },
  {
    courseId: "c-cyber-found",
    labs: ["lab-sqli-investigation"],
  },
  {
    courseId: "c-cyber-master",
    labs: ["lab-memory-forensics"],
  },
];

export function getLabsForCourse(courseId: string): LabDefinition[] {
  const mapping = COURSE_LAB_MAPPINGS.find((m) => m.courseId === courseId);
  if (!mapping) return [];

  return mapping.labs
    .map((labId) => LAB_DEFINITIONS.find((l) => l.id === labId))
    .filter((lab): lab is LabDefinition => lab !== undefined);
}

export function getAllMappedLabs(): LabDefinition[] {
  return LAB_DEFINITIONS; // Or dynamically extract from mappings if preferred
}
