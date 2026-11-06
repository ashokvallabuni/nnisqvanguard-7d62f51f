-- Migration: 20261106030000_create_test_course.sql
-- Additive migration: Adds is_test column to courses (default false) and creates zz-certificate-test-course

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

-- Create the test course if not already created
INSERT INTO public.courses (slug, title, description, level, tier, sort_order, is_test)
VALUES (
  'zz-certificate-test-course',
  'Certificate Test Course (Internal)',
  'Internal verification course for validating end-to-end certification pipeline.',
  'beginner',
  'free',
  9999,
  true
)
ON CONFLICT (slug) DO UPDATE
SET is_test = true, title = 'Certificate Test Course (Internal)';

-- Insert 3 modules for zz-certificate-test-course
DO $$
DECLARE
  v_course_id uuid;
  v_mod1_id uuid;
  v_mod2_id uuid;
  v_mod3_id uuid;
BEGIN
  SELECT id INTO v_course_id FROM public.courses WHERE slug = 'zz-certificate-test-course';

  -- Module 1
  INSERT INTO public.modules (course_id, slug, title, notes_md, sort_order, practice_labs)
  VALUES (
    v_course_id,
    'zz-test-mod-1',
    'Module 1: Principles of Quantum-Safe Cryptography',
    '# Module 1: Foundations\nThis module covers classical vs quantum security vulnerabilities and why post-quantum algorithms are essential.',
    1,
    '{}'
  )
  ON CONFLICT (course_id, slug) DO UPDATE
  SET title = EXCLUDED.title, notes_md = EXCLUDED.notes_md
  RETURNING id INTO v_mod1_id;

  -- Module 2
  INSERT INTO public.modules (course_id, slug, title, notes_md, sort_order, practice_labs)
  VALUES (
    v_course_id,
    'zz-test-mod-2',
    'Module 2: Lattice-Based Key Encapsulation (ML-KEM)',
    '# Module 2: Key Encapsulation\nExploration of ML-KEM / Kyber for post-quantum public-key exchange.',
    2,
    '{}'
  )
  ON CONFLICT (course_id, slug) DO UPDATE
  SET title = EXCLUDED.title, notes_md = EXCLUDED.notes_md
  RETURNING id INTO v_mod2_id;

  -- Module 3
  INSERT INTO public.modules (course_id, slug, title, notes_md, sort_order, practice_labs)
  VALUES (
    v_course_id,
    'zz-test-mod-3',
    'Module 3: Verification & Assessment Protocol',
    '# Module 3: Verification\nHow digital credentials and cryptographic hashes authenticate post-quantum expertise.',
    3,
    '{}'
  )
  ON CONFLICT (course_id, slug) DO UPDATE
  SET title = EXCLUDED.title, notes_md = EXCLUDED.notes_md
  RETURNING id INTO v_mod3_id;

  -- Insert 3 quiz questions for Module 3 (passing score 70%)
  -- Question 1
  INSERT INTO public.quizzes (module_id, question, options, correct_option, explanation, sort_order)
  VALUES (
    v_mod3_id,
    'Which algorithm is standardized by NIST as FIPS 203 for Key Encapsulation?',
    '["ML-KEM (Kyber)", "RSA-2048", "AES-GCM", "SHA-256"]'::jsonb,
    0,
    'ML-KEM (derived from CRYSTALS-Kyber) is the standardized post-quantum key encapsulation mechanism in FIPS 203.',
    1
  )
  ON CONFLICT DO NOTHING;

  -- Question 2
  INSERT INTO public.quizzes (module_id, question, options, correct_option, explanation, sort_order)
  VALUES (
    v_mod3_id,
    'What cryptographic primitive is used to anchor certificate integrity immutably?',
    '["Plaintext JSON", "SHA-256 cryptographic digest", "Base64 encoding", "MD5 checksum"]'::jsonb,
    1,
    'SHA-256 produces a collision-resistant 256-bit hash representing the exact binary content of the certificate PDF.',
    2
  )
  ON CONFLICT DO NOTHING;

  -- Question 3
  INSERT INTO public.quizzes (module_id, question, options, correct_option, explanation, sort_order)
  VALUES (
    v_mod3_id,
    'What happens when a certificate is marked revoked in NISQ Vanguard Academy?',
    '["It is permanently deleted", "Public verification page displays REVOKED status", "A new certificate is immediately generated", "The user account is closed"]'::jsonb,
    1,
    'Revocation preserves immutable audit records while updating status so public lookups clearly indicate REVOKED.',
    3
  )
  ON CONFLICT DO NOTHING;
END $$;

