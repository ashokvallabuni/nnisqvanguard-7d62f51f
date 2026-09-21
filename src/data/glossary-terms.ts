export interface GlossaryTerm {
  term: string;
  slug: string;
  category: "Networking" | "Defensive Ops" | "Threat Intel" | "Linux" | "Cryptography" | "Web Security";
  definition: string;
  technicalDetails: string;
  securityImpact: string;
  relatedLessonSlug?: string;
  relatedDatasetSlug?: string;
  relatedLabSlug?: string;
  rfcOrStandard?: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "TCP (Transmission Control Protocol)",
    slug: "tcp",
    category: "Networking",
    definition: "A connection-oriented, reliable transport layer protocol that provides ordered and error-checked delivery of a stream of octets between applications running on hosts communicating via an IP network.",
    technicalDetails: "Operates at Layer 4 of the OSI model. Uses a 3-way handshake (SYN, SYN-ACK, ACK) to establish state, sequence numbers for in-order reassembly, and windowing for flow control.",
    securityImpact: "Vulnerable to SYN Flood DDoS attacks, TCP RST packet injection, and TCP session hijacking if sequence numbers are predictable.",
    relatedLessonSlug: "tcp-protocol-and-handshake",
    relatedDatasetSlug: "suricata-nids-c2-beaconing",
    relatedLabSlug: "suricata-network-threat-hunting",
    rfcOrStandard: "RFC 9293",
  },
  {
    term: "CIDR (Classless Inter-Domain Routing)",
    slug: "cidr",
    category: "Networking",
    definition: "A method for allocating IP addresses and for IP routing that replaced legacy class-based network schemes, using variable-length subnet masking (VLSM).",
    technicalDetails: "Represented as an IP address followed by a slash and prefix length (e.g., 192.168.1.0/24). The prefix indicates the number of leading 1-bits in the subnet mask.",
    securityImpact: "Misconfigured CIDR blocks in firewall rules can accidentally expose internal subnets to the public internet or create routing loops.",
    relatedLessonSlug: "subnetting-and-cidr",
    rfcOrStandard: "RFC 4632",
  },
  {
    term: "CIA Triad",
    slug: "cia-triad",
    category: "Defensive Ops",
    definition: "A foundational information security model comprising Confidentiality, Integrity, and Availability that guides policies and controls for data security.",
    technicalDetails: "Confidentiality restricts unauthorized viewing; Integrity ensures data cannot be modified in an unauthorized manner; Availability guarantees authorized access upon demand.",
    securityImpact: "Every cyber attack breaches at least one pillar (e.g. Ransomware impacts Availability & Confidentiality; Tampering impacts Integrity).",
    relatedLessonSlug: "what-is-networking",
    rfcOrStandard: "NIST SP 800-53",
  },
  {
    term: "ARP (Address Resolution Protocol)",
    slug: "arp",
    category: "Networking",
    definition: "A Layer 2 protocol used to map an IP network address (IPv4) to a physical machine address (MAC address) on a local area network.",
    technicalDetails: "Sends an ARP broadcast request ('Who has IP X?') and receives a unicast ARP reply containing the MAC address, cached in the local ARP table.",
    securityImpact: "Lacks cryptographic authentication. Adversaries perform ARP Spoofing / Cache Poisoning to execute Man-in-the-Middle (MitM) attacks.",
    relatedLessonSlug: "what-is-networking",
    relatedDatasetSlug: "linux-auth-ssh-bruteforce",
    rfcOrStandard: "RFC 826",
  },
  {
    term: "SUID (Set Owner User ID)",
    slug: "suid",
    category: "Linux",
    definition: "A special Linux file permission flag (numeric 4000) that allows a user to execute a binary with the file owner's privileges rather than their own.",
    technicalDetails: "Appears as an 's' in the owner execute position (e.g. -rwsr-xr-x). Commonly used for legitimate binaries like /bin/passwd and /usr/bin/sudo.",
    securityImpact: "Custom or vulnerable SUID root binaries are a prime vector for local privilege escalation (GTFOBins).",
    relatedLessonSlug: "linux-filesystem-and-permissions",
    relatedLabSlug: "linux-ssh-brute-force-investigation",
    rfcOrStandard: "POSIX.1-2017",
  },
  {
    term: "SYN Flood",
    slug: "syn-flood",
    category: "Networking",
    definition: "A denial-of-service attack where an attacker sends a succession of SYN requests to a target system without replying with ACK, consuming resources.",
    technicalDetails: "Fills the server's SYN backlog queue (embryonic connections table) until legitimate connection attempts are dropped.",
    securityImpact: "Causes complete service outage. Mitigated via SYN Cookies (RFC 4987) and perimeter firewall rate limiting.",
    relatedLessonSlug: "tcp-protocol-and-handshake",
    relatedDatasetSlug: "suricata-nids-c2-beaconing",
    relatedLabSlug: "suricata-network-threat-hunting",
    rfcOrStandard: "MITRE ATT&CK T1498",
  },
  {
    term: "IOC (Indicator of Compromise)",
    slug: "ioc",
    category: "Threat Intel",
    definition: "Forensic evidence of potential intrusion on a host system or network, such as suspicious file hashes, malicious IP addresses, or registry keys.",
    technicalDetails: "Categorized under David Bianco's Pyramid of Pain (Hash values, IP addresses, Domain names, Host/Network artifacts, Tools, and TTPs).",
    securityImpact: "Used by SIEM and EDR platforms to automatically match and alert on active adversary campaigns.",
    relatedDatasetSlug: "ransomware-registry-persistence",
    relatedLabSlug: "ransomware-registry-persistence-triage",
  },
];
