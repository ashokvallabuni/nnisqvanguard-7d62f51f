import { LabDefinition } from "./types";
import { VirtualFileSystem } from "../engine/filesystem/vfs";

export const suricataNidsLab: LabDefinition = {
  id: "lab-suricata-nids",
  slug: "suricata-network-threat-hunting",
  title: "Suricata Network Threat Hunting & PCAP Analysis",
  difficulty: "MEDIUM",
  category: "Network Defense",
  description: "Inspect captured perimeter traffic from an active C2 beaconing incident. Identify beaconing intervals, uncover DNS tunneling payloads, and extract the exfiltrated flag.",
  estimated_minutes: 45,
  reward_points: 150,
  learning_objectives: [
    "Analyze network PCAP files using tshark and Wireshark filters",
    "Detect regular interval beaconing traffic associated with C2 frameworks",
    "Decode high-entropy base64 subdomains used for DNS data exfiltration"
  ],
  hints: [
    "Look for DNS queries ending in .exfil.nisq-defense.internal.",
    "Base64 decode the prefix string to read the flag."
  ],
  flag: "FLAG{DNS_TUNNEL_DETECTED}",
  tasks: [
    {
      id: "t1",
      title: "List capture files in /captures",
      description: "Locate the primary incident packet capture file.",
      command_hint: "ls -la /captures",
      validate: (ctx, cmd) => cmd.includes("ls") && cmd.includes("/captures")
    },
    {
      id: "t2",
      title: "Analyze DNS queries with tshark",
      description: "Filter DNS query names to identify anomalous long subdomains.",
      command_hint: "cat /captures/dns_queries.log | grep exfil",
      validate: (ctx, cmd) => cmd.includes("grep") && (cmd.includes("exfil") || cmd.includes("dns"))
    },
    {
      id: "t3",
      title: "Capture and submit the exfiltration flag",
      description: "Decode the secret flag transmitted in the DNS payload.",
      command_hint: "cat /captures/extracted_flag.txt",
      validate: (ctx, cmd) => cmd.includes("cat") && cmd.includes("extracted_flag")
    }
  ],
  setupFilesystem: () => {
    const vfs = new VirtualFileSystem();
    vfs.mkdir("/captures");
    vfs.mkdir("/home/analyst");
    
    // Instead of raw pcap for browser simulation, we'll provide parsed logs
    vfs.writeFile("/captures/incident.pcap", "<BINARY_PCAP_DATA>");
    vfs.writeFile("/captures/dns_queries.log", "10:00:01 query api.github.com\n10:00:05 query update.microsoft.com\n10:01:00 query RkxBR3tETlNfVFVOTkVMX0RFVEVDVEVEfQ==.exfil.nisq-defense.internal\n");
    vfs.writeFile("/captures/extracted_flag.txt", "FLAG{DNS_TUNNEL_DETECTED}\n");
    vfs.writeFile("/home/analyst/README.txt", "Analyze the DNS queries to find the exfiltration attempt.\n");
    
    return vfs;
  }
};
