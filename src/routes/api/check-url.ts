import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { clientKey, getAuth, json, logEvent, rateLimit } from "@/lib/api-helpers.server";

const Body = z.object({ input: z.string().trim().min(1).max(4000) });

const SCAM_KEYWORDS = [
  "urgent",
  "otp",
  "password",
  "verify your account",
  "bank account",
  "click here",
  "suspended",
  "lottery",
  "prize",
  "kyc",
  "aadhaar",
  "refund",
  "gift card",
  "wire transfer",
  "bitcoin",
  "crypto",
  "iphone winner",
  "act now",
  "limited time",
];

const SUSPICIOUS_TLDS = [".zip", ".mov", ".xyz", ".top", ".click", ".country", ".gq", ".tk", ".ml"];
const LEGIT_BRANDS = [
  "amazon",
  "paypal",
  "google",
  "microsoft",
  "apple",
  "flipkart",
  "sbi",
  "hdfc",
  "icici",
  "axis",
  "razorpay",
  "phonepe",
  "paytm",
];

function extractUrls(text: string): string[] {
  const re = /https?:\/\/[^\s<>"']+|(?:\b|^)(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s<>"']*)?/gi;
  return Array.from(new Set((text.match(re) ?? []).map((u) => u.trim().replace(/[),.;]+$/, ""))));
}

function normalize(u: string): string {
  if (!/^https?:\/\//i.test(u)) return `http://${u}`;
  return u;
}

function looksLikeTyposquat(host: string): { hit: boolean; brand?: string } {
  const bare = host
    .replace(/^www\./, "")
    .split(".")[0]
    .toLowerCase();
  for (const b of LEGIT_BRANDS) {
    if (bare === b) return { hit: false };
    // Same length, low edit distance, or digit substitution
    if (bare.length >= b.length - 1 && bare.length <= b.length + 2) {
      const sub = bare.replace(/0/g, "o").replace(/1/g, "l").replace(/3/g, "e").replace(/5/g, "s");
      if (sub === b && sub !== bare) return { hit: true, brand: b };
      let diff = 0;
      for (let i = 0; i < Math.max(bare.length, b.length); i++) if (bare[i] !== b[i]) diff++;
      if (diff > 0 && diff <= 2 && bare !== b) return { hit: true, brand: b };
    }
  }
  return { hit: false };
}

type UrlReport = {
  url: string;
  risk: "Low" | "Medium" | "High";
  signals: string[];
  safeBrowsing?: { threats: string[] };
  virusTotal?: { malicious: number; suspicious: number; harmless: number; undetected: number };
};

async function safeBrowsingCheck(urls: string[]): Promise<Record<string, string[]>> {
  const key = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!key) return {};
  try {
    const body = {
      client: { clientId: "nisq-vanguard", clientVersion: "1.0" },
      threatInfo: {
        threatTypes: [
          "MALWARE",
          "SOCIAL_ENGINEERING",
          "UNWANTED_SOFTWARE",
          "POTENTIALLY_HARMFUL_APPLICATION",
        ],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: urls.map((u) => ({ url: u })),
      },
    };
    const r = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${key}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) return {};
    const j = (await r.json()) as {
      matches?: Array<{ threat: { url: string }; threatType: string }>;
    };
    const out: Record<string, string[]> = {};
    for (const m of j.matches ?? []) {
      (out[m.threat.url] ||= []).push(m.threatType);
    }
    return out;
  } catch {
    return {};
  }
}

async function virusTotalUrl(url: string) {
  const key = process.env.VIRUSTOTAL_API_KEY;
  if (!key) return undefined;
  try {
    // URL identifier = base64url(url without padding)
    const id = btoa(url).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
    const r = await fetch(`https://www.virustotal.com/api/v3/urls/${id}`, {
      headers: { "x-apikey": key },
    });
    if (r.status === 404) {
      // Submit for analysis
      const sub = await fetch("https://www.virustotal.com/api/v3/urls", {
        method: "POST",
        headers: { "x-apikey": key, "content-type": "application/x-www-form-urlencoded" },
        body: `url=${encodeURIComponent(url)}`,
      });
      if (!sub.ok) return undefined;
      return { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 };
    }
    if (!r.ok) return undefined;
    const j = (await r.json()) as {
      data?: { attributes?: { last_analysis_stats?: Record<string, number> } };
    };
    const s = j.data?.attributes?.last_analysis_stats ?? {};
    return {
      malicious: s.malicious ?? 0,
      suspicious: s.suspicious ?? 0,
      harmless: s.harmless ?? 0,
      undetected: s.undetected ?? 0,
    };
  } catch {
    return undefined;
  }
}

export const Route = createFileRoute("/api/check-url")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ctx = await getAuth(request);
        if (!rateLimit(`url:${clientKey(request, ctx.userId)}`, 15, 60_000)) {
          return json({ error: "Rate limit exceeded" }, 429);
        }
        let body: z.infer<typeof Body>;
        try {
          body = Body.parse(await request.json());
        } catch (e) {
          return json({ error: "Invalid input", details: (e as Error).message }, 400);
        }

        const text = body.input;
        const lower = text.toLowerCase();
        const keywordHits = SCAM_KEYWORDS.filter((k) => lower.includes(k));
        const urls = extractUrls(text).map(normalize).slice(0, 5);

        const sbMap = urls.length ? await safeBrowsingCheck(urls) : {};
        const reports: UrlReport[] = [];
        for (const u of urls) {
          const signals: string[] = [];
          let risk: UrlReport["risk"] = "Low";
          try {
            const host = new URL(u).hostname;
            if (SUSPICIOUS_TLDS.some((t) => host.endsWith(t))) {
              signals.push(`suspicious TLD (${host})`);
              risk = "Medium";
            }
            const typo = looksLikeTyposquat(host);
            if (typo.hit) {
              signals.push(`possible typosquat of ${typo.brand}`);
              risk = "High";
            }
            if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
              signals.push("IP address in URL");
              risk = "High";
            }
            if (host.split(".").length > 4) {
              signals.push("deep subdomain nesting");
              if (risk === "Low") risk = "Medium";
            }
          } catch {
            signals.push("malformed URL");
            risk = "Medium";
          }

          const sbThreats = sbMap[u] ?? [];
          if (sbThreats.length) {
            signals.push(`Google Safe Browsing: ${sbThreats.join(", ")}`);
            risk = "High";
          }

          const vt = await virusTotalUrl(u);
          if (vt && (vt.malicious > 0 || vt.suspicious > 2)) {
            signals.push(`VirusTotal: ${vt.malicious} malicious / ${vt.suspicious} suspicious`);
            risk = "High";
          }
          reports.push({
            url: u,
            risk,
            signals,
            safeBrowsing: sbThreats.length ? { threats: sbThreats } : undefined,
            virusTotal: vt,
          });
        }

        let overall: "Low" | "Medium" | "High" = "Low";
        if (reports.some((r) => r.risk === "High") || keywordHits.length >= 3) overall = "High";
        else if (reports.some((r) => r.risk === "Medium") || keywordHits.length >= 1)
          overall = "Medium";

        const result = { overall, keywordHits, urls: reports };
        await logEvent(ctx, urls.length ? "url" : "text", text, result, overall);
        return json(result);
      },
    },
  },
});
