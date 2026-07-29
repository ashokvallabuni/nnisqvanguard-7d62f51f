// ============================================================
// Response Agent — NISQ Vanguard AI Agent System
// Recommends safe mitigation actions and response steps
// ============================================================

import type {
  ResponseResult,
  RiskResult,
  DetectionResult,
  AnalysisResult,
  AgentContext,
} from "./types";
import { callChatModel } from "../api-helpers.server";

const RESPONSE_SYSTEM_PROMPT = `You are the Response Agent — part of the NISQ Vanguard multi-agent AI security system.

Your role: Recommend safe and effective response actions for security incidents.

IMPORTANT: You are a DEFENSIVE security tool. Never recommend offensive/hacking actions.

For each incident, recommend:
1. IMMEDIATE ACTIONS — Steps to take right now (safe, non-destructive)
2. CONTAINMENT STEPS — How to prevent further damage
3. REMEDIATION STEPS — How to clean up and recover
4. PREVENTIVE MEASURES — How to prevent recurrence
5. FLAG actions requiring approval — mark as requiresApproval: true

Guidelines:
- Always prioritize safety and business continuity
- Do NOT recommend offensive actions
- Recommend involving human administrators for critical decisions
- Suggest logging and documentation
- Include communication guidelines

Return STRICT JSON with:
- immediateActions: array of strings
- containmentSteps: array of strings
- remediationSteps: array of strings
- preventiveMeasures: array of strings
- approvedActions: array of pre-approved safe actions
- requiresApproval: boolean (true if any action needs human approval)`;

export async function generateResponse(
  detection: DetectionResult | null,
  analysis: AnalysisResult | null,
  risk: RiskResult | null,
  context?: Partial<AgentContext>
): Promise<ResponseResult> {
  const inputData = JSON.stringify(
    {
      detection: detection
        ? { findings: detection.findings, summary: detection.summary }
        : null,
      analysis: analysis
        ? {
            attackPattern: analysis.attackPattern,
            killChainPhase: analysis.killChainPhase,
            summary: analysis.summary,
          }
        : null,
      risk: risk
        ? {
            riskScore: risk.riskScore,
            severity: risk.severity,
            overallAssessment: risk.overallAssessment,
          }
        : null,
    },
    null,
    2
  );

  const messages = [
    { role: "system" as const, content: RESPONSE_SYSTEM_PROMPT },
    {
      role: "user" as const,
      content: `Generate defensive response actions for this security incident:\n\n${inputData}\n\nReturn JSON with immediateActions, containmentSteps, remediationSteps, preventiveMeasures, approvedActions (arrays of strings), and requiresApproval (boolean).`,
    },
  ];

  try {
    const raw = await callChatModel(messages, { json: true });
    const parsed = JSON.parse(raw);

    return {
      agent: "response",
      immediateActions: safeArray(parsed.immediateActions),
      containmentSteps: safeArray(parsed.containmentSteps),
      remediationSteps: safeArray(parsed.remediationSteps),
      preventiveMeasures: safeArray(parsed.preventiveMeasures),
      approvedActions: safeArray(parsed.approvedActions),
      requiresApproval: Boolean(parsed.requiresApproval),
    };
  } catch (e) {
    console.error("[ResponseAgent] Error:", e);
    return {
      agent: "response",
      immediateActions: ["Review security logs for additional context"],
      containmentSteps: ["Isolate affected systems if possible"],
      remediationSteps: ["Contact security team for manual review"],
      preventiveMeasures: ["Review and update security policies"],
      approvedActions: [],
      requiresApproval: true,
    };
  }
}

export function getDefaultResponseForThreat(
  threatType: string
): ResponseResult {
  const defaults: Record<string, Partial<ResponseResult>> = {
    "brute-force": {
      immediateActions: [
        "Temporarily block source IP address",
        "Enable account lockout policies",
        "Notify affected users to change passwords",
      ],
      containmentSteps: [
        "Monitor for additional login attempts from related IPs",
        "Review authentication logs for successful breaches",
        "Enable CAPTCHA on login pages",
      ],
      remediationSteps: [
        "Reset passwords for any compromised accounts",
        "Enable multi-factor authentication",
        "Audit user accounts for unauthorized access",
      ],
      preventiveMeasures: [
        "Implement rate limiting on authentication endpoints",
        "Deploy Web Application Firewall (WAF)",
        "Regular security awareness training",
      ],
      requiresApproval: false,
    },
    phishing: {
      immediateActions: [
        "Report the phishing email to security team",
        "Do not click any links or download attachments",
        "Block sender email address at gateway",
      ],
      containmentSteps: [
        "Check if other users received similar emails",
        "Scan email gateway for related threats",
        "Temporarily quarantine suspicious emails",
      ],
      remediationSteps: [
        "Run anti-malware scans on affected systems",
        "Reset credentials if any were entered",
        "Review email filtering rules",
      ],
      preventiveMeasures: [
        "Deploy advanced phishing detection",
        "Conduct regular phishing simulations",
        "Implement DMARC, DKIM, SPF email authentication",
      ],
      requiresApproval: false,
    },
    malware: {
      immediateActions: [
        "Disconnect affected system from network",
        "Run full anti-malware scan",
        "Do not power off system (preserve evidence)",
      ],
      containmentSteps: [
        "Identify scope of infection",
        "Block C2 communication channels",
        "Isolate other potentially affected systems",
      ],
      remediationSteps: [
        "Remove malware using approved tools",
        "Patch exploited vulnerabilities",
        "Restore from clean backups if necessary",
      ],
      preventiveMeasures: [
        "Keep all software updated",
        "Deploy endpoint detection and response (EDR)",
        "Restrict administrative privileges",
      ],
      requiresApproval: true,
    },
  };

  const normalized = threatType.toLowerCase().replace(/_/g, "-");
  for (const [key, resp] of Object.entries(defaults)) {
    if (normalized.includes(key)) {
      return {
        agent: "response",
        immediateActions: resp.immediateActions || [],
        containmentSteps: resp.containmentSteps || [],
        remediationSteps: resp.remediationSteps || [],
        preventiveMeasures: resp.preventiveMeasures || [],
        approvedActions: resp.approvedActions || [],
        requiresApproval: resp.requiresApproval || false,
      };
    }
  }

  // Generic safe response
  return {
    agent: "response",
    immediateActions: [
      "Review and document the security event",
      "Notify the security team for assessment",
    ],
    containmentSteps: [
      "Monitor for related events",
      "Document all findings",
    ],
    remediationSteps: [
      "Follow standard incident response procedures",
      "Update security controls as needed",
    ],
    preventiveMeasures: [
      "Review security posture regularly",
      "Keep incident response plan updated",
    ],
    approvedActions: [],
    requiresApproval: true,
  };
}

function safeArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.map(String).filter((s) => s.trim().length > 0);
}

