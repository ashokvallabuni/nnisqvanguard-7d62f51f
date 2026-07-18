import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const InSchema = z.object({
  storagePath: z.string().min(1),
  complaintId: z.string().uuid().optional(),
});

type AiVerdict = "Safe" | "Suspicious" | "Fraud";
type AiResult = {
  fraud_score: number;
  verdict: AiVerdict;
  explanation: string;
  recommended_action: string;
};

export const analyzeEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => InSchema.parse(v))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI service not configured");

    // create signed URL from the user-owned evidence file
    const { data: signed, error: signErr } = await context.supabase
      .storage.from("evidence").createSignedUrl(data.storagePath, 60 * 10);
    if (signErr || !signed?.signedUrl) throw new Error("Cannot access evidence file");

    // Fetch bytes and convert to base64 for reliable multimodal input
    const res = await fetch(signed.signedUrl);
    if (!res.ok) throw new Error("Failed to fetch evidence");
    const contentType = res.headers.get("content-type") || "image/png";
    const buf = new Uint8Array(await res.arrayBuffer());
    let b64 = "";
    for (let i = 0; i < buf.length; i += 0x8000) {
      b64 += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    }
    b64 = btoa(b64);
    const dataUrl = `data:${contentType};base64,${b64}`;

    const systemPrompt =
      "You are a cybercrime expert. Analyze the image for fraud indicators: phishing, scams, fake payment requests, suspicious links, impersonation, urgency tactics. Return STRICT JSON only with keys: fraud_score (0-100 integer), verdict (Safe|Suspicious|Fraud), explanation (3-5 sentences), recommended_action (2-3 sentences). No prose outside JSON.";

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this screenshot for cyber-fraud indicators. Respond ONLY with JSON." },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      response_format: { type: "json_object" },
    };

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify(body),
    });

    if (aiRes.status === 429) throw new Error("AI rate limit hit. Please try again in a moment.");
    if (aiRes.status === 402) throw new Error("AI credits exhausted. Ask the workspace owner to add credits.");
    if (!aiRes.ok) {
      const t = await aiRes.text();
      throw new Error(`AI error: ${t.slice(0, 200)}`);
    }
    const json = await aiRes.json() as { choices?: Array<{ message?: { content?: string } }> };
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: AiResult;
    try {
      const p = JSON.parse(raw);
      parsed = {
        fraud_score: Math.max(0, Math.min(100, Number(p.fraud_score) || 0)),
        verdict: (["Safe", "Suspicious", "Fraud"].includes(p.verdict) ? p.verdict : "Suspicious") as AiVerdict,
        explanation: String(p.explanation ?? ""),
        recommended_action: String(p.recommended_action ?? ""),
      };
    } catch {
      parsed = { fraud_score: 50, verdict: "Suspicious", explanation: raw.slice(0, 500), recommended_action: "Manual review recommended." };
    }

    // If complaintId provided, persist AI result on that complaint
    if (data.complaintId) {
      await context.supabase.from("complaints").update({
        ai_result: parsed,
        fraud_score: parsed.fraud_score,
        verdict: parsed.verdict,
      }).eq("id", data.complaintId).eq("user_id", context.userId);
    }

    return parsed;
  });
