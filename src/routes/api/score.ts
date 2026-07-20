import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { clientKey, getAuth, json, logEvent, rateLimit } from "@/lib/api-helpers.server";

// Answers: each question weighted. true = safe habit, false = risky.
const Answers = z.object({
  twoFA: z.boolean().optional(),                 // enabled?
  reusePasswords: z.boolean().optional(),        // reuses across sites?
  clickUnknownLinks: z.boolean().optional(),     // clicks unknown links?
  usesPasswordManager: z.boolean().optional(),
  updatesSoftware: z.boolean().optional(),
  publicWifiWithoutVpn: z.boolean().optional(),
  sharesOtp: z.boolean().optional(),
  backupsData: z.boolean().optional(),
  antivirusInstalled: z.boolean().optional(),
  verifiesSenderBeforeOpening: z.boolean().optional(),
});

// weight, and whether "true" is the safe answer
const WEIGHTS: Record<keyof z.infer<typeof Answers>, { w: number; safeIsTrue: boolean; label: string }> = {
  twoFA:                        { w: 15, safeIsTrue: true,  label: "Two-factor authentication" },
  reusePasswords:               { w: 12, safeIsTrue: false, label: "Password reuse" },
  clickUnknownLinks:            { w: 12, safeIsTrue: false, label: "Clicking unknown links" },
  usesPasswordManager:          { w: 10, safeIsTrue: true,  label: "Password manager" },
  updatesSoftware:              { w: 10, safeIsTrue: true,  label: "Software updates" },
  publicWifiWithoutVpn:         { w: 8,  safeIsTrue: false, label: "Public Wi-Fi without VPN" },
  sharesOtp:                    { w: 15, safeIsTrue: false, label: "Shares OTP" },
  backupsData:                  { w: 6,  safeIsTrue: true,  label: "Regular backups" },
  antivirusInstalled:           { w: 6,  safeIsTrue: true,  label: "Antivirus installed" },
  verifiesSenderBeforeOpening:  { w: 6,  safeIsTrue: true,  label: "Verifies sender" },
};

export const Route = createFileRoute("/api/score")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ctx = await getAuth(request);
        if (!rateLimit(`score:${clientKey(request, ctx.userId)}`, 30, 60_000)) {
          return json({ error: "Rate limit exceeded" }, 429);
        }
        let a: z.infer<typeof Answers>;
        try { a = Answers.parse(await request.json()); }
        catch (e) { return json({ error: "Invalid input", details: (e as Error).message }, 400); }

        let earned = 0, possible = 0;
        const strengths: string[] = [], weaknesses: string[] = [];
        for (const [k, cfg] of Object.entries(WEIGHTS) as Array<[keyof typeof WEIGHTS, typeof WEIGHTS[keyof typeof WEIGHTS]]>) {
          const v = a[k];
          if (v === undefined) continue;
          possible += cfg.w;
          const safe = v === cfg.safeIsTrue;
          if (safe) { earned += cfg.w; strengths.push(cfg.label); }
          else weaknesses.push(cfg.label);
        }
        const score = possible === 0 ? 0 : Math.round((earned / possible) * 100);
        const risk_level: "Low" | "Medium" | "High" =
          score >= 75 ? "Low" : score >= 45 ? "Medium" : "High";
        const advice = risk_level === "High"
          ? "Your habits leave you highly exposed. Enable 2FA, stop reusing passwords, and never share OTPs."
          : risk_level === "Medium"
            ? "Solid basics but gaps remain. Address the weaknesses below to strengthen your posture."
            : "Strong cyber hygiene. Keep habits current and stay alert to new scams.";

        const result = { score, risk_level, strengths, weaknesses, advice };
        await logEvent(ctx, "score", JSON.stringify(a), result, risk_level);
        return json(result);
      },
    },
  },
});
