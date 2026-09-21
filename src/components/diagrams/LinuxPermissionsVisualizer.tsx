import { useState, useMemo } from "react";
import { Key, Shield, AlertTriangle, Check, Terminal, Info } from "lucide-react";

export function LinuxPermissionsVisualizer() {
  const [userPerms, setUserPerms] = useState({ r: true, w: true, x: true });
  const [groupPerms, setGroupPerms] = useState({ r: true, w: false, x: true });
  const [otherPerms, setOtherPerms] = useState({ r: true, w: false, x: false });
  const [isDir, setIsDir] = useState(false);

  // Calculate Octal values
  const userVal = (userPerms.r ? 4 : 0) + (userPerms.w ? 2 : 0) + (userPerms.x ? 1 : 0);
  const groupVal = (groupPerms.r ? 4 : 0) + (groupPerms.w ? 2 : 0) + (groupPerms.x ? 1 : 0);
  const otherVal = (otherPerms.r ? 4 : 0) + (otherPerms.w ? 2 : 0) + (otherPerms.x ? 1 : 0);
  const octal = `${userVal}${groupVal}${otherVal}`;

  // Symbolic string
  const symbolic = `${isDir ? "d" : "-"}${userPerms.r ? "r" : "-"}${userPerms.w ? "w" : "-"}${userPerms.x ? "x" : "-"}${groupPerms.r ? "r" : "-"}${groupPerms.w ? "w" : "-"}${groupPerms.x ? "x" : "-"}${otherPerms.r ? "r" : "-"}${otherPerms.w ? "w" : "-"}${otherPerms.x ? "x" : "-"}`;

  const setPreset = (u: number, g: number, o: number, dir = false) => {
    setUserPerms({ r: (u & 4) !== 0, w: (u & 2) !== 0, x: (u & 1) !== 0 });
    setGroupPerms({ r: (g & 4) !== 0, w: (g & 2) !== 0, x: (g & 1) !== 0 });
    setOtherPerms({ r: (o & 4) !== 0, w: (o & 2) !== 0, x: (o & 1) !== 0 });
    setIsDir(dir);
  };

  const isDangerous = otherPerms.w || (userVal === 7 && groupVal === 7 && otherVal === 7);

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-6 shadow-xs my-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div>
          <h4 className="font-display font-bold text-base text-foreground flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            <span>Interactive Linux File Permissions & `chmod` Calculator</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Toggle read, write, and execute bits to visualize symbolic modes, octal values, and security constraints.
          </p>
        </div>
        <span className="text-[0.65rem] font-mono uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          POSIX Permissions
        </span>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-mono text-muted-foreground mr-1">Common Presets:</span>
        <button
          onClick={() => setPreset(7, 5, 5, false)}
          className="px-2.5 py-1 text-xs font-mono rounded-md border border-border bg-muted/30 hover:bg-muted"
        >
          755 (Standard Script)
        </button>
        <button
          onClick={() => setPreset(6, 4, 4, false)}
          className="px-2.5 py-1 text-xs font-mono rounded-md border border-border bg-muted/30 hover:bg-muted"
        >
          644 (Standard File)
        </button>
        <button
          onClick={() => setPreset(6, 0, 0, false)}
          className="px-2.5 py-1 text-xs font-mono rounded-md border border-border bg-muted/30 hover:bg-muted"
        >
          600 (SSH Private Key)
        </button>
        <button
          onClick={() => setPreset(7, 0, 0, true)}
          className="px-2.5 py-1 text-xs font-mono rounded-md border border-border bg-muted/30 hover:bg-muted"
        >
          700 (Private Directory)
        </button>
        <button
          onClick={() => setPreset(7, 7, 7, false)}
          className="px-2.5 py-1 text-xs font-mono rounded-md border border-destructive/40 text-destructive bg-destructive/10 hover:bg-destructive/20"
        >
          777 (World Writable ⚠️)
        </button>
      </div>

      {/* Permissions Bit Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* User (Owner) */}
        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-foreground uppercase font-mono">Owner (User)</span>
            <span className="text-xs font-mono font-bold text-primary">{userVal} (rwx)</span>
          </div>

          <div className="space-y-2">
            {[
              { key: "r", label: "Read (r = 4)", state: userPerms.r },
              { key: "w", label: "Write (w = 2)", state: userPerms.w },
              { key: "x", label: "Execute (x = 1)", state: userPerms.x },
            ].map((p) => (
              <label key={p.key} className="flex items-center gap-2 text-xs font-mono text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={p.state}
                  onChange={(e) =>
                    setUserPerms((prev) => ({ ...prev, [p.key]: e.target.checked }))
                  }
                  className="rounded accent-primary"
                />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Group */}
        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-foreground uppercase font-mono">Group</span>
            <span className="text-xs font-mono font-bold text-accent">{groupVal} (rwx)</span>
          </div>

          <div className="space-y-2">
            {[
              { key: "r", label: "Read (r = 4)", state: groupPerms.r },
              { key: "w", label: "Write (w = 2)", state: groupPerms.w },
              { key: "x", label: "Execute (x = 1)", state: groupPerms.x },
            ].map((p) => (
              <label key={p.key} className="flex items-center gap-2 text-xs font-mono text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={p.state}
                  onChange={(e) =>
                    setGroupPerms((prev) => ({ ...prev, [p.key]: e.target.checked }))
                  }
                  className="rounded accent-primary"
                />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Others */}
        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-foreground uppercase font-mono">Others (World)</span>
            <span className="text-xs font-mono font-bold text-warning">{otherVal} (rwx)</span>
          </div>

          <div className="space-y-2">
            {[
              { key: "r", label: "Read (r = 4)", state: otherPerms.r },
              { key: "w", label: "Write (w = 2)", state: otherPerms.w },
              { key: "x", label: "Execute (x = 1)", state: otherPerms.x },
            ].map((p) => (
              <label key={p.key} className="flex items-center gap-2 text-xs font-mono text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={p.state}
                  onChange={(e) =>
                    setOtherPerms((prev) => ({ ...prev, [p.key]: e.target.checked }))
                  }
                  className="rounded accent-primary"
                />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Symbolic & Command Result */}
      <div className="p-5 rounded-xl border border-border bg-slate-950 text-slate-100 font-mono text-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <div className="text-slate-400 text-[0.65rem] uppercase">Symbolic Representation:</div>
            <div className="text-2xl font-bold tracking-wider text-green-400 mt-0.5">{symbolic}</div>
          </div>

          <div className="text-right">
            <div className="text-slate-400 text-[0.65rem] uppercase">Linux Command:</div>
            <div className="text-base font-bold text-primary bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800">
              chmod {octal} filename
            </div>
          </div>
        </div>

        <div className="text-slate-300 text-xs leading-relaxed space-y-1">
          <div>
            <span className="text-primary font-bold">User ({userVal}): </span>
            {userPerms.r ? "4(r) " : ""}
            {userPerms.w ? "+ 2(w) " : ""}
            {userPerms.x ? "+ 1(x) " : ""}
            = {userVal}
          </div>
          <div>
            <span className="text-accent font-bold">Group ({groupVal}): </span>
            {groupPerms.r ? "4(r) " : ""}
            {groupPerms.w ? "+ 2(w) " : ""}
            {groupPerms.x ? "+ 1(x) " : ""}
            = {groupVal}
          </div>
          <div>
            <span className="text-warning font-bold">Others ({otherVal}): </span>
            {otherPerms.r ? "4(r) " : ""}
            {otherPerms.w ? "+ 2(w) " : ""}
            {otherPerms.x ? "+ 1(x) " : ""}
            = {otherVal}
          </div>
        </div>
      </div>

      {/* Security Warning If Dangerous */}
      {isDangerous && (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold font-mono uppercase">Security Risk Warning: </span>
            <span>
              World-writable permissions (Others has write access) allow any local user or malicious process to overwrite, tamper with, or hijack this file. Never use 777 in production.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
