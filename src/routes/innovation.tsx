import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Network, Lock, Zap } from "lucide-react";

export const Route = createFileRoute("/innovation")({
 head: () => ({
 meta: [
 { title: "AI Security & Research — NISQ Vanguard" },
 ],
 }),
 component: InnovationPage,
});

function InnovationPage() {
 return (
 <main className="min-h-screen bg-nisq-white text-nisq-text font-sans pt-24 pb-24">
 <div className="max-w-7xl mx-auto px-6 lg:px-12">
 {/* Header */}
 <div className="mb-20 max-w-3xl">
 <div className="font-mono text-xs uppercase tracking-widest text-nisq-text mb-4">Innovation & Research</div>
 <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-nisq-text">
 Research & Future Technology
 </h1>
 <p className="text-lg text-nisq-text font-light leading-relaxed mb-6">
 Cybersecurity cannot remain static while the underlying technology of the world changes. At NISQ Vanguard, we dedicate resources to understanding emerging threats and developing capabilities to defend against them.
 </p>
 </div>

 {/* AI Security Section */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
 <div>
 <h2 className="text-3xl font-medium text-nisq-text mb-6 flex items-center gap-3">
 <Cpu className="w-8 h-8 text-nisq-text" />
 AI Security
 </h2>
 <div className="text-lg text-nisq-text font-light leading-relaxed space-y-4">
 <p>
 Artificial Intelligence is changing the capabilities of both attackers and defenders. Attackers are using AI to scale social engineering, discover vulnerabilities faster, and develop adaptive malware. Defenders must understand these tools to build resilient systems.
 </p>
 <p>
 NISQ Vanguard researches the security implications of Large Language Models (LLMs), AI agents, and machine learning systems. We examine how AI systems can be manipulated, how they can be secured, and how they can be used to improve defensive operations.
 </p>
 </div>
 </div>
 <div className="p-8 bg-nisq-white border border-nisq-border rounded-sm relative overflow-hidden">
 <div className="absolute top-0 right-0 p-4 opacity-10">
 <Network className="w-48 h-48" />
 </div>
 <h3 className="font-mono text-sm uppercase tracking-widest text-nisq-text mb-6 relative z-10">Focus Areas</h3>
 <ul className="space-y-4 font-mono text-sm text-nisq-text relative z-10">
 <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-nisq-text" /> Prompt Injection Defense</li>
 <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-nisq-text" /> LLM Vulnerability Analysis</li>
 <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-nisq-text" /> Autonomous Agent Security</li>
 <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-nisq-text" /> AI-Assisted Threat Hunting</li>
 </ul>
 </div>
 </div>

 {/* Digital Safety Section */}
 <div className="mb-20 max-w-4xl border-t border-nisq-border pt-16">
 <h2 className="text-3xl font-medium text-nisq-text mb-6 flex items-center gap-3">
 <Lock className="w-8 h-8 text-nisq-text" />
 Digital Safety
 </h2>
 <div className="text-lg text-nisq-text font-light leading-relaxed space-y-4">
 <p>
 Beyond corporate networks and enterprise infrastructure, cybersecurity affects everyone who uses a connected device. As part of our commitment to a safer digital environment, NISQ Vanguard provides resources and education focused on personal digital safety.
 </p>
 <p>
 We believe that understanding basic security principles — such as how to recognize social engineering, secure communications, and protect personal data — is a fundamental requirement for participating in the modern digital world.
 </p>
 </div>
 </div>
 </div>
 </main>
 );
}
