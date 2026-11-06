-- =============================================================================
-- Migration: 20261107040000_seed_test_course_all_module_quizzes.sql
-- Additive migration: Seeds real quizzes for all modules of zz-certificate-test-course
-- Ensures every module has a real database quiz row with server-side answers.
-- =============================================================================

DO $$
DECLARE
  v_course_id uuid;
  v_mod1_id uuid;
  v_mod2_id uuid;
  v_mod3_id uuid;
BEGIN
  SELECT id INTO v_course_id FROM public.courses WHERE slug = 'zz-certificate-test-course';
  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'Course zz-certificate-test-course not found';
  END IF;

  SELECT id INTO v_mod1_id FROM public.modules WHERE course_id = v_course_id AND slug = 'zz-test-mod-1';
  SELECT id INTO v_mod2_id FROM public.modules WHERE course_id = v_course_id AND slug = 'zz-test-mod-2';
  SELECT id INTO v_mod3_id FROM public.modules WHERE course_id = v_course_id AND slug = 'zz-test-mod-3';

  -- ── Module 1 Quiz (Question 1 from user specification)
  -- "What is the primary security objective when configuring Module 1: Principles of Quantum-Safe Cryptography?"
  -- Correct: "Ensure least privilege, accurate authentication, and audit logging"
  IF v_mod1_id IS NOT NULL THEN
    INSERT INTO public.quizzes (module_id, question, options, correct_option, explanation, sort_order)
    VALUES (
      v_mod1_id,
      'What is the primary security objective when configuring Module 1: Principles of Quantum-Safe Cryptography?',
      jsonb_build_array(
        'Ensure least privilege, accurate authentication, and audit logging',
        'Disable all encryption to increase processing speed',
        'Allow all incoming anonymous traffic by default',
        'Delete system logs every hour'
      ),
      0,
      'Applying the principle of least privilege, mutual authentication, and immutable audit logs is the core security standard.',
      1
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Module 2 Quiz (Question about Module 2: Lattice-Based Key Encapsulation)
  IF v_mod2_id IS NOT NULL THEN
    INSERT INTO public.quizzes (module_id, question, options, correct_option, explanation, sort_order)
    VALUES (
      v_mod2_id,
      'What hard mathematical problem provides the security foundation for ML-KEM (Kyber)?',
      jsonb_build_array(
        'Integer factorization of large semiprimes',
        'Module Learning With Errors (M-LWE) over structured lattices',
        'Discrete logarithms over elliptic curve points',
        'Symmetric substitution-permutation networks'
      ),
      1,
      'ML-KEM relies on the hardness of the Module Learning With Errors (M-LWE) problem over algebraic lattices.',
      1
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Module 3 Quiz (Ensure Module 3 has Question 3 linked)
  -- Module 3 already has 3 questions from 20261106030000, so we do not duplicate.
END $$;

