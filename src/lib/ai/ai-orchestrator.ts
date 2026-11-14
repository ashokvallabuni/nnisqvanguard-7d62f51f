// ============================================================
// IVVAB AI — AI Model Orchestrator & Provider Abstraction
// Selects and runs the appropriate production model with live evidence grounding
// ============================================================

import type { ChatMessage, StreamCallbacks } from "./types";
import type { SearchSource } from "../search/types";
import { streamGeminiChat } from "./gemini-provider";
import { streamOpenAiChat } from "./openai-provider";
import { streamLovableChat } from "./lovable-provider";
import { streamGroundedEvidenceSynthesis } from "./grounded-synthesis-engine";

export interface OrchestratorResult {
  text: string;
  citations: SearchSource[];
  providerUsed: string;
  modelUsed: string;
  isWebVerified: boolean;
}

/**
 * Dispatches the chat request to the best configured provider with automatic fallback
 */
export async function dispatchStreamingAiResponse(
  messages: ChatMessage[],
  sources: SearchSource[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<OrchestratorResult> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;

  // 1. Primary Provider: Official Google Gemini
  if (geminiKey) {
    try {
      const res = await streamGeminiChat(messages, sources, callbacks, signal);
      return {
        text: res.text,
        citations: res.citations,
        providerUsed: "google_gemini",
        modelUsed: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        isWebVerified: res.citations.length > 0,
      };
    } catch (err) {
      if (signal?.aborted) throw err;
      console.warn("[AI Orchestrator] Gemini provider failed, attempting fallback:", err);
    }
  }

  // 2. Secondary Provider: OpenAI
  if (openaiKey) {
    try {
      const res = await streamOpenAiChat(messages, sources, callbacks, signal);
      return {
        text: res.text,
        citations: res.citations,
        providerUsed: "openai",
        modelUsed: process.env.OPENAI_MODEL || "gpt-4o-mini",
        isWebVerified: res.citations.length > 0,
      };
    } catch (err) {
      if (signal?.aborted) throw err;
      console.warn("[AI Orchestrator] OpenAI provider failed, attempting fallback:", err);
    }
  }

  // 3. Tertiary Provider: Lovable Gateway
  if (lovableKey) {
    try {
      const res = await streamLovableChat(messages, sources, callbacks, signal);
      return {
        text: res.text,
        citations: res.citations,
        providerUsed: "lovable_gateway",
        modelUsed: "google/gemini-2.5-flash",
        isWebVerified: res.citations.length > 0,
      };
    } catch (err) {
      if (signal?.aborted) throw err;
      console.warn("[AI Orchestrator] Lovable gateway failed, attempting fallback:", err);
    }
  }

  // 4. Reliable Evidence-Grounded Synthesis Engine (Zero external key dependency)
  const res = await streamGroundedEvidenceSynthesis(messages, sources, callbacks, signal);
  return {
    text: res.text,
    citations: res.citations,
    providerUsed: "grounded_evidence_synthesis",
    modelUsed: "ivvab-grounded-engine-v2",
    isWebVerified: res.citations.length > 0,
  };
}
