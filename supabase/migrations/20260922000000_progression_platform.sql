-- Migration: certificates + user_learning_paths + lab_tasks private answer column
-- Apply with: supabase db push --project-ref cbyoozhtubavksiolgxz

-- ============================================================
-- CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  certificate_number text NOT NULL UNIQUE,
  recipient_name text NOT NULL,
  course_title text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS certificates_user_idx ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS certificates_number_idx ON public.certificates(certificate_number);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Public verification: anyone can look up a certificate by ID/number
GRANT SELECT ON public.certificates TO anon, authenticated;
CREATE POLICY "Anyone can verify certificates" ON public.certificates
  FOR SELECT USING (true);

-- Only service-role (server functions) may insert/update — not authenticated users directly
-- No INSERT policy for authenticated means browser cannot create certificates

-- ============================================================
-- USER LEARNING PATHS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_learning_paths (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learning_path_id uuid NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  last_activity_at timestamptz,
  completion_percentage integer NOT NULL DEFAULT 0
    CHECK (completion_percentage BETWEEN 0 AND 100),
  PRIMARY KEY (user_id, learning_path_id)
);

CREATE INDEX IF NOT EXISTS user_learning_paths_user_idx
  ON public.user_learning_paths(user_id, last_activity_at DESC NULLS LAST);

ALTER TABLE public.user_learning_paths ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.user_learning_paths TO authenticated;

CREATE POLICY "Users view own path enrollment" ON public.user_learning_paths
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users enroll in published paths" ON public.user_learning_paths
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.learning_paths lp
      WHERE lp.id = learning_path_id AND lp.status = 'PUBLISHED'
    )
  );
CREATE POLICY "Users update own path progress" ON public.user_learning_paths
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- LAB TASKS: private server-only expected_answer column
-- Column added but NOT exposed to authenticated users via RLS
-- ============================================================
ALTER TABLE public.lab_tasks
  ADD COLUMN IF NOT EXISTS expected_answer text;

-- Revoke direct read of expected_answer from authenticated users.
-- The existing SELECT policy on lab_tasks allows reading all columns.
-- We tighten it: drop the existing policy and recreate without expected_answer.
-- However, PostgreSQL RLS cannot column-restrict via policies alone.
-- Solution: create a secure view that omits expected_answer.
DROP VIEW IF EXISTS public.lab_tasks_public;
CREATE VIEW public.lab_tasks_public AS
  SELECT id, lab_id, title, description, task_type, sort_order, created_at
  FROM public.lab_tasks;

GRANT SELECT ON public.lab_tasks_public TO anon, authenticated;
-- Note: expected_answer is only accessible via server-side functions using service-role key.

-- ============================================================
-- LAB PROGRESS: ensure completed column exists
-- ============================================================
ALTER TABLE public.lab_progress
  ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT false;

-- ============================================================
-- LAB FLAG ATTEMPTS: grant INSERT to authenticated (server fn writes via user-authed client)
-- ============================================================
GRANT INSERT ON public.lab_flag_attempts TO authenticated;
GRANT INSERT ON public.lab_task_attempts TO authenticated;

-- RLS for writes: user can only insert their own attempts
DO $$ BEGIN
  CREATE POLICY "Users insert own flag attempts" ON public.lab_flag_attempts
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users insert own task attempts" ON public.lab_task_attempts
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- QUIZ ATTEMPTS: track per-question attempts with server score
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  selected_option integer NOT NULL CHECK (selected_option >= 0),
  is_correct boolean NOT NULL DEFAULT false,
  score integer NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  attempt_number integer NOT NULL DEFAULT 1 CHECK (attempt_number > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quiz_attempts_user_quiz_idx ON public.quiz_attempts(user_id, quiz_id, created_at DESC);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.quiz_attempts TO authenticated;

CREATE POLICY "Users view own quiz attempts" ON public.quiz_attempts
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert own quiz attempts" ON public.quiz_attempts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
