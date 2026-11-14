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
 RFC: "bg-nisq-blue-tint text-nisq-blue text-nisq-blue border-nisq-blue",
 NIST: "bg-nisq-blue-tint text-nisq-blue text-nisq-blue border-nisq-blue",
 MITRE: "bg-nisq-offwhite text-nisq-muted text-nisq-muted border-nisq-border",
 OWASP: "bg-nisq-blue-tint text-nisq-blue-soft text-nisq-blue-soft border-nisq-blue-soft",
 CISA: "bg-nisq-danger-tint text-nisq-danger text-nisq-danger border-nisq-danger",
 LINUX_DOC: "bg-nisq-white text-nisq-muted text-nisq-text border-nisq-border",
 KAGGLE: "bg-nisq-blue-tint text-nisq-blue text-nisq-blue border-nisq-blue",
 ACADEMIC: "bg-nisq-blue-tint text-nisq-blue text-nisq-blue border-nisq-blue",
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
