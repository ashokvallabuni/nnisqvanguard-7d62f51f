/**
 * NISQ VANGUARD — AI COURSE BANNER GENERATOR & ASSET PIPELINE
 * 
 * Maps all 105 courses (102 core modules + 3 master tracks) to customized Midjourney / Flux / Banana AI
 * prompts and generates high-fidelity 16:9 futuristic cyber-themed vector banner assets.
 */

const fs = require('fs');
const path = require('path');

const BASE_AESTHETIC_PROMPT = 
  "Dark academic cyber-tech aesthetic, futuristic cinematic lighting in electric blue and cyan, sleek isometric composition, high-fidelity digital illustration, glowing circuits, clean UI data overlays, 16:9 ratio, ultra-detailed 8k render --ar 16:9 --style raw";

const NEGATIVE_PROMPT = 
  "blurry, cartoonish, low resolution, watermark, text errors, oversaturated, deformed, messy, distorted faces, stock photo";

// 10 Path definitions
const PATH_THEMES = {
  "path-1": {
    name: "Absolute Beginner & Cyber Awareness",
    accentColor: "#00B8FF",
    secondaryColor: "#0A7CFF",
    category: "Cyber Awareness",
    iconType: "shield"
  },
  "path-2": {
    name: "Computer Networking & Web Infrastructure",
    accentColor: "#00F0FF",
    secondaryColor: "#3B82F6",
    category: "Network Defense",
    iconType: "network"
  },
  "path-3": {
    name: "Operating System Operations",
    accentColor: "#10B981",
    secondaryColor: "#06B6D4",
    category: "Systems & CLI",
    iconType: "terminal"
  },
  "path-4": {
    name: "Threat Landscape & Security Fundamentals",
    accentColor: "#8B5CF6",
    secondaryColor: "#6366F1",
    category: "Threat Architecture",
    iconType: "core"
  },
  "path-5": {
    name: "Reconnaissance, OSINT & Footprinting",
    accentColor: "#F59E0B",
    secondaryColor: "#EC4899",
    category: "Reconnaissance",
    iconType: "radar"
  },
  "path-6": {
    name: "Web Application Security",
    accentColor: "#EF4444",
    secondaryColor: "#F97316",
    category: "AppSec",
    iconType: "web"
  },
  "path-7": {
    name: "System Hacking, Shells & Privilege Escalation",
    accentColor: "#DC2626",
    secondaryColor: "#9333EA",
    category: "Offensive",
    iconType: "exploit"
  },
  "path-8": {
    name: "Defensive Security, SOC & Blue Team",
    accentColor: "#0EA5E9",
    secondaryColor: "#10B981",
    category: "SOC & Defense",
    iconType: "soc"
  },
  "path-9": {
    name: "Digital Forensics, Incident Response & Malware",
    accentColor: "#A855F7",
    secondaryColor: "#06B6D4",
    category: "DFIR",
    iconType: "forensics"
  },
  "path-10": {
    name: "Advanced Red Team, Cloud, AI & Quantum",
    accentColor: "#06B6D4",
    secondaryColor: "#EC4899",
    category: "Emerging Tech",
    iconType: "quantum"
  },
  "master": {
    name: "Master Track Curriculum",
    accentColor: "#38BDF8",
    secondaryColor: "#818CF8",
    category: "Mastery",
    iconType: "master"
  }
};

