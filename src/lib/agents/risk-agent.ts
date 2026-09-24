// ============================================================
// Risk Agent — NISQ Vanguard AI Agent System
// Calculates threat severity and risk scores
// ============================================================

import type { RiskResult, RiskFactor, RiskLevel, Finding } from "./types";
import { callChatModel } from "../api-helpers.server";

const RISK_SYSTEM_PROMPT = `You are the Risk Agent — part of the NISQ Vanguard multi-agent AI security system.

Your role: Calculate threat severity scores and provide risk assessment.

Evaluate the following factors:
1. Impact potential (data loss, system compromise, financial damage)
2. Likelihood of exploitation
3. Existing security controls and their effectiveness
4. Asset value and criticality
5. Threat actor capability
6. Propagation potential
7. Detection difficulty
8. Recovery complexity

For each factor, provide:
- name: Factor name
- score: 0-100 score
- weight: Importance weight (0-1)
- description: Brief explanation

Calculate overall risk score 0-100 where:
- 0-20: Low
- 21-50: Medium
- 51-80: High
- 81-100: Critical

Return STRICT JSON with:
- riskScore: integer 0-100
- severity: "Low" | "Medium" | "High" | "Critical"
- factors: array of risk factors
- overallAssessment: text assessment`;

export async function calculateRisk(
  findings: Finding[],
  attackPattern: string | null,
  context?: Partial<{ userId: string; organizationId: string }>,
): Promise<RiskResult> {
  const findingsSummary = findings
    .map(
      (f) => `- ${f.type}: ${f.description} (severity: ${f.severity}, confidence: ${f.severity})`,
    )
    .join("\n");

  const messages = [
    { role: "system" as const, content: RISK_SYSTEM_PROMPT },
    {
      role: "user" as const,
      content: `Calculate risk for:\nAttack Pattern: ${attackPattern || "Unknown"}\nFindings:\n${findingsSummary}\n\nReturn JSON with riskScore, severity, factors array (each with name, score, weight, description), and overallAssessment.`,
    },
  ];

  try {
    const raw = await callChatModel(messages, { json: true });
    const parsed = JSON.parse(raw);

    const factors: RiskFactor[] = (parsed.factors || []).map((f: Record<string, unknown>) => ({
      name: String(f.name || "unknown"),
      score: clampScore(f.score),
      weight: clampWeight(f.weight),
      description: String(f.description || ""),
    }));

    const riskScore = clampScore(parsed.riskScore);

    return {
      agent: "risk",
      riskScore,
      severity: scoreToSeverity(riskScore),
      factors,
      overallAssessment: String(parsed.overallAssessment || "Risk assessment completed"),
    };
  } catch (e) {
    console.error("[RiskAgent] Error:", e);
    return {
      agent: "risk",
      riskScore: 0,
      severity: "Low",
      factors: [],
      overallAssessment: "Risk assessment encountered an error",
    };
  }
}

export function calculateRiskScoreFromFindings(findings: Finding[]): number {
  if (findings.length === 0) return 0;

  const severityWeights: Record<RiskLevel, number> = {
    Low: 0.2,
    Medium: 0.5,
    High: 0.8,
    Critical: 1.0,
  };

  let totalScore = 0;
  let maxPossible = 0;

  for (const finding of findings) {
    const weight = severityWeights[finding.severity] || 0.2;
    totalScore += weight * 100;
    maxPossible += 100;
  }

  return Math.round((totalScore / maxPossible) * 100);
}

export function scoreToSeverity(score: number): RiskLevel {
  if (score >= 81) return "Critical";
  if (score >= 51) return "High";
  if (score >= 21) return "Medium";
  return "Low";
}

function clampScore(n: unknown): number {
  const v = Number(n);
  if (isNaN(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function clampWeight(n: unknown): number {
  const v = Number(n);
  if (isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}
