import { LabDefinition } from "./types";
import { VirtualFileSystem } from "../engine/filesystem/vfs";

export const memoryForensicsLab: LabDefinition = {
  id: "lab-memory-forensics",
  slug: "memory-forensics-with-volatility-3",
  title: "Memory Forensics with Volatility 3 (Simulation)",
  difficulty: "HARD",
  category: "Endpoint Forensics",
  description:
    "Investigate memory artifacts from a compromised Windows workstation. Identify the malicious process and hidden connections. Note: This is a simulated offline environment of extracted Volatility 3 artifacts.",
  estimated_minutes: 60,
  reward_points: 200,
  learning_objectives: [
    "Analyze memory extraction artifacts",
    "Identify rogue processes and process hollowing",
    "Trace malicious network connections from memory dumps",
  ],
  hints: [
    "Review the process list extraction first.",
    "Look for suspicious network connections on unusual ports.",
  ],
  flag: "FLAG{MEM_FORENSICS_ROOTKIT}",
  tasks: [
    {
      id: "t1",
      title: "Inspect Process List",
      description: "Review the extracted process list from the memory dump.",
      command_hint: "cat /evidence/pslist.txt",
      validate: (ctx, cmd) => cmd.includes("cat") && cmd.includes("pslist.txt"),
    },
    {
      id: "t2",
      title: "Identify Network Connections",
      description: "Review the extracted network connections to find the C2 IP.",
      command_hint: "cat /evidence/netscan.txt",
      validate: (ctx, cmd) => cmd.includes("cat") && cmd.includes("netscan.txt"),
    },
    {
      id: "t3",
      title: "Submit the Flag",
      description: "Submit the security flag located in the evidence directory.",
      command_hint: "cat /evidence/flag.txt",
      validate: (ctx, cmd) => cmd.includes("cat") && cmd.includes("flag.txt"),
    },
  ],
  setupFilesystem: () => {
    const vfs = new VirtualFileSystem();
    vfs.mkdir("/evidence");
    vfs.mkdir("/home/analyst");

    vfs.writeFile(
      "/evidence/pslist.txt",
      "PID   PPID  IMAGE_FILE_NAME\n4     0     System\n352   4     smss.exe\n544   536   csrss.exe\n600   536   wininit.exe\n656   592   csrss.exe\n696   600   services.exe\n712   600   lsass.exe\n3124  696   svchost.exe\n4092  3124  malware.exe\n",
    );
    vfs.writeFile(
      "/evidence/netscan.txt",
      "Proto  Local Address          Foreign Address        State       PID\nTCP    10.0.0.15:49152        192.168.1.100:4444     ESTABLISHED 4092\n",
    );
    vfs.writeFile("/evidence/flag.txt", "FLAG{MEM_FORENSICS_ROOTKIT}\n");

    return vfs;
  },
};
