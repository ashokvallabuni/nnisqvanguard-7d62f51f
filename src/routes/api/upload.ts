import { createFileRoute } from "@tanstack/react-router";
import { clientKey, getAuth, json, logEvent, rateLimit } from "@/lib/api-helpers.server";

const MAX_BYTES = 32 * 1024 * 1024; // 32 MB VirusTotal free tier limit

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ctx = await getAuth(request);
        if (!rateLimit(`file:${clientKey(request, ctx.userId)}`, 5, 60_000)) {
          return json({ error: "Rate limit exceeded" }, 429);
        }
        const key = process.env.VIRUSTOTAL_API_KEY;
        if (!key) return json({ error: "VirusTotal not configured" }, 503);

        const form = await request.formData().catch(() => null);
        const file = form?.get("file");
        if (!(file instanceof File))
          return json({ error: "No file uploaded (field: 'file')" }, 400);
        if (file.size === 0) return json({ error: "Empty file" }, 400);
        if (file.size > MAX_BYTES)
          return json({ error: `File too large (max ${MAX_BYTES} bytes)` }, 413);

        try {
          // Submit
          const submitForm = new FormData();
          submitForm.append("file", file, file.name);
          const submit = await fetch("https://www.virustotal.com/api/v3/files", {
            method: "POST",
            headers: { "x-apikey": key },
            body: submitForm,
          });
          if (!submit.ok) {
            const t = await submit.text();
            return json({ error: `VirusTotal submit failed: ${t.slice(0, 200)}` }, 502);
          }
          const submitJson = (await submit.json()) as { data?: { id?: string } };
          const analysisId = submitJson.data?.id;
          if (!analysisId) return json({ error: "No analysis id returned" }, 502);

          // Poll for up to ~20s
          let stats: Record<string, number> | undefined;
          let status = "queued";
          for (let i = 0; i < 10; i++) {
            await new Promise((r) => setTimeout(r, 2000));
            const a = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
              headers: { "x-apikey": key },
            });
            if (!a.ok) continue;
            const aj = (await a.json()) as {
              data?: { attributes?: { status?: string; stats?: Record<string, number> } };
            };
            status = aj.data?.attributes?.status ?? status;
            stats = aj.data?.attributes?.stats;
            if (status === "completed") break;
          }

          const malicious = stats?.malicious ?? 0;
          const suspicious = stats?.suspicious ?? 0;
          const risk: "Low" | "Medium" | "High" =
            malicious > 0 ? "High" : suspicious > 0 ? "Medium" : "Low";
          const result = {
            filename: file.name,
            size: file.size,
            type: file.type,
            analysisId,
            status,
            stats: stats ?? null,
            risk,
            verdict: risk === "High" ? "Dangerous" : risk === "Medium" ? "Suspicious" : "Clean",
          };
          await logEvent(ctx, "file", `${file.name} (${file.size}b)`, result, risk);
          return json(result);
        } catch (e) {
          console.error("[/api/upload]", e);
          return json({ error: (e as Error).message }, 500);
        }
      },
    },
  },
});
