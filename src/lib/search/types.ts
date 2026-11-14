// ============================================================
// IVVAB AI Search Engine — Types & Interfaces
// ============================================================

export type SearchIntent =
  | "cve_vulnerability"
  | "live_news_freshness"
  | "technical_research"
  | "platform_curriculum"
  | "general_search"
  | "direct_answer";

export interface SearchSource {
  id: string; // e.g. "1", "2"
  title: string;
  url: string;
  domain: string;
  snippet: string;
  publishedDate?: string;
  author?: string;
  score?: number;
  isVerified?: boolean;
  provider:
    | "google_grounding"
    | "tavily"
    | "nvd_cve"
    | "duckduckgo"
    | "serper"
    | "curriculum"
    | "open_web";
}

export interface WebSearchResult {
  query: string;
  intent: SearchIntent;
  sources: SearchSource[];
  searchTimeMs: number;
  provider: string;
  isWebVerified: boolean;
  searchQueriesUsed: string[];
}

export interface IntentClassification {
  intent: SearchIntent;
  requiresSearch: boolean;
  searchQuery: string;
  cveId?: string;
  reason: string;
}
