// ============================================================
// IVVAB AI Search Engine — Tavily Research Provider
// Advanced AI-optimized web search & evidence retrieval
// ============================================================

import type { SearchSource } from "./types";

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score?: number;
  published_date?: string;
}

interface TavilyResponse {
  results?: TavilyResult[];
}

export async function searchTavily(
  query: string,
  limit = 6,
): Promise<SearchSource[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  const sources: SearchSource[] = [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        include_answer: false,
        include_images: false,
        max_results: limit,
      }),
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[Tavily Provider] HTTP ${res.status}`);
      return [];
    }

    const data = (await res.json()) as TavilyResponse;
    const items = data.results || [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let domain = "";
      try {
        domain = new URL(item.url).hostname.replace(/^www\./, "");
      } catch {
        domain = "external";
      }

      sources.push({
        id: String(i + 1),
        title: item.title,
        url: item.url,
        domain,
        snippet: item.content,
        publishedDate: item.published_date,
        score: item.score ?? 0.85,
        isVerified: true,
        provider: "tavily",
      });
    }
  } catch (err) {
    console.warn("[Tavily Provider] Exception:", err);
  }

  return sources;
}
