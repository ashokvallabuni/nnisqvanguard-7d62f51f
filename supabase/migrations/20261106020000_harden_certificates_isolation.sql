-- ============================================================
-- Migration: Stage 4 Hardening - Clean up all legacy policies on certificates
-- Migration ID: 20261106020000_harden_certificates_isolation.sql
-- Idempotent, Additive, Reversible
-- ============================================================

-- Drop ANY lingering permissive policies from all previous migrations
DROP POLICY IF EXISTS "Anyone can verify certificates" ON public.certificates;
DROP POLICY IF EXISTS "Certificates are viewable by everyone" ON public.certificates;
DROP POLICY IF EXISTS "Public certificates access" ON public.certificates;

-- Ensure RLS is strictly forced
ALTER TABLE public.certificates FORCE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_email_jobs FORCE ROW LEVEL SECURITY;

-- Recreate clean strict policies
DROP POLICY IF EXISTS "Users view own certificates" ON public.certificates;
CREATE POLICY "Users view own certificates" ON public.certificates
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins view all certificates" ON public.certificates;
CREATE POLICY "Admins view all certificates" ON public.certificates
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Revoke all table-level access from anon
REVOKE ALL ON public.certificates FROM anon;
REVOKE ALL ON public.certificate_email_jobs FROM anon;

