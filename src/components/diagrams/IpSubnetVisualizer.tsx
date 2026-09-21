import { useState, useMemo } from "react";
import { Calculator, Network, Binary, Shield, Info, ArrowRight } from "lucide-react";

export function IpSubnetVisualizer() {
  const [ipInput, setIpInput] = useState("192.168.1.10");
  const [cidrInput, setCidrInput] = useState(24);

  // Subnet calculations
  const calculation = useMemo(() => {
    try {
      const octets = ipInput.split(".").map((o) => parseInt(o, 10));
      if (octets.length !== 4 || octets.some((o) => isNaN(o) || o < 0 || o > 255)) {
        return null;
      }

      const ipNum =
        ((octets[0] << 24) >>> 0) +
        ((octets[1] << 16) >>> 0) +
        ((octets[2] << 8) >>> 0) +
        (octets[3] >>> 0);

      const maskNum = cidrInput === 0 ? 0 : (~0 << (32 - cidrInput)) >>> 0;
      const netNum = (ipNum & maskNum) >>> 0;
      const broadcastNum = (netNum | ~maskNum) >>> 0;

      const numToIp = (num: number) =>
        [
          (num >>> 24) & 255,
          (num >>> 16) & 255,
          (num >>> 8) & 255,
          num & 255,
        ].join(".");

      const toBinary = (num: number) =>
        [
          ((num >>> 24) & 255).toString(2).padStart(8, "0"),
          ((num >>> 16) & 255).toString(2).padStart(8, "0"),
          ((num >>> 8) & 255).toString(2).padStart(8, "0"),
          (num & 255).toString(2).padStart(8, "0"),
        ].join(".");

      const totalHosts = Math.pow(2, 32 - cidrInput);
      const usableHosts = cidrInput >= 31 ? 0 : Math.max(0, totalHosts - 2);

      const firstHost = cidrInput >= 31 ? "N/A" : numToIp(netNum + 1);
      const lastHost = cidrInput >= 31 ? "N/A" : numToIp(broadcastNum - 1);

      return {
        ip: ipInput,
        cidr: cidrInput,
        networkAddress: numToIp(netNum),
        broadcastAddress: numToIp(broadcastNum),
        subnetMask: numToIp(maskNum),
        firstHost,
        lastHost,
        totalHosts,
        usableHosts,
        binaryIp: toBinary(ipNum),
        binaryMask: toBinary(maskNum),
        binaryNet: toBinary(netNum),
      };
    } catch {
      return null;
    }
  }, [ipInput, cidrInput]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-6 shadow-xs my-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div>
          <h4 className="font-display font-bold text-base text-foreground flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            <span>Interactive IPv4 Subnetting & CIDR Calculator</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Modify the IP and CIDR prefix to calculate network boundaries, host ranges, and binary bit masks.
          </p>
        </div>
        <span className="text-[0.65rem] font-mono uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          RFC 4632 / CIDR
        </span>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-border bg-muted/20">
        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1">
            IPv4 Address:
          </label>
          <input
            type="text"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value.trim())}
            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="192.168.1.10"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs font-mono text-muted-foreground mb-1">
            <span>CIDR Prefix:</span>
            <span className="text-primary font-bold">/{cidrInput}</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="8"
              max="30"
              value={cidrInput}
              onChange={(e) => setCidrInput(parseInt(e.target.value, 10))}
              className="flex-1 accent-primary"
            />
            <div className="flex gap-1">
              {[8, 16, 24, 28].map((c) => (
                <button
                  key={c}
                  onClick={() => setCidrInput(c)}
                  className={`px-2 py-1 rounded text-[0.65rem] font-mono ${
                    cidrInput === c
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-card border border-border hover:bg-muted"
                  }`}
                >
                  /{c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {calculation ? (
        <div className="space-y-6">
          {/* Calculated Output Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1">
              <span className="text-[0.65rem] text-muted-foreground uppercase">Network Address</span>
              <div className="font-bold text-sm text-primary">{calculation.networkAddress}</div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1">
              <span className="text-[0.65rem] text-muted-foreground uppercase">Subnet Mask</span>
              <div className="font-bold text-sm text-foreground">{calculation.subnetMask}</div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1">
              <span className="text-[0.65rem] text-muted-foreground uppercase">Broadcast Address</span>
              <div className="font-bold text-sm text-accent">{calculation.broadcastAddress}</div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1">
              <span className="text-[0.65rem] text-muted-foreground uppercase">Usable Hosts</span>
              <div className="font-bold text-sm text-success">{calculation.usableHosts.toLocaleString()}</div>
            </div>
          </div>

          {/* Usable Host Range Visualizer */}
          <div className="p-4 rounded-xl border border-border bg-slate-950 text-slate-100 font-mono text-xs space-y-3">
            <div className="text-slate-400 text-[0.7rem] uppercase border-b border-slate-800 pb-1">
              Network Topology Segment Range:
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left py-1">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-[0.65rem] text-slate-400">NETWORK (ID)</div>
                <div className="text-primary font-bold">{calculation.networkAddress}</div>
              </div>
              <div className="text-slate-500 font-bold">$\longrightarrow$</div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-[0.65rem] text-slate-400">FIRST HOST</div>
                <div className="text-green-400 font-bold">{calculation.firstHost}</div>
              </div>
              <div className="text-slate-500 font-bold">...</div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-[0.65rem] text-slate-400">LAST HOST</div>
                <div className="text-green-400 font-bold">{calculation.lastHost}</div>
              </div>
              <div className="text-slate-500 font-bold">$\longrightarrow$</div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-[0.65rem] text-slate-400">BROADCAST</div>
                <div className="text-accent font-bold">{calculation.broadcastAddress}</div>
              </div>
            </div>
          </div>

          {/* Binary Representation Breakdown */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 text-xs font-mono">
            <span className="text-[0.65rem] uppercase text-muted-foreground font-semibold">
              Binary Bit Mask Breakdown (32 Bits)
            </span>
            <div className="space-y-1 text-[0.7rem]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">IP (Binary):</span>
                <span className="text-foreground">{calculation.binaryIp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mask (Binary):</span>
                <span className="text-primary font-bold">{calculation.binaryMask}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-1">
                <span className="text-muted-foreground">Network (Bitwise AND):</span>
                <span className="text-accent font-bold">{calculation.binaryNet}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-destructive">
          Invalid IPv4 format entered. Please provide 4 valid octets (0-255).
        </div>
      )}
    </div>
  );
}
