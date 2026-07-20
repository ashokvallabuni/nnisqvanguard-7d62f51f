// Server-only helpers for /api/* routes.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type AuthContext = {
  supabase: SupabaseClient<Database> | null;
  userId: string | null;
};

function makeUserClient(token: string): SupabaseClient<Database> {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const isNew = key.startsWith("sb_publishable_") || key.startsWith("sb_secret_");
  return createClient<Database>(url, key, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (isNew && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

export async function getAuth(request: Request): Promise<AuthContext> {
  const h = request.headers.get("authorization") ?? "";
  if (!h.startsWith("Bearer ")) return { supabase: null, userId: null };
  const token = h.slice(7).trim();
  if (token.split(".").length !== 3) return { supabase: null, userId: null };
  try {
    const supabase = makeUserClient(token);
    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims?.sub) return { supabase: null, userId: null };
    return { supabase, userId: data.claims.sub as string };
  } catch {
    return { supabase: null, userId: null };
  }
}

export async function logEvent(
  ctx: AuthContext,
  type: "chat" | "url" | "file" | "text" | "score",
  input: string,
  result: unknown,
  risk_level: "Low" | "Medium" | "High" | "Unknown" = "Unknown",
) {
  if (!ctx.supabase || !ctx.userId) return;
  try {
    await ctx.supabase.from("logs").insert({
      user_id: ctx.userId,
      type,
      input: input.slice(0, 4000),
      result: result as never,
      risk_level,
    });
  } catch (e) {
    console.error("[logEvent] failed", e);
  }
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// ---- Rate limiter (in-memory, per worker instance; best-effort) ----
const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

export function clientKey(request: Request, userId: string | null): string {
  if (userId) return `u:${userId}`;
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "anon";
  return `ip:${ip}`;
}

// ---- OpenAI or Lovable AI fallback ----
export async function callChatModel(messages: Array<{ role: string; content: string }>, opts?: { json?: boolean }) {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        ...(opts?.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const j = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return j.choices?.[0]?.message?.content ?? "";
  }
  // Fallback: Lovable AI Gateway
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("No AI provider configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      ...(opts?.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return j.choices?.[0]?.message?.content ?? "";
}

export const NISQ_SYSTEM_PROMPT =
  "You are NISQ Vanguard AI, a cybersecurity assistant and teacher. You detect scams, analyze risks, and teach users cybersecurity in simple language. Always classify risk (Low, Medium, High), explain clearly, and give safety advice. When teaching, structure lessons as: Topic Title, Simple Explanation, Real-Life Example, Common Mistakes, Safety Tips, Quiz (2-3 questions), Practice task.";
