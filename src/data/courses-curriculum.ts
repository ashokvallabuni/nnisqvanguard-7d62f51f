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
  analogy?: string;
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
    id?: string;
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
  duration_hours?: number;
  summary: string;
  description: string;
  badge_slug: string;
  badge_name: string;
  skills: string[];
  isLocked?: boolean;
  comingSoon?: boolean;
  modules: CurriculumModule[];
}

// ==========================================
// 1. BASICS OF NETWORKING (10 Canonical Lessons from PDF)
// ==========================================
export const NETWORKING_MODULES: CurriculumModule[] = [
  {
    id: "net-01",
    slug: "network-fundamentals-topologies",
    title: "Lesson 1: Network Fundamentals & Topologies",
    order_index: 1,
    duration_minutes: 20,
    difficulty: "BEGINNER",
    tags: ["Nodes", "Links", "LAN", "WAN", "Topologies"],
    analogy: "The Postal System Analogy: Houses (Nodes), Roads (Cables), Local Post Offices (Switches), Interstate Highways (Routers).",
    summary: "Nodes, links, LAN/WAN classifications, and physical topologies (Star, Bus, Ring, Mesh).",
    notes_md: `### 1.1 What is a Computer Network?
At its simplest core, a Computer Network is two or more computing devices linked together using cables or wireless signals so they can exchange digital information, share resources, and talk to one another.

#### 📬 The Postal System Analogy
Think of a computer network like a global postal network. The computers are individual houses, the network cables are the roads, the network switches are local post offices, and the routers are interstate highways directing mail delivery trucks!

- **Nodes (The Neighbors)**: Any physical device connected to a network (laptops, smartphones, smart TVs, game consoles, network printers, servers).
- **Links (The Roads)**: The physical or invisible pathway over which data travels (copper wire, fiber-optic glass, or radio waves).

#### Geographic Network Classifications
- **PAN (Personal Area Network)**: Within 10 meters (e.g. Bluetooth headphones).
- **LAN (Local Area Network)**: Single room, home, or office (e.g. your home Wi-Fi).
- **CAN (Campus Area Network)**: Multiple buildings across a university or school district.
- **MAN (Metropolitan Area Network)**: Across an entire city (e.g. municipal Wi-Fi).
- **WAN (Wide Area Network)**: Across countries or continents (e.g. the global Internet!).

### 1.2 Network Topologies (How Devices Connect)
- **Star Topology (Most Popular)**: All nodes connect to a central hub/switch. If one cable breaks, only that device disconnects.
- **Bus Topology (Legacy)**: Single central backbone cable. If it snaps, the whole network goes down.
- **Ring Topology**: Circular loop where messages travel in one direction with a token.
- **Mesh Topology (Ultra Reliable)**: Every node connects directly to every other node. If one link fails, data reroutes instantly!`,
    diagram_type: "network_topology",
    sources: [
      { title: "RFC 1122: Requirements for Internet Hosts", type: "RFC", citationNumber: "RFC 1122", url: "https://www.rfc-editor.org/rfc/rfc1122" }
    ],
    explanations: {
      conceptName: "Network Topology",
      quick: "The physical or logical layout of how nodes and links are connected.",
      beginner: "Just like city maps dictate how cars navigate, topologies dictate how data packets flow between computers.",
      technical: "Geometric arrangement of network elements including point-to-point links, shared media buses, and distributed mesh graphs.",
      security: "Star topologies isolate point failures, whereas unsegmented bus and star fabrics without port security allow sniffing and MAC flooding.",
      practical: "Modern enterprise campus networks deploy hierarchical star-tree architectures with redundant links.",
    },
    quizzes: [
      {
        id: "q-net-01",
        question: "Which network topology connects all nodes to a central central hub box?",
        options: ["Bus Topology", "Star Topology", "Ring Topology", "Peer-to-Peer"],
        correct_option: 1,
        explanation: "In a Star Topology, all network devices connect into a central switch or hub box.",
      },
    ],
  },
  {
    id: "net-02",
    slug: "physical-media-data-link",
    title: "Lesson 2: Physical Media & Data Link Layer",
    order_index: 2,
    duration_minutes: 25,
    difficulty: "BEGINNER",
    tags: ["Twisted Pair", "Fiber Optics", "Wi-Fi", "MAC Address", "Ethernet Frame"],
    analogy: "The Flashlight Analogy: Sending messages across the street using flashlight pulses (Light ON = 1, Light OFF = 0).",
    summary: "Copper wire, fiber optics, Wi-Fi radio waves, 48-bit MAC addresses, and Ethernet frames.",
    notes_md: `### 2.1 Physical Transmission Media
- **⚡ Twisted Pair Copper**: Electrical voltage pulses. Standard RJ-45 (Cat5e, Cat6). Maximum 100 meters (328 ft) before attenuation.
- **💡 Fiber Optic Cables**: Laser/LED light pulses inside hair-thin glass strands. Blazing fast, immune to electromagnetic interference, tens of miles range.
- **📡 Wireless Radio Waves**: Electromagnetic radio spectrum (Wi-Fi 802.11, 4G/5G). Flexible but blocked by physical obstacles.

### 2.2 The Data Link Layer & MAC Addresses
A **MAC (Media Access Control) Address** is a 48-bit hardware identifier permanently burned into your Network Interface Card (NIC) at the factory:
- **Format**: 12 Hexadecimal digits in pairs: \`A4:C3:F0:12:89:AB\`
- **First 6 Digits (OUI)**: Organizationally Unique Identifier (Apple, Intel, Cisco).
- **Last 6 Digits (NIC Serial)**: Unique serial number.

### 2.3 What is an Ethernet Frame?
Frames package raw binary bits into structured containers:
- **Preamble (8 Bytes)**: Clock synchronization.
- **Destination MAC (6 Bytes)** & **Source MAC (6 Bytes)**.
- **Type (2 Bytes)**: e.g. IPv4 (\`0x0800\`).
- **Payload (46 - 1500 Bytes)**: The actual message data.
- **FCS (Frame Check Sequence, 4 Bytes)**: CRC error check math formula.`,
    diagram_type: "network_topology",
    sources: [{ title: "IEEE 802.3 Ethernet Standard", type: "RFC", citationNumber: "IEEE 802.3", url: "https://standards.ieee.org" }],
    quizzes: [
      {
        id: "q-net-02",
        question: "What address stays permanently built into your network interface card hardware?",
        options: ["Public IP Address", "MAC Address", "DNS Hostname", "Subnet Mask"],
        correct_option: 1,
        explanation: "The MAC address is a 48-bit physical identifier burned into the NIC at the factory.",
      },
    ],
  },
  {
    id: "net-03",
    slug: "network-hardware-suite",
    title: "Lesson 3: Network Hardware Suite (Hubs, Switches, Routers, Modems)",
    order_index: 3,
    duration_minutes: 25,
    difficulty: "BEGINNER",
    tags: ["Hubs", "Switches", "Routers", "Modems", "CAM Table"],
    analogy: "A Switch is a private telephone operator; a Router is an International Airport checking IP passports.",
    summary: "Difference between hubs, switches (CAM table), routers, modems, and all-in-one Wi-Fi router components.",
    notes_md: `### 3.1 Local Hardware: Hubs vs Switches
- **🚫 Network Hub (Obsolete / Dumb)**: Megaphone in a crowded room. Copies and shouts incoming frames to every connected device! Severe collision and sniffing risk.
- **✅ Network Switch (Smart / Modern)**: Private telephone operator. Reads Destination MAC address and forwards frames only to the target device's physical port.
- **CAM Table (MAC Address Table)**: Switch dynamically maps \`Port # <-> Learned MAC Address\`.

### 3.2 Inter-Network Hardware: Routers & Modems
- **Modem (Modulator / Demodulator)**: Translates ISP signals (fiber, coax, phone line) into digital Ethernet signals.
- **Router (Traffic Manager)**: Connects LAN to WAN / Internet. Evaluates IP addresses, assigns local IPs, blocks attacks, routes packets.
- **Your Home Wi-Fi Router = 4 Devices in 1**:
  1. Wireless Access Point (WAP)
  2. 4-Port Switch
  3. IP Router
  4. Firewall & DHCP Server.`,
    diagram_type: "network_topology",
    sources: [{ title: "Cisco Enterprise Switching & Routing Principles", type: "NIST", url: "https://cisco.com" }],
    quizzes: [
      {
        id: "q-net-03",
        question: "What device joins computers inside a local network by reading MAC addresses?",
        options: ["Modem", "Switch", "Repeater", "Firewall"],
        correct_option: 1,
        explanation: "A Switch connects devices in a local area network by reading Layer 2 MAC addresses.",
      },
    ],
  },
  {
    id: "net-04",
    slug: "internet-protocol-subnets-dhcp",
    title: "Lesson 4: Internet Protocol (IP), Subnets, IPv6 & DHCP",
    order_index: 4,
    duration_minutes: 30,
    difficulty: "BEGINNER",
    tags: ["IPv4", "IPv6", "Subnet Mask", "DHCP", "DORA"],
    analogy: "MAC address = Social Security Number (follows you everywhere); IP address = Mailing street address (changes when you move).",
    summary: "IPv4 32-bit format, 4 octets, public vs private IP ranges (RFC 1918), IPv6 128-bit addresses, and DHCP DORA process.",
    notes_md: `### 4.1 Internet Protocol (IP) & IPv4 Structure
An IPv4 Address is a 32-bit binary number written in Dotted Decimal Notation:
\`192.168.1.50\`
- 4 numbers called **Octets** (each 8 bits, 0 to 255).
- **Public IPs**: Unique across the world wide web, assigned by ISP.
- **Private IPs (RFC 1918)**:
  - \`10.0.0.0 – 10.255.255.255\`
  - \`172.16.0.0 – 172.31.255.255\`
  - \`192.168.0.0 – 192.168.255.255\`

### 4.2 Subnets & IPv6
- **Subnet Mask**: Separates Network ID from Host ID (e.g. \`255.255.255.0\` or \`/24\`).
- **IPv6**: 128 bits in hexadecimal (\`2001:0db8:85a3::8a2e:0370:7334\`) providing $3.4 \\times 10^{38}$ addresses.
- **DHCP (Dynamic Host Configuration Protocol)**: Automatically leases IP in 4 steps (**DORA**):
  1. Discover
  2. Offer
  3. Request
  4. Acknowledge`,
    diagram_type: "ip_subnet",
    sources: [{ title: "RFC 791: Internet Protocol Specification", type: "RFC", citationNumber: "RFC 791", url: "https://www.rfc-editor.org/rfc/rfc791" }],
    quizzes: [
      {
        id: "q-net-04",
        question: "How many bits make up a standard IPv4 address?",
        options: ["16 Bits", "32 Bits", "64 Bits", "128 Bits"],
        correct_option: 1,
        explanation: "An IPv4 address consists of 32 bits (4 octets of 8 bits each).",
      },
    ],
  },
  {
    id: "net-05",
    slug: "packet-switching-routing",
    title: "Lesson 5: Packet Switching & Routing (Anatomy, Hops, TTL & BGP)",
    order_index: 5,
    duration_minutes: 25,
    difficulty: "INTERMEDIATE",
    tags: ["Packet Switching", "MTU", "TTL", "BGP", "Hop Count"],
    analogy: "The Jigsaw Puzzle Analogy: Mailing a 1,000-piece puzzle by placing each piece in an envelope with sequence numbers.",
    summary: "Packet anatomy, MTU (1500 Bytes), routing tables, hop count decrement, Time to Live (TTL), and BGP internet backbone.",
    notes_md: `### 5.1 Packet Switching & Data Flow
Modern networks break files into independent data chunks called **Packets** that travel across separate paths simultaneously!
- **IP Header**: Source IP, Destination IP, TTL (Time to Live), Protocol.
- **Payload**: Slice of data / image / audio / text.
- **MTU Size**: Maximum Transmission Unit (Standard: 1500 Bytes). Packets exceeding MTU undergo Fragmentation.

### 5.2 Routing Algorithms & Path Selection
- **Hop Count & TTL**: Every router hop decrements TTL by 1. When TTL hits 0, the router discards the packet and sends an ICMP Time Exceeded message, preventing infinite routing loops!
- **BGP (Border Gateway Protocol)**: The global routing map used by ISPs worldwide to exchange transit routes.`,
    diagram_type: "network_topology",
    sources: [{ title: "RFC 4271: A Border Gateway Protocol 4 (BGP-4)", type: "RFC", citationNumber: "RFC 4271", url: "https://www.rfc-editor.org/rfc/rfc4271" }],
    quizzes: [
      {
        id: "q-net-05",
        question: "What happens when a packet's Time to Live (TTL) counter reaches 0?",
        options: ["It is returned to sender immediately", "It is discarded to prevent infinite routing loops", "It converts into an IPv6 packet", "It bypasses the next router firewall"],
        correct_option: 1,
        explanation: "When TTL reaches 0, the router drops the packet and sends an ICMP Time Exceeded notice.",
      },
    ],
  },
  {
    id: "net-06",
    slug: "osi-and-tcp-ip-models",
    title: "Lesson 6: The OSI & TCP/IP Models and Data Encapsulation",
    order_index: 6,
    duration_minutes: 30,
    difficulty: "INTERMEDIATE",
    tags: ["OSI 7 Layers", "TCP/IP 4 Layers", "Encapsulation", "PDU"],
    analogy: "Russian Nesting Dolls: Each layer wraps its own header around data on transmission and strips it off on reception.",
    summary: "7-layer OSI model, 4-layer TCP/IP stack, mnemonic ('All People Seem To Need Data Processing'), and Protocol Data Units.",
    notes_md: `### 6.1 The OSI 7-Layer Reference Model
- **Layer 7 - Application**: User interface (HTTP, DNS, SSH, SMTP).
- **Layer 6 - Presentation**: Formatting, SSL/TLS encryption, compression.
- **Layer 5 - Session**: Manages connections, NetBIOS, sockets.
- **Layer 4 - Transport**: End-to-end delivery & flow control (TCP, UDP).
- **Layer 3 - Network**: Logical IP addressing & routing (Packets).
- **Layer 2 - Data Link**: Physical MAC addressing & switching (Frames).
- **Layer 1 - Physical**: Electrical voltage / light signaling over cables (Bits).

### 6.2 TCP/IP 4-Layer Model & PDUs
1. **Application Layer** (OSI 7, 6, 5) -> PDU: Data / Message
2. **Transport Layer** (OSI 4) -> PDU: Segment (TCP) or Datagram (UDP)
3. **Internet Layer** (OSI 3) -> PDU: Packet
4. **Network Access Layer** (OSI 2, 1) -> PDU: Frame / Bits`,
    diagram_type: "network_topology",
    sources: [{ title: "ISO/IEC 7498-1: Open Systems Interconnection", type: "ACADEMIC", url: "https://www.iso.org" }],
    quizzes: [
      {
        id: "q-net-06",
        question: "What layer of the OSI model handles end-to-end TCP and UDP port delivery?",
        options: ["Layer 2 - Data Link", "Layer 3 - Network", "Layer 4 - Transport", "Layer 7 - Application"],
        correct_option: 2,
        explanation: "Layer 4 (Transport Layer) is responsible for host-to-host communication and ports.",
      },
    ],
  },
  {
    id: "net-07",
    slug: "transport-layer-tcp-udp-ports",
    title: "Lesson 7: Transport Layer Protocols (TCP vs UDP) & Sockets",
    order_index: 7,
    duration_minutes: 30,
    difficulty: "INTERMEDIATE",
    tags: ["TCP", "UDP", "3-Way Handshake", "Ports", "Sockets"],
    analogy: "The Apartment & Room Analogy: IP address = Apartment building address; Port number = Specific apartment room number.",
    summary: "TCP reliable 3-way handshake (SYN, SYN-ACK, ACK) vs UDP connectionless speed, well-known ports (21, 22, 53, 80, 443, 3389).",
    notes_md: `### 7.1 Transport Layer: TCP vs UDP
- **TCP (Transmission Control Protocol)**: Connection-oriented (SYN, SYN-ACK, ACK), 100% reliable (retransmits lost packets), 20-byte header. Used for Web, Email, Banking, File downloads.
- **UDP (User Datagram Protocol)**: Connectionless (fires blindly), ultra-fast & lightweight (8-byte header), no delivery guarantee. Used for Live Video Calls, Gaming, DNS queries.

### 7.2 Must-Know Port Numbers & Sockets
- **Port 21**: FTP (File Transfer)
- **Port 22**: SSH (Secure Shell)
- **Port 25**: SMTP (Email routing)
- **Port 53**: DNS (Domain lookup)
- **Port 80**: HTTP (Plain web)
- **Port 443**: HTTPS (Encrypted TLS web)
- **Port 3389**: RDP (Remote Desktop)
- **Socket**: IP Address + Port Number (e.g. \`192.168.1.50:443\`) uniquely identifies a single connection channel!`,
    diagram_type: "tcp_handshake",
    sources: [{ title: "RFC 9293: Transmission Control Protocol (TCP)", type: "RFC", citationNumber: "RFC 9293", url: "https://www.rfc-editor.org/rfc/rfc9293" }],
    quizzes: [
      {
        id: "q-net-07",
        question: "True or False: UDP performs a 3-way handshake before transmitting data.",
        options: ["True", "False"],
        correct_option: 1,
        explanation: "UDP is connectionless and sends datagrams immediately without a handshake.",
      },
    ],
  },
  {
    id: "net-08",
    slug: "network-services-dns-http-ssh",
    title: "Lesson 8: Network Services (DNS, HTTP/HTTPS & SSH)",
    order_index: 8,
    duration_minutes: 25,
    difficulty: "INTERMEDIATE",
    tags: ["DNS", "HTTP", "HTTPS", "TLS", "SSH", "Records"],
    analogy: "DNS is the global internet contact book converting human names like google.com to IP phone numbers.",
    summary: "4-server DNS lookup chain (Resolver, Root, TLD, Authoritative), DNS records (A, AAAA, CNAME, MX, TXT), HTTP vs HTTPS, and SSH security.",
    notes_md: `### 8.1 The Domain Name System (DNS)
1. **Recursive Resolver**: ISP or public (Cloudflare \`1.1.1.1\`, Google \`8.8.8.8\`).
2. **Root Nameserver (\`.\`)**: Directs query to proper TLD.
3. **TLD Nameserver (\`.com\`, \`.org\`)**: Points to domain authoritative server.
4. **Authoritative Nameserver**: Holds official IP record.
- **Records**: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), TXT (SPF/DKIM verification).

### 8.2 Application Protocols: HTTP, HTTPS & SSH
- **HTTP (Port 80)**: Unencrypted plaintext. Vulnerable to coffee shop Wi-Fi interception!
- **HTTPS (Port 443)**: Encrypted with TLS (Transport Layer Security). Look for the padlock!
- **SSH (Port 22)**: Encrypted CLI terminal access to remote servers. Replaces unsafe Telnet (Port 23).`,
    diagram_type: "network_topology",
    sources: [{ title: "RFC 1035: Domain Names - Implementation and Specification", type: "RFC", citationNumber: "RFC 1035", url: "https://www.rfc-editor.org/rfc/rfc1035" }],
    quizzes: [
      {
        id: "q-net-08",
        question: "Which protocol securely encrypts web browsing traffic on port 443?",
        options: ["HTTP", "DNS", "HTTPS", "FTP"],
        correct_option: 2,
        explanation: "HTTPS uses TLS encryption on port 443 to secure web browsing.",
      },
    ],
  },
  {
    id: "net-09",
    slug: "network-security-firewalls-vpns",
    title: "Lesson 9: Network Security, Firewalls, NAT & VPNs",
    order_index: 9,
    duration_minutes: 30,
    difficulty: "INTERMEDIATE",
    tags: ["Firewall", "NAT", "VPN", "MitM", "DDoS", "ARP Spoofing"],
    analogy: "Firewall = Castle guard drawbridge bouncer; VPN = Underground tunnel hiding your car on a public highway.",
    summary: "Packet filtering vs stateful firewalls, NAT translation, VPN encryption tunnels, and threats (Man-in-the-Middle, DDoS, ARP spoofing).",
    notes_md: `### 9.1 Network Security & Firewalls
- **🏰 Castle Guard Analogy**: Monitors every packet against Access Control Lists (ACLs).
- **Packet Filtering**: Checks basic headers (Source/Dest IP, Port) independently.
- **Stateful Inspection**: Remembers open outgoing connections and automatically allows safe return traffic.
- **NAT (Network Address Translation)**: Translates private LAN IPs into 1 Public IP, conserving addresses and masking internal hosts.

### 9.2 VPNs & Cyber Hygiene
- **VPN (Virtual Private Network)**: Encrypted tunnel shielding traffic on public Wi-Fi.
- **Network Threats**:
  - **Man-in-the-Middle (MitM)**: Intercepting plaintext traffic. Prevent with HTTPS & VPN.
  - **DDoS Attack**: Flooding server bandwidth with millions of requests. Defend with DDoS mitigation (Cloudflare).
  - **ARP Spoofing**: Fake MAC address broadcasts poisoning switch tables. Defend with Dynamic ARP Inspection (DAI).`,
    diagram_type: "cia_triad",
    sources: [{ title: "NIST SP 800-41: Guidelines on Firewalls and Firewall Policy", type: "NIST", citationNumber: "SP 800-41", url: "https://csrc.nist.gov" }],
    quizzes: [
      {
        id: "q-net-09",
        question: "What network mechanism translates private home IPs into a single public IP to talk to external servers?",
        options: ["DHCP", "DNS", "NAT (Network Address Translation)", "ARP"],
        correct_option: 2,
        explanation: "NAT translates local private addresses (192.168.x.x) into one public IP address.",
      },
    ],
  },
  {
    id: "net-10",
    slug: "troubleshooting-cli-tools-labs",
    title: "Lesson 10: Troubleshooting, CLI Diagnostic Tools & Certification Exam",
    order_index: 10,
    duration_minutes: 35,
    difficulty: "INTERMEDIATE",
    tags: ["ping", "tracert", "nslookup", "ipconfig", "Troubleshooting"],
    analogy: "Bottom-Up OSI Troubleshooting: Check cable physical power first before blaming the remote web app.",
    summary: "Command-line diagnostic tools (`ping`, `tracert`, `nslookup`, `ipconfig`), 4-step OSI troubleshooting method, and 10-question master assessment.",
    notes_md: `### 10.1 Command-Line Diagnostic Tools
- **\`ping google.com\`**: ICMP Echo request measuring latency in milliseconds.
- **\`tracert 1.1.1.1\` / \`traceroute\`**: Lists every router hop and delay along the path.
- **\`nslookup wikipedia.org\`**: Queries DNS servers to return matching IP addresses.
- **\`ping 127.0.0.1\`**: Tests local loopback adapter (internal TCP/IP software stack).

### 10.2 Systematic Bottom-Up Troubleshooting
1. **Layer 1 (Physical)**: Cable plugged in? Wi-Fi switch ON? Link lights blinking?
2. **Layer 2 (Data Link)**: Run \`ipconfig\` / \`ip addr\`. Does it show auto-assigned \`169.254.x.x\` (APIPA)? If yes, DHCP failed!
3. **Layer 3 (Network)**: Ping Default Gateway (router \`192.168.1.1\`). If it replies, local LAN is fine; problem is ISP!
4. **Layer 7 (DNS/Apps)**: Ping \`8.8.8.8\`. If IP works but domain fails, DNS server is down!`,
    diagram_type: "network_topology",
    sources: [{ title: "RFC 792: Internet Control Message Protocol (ICMP)", type: "RFC", citationNumber: "RFC 792", url: "https://www.rfc-editor.org/rfc/rfc792" }],
    quizzes: [
      {
        id: "q-net-10",
        question: "Which CLI command-line tool reveals every intermediate router hop along a path to a server?",
        options: ["ipconfig", "ping", "traceroute / tracert", "netstat"],
        correct_option: 2,
        explanation: "tracert (traceroute) displays each hop by incrementing packet TTL values.",
      },
    ],
  },
];

