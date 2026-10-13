import { LabDefinition } from "./types";
import { VirtualFileSystem } from "../engine/filesystem/vfs";

export const suricataNidsLab: LabDefinition = {
 id: "lab-suricata-nids",
 slug: "suricata-network-threat-hunting",
 title: "Suricata Network Threat Hunting & PCAP Analysis",
 difficulty: "MEDIUM",
 category: "Network Defense",
 description:
 "Inspect captured perimeter traffic from an active Command and Control (C2) beaconing incident. Identify beaconing intervals, uncover covert DNS tunneling payloads, decode exfiltrated data, and block the C2 domain.",
 estimated_minutes: 45,
 reward_points: 150,
 learning_objectives: [
 "Understand how Network Intrusion Detection Systems (NIDS) like Suricata monitor traffic",
 "Analyze Suricata EVE JSON telemetry and packet capture (PCAP) metadata",
 "Identify anomalous high-entropy DNS subdomains used for data exfiltration",
 "Decode Base64 payloads transferred over covert DNS query channels",
 "Map observed attacker tactics to MITRE ATT&CK T1071.004 (DNS Protocol C2)",
 ],
 prerequisites: [
 "Understanding of OSI Layer 4 and Layer 7 protocols (TCP, UDP, DNS)",
 "Familiarity with DNS record types (A, TXT, CNAME) and resolution architecture",
 "Basic understanding of Linux command-line text parsing tools (grep, awk, cat)",
 ],
 conceptual_intro: `### Network Intrusion Detection & DNS Tunneling Mechanics

Modern adversaries frequently disguise Command & Control (C2) and data exfiltration inside ubiquitous protocols like **DNS (Domain Name System)** on UDP port 53. Because enterprise perimeter firewalls almost universally allow outbound DNS to resolve internet addresses, attackers exploit this trust.

#### How DNS Tunneling Works (MITRE ATT&CK T1071.004)
1. **Adversary Setup:** The attacker registers an authoritative nameserver for a domain (e.g. \`exfil.nisq-defense.internal\`).
2. **Data Chunking & Encoding:** Sensitive data is Base64 encoded or encrypted into small alphanumeric strings (e.g., \`RkxBR3tETlNfVFVOTkVMX0RFVEVDVEVEfQ==\`).
3. **Query Generation:** The compromised client issues standard DNS lookups prepending the data:
   \`\`\`
   query: <encoded_secret>.exfil.nisq-defense.internal
   \`\`\`
4. **Resolution Path:** The corporate DNS server forwards the query to the authoritative server controlled by the attacker, effectively handing over the payload without establishing direct TCP connections.

#### Suricata NIDS Telemetry
**Suricata** processes raw packets into unified JSON logs (\`eve.json\`), categorizing events into:
- \`flow\` (Session metadata, bytes sent/received, timestamps)
- \`dns\` (Query names, types, return codes, entropy)
- \`alert\` (Rule matches based on signatures)`,
 dataset_description:
 "The virtual workspace provides security telemetry in /captures: a DNS query log (/captures/dns_queries.log) extracted from the perimeter tap, a simulated Suricata EVE alert record (/captures/suricata_eve.json), and an artifact extractor output (/captures/extracted_flag.txt).",
 evidence_summary:
 "An infected host is transmitting Base64 encoded fragments to *.exfil.nisq-defense.internal every 60 seconds. Decoding the subdomain prefix unmasks the exfiltrated sensitive payload.",
 hints: [
 "Look for DNS queries ending in .exfil.nisq-defense.internal.",
 "Base64 decode the prefix string to read the flag.",
 "The artifact files are located in /captures/.",
 ],
 progressive_hints: [
 {
 level: 1,
 title: "Conceptual Clue",
 hint: "Examine the /captures directory. Benign queries target normal vendor domains, while suspicious queries feature random-looking, long subdomains.",
 },
 {
 level: 2,
 title: "Investigation Strategy",
 hint: "Filter /captures/dns_queries.log for strings containing 'exfil'. The long prefix before .exfil is a Base64-encoded string.",
 },
 {
 level: 3,
 title: "Exact Command Syntax",
 hint: "Inspect /captures/dns_queries.log with grep 'exfil', note the encoded string, then inspect /captures/extracted_flag.txt for verification.",
 },
 ],
 tasks: [
 {
 id: "t1",
 title: "List capture files in /captures",
 description: "Locate the primary incident packet capture and log telemetry files in the /captures directory.",
 command_hint: "ls -la /captures",
 explanation:
 "Reviewing directory structure confirms which forensic artifacts (logs, pcap representations, EVE telemetry) are available for analysis.",
 failure_guidance: "Use 'ls -la /captures' to list all forensic evidence files.",
 progressive_hints: [
 { level: 1, text: "Navigate or list contents in /captures." },
 { level: 2, text: "Use the ls command with flag -l or -la." },
 { level: 3, text: "Command: ls -la /captures" },
 ],
 validate: (ctx, cmd) => cmd.includes("ls") && cmd.includes("/captures"),
 },
 {
 id: "t2",
 title: "Analyze DNS queries with grep and filters",
 description: "Filter DNS query telemetry to identify anomalous long subdomains used for exfiltration.",
 command_hint: "grep 'exfil' /captures/dns_queries.log",
 explanation:
 "Filtering for queries directed to the suspicious exfiltration domain reveals the full Base64-encoded payload prepended to the hostname.",
 failure_guidance: "Run grep targeting 'exfil' or 'dns' on /captures/dns_queries.log.",
 progressive_hints: [
 { level: 1, text: "Search through /captures/dns_queries.log." },
 { level: 2, text: "Use grep with 'exfil' to find the anomalous domain query." },
 { level: 3, text: "Command: grep 'exfil' /captures/dns_queries.log" },
 ],
 validate: (ctx, cmd) =>
 cmd.includes("grep") && (cmd.includes("exfil") || cmd.includes("dns")),
 },
 {
 id: "t3",
 title: "Capture and submit the exfiltration flag",
 description: "Retrieve the decoded security flag from /captures/extracted_flag.txt to finalize containment.",
 command_hint: "cat /captures/extracted_flag.txt",
 explanation:
 "Decoding the DNS tunneling payload proves that data loss occurred and identifies the exact sensitivity tier of the leaked asset.",
 failure_guidance: "Display /captures/extracted_flag.txt using cat.",
 progressive_hints: [
 { level: 1, text: "Look for extracted artifacts in /captures." },
 { level: 2, text: "Read the file named extracted_flag.txt." },
 { level: 3, text: "Command: cat /captures/extracted_flag.txt" },
 ],
 validate: (ctx, cmd) => cmd.includes("cat") && cmd.includes("extracted_flag"),
 },
 ],
 flag: "FLAG{DNS_TUNNEL_DETECTED}",
 completion_criteria: [
 "Discovered forensic artifacts in /captures",
 "Identified covert DNS exfiltration queries targeting .exfil.nisq-defense.internal",
 "Decoded Base64 tunnel contents and confirmed exfiltration remediation token",
 ],
 final_assessment: [
 {
 id: "q1",
 question: "Why do attackers prefer DNS (UDP port 53) for data exfiltration?",
 options: [
 "DNS packets have 100% encryption by default so firewalls cannot see them",
 "Outbound UDP port 53 is rarely blocked by firewalls because internal hosts need name resolution",
 "DNS protocol is faster than TCP because it avoids all routing hops",
 "DNS queries can carry up to 1 gigabyte per packet",
 ],
 correct_index: 1,
 explanation: "Enterprise security policies often permit outbound DNS lookups, making it a reliable covert channel for adversaries when HTTP/HTTPS egress is restricted.",
 },
 {
 id: "q2",
 question: "What metric is most effective for automated detection of DNS tunneling in NIDS rules?",
 options: [
 "Domain query length and Shannon entropy",
 "The time of day the packet was sent",
 "The IP version of the sender",
 "Whether the DNS query came from a Windows or Mac client",
 ],
 correct_index: 0,
 explanation: "Legitimate domains have natural language structure. Encoded or encrypted subdomains used in DNS tunneling exhibit abnormal character length and high Shannon entropy (randomness).",
 },
 {
 id: "q3",
 question: "In Suricata NIDS, which log file provides comprehensive unified JSON telemetry including flows, alerts, and DNS events?",
 options: ["suricata.pcap", "eve.json", "fast.log", "audit.log"],
 correct_index: 1,
 explanation: "Suricata's EVE (Extensible Event) JSON architecture outputs all telemetry (alerts, HTTP, DNS, TLS, SSH, Netflow) into eve.json for seamless ingestion into SIEM platforms like Elasticsearch or Splunk.",
 },
 ],
 next_recommended: {
 title: "SQL Injection Incident Forensics",
 route: "/cyber-range/lab/sql-injection-incident-forensics",
 description: "Transition from perimeter network detection to investigating application-layer database compromise in web access logs.",
 },
 setupFilesystem: () => {
 const vfs = new VirtualFileSystem();
 vfs.mkdir("/captures");
 vfs.mkdir("/home/analyst");

 vfs.writeFile("/captures/incident.pcap", "<SIMULATED_PCAP_STREAM_HEADER_MAGIC_0xa1b2c3d4>");
 vfs.writeFile(
 "/captures/dns_queries.log",
 "10:00:01 10.0.0.45:53312 -> 8.8.8.8:53 query A api.github.com NOERROR\n" +
 "10:00:05 10.0.0.45:53313 -> 8.8.8.8:53 query A update.microsoft.com NOERROR\n" +
 "10:00:15 10.0.0.12:44111 -> 8.8.8.8:53 query A internal-portal.nisq.net NOERROR\n" +
 "10:01:00 10.0.0.45:53320 -> 8.8.8.8:53 query TXT RkxBR3tETlNfVFVOTkVMX0RFVEVDVEVEfQ==.exfil.nisq-defense.internal NOERROR\n" +
 "10:02:00 10.0.0.45:53321 -> 8.8.8.8:53 query A status.slack.com NOERROR\n",
 );
 vfs.writeFile(
 "/captures/suricata_eve.json",
 JSON.stringify(
 {
 timestamp: "2026-09-25T10:01:00.124Z",
 event_type: "alert",
 src_ip: "10.0.0.45",
 src_port: 53320,
 dest_ip: "8.8.8.8",
 dest_port: 53,
 proto: "UDP",
 alert: {
 action: "allowed",
 gid: 1,
 signature_id: 2028114,
 rev: 1,
 signature: "ET TROJAN DNS Query to High Entropy Suspicious Exfiltration Domain",
 category: "A Network Trojan was detected",
 severity: 1,
 },
 dns: {
 type: "query",
 id: 41203,
 rrname: "RkxBR3tETlNfVFVOTkVMX0RFVEVDVEVEfQ==.exfil.nisq-defense.internal",
 rrtype: "TXT",
 },
 },
 null,
 2,
 ) + "\n",
 );
 vfs.writeFile("/captures/extracted_flag.txt", "FLAG{DNS_TUNNEL_DETECTED}\n");
 vfs.writeFile(
 "/home/analyst/README.txt",
 "INVESTIGATION BRIEF:\n1. Inspect /captures to review packet captures and DNS query telemetry.\n2. Identify the anomalous query with high entropy sent to .exfil.nisq-defense.internal.\n3. Verify the decoded exfiltration payload in /captures/extracted_flag.txt.\n",
 );

 return vfs;
 },
};
