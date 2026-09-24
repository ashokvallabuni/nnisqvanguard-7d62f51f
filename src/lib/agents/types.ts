// ============================================================
// NISQ Vanguard — AI Agent System Types
// ============================================================

export type ThreatVerdict = "Safe" | "Suspicious" | "Malicious" | "Critical";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type AgentRole = "detection" | "analysis" | "risk" | "report" | "response";

export interface AgentContext {
  userId?: string;
  organizationId?: string;
  timestamp: string;
  requestId: string;
}

export interface DetectionResult {
  agent: "detection";
  findings: Finding[];
  summary: string;
  confidence: number; // 0-100
}

export interface Finding {
  type: string;
  description: string;
  indicator: string;
  severity: RiskLevel;
  timestamp: string;
  source: string;
  raw?: unknown;
}

export interface AnalysisResult {
  agent: "analysis";
  attackPattern: string | null;
  killChainPhase: string | null;
  mitreTechniques: string[];
  iocLinks: string[];
  threatIntel: ThreatIntel[];
  summary: string;
}

export interface ThreatIntel {
  source: string;
  indicator: string;
  malicious: boolean;
  confidence: number;
  details: string;
}

export interface RiskResult {
  agent: "risk";
  riskScore: number; // 0-100
  severity: RiskLevel;
  factors: RiskFactor[];
  overallAssessment: string;
}

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
}

export interface ReportResult {
  agent: "report";
  title: string;
  executiveSummary: string;
  timeline: TimelineEvent[];
  technicalDetails: string;
  recommendations: string[];
  riskAnalysis: string;
  reportMarkdown: string;
}

export interface TimelineEvent {
  time: string;
  event: string;
  detail: string;
}

export interface ResponseResult {
  agent: "response";
  immediateActions: string[];
  containmentSteps: string[];
  remediationSteps: string[];
  preventiveMeasures: string[];
  approvedActions: string[];
  requiresApproval: boolean;
}

export interface OrchestratedAnalysis {
  requestId: string;
  timestamp: string;
  input: AnalysisInput;
  detection: DetectionResult | null;
  analysis: AnalysisResult | null;
  risk: RiskResult | null;
  report: ReportResult | null;
  response: ResponseResult | null;
  status: "pending" | "running" | "completed" | "failed";
  error?: string;
}

export interface AnalysisInput {
  type:
    "security_event" | "url" | "file_hash" | "ip_address" | "domain" | "log_entry" | "chat_query";
  data: string;
  metadata?: Record<string, unknown>;
}

export interface SecurityEvent {
  id: string;
  type: string;
  source: string;
  severity: string;
  description: string;
  timestamp: string;
  raw_data?: unknown;
  source_ip?: string;
  destination_ip?: string;
  username?: string;
  action?: string;
  protocol?: string;
  port?: number;
  status?: string;
}
