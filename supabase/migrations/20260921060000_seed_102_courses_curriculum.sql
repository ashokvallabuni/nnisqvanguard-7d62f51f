-- Migration: Seed All 102 Cybersecurity Courses and Learning Paths into Supabase Postgres

-- 1. Fix check constraint on learning_paths to allow 'published'
ALTER TABLE public.learning_paths DROP CONSTRAINT IF EXISTS learning_paths_status_check;
ALTER TABLE public.learning_paths ADD CONSTRAINT learning_paths_status_check CHECK (status IN ('draft', 'published', 'archived', 'active', 'pending'));

DO $$
BEGIN

  -- 2. Ensure 10 Learning Paths exist
  INSERT INTO public.learning_paths (name, slug, description, status)
  VALUES
    ('Path 1: Absolute Beginner & Cyber Awareness', 'absolute-beginner-cyber-awareness', 'Build cybersecurity intuition from zero. Master digital hygiene, social engineering triage, device defense, MFA, OPSEC, and cyber law.', 'published'),
    ('Path 2: Computer Networking & Web Infrastructure', 'computer-networking-web-infrastructure', 'Deep dive into OSI layers, TCP/IP, DNS, routing, NAT, HTTP/S, packet captures, and network traffic filtering.', 'published'),
    ('Path 3: Operating System Operations', 'operating-system-operations', 'Master Linux CLI, permissions, shell scripting, Windows architecture, registry, PowerShell, Active Directory, and containers.', 'published'),
    ('Path 4: Threat Landscape & Security Fundamentals', 'threat-landscape-security-fundamentals', 'Understand the CIA triad, symmetric/asymmetric cryptography, hashing, threat actors, CVEs, IAM, and MITRE ATT&CK.', 'published'),
    ('Path 5: Reconnaissance, OSINT & Footprinting', 'reconnaissance-osint-footprinting', 'Passive and active reconnaissance, OSINT domain tools, Nmap network scanning, web enumeration, and dark web monitoring.', 'published'),
    ('Path 6: Web Application Security', 'web-application-security', 'Audit modern web architectures, Burp Suite interception, SQL injection, XSS, CSRF, IDOR, command injection, and OWASP Top 10.', 'published'),
    ('Path 7: System Hacking, Shells & Privilege Escalation', 'system-hacking-privilege-escalation', 'Controlled simulations of hash cracking, Metasploit, bind/reverse shells, Linux SUID/sudo abuse, Windows token manipulation, and AD attacks.', 'published'),
    ('Path 8: Defensive Security, SOC & Blue Team', 'defensive-security-soc-blue-team', 'SOC workflows, log aggregation, Splunk/Elastic SIEM, Wireshark packet capture, Suricata IDS, EDR, YARA, and OS hardening.', 'published'),
    ('Path 9: Digital Forensics, Incident Response & Malware', 'digital-forensics-incident-response', 'DFIR methodologies, memory triage with Volatility, disk forensic imaging, Windows/Linux event artifacts, static/dynamic malware analysis, and Ghidra.', 'published'),
    ('Path 10: Advanced Red Team, Cloud, AI & Quantum Security', 'advanced-red-team-cloud-ai-quantum', 'Advanced red team operations, C2 frameworks, AWS/Azure/GCP cloud security, Kubernetes defense, prompt injection audits, and post-quantum migration.', 'published')
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    status = EXCLUDED.status;

  -- 3. Insert All 102 Courses Across Paths (slug, title, description, level, tier, sort_order)
  INSERT INTO public.courses (slug, title, description, level, tier, sort_order)
  VALUES
    -- Path 1 (Courses 1-10)
    ('digital-safety-hygiene', '1. Digital Safety & Hygiene', 'Fundamentals of daily operational security, endpoint hygiene, and digital privacy.', 'beginner', 'free', 1),
    ('social-engineering-phishing-defense', '2. Social Engineering & Phishing Defense', 'Recognize manipulation tactics, spear phishing, vishing, and impersonation. Triage social engineering attack vectors.', 'beginner', 'free', 2),
    ('financial-upi-fraud-prevention', '3. Financial & UPI Fraud Prevention', 'Payment switch security, transaction integrity, and anti-fraud controls across real-time settlement rails.', 'beginner', 'free', 3),
    ('mobile-smartphone-security', '4. Mobile & Smartphone Security', 'Mobile OS sandboxing, application permissions, and telemetry protection across Android and iOS.', 'beginner', 'free', 4),
    ('wifi-public-network-safety', '5. Wi-Fi & Public Network Safety', 'Wireless encryption protocols, rogue APs, and tunnel security. Analyze 802.11 security and WPA2/WPA3 enterprise authentication.', 'beginner', 'free', 5),
    ('opsec-basics', '6. Operational Security (OPSEC) Basics', 'Information classification, digital footprint reduction, and metadata safety. Implement OPSEC lifecycles.', 'beginner', 'free', 6),
    ('hardware-device-security', '7. Introduction to Hardware & Device Security', 'Secure boot, TPMs, hardware root of trust, trusted execution environments, and physical attack surfaces.', 'beginner', 'free', 7),
    ('password-managers-mfa-setup', '8. Password Managers & MFA Setup', 'Entropy, password hashing, TOTP algorithms, and FIDO2 hardware keys. Architect resilient authentication habits.', 'beginner', 'free', 8),
    ('social-media-account-recovery', '9. Social Media & Account Recovery Protection', 'Account takeover prevention, identity proofing, and fallback authentication hardening against SIM swapping.', 'beginner', 'free', 9),
    ('cyber-ethics-legal-frameworks', '10. Cyber Ethics & Legal Frameworks', 'Rules of engagement, Computer Fraud and Abuse Act (CFAA), GDPR, and responsible disclosure protocols.', 'beginner', 'free', 10),

    -- Path 2 (Courses 11-20)
    ('networking-fundamentals-part-1', '11. Networking Fundamentals — Part 1', 'OSI model, Ethernet frames, MAC addresses, physical layer transmission, and intermediate switching mechanics.', 'beginner', 'free', 11),
    ('networking-fundamentals-part-2', '12. Networking Fundamentals — Part 2', 'IP packet encapsulation, routing protocols, ICMP, hop analysis, IPv4/IPv6 headers, TTLs, and dynamic routing architectures.', 'beginner', 'free', 12),
    ('transport-protocols-tcp-udp', '13. Transport Protocols — TCP vs. UDP', 'TCP 3-way handshake, state transitions, flow control, and UDP datagrams. Connection-oriented vs connectionless models.', 'beginner', 'free', 13),
    ('domain-name-system-dns', '14. The Domain Name System (DNS)', 'Recursive resolution, root servers, DNS record types, DNSSEC, zone transfers, and cache poisoning defenses.', 'beginner', 'free', 14),
    ('subnetting-ip-addressing', '15. Subnetting & IP Addressing', 'IPv4 binary math, CIDR notation, network vs host IDs, and VLSM calculation.', 'beginner', 'free', 15),
    ('web-protocols-http-https', '16. Web Protocols — HTTP & HTTPS', 'HTTP request/response methods, headers, status codes, and TLS 1.3 cryptographic handshakes.', 'beginner', 'free', 16),
    ('network-ports-standard-services', '17. Network Ports & Standard Services', 'Well-known IANA port allocations (22, 53, 80, 443, 3389), service banners, and listening socket identification.', 'beginner', 'free', 17),
    ('dhcp-protocol', '18. Dynamic Host Configuration Protocol (DHCP)', 'DORA process, lease lifecycles, DHCP starvation, rogue DHCP servers, and DHCP snooping defenses.', 'beginner', 'free', 18),
    ('firewalls-network-traffic-control', '19. Firewalls & Network Traffic Control', 'Stateful vs stateless inspection, iptables, packet filtering, and boundary ACL rules.', 'beginner', 'free', 19),
    ('network-address-translation-nat', '20. Network Address Translation (NAT)', 'SNAT, DNAT, Port Address Translation (PAT), and RFC 1918 private address translation tables.', 'beginner', 'free', 20),

    -- Path 3 (Courses 21-30)
    ('linux-fundamentals-part-1', '21. Linux Fundamentals — Part 1', 'Directory structure, file system navigation, and foundational command-line operations.', 'beginner', 'free', 21),
    ('linux-fundamentals-part-2', '22. Linux Fundamentals — Part 2', 'File manipulation, text filtering, grep, awk, and sed utilities for log stream processing.', 'beginner', 'free', 22),
    ('linux-file-permissions', '23. Linux File Permissions & Ownership', 'chmod, chown, special permissions (SUID, SGID, Sticky Bit), and octal permission notation.', 'beginner', 'free', 23),
    ('linux-system-administration', '24. Linux System Administration & User Management', 'User accounts, group policies, service management, and systemd daemons.', 'beginner', 'free', 24),
    ('linux-shell-scripting', '25. Linux Shell Scripting Basics', 'Bash automation, loops, conditionals, and error handling for security audits and log parsing.', 'beginner', 'free', 25),
    ('windows-architecture-administration', '26. Windows Architecture & Administration Fundamentals', 'Windows Subsystems, Task Manager, services, boot phases, and event logs.', 'beginner', 'free', 26),
    ('windows-registry-service-management', '27. Windows Registry & Service Management', 'Registry hives, keys, values, persistence locations, and Windows service configuration.', 'beginner', 'free', 27),
    ('windows-cmd-powershell', '28. Windows Command Line & PowerShell Cmdlets', 'cmd.exe, PowerShell syntax, objects, and pipeline manipulation for administrative automation.', 'beginner', 'free', 28),
    ('active-directory-foundations', '29. Active Directory Foundations', 'Domain Controllers, forests, trees, organizational units, objects, and directory services.', 'beginner', 'free', 29),
    ('system-virtualization-containerization', '30. System Virtualization & Containerization', 'Hypervisors, Docker engines, container isolation, and virtual lab building.', 'beginner', 'free', 30),

    -- Path 4 (Courses 31-40)
    ('cia-triad-core-principles', '31. The CIA Triad & Core Security Principles', 'Confidentiality, Integrity, Availability, and foundational security risk mitigation paradigms.', 'beginner', 'free', 31),
    ('defense-in-depth-strategy', '32. Defense-in-Depth Strategy & Security Layering', 'Perimeter, network, host, application, and data security layering.', 'beginner', 'free', 32),
    ('cryptography-symmetric', '33. Cryptography Foundations — Symmetric Encryption', 'AES, block ciphers, modes of operation (CBC, GCM), and symmetric key management.', 'intermediate', 'free', 33),
    ('cryptography-asymmetric', '34. Cryptography Foundations — Asymmetric Encryption', 'RSA, Elliptic Curve Cryptography (ECC), digital signatures, and public-key infrastructure (PKI).', 'intermediate', 'free', 34),
    ('cryptographic-hashing', '35. Cryptographic Hashing & Integrity Verification', 'SHA-256, collision resistance, salts, and HMAC file integrity verification.', 'beginner', 'free', 35),
    ('threat-actor-types', '36. Threat Actor Types & Adversary Motivations', 'APT groups, cybercriminals, hacktivists, insiders, and nation-state adversary motivations.', 'beginner', 'free', 36),
    ('vulnerability-management-cve', '37. Vulnerability Management & CVE/CVSS Metrics', 'Common Vulnerabilities and Exposures, CVSS scoring v3/v4, and structured patch lifecycles.', 'intermediate', 'free', 37),
    ('identity-access-management', '38. Identity & Access Management (IAM)', 'RBAC, ABAC, principle of least privilege, and identity federation protocols.', 'intermediate', 'free', 38),
    ('security-frameworks-compliance', '39. Security Frameworks & Compliance', 'NIST CSF, ISO 27001, SOC 2, HIPAA, and regulatory compliance standards alignment.', 'intermediate', 'free', 39),
    ('mitre-attck-framework', '40. The MITRE ATT&CK Framework Mapping', 'Tactics, techniques, and procedures (TTPs), matrix navigation, and threat mapping.', 'intermediate', 'free', 40),

    -- Path 5 (Courses 41-50)
    ('osint-advanced-dorking', '41. Open Source Intelligence (OSINT) — Advanced Dorking', 'Search engine operators, Google dorks, and extracting unindexed assets and metadata.', 'intermediate', 'free', 41),
    ('osint-domain-ip-intelligence', '42. OSINT — Domain & IP Intelligence', 'WHOIS records, historical DNS data, ASN mapping, and infrastructure geolocation.', 'intermediate', 'free', 42),
    ('osint-social-media', '43. OSINT — Social Media & Human Intelligence', 'Social footprinting, username enumeration, image metadata, and geolocation.', 'beginner', 'free', 43),
    ('network-footprinting-nmap-1', '44. Network Footprinting with Nmap — Part 1', 'Host discovery, ARP scanning, TCP SYN/ACK scans, and port state analysis.', 'intermediate', 'free', 44),
    ('network-footprinting-nmap-2', '45. Network Footprinting with Nmap — Part 2', 'Service version detection, OS fingerprinting, and Nmap Scripting Engine (NSE) automation.', 'intermediate', 'free', 45),
    ('web-directory-enumeration', '46. Web Directory Enumeration & Content Discovery', 'Gobuster, FFUF, wordlists, and hidden endpoint discovery.', 'intermediate', 'free', 46),
    ('subdomain-enumeration', '47. Subdomain Enumeration Techniques', 'Passive DNS aggregation, certificate transparency logs, and DNS brute-forcing.', 'intermediate', 'free', 47),
    ('banner-grabbing-service-enumeration', '48. Banner Grabbing & Service Enumeration', 'Netcat, Telnet, and protocol response inspection for service identification.', 'intermediate', 'free', 48),
    ('dark-web-credential-monitoring', '49. Dark Web & Credential Breach Monitoring', 'Dark web forums, paste sites, breach databases, and leaked credential triage.', 'intermediate', 'free', 49),
    ('threat-intelligence-integration', '50. Threat Intelligence Integration', 'IOC feeds, STIX/TAXII standards, MISP, and automated vulnerability feeds.', 'intermediate', 'free', 50),

    -- Path 6 (Courses 51-60)
    ('web-application-architecture', '51. Web Application Architecture & Request Lifecycle', 'Client-server model, REST APIs, JSON/XML payloads, and session state lifecycles.', 'intermediate', 'free', 51),
    ('intercepting-proxies-burp-suite', '52. Intercepting Proxies & Burp Suite Basics', 'Proxy listeners, Repeater, Intruder, and real-time traffic modification workflows.', 'intermediate', 'free', 52),
    ('sql-injection-in-band', '53. SQL Injection (SQLi) — In-Band', 'Authentication bypass, UNION-based data extraction, and database fingerprinting.', 'intermediate', 'free', 53),
    ('sql-injection-advanced-sqlmap', '54. SQL Injection (SQLi) — Advanced & SQLMap', 'Blind SQLi, time-based payloads, error-based attacks, and automated SQLMap exploitation.', 'intermediate', 'free', 54),
    ('cross-site-scripting-xss', '55. Cross-Site Scripting (XSS)', 'Reflected, stored, and DOM-based XSS, cookie theft, and contextual output encoding defense.', 'intermediate', 'free', 55),
    ('csrf-token-bypasses', '56. Cross-Site Request Forgery (CSRF)', 'State-changing requests, CSRF tokens, SameSite cookies, and validation flaws.', 'intermediate', 'free', 56),
    ('command-injection-rce', '57. Command Injection & Remote Code Execution (RCE)', 'OS command separators, input sanitization failures, and shell spawning mechanics.', 'intermediate', 'free', 57),
    ('broken-authentication-session-hijacking', '58. Broken Authentication & Session Hijacking', 'Weak session IDs, token expiration flaws, credential stuffing, and session fixation.', 'intermediate', 'free', 58),
    ('idor-access-control-flaws', '59. Insecure Direct Object References (IDOR)', 'Horizontal and vertical privilege escalation, parameter tampering, and broken object authorization.', 'intermediate', 'free', 59),
    ('owasp-top-10-audit', '60. OWASP Top 10 Comprehensive Audit', 'Comprehensive vulnerability audit, secure coding principles, and web application remediation.', 'intermediate', 'free', 60),

    -- Path 7 (Courses 61-70)
    ('password-cracking-online-brute-force', '61. Password Cracking — Online Brute-Force', 'Hydra, Medusa, dictionary attacks, rate limiting, and account lockouts.', 'intermediate', 'free', 61),
    ('password-cracking-offline-hashcat', '62. Password Cracking — Offline Hash Cracking', 'Hashcat, John the Ripper, rule-based attacks, and rainbow tables.', 'intermediate', 'free', 62),
    ('metasploit-framework-essentials', '63. Metasploit Framework Essentials', 'MSFconsole, exploit modules, payloads, auxiliary scanners, and meterpreter sessions.', 'intermediate', 'free', 63),
    ('shells-payloads-bind-reverse', '64. Shells & Payloads — Bind vs. Reverse Shells', 'TCP bind shells, encrypted reverse shells, stagers, and TTY shell stabilization.', 'intermediate', 'free', 64),
    ('linux-privilege-escalation-suid', '65. Linux Privilege Escalation — SUID & GTFOBins', 'SUID/SGID executables, shared library hijacking, and GTFOBins exploitation.', 'intermediate', 'free', 65),
    ('linux-privilege-escalation-sudo-cron', '66. Linux Privilege Escalation — Sudo, Cron & Kernels', 'Sudo rights abuse, vulnerable cron jobs, and local kernel privilege escalation.', 'intermediate', 'free', 66),
    ('windows-privilege-escalation-services', '67. Windows Privilege Escalation — Services & Tokens', 'Unquoted service paths, weak service permissions, token impersonation, and UAC bypass.', 'intermediate', 'free', 67),
    ('active-directory-attacks-bloodhound', '68. Active Directory Attacks — BloodHound & Kerberos', 'BloodHound enumeration, Kerberoasting, AS-REP roasting, and domain escalation paths.', 'advanced', 'free', 68),
    ('antivirus-evasion-obfuscation', '69. Antivirus Evasion Techniques & Payload Obfuscation', 'Signature detection, heuristic analysis, process injection, and memory evasion.', 'advanced', 'free', 69),
    ('post-exploitation-persistence', '70. Post-Exploitation Mechanics & Persistence', 'Registry run keys, scheduled tasks, SSH keys, rootkits, and engagement cleanup.', 'advanced', 'free', 70),

    -- Path 8 (Courses 71-80)
    ('blue-team-soc-workflows', '71. Introduction to Blue Team Operations & SOC Workflows', 'Security Operations Center tiers, triage workflows, alert validation, and escalation.', 'intermediate', 'free', 71),
    ('security-log-analysis', '72. Security Log Analysis — Parsing Logs', 'Linux auth logs, Windows Event Viewer IDs, web server access logs, and parsing.', 'intermediate', 'free', 72),
    ('siem-deployment-splunk-elastic', '73. SIEM Deployment & Alert Creation', 'Splunk, Elastic Stack, KQL/SPL queries, and threshold correlation alerting rules.', 'intermediate', 'free', 73),
    ('packet-analysis-wireshark', '74. Packet Analysis & Network Forensics (Wireshark)', 'PCAP inspection, TCP stream reconstruction, TLS decryption, and exfiltration detection.', 'intermediate', 'free', 74),
    ('ids-ips-suricata-snort', '75. Intrusion Detection Systems (IDS/IPS Rules)', 'Suricata, Snort, signature writing, traffic inspection, and custom alerting rules.', 'intermediate', 'free', 75),
    ('edr-telemetry-isolation', '76. Endpoint Detection & Response (EDR) Telemetry', 'EDR agents, process telemetry, memory hooks, and host isolation execution.', 'intermediate', 'free', 76),
    ('proactive-threat-hunting', '77. Proactive Threat Hunting Methodologies', 'Hypothesis-driven hunting, IOC querying, and enterprise anomaly isolation.', 'intermediate', 'free', 77),
    ('yara-rule-authoring', '78. YARA Rule Authoring for Malware Detection', 'YARA syntax, strings condition blocks, metadata tags, and file scanning.', 'intermediate', 'free', 78),
    ('phishing-email-analysis', '79. Phishing Email Header Analysis & Malicious URLs', 'Email headers, SPF/DKIM/DMARC validation, attachment sandboxing, and URL triage.', 'beginner', 'free', 79),
    ('os-hardening-cis-benchmarks', '80. Operating System Hardening & CIS Benchmarks', 'CIS benchmarks, GPO hardening, firewall baselines, and attack surface reduction.', 'intermediate', 'free', 80),

    -- Path 9 (Courses 81-90)
    ('incident-response-lifecycle', '81. Incident Response Lifecycle (NIST SP 800-61)', 'Preparation, detection, containment, eradication, recovery, and lessons learned.', 'intermediate', 'free', 81),
    ('memory-forensics-volatility', '82. Memory Forensics & RAM Analysis (Volatility)', 'RAM acquisition, Volatility framework, process listing, and DLL injection detection.', 'advanced', 'free', 82),
    ('disk-forensics-autopsy', '83. Disk Forensics & File System Reconstruction', 'Autopsy, FTK Imager, partition tables, deleted file recovery, and timeline analysis.', 'advanced', 'free', 83),
    ('windows-artifact-analysis', '84. Windows Artifact Analysis — Registry & Prefetch', 'Registry hives, Prefetch files, Shimcache, Amcache, and Lnk files investigation.', 'advanced', 'free', 84),
    ('linux-incident-investigation', '85. Linux Incident Investigation — Logs & History', 'Bash history, systemd logs, cron persistence, and authentication audits.', 'advanced', 'free', 85),
    ('static-malware-analysis', '86. Static Malware Analysis — Strings, Hashes & PE', 'PE header analysis, imported APIs, strings extraction, and entropy inspection.', 'advanced', 'free', 86),
    ('dynamic-malware-analysis', '87. Dynamic Malware Analysis — Sandboxing', 'Isolated sandbox environments, process monitoring, API call tracing, and network capture.', 'advanced', 'free', 87),
    ('reverse-engineering-ghidra', '88. Reverse Engineering Fundamentals (Ghidra)', 'Assembly language, control flow graphs, decompiler usage, and symbol analysis.', 'advanced', 'free', 88),
    ('anti-forensics-detection', '89. Anti-Forensics Detection — Timestomping Recovery', 'Log scrubbing detection, timestomping analysis, and artifact recovery.', 'advanced', 'free', 89),
    ('dfir-chain-of-custody-reporting', '90. Digital Forensics Chain-of-Custody & Reporting', 'Evidence collection, cryptographic hashing, legal chain-of-custody, and executive reports.', 'intermediate', 'free', 90),

    -- Path 10 (Courses 91-102)
    ('red-team-campaign-planning', '91. Red Team Campaign Planning & Infrastructure Setup', 'Rules of engagement, redirectors, VPS hardening, and domain fronting.', 'advanced', 'free', 91),
    ('c2-frameworks-sliver-cobalt', '92. Command & Control (C2) Framework Operations', 'Sliver, Cobalt Strike, beacon configurations, listeners, and traffic profiling.', 'advanced', 'free', 92),
    ('cloud-security-foundations', '93. Cloud Security Foundations (AWS, Azure, GCP)', 'Identity and Access Management (IAM), storage buckets, VPCs, and security groups.', 'intermediate', 'free', 93),
    ('cloud-exploitation-s3-imds', '94. Cloud Exploitation — S3 Buckets & IMDS', 'Public S3 buckets, Instance Metadata Service (IMDS) abuse, and privilege escalation.', 'advanced', 'free', 94),
    ('container-kubernetes-security', '95. Container & Kubernetes Security Auditing', 'Docker socket exposure, RBAC misconfigurations, pod security, and cluster hardening.', 'advanced', 'free', 95),
    ('api-security-testing', '96. API Security Testing — REST/GraphQL BOLA', 'REST, GraphQL, Broken Object Level Authorization (BOLA), and rate-limiting bypasses.', 'advanced', 'free', 96),
    ('wireless-network-security', '97. Wireless Network Security — WPA2/WPA3', '802.11 frame capture, deauthentication attacks, and 4-way handshake cracking.', 'intermediate', 'free', 97),
    ('physical-security-rfid', '98. Physical Security, RFID & Rogue Hardware', 'RFID/NFC badge cloning, HID Prox, Rubber Ducky payloads, and physical bypasses.', 'intermediate', 'free', 98),
    ('ai-system-security-prompt-injection', '99. AI System Security — Prompt Injection', 'Direct and indirect prompt injection, LLM jailbreaking, and data poisoning.', 'advanced', 'free', 99),
    ('ai-security-adversarial-ml', '100. AI Security — Adversarial Machine Learning', 'Adversarial perturbation, model evasion, extraction attacks, and data leakage.', 'advanced', 'free', 100),
    ('post-quantum-cryptography-migration', '101. Post-Quantum Cryptography (PQC) Migration', 'Shor''s algorithm, lattice-based cryptography, NIST PQC standards, and hybrid certificates.', 'advanced', 'free', 101),
    ('capstone-challenge-range-assault', '102. Capstone Challenge — Full Cyber Range Assault', 'End-to-end red team assault, blue team defense, forensics triage, and executive audit.', 'advanced', 'free', 102)
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    level = EXCLUDED.level,
    tier = EXCLUDED.tier,
    sort_order = EXCLUDED.sort_order;

END $$;