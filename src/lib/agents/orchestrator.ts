// ============================================================
// Agent Orchestrator — NISQ Vanguard Multi-Agent AI System
// Coordinates all agents through the analysis pipeline
// ============================================================

import type {
  OrchestratedAnalysis,
  AnalysisInput,
  DetectionResult,
  AnalysisResult,
  RiskResult,
  ReportResult,
  ResponseResult,
  SecurityEvent,
} from "./types";
import { runDetection } from "./detection-agent";
import { runAnalysis } from "./analysis-agent";
import { calculateRisk, calculateRiskScoreFromFindings, scoreToSeverity } from "./risk-agent";
import { generateReport } from "./report-agent";
import { generateResponse, getDefaultResponseForThreat } from "./response-agent";
import { callChatModel } from "../api-helpers.server";

const ORCHESTRATOR_SYSTEM_PROMPT =
  "You are the NISQ Vanguard Orchestrator — coordinating a multi-agent AI security analysis.\n\n" +
  "Your role:\n" +
  "1. Classify the type of security input\n" +
  "2. Route to appropriate agents\n" +
  "3. Synthesize results into clear answers\n" +
  "4. Maintain conversation context\n\n" +
  "When answering security questions:\n" +
  "- Be clear and educational\n" +
  "- Explain the threat in simple language\n" +
  "- Always include risk level\n" +
  "- Provide actionable safety advice\n" +
  "- Reference MITRE techniques when applicable\n" +
  "- Structure complex analyses with the multi-agent pipeline";

/**
 * Full orchestrated analysis — runs all agents in pipeline
 */
export async function runFullAnalysis(
  input: AnalysisInput,
  options?: { skipReport?: boolean },
): Promise<OrchestratedAnalysis> {
  const requestId = "or-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  const timestamp = new Date().toISOString();

  const result: OrchestratedAnalysis = {
    requestId,
    timestamp,
    input,
    detection: null,
    analysis: null,
    risk: null,
    report: null,
    response: null,
    status: "running",
  };

  try {
    // Phase 1: Detection
    const detection = await runDetection(input.data);
    result.detection = detection;

    // Phase 2: Analysis
    const findingsStr = detection.findings
      .map((f) => f.type + ": " + f.description + " (" + f.severity + ")")
      .join("\n");
    const analysis = await runAnalysis(findingsStr);
    result.analysis = analysis;

    // Phase 3: Risk
    const risk = await calculateRisk(detection.findings, analysis.attackPattern);
    result.risk = risk;

    // Phase 4: Response
    const response = await generateResponse(detection, analysis, risk);
    result.response = response;

    // Phase 5: Report (optional)
    if (!options?.skipReport) {
      const report = await generateReport(detection, analysis, risk, response);
      result.report = report;
    }

    result.status = "completed";
  } catch (e) {
    console.error("[Orchestrator] Pipeline error:", e);
    result.status = "failed";
    result.error = e instanceof Error ? e.message : "Unknown orchestrator error";
  }

  return result;
}

/**
 * Quick analysis — runs detection + risk only (faster)
 */
export async function runQuickAnalysis(input: string): Promise<{
  detection: DetectionResult;
  risk: RiskResult;
  summary: string;
}> {
  const detection = await runDetection(input);
  const riskScore = calculateRiskScoreFromFindings(detection.findings);
  const risk: RiskResult = {
    agent: "risk",
    riskScore,
    severity: scoreToSeverity(riskScore),
    factors: [],
    overallAssessment: "Quick assessment based on " + detection.findings.length + " findings",
  };

  const summary =
    detection.findings.length > 0
      ? "Detected " +
        detection.findings.length +
        " indicator(s). Risk level: " +
        risk.severity +
        " (" +
        riskScore +
        "/100). " +
        detection.summary
      : "No immediate threats detected. Risk level: Low.";

  return { detection, risk, summary };
}

/**
 * Process a security event through the multi-agent pipeline
 */
