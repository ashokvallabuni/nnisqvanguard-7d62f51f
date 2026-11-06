-- ============================================================
-- Migration: Stage 1 - Automated Certification & Verification Pipeline
-- File: supabase/migrations/20261103000000_certificates_pipeline.sql
-- Idempotent, Additive, Reversible
-- ============================================================

-- 1. Extend existing public.certificates table with pipeline attributes
DO $$ BEGIN
  ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS pdf_path text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS pdf_sha256 text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS blockchain_tx_hash text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS blockchain_network text DEFAULT 'polygon_mainnet';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS blockchain_status text NOT NULL DEFAULT 'NOT_CONFIGURED';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS email_status text NOT NULL DEFAULT 'PENDING';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS final_score integer;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS verification_token text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS revoked boolean NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS revoked_reason text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS revoked_at timestamptz;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_certificates_cert_number ON public.certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON public.certificates(course_id);

-- 2. Create public.course_completions table
CREATE TABLE IF NOT EXISTS public.course_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_id uuid REFERENCES public.certificates(id) ON DELETE SET NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  total_modules integer NOT NULL DEFAULT 0,
  completed_modules integer NOT NULL DEFAULT 0,
  final_score integer CHECK (final_score IS NULL OR (final_score >= 0 AND final_score <= 100)),
  requirements_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_completions_user ON public.course_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_course_completions_course ON public.course_completions(course_id);

ALTER TABLE public.course_completions ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.course_completions TO authenticated;
GRANT ALL ON public.course_completions TO service_role;

DO $$ BEGIN
  CREATE POLICY "Users can view own course completions" ON public.course_completions
    FOR SELECT TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all course completions" ON public.course_completions
    FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Create public.certificate_email_jobs table
CREATE TABLE IF NOT EXISTS public.certificate_email_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id uuid NOT NULL REFERENCES public.certificates(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  delivery_status text NOT NULL DEFAULT 'PENDING'
    CHECK (delivery_status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED')),
  attempts integer NOT NULL DEFAULT 0,
  provider_message_id text,
  last_error text,
  next_retry_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(certificate_id)
);

CREATE INDEX IF NOT EXISTS idx_email_jobs_status ON public.certificate_email_jobs(delivery_status, next_retry_at);

ALTER TABLE public.certificate_email_jobs ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.certificate_email_jobs TO service_role;

-- Allow students to view only email delivery status for their own certificates
DO $$ BEGIN
  CREATE POLICY "Users view email status for own certificates" ON public.certificate_email_jobs
    FOR SELECT TO authenticated USING (
      EXISTS (
        SELECT 1 FROM public.certificates c
        WHERE c.id = certificate_email_jobs.certificate_id AND c.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins view all email jobs" ON public.certificate_email_jobs
    FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. Create public.blockchain_anchors table
CREATE TABLE IF NOT EXISTS public.blockchain_anchors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id uuid NOT NULL REFERENCES public.certificates(id) ON DELETE CASCADE,
  cert_id_hash text NOT NULL,
  pdf_sha256 text NOT NULL,
  network text NOT NULL DEFAULT 'polygon_pos',
  contract_address text,
  tx_hash text,
  block_number bigint,
  status text NOT NULL DEFAULT 'NOT_CONFIGURED'
    CHECK (status IN ('NOT_CONFIGURED', 'PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED')),
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(certificate_id)
);

CREATE INDEX IF NOT EXISTS idx_blockchain_anchors_status ON public.blockchain_anchors(status);
CREATE INDEX IF NOT EXISTS idx_blockchain_anchors_tx ON public.blockchain_anchors(tx_hash);

ALTER TABLE public.blockchain_anchors ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.blockchain_anchors TO anon, authenticated;
GRANT ALL ON public.blockchain_anchors TO service_role;

DO $$ BEGIN
  CREATE POLICY "Anyone can view blockchain anchors" ON public.blockchain_anchors
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Create public.certificate_audit_logs table
CREATE TABLE IF NOT EXISTS public.certificate_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id uuid REFERENCES public.certificates(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cert_audit_cert ON public.certificate_audit_logs(certificate_id);
CREATE INDEX IF NOT EXISTS idx_cert_audit_user ON public.certificate_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_cert_audit_event ON public.certificate_audit_logs(event_type);

ALTER TABLE public.certificate_audit_logs ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.certificate_audit_logs TO service_role;

DO $$ BEGIN
  CREATE POLICY "Admins can view audit logs" ON public.certificate_audit_logs
    FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6. Setup private storage bucket for certificates
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('certificates', 'certificates', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- Storage RLS: allow authenticated users to read only their own certificates if paths follow {userId}/{certId}.pdf
DO $$ BEGIN
  CREATE POLICY "Users can download own certificates" ON storage.objects
    FOR SELECT TO authenticated
    USING (
      bucket_id = 'certificates'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can access all certificates in storage" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'certificates' AND public.has_role(auth.uid(), 'admin'))
    WITH CHECK (bucket_id = 'certificates' AND public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

