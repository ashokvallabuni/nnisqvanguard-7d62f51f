-- ============================================================
-- Migration: Additive Columns & Concurrency Lock for Email Worker
-- Migration ID: 20261107020000_email_jobs_worker_and_locking.sql
-- Idempotent, Additive, Reversible
-- ============================================================

-- 1. Add tracking columns to certificate_email_jobs
DO $$ BEGIN
  ALTER TABLE public.certificate_email_jobs ADD COLUMN IF NOT EXISTS locked_at timestamptz;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.certificate_email_jobs ADD COLUMN IF NOT EXISTS sent_at timestamptz;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.certificate_email_jobs ADD COLUMN IF NOT EXISTS delivered_at timestamptz;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- 2. Update CHECK constraint to support DELIVERED, BOUNCED, COMPLAINED
ALTER TABLE public.certificate_email_jobs DROP CONSTRAINT IF EXISTS certificate_email_jobs_delivery_status_check;

ALTER TABLE public.certificate_email_jobs ADD CONSTRAINT certificate_email_jobs_delivery_status_check
  CHECK (delivery_status IN ('PENDING', 'PROCESSING', 'SENT', 'DELIVERED', 'BOUNCED', 'COMPLAINED', 'FAILED'));

-- 3. High-performance index for claiming pending/retry jobs
CREATE INDEX IF NOT EXISTS idx_email_jobs_worker_claim
  ON public.certificate_email_jobs(delivery_status, next_retry_at, locked_at);

-- 4. High-performance index for webhook lookups by provider_message_id
CREATE INDEX IF NOT EXISTS idx_email_jobs_provider_msg_id
  ON public.certificate_email_jobs(provider_message_id)
  WHERE provider_message_id IS NOT NULL;

-- 5. Atomic Claim Function with SKIP LOCKED and Stuck Worker Release
CREATE OR REPLACE FUNCTION public.claim_next_email_jobs(
  batch_size integer DEFAULT 10,
  timeout_seconds integer DEFAULT 300
)
RETURNS SETOF public.certificate_email_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Automatically release stuck PROCESSING jobs older than timeout
  UPDATE public.certificate_email_jobs
  SET delivery_status = 'PENDING',
      locked_at = NULL,
      updated_at = now()
  WHERE delivery_status = 'PROCESSING'
    AND locked_at < (now() - (timeout_seconds || ' seconds')::interval);

  -- 2. Claim available PENDING or retry-due FAILED jobs with row locking
  RETURN QUERY
  WITH candidates AS (
    SELECT id
    FROM public.certificate_email_jobs
    WHERE (
      (delivery_status = 'PENDING')
      OR
      (delivery_status = 'FAILED' AND (next_retry_at IS NULL OR next_retry_at <= now()) AND attempts < 5)
    )
    ORDER BY created_at ASC
    LIMIT batch_size
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.certificate_email_jobs j
  SET delivery_status = 'PROCESSING',
      locked_at = now(),
      updated_at = now()
  FROM candidates
  WHERE j.id = candidates.id
  RETURNING j.*;
END;
$$;

