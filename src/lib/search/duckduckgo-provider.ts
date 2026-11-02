// ============================================================
// IVVAB AI Search Engine — Live Web Provider (DuckDuckGo Engine)
// Zero-config, reliable live web search & metadata extraction
// ============================================================

import type { SearchSource } from "./types";

/**
 * Executes a real-time web search and returns ranked, deduplicated web sources
 */
export async function searchLiveWebDDG(
  query: string,
  limit = 6,
): Promise<SearchSource[]> {
  const sources: SearchSource[] = [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const searchUrl =
      "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);

    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[DDG Provider] HTTP ${res.status}`);
      return sources;
    }

    const html = await res.text();

    // Regex to match result items in DuckDuckGo HTML output:
    // Match <h2 class="result__title"> ... <a class="result__a" href="...">title</a>
    // and accompanying <a class="result__snippet" ...>snippet</a>
    const regex =
      /<h2 class="result__title">[\s\S]*?<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

    let match: RegExpExecArray | null;
    const seenUrls = new Set<string>();

    while ((match = regex.exec(html)) !== null && sources.length < limit) {
      let rawHref = match[1];

      // Decode DuckDuckGo redirect wrapper: //duckduckgo.com/l/?uddg=https%3A%2F%2F...
      if (rawHref.includes("uddg=")) {
        try {
          const fakeUrl = new URL(
            rawHref.startsWith("//") ? "https:" + rawHref : rawHref,
          );
          const extracted = fakeUrl.searchParams.get("uddg");
          if (extracted) {
            rawHref = decodeURIComponent(extracted);
          }
        } catch {
          // If URL parsing fails, continue with raw
        }
      }

      // Clean destination URL
      let cleanUrl = rawHref.trim();
      let domain = "";
      try {
        const u = new URL(cleanUrl);
        // Remove tracking params
        u.searchParams.delete("utm_source");
        u.searchParams.delete("utm_medium");
        u.searchParams.delete("utm_campaign");
        u.searchParams.delete("utm_term");
        u.searchParams.delete("utm_content");
        u.searchParams.delete("ref");
        cleanUrl = u.toString();
        domain = u.hostname.replace(/^www\./, "");
      } catch {
        continue; // Skip invalid URLs
      }

      // Filter out duckduckgo internal URLs or search duplicates
      if (
        domain.includes("duckduckgo.com") ||
        domain.includes("yandex.com") ||
        seenUrls.has(cleanUrl)
      ) {
        continue;
      }
      seenUrls.add(cleanUrl);

      // Clean HTML entities and tags from title and snippet
      const title = cleanHtmlEntities(match[2].replace(/<[^>]+>/g, "").trim());
      const snippet = cleanHtmlEntities(
        match[3].replace(/<[^>]+>/g, "").trim(),
      );

      if (!title || !snippet || snippet.length < 15) {
        continue;
      }

      // Calculate initial relevance score based on domain authority
      let score = 0.8;
      if (
        domain.endsWith(".gov") ||
        domain.endsWith(".edu") ||
        domain.includes("nist.gov") ||
        domain.includes("cisa.gov") ||
        domain.includes("cve.org") ||
        domain.includes("mitre.org")
      ) {
        score = 0.98;
      } else if (
        domain.includes("github.com") ||
        domain.includes("rfc-editor.org") ||
        domain.includes("kernel.org") ||
        domain.includes("apache.org") ||
        domain.includes("microsoft.com") ||
        domain.includes("google.com")
      ) {
        score = 0.92;
      } else if (
        domain.includes("bleepingcomputer.com") ||
        domain.includes("thehackernews.com") ||
        domain.includes("securityweek.com") ||
        domain.includes("krebsonsecurity.com") ||
        domain.includes("darkreading.com")
      ) {
        score = 0.9;
      }

      sources.push({
        id: String(sources.length + 1),
        title,
        url: cleanUrl,
        domain,
        snippet,
        score,
        isVerified: true,
        provider: "duckduckgo",
      });
    }
  } catch (err) {
    console.warn("[DDG Provider] Search exception:", err);
  }

  return sources;
}

function cleanHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
