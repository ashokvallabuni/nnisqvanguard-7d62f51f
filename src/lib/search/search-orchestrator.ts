// ============================================================
// IVVAB AI Search Engine — Search Orchestrator
// Coordinates intent routing, multi-provider retrieval, deduplication, and caching
// ============================================================

import type { SearchSource, WebSearchResult, SearchIntent } from "./types";
import { classifySearchIntent } from "./intent-classifier";
import { fetchNvdCveDetails } from "./cve-provider";
import { searchLiveWebDDG } from "./duckduckgo-provider";
import { searchTavily } from "./tavily-provider";
import { searchCourseKnowledge } from "../rag/course-knowledge";

interface CacheEntry {
  result: WebSearchResult;
  expiresAt: number;
}

// In-memory LRU search cache (TTL 10 minutes)
const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 200;

function getCached(key: string): WebSearchResult | null {
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    searchCache.delete(key);
    return null;
  }
  return entry.result;
}

function setCached(key: string, result: WebSearchResult): void {
  if (searchCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey) searchCache.delete(oldestKey);
  }
  searchCache.set(key, {
    result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

/**
 * Main search orchestrator pipeline:
 * Query -> Intent -> Provider Resolution -> Deduplication -> Ranking -> Grounded Result
 */
export async function executeWebSearch(
  userQuery: string,
  options?: {
    forceSearch?: boolean;
    courseSlug?: string;
    labSlug?: string;
  },
): Promise<WebSearchResult> {
  const startTime = Date.now();
  const trimmed = userQuery.trim();
  const cacheKey = trimmed.toLowerCase();

  // Check cache first (unless forced)
  if (!options?.forceSearch) {
    const cached = getCached(cacheKey);
    if (cached) {
      return {
        ...cached,
        searchTimeMs: Date.now() - startTime,
      };
    }
  }

  const classification = classifySearchIntent(trimmed);
  const searchQueriesUsed: string[] = [];

  // If intent is direct answer and not forced, return empty sources
  if (!classification.requiresSearch && !options?.forceSearch) {
    return {
      query: trimmed,
      intent: classification.intent,
      sources: [],
      searchTimeMs: Date.now() - startTime,
      provider: "direct_model",
      isWebVerified: false,
      searchQueriesUsed: [],
    };
  }

  let rawSources: SearchSource[] = [];
  let primaryProvider = "web_search";

  // 1. CVE Lookup (NIST NVD + CISA)
  if (classification.cveId) {
    primaryProvider = "nvd_cve";
    searchQueriesUsed.push(classification.cveId);
    const nvdSources = await fetchNvdCveDetails(classification.cveId);
    rawSources.push(...nvdSources);

    // Also supplement with live web search for real-world impact/advisories
    try {
      const webSupplement = await searchLiveWebDDG(
        `${classification.cveId} security advisory mitigation`,
        3,
      );
      searchQueriesUsed.push(`${classification.cveId} security advisory mitigation`);
      rawSources.push(...webSupplement);
    } catch {
      // Ignore web supplement failure if NVD already returned data
    }
  } else {
    // 2. Standard or Freshness Web Search
    const query = classification.searchQuery;
    searchQueriesUsed.push(query);

    // Try Tavily if configured
    if (process.env.TAVILY_API_KEY) {
      try {
        const tavilyResults = await searchTavily(query, 6);
        if (tavilyResults.length > 0) {
          primaryProvider = "tavily";
          rawSources.push(...tavilyResults);
        }
      } catch (e) {
        console.warn("[Search Orchestrator] Tavily failed, falling back:", e);
      }
    }

    // Fallback to Live DuckDuckGo Engine if Tavily was not used or returned no results
    if (rawSources.length === 0) {
      primaryProvider = "duckduckgo";
      try {
        const ddgResults = await searchLiveWebDDG(query, 6);
        rawSources.push(...ddgResults);
      } catch (e) {
        console.warn("[Search Orchestrator] DuckDuckGo search error:", e);
      }
    }
  }

  // 3. Local Academy & Labs Curriculum RAG integration (if relevant to NISQ)
  const isPlatformTopic =
    trimmed.toLowerCase().includes("nisq") ||
    trimmed.toLowerCase().includes("ivvab") ||
    trimmed.toLowerCase().includes("academy") ||
    trimmed.toLowerCase().includes("lab") ||
    options?.courseSlug ||
    options?.labSlug;

  if (isPlatformTopic) {
    try {
      const ragResults = searchCourseKnowledge(trimmed, {
        limit: 2,
        courseSlug: options?.courseSlug,
        labSlug: options?.labSlug,
      });

      for (const r of ragResults) {
        rawSources.push({
          id: "",
          title: `${r.chunk.courseTitle}: ${r.chunk.sectionTitle}`,
          url: `https://nisqvanguard.in${r.chunk.verifiedRoute}`,
          domain: "nisqvanguard.in",
          snippet: r.chunk.content.slice(0, 300) + "...",
          score: 0.96,
          isVerified: true,
          provider: "curriculum",
        });
      }
    } catch {
      // Ignore local rag failure
    }
  }

  // 4. Deduplicate and clean URLs
  const uniqueSources: SearchSource[] = [];
  const seenUrls = new Set<string>();

  for (const s of rawSources) {
    // Normalize URL
    let normUrl = s.url.replace(/\/$/, "");
    try {
      const u = new URL(normUrl);
      normUrl = `${u.protocol}//${u.hostname}${u.pathname}`;
    } catch {
      // keep
    }

    if (!seenUrls.has(normUrl)) {
      seenUrls.add(normUrl);
      uniqueSources.push(s);
    }
  }

  // Sort by score descending and take top 6
  uniqueSources.sort((a, b) => (b.score || 0) - (a.score || 0));
  const finalSources = uniqueSources.slice(0, 6).map((src, index) => ({
    ...src,
    id: String(index + 1), // 1-indexed for [1], [2] citations
  }));

  const result: WebSearchResult = {
    query: trimmed,
    intent: classification.intent,
    sources: finalSources,
    searchTimeMs: Date.now() - startTime,
    provider: primaryProvider,
    isWebVerified: finalSources.length > 0,
    searchQueriesUsed,
  };

  // Cache public web search results
  if (finalSources.length > 0) {
    setCached(cacheKey, result);
  }

  return result;
}
