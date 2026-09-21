import { useState } from "react";
import { Database, FileText, Download, Copy, Check, Eye, ExternalLink } from "lucide-react";

export interface DatasetSample {
  name: string;
  source: string;
  format: "json" | "csv" | "log" | "pcap_summary";
  description: string;
  recordsCount?: number;
  data: Array<Record<string, any>> | string;
  downloadUrl?: string;
  kaggleUrl?: string;
}

interface DatasetPreviewCardProps {
  dataset: DatasetSample;
}

export function DatasetPreviewCard({ dataset }: DatasetPreviewCardProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "raw">(
    Array.isArray(dataset.data) ? "table" : "raw"
  );

  const handleCopy = () => {
    const textToCopy =
      typeof dataset.data === "string"
        ? dataset.data
        : JSON.stringify(dataset.data, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isArrayData = Array.isArray(dataset.data);
  const headers = isArrayData && dataset.data.length > 0 ? Object.keys(dataset.data[0]) : [];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-6 shadow-xs">
      <div className="p-4 bg-muted/40 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display font-semibold text-sm text-foreground">
                {dataset.name}
              </h4>
              <span className="text-[0.6rem] font-mono uppercase px-2 py-0.5 rounded-xs bg-muted text-muted-foreground border border-border">
                {dataset.format}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Source: {dataset.source} {dataset.recordsCount ? `• ${dataset.recordsCount.toLocaleString()} records` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isArrayData && (
            <div className="flex rounded-md border border-border bg-background p-0.5 text-xs font-mono">
              <button
                onClick={() => setViewMode("table")}
                className={`px-2.5 py-1 rounded-xs transition-colors ${
                  viewMode === "table" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("raw")}
                className={`px-2.5 py-1 rounded-xs transition-colors ${
                  viewMode === "raw" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                JSON / Log
              </button>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs font-mono px-2.5 py-1.5 rounded-md border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Copy sample data"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          {dataset.kaggleUrl && (
            <a
              href={dataset.kaggleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-mono px-2.5 py-1.5 rounded-md bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Kaggle</span>
            </a>
          )}
        </div>
      </div>

      <div className="p-3 text-xs text-muted-foreground bg-muted/10 border-b border-border/60">
        <span className="font-semibold text-foreground font-mono">Analyst Objective: </span>
        {dataset.description}
      </div>

      <div className="max-h-72 overflow-auto bg-slate-950 text-slate-100 font-mono text-xs p-3">
        {viewMode === "table" && isArrayData ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[0.7rem] uppercase">
                {headers.map((h) => (
                  <th key={h} className="p-2 whitespace-nowrap font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {dataset.data.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/60 transition-colors">
                  {headers.map((h) => (
                    <td key={h} className="p-2 whitespace-nowrap text-slate-300">
                      {typeof row[h] === "object" ? JSON.stringify(row[h]) : String(row[h] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre className="whitespace-pre-wrap break-all leading-relaxed">
            {typeof dataset.data === "string"
              ? dataset.data
              : JSON.stringify(dataset.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
