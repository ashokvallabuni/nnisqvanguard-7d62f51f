-- ============================================================
-- Migration: Block 2 - Enforce Exact Certificate Lookup RPC & Revoke View
-- Migration ID: 20261106010000_exact_certificate_lookup_rpc.sql
-- Idempotent, Additive, Reversible
-- ============================================================

-- 1. Drop openly listable view so certificates cannot be enumerated or scraped
DROP VIEW IF EXISTS public.public_certificate_verifications;

-- 2. Create Security-Definer RPC function for EXACT certificate lookup
-- Takes an exact certificate number string. Returns at most one row of public-safe attributes.
-- If no certificate matches, returns an empty set.
CREATE OR REPLACE FUNCTION public.lookup_certificate_public(lookup_number text)
RETURNS TABLE (
  certificate_number text,
  masked_recipient_name text,
  course_title text,
  issuer text,
  issued_at timestamptz,
  final_score integer,
  pdf_sha256 text,
  blockchain_status text,
  blockchain_tx_hash text,
  blockchain_network text,
  revoked boolean,
  revoked_reason text,
  revoked_at timestamptz,
  verification_status text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    c.certificate_number,
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
  FROM public.certificates c
  WHERE c.certificate_number = lookup_number
  LIMIT 1;
$$;

-- 3. Grant EXECUTE to anon and authenticated
GRANT EXECUTE ON FUNCTION public.lookup_certificate_public(text) TO anon, authenticated;