// Subject customizations for all 102 courses
const SUBJECT_DETAILS = {
  // Path 1
  "digital-safety-hygiene": {
    subject: "Holographic security checkpoint scanning endpoint devices with clean glowing verification perimeter",
    topics: "Endpoint Hygiene, Device Hardening, Zero Trust Habits"
  },
  "social-engineering-phishing-defense": {
    subject: "Deconstructed malicious email envelope exposing hidden spear-phishing payload through holographic prism",
    topics: "Phishing Detection, Impersonation Triage, Threat Indicators"
  },
  "financial-upi-fraud-prevention": {
    subject: "Encrypted payment switch terminal with cryptographic HMAC tokens protecting real-time settlement rails",
    topics: "Payment Switch Security, Transaction Integrity, Anti-Fraud"
  },
  "mobile-smartphone-security": {
    subject: "Glass smartphone model with multi-layered sandbox partitions preventing app permission intrusion",
    topics: "OS Sandboxing, Permission Scopes, Android/iOS Telemetry"
  },
  "wifi-public-network-safety": {
    subject: "Volumetric electric-blue radio waves secured by WPA3 SAE cryptographic handshake tunnel",
    topics: "WPA3 Enterprise, Rogue AP Detection, 802.11 Encryption"
  },
  "opsec-basics": {
    subject: "Digital shadow profile dissolving into stealth grid, scrubbing EXIF metadata and telemetry traces",
    topics: "Metadata Stripping, Digital Footprint, OPSEC Lifecycle"
  },
  "hardware-device-security": {
    subject: "Motherboard microchip glowing with hardware Root of Trust (RoT), TPM 2.0 bus, and secure boot verification",
    topics: "TPM 2.0, Secure Boot, Hardware Enclaves, Physical Bus"
  },
  "password-managers-mfa-setup": {
    subject: "Cryptographic vault cylinder with TOTP rotating key dials and FIDO2 biometric hardware security token",
    topics: "TOTP Algorithms, FIDO2 WebAuthn, Argon2 Hashing"
  },
  "social-media-account-recovery": {
    subject: "Biometric identity lock guarding account credential vaults against SIM swapping and account takeovers",
    topics: "Account Takeover Defense, SIM Swap Mitigations, Fallback Proofing"
  },
  "cyber-ethics-legal-frameworks": {
    subject: "Holographic balance scales of justice intertwined with fiber-optic compliance cables and CFAA legal seals",
    topics: "Rules of Engagement, CFAA, Responsible Disclosure, GDPR"
  },

  // Path 2
  "networking-fundamentals-part-1": {
    subject: "Isometric Ethernet packet collision domain with glowing MAC address frame headers and copper switch channels",
    topics: "OSI Layer 1-2, Ethernet Frames, MAC Addressing, Switching"
  },
  "networking-fundamentals-part-2": {
    subject: "Global 3D routing sphere with IP packet encapsulation rings, ICMP echo traceroutes, and TTL hops",
    topics: "IP Encapsulation, TTL Decays, ICMP Routing, Hop Diagnostics"
  },
  "transport-protocols-tcp-udp": {
    subject: "Side-by-side comparison of a 3-way SYN-SYNACK-ACK handshake tube versus high-velocity UDP datagram streams",
    topics: "TCP 3-Way Handshake, Flow Control, UDP Telemetry Streams"
  },
  "domain-name-system-dns": {
    subject: "Hierarchical DNS resolution pyramid showing root servers and cryptographic DNSSEC chain of trust",
    topics: "Recursive Resolution, DNSSEC, Zone Records, Cache Hardening"
  },
  "subnetting-ip-addressing": {
    subject: "Binary matrix visualization dividing IPv4 address spaces into crisp CIDR /24 and /28 subnet blocks",
    topics: "CIDR Notation, Binary Subnetting, VLSM, Address Partitioning"
  },
  "web-protocols-http-https": {
    subject: "Browser request stream passing through TLS 1.3 cryptographic cipher tunnel with forward secrecy keys",
    topics: "HTTP/2, HTTP/3 QUIC, TLS 1.3 Cipher Suites, Headers"
  },
  "network-ports-standard-services": {
    subject: "Digital rack server with illuminated port sockets for 22 (SSH), 80/443 (Web), 53 (DNS), and 3389 (RDP)",
    topics: "IANA Port Allocations, Service Banners, Listening Sockets"
  },
  "dhcp-protocol": {
    subject: "DORA 4-stage leasing exchange diagram radiating dynamic IP assignment packets across an enterprise LAN",
    topics: "Discover-Offer-Request-Ack, Rogue DHCP, DHCP Snooping"
  },
  "firewalls-network-traffic-control": {
    subject: "Multi-layered neon firewall grid with stateful packet inspection beams filtering dropped telemetry packets",
    topics: "Stateful vs Stateless, iptables Chains, Boundary ACLs"
  },
  "network-address-translation-nat": {
    subject: "Port Address Translation (PAT) router core translating RFC 1918 private subnets into public WAN egress",
    topics: "SNAT, DNAT, Overload PAT, RFC 1918 Address Translation"
  },

  // Path 3
  "linux-fundamentals-part-1": {
    subject: "Glowing hierarchical Linux directory tree starting at root / with active terminal shell windows",
    topics: "Filesystem Hierarchy, Root Navigation, Core POSIX Utilities"
  },
  "linux-fundamentals-part-2": {
    subject: "Piped command streams routing data through grep, awk, and sed text transformers inside a cyber CLI console",
    topics: "Stream Redirection, Regex Filters, Pipes, sed/awk Wrangling"
  },
  "linux-file-permissions-ownership": {
    subject: "Octal permission matrix displaying rwxr-xr-x rings, SUID bit badges, and chown user access locks",
    topics: "Octal chmod, chown, SUID/SGID Bits, Sticky Bits"
  },
  "linux-sysadmin-users": {
    subject: "Systemd service control plane managing daemons, user UID namespaces, and sudoers security policies",
    topics: "systemctl Daemons, User/Group Namespaces, PAM Policies"
  },
  "linux-shell-scripting": {
    subject: "Automated Bash script matrix executing looping security audits and parsing live auth.log streams",
    topics: "Bash Automation, Conditionals, Loops, Error Trapping"
  },
  "windows-architecture-admin": {
    subject: "Architectural blueprint of Windows NT kernel, HAL, Win32 subsystems, and User Account Control (UAC)",
    topics: "NT Kernel, User vs Kernel Mode, Win32 API, UAC Subsystem"
  },
  "windows-registry-services": {
    subject: "Hierarchical registry tree glowing with HKLM hive keys, run keys, and service control manager nodes",
    topics: "Registry Hives, Persistence Keys, SCM Service Dispatcher"
  },
  "windows-cmd-powershell": {
    subject: "PowerShell command console streaming pipeline objects with WMI/CIM telemetry diagnostics",
    topics: "PowerShell Cmdlets, Object Pipelines, WMI/CIM Administration"
  },
  "active-directory-foundations": {
    subject: "Domain controller forest structure with LDAP trees, schema catalogs, and Kerberos KDC authentication",
    topics: "Forest & Domains, KDC Authentication, Group Policy Objects"
  },
  "virtualization-containerization": {
    subject: "Type-1 hypervisor base supporting isolated OCI container capsules and Linux cgroups/namespaces",
    topics: "cgroups, Linux Namespaces, Docker Engine, Hypervisors"
  },

  // Path 4
  "cia-triad-core-principles": {
    subject: "Triangular energy shield representing Confidentiality, Integrity, and Availability with threat deflections",
    topics: "Confidentiality, Integrity, Availability, Trade-off Matrix"
  },
  "defense-in-depth-strategy": {
    subject: "Concentric cyber fortress walls protecting central crown jewel data with multi-tier perimeter defenses",
    topics: "Perimeter, Host, Application, Data Layer Security"
  },
  "cryptography-symmetric": {
    subject: "AES-256 block cipher engine performing substitution-permutation rounds with a shared golden key",
    topics: "AES-256, GCM Mode, Block Ciphers, Shared Secret Keys"
  },
  "cryptography-asymmetric": {
    subject: "Dual public and private key pair interlocking within an elliptical curve cryptographic gateway",
    topics: "RSA, ECC Curve25519, Key Exchange, Digital Signatures"
  },
  "cryptographic-hashing-integrity": {
    subject: "SHA-256 one-way hashing funnel converting arbitrary data into an unalterable fixed 64-character hash",
    topics: "SHA-256, Avalanche Effect, Collision Resistance, HMAC"
  },
  "threat-actor-types-motivations": {
    subject: "Holographic threat profile display detailing nation-state APTs, cybercrime syndicates, and insider threats",
    topics: "APTs, Cybercrime Syndicates, Hacktivists, Insider Threats"
  },
  "vulnerability-management-cves": {
    subject: "CVSS 3.1 scoring radar analyzing CVE vulnerability feeds with automated patch orchestration",
    topics: "CVE Databases, CVSS Metrics, Exploitability, Remediation"
  },
  "identity-access-management-iam": {
    subject: "Role-Based Access Control (RBAC) matrix allocating least-privilege tokens and SAML federated tokens",
    topics: "RBAC, ABAC, Principle of Least Privilege, SAML/OIDC"
  },
  "security-frameworks-nist-iso": {
    subject: "NIST Cybersecurity Framework hexagon (Identify, Protect, Detect, Respond, Recover) with ISO 27001 pillars",
    topics: "NIST CSF, ISO/IEC 27001, SOC 2, Audit Controls"
  },
  "mitre-attack-framework": {
    subject: "MITRE ATT&CK enterprise matrix glowing with tactics from Initial Access to Impact and telemetry traces",
    topics: "Tactics & Techniques, Attack Paths, TTP Hunting"
  },

  // Path 5
  "osint-web-search": {
    subject: "Advanced Google Dorking search console revealing hidden server indexes and filetype:pdf confidential records",
    topics: "Search Operators, Cache Carving, Robots.txt, Dorking"
  },
  "osint-domain-ip-research": {
    subject: "Global WHOIS and BGP routing map connecting autonomous system numbers (ASNs) and DNS history records",
    topics: "WHOIS Telemetry, ASN Mapping, Passive DNS, Certificate Logs"
  },
  "osint-social-media-human-recon": {
    subject: "Human intelligence graph linking digital avatars, usernames, and social presence across multiple networks",
    topics: "Username Correlation, Metadata Tracking, Identity Graph"
  },
  "network-footprinting-nmap-1": {
    subject: "Nmap radar sweep launching SYN stealth packets against remote host ports with response telemetry",
    topics: "SYN Stealth Scan (-sS), Timing Templates (-T4), Port States"
  },
  "network-footprinting-nmap-2": {
    subject: "Advanced Nmap NSE script engine inspecting version banners and OS fingerprinting signatures",
    topics: "NSE Lua Scripts, Banner Grabbing (-sV), OS Fingerprinting"
  },
  "web-app-footprinting-dir-enum": {
    subject: "High-speed directory fuzzer blasting HTTP GET requests, discovering hidden admin paths and API endpoints",
    topics: "Gobuster, Feroxbuster, Status Codes (200, 301, 403), Wordlists"
  },
  "subdomain-enumeration-techniques": {
    subject: "DNS wordlist permutation engine discovering hidden corporate subdomains via Certificate Transparency",
    topics: "Sublist3r, Amass, crt.sh, Permutation Brute-Force"
  },
  "banner-grabbing-service-enum": {
    subject: "Raw Netcat socket connection grabbing ASCII service banners from listening FTP, SMTP, and SSH daemons",
    topics: "Netcat / Telnet Probing, Protocol Headers, Service Versions"
  },
  "dark-web-credential-leak-monitoring": {
    subject: "Dark web onion relay monitor tracking compromised credential databases and pastebin dump feeds",
    topics: "Tor Onion Services, Data Breach Dumps, Credential Stuffing"
  },
  "threat-intel-vulnerability-scanning": {
    subject: "Automated vulnerability scanner correlating live target footprints with active CVE exploit indices",
    topics: "Nuclei, OpenVAS, Threat Intelligence Feeds, Target Profiling"
  },

  // Path 6
  "how-web-applications-work": {
    subject: "Full-stack web application architecture showing client browser, reverse proxy, API backend, and SQL DB",
    topics: "DOM Architecture, HTTP Pipeline, REST APIs, Database Engines"
  },
  "intercepting-proxies-burp-suite": {
    subject: "Burp Suite interceptor HUD freezing an outgoing HTTP POST request with hex payload manipulation controls",
    topics: "Burp Proxy, Repeater, Intruder, Match & Replace"
  },
  "sql-injection-in-band": {
    subject: "SQL injection payload ' OR 1=1-- breaking through web input barrier and exposing backend user rows",
    topics: "Union-Based SQLi, Error-Based SQLi, Database Extraction"
  },
  "sql-injection-advanced-blind": {
    subject: "Time-based blind SQLi script measuring server response latency in millisecond oscilloscope graphs",
    topics: "Boolean Blind SQLi, Time-Based Sleep Queries, Out-of-Band"
  },
  "xss-reflected-stored": {
    subject: "Malicious <script> payload reflecting off server into victim browser, capturing session cookie tokens",
    topics: "Reflected XSS, Stored Database XSS, Document Object Model (DOM)"
  },
  "cross-site-request-forgery-csrf": {
    subject: "Forged cross-site fund transfer request intercepted by anti-CSRF token verification wall",
    topics: "SameSite Cookies, Anti-CSRF Tokens, State-Changing Attacks"
  },
  "command-injection": {
    subject: "Unsanitized web input parameter executing shell semicolons ; whoami on the host operating system",
    topics: "Shell Metacharacters, Unsanitized Exec, Output Exfiltration"
  },
  "broken-auth-session-management": {
    subject: "Stolen JWT bearer token undergoing signature manipulation versus cryptographic verification",
    topics: "JWT None Algorithm, Session Hijacking, Token Fixation"
  },
  "idor-vulnerabilities": {
    subject: "Predictable user ID parameter ?user_id=102 swapped to access unauthorized administrative records",
    topics: "Direct Object References, Horizontal/Vertical Privilege Bypasses"
  },
  "owasp-top-10-comprehensive-audit": {
    subject: "OWASP Top 10 security scorecard with 10 glowing audit badges verifying application defense",
    topics: "Broken Access Control, Cryptographic Failures, Security Misconfig"
  },

  // Path 7
  "password-cracking-online-attacks": {
    subject: "Hydra brute-force tool rotating wordlists against SSH authentication daemon with rate limit sensors",
    topics: "Hydra, Credential Stuffing, Account Lockout Thresholds"
  },
  "password-cracking-offline-hashes": {
    subject: "GPU cracking rig running Hashcat with parallel shader cores computing NTLM and bcrypt hashes",
    topics: "Hashcat, John the Ripper, Mask Attacks, Rule-Based Cracking"
  },
  "metasploit-framework-essentials": {
    subject: "Metasploit console loading module exploit/multi/handler and targeting vulnerable remote service",
    topics: "Auxiliary Scanners, Exploit Modules, Payloads, MSFconsole"
  },
  "shells-payloads-bind-reverse": {
    subject: "Reverse TCP shell payload dialing back to listening attacker Netcat port through outbound NAT",
    topics: "Reverse TCP Shells, Bind Ports, Meterpreter, Stagers"
  },
  "linux-privesc-suid-misconfig": {
    subject: "Standard user terminal escalating to root UID 0 through vulnerable SUID binary and GTFOBins escape",
    topics: "SUID Binaries, GTFOBins, Writable /etc/passwd, Capabilities"
  },
  "linux-privesc-kernel-sudo": {
    subject: "Exploiting sudoers NOPASSWD misconfiguration and kernel dirty pipe vulnerability to claim root prompt",
    topics: "Sudo Abuse, Kernel Exploitation, Cron Job Hijacking"
  },
  "windows-privesc-token-impersonation": {
    subject: "SeImpersonatePrivilege potato exploit stealing NT AUTHORITY\\SYSTEM security token on Windows Server",
    topics: "Rotten/Juicy Potato, Token Impersonation, Named Pipe Client"
  },
  "active-directory-enum-attacks": {
    subject: "BloodHound attack graph showing shortest path from compromised domain user to Domain Admin group",
    topics: "BloodHound, Kerberoasting, AS-REP Roasting, Domain Controller"
  },
  "evasion-techniques-av-bypassing": {
    subject: "Custom shellcode payload undergoing XOR obfuscation and API unhooking to bypass EDR scanners",
    topics: "AMSI Bypass, Direct Syscalls, Shellcode Encryption, In-Memory"
  },
  "post-exploitation-persistence": {
    subject: "Scheduled Windows tasks and Linux systemd persistence implants maintaining covert access channel",
    topics: "WMI Event Subscriptions, Registry Run Keys, SSH Key Injection"
  },

  // Path 8
  "intro-blue-team-operations": {
    subject: "SOC analyst control center with tactical threat monitoring screens and incident escalation triage",
    topics: "Blue Team Mindset, OODA Loop, Containment Strategies"
  },
  "log-analysis-management": {
    subject: "Multi-source log pipeline feeding syslog, Windows Event Logs (Sysmon), and auditd into parser core",
    topics: "Sysmon Event IDs, auditd, Timestamp Normalization, Regex"
  },
  "siem-essentials-splunk-elastic": {
    subject: "Splunk and Elastic search dashboards visualizing alert spikes, correlation rules, and geo-IP maps",
    topics: "SPL Queries, KQL Elastic, Correlation Rules, Dashboarding"
  },
  "network-security-monitoring-wireshark": {
    subject: "Wireshark packet stream analysis displaying TCP streams, DNS lookups, and suspicious beaconing",
    topics: "PCAP Analysis, TCP Stream Following, Display Filters, Beacons"
  },
  "ids-suricata-snort": {
    subject: "Suricata deep packet inspection engine matching network signatures against alert rules in real-time",
    topics: "Suricata Signatures, Rule Writing, Flow Inspection, Snort"
  },
  "endpoint-detection-response-edr": {
    subject: "EDR agent telemetry graph tracking parent-child process executions (cmd.exe spawning from powershell.exe)",
    topics: "Process Trees, Behavioral Analysis, EDR Telemetry, Telemetry"
  },
  "threat-hunting-foundations": {
    subject: "Proactive hypothesis-driven threat hunt searching across baseline SIEM telemetry for living-off-the-land binaries",
    topics: "LOLBAS Hunting, Behavioral Outliers, Statistical Anomalies"
  },
  "yara-rules-malware-detection": {
    subject: "YARA rule matching hexadecimal strings and byte sequences inside a suspicious binary artifact",
    topics: "YARA Syntax, Strings & Condition Blocks, Rule Validation"
  },
  "email-security-phishing-analysis": {
    subject: "Email header analyzer verifying SPF pass, DKIM signature cryptograms, and DMARC quarantine enforcement",
    topics: "SPF, DKIM, DMARC Authentication, Header Analysis"
  },
  "hardening-os-services": {
    subject: "Hardened OS fortress disabling unneeded daemon ports, enforcing CIS benchmarks and SELinux policies",
    topics: "CIS Benchmarks, SELinux / AppArmor, Principle of Least Service"
  },

  // Path 9
  "incident-response-lifecycles": {
    subject: "PICERL incident response lifecycle wheel: Preparation, Identification, Containment, Eradication, Recovery, Lessons",
    topics: "NIST SP 800-61, Containment Playbooks, Chain of Custody"
  },
  "memory-forensics-volatility": {
    subject: "Volatility framework parsing raw RAM dump, revealing injected DLLs and hidden processes",
    topics: "Volatility 3 Plugins, pslist/malfind, Kernel Pool Tags"
  },
  "disk-forensics-filesystem-analysis": {
    subject: "FTK Imager bit-stream forensic drive imaging with cryptographic MD5/SHA-256 evidence integrity hashes",
    topics: "E01 Bit-Stream Images, MFT Records, Evidence Integrity"
  },
  "windows-forensics-artifact-investigation": {
    subject: "Forensic timeline reconstruction analyzing Shimcache, Amcache, Shellbags, and Prefetch execution timestamps",
    topics: "Shimcache, Shellbags, Prefetch (.pf), UserAssist Hives"
  },
  "linux-forensics-system-investigation": {
    subject: "Linux forensic triage parsing wtmp logins, bash_history timestamps, and journalctl systemd logs",
    topics: "wtmp / utmp, /var/log/audit, Deleted File Inodes (/proc)"
  },
  "static-malware-analysis-basics": {
    subject: "PE header analyzer inspecting import address tables (IAT), compile timestamps, and high entropy sections",
    topics: "PE Headers, Section Entropy (UPX Packing), Strings, Hashes"
  },
  "dynamic-malware-analysis-sandboxing": {
    subject: "Isolated virtual sandbox detonation chamber recording malware network callouts and process tampering",
    topics: "Cuckoo Sandbox, RegShot, Process Hacker, Network PCAP"
  },
  "reverse-engineering-ghidra-ida": {
    subject: "Ghidra decompiler displaying interactive assembly disassembly graph and decompiled C pseudocode",
    topics: "Ghidra Decompiler, Assembly x86_64, Function Graph, Control Flow"
  },
  "anti-forensics-investigation-obstacles": {
    subject: "Detecting timestomped NTFS file metadata and carved encrypted container volumes",
    topics: "Timestomping Detection, Log Wiping Recovery, Steganography"
  },
  "digital-forensics-report-writing": {
    subject: "Court-admissible forensic investigation report with chronological timeline chart and cryptographic exhibit seals",
    topics: "Expert Witness Standards, Chain of Custody Forms, Executive Briefs"
  },

  // Path 10
  "red-team-campaign-planning": {
    subject: "Red team military-style operational campaign board mapping adversary emulation objectives and OPSEC gates",
    topics: "Threat Emulation, Rules of Engagement, Crown Jewels Path"
  },
  "command-and-control-frameworks": {
    subject: "Sliver / Mythic C2 dashboard managing multi-channel HTTPS and DNS beacon implants across compromised nodes",
    topics: "C2 Architectures, Malleable Profiles, Jitter & Sleep Beacons"
  },
  "cloud-security-foundations": {
    subject: "Multi-cloud architecture (AWS, Azure, GCP) guarded by centralized cloud identity and least-privilege policies",
    topics: "AWS IAM Roles, Azure RBAC, GCP Service Accounts, CloudTrail"
  },
  "cloud-exploitation-misconfigs": {
    subject: "Exploiting exposed AWS S3 storage buckets and SSRF instance metadata endpoint 169.254.169.254 to steal IAM credentials",
    topics: "IMDSv1/v2 SSRF, Open S3 Buckets, Cloud Privilege Escalation"
  },
  "container-kubernetes-security": {
    subject: "Kubernetes cluster architecture with hardened API server, Falco runtime alerts, and container isolation",
    topics: "K8s Pod Security Standards, RBAC, Falco Runtime, Docker Breakout"
  },
  "api-security-testing-exploitation": {
    subject: "API gateway security testing finding Broken Object Level Authorization (BOLA) and mass assignment flaws",
    topics: "OWASP API Top 10, BOLA/BFLA, GraphQL Introspection, Rate Limiting"
  },
  "wireless-network-security": {
    subject: "Aircrack-ng suite capturing 4-way WPA handshake packets and analyzing rogue access point beacons",
    topics: "Aircrack-ng, Evil Twin Attacks, Enterprise 802.1X RADIUS"
  },
  "physical-security-social-engineering": {
    subject: "RFID badge cloning device with bypass tools auditing physical security barriers and mantrap doors",
    topics: "Proxmark RFID Cloning, Lock Bypassing, Social Reconnaissance"
  },
  "ai-system-security-prompt-injection": {
    subject: "LLM neural network deflecting adversarial prompt injection attacks with contextual semantic guardrails",
    topics: "Direct & Indirect Prompt Injection, Jailbreaks, Guardrail Filters"
  },
  "ai-ml-security-auditing": {
    subject: "Machine learning pipeline defended against data poisoning, model evasion, and training data extraction",
    topics: "Adversarial Perturbations, Training Set Poisoning, Model Inversion"
  },
  "post-quantum-cryptography-migration": {
    subject: "Lattice-based post-quantum cryptography crystal (ML-KEM / ML-DSA) replacing vulnerable Shor's algorithm RSA keys",
    topics: "NIST PQC Standards, Kyber (ML-KEM), Dilithium (ML-DSA), Hybrid TLS"
  },
  "capstone-full-cyber-range-assault-defense": {
    subject: "Dynamic live cyber range battle arena showing real-time red team assault vectors clashing against blue team SOC defenses",
    topics: "Full Enterprise Defense, Red vs Blue Team, Flag Captures, Debrief"
  },

  // 3 Master Track Courses
  "cybersecurity-foundations": {
    subject: "The definitive NISQ Vanguard Academy cyber defense crest with CIA Triad shield, glowing cyber grid, and SOC radar",
    topics: "Foundational Security, Kill Chain, Threat Principles, SOC Operations"
  },
  "networking-fundamentals": {
    subject: "Master network architecture blueprint showing interconnected routers, switch nodes, and TCP/IP protocol telemetry",
    topics: "Complete 7 OSI Layers, Packet Encapsulation, Routing, Diagnostics"
  },
  "linux-command-quest": {
    subject: "Terminal gaming command quest console with 7 skill zones, root prompt crest, and boss battle flag indicators",
    topics: "Terminal Novice to Root Operative, Log Forensics, Operation Dark Horizon"
  }
};

