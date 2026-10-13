import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, "../public/courses");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Helper to create high-tech SVG stickers
function createSvgSticker({
  title,
  topic,
  category,
  primaryColor = "#0A7CFF",
  secondaryColor = "#00B8FF",
  accentColor = "#38BDF8",
  badgeText = "DEFENSE TRACK",
  illustrationSvg = "",
}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050B14" />
      <stop offset="60%" stop-color="#081522" />
      <stop offset="100%" stop-color="#0C1F33" />
    </linearGradient>

    <!-- Theme Gradient -->
    <linearGradient id="themeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="${secondaryColor}" />
    </linearGradient>

    <!-- Glow Filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Subtle Grid Pattern -->
    <pattern id="cyberGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#16283A" stroke-width="0.8" stroke-opacity="0.4" />
      <circle cx="0" cy="0" r="1.5" fill="${primaryColor}" fill-opacity="0.25" />
    </pattern>
  </defs>

  <!-- Background Base -->
  <rect width="800" height="450" fill="url(#bgGrad)" />
  <rect width="800" height="450" fill="url(#cyberGrid)" />

  <!-- Ambient Light Cone -->
  <circle cx="400" cy="225" r="280" fill="${primaryColor}" fill-opacity="0.08" filter="url(#glow)" />
  <circle cx="400" cy="210" r="140" fill="${secondaryColor}" fill-opacity="0.06" filter="url(#glow)" />

  <!-- Outer Cyber Tech Border -->
  <rect x="16" y="16" width="768" height="418" rx="16" fill="none" stroke="#16283A" stroke-width="1.5" />
  <!-- Corner Tech Accents -->
  <path d="M 16 48 L 16 16 L 48 16" fill="none" stroke="${primaryColor}" stroke-width="3" />
  <path d="M 784 48 L 784 16 L 752 16" fill="none" stroke="${primaryColor}" stroke-width="3" />
  <path d="M 16 402 L 16 434 L 48 434" fill="none" stroke="${primaryColor}" stroke-width="3" />
  <path d="M 784 402 L 784 434 L 752 434" fill="none" stroke="${primaryColor}" stroke-width="3" />

  <!-- Top NISQ Vanguard Brand Header -->
  <g transform="translate(36, 40)">
    <!-- Shield / Wolf Badge -->
    <path d="M 0 0 L 16 -6 L 32 0 L 32 16 C 32 28 16 38 16 38 C 16 38 0 28 0 16 Z" fill="${primaryColor}" fill-opacity="0.2" stroke="${primaryColor}" stroke-width="1.5" />
    <path d="M 10 12 L 16 6 L 22 12 L 19 22 L 16 26 L 13 22 Z" fill="${accentColor}" />
    <!-- Brand Typography -->
    <text x="44" y="16" font-family="'Orbitron', 'Inter', monospace, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF" letter-spacing="2">NISQ VANGUARD</text>
    <text x="44" y="30" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="600" fill="${secondaryColor}" letter-spacing="1.5">ACADEMY // ${category.toUpperCase()}</text>
  </g>

  <!-- Track Badge (Top Right) -->
  <g transform="translate(620, 36)">
    <rect width="144" height="28" rx="6" fill="#081522" stroke="${primaryColor}" stroke-width="1.2" stroke-opacity="0.8" />
    <circle cx="16" cy="14" r="4" fill="${secondaryColor}">
      <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
    </circle>
    <text x="28" y="18" font-family="'JetBrains Mono', monospace" font-size="9.5" font-weight="700" fill="#FFFFFF" letter-spacing="1">${badgeText}</text>
  </g>

  <!-- Central Topic Illustration Area -->
  <g transform="translate(400, 215)">
    ${illustrationSvg}
  </g>

  <!-- Bottom Title Overlay Bar -->
  <g transform="translate(36, 385)">
    <!-- Glow line -->
    <line x1="0" y1="-18" x2="728" y2="-18" stroke="#16283A" stroke-width="1" />
    <line x1="0" y1="-18" x2="160" y2="-18" stroke="url(#themeGrad)" stroke-width="2" />
    
    <!-- Title Text -->
    <text x="0" y="6" font-family="'Orbitron', 'Inter', sans-serif" font-size="20" font-weight="800" fill="#FFFFFF" letter-spacing="0.5">${title}</text>
    <text x="0" y="24" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="500" fill="#94A3B8" letter-spacing="0.5">${topic}</text>
  </g>
</svg>`;
}

const COURSES = [
  {
    slug: "cybersecurity-foundations",
    title: "Cybersecurity Foundations",
    topic: "CIA Triad · Kill Chain · Threat Principles · SOC Defense",
    category: "Core Foundations",
    primaryColor: "#0A7CFF",
    secondaryColor: "#00B8FF",
    accentColor: "#38BDF8",
    badgeText: "FOUNDATION",
    illustration: `
      <!-- Shield Triad -->
      <path d="M -70 -70 L 0 -110 L 70 -70 L 70 30 C 70 85 0 120 0 120 C 0 120 -70 85 -70 30 Z" fill="#0A7CFF" fill-opacity="0.12" stroke="#0A7CFF" stroke-width="3" />
      <path d="M -50 -50 L 0 -80 L 50 -50 L 50 20 C 50 65 0 95 0 95 C 0 95 -50 65 -50 20 Z" fill="none" stroke="#00B8FF" stroke-width="1.8" stroke-dasharray="6,4" />
      <!-- Triad Core Nodes -->
      <circle cx="0" cy="-35" r="18" fill="#081522" stroke="#38BDF8" stroke-width="2.5" />
      <text x="0" y="-30" font-family="monospace" font-size="14" font-weight="bold" fill="#38BDF8" text-anchor="middle">C</text>
      <circle cx="-32" cy="25" r="18" fill="#081522" stroke="#38BDF8" stroke-width="2.5" />
      <text x="-32" y="30" font-family="monospace" font-size="14" font-weight="bold" fill="#38BDF8" text-anchor="middle">I</text>
      <circle cx="32" cy="25" r="18" fill="#081522" stroke="#38BDF8" stroke-width="2.5" />
      <text x="32" y="30" font-family="monospace" font-size="14" font-weight="bold" fill="#38BDF8" text-anchor="middle">A</text>
      <!-- Connecting Energy Lines -->
      <line x1="0" y1="-17" x2="-22" y2="12" stroke="#00B8FF" stroke-width="2" />
      <line x1="0" y1="-17" x2="22" y2="12" stroke="#00B8FF" stroke-width="2" />
      <line x1="-14" y1="25" x2="14" y2="25" stroke="#00B8FF" stroke-width="2" />
      <circle cx="0" cy="5" r="6" fill="#FFFFFF" />
    `,
  },
  {
    slug: "networking-fundamentals",
    title: "Networking Fundamentals",
    topic: "OSI 7 Layers · TCP/IP · Subnets · Packet Telemetry",
    category: "Network Defense",
    primaryColor: "#00B8FF",
    secondaryColor: "#38BDF8",
    accentColor: "#10B981",
    badgeText: "NETWORKING",
    illustration: `
      <!-- Interconnected Network Topology -->
      <circle cx="0" cy="0" r="85" fill="none" stroke="#16283A" stroke-width="2" stroke-dasharray="4,4" />
      <!-- Central Switch / Router Node -->
      <rect x="-35" y="-35" width="70" height="70" rx="14" fill="#081522" stroke="#00B8FF" stroke-width="3" />
      <!-- Two crossing directional arrows -->
      <path d="M -18 -8 L 18 -8 M 10 -16 L 18 -8 L 10 0" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M 18 8 L -18 8 M -10 0 L -18 8 L -10 16" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <!-- Outer Satellite Nodes -->
      <circle cx="-85" cy="-45" r="16" fill="#081522" stroke="#00B8FF" stroke-width="2" />
      <text x="-85" y="-41" font-family="monospace" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="middle">IP1</text>
      <circle cx="85" cy="-45" r="16" fill="#081522" stroke="#00B8FF" stroke-width="2" />
      <text x="85" y="-41" font-family="monospace" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="middle">IP2</text>
      <circle cx="-85" cy="45" r="16" fill="#081522" stroke="#38BDF8" stroke-width="2" />
      <text x="-85" y="49" font-family="monospace" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="middle">TCP</text>
      <circle cx="85" cy="45" r="16" fill="#081522" stroke="#10B981" stroke-width="2" />
      <text x="85" y="49" font-family="monospace" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="middle">DNS</text>
      <!-- Connection Cables -->
      <line x1="-35" y1="-20" x2="-70" y2="-38" stroke="#00B8FF" stroke-width="2" stroke-dasharray="3,3" />
      <line x1="35" y1="-20" x2="70" y2="-38" stroke="#00B8FF" stroke-width="2" stroke-dasharray="3,3" />
      <line x1="-35" y1="20" x2="-70" y2="38" stroke="#38BDF8" stroke-width="2" />
      <line x1="35" y1="20" x2="70" y2="38" stroke="#10B981" stroke-width="2" />
    `,
  },
  {
    slug: "linux-command-quest",
    title: "Linux Command Quest",
    topic: "Terminal Mastery · Log Forensics · Process Warfare · chmod",
    category: "CLI & Systems",
    primaryColor: "#10B981",
    secondaryColor: "#00B8FF",
    accentColor: "#F59E0B",
    badgeText: "LINUX CLI",
    illustration: `
      <!-- Terminal Window Frame -->
      <rect x="-100" y="-65" width="200" height="130" rx="12" fill="#050B14" stroke="#10B981" stroke-width="2.5" />
      <rect x="-100" y="-65" width="200" height="26" rx="12" fill="#081522" stroke="#16283A" stroke-width="1" />
      <!-- Window Buttons -->
      <circle cx="-82" cy="-52" r="4.5" fill="#EF4444" />
      <circle cx="-68" cy="-52" r="4.5" fill="#F59E0B" />
      <circle cx="-54" cy="-52" r="4.5" fill="#10B981" />
      <text x="10" y="-48" font-family="monospace" font-size="10" font-weight="bold" fill="#94A3B8" text-anchor="middle">root@nisq:~#</text>
      <!-- Terminal Content Lines -->
      <text x="-85" y="-18" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600" fill="#10B981">$ whoami</text>
      <text x="-85" y="0" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="500" fill="#FFFFFF">cyber_operative</text>
      <text x="-85" y="18" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600" fill="#10B981">$ chmod 700 /vault/*</text>
      <text x="-85" y="38" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600" fill="#00B8FF">$ ./infiltrate --root _</text>
      <!-- Blinking Cursor -->
      <rect x="76" y="28" width="8" height="13" fill="#10B981">
        <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
      </rect>
    `,
  },
  {
    slug: "cyber-security-master-curriculum",
    title: "Master Cyber Curriculum",
    topic: "52 Modules · Reconnaissance · Exploitation · Active Directory",
    category: "Mastery Track",
    primaryColor: "#6366F1",
    secondaryColor: "#0A7CFF",
    accentColor: "#EC4899",
    badgeText: "52-WEEK MASTER",
    illustration: `
      <!-- Master Quad Crest -->
      <polygon points="0,-85 75,-42 75,42 0,85 -75,42 -75,-42" fill="#081522" stroke="#6366F1" stroke-width="3" />
      <polygon points="0,-65 58,-32 58,32 0,65 -58,32 -58,-32" fill="none" stroke="#00B8FF" stroke-width="1.5" stroke-dasharray="5,3" />
      <!-- Quadrants -->
      <line x1="0" y1="-65" x2="0" y2="65" stroke="#16283A" stroke-width="2" />
      <line x1="-58" y1="0" x2="58" y2="0" stroke="#16283A" stroke-width="2" />
      <!-- Symbols -->
      <text x="-28" y="-22" font-family="monospace" font-size="16" font-weight="bold" fill="#38BDF8" text-anchor="middle">OSINT</text>
      <text x="28" y="-22" font-family="monospace" font-size="16" font-weight="bold" fill="#EC4899" text-anchor="middle">EXPLOIT</text>
      <text x="-28" y="38" font-family="monospace" font-size="16" font-weight="bold" fill="#10B981" text-anchor="middle">WEBSEC</text>
      <text x="28" y="38" font-family="monospace" font-size="16" font-weight="bold" fill="#6366F1" text-anchor="middle">AD/SOC</text>
      <!-- Center Star Gem -->
      <circle cx="0" cy="0" r="14" fill="#050B14" stroke="#FFFFFF" stroke-width="2.5" />
      <circle cx="0" cy="0" r="5" fill="#6366F1" />
    `,
  },
  {
    slug: "ethical-hacking",
    title: "Ethical Hacking",
    topic: "Methodologies · Recon · Vulnerability Auditing · CEH Concepts",
    category: "Offensive Defense",
    primaryColor: "#EC4899",
    secondaryColor: "#8B5CF6",
    accentColor: "#F43F5E",
    badgeText: "OFFENSIVE",
    illustration: `
      <!-- Target Reticle & White Hat Silhouette -->
      <circle cx="0" cy="0" r="75" fill="none" stroke="#EC4899" stroke-width="2" stroke-dasharray="8,6" />
      <circle cx="0" cy="0" r="45" fill="#081522" stroke="#8B5CF6" stroke-width="2.5" />
      <line x1="-85" y1="0" x2="85" y2="0" stroke="#EC4899" stroke-width="2" />
      <line x1="0" y1="-85" x2="0" y2="85" stroke="#EC4899" stroke-width="2" />
      <!-- Crosshair Tick Marks -->
      <circle cx="0" cy="0" r="20" fill="none" stroke="#FFFFFF" stroke-width="2" />
      <circle cx="0" cy="0" r="6" fill="#EC4899" />
      <!-- Binary Snippets -->
      <text x="-60" y="-55" font-family="monospace" font-size="9" fill="#8B5CF6">0x90_NOP</text>
      <text x="35" y="65" font-family="monospace" font-size="9" fill="#EC4899">SHELL_OK</text>
    `,
  },
  {
    slug: "penetration-testing",
    title: "Penetration Testing",
    topic: "Payload Crafting · Pivoting · Metasploit · Exploit Chaining",
    category: "Offensive",
    primaryColor: "#EF4444",
    secondaryColor: "#F97316",
    accentColor: "#FBBF24",
    badgeText: "PEN-TEST",
    illustration: `
      <!-- Penetration Arrow piercing Defense Barrier -->
      <rect x="-60" y="-60" width="120" height="120" rx="16" fill="#081522" stroke="#16283A" stroke-width="2" />
      <path d="M -40 -30 L 0 -50 L 40 -30 L 40 20 C 40 45 0 65 0 65 C 0 65 -40 45 -40 20 Z" fill="none" stroke="#EF4444" stroke-width="3" />
      <!-- Piercing Lightning/Sword -->
      <path d="M 0 -80 L 12 -20 L -4 -15 L 8 40 L -25 -5 L -8 -10 Z" fill="#F97316" stroke="#FFFFFF" stroke-width="1.5" />
      <circle cx="0" cy="20" r="8" fill="#EF4444" />
    `,
  },
  {
    slug: "web-security",
    title: "Web Security",
    topic: "SQL Injection · XSS · CSRF · SSRF · Request Tampering",
    category: "AppSec",
    primaryColor: "#0EA5E9",
    secondaryColor: "#06B6D4",
    accentColor: "#38BDF8",
    badgeText: "APPSEC",
    illustration: `
      <!-- Web Browser Shield -->
      <rect x="-85" y="-60" width="170" height="120" rx="10" fill="#081522" stroke="#0EA5E9" stroke-width="2.5" />
      <rect x="-85" y="-60" width="170" height="24" rx="10" fill="#050B14" stroke="#16283A" stroke-width="1" />
      <circle cx="-70" cy="-48" r="4" fill="#EF4444" />
      <circle cx="-58" cy="-48" r="4" fill="#F59E0B" />
      <circle cx="-46" cy="-48" r="4" fill="#10B981" />
      <!-- URL Bar -->
      <rect x="-30" y="-53" width="105" height="12" rx="3" fill="#16283A" />
      <text x="-25" y="-44" font-family="monospace" font-size="8" fill="#38BDF8">https://secure.internal</text>
      <!-- Padlock in Core -->
      <rect x="-24" y="-8" width="48" height="38" rx="6" fill="#0EA5E9" />
      <path d="M -14 -8 L -14 -22 C -14 -32 14 -32 14 -22 L 14 -8" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
      <circle cx="0" cy="11" r="5" fill="#050B14" />
    `,
  },
  {
    slug: "owasp-security",
    title: "OWASP Security",
    topic: "OWASP Top 10 · Broken Access · Injection · Cryptographic Failures",
    category: "AppSec",
    primaryColor: "#F59E0B",
    secondaryColor: "#EAB308",
    accentColor: "#F97316",
    badgeText: "OWASP TOP 10",
    illustration: `
      <!-- Hexagonal Security Matrix -->
      <polygon points="0,-75 65,-38 65,38 0,75 -65,38 -65,-38" fill="#081522" stroke="#F59E0B" stroke-width="3" />
      <!-- OWASP Text -->
      <text x="0" y="-12" font-family="'Orbitron', sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle">OWASP</text>
      <text x="0" y="8" font-family="monospace" font-size="12" font-weight="bold" fill="#F59E0B" text-anchor="middle">TOP 10</text>
      <!-- Security Bars -->
      <rect x="-40" y="22" width="80" height="6" rx="3" fill="#EAB308" />
      <rect x="-30" y="34" width="60" height="5" rx="2.5" fill="#F97316" />
      <rect x="-20" y="44" width="40" height="4" rx="2" fill="#16283A" />
    `,
  },
  {
    slug: "soc-analyst",
    title: "SOC Analyst",
    topic: "SIEM Operations · Alert Triage · Log Analysis · Blue Team",
    category: "Defensive Operations",
    primaryColor: "#3B82F6",
    secondaryColor: "#60A5FA",
    accentColor: "#93C5FD",
    badgeText: "BLUE TEAM",
    illustration: `
      <!-- SOC Radar Monitor Screen -->
      <circle cx="0" cy="0" r="80" fill="#081522" stroke="#3B82F6" stroke-width="2.5" />
      <circle cx="0" cy="0" r="55" fill="none" stroke="#16283A" stroke-width="1.5" />
      <circle cx="0" cy="0" r="30" fill="none" stroke="#16283A" stroke-width="1.5" />
      <line x1="-80" y1="0" x2="80" y2="0" stroke="#16283A" stroke-width="1.5" />
      <line x1="0" y1="-80" x2="0" y2="80" stroke="#16283A" stroke-width="1.5" />
      <!-- Radar Sweeper Sweep -->
      <polygon points="0,0 60,-45 40,-65" fill="#3B82F6" fill-opacity="0.25" />
      <line x1="0" y1="0" x2="56" y2="-56" stroke="#60A5FA" stroke-width="2.5" />
      <!-- Threat Blips -->
      <circle cx="35" cy="-25" r="5" fill="#EF4444">
        <animate attributeName="r" values="4;7;4" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="-40" cy="35" r="4" fill="#F59E0B" />
      <circle cx="20" cy="45" r="3.5" fill="#10B981" />
    `,
  },
  {
    slug: "digital-forensics",
    title: "Digital Forensics",
    topic: "Evidence Carving · File Timelines · Hex Analysis · Chain of Custody",
    category: "DFIR",
    primaryColor: "#8B5CF6",
    secondaryColor: "#A78BFA",
    accentColor: "#C4B5FD",
    badgeText: "DFIR FORENSICS",
    illustration: `
      <!-- Magnifying Glass over Digital Chip & Disk -->
      <rect x="-65" y="-55" width="130" height="110" rx="10" fill="#081522" stroke="#16283A" stroke-width="2" />
      <!-- Memory Tracks -->
      <line x1="-50" y1="-30" x2="50" y2="-30" stroke="#8B5CF6" stroke-width="2" stroke-opacity="0.4" />
      <line x1="-50" y1="-10" x2="50" y2="-10" stroke="#8B5CF6" stroke-width="2" stroke-opacity="0.4" />
      <line x1="-50" y1="10" x2="50" y2="10" stroke="#8B5CF6" stroke-width="2" stroke-opacity="0.4" />
      <line x1="-50" y1="30" x2="50" y2="30" stroke="#8B5CF6" stroke-width="2" stroke-opacity="0.4" />
      <!-- Magnifying Lens Scope -->
      <circle cx="5" cy="-5" r="42" fill="#081522" fill-opacity="0.85" stroke="#A78BFA" stroke-width="3.5" />
      <circle cx="5" cy="-5" r="35" fill="none" stroke="#C4B5FD" stroke-width="1.2" stroke-dasharray="4,3" />
      <!-- Fingerprint / Evidence Icon -->
      <path d="M -10 -15 C 5 -25 20 -15 20 -5 C 20 15 -5 18 -5 5" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
      <!-- Handle -->
      <line x1="36" y1="26" x2="68" y2="58" stroke="#A78BFA" stroke-width="7" stroke-linecap="round" />
    `,
  },
  {
    slug: "threat-intelligence",
    title: "Threat Intelligence",
    topic: "CTI Analysis · MITRE ATT&CK · Threat Actors · IOC Feeds",
    category: "Intel & CTI",
    primaryColor: "#059669",
    secondaryColor: "#10B981",
    accentColor: "#34D399",
    badgeText: "THREAT INTEL",
    illustration: `
      <!-- Global Intel Globe / Radar -->
      <circle cx="0" cy="0" r="75" fill="#081522" stroke="#059669" stroke-width="2.5" />
      <ellipse cx="0" cy="0" rx="75" ry="32" fill="none" stroke="#16283A" stroke-width="1.5" />
      <ellipse cx="0" cy="0" rx="35" ry="75" fill="none" stroke="#16283A" stroke-width="1.5" />
      <!-- Intel Crosshairs & Node Connections -->
      <circle cx="-35" cy="-20" r="6" fill="#10B981" />
      <circle cx="40" cy="-28" r="6" fill="#EF4444" />
      <circle cx="15" cy="35" r="6" fill="#34D399" />
      <line x1="-35" y1="-20" x2="40" y2="-28" stroke="#10B981" stroke-width="1.5" stroke-dasharray="3,3" />
      <line x1="40" y1="-28" x2="15" y2="35" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="3,3" />
      <text x="0" y="5" font-family="'Orbitron', monospace" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">MITRE ATT&amp;CK</text>
    `,
  },
  {
    slug: "malware-analysis",
    title: "Malware Analysis",
    topic: "Static & Dynamic Analysis · Reverse Engineering · Sandboxing",
    category: "Reverse Eng",
    primaryColor: "#D97706",
    secondaryColor: "#F59E0B",
    accentColor: "#FBBF24",
    badgeText: "REVERSE ENG",
    illustration: `
      <!-- Bio-Cyber Hazard Container -->
      <polygon points="0,-75 65,-38 65,38 0,75 -65,38 -65,-38" fill="#081522" stroke="#D97706" stroke-width="2.5" />
      <!-- Quarantined Malware Bug Symbol -->
      <ellipse cx="0" cy="5" rx="22" ry="30" fill="#F59E0B" />
      <circle cx="0" cy="-28" r="14" fill="#F59E0B" />
      <!-- Antennae -->
      <line x1="-6" y1="-38" x2="-18" y2="-52" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
      <line x1="6" y1="-38" x2="18" y2="-52" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
      <!-- Legs -->
      <line x1="-22" y1="-8" x2="-44" y2="-18" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
      <line x1="22" y1="-8" x2="44" y2="-18" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
      <line x1="-22" y1="12" x2="-44" y2="18" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
      <line x1="22" y1="12" x2="44" y2="18" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
      <!-- Binary Cross Pattern inside Bug -->
      <line x1="0" y1="-15" x2="0" y2="28" stroke="#050B14" stroke-width="3" />
      <circle cx="-5" cy="-28" r="3" fill="#050B14" />
      <circle cx="5" cy="-28" r="3" fill="#050B14" />
    `,
  },
  {
    slug: "cloud-security",
    title: "Cloud Security",
    topic: "AWS · Azure · GCP · IAM Policies · Container & K8s Defense",
    category: "Cloud Infrastructure",
    primaryColor: "#0284C7",
    secondaryColor: "#38BDF8",
    accentColor: "#7DD3FC",
    badgeText: "CLOUD SEC",
    illustration: `
      <!-- Cloud Outline with Shield Inside -->
      <path d="M -30 -10 C -45 -35 -15 -55 10 -45 C 30 -60 65 -40 60 -10 C 80 -5 85 25 65 40 C 45 55 -55 55 -70 30 C -85 10 -65 -15 -30 -10 Z" fill="#081522" stroke="#0284C7" stroke-width="3" />
      <!-- Central Golden Keyhole Shield -->
      <path d="M -22 -15 L 0 -28 L 22 -15 L 22 15 C 22 30 0 42 0 42 C 0 42 -22 30 -22 15 Z" fill="#0284C7" stroke="#38BDF8" stroke-width="2" />
      <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
      <rect x="-2" y="0" width="4" height="12" fill="#FFFFFF" />
    `,
  },
  {
    slug: "active-directory-security",
    title: "Active Directory Security",
    topic: "Kerberos · Kerberoasting · BloodHound · Domain Controllers",
    category: "Enterprise Defense",
    primaryColor: "#4F46E5",
    secondaryColor: "#6366F1",
    accentColor: "#A5B4FC",
    badgeText: "ENTERPRISE AD",
    illustration: `
      <!-- Domain Forest Tree Structure -->
      <!-- Root DC Node -->
      <rect x="-35" y="-70" width="70" height="34" rx="8" fill="#081522" stroke="#4F46E5" stroke-width="2.5" />
      <text x="0" y="-48" font-family="'Orbitron', monospace" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ROOT DC</text>
      <!-- Subordinate Nodes -->
      <rect x="-85" y="10" width="60" height="30" rx="6" fill="#081522" stroke="#6366F1" stroke-width="2" />
      <text x="-55" y="30" font-family="monospace" font-size="10" font-weight="bold" fill="#A5B4FC" text-anchor="middle">OU:EXEC</text>
      <rect x="25" y="10" width="60" height="30" rx="6" fill="#081522" stroke="#6366F1" stroke-width="2" />
      <text x="55" y="30" font-family="monospace" font-size="10" font-weight="bold" fill="#A5B4FC" text-anchor="middle">OU:ADMIN</text>
      <!-- Trust Cables -->
      <line x1="0" y1="-36" x2="0" y2="-10" stroke="#4F46E5" stroke-width="2.5" />
      <line x1="-55" y1="-10" x2="55" y2="-10" stroke="#4F46E5" stroke-width="2.5" />
      <line x1="-55" y1="-10" x2="-55" y2="10" stroke="#6366F1" stroke-width="2.5" />
      <line x1="55" y1="-10" x2="55" y2="10" stroke="#6366F1" stroke-width="2.5" />
      <!-- Golden Ticket Emblem in Center -->
      <rect x="-22" y="-5" width="44" height="22" rx="4" fill="#F59E0B" />
      <text x="0" y="10" font-family="monospace" font-size="8" font-weight="bold" fill="#050B14" text-anchor="middle">TICKET</text>
    `,
  },
  {
    slug: "osint",
    title: "OSINT (Intelligence)",
    topic: "Open Source Intelligence · Dorking · Identity Recon · Metadata",
    category: "Reconnaissance",
    primaryColor: "#0D9488",
    secondaryColor: "#14B8A6",
    accentColor: "#5EEAD4",
    badgeText: "OSINT RECON",
    illustration: `
      <!-- Satellite / Radar Dish Scanner -->
      <path d="M -60 20 A 70 70 0 0 1 40 -60" fill="none" stroke="#0D9488" stroke-width="5" stroke-linecap="round" />
      <path d="M -45 28 A 55 55 0 0 1 30 -42" fill="none" stroke="#14B8A6" stroke-width="3" stroke-linecap="round" stroke-dasharray="6,4" />
      <!-- Dish Focal Antenna -->
      <line x1="-15" y1="-15" x2="45" y2="35" stroke="#FFFFFF" stroke-width="3" />
      <circle cx="45" cy="35" r="7" fill="#5EEAD4" />
      <!-- Radio Wave Emitters -->
      <path d="M 55 25 A 20 20 0 0 1 65 45" fill="none" stroke="#5EEAD4" stroke-width="2" />
      <path d="M 65 15 A 35 35 0 0 1 80 55" fill="none" stroke="#5EEAD4" stroke-width="2" />
      <!-- Scanner Lens -->
      <circle cx="-50" cy="-40" r="14" fill="#081522" stroke="#14B8A6" stroke-width="2" />
      <text x="-50" y="-36" font-family="monospace" font-size="10" font-weight="bold" fill="#5EEAD4" text-anchor="middle">GEO</text>
    `,
  },
  {
    slug: "api-security",
    title: "API Security",
    topic: "REST & GraphQL Vulnerabilities · BOLA/BFLA · JWT · Rate Limiting",
    category: "AppSec",
    primaryColor: "#2563EB",
    secondaryColor: "#3B82F6",
    accentColor: "#93C5FD",
    badgeText: "API DEFENSE",
    illustration: `
      <!-- Interlocking API Nodes with JWT Lock -->
      <rect x="-80" y="-30" width="60" height="60" rx="10" fill="#081522" stroke="#2563EB" stroke-width="2.5" />
      <text x="-50" y="6" font-family="monospace" font-size="12" font-weight="bold" fill="#93C5FD" text-anchor="middle">{JSON}</text>
      <rect x="20" y="-30" width="60" height="60" rx="10" fill="#081522" stroke="#2563EB" stroke-width="2.5" />
      <text x="50" y="6" font-family="monospace" font-size="12" font-weight="bold" fill="#93C5FD" text-anchor="middle">GQL</text>
      <!-- Middle Gateway Keyhole -->
      <line x1="-20" y1="0" x2="20" y2="0" stroke="#3B82F6" stroke-width="4" />
      <circle cx="0" cy="0" r="18" fill="#2563EB" stroke="#FFFFFF" stroke-width="2" />
      <circle cx="0" cy="-3" r="4" fill="#FFFFFF" />
      <rect x="-2" y="-3" width="4" height="10" fill="#FFFFFF" />
    `,
  },
  {
    slug: "ai-security",
    title: "AI Security & LLM Defense",
    topic: "Prompt Injection · Adversarial ML · Data Poisoning · Guardrails",
    category: "AI Safety",
    primaryColor: "#7C3AED",
    secondaryColor: "#8B5CF6",
    accentColor: "#C4B5FD",
    badgeText: "AI & LLM SEC",
    illustration: `
      <!-- Neural Network Nodes protected by Energy Shield -->
      <circle cx="-50" cy="-35" r="12" fill="#081522" stroke="#7C3AED" stroke-width="2.5" />
      <circle cx="-50" cy="35" r="12" fill="#081522" stroke="#7C3AED" stroke-width="2.5" />
      <circle cx="0" cy="0" r="18" fill="#7C3AED" stroke="#FFFFFF" stroke-width="3" />
      <circle cx="50" cy="-35" r="12" fill="#081522" stroke="#8B5CF6" stroke-width="2.5" />
      <circle cx="50" cy="35" r="12" fill="#081522" stroke="#8B5CF6" stroke-width="2.5" />
      <!-- Neural Synapses -->
      <line x1="-38" y1="-30" x2="-14" y2="-10" stroke="#C4B5FD" stroke-width="2" />
      <line x1="-38" y1="30" x2="-14" y2="10" stroke="#C4B5FD" stroke-width="2" />
      <line x1="14" y1="-10" x2="38" y2="-30" stroke="#C4B5FD" stroke-width="2" />
      <line x1="14" y1="10" x2="38" y2="30" stroke="#C4B5FD" stroke-width="2" />
      <!-- Glowing Defense Shield Overlay -->
      <path d="M -75 -65 L 0 -90 L 75 -65 L 75 25 C 75 75 0 100 0 100 C 0 100 -75 75 -75 25 Z" fill="none" stroke="#A78BFA" stroke-width="2" stroke-dasharray="6,4" />
      <!-- Brain Icon in Core -->
      <text x="0" y="6" font-family="'Orbitron', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">AI</text>
    `,
  },
  {
    slug: "incident-response",
    title: "Incident Response",
    topic: "CSIRT Playbooks · Containment · Eradication · Forensic Timeline",
    category: "DFIR & Ops",
    primaryColor: "#DC2626",
    secondaryColor: "#EF4444",
    accentColor: "#F87171",
    badgeText: "CSIRT PLAYBOOK",
    illustration: `
      <!-- Emergency Warning Hexagon with Playbook Timeline -->
      <polygon points="0,-75 65,-38 65,38 0,75 -65,38 -65,-38" fill="#081522" stroke="#DC2626" stroke-width="3" />
      <!-- Warning Exclamation -->
      <path d="M 0 -45 L 0 5" stroke="#EF4444" stroke-width="8" stroke-linecap="round" />
      <circle cx="0" cy="28" r="5" fill="#EF4444" />
      <!-- Surrounding Containment Ring -->
      <circle cx="0" cy="0" r="82" fill="none" stroke="#F87171" stroke-width="1.5" stroke-dasharray="4,6" />
    `,
  },
  {
    slug: "bug-bounty",
    title: "Bug Bounty Mastery",
    topic: "Vulnerability Hunting · Reporting · CVSS 10.0 · Proof of Concept",
    category: "Bounty & Research",
    primaryColor: "#D97706",
    secondaryColor: "#F59E0B",
    accentColor: "#FDE047",
    badgeText: "BUG BOUNTY",
    illustration: `
      <!-- Trophy Badge with Target Crown -->
      <circle cx="0" cy="0" r="70" fill="#081522" stroke="#D97706" stroke-width="3" />
      <circle cx="0" cy="0" r="50" fill="none" stroke="#F59E0B" stroke-width="1.8" stroke-dasharray="5,3" />
      <!-- Bounty Gold Medal Trophy -->
      <path d="M -26 -30 L 26 -30 L 20 10 C 20 25 0 35 0 35 C 0 35 -20 25 -20 10 Z" fill="#F59E0B" />
      <path d="M -26 -22 C -40 -22 -40 -6 -24 -6" fill="none" stroke="#F59E0B" stroke-width="3" />
      <path d="M 26 -22 C 40 -22 40 -6 24 -6" fill="none" stroke="#F59E0B" stroke-width="3" />
      <circle cx="0" cy="-6" r="8" fill="#050B14" />
      <text x="0" y="55" font-family="'Orbitron', monospace" font-size="11" font-weight="900" fill="#FDE047" text-anchor="middle">CVSS 10.0</text>
    `,
  },
  {
    slug: "default-course",
    title: "NISQ Cyber Academy",
    topic: "Practical Defense · Systems Analysis · Telemetry Investigation",
    category: "Cyber Defense",
    primaryColor: "#0A7CFF",
    secondaryColor: "#00B8FF",
    accentColor: "#38BDF8",
    badgeText: "NISQ VANGUARD",
    illustration: `
      <!-- NISQ Vanguard Master Wolf & Shield -->
      <path d="M -60 -60 L 0 -95 L 60 -60 L 60 25 C 60 70 0 105 0 105 C 0 105 -60 70 -60 25 Z" fill="#081522" stroke="#0A7CFF" stroke-width="3" />
      <path d="M -40 -40 L 0 -65 L 40 -40 L 40 18 C 40 50 0 75 0 75 C 0 50 -40 50 -40 18 Z" fill="none" stroke="#00B8FF" stroke-width="1.8" />
      <!-- Wolf Head Geometry -->
      <polygon points="0,-45 22,-15 15,10 0,30 -15,10 -22,-15" fill="#0A7CFF" fill-opacity="0.25" stroke="#38BDF8" stroke-width="2" />
      <circle cx="-8" cy="-8" r="3" fill="#00B8FF" />
      <circle cx="8" cy="-8" r="3" fill="#00B8FF" />
    `,
  },
];

console.log(`Generating ${COURSES.length} high-resolution course stickers in ${outDir}...`);

for (const c of COURSES) {
  const svgContent = createSvgSticker({
    title: c.title,
    topic: c.topic,
    category: c.category,
    primaryColor: c.primaryColor,
    secondaryColor: c.secondaryColor,
    accentColor: c.accentColor,
    badgeText: c.badgeText,
    illustrationSvg: c.illustration,
  });

  const filePath = path.join(outDir, `${c.slug}.svg`);
  fs.writeFileSync(filePath, svgContent, "utf8");
  console.log(`  ✓ Created: /courses/${c.slug}.svg`);
}

console.log("\nAll course stickers generated successfully!");