// ==========================================
// 2. LINUX COMMAND QUEST (7 Canonical Levels from PDF)
// ==========================================
export const LINUX_MODULES: CurriculumModule[] = [
  {
    id: "lin-01",
    slug: "map-reading-territory-navigation",
    title: "Level 1: Map Reading & Territory Navigation",
    order_index: 1,
    duration_minutes: 20,
    difficulty: "BEGINNER",
    tags: ["pwd", "ls -la", "cd", "Directory Tree"],
    analogy: "Map reading in an unmapped castle dungeon: never drop payloads until you confirm your exact coordinates.",
    summary: "Move fluidly through the Linux filesystem tree (`pwd`, `ls -la`, `cd`). IVVAB Labs Quest 1: The Hidden Infiltrator.",
    notes_md: `### Level 1: Map Reading & Territory Navigation
In cybersecurity, 90% of security servers and offensive tools run on Linux.
- **\`pwd\` (Print Working Directory)**: Displays current absolute path.
- **\`ls -la\` (List Directory Contents)**: Lists all files including hidden dotfiles (\`.secret\`) with permissions and sizes.
- **\`cd\` (Change Directory)**: Teleports between folders (\`cd ..\`, \`cd ~\`, \`cd /\`).

#### 🎮 IVVAB LABS QUEST 1: The Hidden Infiltrator (+100 EXP)
**Scenario**: An intruder logged into target \`10.100.2.10\` and hid a key in a hidden directory inside \`/tmp\`.
\`\`\`bash
cd /tmp
ls -la
drwxr-xr-x 2 root root 4096 Sep 23 .secret_chamber
cd .secret_chamber && pwd
/tmp/.secret_chamber
\`\`\``,
    diagram_type: "linux_fs",
    sources: [{ title: "POSIX.1-2017 Standard: Utilities", type: "LINUX_DOC", url: "https://pubs.opengroup.org" }],
    quizzes: [
      {
        id: "q-lin-01",
        question: "Which Linux command displays all files including hidden files starting with a dot?",
        options: ["pwd", "ls -la", "cat -h", "find -all"],
        correct_option: 1,
        explanation: "The -a flag in 'ls -la' reveals hidden dotfiles.",
      },
    ],
  },
  {
    id: "lin-02",
    slug: "object-manipulation-file-construction",
    title: "Level 2: Object Manipulation & File Construction",
    order_index: 2,
    duration_minutes: 25,
    difficulty: "BEGINNER",
    tags: ["mkdir", "touch", "cat", "cp", "mv", "rm -rf"],
    analogy: "Constructing and relocating evidence containers safely inside digital forensics lockers.",
    summary: "Construct, copy, relocate, and sanitize files and directories. IVVAB Labs Quest 2: Artifact Extraction.",
    notes_md: `### Level 2: Object Manipulation & File Construction
- **\`mkdir\` & \`touch\`**: Creates new directories and empty files.
- **\`cat\`**: Dumps raw file contents to standard output.
- **\`cp\` & \`mv\`**: Copies or moves/renames evidence files.
- **\`rm -rf\`**: Forcibly deletes files/folders recursively (Immediate and permanent!).

#### 🎮 IVVAB LABS QUEST 2: Artifact Extraction (+150 EXP)
**Scenario**: Intercept \`/tmp/config.raw\`, isolate it into a new folder, and inspect its contents.
\`\`\`bash
mkdir ~/investigation && cp /tmp/config.raw ~/investigation/
cd ~/investigation && mv config.raw target_config.txt
cat target_config.txt
\`\`\``,
    diagram_type: "linux_fs",
    sources: [{ title: "GNU Coreutils Manual", type: "LINUX_DOC", url: "https://www.gnu.org/software/coreutils/" }],
    quizzes: [
      {
        id: "q-lin-02",
        question: "Which command immediately dumps file contents directly to your terminal screen?",
        options: ["cat [file]", "touch [file]", "cp [file]", "cd [file]"],
        correct_option: 0,
        explanation: "The cat (concatenate) utility displays file contents to stdout.",
      },
    ],
  },
  {
    id: "lin-03",
    slug: "access-control-permission-hardening",
    title: "Level 3: Access Control & Permission Hardening",
    order_index: 3,
    duration_minutes: 30,
    difficulty: "BEGINNER",
    tags: ["chmod", "chown", "sudo", "rwx", "Permissions"],
    analogy: "The 3 locks on a castle door: Owner, Group members, and World outsiders.",
    summary: "Linux security model, numeric octal permissions (r=4, w=2, x=1), `chmod`, `chown`, and `sudo`. IVVAB Labs Quest 3.",
    notes_md: `### Level 3: Access Control & Permission Hardening
\`- r w x r - x r - - | User: 7 (4+2+1) | Group: 5 (4+0+1) | World: 4 (4+0+0)\`
- **Read (r = 4)**, **Write (w = 2)**, **Execute (x = 1)**.
- **\`chmod 700 file\`**: Full access for owner only.
- **\`chmod 600 file\`**: Read & write for owner only (secure credentials).
- **\`chown user:group file\`**: Reassigns file owner.

#### 🎮 IVVAB LABS QUEST 3: Hardening Ransomware Target (+200 EXP)
**Scenario**: Web file \`/var/www/html/db_pass.php\` is set to \`777\`. Lock it down to owner only (\`600\`).
\`\`\`bash
sudo chmod 600 /var/www/html/db_pass.php
ls -l /var/www/html/db_pass.php
-rw------- 1 www-data www-data 120 Sep 23 db_pass.php
\`\`\``,
    diagram_type: "linux_perms",
    sources: [{ title: "POSIX File Permissions Specification", type: "LINUX_DOC", url: "https://pubs.opengroup.org" }],
    quizzes: [
      {
        id: "q-lin-03",
        question: "What numeric permission gives Read and Write to Owner only (-rw-------)?",
        options: ["777", "755", "600", "644"],
        correct_option: 2,
        explanation: "Owner read (4) + write (2) = 6; group 0, others 0 -> 600.",
      },
    ],
  },
  {
    id: "lin-04",
    slug: "log-forensics-text-radar",
    title: "Level 4: Log Forensics & Text Radar",
    order_index: 4,
    duration_minutes: 30,
    difficulty: "INTERMEDIATE",
    tags: ["grep", "Pipes |", "tail -f", "find", "Forensics"],
    analogy: "Text radar scanning 1,000,000 log lines to spot 5 attacker footprints.",
    summary: "Searching massive log files with `grep`, pipes `|`, `tail -f`, and SUID binary searches. IVVAB Labs Quest 4.",
    notes_md: `### Level 4: Log Forensics & Text Radar
- **\`grep -i "text" file\`**: Case-insensitive pattern search.
- **\`|\` (Pipe)**: Feeds stdout of one command as stdin to another.
- **\`tail -f /var/log/auth.log\`**: Live real-time monitoring of authentication logs.
- **\`find / -perm -4000 2>/dev/null\`**: Locates SUID privilege escalation binaries.

#### 🎮 IVVAB LABS QUEST 4: Hunting the Brute-Force Attacker (+250 EXP)
**Scenario**: Analyze \`/var/log/auth.log\` to count failed SSH attempts from IP \`192.168.1.105\`.
\`\`\`bash
grep "Failed password" /var/log/auth.log | grep "192.168.1.105" | wc -l
128 # Result: 128 failed attack attempts detected!
\`\`\``,
    diagram_type: "linux_fs",
    sources: [{ title: "NIST SP 800-92: Guide to Computer Security Log Management", type: "NIST", url: "https://csrc.nist.gov" }],
    quizzes: [
      {
        id: "q-lin-04",
        question: "Which Linux pipe command counts how many matching lines grep outputs?",
        options: ["grep ... | wc -l", "grep ... | ls", "grep ... | pwd", "grep ... | chmod"],
        correct_option: 0,
        explanation: "Piping into 'wc -l' counts the total lines generated by grep.",
      },
    ],
  },
  {
    id: "lin-05",
    slug: "network-diagnostics-socket-recon",
    title: "Level 5: Network Diagnostics & Socket Recon",
    order_index: 5,
    duration_minutes: 30,
    difficulty: "INTERMEDIATE",
    tags: ["ip a", "ss -tulpn", "curl", "nc", "Sockets"],
    analogy: "Listening radar detecting open radio frequencies and catching inbound transmissions.",
    summary: "Inspecting network interfaces (`ip a`), listening sockets (`ss -tulpn`), `curl`, and Netcat reverse shells. IVVAB Labs Quest 5.",
    notes_md: `### Level 5: Network Diagnostics & Socket Recon
- **\`ip a\`**: Displays IP interfaces (e.g. IVVAB VPN tunnel \`tun0\`).
- **\`ss -tulpn\`**: Displays active TCP/UDP listening ports and process IDs.
- **\`curl -I http://target\`**: Fetches HTTP response headers.
- **\`nc -lvnp 9001\`**: Netcat listener waiting for incoming reverse shells.

#### 🎮 IVVAB LABS QUEST 5: Catching the Reverse Shell (+300 EXP)
\`\`\`bash
nc -lvnp 9001
Listening on 0.0.0.0 9001 ...
Connection received from 10.100.4.12:45122
whoami
www-data
\`\`\``,
    diagram_type: "network_topology",
    sources: [{ title: "Linux Socket Programming Manual", type: "LINUX_DOC", url: "https://man7.org" }],
    quizzes: [
      {
        id: "q-lin-05",
        question: "Which tool listens on a specific TCP port to catch an inbound reverse shell connection?",
        options: ["Netcat (nc -lvnp)", "cat", "chown", "mkdir"],
        correct_option: 0,
        explanation: "Netcat (nc) configured with -l (listen) and -p (port) catches incoming shells.",
      },
    ],
  },
  {
    id: "lin-06",
    slug: "process-management-warfare",
    title: "Level 6: Process Management & Warfare",
    order_index: 6,
    duration_minutes: 30,
    difficulty: "INTERMEDIATE",
    tags: ["ps aux", "top", "kill -9", "systemctl", "Processes"],
    analogy: "Air Traffic Control tower spotting rogue unauthorized aircraft and ordering immediate shutdown.",
    summary: "Snapshotting processes (`ps aux`), resource monitors (`top`/`htop`), terminating malicious jobs (`kill -9`), and service daemons.",
    notes_md: `### Level 6: Process Management & Warfare
- **\`ps aux | grep [name]\`**: Complete snapshot of all running processes, users, and CPU/memory usage.
- **\`top\` / \`htop\`**: Real-time task dashboard.
- **\`kill -9 [PID]\`**: Forcefully terminates rogue cryptominers or backdoors immediately.
- **\`systemctl status [service]\`**: Inspects and controls background daemon services.`,
    diagram_type: "linux_perms",
    sources: [{ title: "Linux Process Management Architecture", type: "LINUX_DOC", url: "https://man7.org" }],
    quizzes: [
      {
        id: "q-lin-06",
        question: "Which signal forces an immediate and uncatchable termination of a process ID in Linux?",
        options: ["kill -9 [PID]", "kill -1 [PID]", "pause [PID]", "stop [PID]"],
        correct_option: 0,
        explanation: "kill -9 sends SIGKILL, which the Linux kernel handles directly to terminate the process.",
      },
    ],
  },
  {
    id: "lin-07",
    slug: "boss-battle-operation-dark-horizon",
    title: "Level 7: Boss Battle — Operation Dark Horizon",
    order_index: 7,
    duration_minutes: 40,
    difficulty: "ADVANCED",
    tags: ["Final Boss", "Flag Capture", "SSH", "Malware Neutralization"],
    analogy: "Final Mission: Infiltrating the rogue command server, neutralizing malware, and extracting the root cryptographic flag.",
    summary: "Target range `10.100.99.50` (IVVAB Labs Subnet). Connect via SSH, neutralize rogue task, fix permissions, and extract root flag.",
    notes_md: `### Level 7: Boss Battle — Operation Dark Horizon
🎯 **TARGET RANGE: 10.100.99.50 (IVVAB LABS SUBNET)**
**Mission Briefing**: A rogue process on target server \`10.100.99.50\` is actively exfiltrating sensitive data. Connect via SSH, neutralize the rogue task, inspect malware logs, fix permissions, and extract the cryptographic root flag.

\`\`\`bash
# STAGE 1: SSH Access & Rogue Task Reconnaissance
ssh student@10.100.99.50 -p 2222
ps aux | grep -i "exfil"
root 8842 0.5 1.2 /tmp/.data_stealer.sh

# STAGE 2: Process Neutralization
sudo kill -9 8842

# STAGE 3: Artifact Investigation & Flag Capture
cd /tmp && ls -la
-rw------- 1 root root 64 Sep 23 .flag_vault.txt
sudo cat /tmp/.flag_vault.txt
FLAG{IVVAB_LINUX_COMMAND_MASTER_2026}
\`\`\`

🏆 **OFFICIAL CERTIFICATION SEAL**: Students mastering all 7 levels earn the Junior Cyber Defense Operative Certification issued by NISQ Vanguard Cyber Academy.`,
    diagram_type: "soc_pipeline",
    sources: [{ title: "IVVAB LABS Engine Range Benchmark Specification", type: "ACADEMIC", url: "https://ivvab.labs" }],
    quizzes: [
      {
        id: "q-lin-07",
        question: "What is the flag captured upon completing Stage 3 of Operation Dark Horizon?",
        options: [
          "FLAG{IVVAB_LINUX_COMMAND_MASTER_2026}",
          "FLAG{ADMIN_ROOT_ACCESS_GRANTED}",
          "FLAG{DEFAULT_TEST_1234}",
          "FLAG{NETWORK_SOLVED_2026}"
        ],
        correct_option: 0,
        explanation: "The cryptographic flag in the vault is FLAG{IVVAB_LINUX_COMMAND_MASTER_2026}.",
      },
    ],
  },
];

