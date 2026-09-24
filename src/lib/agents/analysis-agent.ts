// ============================================================
// Analysis Agent — NISQ Vanguard AI Agent System
// Understands attack patterns and correlates with threat intel
// ============================================================

import type { AnalysisResult, ThreatIntel, AgentContext } from "./types";
import { callChatModel } from "../api-helpers.server";

const ANALYSIS_SYSTEM_PROMPT = `You are the Analysis Agent — part of the NISQ Vanguard multi-agent AI security system.

Your role: Analyze security findings to understand attack patterns.

For each analysis:
1. Identify the attack pattern/methodology
2. Map to MITRE ATT&CK framework techniques
3. Determine the kill chain phase (Reconnaissance, Weaponization, Delivery, Exploitation, Installation, C2, Actions on Objectives)
4. Correlate with known threat intelligence
5. Link related indicators of compromise (IOCs)
6. Provide actionable threat intelligence context

Return STRICT JSON with:
- attackPattern: identified attack pattern or null if none
- killChainPhase: current phase in cyber kill chain
- mitreTechniques: array of MITRE technique IDs (e.g., T1078, T1190)
- iocLinks: array of related IOC references
- threatIntel: array of threat intelligence objects (each with source, indicator, malicious, confidence, details)
- summary: analysis summary`;

export async function runAnalysis(
  findings: string,
  context?: Partial<AgentContext>,
): Promise<AnalysisResult> {
  const messages = [
    { role: "system" as const, content: ANALYSIS_SYSTEM_PROMPT },
    {
      role: "user" as const,
      content: `Analyze these security findings and identify attack patterns:\n\n${findings}\n\nReturn JSON with attackPattern, killChainPhase, mitreTechniques, iocLinks, threatIntel array, and summary.`,
    },
  ];

  try {
    const raw = await callChatModel(messages, { json: true });
    const parsed = JSON.parse(raw);

    const threatIntel: ThreatIntel[] = (parsed.threatIntel || []).map(
      (t: Record<string, unknown>) => ({
        source: String(t.source || "unknown"),
        indicator: String(t.indicator || ""),
        malicious: Boolean(t.malicious),
        confidence: Number(t.confidence) || 0,
        details: String(t.details || ""),
      }),
    );

    return {
      agent: "analysis",
      attackPattern: parsed.attackPattern || null,
      killChainPhase: parsed.killChainPhase || null,
      mitreTechniques: Array.isArray(parsed.mitreTechniques)
        ? parsed.mitreTechniques.map(String)
        : [],
      iocLinks: Array.isArray(parsed.iocLinks) ? parsed.iocLinks.map(String) : [],
      threatIntel,
      summary: String(parsed.summary || "Analysis complete"),
    };
  } catch (e) {
    console.error("[AnalysisAgent] Error:", e);
    return {
      agent: "analysis",
      attackPattern: null,
      killChainPhase: null,
      mitreTechniques: [],
      iocLinks: [],
      threatIntel: [],
      summary: "Analysis agent encountered an error",
    };
  }
}

export function mapThreatToMitre(threatType: string): string[] {
  const mitreMap: Record<string, string[]> = {
    "brute-force": ["T1110"],
    phishing: ["T1566"],
    malware: ["T1204", "T1547"],
    "social-engineering": ["T1598"],
    "credential-stuffing": ["T1110.004"],
    ransomware: ["T1486"],
    "data-exfiltration": ["T1048"],
    "privilege-escalation": ["T1068"],
    "command-and-control": ["T1071"],
    reconnaissance: ["T1595", "T1592"],
    injection: ["T1059", "T1190"],
    "denial-of-service": ["T1499"],
    "man-in-the-middle": ["T1557"],
    "supply-chain": ["T1195"],
  };

  const normalized = threatType.toLowerCase().replace(/_/g, "-");
  for (const [key, techniques] of Object.entries(mitreMap)) {
    if (normalized.includes(key)) return techniques;
  }
  return [];
}
