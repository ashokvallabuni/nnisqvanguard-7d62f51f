import { createFileRoute } from "@tanstack/react-router";
import { clientKey, getAuth, json, rateLimit } from "@/lib/api-helpers.server";

// Simple in-worker cache (5 min)
let cache: { at: number; data: unknown } | null = null;
const TTL = 5 * 60_000;

export const Route = createFileRoute("/api/live-threats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const ctx = await getAuth(request);
        if (!rateLimit(`threats:${clientKey(request, ctx.userId)}`, 60, 60_000)) {
          return json({ error: "Rate limit exceeded" }, 429);
        }
        const now = Date.now();
        if (cache && now - cache.at < TTL) return json({ cached: true, ...(cache.data as object) });

        try {
          // ThreatFox recent IOCs (last 3 days)
          const r = await fetch("https://threatfox-api.abuse.ch/api/v1/", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ query: "get_iocs", days: 3 }),
          });
          if (!r.ok) return json({ error: `ThreatFox ${r.status}` }, 502);
          const j = (await r.json()) as {
            query_status?: string;
            data?: Array<Record<string, unknown>>;
          };
          if (j.query_status !== "ok" || !Array.isArray(j.data)) {
            return json({ error: "ThreatFox returned no data", status: j.query_status }, 502);
          }
          const items = j.data.slice(0, 50).map((d) => ({
            ioc: d.ioc,
            ioc_type: d.ioc_type,
            threat_type: d.threat_type,
            malware: d.malware_printable ?? d.malware,
            confidence: d.confidence_level,
            first_seen: d.first_seen,
            reference: d.reference,
            tags: d.tags,
          }));
          const summary = {
            total: j.data.length,
            byThreatType: items.reduce<Record<string, number>>((acc, i) => {
              const t = String(i.threat_type ?? "unknown");
              acc[t] = (acc[t] ?? 0) + 1;
              return acc;
            }, {}),
          };
          const payload = { fetchedAt: new Date().toISOString(), summary, items };
          cache = { at: now, data: payload };
          return json({ cached: false, ...payload });
        } catch (e) {
          return json({ error: (e as Error).message }, 500);
        }
      },
    },
  },
});