// ==========================================
// 3. CYBERSECURITY FOUNDATIONS (20 Canonical Lessons from PDF)
// ==========================================
export const CYBER_FOUNDATIONS_MODULES: CurriculumModule[] = [
  {
    id: "cf-01",
    slug: "what-is-cybersecurity",
    title: "Lesson 1: What is Cybersecurity? (Asset, Vulnerability, Threat, Risk)",
    order_index: 1,
    duration_minutes: 20,
    difficulty: "BEGINNER",
    tags: ["Asset", "Vulnerability", "Threat", "Risk Equation"],
    analogy: "The Digital Castle Analogy: Locking the front door, closing windows, safe storage, and verifying knocks before opening.",
    summary: "The digital castle analogy, Asset vs Vulnerability vs Threat, and the master Risk Formula (Risk = Threat × Vulnerability × Impact).",
    notes_md: `### Lesson 1: What is Cybersecurity?
Cybersecurity is not magic or rocket science—it is simply the practice of making digital environments safe.
- **Asset**: Anything valuable you want to protect (photos, bank details, passwords).
- **Vulnerability**: A weakness or hole in your protection (an unlocked window or unpatched app).
- **Threat**: Anything that can harm or steal your asset (a burglar or computer malware).

#### 🧮 The Master Risk Formula
$$\\text{Risk} = \\text{Threat} \\times \\text{Vulnerability} \\times \\text{Impact}$$
If there is high threat (active hackers) and high vulnerability (no password), the risk is extreme!`,
    diagram_type: "cia_triad",
    sources: [{ title: "NIST Computer Security Handbook", type: "NIST", url: "https://csrc.nist.gov" }],
    quizzes: [
      {
        id: "q-cf-01",
        question: "If you leave your phone on a café table without a passcode, what is the vulnerability?",
        options: ["The café Wi-Fi", "The lack of a passcode", "Your bank account", "The person sitting nearby"],
        correct_option: 1,
        explanation: "The absence of a passcode lock is the security flaw (vulnerability).",
      },
    ],
  },
  {
    id: "cf-02",
    slug: "cia-triad-core-pillars",
    title: "Lesson 2: The CIA Triad — The 3 Pillars of Defense",
    order_index: 2,
    duration_minutes: 25,
    difficulty: "BEGINNER",
    tags: ["Confidentiality", "Integrity", "Availability"],
    analogy: "Confidentiality = Sealed diary; Integrity = Unaltered grade report; Availability = Electricity staying on 24/7.",
    summary: "Confidentiality (encryption/access), Integrity (hashing/signatures), and Availability (redundancy/load balancers).",
    notes_md: `### Lesson 2: The CIA Triad - The 3 Pillars
Every security decision at top tech companies follows three core pillars:
1. **Confidentiality**: Only authorized people can read data (Sealed personal letter).
2. **Integrity**: Data is accurate and unchanged (Bank balance has no added zeros).
3. **Availability**: Systems work whenever needed (Power stays on 24/7).

#### Real-World Attack Scenarios
- **Medical records leaked online** -> Confidentiality breached. Defense: Encryption.
- **Grades altered in college database** -> Integrity breached. Defense: Cryptographic Hashing.
- **DDoS crashes exam portal during finals** -> Availability breached. Defense: Load Balancers.`,
    diagram_type: "cia_triad",
    sources: [{ title: "FIPS 199: Standards for Security Categorization", type: "NIST", citationNumber: "FIPS 199", url: "https://csrc.nist.gov" }],
    quizzes: [
      {
        id: "q-cf-02",
        question: "A ransomware virus encrypts your laptop files and demands ransom to access them. Which CIA pillar is directly destroyed first?",
        options: ["Confidentiality", "Availability", "Integrity", "Accounting"],
        correct_option: 1,
        explanation: "Ransomware immediately blocks legitimate access to files, destroying Availability first.",
      },
    ],
  },
  {
    id: "cf-03",
    slug: "parkerian-hexad-aaa-framework",
    title: "Lesson 3: Parkerian Hexad & AAA Framework",
    order_index: 3,
    duration_minutes: 25,
    difficulty: "BEGINNER",
    tags: ["Parkerian Hexad", "Possession", "Authenticity", "Utility", "AAA"],
    analogy: "The Airport Boarding Analogy: Showing passport (Authentication), showing boarding pass (Authorization), flight log entry (Accounting).",
    summary: "Expanding beyond CIA with Possession, Authenticity, and Utility. Authentication, Authorization, and Accounting (AAA).",
    notes_md: `### Lesson 3: Parkerian Hexad & AAA Framework
- **Possession**: Having physical control over the drive/hardware.
- **Authenticity**: Proving data or user identity is genuine and not forged.
- **Utility**: Ensuring data is actually readable and usable.

#### The AAA Framework
1. **Authentication**: Verifying claimed identity (Passwords, biometrics).
2. **Authorization**: Determining permitted actions (Role permissions).
3. **Accounting**: Tracking and logging actions (Audit logs).`,
    diagram_type: "cia_triad",
    sources: [{ title: "RFC 2904: AAA Authorization Framework", type: "RFC", citationNumber: "RFC 2904", url: "https://www.rfc-editor.org/rfc/rfc2904" }],
    quizzes: [
      {
        id: "q-cf-03",
        question: "You enter your username and password correctly, but the app says 'Access Denied: Admins Only'. Which phase of AAA succeeded, and which failed?",
        options: [
          "Authentication succeeded; Authorization failed",
          "Authorization succeeded; Authentication failed",
          "Accounting succeeded; Authentication failed",
          "All three failed"
        ],
        correct_option: 0,
        explanation: "Authentication verified your credentials, but Authorization checked your role and denied admin privileges.",
      },
    ],
  },
  {
    id: "cf-04",
    slug: "cyber-attack-lifecycle-kill-chain",
    title: "Lesson 4: The Cyber Attack Lifecycle (Lockheed Martin Kill Chain)",
    order_index: 4,
    duration_minutes: 25,
    difficulty: "BEGINNER",
    tags: ["Kill Chain", "Reconnaissance", "Weaponization", "Delivery", "Exploitation"],
    analogy: "Locksmiths vs Burglars: Burglars need every step to succeed; defenders win by breaking ANY single link.",
    summary: "The 7 stages of the Cyber Kill Chain and the defender's asymmetric advantage.",
    notes_md: `### Lesson 4: The Cyber Attack Lifecycle
1. **Reconnaissance**: Researching target emails and infrastructure.
2. **Weaponization**: Pairing an exploit payload with a decoy invoice PDF.
3. **Delivery**: Sending via phishing email or malicious USB.
4. **Exploitation**: Victim clicks and triggers the flaw.
5. **Installation**: Malware establishes local foothold.
6. **Command & Control (C2)**: Infiltrated laptop phones home for orders.
7. **Actions on Objectives**: Exfiltrating data or deploying ransomware.`,
    diagram_type: "soc_pipeline",
    sources: [{ title: "Lockheed Martin Cyber Kill Chain", type: "NIST", url: "https://www.lockheedmartin.com" }],
    quizzes: [
      {
        id: "q-cf-04",
        question: "An attacker searches Google and LinkedIn for employee emails before launching an attack. Which Kill Chain step is this?",
        options: ["Weaponization", "Reconnaissance", "Exploitation", "Installation"],
        correct_option: 1,
        explanation: "Gathering information prior to launching tools is Reconnaissance.",
      },
    ],
  },
  {
    id: "cf-05",
    slug: "social-engineering-human-hacking",
    title: "Lesson 5: Social Engineering & Human Hacking",
    order_index: 5,
    duration_minutes: 25,
    difficulty: "BEGINNER",
    tags: ["Phishing", "Spear Phishing", "Vishing", "Pretexting"],
    analogy: "Manipulating human trust, fear, or urgency rather than breaking 256-bit mathematical encryption.",
    summary: "Phishing, spear phishing, vishing, smishing, tailgating, and spotting suspicious email red flags.",
    notes_md: `### Lesson 5: Social Engineering & Human Hacking
- **Phishing**: Mass broadcast emails impersonating trusted brands.
- **Spear Phishing**: Hyper-targeted emails utilizing specific victim research.
- **Vishing / Smishing**: Voice call scams and SMS fraud links.
- **Red Flags**: Urgent deadlines, mismatched sender domains, generic greetings, deceptive hyperlinks.`,
    diagram_type: "cia_triad",
    sources: [{ title: "CISA Phishing Guidance", type: "NIST", url: "https://www.cisa.gov" }],
    quizzes: [
      {
        id: "q-cf-05",
        question: "An attacker calls an accountant posing as the CEO demanding an urgent wire transfer. What type of social engineering is this?",
        options: ["Spear Phishing via email", "Vishing (Voice Phishing)", "Tailgating", "Dumpster Diving"],
        correct_option: 1,
        explanation: "Voice phishing conducted over phone calls is known as Vishing.",
      },
    ],
  },
  {
    id: "cf-06",
    slug: "malware-breakdown",
    title: "Lesson 6: Malware Breakdown (Viruses, Worms, Trojans, Ransomware)",
    order_index: 6,
    duration_minutes: 25,
    difficulty: "BEGINNER",
    tags: ["Virus", "Worm", "Trojan", "Ransomware", "Antivirus"],
    analogy: "Biological viruses requiring physical touch vs airborne self-spreading worms.",
    summary: "Differences between viruses, worms, Trojans, ransomware, spyware/keyloggers, and how Antivirus heuristic matching functions.",
    notes_md: `### Lesson 6: Malware Breakdown
- **Virus**: Requires human interaction (opening infected file) to attach and replicate.
- **Worm**: Self-replicating; traverses corporate networks automatically without human clicks.
- **Trojan**: Disguised as legitimate software (free games/cracks) while opening secret backdoors.
- **Ransomware**: Encrypts hard drives and extorts cryptocurrency payments.
- **Antivirus Mechanics**: Signature matching (known hashes) + Heuristic analysis (watching behavioral anomalies).`,
    diagram_type: "cia_triad",
    sources: [{ title: "NIST SP 800-83: Guide to Malware Incident Prevention", type: "NIST", citationNumber: "SP 800-83", url: "https://csrc.nist.gov" }],
    quizzes: [
      {
        id: "q-cf-06",
        question: "What type of malware spreads across an entire corporate network without needing any user to click a file?",
        options: ["Trojan Horse", "Computer Worm", "Adware", "Macro Virus"],
        correct_option: 1,
        explanation: "Worms are self-propagating and spread automatically across vulnerable network ports.",
      },
    ],
  },
  {
    id: "cf-07",
    slug: "passwords-multi-factor-authentication",
    title: "Lesson 7: Passwords & Authentication (MFA 3-Factor Model)",
    order_index: 7,
    duration_minutes: 25,
    difficulty: "BEGINNER",
    tags: ["Brute-Force", "Credential Stuffing", "MFA", "Authenticator Apps"],
    analogy: "The myth of complex passwords: changing 'a' to '@' doesn't stop computers testing millions of combinations per second.",
    summary: "Brute-force vs credential stuffing, and the 3 MFA factor categories (Know, Have, Are).",
    notes_md: `### Lesson 7: Passwords & Authentication
- **Password Attacks**: Brute-force guessing and Credential Stuffing using stolen dumps.
- **Multi-Factor Authentication (MFA)**:
  1. **Something You Know**: Password, PIN, Security Answer.
  2. **Something You Have**: Authenticator App OTP, Hardware FIDO key.
  3. **Something You Are**: Fingerprint, Face ID, Retina biometric scan.
- **NISQ Recommendation**: Prefer Authenticator apps over SMS OTPs (which are vulnerable to SIM-swap attacks).`,
    diagram_type: "cia_triad",
    sources: [{ title: "NIST SP 800-63B: Digital Identity Guidelines", type: "NIST", citationNumber: "SP 800-63B", url: "https://csrc.nist.gov" }],
    quizzes: [
      {
        id: "q-cf-07",
        question: "Logging into an application using a Password AND a Fingerprint scan uses which two MFA factor categories?",
        options: [
          "Something You Know + Something You Are",
          "Something You Have + Something You Know",
          "Something You Have + Something You Are",
          "Two instances of Something You Know"
        ],
        correct_option: 0,
        explanation: "A password is 'Something You Know' and a fingerprint is 'Something You Are'.",
      },
    ],
  },
  {
    id: "cf-08",
    slug: "cryptography-101",
    title: "Lesson 8: Cryptography 101 (Encryption, Hashing, Symmetric vs Asymmetric)",
    order_index: 8,
    duration_minutes: 30,
    difficulty: "INTERMEDIATE",
    tags: ["Encryption", "Hashing", "Symmetric", "Asymmetric", "TLS"],
    analogy: "The Smoothie Blender: You can blend fruits into a smoothie (one-way hash), but you can never un-blend it back into whole fruits.",
    summary: "Encryption vs Hashing vs Encoding, symmetric keys vs asymmetric key pairs (Public/Private), and HTTPS lock mechanics.",
    notes_md: `### Lesson 8: Cryptography 101
- **Encryption**: Two-way cipher scrambled with keys (AES-256).
- **Hashing**: One-way cryptographic fingerprint (SHA-256). Ideal for passwords.
- **Encoding**: Data presentation (Base64) with no security or keys.
- **Symmetric**: Single shared key (Fast, used for bulk data).
- **Asymmetric**: Public key for encryption, Private key for decryption (Used for HTTPS key exchange).`,
    diagram_type: "cia_triad",
    sources: [{ title: "FIPS 197: Advanced Encryption Standard (AES)", type: "NIST", citationNumber: "FIPS 197", url: "https://csrc.nist.gov" }],
    quizzes: [
      {
        id: "q-cf-08",
        question: "Why do secure web applications store hashed passwords instead of encrypted passwords in their database?",
        options: [
          "Hashing saves disk space because hashes are tiny",
          "Hashes are one-way and cannot be decrypted even if the database is leaked",
          "Hashing automatically emails users their passwords",
          "Hashes require no CPU power to compute"
        ],
        correct_option: 1,
        explanation: "Hashes are mathematically one-way, protecting user passwords from reverse decryption if breached.",
      },
    ],
  },
  {
    id: "cf-09",
    slug: "security-operations-center-soc",
    title: "Lesson 9: Security Operations Center (SOC) & SIEM Systems",
    order_index: 9,
    duration_minutes: 30,
    difficulty: "INTERMEDIATE",
    tags: ["SOC", "Tier 1", "Tier 2", "SIEM", "Log Correlation"],
    analogy: "The 24/7 Mission Control Room monitoring radar feeds for suspicious enemy movement.",
    summary: "SOC analyst tier hierarchy (Tier 1 Triage, Tier 2 Incident Response, Tier 3 Threat Hunter) and SIEM log correlation.",
    notes_md: `### Lesson 9: Security Operations Center (SOC)
- **Tier 1 Analyst**: Monitors incoming alerts, filters false positives, escalates true threats.
- **Tier 2 Analyst**: Performs deep incident response and host isolation.
- **Tier 3 Hunter**: Proactively hunts for hidden persistent adversaries.
- **SIEM (Security Information and Event Management)**: Centralizes firewall, Windows security, and network logs to trigger alerts on anomalous behavior (e.g. impossible travel logins).`,
    diagram_type: "soc_pipeline",
    sources: [{ title: "MITRE ATT&CK for SOC Operations", type: "MITRE", url: "https://attack.mitre.org" }],
    quizzes: [
      {
        id: "q-cf-09",
        question: "Which entry-level SOC role is primarily responsible for triaging incoming SIEM alerts and eliminating false alarms?",
        options: ["Tier 1 SOC Analyst", "Tier 3 Threat Hunter", "Chief Information Security Officer", "Lead Cryptographer"],
        correct_option: 0,
        explanation: "Tier 1 analysts conduct the initial alert triage and eliminate false alarms.",
      },
    ],
  },
  {
    id: "cf-10",
    slug: "incident-response-lifecycle",
    title: "Lesson 10: Incident Response Lifecycle (NIST 6-Step Plan)",
    order_index: 10,
    duration_minutes: 30,
    difficulty: "INTERMEDIATE",
    tags: ["NIST", "Preparation", "Containment", "Eradication", "Recovery"],
    analogy: "The Digital Firefighters: Disciplined 6-step protocol to isolate and extinguish fires safely without spreading.",
    summary: "The 6 phases of NIST incident response: Preparation, Identification, Containment, Eradication, Recovery, and Lessons Learned.",
    notes_md: `### Lesson 10: Incident Response Lifecycle (NIST)
1. **Preparation**: Building playbooks, sensors, and response kits.
2. **Identification**: Detecting anomalies and analyzing log evidence.
3. **Containment**: Isolating compromised laptops from Wi-Fi/LAN to stop lateral spread.
4. **Eradication**: Deleting attacker backdoors and patching vulnerabilities.
5. **Recovery**: Restoring clean operations from trusted backups.
6. **Lessons Learned**: Writing reports and updating defenses so attacks cannot repeat.`,
    diagram_type: "soc_pipeline",
    sources: [{ title: "NIST SP 800-61 Rev 2: Computer Security Incident Handling Guide", type: "NIST", citationNumber: "SP 800-61", url: "https://csrc.nist.gov" }],
    quizzes: [
      {
        id: "q-cf-10",
        question: "Unplugging an infected computer's Ethernet cable to prevent malware spreading belongs to which step?",
        options: ["Preparation", "Containment", "Recovery", "Lessons Learned"],
        correct_option: 1,
        explanation: "Physically or logically isolating an infected system is part of Containment.",
      },
    ],
  },
];

