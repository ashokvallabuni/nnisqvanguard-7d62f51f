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
  diagram_type?: "network_topology" | "tcp_handshake" | "ip_subnet" | "linux_fs" | "linux_perms" | "cia_triad" | "soc_pipeline";
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
  slug: string;
  title: string;
  level: string;
  tier: string;
  summary: string;
  description: string;
  badge_slug: string;
  badge_name: string;
  skills: string[];
  modules: CurriculumModule[];
}

export const NETWORKING_MODULES: CurriculumModule[] = [
  {
    id: "net-01",
    slug: "what-is-networking",
    title: "01 What Is Networking?",
    order_index: 1,
    duration_minutes: 20,
    difficulty: "BEGINNER",
    tags: ["Networking", "Foundations", "Packets"],
    summary: "Understand the foundational communication medium enabling distributed compute nodes to exchange structured data packets.",
    notes_md: `### What Is Computer Networking?
A computer network is an interconnected group of autonomous computational devices capable of exchanging data and sharing resources over physical or wireless transmission media.

### Why Does It Exist?
Without networking, every computer is an isolated silo. Networking enables distributed computing, instant message transmission, client-server applications, cloud infrastructure, and global information retrieval.

### How Does It Work Step-by-Step?
1. **Data Creation**: An application generates payload data (e.g. an HTTP GET request).
2. **Encapsulation**: The operating system protocol stack wraps the data in transport (TCP/UDP), network (IP), and link (Ethernet) headers.
3. **Transmission**: The physical network interface card (NIC) converts bits into electrical voltages, optical light pulses, or radio frequencies.
4. **Intermediate Routing**: Routers and switches inspect packet headers to forward data across network hops.
5. **Decapsulation & Reception**: The destination host strips headers in reverse order and delivers the payload to the listening application socket.`,
    diagram_type: "network_topology",
    sources: [
      { title: "RFC 1122: Requirements for Internet Hosts - Communication Layers", type: "RFC", citationNumber: "RFC 1122", url: "https://www.rfc-editor.org/rfc/rfc1122" },
      { title: "NIST SP 800-44: Guidelines on Securing Public Web Servers", type: "NIST", citationNumber: "SP 800-44", url: "https://csrc.nist.gov/publications/detail/sp/800-44/version-2/final" },
    ],
    explanations: {
      conceptName: "Computer Network",
      quick: "A system connecting two or more devices to exchange data using standardized protocols.",
      beginner: "Imagine the postal service: computers write letters, envelopes add addressing (headers), and postal trucks (routers) deliver them to the exact mailbox.",
      technical: "A packet-switched communication fabric utilizing layered protocol stacks (OSI 7-layer / TCP/IP 4-layer) for multiplexed bit delivery over physical/data-link channels.",
      security: "Any networked interface presents an attack surface: listening open ports, unauthenticated endpoints, and unencrypted transmission lines susceptible to interception.",
      practical: "SOC analysts inspect network packet captures (PCAPs) to identify unauthorized lateral movement, C2 beaconing, and rogue devices connected to the corporate LAN.",
    },
    quizzes: [
      {
        question: "What is the primary role of encapsulation in network communications?",
        options: [
          "To compress data to save bandwidth",
          "To add protocol headers at each layer containing addressing and control data",
          "To permanently encrypt every packet with AES-256",
          "To delete unauthorized packets automatically",
        ],
        correct_option: 1,
        explanation: "Encapsulation attaches layer-specific headers (like source/destination IP, MAC address, and ports) as data travels down the protocol stack.",
      },
    ],
    companion_lab_slug: "linux-ssh-brute-force-investigation",
  },
  {
    id: "net-08",
    slug: "ipv4-addressing",
    title: "08 IPv4 Addressing & Structure",
    order_index: 8,
    duration_minutes: 25,
    difficulty: "BEGINNER",
    tags: ["IPv4", "Addressing", "Octets"],
    summary: "Master the 32-bit logical addressing scheme that routes packets across global networks.",
    notes_md: `### What Is IPv4?
Internet Protocol Version 4 (IPv4) is a connectionless, best-effort network layer protocol defined in RFC 791 that provides logical addressing for host identification and packet routing.

### Structure of an IPv4 Address
An IPv4 address is exactly **32 bits (4 bytes)** long, expressed in dotted-decimal format:
\`192.168.1.10\` = \`11000000.10101000.00000001.00001010\`

Each number (octet) ranges from **0 to 255**. The address consists of two parts:
- **Network ID**: Identifies the specific network subnet.
- **Host ID**: Identifies the individual endpoint within that subnet.`,
    diagram_type: "ip_subnet",
    sources: [
      { title: "RFC 791: Internet Protocol DARPA Internet Program Protocol Specification", type: "RFC", citationNumber: "RFC 791", url: "https://www.rfc-editor.org/rfc/rfc791" },
      { title: "RFC 1918: Address Allocation for Private Internets", type: "RFC", citationNumber: "RFC 1918", url: "https://www.rfc-editor.org/rfc/rfc1918" },
    ],
    explanations: {
      conceptName: "IPv4 Address",
      quick: "A 32-bit unique numerical identifier assigned to a network device interface.",
      beginner: "Think of an IP address as a street address: the street name is the Network ID and the house number is the Host ID.",
      technical: "A 32-bit integer formatted as 4 octets separated by dots, used in Layer 3 packet headers for routing across autonomous systems.",
      security: "Adversaries spoof source IP addresses in UDP-based reflection DDoS attacks and scan IPv4 ranges looking for exposed vulnerable services.",
      practical: "Analysts map source and destination IPs to geographic locations and ASN reputation databases to determine attacker origins.",
    },
    quizzes: [
      {
        question: "How many total bits make up a standard IPv4 address?",
        options: ["16 bits", "32 bits (4 octets)", "64 bits", "128 bits"],
        correct_option: 1,
        explanation: "An IPv4 address consists of 32 bits divided into 4 eight-bit octets.",
      },
    ],
  },
  {
    id: "net-10",
    slug: "subnetting-and-cidr",
    title: "10 Subnetting & CIDR Notation",
    order_index: 10,
    duration_minutes: 30,
    difficulty: "INTERMEDIATE",
    tags: ["Subnetting", "CIDR", "Network Boundaries"],
    summary: "Learn how to divide large networks into isolated subnets using subnet masks and variable length prefix notation.",
    notes_md: `### What Is Subnetting?
Subnetting is the practice of dividing a single large broadcast domain into multiple smaller, logically segmented subnets to optimize routing, reduce broadcast congestion, and enforce security isolation.

### CIDR (Classless Inter-Domain Routing)
CIDR replaces legacy class-based networking with prefix notation (e.g. \`/24\`). The prefix specifies how many bits represent the Network portion.
- \`/24\` = 24 Network bits, 8 Host bits ($2^8 = 256$ total addresses, $254$ usable hosts).
- \`/28\` = 28 Network bits, 4 Host bits ($2^4 = 16$ total addresses, $14$ usable hosts).`,
    diagram_type: "ip_subnet",
    sources: [
      { title: "RFC 4632: Classless Inter-domain Routing (CIDR): The Internet Address Assignment and Aggregation Plan", type: "RFC", citationNumber: "RFC 4632", url: "https://www.rfc-editor.org/rfc/rfc4632" },
    ],
    quizzes: [
      {
        question: "In a /28 subnet, how many total usable host IP addresses are available?",
        options: ["16", "14 (16 total minus Network and Broadcast)", "30", "254"],
        correct_option: 1,
        explanation: "A /28 subnet provides 32 - 28 = 4 host bits ($2^4 = 16$). Subtracting the Network ID and Broadcast address leaves 14 usable hosts.",
      },
    ],
  },
  {
    id: "net-14",
    slug: "tcp-protocol-and-handshake",
    title: "14 Transmission Control Protocol (TCP)",
    order_index: 14,
    duration_minutes: 35,
    difficulty: "INTERMEDIATE",
    tags: ["TCP", "3-Way Handshake", "RFC 793"],
    summary: "Understand connection-oriented reliable transport, sequence number tracking, flow control, and SYN flood defenses.",
    notes_md: `### What Is TCP?
Transmission Control Protocol (TCP) is a connection-oriented, reliable Layer 4 transport protocol defined in RFC 793 and RFC 9293. It guarantees in-order byte stream delivery, retransmits lost packets, and implements congestion control.

### The 3-Way Handshake
Before data can be transmitted, endpoints establish state via:
1. **SYN**: Client sends Initial Sequence Number (ISN).
2. **SYN-ACK**: Server acknowledges Client ISN and responds with its own ISN.
3. **ACK**: Client acknowledges Server ISN. The connection is now **ESTABLISHED**.`,
    diagram_type: "tcp_handshake",
    sources: [
      { title: "RFC 9293: Transmission Control Protocol (TCP) Specification", type: "RFC", citationNumber: "RFC 9293", url: "https://www.rfc-editor.org/rfc/rfc9293" },
      { title: "MITRE ATT&CK T1498: Network Denial of Service (SYN Flood)", type: "MITRE", citationNumber: "T1498", url: "https://attack.mitre.org/techniques/T1498/" },
    ],
    explanations: {
      conceptName: "TCP 3-Way Handshake",
      quick: "The 3-step synchronization process (SYN -> SYN-ACK -> ACK) that creates a reliable TCP socket.",
      beginner: "Like dialing a phone: You call (SYN), they answer 'Hello, I hear you' (SYN-ACK), and you reply 'Great, let's talk' (ACK).",
      technical: "A state machine exchange synchronizing sequence numbers between endpoints to establish a sliding window byte stream.",
      security: "SYN Floods exhaust the server's embryonic connection queue. Port scans (SYN stealth scan) send SYN and tear down with RST to map open ports.",
      practical: "SOC analysts look for asymmetric SYN vs ACK ratios in NetFlow to detect active Denial of Service attacks.",
    },
    quizzes: [
      {
        question: "Which TCP packet finishes the 3-way handshake and transitions the connection to ESTABLISHED?",
        options: ["SYN", "SYN-ACK", "ACK from the client", "FIN-ACK"],
        correct_option: 2,
        explanation: "The client's ACK packet acknowledges the server's sequence number and completes the handshake.",
      },
    ],
    companion_lab_slug: "suricata-network-threat-hunting",
  },
];

