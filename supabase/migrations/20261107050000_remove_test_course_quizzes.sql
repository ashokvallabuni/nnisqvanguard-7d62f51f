-- =============================================================================
-- Migration: 20261107050000_remove_test_course_quizzes.sql
-- Removes quiz rows and requirements specifically from internal/test courses
-- while preserving all production quizzes and learning materials.
-- =============================================================================

DO $$
DECLARE
  v_test_course_id uuid;
BEGIN
  -- Identify test course by slug or is_test flag
  FOR v_test_course_id IN 
    SELECT id FROM public.courses WHERE is_test = true OR slug LIKE 'zz-%'
  LOOP
    DELETE FROM public.quizzes 
    WHERE module_id IN (
      SELECT id FROM public.modules WHERE course_id = v_test_course_id
    );
  END LOOP;
END $$;

