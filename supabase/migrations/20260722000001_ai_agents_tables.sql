-- NISQ Vanguard AI Agent System Tables
-- Multi-agent analysis storage, incident tracking, and report generation

-- ============================================================
-- AI ANALYSES — Stores multi-agent analysis results
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('security_event','url','file_hash','ip_address','domain','log_entry','chat_query')),
  input_data TEXT NOT NULL,
  input_metadata JSONB,
  detection_result JSONB,
  analysis_result JSONB,
  risk_result JSONB,
  response_result JSONB,
  report_result JSONB,
  risk_score INT,
  severity TEXT CHECK (severity IN ('Low','Medium','High','Critical')),
  findings_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('pending','running','completed','failed')),
  error_message TEXT,
  processing_time_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

GRANT SELECT, INSERT ON public.ai_analyses TO authenticated;
GRANT ALL ON public.ai_analyses TO service_role;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own analyses" ON public.ai_analyses FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own analyses" ON public.ai_analyses FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage analyses" ON public.ai_analyses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE INDEX idx_ai_analyses_user_id ON public.ai_analyses(user_id);
CREATE INDEX idx_ai_analyses_status ON public.ai_analyses(status);
CREATE INDEX idx_ai_analyses_created_at ON public.ai_analyses(created_at DESC);
CREATE INDEX idx_ai_analyses_severity ON public.ai_analyses(severity);
CREATE INDEX idx_ai_analyses_risk_score ON public.ai_analyses(risk_score);

-- ============================================================
-- INCIDENTS — Security incident tracking system
-- ============================================================
CREATE TYPE public.incident_severity AS ENUM ('Low','Medium','High','Critical');
CREATE TYPE public.incident_status AS ENUM ('new','analyzing','investigating','contained','resolved','closed');
CREATE TYPE public.incident_source AS ENUM ('ai_detection','user_report','threat_intel','system_alert','manual');

CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity public.incident_severity NOT NULL DEFAULT 'Low',
  status public.incident_status NOT NULL DEFAULT 'new',
  source public.incident_source NOT NULL DEFAULT 'ai_detection',
  risk_score INT DEFAULT 0,
  attack_pattern TEXT,
  kill_chain_phase TEXT,
  mitre_techniques TEXT[],
  affected_assets TEXT[],
  indicators TEXT[],
  analysis_id UUID REFERENCES public.ai_analyses(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.incidents TO authenticated;
GRANT ALL ON public.incidents TO service_role;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own incidents" ON public.incidents FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR assigned_to = auth.uid());
CREATE POLICY "Users insert own incidents" ON public.incidents FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update incidents" ON public.incidents FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE INDEX idx_incidents_user_id ON public.incidents(user_id);
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incidents_severity ON public.incidents(severity);
CREATE INDEX idx_incidents_created_at ON public.incidents(created_at DESC);
CREATE INDEX idx_incidents_source ON public.incidents(source);

-- ============================================================
-- REPORTS — Generated security reports
-- ============================================================
CREATE TYPE public.report_type AS ENUM ('incident','threat_summary','weekly','monthly','custom');
CREATE TYPE public.report_format AS ENUM ('markdown','json');

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID,
  title TEXT NOT NULL,
  report_type public.report_type NOT NULL DEFAULT 'incident',
  format public.report_format NOT NULL DEFAULT 'markdown',
  incident_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
  analysis_id UUID REFERENCES public.ai_analyses(id) ON DELETE SET NULL,
  executive_summary TEXT,
  technical_details TEXT,
  risk_analysis TEXT,
  recommendations TEXT[],
  timeline JSONB,
  report_content TEXT,
  risk_score INT,
  severity TEXT CHECK (severity IN ('Low','Medium','High','Critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own reports" ON public.reports FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own reports" ON public.reports FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage reports" ON public.reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_type ON public.reports(report_type);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);

-- ============================================================
-- NOTIFICATIONS — Alert notifications for security events
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('alert','warning','info','success')),
  incident_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users insert own notifications" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

