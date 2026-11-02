// ============================================================
// IVVAB AI — Provider Abstraction Types
// ============================================================

import type { SearchSource } from "../search/types";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StreamEvent {
  type: "search_start" | "search_done" | "chunk" | "citations" | "done" | "error";
  data: unknown;
}

export interface StreamCallbacks {
  onSearchStart?: (query: string) => void;
  onSearchDone?: (sources: SearchSource[]) => void;
  onChunk?: (text: string) => void;
  onCitations?: (citations: SearchSource[]) => void;
  onDone?: (fullText: string, citations: SearchSource[]) => void;
  onError?: (err: Error) => void;
}

export interface ModelProviderResponse {
  text: string;
  citations: SearchSource[];
  providerName: string;
  modelUsed: string;
  isWebVerified: boolean;
}
