import { useState } from "react";
import {
  Laptop,
  Server,
  Router,
  Network,
  Globe,
  Shield,
  ArrowRight,
  Info,
  AlertTriangle,
} from "lucide-react";

interface ComponentDetail {
  id: string;
  name: string;
  role: string;
  dataHandled: string;
  securityConcerns: string;
  layer: string;
}

const NETWORK_COMPONENTS: Record<string, ComponentDetail> = {
  client: {
    id: "client",
    name: "Client Workstation / Endpoint",
    role: "Originates user requests (e.g. browser fetching web page, terminal sending SSH packet).",
    dataHandled:
      "Plaintext application data, user credentials, local socket connections (Source Port: e.g. 54102).",
    securityConcerns:
      "Malware infection, keylogging, unencrypted credential cache, rogue DNS resolver configuration.",
    layer: "Layer 7 (Application) down to Layer 1 (Physical)",
  },
  switch: {
    id: "switch",
    name: "Layer 2 Ethernet Switch",
    role: "Forwards Ethernet frames within the local area network (LAN) using MAC address lookup tables (CAM table).",
    dataHandled: "Ethernet frames, Source/Destination MAC addresses, VLAN tags (802.1Q).",
    securityConcerns:
      "ARP spoofing / cache poisoning, MAC flooding attacks, rogue DHCP servers, VLAN hopping.",
    layer: "Layer 2 (Data Link Layer)",
  },
  router: {
    id: "router",
    name: "Network Gateway / Router / Firewall",
    role: "Routes IP packets across different network subnets, performs NAT (Network Address Translation), and enforces ACLs.",
    dataHandled:
      "IP Packets (IPv4/IPv6), Routing tables (BGP/OSPF), NAT state tables, stateful firewall inspects.",
    securityConcerns:
      "Route hijacking, unauthenticated management interfaces, IP spoofing, DDoS saturation.",
    layer: "Layer 3 (Network Layer) & Layer 4 (Transport)",
  },
  internet: {
    id: "internet",
    name: "Public Internet & Transit Backbone",
    role: "Global mesh of autonomous systems (AS) routing packets across fiber optic backbones and undersea cables.",
    dataHandled:
      "Encapsulated global transit IP packets, DNS root queries, TLS-encrypted application payloads.",
    securityConcerns:
      "BGP route leaks, adversary wiretapping / surveillance, Man-in-the-Middle (MitM) attacks.",
    layer: "Global Autonomous Transit",
  },
  server: {
    id: "server",
    name: "Destination Application Server",
    role: "Listens on dedicated TCP/UDP daemon ports (e.g. 443 for HTTPS, 22 for SSH) and serves client requests.",
    dataHandled:
      "Decrypted application payloads, database transaction queries, authorization tokens, access logs.",
    securityConcerns:
      "Remote Code Execution (RCE), SQL injection, unpatched service vulnerabilities, privilege escalation.",
    layer: "Layer 7 (Application Layer)",
  },
};

