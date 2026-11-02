/**
 * NISQ VANGUARD — OFFICIAL COURSE IMAGE & STICKER MANIFEST
 * 
 * Provides verified local assets for all academy courses, maintaining 100% offline
 * support, zero layout shifts, high-contrast branding, and permissive license metadata.
 */

export interface CourseImageEntry {
  courseId: string;
  slug: string;
  title: string;
  imagePath: string;
  topic: string;
  category: string;
  altText: string;
  source: string;
  license: string;
}

export const DEFAULT_COURSE_IMAGE = "/courses/default-course.svg";

export const COURSE_IMAGE_MANIFEST: Record<string, CourseImageEntry> = {
  // 1. Core Available Courses
  "cybersecurity-foundations": {
    courseId: "c-cyber-found",
    slug: "cybersecurity-foundations",
    title: "Cybersecurity Foundations",
    imagePath: "/courses/cybersecurity-foundations.svg",
    topic: "CIA Triad, Kill Chain, Threat Principles, SOC Defense",
    category: "Core Foundations",
    altText: "Cybersecurity Foundations course emblem featuring CIA Triad shield and cyber grid",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "c-cyber-found": {
    courseId: "c-cyber-found",
    slug: "cybersecurity-foundations",
    title: "Cybersecurity Foundations",
    imagePath: "/courses/cybersecurity-foundations.svg",
    topic: "CIA Triad, Kill Chain, Threat Principles, SOC Defense",
    category: "Core Foundations",
    altText: "Cybersecurity Foundations course emblem featuring CIA Triad shield and cyber grid",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },

  "networking-fundamentals": {
    courseId: "c-net-fund",
    slug: "networking-fundamentals",
    title: "Networking Fundamentals",
    imagePath: "/courses/networking-fundamentals.svg",
    topic: "OSI 7 Layers, TCP/IP, Subnets, Packet Telemetry",
    category: "Network Defense",
    altText: "Networking Fundamentals badge featuring router switch nodes and TCP/IP telemetry",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "c-net-fund": {
    courseId: "c-net-fund",
    slug: "networking-fundamentals",
    title: "Networking Fundamentals",
    imagePath: "/courses/networking-fundamentals.svg",
    topic: "OSI 7 Layers, TCP/IP, Subnets, Packet Telemetry",
    category: "Network Defense",
    altText: "Networking Fundamentals badge featuring router switch nodes and TCP/IP telemetry",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },

  "linux-command-quest": {
    courseId: "c-lin-quest",
    slug: "linux-command-quest",
    title: "Linux Command Quest",
    imagePath: "/courses/linux-command-quest.svg",
    topic: "Terminal Mastery, Log Forensics, Process Warfare, chmod",
    category: "CLI & Systems",
    altText: "Linux Command Quest badge displaying an interactive terminal console with root prompt",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "c-lin-quest": {
    courseId: "c-lin-quest",
    slug: "linux-command-quest",
    title: "Linux Command Quest",
    imagePath: "/courses/linux-command-quest.svg",
    topic: "Terminal Mastery, Log Forensics, Process Warfare, chmod",
    category: "CLI & Systems",
    altText: "Linux Command Quest badge displaying an interactive terminal console with root prompt",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },

  "cyber-security-master-curriculum": {
    courseId: "c-cyber-master",
    slug: "cyber-security-master-curriculum",
    title: "Cyber Security Master Curriculum",
    imagePath: "/courses/cyber-security-master-curriculum.svg",
    topic: "52 Modules, Reconnaissance, Exploitation, Active Directory",
    category: "Mastery Track",
    altText: "Cyber Security Master Curriculum quad crest representing 52 comprehensive modules",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "c-cyber-master": {
    courseId: "c-cyber-master",
    slug: "cyber-security-master-curriculum",
    title: "Cyber Security Master Curriculum",
    imagePath: "/courses/cyber-security-master-curriculum.svg",
    topic: "52 Modules, Reconnaissance, Exploitation, Active Directory",
    category: "Mastery Track",
    altText: "Cyber Security Master Curriculum quad crest representing 52 comprehensive modules",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },

  // 2. Upcoming Roadmap Courses
  "ethical-hacking": {
    courseId: "locked-01",
    slug: "ethical-hacking",
    title: "Ethical Hacking",
    imagePath: "/courses/ethical-hacking.svg",
    topic: "Methodologies, Recon, Vulnerability Auditing, CEH Concepts",
    category: "Offensive Defense",
    altText: "Ethical Hacking target reticle and security crosshairs emblem",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "penetration-testing": {
    courseId: "locked-02",
    slug: "penetration-testing",
    title: "Penetration Testing",
    imagePath: "/courses/penetration-testing.svg",
    topic: "Payload Crafting, Pivoting, Metasploit, Exploit Chaining",
    category: "Offensive",
    altText: "Penetration Testing badge featuring penetration vector piercing defense barrier",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "web-security": {
    courseId: "locked-03",
    slug: "web-security",
    title: "Web Security",
    imagePath: "/courses/web-security.svg",
    topic: "SQL Injection, XSS, CSRF, SSRF, Request Tampering",
    category: "AppSec",
    altText: "Web Security emblem featuring hardened browser window with encrypted lock",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "owasp-security": {
    courseId: "locked-04",
    slug: "owasp-security",
    title: "OWASP Security",
    imagePath: "/courses/owasp-security.svg",
    topic: "OWASP Top 10, Broken Access, Injection, Cryptographic Failures",
    category: "AppSec",
    altText: "OWASP Top 10 security matrix badge",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "soc-analyst": {
    courseId: "locked-05",
    slug: "soc-analyst",
    title: "SOC Analyst",
    imagePath: "/courses/soc-analyst.svg",
    topic: "SIEM Operations, Alert Triage, Log Analysis, Blue Team",
    category: "Defensive Operations",
    altText: "SOC Analyst radar screen monitoring incoming threat blips",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "digital-forensics": {
    courseId: "locked-06",
    slug: "digital-forensics",
    title: "Digital Forensics",
    imagePath: "/courses/digital-forensics.svg",
    topic: "Evidence Carving, File Timelines, Hex Analysis, Chain of Custody",
    category: "DFIR",
    altText: "Digital Forensics magnifying scope examining silicon memory chip",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "threat-intelligence": {
    courseId: "locked-07",
    slug: "threat-intelligence",
    title: "Threat Intelligence",
    imagePath: "/courses/threat-intelligence.svg",
    topic: "CTI Analysis, MITRE ATT&CK, Threat Actors, IOC Feeds",
    category: "Intel & CTI",
    altText: "Threat Intelligence global telemetry map with MITRE ATT&CK nodes",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "malware-analysis": {
    courseId: "locked-08",
    slug: "malware-analysis",
    title: "Malware Analysis",
    imagePath: "/courses/malware-analysis.svg",
    topic: "Static & Dynamic Analysis, Reverse Engineering, Sandboxing",
    category: "Reverse Eng",
    altText: "Malware Analysis bio-cyber hazard containment grid with quarantined artifact",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "cloud-security": {
    courseId: "locked-09",
    slug: "cloud-security",
    title: "Cloud Security",
    imagePath: "/courses/cloud-security.svg",
    topic: "AWS, Azure, GCP, IAM Policies, Container & K8s Defense",
    category: "Cloud Infrastructure",
    altText: "Cloud Security infrastructure outline guarded by multi-cloud shield",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "active-directory-security": {
    courseId: "locked-10",
    slug: "active-directory-security",
    title: "Active Directory Security",
    imagePath: "/courses/active-directory-security.svg",
    topic: "Kerberos, Kerberoasting, BloodHound, Domain Controllers",
    category: "Enterprise Defense",
    altText: "Active Directory domain forest hierarchy tree with Kerberos ticket node",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "osint": {
    courseId: "locked-11",
    slug: "osint",
    title: "OSINT (Open Source Intelligence)",
    imagePath: "/courses/osint.svg",
    topic: "Open Source Intelligence, Dorking, Identity Recon, Metadata",
    category: "Reconnaissance",
    altText: "OSINT reconnaissance satellite radar dish with orbital geolocation grid",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "api-security": {
    courseId: "locked-12",
    slug: "api-security",
    title: "API Security",
    imagePath: "/courses/api-security.svg",
    topic: "REST & GraphQL Vulnerabilities, BOLA/BFLA, JWT, Rate Limiting",
    category: "AppSec",
    altText: "API Security interlocking payload nodes secured by cryptographic gateway",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "ai-security": {
    courseId: "locked-13",
    slug: "ai-security",
    title: "AI Security & LLM Defense",
    imagePath: "/courses/ai-security.svg",
    topic: "Prompt Injection, Adversarial ML, Data Poisoning, Guardrails",
    category: "AI Safety",
    altText: "AI Security neural network synapses protected by an AI firewall shield",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "incident-response": {
    courseId: "locked-14",
    slug: "incident-response",
    title: "Incident Response",
    imagePath: "/courses/incident-response.svg",
    topic: "CSIRT Playbooks, Containment, Eradication, Forensic Timeline",
    category: "DFIR & Ops",
    altText: "Incident Response emergency CSIRT hexagon with rapid containment ring",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "bug-bounty": {
    courseId: "locked-15",
    slug: "bug-bounty",
    title: "Bug Bounty Mastery",
    imagePath: "/courses/bug-bounty.svg",
    topic: "Vulnerability Hunting, Reporting, CVSS 10.0, Proof of Concept",
    category: "Bounty & Research",
    altText: "Bug Bounty Mastery gold target trophy with CVSS critical verification",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
};

/**
 * 2D CYBERSECURITY COURSE STICKERS MANIFEST
 * Verified local 2D stickers with transparent backgrounds for top-right corner badges.
 */
export interface CourseStickerEntry {
  identifier: string;
  name: string;
  stickerPath: string;
  altText: string;
}

export const COURSE_STICKER_MANIFEST: Record<string, CourseStickerEntry> = {
  // 1. Cyber Awareness
  "cyber-awareness": {
    identifier: "cyber-awareness",
    name: "Cyber Awareness",
    stickerPath: "/images/course-stickers/cyber-awareness.png",
    altText: "Cyber Awareness 2D cybersecurity sticker emblem",
  },
  "absolute-beginner-cyber-awareness": {
    identifier: "absolute-beginner-cyber-awareness",
    name: "Cyber Awareness",
    stickerPath: "/images/course-stickers/cyber-awareness.png",
    altText: "Cyber Awareness 2D cybersecurity sticker emblem",
  },

  // 2. Networking Fundamentals
  "networking-fundamentals": {
    identifier: "networking-fundamentals",
    name: "Networking Fundamentals",
    stickerPath: "/images/course-stickers/networking-fundamentals.png",
    altText: "Networking Fundamentals 2D cybersecurity sticker emblem",
  },
  "c-net-fund": {
    identifier: "c-net-fund",
    name: "Networking Fundamentals",
    stickerPath: "/images/course-stickers/networking-fundamentals.png",
    altText: "Networking Fundamentals 2D cybersecurity sticker emblem",
  },
  "basics-in-networking": {
    identifier: "basics-in-networking",
    name: "Networking Fundamentals",
    stickerPath: "/images/course-stickers/networking-fundamentals.png",
    altText: "Networking Fundamentals 2D cybersecurity sticker emblem",
  },
  "networking-fundamentals-part-1": {
    identifier: "networking-fundamentals-part-1",
    name: "Networking Fundamentals",
    stickerPath: "/images/course-stickers/networking-fundamentals.png",
    altText: "Networking Fundamentals 2D cybersecurity sticker emblem",
  },
  "networking-fundamentals-part-2": {
    identifier: "networking-fundamentals-part-2",
    name: "Networking Fundamentals",
    stickerPath: "/images/course-stickers/networking-fundamentals.png",
    altText: "Networking Fundamentals 2D cybersecurity sticker emblem",
  },

  // 3. Social Engineering & Phishing
  "social-engineering-phishing": {
    identifier: "social-engineering-phishing",
    name: "Social Engineering & Phishing",
    stickerPath: "/images/course-stickers/social-engineering-phishing.png",
    altText: "Social Engineering and Phishing Defense 2D cybersecurity sticker emblem",
  },
  "social-engineering-phishing-defense": {
    identifier: "social-engineering-phishing-defense",
    name: "Social Engineering & Phishing Defense",
    stickerPath: "/images/course-stickers/social-engineering-phishing.png",
    altText: "Social Engineering and Phishing Defense 2D cybersecurity sticker emblem",
  },
  "social-engineering-human-hacking": {
    identifier: "social-engineering-human-hacking",
    name: "Social Engineering & Phishing",
    stickerPath: "/images/course-stickers/social-engineering-phishing.png",
    altText: "Social Engineering and Phishing Defense 2D cybersecurity sticker emblem",
  },

  // 4. Cybersecurity Foundations
  "cybersecurity-foundations": {
    identifier: "cybersecurity-foundations",
    name: "Cybersecurity Foundations",
    stickerPath: "/images/course-stickers/cybersecurity-foundations.png",
    altText: "Cybersecurity Foundations 2D cybersecurity sticker emblem",
  },
  "c-cyber-found": {
    identifier: "c-cyber-found",
    name: "Cybersecurity Foundations",
    stickerPath: "/images/course-stickers/cybersecurity-foundations.png",
    altText: "Cybersecurity Foundations 2D cybersecurity sticker emblem",
  },

  // 5. Digital Safety & Hygiene
  "digital-safety-hygiene": {
    identifier: "digital-safety-hygiene",
    name: "Digital Safety & Hygiene",
    stickerPath: "/images/course-stickers/digital-safety-hygiene.png",
    altText: "Digital Safety & Hygiene 2D cybersecurity sticker emblem",
  },
  "digital-safety": {
    identifier: "digital-safety",
    name: "Digital Safety & Hygiene",
    stickerPath: "/images/course-stickers/digital-safety-hygiene.png",
    altText: "Digital Safety & Hygiene 2D cybersecurity sticker emblem",
  },
};

/**
 * Resolves verified 2D course sticker if one exists for the course.
 * Returns null if the course has no matching sticker (Requirement 8).
 */
export function getCourseSticker(
  identifier?: string | null,
  title?: string | null,
): CourseStickerEntry | null {
  const cleanId = (identifier || "").trim().toLowerCase();
  if (cleanId && COURSE_STICKER_MANIFEST[cleanId]) {
    return COURSE_STICKER_MANIFEST[cleanId];
  }

  const cleanTitle = (title || "").toLowerCase();
  if (cleanTitle) {
    if (cleanTitle.includes("cyber awareness") || cleanTitle.includes("cyber-awareness")) {
      return COURSE_STICKER_MANIFEST["cyber-awareness"];
    }
    if (
      cleanTitle.includes("networking fundamental") ||
      cleanTitle.includes("basics of networking") ||
      cleanTitle.includes("basics in networking")
    ) {
      return COURSE_STICKER_MANIFEST["networking-fundamentals"];
    }
    if (cleanTitle.includes("social engineering") || cleanTitle.includes("phishing")) {
      return COURSE_STICKER_MANIFEST["social-engineering-phishing"];
    }
    if (
      cleanTitle.includes("cybersecurity foundation") ||
      cleanTitle.includes("cyber security foundation")
    ) {
      return COURSE_STICKER_MANIFEST["cybersecurity-foundations"];
    }
    if (cleanTitle.includes("digital safety") || cleanTitle.includes("safety & hygiene")) {
      return COURSE_STICKER_MANIFEST["digital-safety-hygiene"];
    }
  }

  // Check fuzzy / partial matches in cleanId
  if (cleanId) {
    if (cleanId.includes("cyber-awareness") || cleanId.includes("cyberawareness")) {
      return COURSE_STICKER_MANIFEST["cyber-awareness"];
    }
    if (cleanId.includes("networking-fundamental")) {
      return COURSE_STICKER_MANIFEST["networking-fundamentals"];
    }
    if (cleanId.includes("social-engineering") || cleanId.includes("phishing")) {
      return COURSE_STICKER_MANIFEST["social-engineering-phishing"];
    }
    if (cleanId.includes("cybersecurity-foundation")) {
      return COURSE_STICKER_MANIFEST["cybersecurity-foundations"];
    }
    if (cleanId.includes("digital-safety")) {
      return COURSE_STICKER_MANIFEST["digital-safety-hygiene"];
    }
  }

  return null;
}

/**
 * Get verified local image path for a course slug or ID with fallback
 */
export function getCourseImage(identifier?: string | null): string {
  if (!identifier) return DEFAULT_COURSE_IMAGE;
  const cleaned = identifier.trim().toLowerCase();
  const entry = COURSE_IMAGE_MANIFEST[cleaned];
  return entry ? entry.imagePath : DEFAULT_COURSE_IMAGE;
}

/**
 * Get image manifest entry for course metadata
 */
export function getCourseImageDetails(identifier?: string | null): CourseImageEntry {
  if (!identifier) {
    return {
      courseId: "default",
      slug: "default",
      title: "NISQ Vanguard Course",
      imagePath: DEFAULT_COURSE_IMAGE,
      topic: "Practical Cyber Defense and Intelligence",
      category: "Cybersecurity",
      altText: "NISQ Vanguard official cyber defense course banner",
      source: "NISQ Vanguard Academy",
      license: "Educational",
    };
  }

  const cleaned = identifier.trim().toLowerCase();
  return (
    COURSE_IMAGE_MANIFEST[cleaned] || {
      courseId: identifier,
      slug: identifier,
      title: "NISQ Vanguard Course",
      imagePath: DEFAULT_COURSE_IMAGE,
      topic: "Practical Cyber Defense and Intelligence",
      category: "Cybersecurity",
      altText: "NISQ Vanguard official cyber defense course banner",
      source: "NISQ Vanguard Academy",
      license: "Educational",
    }
  );
}
