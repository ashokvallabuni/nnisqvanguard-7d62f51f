-- ============================================================
-- Migration: Additive Unique Constraint on (user_id, course_id) for Certificates
-- Migration ID: 20261107010000_unique_user_course_certificate.sql
-- Idempotent, Additive, Reversible
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_certificates_user_course_unique 
  ON public.certificates(user_id, course_id);