export function NetworkTopologyDiagram() {
  const [selectedId, setSelectedId] = useState<string>("client");
  const activeComponent = NETWORK_COMPONENTS[selectedId];

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-6 shadow-xs my-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div>
          <h4 className="font-display font-bold text-base text-foreground flex items-center gap-2">
            <Network className="w-4 h-4 text-primary" />
            <span>Interactive Network Topology & Packet Traversal</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click each network node to inspect its technical role, data processed, and security
            considerations.
          </p>
        </div>
        <span className="text-[0.65rem] font-mono uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          Interactive Model
        </span>
      </div>

      {/* Visual Flow Diagram */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 items-center">
        {/* Node 1: Client */}
        <button
          onClick={() => setSelectedId("client")}
          className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
            selectedId === "client"
              ? "border-primary bg-primary/10 ring-2 ring-primary/30 text-primary"
              : "border-border bg-muted/20 hover:border-primary/40 text-foreground"
          }`}
        >
          <div className="p-2 rounded-lg bg-background border border-border">
            <Laptop className="w-5 h-5" />
          </div>
          <div className="font-semibold text-xs">Client</div>
          <div className="text-[0.6rem] font-mono text-muted-foreground">192.168.1.10</div>
        </button>

        {/* Node 2: Switch */}
        <button
          onClick={() => setSelectedId("switch")}
          className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
            selectedId === "switch"
              ? "border-primary bg-primary/10 ring-2 ring-primary/30 text-primary"
              : "border-border bg-muted/20 hover:border-primary/40 text-foreground"
          }`}
        >
          <div className="p-2 rounded-lg bg-background border border-border">
            <Network className="w-5 h-5" />
          </div>
          <div className="font-semibold text-xs">L2 Switch</div>
          <div className="text-[0.6rem] font-mono text-muted-foreground">MAC Switching</div>
        </button>

        {/* Node 3: Router */}
        <button
          onClick={() => setSelectedId("router")}
          className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
            selectedId === "router"
              ? "border-primary bg-primary/10 ring-2 ring-primary/30 text-primary"
              : "border-border bg-muted/20 hover:border-primary/40 text-foreground"
          }`}
        >
          <div className="p-2 rounded-lg bg-background border border-border">
            <Router className="w-5 h-5" />
          </div>
          <div className="font-semibold text-xs">Gateway / Router</div>
          <div className="text-[0.6rem] font-mono text-muted-foreground">NAT / Firewall</div>
        </button>

        {/* Node 4: Internet */}
        <button
          onClick={() => setSelectedId("internet")}
          className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
            selectedId === "internet"
              ? "border-primary bg-primary/10 ring-2 ring-primary/30 text-primary"
              : "border-border bg-muted/20 hover:border-primary/40 text-foreground"
          }`}
        >
          <div className="p-2 rounded-lg bg-background border border-border">
            <Globe className="w-5 h-5" />
          </div>
          <div className="font-semibold text-xs">Internet</div>
          <div className="text-[0.6rem] font-mono text-muted-foreground">WAN Backbone</div>
        </button>

        {/* Node 5: Server */}
        <button
          onClick={() => setSelectedId("server")}
          className={`col-span-2 sm:col-span-1 p-3.5 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
            selectedId === "server"
              ? "border-primary bg-primary/10 ring-2 ring-primary/30 text-primary"
              : "border-border bg-muted/20 hover:border-primary/40 text-foreground"
          }`}
        >
          <div className="p-2 rounded-lg bg-background border border-border">
            <Server className="w-5 h-5" />
          </div>
          <div className="font-semibold text-xs">Target Server</div>
          <div className="text-[0.6rem] font-mono text-muted-foreground">Port 443 / HTTPS</div>
        </button>
      </div>

      {/* Component Details Card */}
      {activeComponent && (
        <div className="rounded-xl border border-primary/30 bg-muted/20 p-4 sm:p-5 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h5 className="font-display font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <span>{activeComponent.name}</span>
            </h5>
            <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              {activeComponent.layer}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-card border border-border/80 space-y-1">
              <span className="font-mono text-[0.65rem] uppercase text-muted-foreground font-semibold">
                What It Is & Does
              </span>
              <p className="text-foreground/90 leading-relaxed">{activeComponent.role}</p>
            </div>

            <div className="p-3 rounded-lg bg-card border border-border/80 space-y-1">
              <span className="font-mono text-[0.65rem] uppercase text-muted-foreground font-semibold">
                Data & Packets Handled
              </span>
              <p className="text-foreground/90 leading-relaxed">{activeComponent.dataHandled}</p>
            </div>

            <div className="p-3 rounded-lg bg-card border border-destructive/30 space-y-1">
              <span className="font-mono text-[0.65rem] uppercase text-destructive font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Security Concerns
              </span>
              <p className="text-foreground/90 leading-relaxed">
                {activeComponent.securityConcerns}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
