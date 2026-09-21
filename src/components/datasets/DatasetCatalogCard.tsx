import { Database, FileText, Download, ExternalLink, ArrowRight, Layers } from "lucide-react";

export interface DatasetItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  source: string;
  format: string;
  description: string;
  record_count?: number;
  size_mb?: number;
  kaggle_dataset_id?: string;
  download_url?: string;
  tags?: string[];
  associated_lab_slug?: string;
  associated_course_slug?: string;
}

interface DatasetCatalogCardProps {
  dataset: DatasetItem;
  onPreview?: (dataset: DatasetItem) => void;
}

export function DatasetCatalogCard({ dataset, onPreview }: DatasetCatalogCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-card hover:border-accent/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div className="p-5 sm:p-6 space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] font-mono uppercase px-2.5 py-0.5 rounded-full border bg-accent/10 text-accent border-accent/30 font-medium">
              {dataset.format}
            </span>
            <span className="text-[0.65rem] font-mono text-muted-foreground uppercase">
              {dataset.category}
            </span>
          </div>

          <span className="text-xs font-mono text-muted-foreground">
            {dataset.size_mb ? `${dataset.size_mb} MB` : `${dataset.record_count?.toLocaleString()} rows`}
          </span>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-display font-bold text-lg text-foreground group-hover:text-accent transition-colors line-clamp-1">
            {dataset.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {dataset.description}
          </p>
        </div>

        <div className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 pt-1">
          <span>Source:</span>
          <span className="font-medium text-foreground">{dataset.source}</span>
        </div>

        {dataset.tags && dataset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {dataset.tags.map((t, i) => (
              <span
                key={i}
                className="text-[0.6rem] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-2">
        {onPreview && (
          <button
            onClick={() => onPreview(dataset)}
            className="text-xs font-mono px-3 py-1.5 rounded-md border border-border bg-card hover:bg-muted text-foreground transition-colors flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Explore Data</span>
          </button>
        )}

        {dataset.kaggle_dataset_id && (
          <a
            href={`https://www.kaggle.com/datasets/${dataset.kaggle_dataset_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono px-3 py-1.5 rounded-md bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Kaggle Dataset</span>
          </a>
        )}
      </div>
    </div>
  );
}
