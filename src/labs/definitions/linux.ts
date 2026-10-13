import { LabDefinition } from "./types";
import { VirtualFileSystem } from "../engine/filesystem/vfs";

export const linuxSshBruteforceLab: LabDefinition = {
 id: "lab-ssh-bruteforce",
 slug: "linux-ssh-brute-force-investigation",
 title: "Linux SSH Brute Force Investigation",
 difficulty: "EASY",
 category: "Host Forensics",
 description:
 "An external adversary is conducting an automated credential-stuffing attack against the production gateway. Inspect /var/log/auth.log, identify the attacker's IP, determine the target accounts, and block the range.",
 estimated_minutes: 30,
 reward_points: 100,
 learning_objectives: [
 "Understand how Linux authentication events are recorded in /var/log/auth.log",
 "Parse Linux authentication logs using grep, awk, sort, and uniq pipelines",
 "Distinguish between benign typos and automated dictionary / credential-stuffing attacks",
 "Extract attacker source IP addresses and analyze attack frequency distribution",
 "Formulate defensive remediation strategies including Fail2Ban and firewall drop rules",
 ],
 prerequisites: [
 "Basic Linux command-line navigation (cd, ls, cat)",
 "Fundamentals of text filtering and pipes (|)",
 "Basic familiarity with SSH (Secure Shell) client-server architecture",
 ],
 conceptual_intro: `### Linux Authentication Architecture & SSH Threat Dynamics

In UNIX-like operating systems, the **Pluggable Authentication Modules (PAM)** framework handles identity verification across all interactive services, including the **OpenSSH daemon (\`sshd\`)**.

#### Where Are Auth Events Logged?
- **Debian / Ubuntu / Kali:** \`/var/log/auth.log\`
- **RHEL / CentOS / Fedora / Rocky:** \`/var/log/secure\`

#### Anatomy of an SSH Log Entry
Every authentication attempt creates a structured syslog message:
\`\`\`
Sep 25 10:14:01 gateway sshd[1234]: Failed password for invalid user admin from 192.168.1.105 port 54321 ssh2
\`\`\`
- **Timestamp:** \`Sep 25 10:14:01\` (Enables incident timeline reconstruction)
- **Hostname:** \`gateway\` (Identifies the target server)
- **Daemon & PID:** \`sshd[1234]\` (Identifies the authentication service process)
- **Event Result:** \`Failed password for invalid user admin\` (Indicates an unauthorized account probe)
- **Source IP:** \`192.168.1.105\` (The adversary's external or lateral IP address)
- **Source Port:** \`54321\` (Ephemeral client port)
- **Protocol:** \`ssh2\`

#### Benign Error vs. Automated Attack
- **Human Mistake:** 1 to 3 failed attempts, minutes apart, targeting a single valid username, followed by success.
- **Brute Force / Dictionary Attack:** Dozens or hundreds of attempts per minute, sequential timestamps, rotating common default accounts (\`root\`, \`admin\`, \`test\`, \`deploy\`).`,
 dataset_description:
 "The virtual host filesystem contains an authentic Linux syslog excerpt at /var/log/auth.log generated during a perimeter intrusion attempt. It records 50 rapid-fire failed SSH login attempts from an unauthorized source address, interspersed with system background processes and an authorized publickey session.",
 evidence_summary:
 "Primary indicators include 50 consecutive failed password entries originating from IP 192.168.1.105 hitting port 22 in rapid 1-second intervals, followed by authorized analyst access from internal subnet 10.0.0.5.",
 hints: [
 "Use 'grep \"Failed password\" /var/log/auth.log' to view unauthorized login bursts.",
 "The attacker's source IP address can be found in the log entries.",
 "The flag is located at /opt/nisq/vault/flag.txt.",
 ],
 progressive_hints: [
 {
 level: 1,
 title: "Conceptual Clue",
 hint: "Authentication failures from OpenSSH contain the distinct string 'Failed password'. Start by reading the authentication log file under /var/log/.",
 },
 {
 level: 2,
 title: "Investigation Strategy",
 hint: "Pipe grep's output into awk to isolate the column holding the remote IP address, then chain sort and 'uniq -c' to see how many times that IP tried logging in.",
 },
 {
 level: 3,
 title: "Exact Command Syntax",
 hint: "Run: grep 'Failed password' /var/log/auth.log | awk '{print $11}' | sort | uniq -c. Once verified, view /opt/nisq/vault/flag.txt for incident sign-off.",
 },
 ],
 tasks: [
 {
 id: "t1",
 title: "Inspect /var/log/auth.log for failed logins",
 description:
 "Run grep or cat on the auth log to isolate failed password attempts and examine the timestamp pattern.",
 command_hint: "grep 'Failed password' /var/log/auth.log | head -n 10",
 explanation:
 "Filtering for 'Failed password' isolates rejected attempts from routine session open/close notifications, allowing immediate calculation of attack velocity.",
 failure_guidance:
 "Ensure you use grep with 'Failed password' and target the path /var/log/auth.log.",
 progressive_hints: [
 { level: 1, text: "Focus on the /var/log/auth.log file using grep." },
 { level: 2, text: "Search specifically for the phrase 'Failed password'." },
 { level: 3, text: "Command: grep 'Failed password' /var/log/auth.log | head -n 10" },
 ],
 validate: (ctx, cmd) => {
 return cmd.includes("grep") && cmd.includes("Failed password") && cmd.includes("auth.log");
 },
 },
 {
 id: "t2",
 title: "Identify the primary attacking IP address",
 description: "Count the occurrences of failed attempts grouped by source IP address.",
 command_hint: "grep 'Failed password' /var/log/auth.log | awk '{print $11}' | sort | uniq -c",
 explanation:
 "Grouping and counting occurrences using awk, sort, and uniq -c generates an IP frequency distribution that proves the attack is automated from a single actor (192.168.1.105).",
 failure_guidance:
 "Chain awk, sort, and uniq to aggregate the IP counts from the failed attempts.",
 progressive_hints: [
 { level: 1, text: "You need to extract only the IP column from the grep results." },
 { level: 2, text: "In auth.log lines with 'invalid user', field 11 corresponds to the IP address." },
 { level: 3, text: "Command: grep 'Failed password' /var/log/auth.log | awk '{print $11}' | sort | uniq -c" },
 ],
 validate: (ctx, cmd) => {
 return cmd.includes("awk") && (cmd.includes("sort") || cmd.includes("uniq"));
 },
 },
 {
 id: "t3",
 title: "Extract the security flag from the vault",
 description: "Retrieve the incident sign-off flag from /opt/nisq/vault/flag.txt once the threat is identified.",
 command_hint: "cat /opt/nisq/vault/flag.txt",
 explanation:
 "In enterprise SOC operations, identifying the attacker's IP leads to firewall containment and generating an incident ticket report with cryptographic evidence.",
 failure_guidance:
 "Check /opt/nisq/vault/flag.txt using the cat command.",
 progressive_hints: [
 { level: 1, text: "Navigate or read the file stored in the /opt/nisq/vault directory." },
 { level: 2, text: "Use the cat utility to display the contents of flag.txt." },
 { level: 3, text: "Command: cat /opt/nisq/vault/flag.txt" },
 ],
 validate: (ctx, cmd) => {
 return (
 cmd.includes("cat") && cmd.includes("flag.txt") && ctx.stdout.join("").includes("FLAG{")
 );
 },
 },
 ],
 flag: "FLAG{BRUTE_F0RCE_BL0CKED}",
 completion_criteria: [
 "Successfully filtered authentication log events for unauthorized SSH connection attempts",
 "Quantified attack volume and identified attacker source IP 192.168.1.105",
 "Captured the incident resolution validation token from the security vault",
 ],
 final_assessment: [
 {
 id: "q1",
 question: "Which file records SSH authentication attempts on Debian and Ubuntu Linux systems?",
 options: ["/var/log/syslog.auth", "/var/log/auth.log", "/etc/ssh/audit.log", "/var/run/sshd.pid"],
 correct_index: 1,
 explanation: "Debian and Ubuntu direct PAM authentication messages to /var/log/auth.log by default via rsyslog/systemd-journald.",
 },
 {
 id: "q2",
 question: "Why is 'sort' required before running 'uniq -c' in a Linux shell pipeline?",
 options: [
 "Because uniq requires root privileges unless sorted first",
 "Because uniq only compares adjacent lines, so duplicate lines must be sorted together to be counted correctly",
 "Because sort compresses the data stream for faster processing",
 "Because uniq deletes all non-alphanumeric characters",
 ],
 correct_index: 1,
 explanation: "The uniq utility only checks adjacent lines. If duplicate occurrences are scattered throughout the stream, uniq will not group them unless the stream is pre-sorted.",
 },
 {
 id: "q3",
 question: "What defensive daemon monitors /var/log/auth.log and dynamically updates iptables to block repeated brute-force IPs?",
 options: ["AppArmor", "Fail2Ban", "SELinux", "systemd-networkd"],
 correct_index: 1,
 explanation: "Fail2Ban scans log files like /var/log/auth.log for failed login patterns and dynamically injects temporary or permanent iptables/nftables firewall rules to ban offending IP addresses.",
 },
 ],
 next_recommended: {
 title: "Suricata Network Threat Hunting & PCAP Analysis",
 route: "/cyber-range/lab/suricata-network-threat-hunting",
 description: "Advance from host authentication log inspection to network packet inspection and perimeter intrusion detection.",
 },
 setupFilesystem: () => {
 const vfs = new VirtualFileSystem();
 vfs.mkdir("/var/log");
 vfs.mkdir("/opt/nisq/vault");
 vfs.mkdir("/home/analyst");

 let authLog = "";
 const attackerIp = "192.168.1.105";
 const usernames = ["admin", "root", "guest", "oracle", "test", "deploy", "ubuntu", "postgres"];
 for (let i = 0; i < 50; i++) {
 const user = usernames[i % usernames.length];
 const sec = (i % 60).toString().padStart(2, "0");
 const min = Math.floor(i / 60) + 10;
 authLog += `Sep 25 ${min}:${sec}:01 gateway sshd[${2000 + i}]: Failed password for invalid user ${user} from ${attackerIp} port ${50000 + i} ssh2\n`;
 }
 authLog += `Sep 25 10:55:01 gateway sshd[3001]: Accepted publickey for analyst from 10.0.0.5 port 54322 ssh2\n`;

 vfs.writeFile("/var/log/auth.log", authLog);
 vfs.writeFile("/opt/nisq/vault/flag.txt", "FLAG{BRUTE_F0RCE_BL0CKED}\n");
 vfs.writeFile(
 "/home/analyst/README.txt",
 "INVESTIGATION OBJECTIVE:\n1. Inspect /var/log/auth.log to determine the adversary's IP address and attack rate.\n2. Count attempts using grep, awk, sort, and uniq pipelines.\n3. Retrieve the containment token from /opt/nisq/vault/flag.txt and submit below.\n",
 );

 return vfs;
 },
};
