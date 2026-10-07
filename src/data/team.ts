import founderImg from "@/assets/founder.jpeg";

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
  skills?: string[];
  socialLinks?: {
    platform: string;
    url: string;
  }[];
};

export const teamData: TeamMember[] = [
  {
    name: "Ashok Vallabuni",
    role: "Founder · Chief Architect",
    bio: "Founder of NISQ Vanguard, focused on cybersecurity, AI security, security engineering, and practical cybersecurity education. His work explores the intersection of modern cyber defence and emerging technologies including LLMs, AI agents, and intelligent infrastructure.",
    imageUrl: founderImg,
    skills: [
      "Cyber Strategy",
      "AI · Security",
      "Cyber Defence Architecture",
      "Security Education",
      "College Outreach",
      "NISQ Vanguard Academy"
    ],
    socialLinks: [] // Explicitly leaving empty as there are no social links in the current code
  },
  {
    name: "Varun Gajula",
    role: "Co-Founder",
    bio: "Varun contributes to the development and growth of NISQ Vanguard, supporting the company's technical and operational direction as it expands its cybersecurity initiatives.",
    // No image URL provided in existing data
    socialLinks: []
  },
  {
    name: "Sannith Reddy",
    role: "CPO · Product Marketer",
    bio: "Sannith focuses on product direction, positioning, communication, and translating NISQ Vanguard's cybersecurity capabilities into useful experiences for learners, organizations, and the wider community.",
    // No image URL provided in existing data
    socialLinks: []
  }
];

export const founderPhilosophy = [
  {
    heading: "Proactive Defence",
    body: "Security posture is determined by the choices made before an incident — not during. NISQ Vanguard is built on the principle that proactive defence through education is the most impactful form of protection.",
  },
  {
    heading: "Youth Education",
    body: "The next generation of cyber defenders must be empowered early. By embedding cybersecurity literacy into colleges and youth programs, we invest in India's long-term digital resilience.",
  },
  {
    heading: "Accessible Cyber Hygiene",
    body: "Advanced security should not be reserved for large enterprises. Every individual, every family, every small organisation deserves access to simple, actionable security guidance.",
  },
  {
    heading: "AI Safety in Cyber",
    body: "As AI systems become embedded in critical infrastructure, the attack surface expands. NISQ Vanguard addresses this by training analysts to understand AI-enabled threats and defences.",
  },
];

export const founderArchitecturalContributions = [
  {
    icon: "Shield", // We will map these string names to Lucide icons in the component
    title: "IVVAB Labs Engine",
    body: "Designed and architected the IVVAB Labs engine — the technical core that powers NISQ Vanguard's IVVAB LABS, Academy Labs, and containerised training environments.",
  },
  {
    icon: "GraduationCap",
    title: "Canonical Curriculum Design",
    body: "Authored the canonical cybersecurity learning pathways used in the NISQ Academy — from Networking Fundamentals and Linux Command Quest to the complete Cybersecurity Foundations course.",
  },
  {
    icon: "Terminal",
    title: "IVVAB LABS Architecture",
    body: "Designed the isolated network environments, scenario-based lab infrastructure, and verification systems that power hands-on practitioner training at NISQ Vanguard.",
  },
  {
    icon: "Eye",
    title: "Threat Intelligence Framework",
    body: "Established the threat intelligence methodology and data pipeline that ingests real incident telemetry into Academy modules and IVVAB LABS scenarios.",
  },
  {
    icon: "Building2",
    title: "College Outreach Infrastructure",
    body: "Built the partnerships and program frameworks that deliver NISQ Vanguard cybersecurity awareness to colleges across India, including guest sessions and campus CTF events.",
  },
  {
    icon: "Globe",
    title: "AI · Security Integration",
    body: "Pioneered the integration of AI-assisted threat analysis and guidance into the NISQ Vanguard platform — making advanced defensive analysis accessible to learners at every level.",
  },
];
