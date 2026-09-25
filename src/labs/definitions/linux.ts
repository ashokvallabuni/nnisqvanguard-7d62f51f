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
    "Parse Linux authentication logs using grep, awk, and sort",
    "Identify failed password patterns and automated dictionary attacks",
    "Extract attacker IP addresses and frequency distribution",
  ],
  hints: [
    "Use 'grep \"Failed password\" /var/log/auth.log' to view unauthorized login bursts.",
    "The attacker's source IP address can be found in the log entries.",
    "The flag is located at /opt/nisq/vault/flag.txt.",
  ],
  flag: "FLAG{BRUTE_F0RCE_BL0CKED}",
  tasks: [
    {
      id: "t1",
      title: "Inspect /var/log/auth.log for failed logins",
      description: "Run grep or cat on the auth log to isolate failed password attempts.",
      command_hint: "grep 'Failed password' /var/log/auth.log | head -n 10",
      validate: (ctx, cmd) => {
        return cmd.includes("grep") && cmd.includes("Failed password") && cmd.includes("auth.log");
      },
    },
    {
      id: "t2",
      title: "Identify the primary attacking IP address",
      description: "Count the occurrences of failed attempts grouped by source IP.",
      command_hint: "grep 'Failed password' /var/log/auth.log | awk '{print $11}' | sort | uniq -c",
      validate: (ctx, cmd) => {
        return cmd.includes("awk") && (cmd.includes("sort") || cmd.includes("uniq"));
      },
    },
    {
      id: "t3",
      title: "Extract the security flag from the vault",
      description: "Submit the captured flag found in /opt/nisq/vault/flag.txt once verified.",
      command_hint: "cat /opt/nisq/vault/flag.txt",
      validate: (ctx, cmd) => {
        return (
          cmd.includes("cat") && cmd.includes("flag.txt") && ctx.stdout.join("").includes("FLAG{")
        );
      },
    },
  ],
  setupFilesystem: () => {
    const vfs = new VirtualFileSystem();
    vfs.mkdir("/var/log");
    vfs.mkdir("/opt/nisq/vault");
    vfs.mkdir("/home/analyst");

    // Generate some fake auth log
    let authLog = "";
    const attackerIp = "192.168.1.105";
    for (let i = 0; i < 50; i++) {
      authLog += `Sep 25 10:${i.toString().padStart(2, "0")}:01 gateway sshd[1234]: Failed password for invalid user admin from ${attackerIp} port 54321 ssh2\n`;
    }
    authLog += `Sep 25 10:55:01 gateway sshd[1235]: Accepted publickey for analyst from 10.0.0.5 port 54322 ssh2\n`;

    vfs.writeFile("/var/log/auth.log", authLog);
    vfs.writeFile("/opt/nisq/vault/flag.txt", "FLAG{BRUTE_F0RCE_BL0CKED}\n");
    vfs.writeFile(
      "/home/analyst/README.txt",
      "Investigate /var/log/auth.log to find the attacker.\n",
    );

    return vfs;
  },
};
