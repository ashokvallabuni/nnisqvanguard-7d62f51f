import { useState } from "react";
import { Folder, FolderOpen, FileText, Shield, AlertTriangle, Terminal, Info } from "lucide-react";

interface DirectoryNode {
  name: string;
  path: string;
  purpose: string;
  criticalFiles: string[];
  securityRelevance: string;
}

const LINUX_DIRECTORIES: DirectoryNode[] = [
  {
    name: "etc",
    path: "/etc",
    purpose: "Host-specific system-wide configuration files and startup scripts.",
    criticalFiles: ["/etc/passwd (User accounts)", "/etc/shadow (Hashed passwords)", "/etc/sudoers (Sudo permissions)", "/etc/ssh/sshd_config"],
    securityRelevance: "High-value target. Misconfigured permissions on /etc/passwd or /etc/shadow lead directly to root privilege escalation.",
  },
  {
    name: "var",
    path: "/var",
    purpose: "Variable data files created during runtime (logs, mail spools, databases).",
    criticalFiles: ["/var/log/auth.log (Auth attempts)", "/var/log/syslog", "/var/www/html (Web root)", "/var/run"],
    securityRelevance: "Essential for forensic triage and threat hunting. Attackers often attempt to truncate or delete logs in /var/log to cover their tracks.",
  },
  {
    name: "bin",
    path: "/bin",
    purpose: "Essential user command binaries required for single-user mode and system recovery.",
    criticalFiles: ["/bin/bash", "/bin/sh", "/bin/ls", "/bin/cat", "/bin/grep"],
    securityRelevance: "SUID binaries in /bin or /usr/bin can be exploited via GTFOBins for unprivileged root shell escapes.",
  },
  {
    name: "proc",
    path: "/proc",
    purpose: "Virtual pseudo-filesystem providing an interface to the Linux kernel state and process table.",
    criticalFiles: ["/proc/version (Kernel version)", "/proc/net/tcp (Active sockets)", "/proc/[PID]/cmdline", "/proc/sys/fs/suid_dumpable"],
    securityRelevance: "Allows defenders and attackers to inspect memory maps, open file descriptors, and detect hidden rootkit processes.",
  },
  {
    name: "tmp",
    path: "/tmp",
    purpose: "Temporary files directory accessible by all users with the sticky bit (+t) set.",
    criticalFiles: ["/tmp/sess_*", "/tmp/.X11-unix", "Malware staging scripts"],
    securityRelevance: "Common staging ground for threat actors to download and execute reverse shells, cryptominers, or exploit payloads.",
  },
  {
    name: "home",
    path: "/home",
    purpose: "User home directories containing personal files, bash history, and SSH keys.",
    criticalFiles: ["~/.ssh/authorized_keys", "~/.bash_history", "~/.ssh/id_rsa"],
    securityRelevance: "Leaked private keys or command history in ~/.bash_history often expose sensitive API tokens and credentials.",
  },
  {
    name: "opt",
    path: "/opt",
    purpose: "Optional add-on third-party software packages.",
    criticalFiles: ["/opt/nisq-sandbox", "/opt/custom_agent"],
    securityRelevance: "Custom third-party scripts frequently run with insecure file permissions or unquoted service paths.",
  },
  {
    name: "root",
    path: "/root",
    purpose: "Home directory of the superuser (root).",
    criticalFiles: ["/root/.ssh/id_rsa", "/root/.bash_history"],
    securityRelevance: "Accessible only by root (permissions 700). Contains root SSH credentials and administration history.",
  },
];

export function LinuxFilesystemTree() {
  const [selectedDir, setSelectedDir] = useState<DirectoryNode>(LINUX_DIRECTORIES[0]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-6 shadow-xs my-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div>
          <h4 className="font-display font-bold text-base text-foreground flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span>Interactive Linux Filesystem Hierarchy (FHS)</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click any directory to inspect its purpose, critical system files, and security relevance.
          </p>
        </div>
        <span className="text-[0.65rem] font-mono uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          Filesystem Standard
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Interactive Tree */}
        <div className="lg:col-span-5 p-4 rounded-xl border border-border bg-slate-950 text-slate-100 font-mono text-xs space-y-1.5">
          <div className="text-slate-400 text-[0.7rem] uppercase border-b border-slate-800 pb-2 mb-2 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-primary" />
            <span>Root Filesystem ( / )</span>
          </div>

          <div className="space-y-1 pl-2">
            {LINUX_DIRECTORIES.map((dir) => {
              const isSelected = selectedDir.path === dir.path;
              return (
                <button
                  key={dir.path}
                  onClick={() => setSelectedDir(dir)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Folder className={`w-3.5 h-3.5 ${isSelected ? "text-primary-foreground" : "text-amber-400"}`} />
                    <span>/{dir.name}</span>
                  </span>
                  <span className={`text-[0.6rem] uppercase ${isSelected ? "text-primary-foreground/80" : "text-slate-500"}`}>
                    Inspect →
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected Directory Inspection Card */}
        <div className="lg:col-span-7 rounded-xl border border-primary/30 bg-muted/20 p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[0.65rem] font-mono text-muted-foreground uppercase">
                Directory Inspector
              </span>
              <h5 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                <span>{selectedDir.path}</span>
              </h5>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-card border border-border space-y-1 text-xs">
            <span className="font-mono text-[0.65rem] uppercase text-muted-foreground font-semibold">
              Primary Purpose & Function
            </span>
            <p className="text-foreground/90 leading-relaxed">{selectedDir.purpose}</p>
          </div>

          <div className="p-3 rounded-lg bg-card border border-border space-y-2 text-xs">
            <span className="font-mono text-[0.65rem] uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-accent" />
              <span>Critical Security Files</span>
            </span>
            <ul className="space-y-1 font-mono text-[0.7rem] text-foreground">
              {selectedDir.criticalFiles.map((file, i) => (
                <li key={i} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="text-primary">•</span>
                  <span>{file}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-card border border-destructive/30 space-y-1 text-xs">
            <span className="font-mono text-[0.65rem] uppercase text-destructive font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Security Relevance & Attack Vectors
            </span>
            <p className="text-foreground/90 leading-relaxed">{selectedDir.securityRelevance}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
