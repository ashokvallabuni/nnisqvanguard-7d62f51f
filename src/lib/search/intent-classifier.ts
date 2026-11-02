// ============================================================
// IVVAB AI Search Engine — Query Intent Classifier
// ============================================================

import type { IntentClassification, SearchIntent } from "./types";

const CVE_REGEX = /\b(CVE-\d{4}-\d{4,7})\b/i;

const FRESHNESS_KEYWORDS = [
  "latest",
  "recent",
  "current",
  "today",
  "yesterday",
  "this week",
  "this month",
  "this year",
  "news",
  "update",
  "updates",
  "release",
  "released",
  "announced",
  "patch",
  "outage",
  "zero-day",
  "0-day",
  "advisory",
  "breach",
  "incident",
  "threat actor",
  "cve",
  "active exploit",
  "in the wild",
  "2024",
  "2025",
  "2026",
];

const DIRECT_ANSWER_PATTERNS = [
  /^(hi|hello|hey|good morning|good afternoon|good evening|greetings)\b/i,
  /^who are you\??$/i,
  /^what is your name\??$/i,
  /^help\??$/i,
  /^thanks?( you)?\??$/i,
  /^bye|goodbye|see you\??$/i,
  /^how are you\??$/i,
];

const STABLE_CONCEPT_PATTERNS = [
  /what is (the )?(cia triad|osi model|tcp\/ip|symmetric encryption|asymmetric encryption)\??$/i,
  /what is port (21|22|25|53|80|443|3389|8080)\??$/i,
  /how to declare a (variable|function|class) in (python|javascript|typescript|c|rust|go)\??$/i,
  /difference between tcp and udp\??$/i,
  /what does sha-?256 mean\??$/i,
];

/**
 * Classifies the query to decide whether to search the live web,
 * query NIST NVD directly for CVEs, or generate a direct response.
 */
export function classifySearchIntent(query: string): IntentClassification {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();

  // 1. Check for specific CVE ID
  const cveMatch = trimmed.match(CVE_REGEX);
  if (cveMatch) {
    const cveId = cveMatch[1].toUpperCase();
    return {
      intent: "cve_vulnerability",
      requiresSearch: true,
      searchQuery: `${cveId} official advisory vulnerability`,
      cveId,
      reason: `Detected official vulnerability identifier ${cveId}`,
    };
  }

  // 2. Check for pure conversational pleasantries or self-identity
  for (const pattern of DIRECT_ANSWER_PATTERNS) {
    if (pattern.test(lower)) {
      return {
        intent: "direct_answer",
        requiresSearch: false,
        searchQuery: trimmed,
        reason: "Conversational greeting or self-identity inquiry",
      };
    }
  }

  // 3. Check for stable fundamentals (no live search required if query is brief and fundamental)
  if (trimmed.length < 50) {
    for (const pattern of STABLE_CONCEPT_PATTERNS) {
      if (pattern.test(lower)) {
        return {
          intent: "direct_answer",
          requiresSearch: false,
          searchQuery: trimmed,
          reason: "Stable foundational computer science / cybersecurity concept",
        };
      }
    }
  }

  // 4. Check for freshness signals
  const hasFreshnessSignal = FRESHNESS_KEYWORDS.some((kw) =>
    lower.includes(kw),
  );
  if (hasFreshnessSignal) {
    return {
      intent: "live_news_freshness",
      requiresSearch: true,
      searchQuery: cleanSearchQuery(trimmed),
      reason: "Query references temporal keywords, active news, or recent vulnerabilities",
    };
  }

  // 5. Check for companies, products, tools, and technical documentation
  const isTechnical =
    lower.includes("github") ||
    lower.includes("documentation") ||
    lower.includes("api") ||
    lower.includes("sdk") ||
    lower.includes("framework") ||
    lower.includes("vulnerability") ||
    lower.includes("exploit") ||
    lower.includes("mitre") ||
    lower.includes("nist") ||
    lower.includes("rfc") ||
    lower.includes("benchmark") ||
    lower.includes("vs") ||
    lower.includes("compare");

  if (isTechnical) {
    return {
      intent: "technical_research",
      requiresSearch: true,
      searchQuery: cleanSearchQuery(trimmed),
      reason: "Technical research inquiry requiring current external documentation or comparison",
    };
  }

  // 6. Default: Automatically trigger web research whenever external facts, companies, or verification matter
  return {
    intent: "general_search",
    requiresSearch: true,
    searchQuery: cleanSearchQuery(trimmed),
    reason: "Standard inquiry requiring fact-checking and live evidence grounding",
  };
}

/**
 * Strips conversational filler to create high-relevance search queries
 */
function cleanSearchQuery(query: string): string {
  let cleaned = query
    .replace(/^(can you |please |tell me |explain |what is |who is |where is |how does |i want to know about )/i, "")
    .replace(/[?!.]+$/, "")
    .trim();

  // If cleaning made it too short, keep original
  if (cleaned.length < 3) {
    cleaned = query.replace(/[?!.]+$/, "").trim();
  }

  return cleaned;
}