export async function processSecurityEvent(event: SecurityEvent): Promise<OrchestratedAnalysis> {
  const eventData = JSON.stringify(event, null, 2);
  return runFullAnalysis({
    type: "security_event",
    data: eventData,
    metadata: { eventId: event.id, source: event.source },
  });
}

/**
 * Chat query handler — routes security questions through agents
 */
export async function handleSecurityChatQuery(
  message: string,
  threatContext?: string,
): Promise<{
  reply: string;
  analysis?: OrchestratedAnalysis;
}> {
  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: ORCHESTRATOR_SYSTEM_PROMPT },
  ];

  if (threatContext) {
    messages.push({
      role: "user",
      content: "Context from security analysis:\n" + threatContext,
    });
  }

  const hasThreatIndicators = checkForThreatIndicators(message);
  let analysis: OrchestratedAnalysis | undefined;

  if (hasThreatIndicators) {
    // Run full analysis for threat-related queries
    analysis = await runFullAnalysis({ type: "chat_query", data: message }, { skipReport: true });

    const contextData = analysis
      ? "Detection Findings: " +
        (analysis.detection?.findings.length || 0) +
        " issues found\n" +
        "Risk Score: " +
        (analysis.risk?.riskScore || 0) +
        "/100\n" +
        "Severity: " +
        (analysis.risk?.severity || "Low")
      : "";

    messages.push({ role: "user", content: message });
    messages.push({
      role: "user",
      content:
        "Additional context from agent analysis:\n" +
        contextData +
        "\n\nProvide a clear, helpful security answer incorporating this analysis.",
    });
  } else {
    messages.push({ role: "user", content: message });
  }

  try {
    const reply = await callChatModel(messages);
    return { reply, analysis };
  } catch (e) {
    console.error("[Orchestrator] Chat error:", e);
    return {
      reply: "I encountered an error processing your security query. Please try again.",
      analysis,
    };
  }
}

/**
 * Check if a message contains threat indicators that warrant full analysis
 */
function checkForThreatIndicators(message: string): boolean {
  const threatKeywords = [
    "threat",
    "attack",
    "malware",
    "phishing",
    "breach",
    "hack",
    "virus",
    "ransomware",
    "suspicious",
    "fraud",
    "scam",
    "compromised",
    "infected",
    "blocked",
    "alert",
    "incident",
    "vulnerability",
    "exploit",
    "trojan",
    "spyware",
    "botnet",
    "ddos",
    "intrusion",
    "unauthorized",
    "malicious",
    "dangerous",
    "risk",
    "leak",
    "exposure",
    "credential",
    "password reset",
    "login failed",
    "brute force",
    "social engineering",
  ];

  const lower = message.toLowerCase();
  return threatKeywords.some((kw) => lower.includes(kw));
}

/**
 * Create a simplified analysis summary for UI display
 */
export function formatAnalysisSummary(analysis: OrchestratedAnalysis): string {
  const lines: string[] = [];
  lines.push("NISQ Vanguard AI Analysis");
  lines.push("");

  if (analysis.detection?.findings.length) {
    lines.push("Findings: " + analysis.detection.findings.length + " detected");
    for (const f of analysis.detection.findings.slice(0, 5)) {
      lines.push("- " + f.type + ": " + f.description + " [" + f.severity + "]");
    }
  }

  if (analysis.risk) {
    lines.push("");
    lines.push("Risk Score: " + analysis.risk.riskScore + "/100");
    lines.push("Severity: " + analysis.risk.severity);
  }

  if (analysis.analysis?.attackPattern) {
    lines.push("");
    lines.push("Attack Pattern: " + analysis.analysis.attackPattern);
    if (analysis.analysis.mitreTechniques.length) {
      lines.push("MITRE Techniques: " + analysis.analysis.mitreTechniques.join(", "));
    }
  }

  if (analysis.response) {
    lines.push("");
    lines.push("Recommended Actions:");
    for (const action of analysis.response.immediateActions.slice(0, 3)) {
      lines.push("- " + action);
    }
    if (analysis.response.requiresApproval) {
      lines.push("* Some actions require administrator approval *");
    }
  }

  return lines.join("\n");
}
