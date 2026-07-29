// ============================================================
// Detection Agent — NISQ Vanguard AI Agent System
// Identifies suspicious security events using rule-based + ML
// ============================================================

import type { DetectionResult, Finding, RiskLevel, AgentContext } from "./types";
import { callChatModel } from "../api-helpers.server";

const DETECTION_SYSTEM_PROMPT = `You are the Detection Agent — part of the NISQ Vanguard multi-agent AI security system.

Your role: Identify suspicious security events and threats.

Analyze the input for:
1. Brute force attempts (multiple failed logins)
2. Suspicious login behavior (geo-anomalies, off-hours)
3. Malware indicators (suspicious processes, file changes)
4. Phishing patterns (urgent language, spoofed domains)
5. Abnormal network activity (unusual ports, data exfiltration)
6. Suspicious IP activity (known bad IPs, tor exit nodes)
7. Social engineering indicators
8. Credential stuffing patterns

For each finding, provide:
- type: The category of threat
- description: Clear explanation of what was detected
- indicator: The specific evidence/signal
- severity: Low, Medium, High, or Critical
- source: Where the evidence came from

Return STRICT JSON with:
- findings: array of findings
- summary: one-line summary of findings
- confidence: overall confidence score 0-100`;

function generateRequestId(): string {
  return `det-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function runDetection(
  input: string,
  context?: Partial<AgentContext>
): Promise<DetectionResult> {
  const messages = [
    { role: "system" as const, content: DETECTION_SYSTEM_PROMPT },
    {
      role: "user" as const,
      content: `Analyze the following for security threats:\n\n${input}\n\nReturn JSON with findings array (each with type, description, indicator, severity, source, timestamp), summary string, and confidence number.`,
    },
  ];

  try {
    const raw = await callChatModel(messages, { json: true });
    const parsed = JSON.parse(raw);

    const findings: Finding[] = (parsed.findings || []).map((f: Record<string, unknown>) => ({
      type: String(f.type || "unknown"),
      description: String(f.description || ""),
      indicator: String(f.indicator || ""),
      severity: validateSeverity(f.severity),
      timestamp: String(f.timestamp || new Date().toISOString()),
      source: String(f.source || "detection-agent"),
      raw: f,
    }));

    return {
      agent: "detection",
      findings,
      summary: String(parsed.summary || "No threats detected"),
      confidence: clampScore(parsed.confidence),
    };
  } catch (e) {
    console.error("[DetectionAgent] Error:", e);
    return {
      agent: "detection",
      findings: [],
      summary: "Detection agent encountered an error during analysis",
      confidence: 0,
    };
  }
}

function validateSeverity(s: unknown): RiskLevel {
  if (typeof s === "string" && ["Low", "Medium", "High", "Critical"].includes(s)) {
    return s as RiskLevel;
  }
  return "Low";
}

function clampScore(n: unknown): number {
  const v = Number(n);
  if (isNaN(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