// ==========================================
// 4. MASTER 52-LESSON CURRICULUM (Overview from PDF)
// ==========================================
export const MASTER_52_MODULES: CurriculumModule[] = [
  ...CYBER_FOUNDATIONS_MODULES.slice(0, 4),
  ...NETWORKING_MODULES.slice(0, 3),
  ...LINUX_MODULES.slice(0, 3),
];

// ==========================================
// ALL AVAILABLE COURSES
// ==========================================
export const AVAILABLE_COURSES: CurriculumCourse[] = [
  {
    id: "c-cyber-found",
    slug: "cybersecurity-foundations",
    title: "Cybersecurity Foundations",
    level: "Beginner",
    tier: "free",
    duration_hours: 8,
    summary: "Complete 20-lesson foundational curriculum from fundamentals to defender mindset by Founder Ashok Vallabhuni.",
    description: "The official gateway course for all security defenders. Master foundational threat principles, the CIA Triad, Parkerian Hexad, AAA framework, Lockheed Martin kill chain, password hygiene, cryptography, SOC triage, and incident response.",
    badge_slug: "cybersecurity-foundations-badge",
    badge_name: "Cybersecurity Foundations Badge",
    skills: ["CIA Triad & Parkerian Hexad", "Kill Chain Analysis", "Social Engineering Triage", "MFA & Authentication", "Cryptography Basics", "SOC & Incident Response"],
    modules: CYBER_FOUNDATIONS_MODULES,
  },
  {
    id: "c-net-fund",
    slug: "networking-fundamentals",
    title: "Networking Fundamentals",
    level: "Beginner to Intermediate",
    tier: "free",
    duration_hours: 10,
    summary: "A complete 10-lesson guide (25 Pages) to topologies, media, hardware, IP/subnets, packets, OSI/TCP-IP, ports, DNS/HTTPS, firewalls, and CLI diagnostics.",
    description: "Understand how computers connect, speak, route, and protect data—explained so simply a beginner can grasp it, yet rigorous enough for junior cyber defenders. Includes command-line labs with ping, tracert, nslookup, and Wireshark PCAPs.",
    badge_slug: "network-navigator",
    badge_name: "Network Navigator Badge",
    skills: ["Network Topologies", "Physical Media & MAC Addressing", "Hubs vs Switches (CAM)", "IPv4 / IPv6 Subnetting", "TCP 3-Way Handshake", "DNS & Application Protocols", "CLI Diagnostics"],
    modules: NETWORKING_MODULES,
  },
  {
    id: "c-lin-quest",
    slug: "linux-command-quest",
    title: "Linux Command Quest",
    level: "Intermediate",
    tier: "free",
    duration_hours: 6,
    summary: "From terminal novice to cyber operative: 7 skill zones, 5 IVVAB Labs quests, and Level 7 Boss Battle Operation Dark Horizon.",
    description: "In cybersecurity, 90% of security servers and offensive tools run on Linux. Clear 6 practical skill zones (Navigation, File Construction, Permissions, Log Forensics, Sockets, Process Warfare) and defeat the final boss battle by capturing root flags.",
    badge_slug: "linux-foundations",
    badge_name: "Linux Foundations Badge",
    skills: ["Filesystem Navigation (pwd/ls/cd)", "Object Manipulation", "chmod / chown Permissions", "Log Forensics (grep/pipes)", "Netcat Listeners", "Process Warfare (kill/top)", "Boss Flag Capture"],
    modules: LINUX_MODULES,
  },
  {
    id: "c-cyber-master",
    slug: "cyber-security-master-curriculum",
    title: "Cyber Security Master Curriculum",
    level: "Comprehensive",
    tier: "free",
    duration_hours: 24,
    summary: "150-page master handbook curriculum covering 52 sequential lessons from Reconnaissance & OSINT to Enterprise Active Directory.",
    description: "The complete 52-lesson beginner-to-analyst roadmap. Spanning 4 modules (Module 1: Recon & OSINT, Module 2: System Exploitation, Module 3: Web Security, Module 4: Active Directory) powered by the IVVAB Labs engine and authorized by Chief Architect Ashok Vallabhuni.",
    badge_slug: "soc-analyst-foundations-badge",
    badge_name: "Junior Cyber Defense Operative",
    skills: ["OSINT & Google Dorking", "Nmap Port Scanning", "Metasploit Exploitation", "SQL Injection & XSS", "Active Directory & Kerberoasting", "Privilege Escalation", "Capstone Enterprise Exam"],
    modules: MASTER_52_MODULES,
  },
];

