-- =============================================================================
-- Migration: pg_cron + pg_net every-minute certificate-email scheduler
-- Replaces Vercel cron (downgraded to daily safety-net on Hobby plan).
-- Reads CRON_SECRET and SITE_URL from Supabase Vault at execution time.
-- =============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron   WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net    WITH SCHEMA extensions;

-- 2. Wrapper function that reads vault secrets and fires HTTP POST
--    This runs every minute via pg_cron. If vault secrets are missing
--    it logs a notice and exits gracefully (no crash loop).
CREATE OR REPLACE FUNCTION public.invoke_certificate_email_worker()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_cron_secret text;
  v_site_url    text;
  v_request_id  bigint;
BEGIN
  -- Read secrets from Supabase Vault
  SELECT decrypted_secret INTO v_cron_secret
    FROM vault.decrypted_secrets
   WHERE name = 'cron_secret'
   LIMIT 1;

  SELECT decrypted_secret INTO v_site_url
    FROM vault.decrypted_secrets
   WHERE name = 'site_url'
   LIMIT 1;

  -- Guard: skip if secrets not yet stored
  IF v_cron_secret IS NULL OR v_site_url IS NULL THEN
    RAISE NOTICE '[pg_cron] Skipping certificate email worker: vault secrets not configured (cron_secret=%, site_url=%)',
      CASE WHEN v_cron_secret IS NULL THEN 'MISSING' ELSE 'OK' END,
      CASE WHEN v_site_url IS NULL    THEN 'MISSING' ELSE 'OK' END;
    RETURN;
  END IF;

  -- Fire-and-forget HTTP POST via pg_net
  SELECT net.http_post(
    url     := v_site_url || '/api/cron/certificates-email',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_cron_secret
    ),
    body    := '{}'::jsonb
  ) INTO v_request_id;

  RAISE LOG '[pg_cron] Certificate email worker dispatched, pg_net request_id=%', v_request_id;
END;
$$;

-- 3. Schedule the job: every minute
SELECT cron.schedule(
  'certificate-email-worker',   -- job name (idempotent: same name = update)
  '* * * * *',                  -- every minute
  $$ SELECT public.invoke_certificate_email_worker(); $$
);

-- 4. Diagnostic view for run history (query cron.job_run_details directly,
--    but this view filters to our job for convenience)
CREATE OR REPLACE VIEW public.certificate_email_cron_runs AS
SELECT
  jrd.runid,
  jrd.job_pid,
  jrd.database,
  jrd.username,
  jrd.command,
  jrd.status,
  jrd.return_message,
  jrd.start_time,
  jrd.end_time
FROM cron.job_run_details jrd
JOIN cron.job j ON j.jobid = jrd.jobid
WHERE j.jobname = 'certificate-email-worker'
ORDER BY jrd.start_time DESC;

-- Grant the view to authenticated and service_role for admin dashboards
GRANT SELECT ON public.certificate_email_cron_runs TO authenticated;
GRANT SELECT ON public.certificate_email_cron_runs TO service_role;

COMMENT ON FUNCTION public.invoke_certificate_email_worker() IS
  'Reads CRON_SECRET and SITE_URL from Supabase Vault and POSTs to /api/cron/certificates-email every minute via pg_cron.';
