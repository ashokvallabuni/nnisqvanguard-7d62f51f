// ============================================================
// IVVAB AI — Lovable Gateway Provider (Streaming)
// ============================================================

import type { ChatMessage, StreamCallbacks } from "./types";
import type { SearchSource } from "../search/types";

export async function streamLovableChat(
  messages: ChatMessage[],
  sources: SearchSource[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<{ text: string; citations: SearchSource[] }> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    throw new Error("LOVABLE_API_KEY is not configured.");
  }

  let evidenceBlock = "";
  if (sources.length > 0) {
    evidenceBlock = `\n\n### VERIFIED LIVE EVIDENCE SOURCES (Ground claims with [1], [2], etc.):\n` +
      sources
        .map(
          (s) =>
            `[${s.id}] Title: ${s.title}\nDomain: ${s.domain}\nURL: ${s.url}\n${s.publishedDate ? `Date: ${s.publishedDate}\n` : ""}Evidence: ${s.snippet}`,
        )
        .join("\n\n") +
      `\n\nSTRICT CITATION RULES:\n` +
      `- Every factual claim or metric must have an inline citation tag like [1] or [2] immediately following it.\n` +
      `- Only cite sources listed above. Never invent citations, dates, or URLs.`;
  }

  const systemMsg = messages.find((m) => m.role === "system")?.content || "";
  const conversation = messages.filter((m) => m.role !== "system");

  const formattedMessages = [
    { role: "system", content: systemMsg + evidenceBlock },
    ...conversation,
  ];

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: formattedMessages,
      stream: true,
      temperature: 0.3,
    }),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Lovable Gateway HTTP ${res.status}: ${errText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No readable stream from Lovable Gateway");

  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === "data: [DONE]") continue;

      if (trimmed.startsWith("data: ")) {
        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            callbacks.onChunk?.(delta);
          }
        } catch {
          // ignore
        }
      }
    }
  }

  callbacks.onCitations?.(sources);
  callbacks.onDone?.(fullText, sources);

  return { text: fullText, citations: sources };
}