// ==========================================
// LOCKED COURSES (Coming Soon)
// ==========================================
export const LOCKED_COURSES = [
  { id: "locked-01", slug: "ethical-hacking", title: "Ethical Hacking", category: "Offensive", duration: "16 Hours", difficulty: "Intermediate" },
  { id: "locked-02", slug: "penetration-testing", title: "Penetration Testing", category: "Offensive", duration: "20 Hours", difficulty: "Advanced" },
  { id: "locked-03", slug: "web-security", title: "Web Security", category: "AppSec", duration: "14 Hours", difficulty: "Intermediate" },
  { id: "locked-04", slug: "owasp-security", title: "OWASP Security", category: "AppSec", duration: "12 Hours", difficulty: "Intermediate" },
  { id: "locked-05", slug: "soc-analyst", title: "SOC Analyst", category: "Defensive", duration: "22 Hours", difficulty: "Intermediate" },
  { id: "locked-06", slug: "digital-forensics", title: "Digital Forensics", category: "DFIR", duration: "18 Hours", difficulty: "Advanced" },
  { id: "locked-07", slug: "threat-intelligence", title: "Threat Intelligence", category: "Intel", duration: "14 Hours", difficulty: "Intermediate" },
  { id: "locked-08", slug: "malware-analysis", title: "Malware Analysis", category: "Reverse Eng", duration: "24 Hours", difficulty: "Advanced" },
  { id: "locked-09", slug: "cloud-security", title: "Cloud Security", category: "Cloud", duration: "16 Hours", difficulty: "Intermediate" },
  { id: "locked-10", slug: "active-directory-security", title: "Active Directory Security", category: "Enterprise", duration: "18 Hours", difficulty: "Advanced" },
  { id: "locked-11", slug: "osint", title: "OSINT (Open Source Intelligence)", category: "Intel", duration: "10 Hours", difficulty: "Beginner" },
  { id: "locked-12", slug: "api-security", title: "API Security", category: "AppSec", duration: "12 Hours", difficulty: "Intermediate" },
  { id: "locked-13", slug: "ai-security", title: "AI Security & LLM Defense", category: "AI Safety", duration: "15 Hours", difficulty: "Advanced" },
  { id: "locked-14", slug: "incident-response", title: "Incident Response", category: "DFIR", duration: "16 Hours", difficulty: "Intermediate" },
  { id: "locked-15", slug: "bug-bounty", title: "Bug Bounty Mastery", category: "Bounty", duration: "20 Hours", difficulty: "Advanced" },
];

export const COURSES_CATALOG: CurriculumCourse[] = AVAILABLE_COURSES;