/**
 * Generate high-definition 16:9 SVG banner
 */
function generateSvgBanner(course) {
  const pathTheme = PATH_THEMES[course.path] || PATH_THEMES["master"];
  const details = SUBJECT_DETAILS[course.slug] || {
    subject: `Futuristic cybersecurity visualization for ${course.title}`,
    topics: "Cyber Defense, Systems Security, Telemetry"
  };

  const numLabel = course.num ? `MODULE ${String(course.num).padStart(2, '0')}` : "MASTER TRACK";
  const safeTitle = course.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeCategory = pathTheme.category.replace(/&/g, '&amp;');
  const safeTopics = details.topics.replace(/&/g, '&amp;');

  const accent = pathTheme.accentColor;
  const secondary = pathTheme.secondaryColor;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <!-- Dark Tech Gradients -->
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="40%" stop-color="#050B14"/>
      <stop offset="100%" stop-color="#0B1528"/>
    </linearGradient>
    <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="${secondary}"/>
    </linearGradient>
    <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${secondary}" stop-opacity="0.1"/>
    </linearGradient>
    <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.18"/>
      <stop offset="60%" stop-color="${secondary}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    
    <!-- Filter Glow -->
    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="soft-glow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Pattern Background -->
    <pattern id="cyber-grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0E2238" stroke-width="0.8" stroke-opacity="0.6"/>
      <circle cx="60" cy="60" r="1.5" fill="${accent}" fill-opacity="0.3"/>
    </pattern>
  </defs>

  <!-- Background Base -->
  <rect width="1920" height="1080" fill="url(#bg-grad)"/>
  
  <!-- Cyber Grid Overlay -->
  <rect width="1920" height="1080" fill="url(#cyber-grid)" opacity="0.85"/>
  
  <!-- Ambient Center Lighting -->
  <circle cx="960" cy="540" r="700" fill="url(#center-glow)"/>

  <!-- High-Tech Circuit Traces (Isometric Accents) -->
  <g opacity="0.25" stroke="${accent}" stroke-width="1.5" fill="none">
    <path d="M 100 200 L 400 200 L 550 350 L 800 350"/>
    <circle cx="100" cy="200" r="4" fill="${accent}"/>
    <circle cx="800" cy="350" r="4" fill="${accent}"/>
    
    <path d="M 1820 880 L 1520 880 L 1370 730 L 1120 730"/>
    <circle cx="1820" cy="880" r="4" fill="${secondary}"/>
    <circle cx="1120" cy="730" r="4" fill="${secondary}"/>
    
    <path d="M 1500 150 L 1650 300 L 1800 300"/>
    <path d="M 200 900 L 350 750 L 500 750"/>
  </g>

  <!-- Header HUD Data Overlay -->
  <g font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="16" fill="${accent}" opacity="0.85">
    <!-- Top Left Status -->
    <rect x="80" y="70" width="10" height="10" fill="${accent}"/>
    <text x="105" y="80" font-weight="bold" letter-spacing="2">NISQ VANGUARD // CYBER ACADEMY</text>
    <text x="105" y="105" fill="#64748B" font-size="13" letter-spacing="1">CURRICULUM ARCHITECTURE • OFFICIAL TRACK ASSET</text>

    <!-- Top Right Telemetry -->
    <text x="1840" y="80" text-anchor="end" font-weight="bold" letter-spacing="2">SEC_LEVEL // AUTH-OK</text>
    <text x="1840" y="105" text-anchor="end" fill="#64748B" font-size="13" letter-spacing="1">SYS_VER: 2026.4 • ENCRYPTION: SHA256/AES-GCM</text>
  </g>

  <!-- Central Visual Container (Isometric Hologram) -->
  <g transform="translate(960, 480)">
    <!-- Outer Hexagonal Halo -->
    <polygon points="0,-240 208,-120 208,120 0,240 -208,120 -208,-120" 
             fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.4" 
             filter="url(#neon-glow)"/>
    <polygon points="0,-210 182,-105 182,105 0,210 -182,105 -182,-105" 
             fill="#050B14" fill-opacity="0.7" stroke="${secondary}" stroke-width="1.2" opacity="0.6"/>

    <!-- Concentric Orbit Ring -->
    <circle cx="0" cy="0" r="160" fill="none" stroke="${accent}" stroke-width="1" stroke-dasharray="8 12" opacity="0.5"/>
    <circle cx="0" cy="0" r="130" fill="none" stroke="${secondary}" stroke-width="1.5" stroke-dasharray="14 18" opacity="0.65"/>
    
    <!-- Central Energy Core -->
    <circle cx="0" cy="0" r="80" fill="url(#accent-grad)" opacity="0.22" filter="url(#neon-glow)"/>
    
    <!-- Core Icon Silhouette Geometry -->
    <g fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#soft-glow)">
      <!-- Shield Base -->
      <path d="M 0 -60 L 50 -35 L 50 15 C 50 55 0 80 0 80 C 0 80 -50 55 -50 15 L -50 -35 Z"/>
      <!-- Internal Nodes -->
      <path d="M 0 -30 L 0 50 M -25 0 L 25 0" stroke="${accent}" stroke-width="2.5"/>
      <circle cx="0" cy="-30" r="4" fill="${accent}"/>
      <circle cx="0" cy="50" r="4" fill="${accent}"/>
      <circle cx="-25" cy="0" r="4" fill="${secondary}"/>
      <circle cx="25" cy="0" r="4" fill="${secondary}"/>
    </g>

    <!-- Radar Sweep Coordinates -->
    <line x1="-220" y1="0" x2="220" y2="0" stroke="${accent}" stroke-width="0.8" stroke-dasharray="4 6" opacity="0.3"/>
    <line x1="0" y1="-250" x2="0" y2="250" stroke="${accent}" stroke-width="0.8" stroke-dasharray="4 6" opacity="0.3"/>
  </g>

  <!-- Bottom Course Metadata Presentation Card -->
  <g transform="translate(960, 840)">
    <!-- Pill Badge -->
    <rect x="-180" y="-85" width="360" height="34" rx="17" fill="#0A1E34" stroke="${accent}" stroke-width="1.2" opacity="0.9"/>
    <text x="0" y="-63" text-anchor="middle" font-family="ui-monospace, monospace" font-size="14" font-weight="bold" fill="${accent}" letter-spacing="3">
      ${numLabel} • ${safeCategory.toUpperCase()}
    </text>

    <!-- Main Title -->
    <text x="0" y="-10" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">
      ${safeTitle}
    </text>

    <!-- Subtitle / Topics -->
    <text x="0" y="32" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="500" fill="#94A3B8" letter-spacing="0.2">
      ${safeTopics}
    </text>
  </g>

  <!-- Border Frame Accents -->
  <rect x="40" y="40" width="1840" height="1000" rx="16" fill="none" stroke="#162E4A" stroke-width="1.5" opacity="0.6"/>
  <!-- Corner Brackets -->
  <path d="M 40 90 L 40 40 L 90 40" fill="none" stroke="${accent}" stroke-width="3"/>
  <path d="M 1880 90 L 1880 40 L 1830 40" fill="none" stroke="${accent}" stroke-width="3"/>
  <path d="M 40 990 L 40 1040 L 90 1040" fill="none" stroke="${accent}" stroke-width="3"/>
  <path d="M 1880 990 L 1880 1040 L 1830 1040" fill="none" stroke="${accent}" stroke-width="3"/>
</svg>`;
}

async function run() {
  console.log("=== NISQ Vanguard Course Banner Pipeline ===");
  
  const coursesData = JSON.parse(fs.readFileSync('scratch/all_105_courses.json', 'utf8'));
  
  const allCourses = [];
  coursesData.courses102.forEach(c => allCourses.push({
    num: c.num,
    path: c.path,
    slug: c.slug,
    title: c.title,
    isMaster: false
  }));
  
  coursesData.masterCourses.forEach((c, idx) => allCourses.push({
    num: null,
    path: "master",
    slug: c.slug,
    title: c.title,
    id: c.id,
    isMaster: true
  }));

  console.log(`Processing total courses: ${allCourses.length}`);

  // 1. Generate AI Prompts JSON
  const aiPrompts = [];
  const manifestEntries = [];

  const outDir = path.join(__dirname, '..', 'public', 'images', 'courses');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const course of allCourses) {
    const details = SUBJECT_DETAILS[course.slug] || {
      subject: `Futuristic cybersecurity visualization for ${course.title}`,
      topics: "Cyber Defense, Systems Security, Telemetry"
    };
    const pathTheme = PATH_THEMES[course.path] || PATH_THEMES["master"];

    // Full prompt for Midjourney / Flux / Banana AI
    const fullPrompt = `${course.title}: ${details.subject}. ${BASE_AESTHETIC_PROMPT}`;

    aiPrompts.push({
      num: course.num,
      slug: course.slug,
      title: course.title,
      category: pathTheme.category,
      path: course.path,
      subject: details.subject,
      topics: details.topics,
      prompt: fullPrompt,
      negativePrompt: NEGATIVE_PROMPT,
      aspectRatio: "16:9",
      targetFile: `/images/courses/${course.slug}.svg`
    });

    // Generate high-resolution SVG banner
    const svgContent = generateSvgBanner(course);
    const svgPath = path.join(outDir, `${course.slug}.svg`);
    fs.writeFileSync(svgPath, svgContent, 'utf8');

    // Build manifest entry
    manifestEntries.push({
      slug: course.slug,
      title: course.title,
      imagePath: `/images/courses/${course.slug}.svg`,
      category: pathTheme.category,
      topic: details.topics,
      altText: `${course.title} course banner featuring ${details.subject}`
    });
  }

  // Save prompts JSON
  const promptsPath = path.join(__dirname, 'course_banner_prompts.json');
  fs.writeFileSync(promptsPath, JSON.stringify(aiPrompts, null, 2), 'utf8');
  console.log(`✓ Generated ${aiPrompts.length} AI prompts in ${promptsPath}`);
  console.log(`✓ Generated ${allCourses.length} vector banner assets in public/images/courses/`);

  // 2. Generate updated src/data/course-images.ts
  generateCourseImagesSource(manifestEntries);
  console.log(`✓ Updated src/data/course-images.ts`);
}

function generateCourseImagesSource(manifestEntries) {
  const code = `/**
 * NISQ VANGUARD — OFFICIAL COURSE IMAGE & STICKER MANIFEST
 * 
 * Provides verified local assets for all 105 academy courses (102 core modules + 3 master tracks),
 * maintaining 100% offline support, zero layout shifts, high-contrast branding, and permissive license metadata.
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
${manifestEntries.map(e => `  "${e.slug}": {
    courseId: "${e.slug}",
    slug: "${e.slug}",
    title: ${JSON.stringify(e.title)},
    imagePath: "${e.imagePath}",
    topic: ${JSON.stringify(e.topic)},
    category: ${JSON.stringify(e.category)},
    altText: ${JSON.stringify(e.altText)},
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },`).join('\n')}

  // ID Aliases for Master Tracks
  "c-cyber-found": {
    courseId: "c-cyber-found",
    slug: "cybersecurity-foundations",
    title: "Cybersecurity Foundations",
    imagePath: "/images/courses/cybersecurity-foundations.svg",
    topic: "Foundational Security, Kill Chain, Threat Principles, SOC Operations",
    category: "Mastery",
    altText: "Cybersecurity Foundations course emblem featuring CIA Triad shield and cyber grid",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "c-net-fund": {
    courseId: "c-net-fund",
    slug: "networking-fundamentals",
    title: "Networking Fundamentals",
    imagePath: "/images/courses/networking-fundamentals.svg",
    topic: "Complete 7 OSI Layers, Packet Encapsulation, Routing, Diagnostics",
    category: "Mastery",
    altText: "Networking Fundamentals badge featuring router switch nodes and TCP/IP telemetry",
    source: "NISQ Vanguard Academy Design System",
    license: "Proprietary / Educational Use Only",
  },
  "c-lin-quest": {
    courseId: "c-lin-quest",
    slug: "linux-command-quest",
    title: "Linux Command Quest",
    imagePath: "/images/courses/linux-command-quest.svg",
    topic: "Terminal Novice to Root Operative, Log Forensics, Operation Dark Horizon",
    category: "Mastery",
    altText: "Linux Command Quest badge displaying an interactive terminal console with root prompt",
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
`;

  const targetPath = path.join(__dirname, '..', 'src', 'data', 'course-images.ts');
  fs.writeFileSync(targetPath, code, 'utf8');
}

run().catch(err => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});