export const LINUX_MODULES: CurriculumModule[] = [
  {
    id: "lin-01",
    slug: "linux-architecture-and-shell",
    title: "01 Linux Architecture, Kernel & Terminal",
    order_index: 1,
    duration_minutes: 25,
    difficulty: "BEGINNER",
    tags: ["Linux", "Kernel", "Shell", "CLI"],
    summary: "Explore the Linux operating system architecture: hardware, kernel space, system calls, shell interpreters, and user space.",
    notes_md: `### What Is Linux?
Linux is an open-source, Unix-like, monolithic operating system kernel created by Linus Torvalds in 1991. Combined with GNU user space utilities, it forms the backbone of enterprise cloud infrastructure and security workstations.

### Core Architecture Components:
- **Hardware**: Physical CPU, RAM, disk, NICs.
- **Kernel Space**: Core engine managing memory, process scheduling, hardware drivers, and security capabilities.
- **System Calls (Syscalls)**: The API bridge between user applications and the kernel (e.g. \`open\`, \`read\`, \`write\`, \`fork\`, \`execve\`).
- **User Space & Shell**: User environment running shells (\`bash\`, \`zsh\`) and command binaries (\`ls\`, \`grep\`).`,
    diagram_type: "linux_fs",
    sources: [
      { title: "Linux Kernel Documentation: System Calls", type: "LINUX_DOC", url: "https://www.kernel.org/doc/html/latest/" },
      { title: "POSIX.1-2017 Standard: Shell and Utilities", type: "ACADEMIC", url: "https://pubs.opengroup.org/onlinepubs/9699919799/" },
    ],
    quizzes: [
      {
        question: "What interface allows unprivileged user-space applications to request privileged actions from the Linux kernel?",
        options: ["System Calls (Syscalls)", "BIOS Firmware", "HTML5 Sockets", "CRON Daemon"],
        correct_option: 0,
        explanation: "System calls (such as open, fork, execve) are the standardized API through which user applications request kernel services.",
      },
    ],
    companion_lab_slug: "linux-ssh-brute-force-investigation",
  },
  {
    id: "lin-05",
    slug: "linux-filesystem-and-permissions",
    title: "05 Linux Filesystem Hierarchy & Permissions",
    order_index: 5,
    duration_minutes: 30,
    difficulty: "BEGINNER",
    tags: ["Permissions", "chmod", "FHS", "Security"],
    summary: "Master POSIX file permissions (rwx), octal notation, sticky bits, and the Filesystem Hierarchy Standard.",
    notes_md: `### The Linux Filesystem Hierarchy (FHS)
Everything in Linux is represented as a file or stream starting from the root directory \`/\`.

### POSIX Permissions Model
Every file and directory has permissions divided into three scopes:
1. **User (Owner)**: \`rwx\`
2. **Group**: \`rwx\`
3. **Others (World)**: \`rwx\`

- **Read (r)**: Value = 4
- **Write (w)**: Value = 2
- **Execute (x)**: Value = 1

Example: \`chmod 755 script.sh\` gives Owner full access (7 = 4+2+1), and Group/Others read+execute (5 = 4+1).`,
    diagram_type: "linux_perms",
    sources: [
      { title: "Filesystem Hierarchy Standard (FHS) 3.0", type: "LINUX_DOC", url: "https://refspecs.linuxfoundation.org/FHS_3.0/fhs-3.0.html" },
    ],
    quizzes: [
      {
        question: "What octal permission string represents -rw-r--r-- (Owner read/write, Group and Others read-only)?",
        options: ["755", "644", "600", "777"],
        correct_option: 1,
        explanation: "Owner (4+2=6), Group (4), Others (4) results in octal 644.",
      },
    ],
  },
];

