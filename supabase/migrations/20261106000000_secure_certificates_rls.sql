-- ============================================================
-- Migration: Stage 1 Tightening - Secure Certificates RLS & Public Verification View
-- Migration ID: 20261106000000_secure_certificates_rls.sql
-- Idempotent, Additive, Reversible
-- ============================================================

-- 1. Drop broad SELECT policy on public.certificates
DROP POLICY IF EXISTS "Anyone can verify certificates" ON public.certificates;
DROP POLICY IF EXISTS "Users can view certificates" ON public.certificates;

-- 2. TIGHTEN RLS ON public.certificates:
-- Authenticated users can SELECT ONLY their own certificates.
-- Anonymous users CANNOT SELECT directly from public.certificates (user_id and internal fields remain completely private).
DO $$ BEGIN
  CREATE POLICY "Users view own certificates" ON public.certificates
    FOR SELECT TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins view all certificates" ON public.certificates
    FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Revoke public direct SELECT from anon on public.certificates
REVOKE SELECT ON public.certificates FROM anon;

-- 4. Create Security-Definer View for Public Verification
-- Only exposes non-sensitive verification attributes. Never exposes user_id, email, phone, or raw profile data.
DROP VIEW IF EXISTS public.public_certificate_verifications;
CREATE OR REPLACE VIEW public.public_certificate_verifications
WITH (security_invoker = false)
AS
  SELECT
    c.id,
    c.certificate_number,
    -- Masked recipient name (e.g. Ashok V.)
    CASE
      WHEN position(' ' in trim(c.recipient_name)) > 0 THEN
        split_part(trim(c.recipient_name), ' ', 1) || ' ' || substring(split_part(trim(c.recipient_name), ' ', 2) from 1 for 1) || '.'
      ELSE
        trim(c.recipient_name)
    END AS masked_recipient_name,
    c.course_title,
    'NISQ Vanguard — Defence Technologies Academy'::text AS issuer,
    c.issued_at,
    c.final_score,
    c.pdf_sha256,
    c.blockchain_status,
    c.blockchain_tx_hash,
    c.blockchain_network,
    c.revoked,
    c.revoked_reason,
    c.revoked_at,
    CASE
      WHEN c.revoked = true THEN 'REVOKED'
      WHEN c.blockchain_status = 'CONFIRMED' THEN 'VALID'
      ELSE 'PENDING'
    END AS verification_status
  FROM public.certificates c;

-- 5. Grant SELECT on public_certificate_verifications to anon and authenticated
GRANT SELECT ON public.public_certificate_verifications TO anon, authenticated;

