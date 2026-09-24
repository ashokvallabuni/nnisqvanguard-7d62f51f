import { BookMarked, ExternalLink, ShieldCheck } from "lucide-react";

export interface CitationSource {
  title: string;
  type: "RFC" | "NIST" | "MITRE" | "OWASP" | "CISA" | "LINUX_DOC" | "KAGGLE" | "ACADEMIC";
  citationNumber?: string;
  url: string;
  notes?: string;
}

interface AuthoritativeSourcesProps {
  sources: CitationSource[];
}

export function AuthoritativeSources({ sources }: AuthoritativeSourcesProps) {
  if (!sources || sources.length === 0) return null;

  const typeBadges: Record<string, string> = {
    RFC: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    NIST: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    MITRE: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    OWASP: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    CISA: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    LINUX_DOC: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
    KAGGLE: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    ACADEMIC: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs mt-8">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-primary" />
          <h4 className="font-display font-bold text-sm text-foreground">
            Authoritative Sources & Technical References
          </h4>
        </div>
        <span className="text-[0.65rem] font-mono text-muted-foreground uppercase flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-success" /> Grounded Curriculum
        </span>
      </div>

      <div className="divide-y divide-border/60">
        {sources.map((src, idx) => (
          <div
            key={idx}
            className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
          >
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[0.6rem] font-mono uppercase px-2 py-0.5 rounded-xs border font-medium ${
                    typeBadges[src.type] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {src.type} {src.citationNumber ? `• ${src.citationNumber}` : ""}
                </span>
                <span className="font-semibold text-xs text-foreground truncate">{src.title}</span>
              </div>
              {src.notes && (
                <p className="text-xs text-muted-foreground leading-relaxed">{src.notes}</p>
              )}
            </div>

            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 text-xs font-mono"
              title="View Official Source"
            >
              <span>Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