export const COURSES_CATALOG: CurriculumCourse[] = [
  {
    id: "c-net-fund",
    slug: "networking-fundamentals",
    title: "Networking Fundamentals",
    level: "Beginner",
    tier: "free",
    summary: "Master TCP/IP, OSI layers, packet flows, routing, and network forensics from first principles.",
    description: "Build an unshakeable foundation in computer networking. Understand how packets traverse from browser to server, analyze real network flow datasets, and learn defensive traffic inspection.",
    badge_slug: "network-navigator",
    badge_name: "Network Navigator Badge",
    skills: ["TCP/IP Architecture", "Subnetting & CIDR", "Packet Analysis (TShark)", "Network Protocols (DNS/HTTP/TLS)"],
    modules: NETWORKING_MODULES,
  },
  {
    id: "c-lin-fund",
    slug: "linux-fundamentals",
    title: "Linux Fundamentals",
    level: "Beginner",
    tier: "free",
    summary: "Master the Linux command line, filesystem hierarchy, permissions, and process triage.",
    description: "Learn Linux from the ground up: bash shell commands, filesystem navigation, user permissions (chmod/chown), process monitoring, and auth log inspection.",
    badge_slug: "linux-foundations",
    badge_name: "Linux Foundations Badge",
    skills: ["Linux CLI & Bash", "POSIX File Permissions", "Process Triage (ps/top)", "Log Investigation (/var/log)"],
    modules: LINUX_MODULES,
  },
  {
    id: "c-cyber-found",
    slug: "cybersecurity-foundations",
    title: "Cybersecurity Foundations",
    level: "Beginner",
    tier: "free",
    summary: "Core threat models, CIA triad, attack surfaces, authentication hygiene, and defense controls.",
    description: "The official gateway course for all security defenders. Master foundational threat principles, security controls, and authentication telemetry.",
    badge_slug: "cybersecurity-foundations-badge",
    badge_name: "Cybersecurity Foundations Badge",
    skills: ["CIA Triad", "Threat Modeling", "Access Control & MFA", "Incident Lifecycle"],
    modules: NETWORKING_MODULES.slice(0, 2),
  },
];
