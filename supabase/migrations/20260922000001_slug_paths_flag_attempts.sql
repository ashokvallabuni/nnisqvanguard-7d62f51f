-- Migration: slug-based user_learning_paths + lab_flag_attempts corrections
-- Apply with: supabase db push --project-ref cbyoozhtubavksiolgxz
-- (Run AFTER 20260922000000_progression_platform.sql)

-- ============================================================
-- USER LEARNING PATHS: add path_slug column for client-side
-- enrollment without FK dependency on learning_paths table.
-- This is an additive, idempotent change.
-- ============================================================
ALTER TABLE public.user_learning_paths
  ADD COLUMN IF NOT EXISTS path_slug text;

-- Allow upsert conflict on (user_id, path_slug) for direct slug enrollment
CREATE UNIQUE INDEX IF NOT EXISTS user_learning_paths_user_slug_idx
  ON public.user_learning_paths(user_id, path_slug)
  WHERE path_slug IS NOT NULL;

-- Allow users to enroll by slug without requiring an existing learning_paths row
DROP POLICY IF EXISTS "Users enroll in published paths" ON public.user_learning_paths;
CREATE POLICY "Users enroll in paths" ON public.user_learning_paths
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- LAB FLAG ATTEMPTS: create table if missing from earlier migrations
-- (earlier migrations may or may not have this table)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lab_flag_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.lab_sessions(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id uuid REFERENCES public.labs(id) ON DELETE SET NULL,
  submitted_flag text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  score integer NOT NULL DEFAULT 0,
  attempt_number integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lab_flag_attempts_session_idx
  ON public.lab_flag_attempts(session_id, user_id);

ALTER TABLE public.lab_flag_attempts ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON public.lab_flag_attempts TO authenticated;

DO $$ BEGIN
  CREATE POLICY "Users view own flag attempts"
    ON public.lab_flag_attempts FOR SELECT TO authenticated
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users insert own flag attempts"
    ON public.lab_flag_attempts FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- LAB TASK ATTEMPTS: create table if missing
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lab_task_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.lab_sessions(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id uuid REFERENCES public.labs(id) ON DELETE SET NULL,
  task_id uuid REFERENCES public.lab_tasks(id) ON DELETE SET NULL,
  submitted_answer text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  score integer NOT NULL DEFAULT 0,
  attempt_number integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lab_task_attempts_session_idx
  ON public.lab_task_attempts(session_id, user_id);

ALTER TABLE public.lab_task_attempts ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON public.lab_task_attempts TO authenticated;

DO $$ BEGIN
  CREATE POLICY "Users view own task attempts"
    ON public.lab_task_attempts FOR SELECT TO authenticated
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users insert own task attempts"
    ON public.lab_task_attempts FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- LAB PROGRESS: ensure updated_at column exists
-- ============================================================
ALTER TABLE public.lab_progress
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- ============================================================
-- MODULE PROGRESS: ensure updated_at exists
-- ============================================================
ALTER TABLE public.module_progress
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
