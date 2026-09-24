import { useState } from "react";
import { Sparkles, HelpCircle, BookOpen, ShieldAlert, Cpu, Terminal, X } from "lucide-react";

export interface ConceptExplanations {
  conceptName: string;
  quick: string;
  beginner: string;
  technical: string;
  security: string;
  practical: string;
}

interface ExplainThisAssistantProps {
  explanations?: ConceptExplanations;
}

export function ExplainThisAssistant({ explanations }: ExplainThisAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "quick" | "beginner" | "technical" | "security" | "practical"
  >("beginner");

  if (!explanations) return null;

  const tabs = [
    { key: "quick", label: "Quick Summary", icon: HelpCircle },
    { key: "beginner", label: "Beginner Analogy", icon: BookOpen },
    { key: "technical", label: "Technical Deep Dive", icon: Cpu },
    { key: "security", label: "Security & Threats", icon: ShieldAlert },
    { key: "practical", label: "SOC Analyst Practice", icon: Terminal },
  ];

  return (
    <div className="my-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-mono font-semibold transition-all shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Explain "{explanations.conceptName}" (5 Perspectives)</span>
        </button>
      ) : (
        <div className="rounded-xl border border-primary/40 bg-card p-5 space-y-4 shadow-md animate-in fade-in">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h4 className="font-display font-bold text-sm text-foreground">
                Grounded Explanation Engine:{" "}
                <span className="text-primary">{explanations.conceptName}</span>
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Close explanation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Perspective Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeTab === t.key
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "border border-border bg-muted/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Perspective Content */}
          <div className="p-4 rounded-lg bg-muted/20 border border-border/80 text-xs sm:text-sm text-foreground/90 leading-relaxed min-h-[80px]">
            {explanations[activeTab]}
          </div>

          <div className="text-[0.65rem] font-mono text-muted-foreground flex items-center justify-between pt-1">
            <span>Authoritative curriculum synthesis</span>
            <span className="text-primary font-semibold">
              Strictly grounded in technical RFC / NIST specs
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
