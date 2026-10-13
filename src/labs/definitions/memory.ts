import { LabDefinition } from "./types";
import { VirtualFileSystem } from "../engine/filesystem/vfs";

export const memoryForensicsLab: LabDefinition = {
 id: "lab-memory-forensics",
 slug: "memory-forensics-with-volatility-3",
 title: "Memory Forensics with Volatility 3 (Simulation)",
 difficulty: "HARD",
 category: "Endpoint Forensics",
 description:
 "Investigate volatile physical RAM artifacts from a compromised Windows workstation. Identify the rogue process tree, trace stealthy outbound network sockets, correlate indicators of compromise (IOCs), and submit the containment flag.",
 estimated_minutes: 60,
 reward_points: 200,
 learning_objectives: [
 "Understand the Order of Volatility (RFC 3227) and why RAM holds critical transient evidence",
 "Examine Volatility 3 process list artifacts (windows.pslist) to spot abnormal parent-child hierarchies",
 "Analyze active network connection tables (windows.netscan) to identify covert C2 communication",
 "Correlate rogue Process IDs (PIDs) with open network sockets and destination IP addresses",
 "Extract cryptographic evidence tokens verifying successful triage of the endpoint compromise",
 ],
 prerequisites: [
 "Understanding of Windows process architecture (PIDs, PPIDs, system services like svchost, csrss, lsass)",
 "Fundamentals of network transport states (TCP ESTABLISHED, listening sockets)",
 "Basic familiarity with Digital Forensics and Incident Response (DFIR) principles",
 ],
 conceptual_intro: `### Memory Forensics & Endpoint Artifact Analysis

When an adversary breaches an endpoint, modern malware frequently resides strictly in memory—avoiding disk writes to bypass static antivirus scans. **Memory Forensics** allows incident responders to inspect the exact runtime state of the operating system.

#### The Order of Volatility (RFC 3227)
Digital evidence degrades over time or is lost when power is disconnected:
1. **Registers, Cache:** Extremely transient (nanoseconds)
2. **Routing tables, ARP cache, process table, kernel memory:** Transient (lost on reboot)
3. **Temporary file systems / Swap space:** Highly volatile
4. **Disk storage:** Non-volatile
5. **Remote logs & backups:** Archived

#### Key Volatility 3 Analysis Plugins
- **\`windows.pslist\`:** Walks the active doubly-linked list of \`EPROCESS\` structures in the Windows kernel. Reveals Process Name, PID, Parent PID (PPID), thread counts, and start times.
  - *Suspicious Pattern:* A user-space binary (\`malware.exe\`) claiming to have \`svchost.exe\` or \`winlogon.exe\` as an abnormal parent, or running from temp directories.
- **\`windows.netscan\`:** Scans memory pool allocations for TCP endpoints and socket objects (\`INADDR\` structures), revealing open ports, connected foreign IPs, and corresponding PIDs.
  - *Suspicious Pattern:* Process connecting outbound to port 4444 (Metasploit default) or uncommon high ports.`,
 dataset_description:
 "The virtual workspace provides pre-extracted Volatility 3 forensic artifacts inside /evidence/: a process list report (/evidence/pslist.txt) and an active socket scan report (/evidence/netscan.txt), along with the forensic investigation flag in /evidence/flag.txt.",
 evidence_summary:
 "Workstation memory contains a rogue process 'malware.exe' (PID 4092) spawned abnormally under svchost.exe (PPID 3124). Netscan telemetry confirms PID 4092 maintains an active TCP connection to external C2 address 192.168.1.100 on port 4444.",
 hints: [
 "Review the process list extraction in /evidence/pslist.txt first.",
 "Look for suspicious network connections on unusual ports in /evidence/netscan.txt.",
 "The resolution token is located in /evidence/flag.txt.",
 ],
 progressive_hints: [
 {
 level: 1,
 title: "Conceptual Clue",
 hint: "Start by inspecting the files in /evidence. Look for anomalous process names that do not match standard Windows system binaries.",
 },
 {
 level: 2,
 title: "Investigation Strategy",
 hint: "Check /evidence/pslist.txt for malware.exe and note its PID (4092). Then verify in /evidence/netscan.txt if that PID is transmitting to a foreign IP.",
 },
 {
 level: 3,
 title: "Exact Command Syntax",
 hint: "View /evidence/pslist.txt with cat, check /evidence/netscan.txt, and view /evidence/flag.txt to capture the flag.",
 },
 ],
 tasks: [
 {
 id: "t1",
 title: "Inspect Process List Telemetry",
 description: "Review the extracted process list from the memory dump to identify anomalous running binaries.",
 command_hint: "cat /evidence/pslist.txt",
 explanation:
 "Examining the process tree reveals that PID 4092 ('malware.exe') is running alongside legitimate system processes.",
 failure_guidance: "Use 'cat /evidence/pslist.txt' to examine active processes.",
 progressive_hints: [
 { level: 1, text: "Navigate or inspect files in /evidence." },
 { level: 2, text: "Read pslist.txt." },
 { level: 3, text: "Command: cat /evidence/pslist.txt" },
 ],
 validate: (ctx, cmd) => cmd.includes("cat") && cmd.includes("pslist.txt"),
 },
 {
 id: "t2",
 title: "Identify Network Connections & C2 Endpoint",
 description: "Review extracted network connection artifacts to locate the malicious outbound C2 IP and port.",
 command_hint: "cat /evidence/netscan.txt",
 explanation:
 "The netscan output links PID 4092 to foreign IP 192.168.1.100 on port 4444 (ESTABLISHED), confirming an active reverse shell.",
 failure_guidance: "Run 'cat /evidence/netscan.txt' to inspect active network sockets.",
 progressive_hints: [
 { level: 1, text: "Check the network telemetry file in /evidence." },
 { level: 2, text: "Read netscan.txt." },
 { level: 3, text: "Command: cat /evidence/netscan.txt" },
 ],
 validate: (ctx, cmd) => cmd.includes("cat") && cmd.includes("netscan.txt"),
 },
 {
 id: "t3",
 title: "Submit the Endpoint Containment Flag",
 description: "Submit the forensic verification flag located in /evidence/flag.txt.",
 command_hint: "cat /evidence/flag.txt",
 explanation:
 "Extracting the containment token verifies that the host compromise has been fully scoped for incident report generation.",
 failure_guidance: "View the contents of /evidence/flag.txt with cat.",
 progressive_hints: [
 { level: 1, text: "Look for flag.txt in /evidence." },
 { level: 2, text: "Use cat to read the flag file." },
 { level: 3, text: "Command: cat /evidence/flag.txt" },
 ],
 validate: (ctx, cmd) => cmd.includes("cat") && cmd.includes("flag.txt"),
 },
 ],
 flag: "FLAG{MEM_FORENSICS_ROOTKIT}",
 completion_criteria: [
 "Analyzed Windows process list hierarchy from memory capture",
 "Identified rogue process (malware.exe PID 4092) and associated foreign C2 endpoint",
 "Retrieved and submitted forensic case sign-off flag",
 ],
 final_assessment: [
 {
 id: "q1",
 question: "According to RFC 3227, why should volatile RAM be acquired before taking an offline disk image?",
 options: [
 "Because RAM data is permanently lost when the computer loses power or reboots",
 "Because hard drives take up more physical space",
 "Because RAM contains less confidential information than hard drives",
 "Because antivirus software only scans hard drives",
 ],
 correct_index: 0,
 explanation: "RAM is volatile memory; once power is cut, all in-memory cryptographic keys, unencrypted passwords, running processes, and open network sockets disappear permanently.",
 },
 {
 id: "q2",
 question: "In Windows architecture, what legitimate system process should be the parent (PPID) of user svchost.exe instances?",
 options: ["explorer.exe", "services.exe", "notepad.exe", "calc.exe"],
 correct_index: 1,
 explanation: "The Service Control Manager (services.exe) is responsible for starting and managing system services, so all legitimate svchost.exe instances should have services.exe as their parent process.",
 },
 {
 id: "q3",
 question: "Which Volatility 3 plugin is used to identify network sockets and active TCP/UDP connections in a 64-bit Windows memory image?",
 options: ["windows.netscan", "windows.malfind", "windows.dlllist", "windows.handles"],
 correct_index: 0,
 explanation: "The 'windows.netscan' plugin scans physical memory for socket structures and pools to reconstruct historical and active network connections.",
 },
 ],
 next_recommended: {
 title: "SOC Analysis & Threat Hunting Capstone",
 route: "/cyber-range/learning-paths",
 description: "Synthesize host log analysis, network threat hunting, web application forensics, and memory triage into full-spectrum blue team operations.",
 },
 setupFilesystem: () => {
 const vfs = new VirtualFileSystem();
 vfs.mkdir("/evidence");
 vfs.mkdir("/home/analyst");

 vfs.writeFile(
 "/evidence/pslist.txt",
 "PID   PPID  IMAGE_FILE_NAME    OFFSET(V)           THREADS  HANDLES  TIME_CREATED\n" +
 "4     0     System             0xffff800000000000  182      0        2026-09-25 08:00:00\n" +
 "352   4     smss.exe           0xffff800000001000  5        32       2026-09-25 08:00:01\n" +
 "544   536   csrss.exe          0xffff800000002000  12       240      2026-09-25 08:00:02\n" +
 "600   536   wininit.exe        0xffff800000003000  4        180      2026-09-25 08:00:02\n" +
 "696   600   services.exe       0xffff800000004000  18       450      2026-09-25 08:00:03\n" +
 "712   600   lsass.exe          0xffff800000005000  8        620      2026-09-25 08:00:03\n" +
 "3124  696   svchost.exe        0xffff800000006000  24       350      2026-09-25 08:00:10\n" +
 "4092  3124  malware.exe        0xffff800000007000  3        45       2026-09-25 10:14:22\n",
 );
 vfs.writeFile(
 "/evidence/netscan.txt",
 "Offset              Proto  Local Address          Foreign Address        State        PID   Owner\n" +
 "0x1a2b3c4d5e00      TCP    0.0.0.0:135            0.0.0.0:0              LISTENING    696   services.exe\n" +
 "0x1a2b3c4d5e80      TCP    0.0.0.0:445            0.0.0.0:0              LISTENING    4     System\n" +
 "0x1a2b3c4d6f00      TCP    10.0.0.15:49152        192.168.1.100:4444     ESTABLISHED  4092  malware.exe\n" +
 "0x1a2b3c4d7f00      UDP    10.0.0.15:137          *:*                                 4     System\n",
 );
 vfs.writeFile("/evidence/flag.txt", "FLAG{MEM_FORENSICS_ROOTKIT}\n");
 vfs.writeFile(
 "/home/analyst/README.txt",
 "CASE INSTRUCTIONS:\n1. Inspect /evidence/pslist.txt to find any unexpected or rogue processes.\n2. Correlate with /evidence/netscan.txt to identify active C2 beaconing connections.\n3. Verify the final incident containment flag in /evidence/flag.txt and submit.\n",
 );

 return vfs;
 },
};
