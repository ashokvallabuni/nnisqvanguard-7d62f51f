-- ============================================================
-- NISQ VANGUARD SECURITY AUDIT & PRIVILEGE HARDENING
-- Date: 2026-10-23
-- Fixes:
-- 1. Prevent Vertical Privilege Escalation on public.profiles (role tampering)
-- 2. Prevent Assessment Answer Leaks on public.quizzes, public.assignments, public.lab_tasks
-- 3. Enable Safe Anonymous Citizen Intake on public.complaints
-- ============================================================

-- ------------------------------------------------------------
-- 1. PROFILES: Prevent unauthorized role escalation
-- ------------------------------------------------------------
-- Ensure non-admins cannot change their own or others' roles during profile updates.
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Access denied: only administrators can change account roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();

-- Tighten the RLS policy on public.profiles UPDATE
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (
    (id = auth.uid() AND (role = OLD.role OR public.has_role(auth.uid(), 'admin')))
    OR public.has_role(auth.uid(), 'admin')
  );

-- ------------------------------------------------------------
-- 2. ASSESSMENT INTEGRITY: Protect answer keys and solutions
-- ------------------------------------------------------------
-- Revoke full-table SELECT from anon & authenticated on quizzes, assignments, lab_tasks
REVOKE SELECT ON public.quizzes FROM anon, authenticated;
REVOKE SELECT ON public.assignments FROM anon, authenticated;
REVOKE SELECT ON public.lab_tasks FROM anon, authenticated;

-- Grant column-level SELECT ONLY on safe student-facing columns (excluding answer keys)
GRANT SELECT (id, module_id, question, options, sort_order, created_at)
  ON public.quizzes TO anon, authenticated;

GRANT SELECT (id, module_id, title, instructions, task_type, sort_order, created_at)
  ON public.assignments TO anon, authenticated;

GRANT SELECT (id, lab_id, title, description, task_type, sort_order, created_at)
  ON public.lab_tasks TO anon, authenticated;

-- Ensure service_role maintains full access for server-side evaluation functions
GRANT ALL ON public.quizzes TO service_role;
GRANT ALL ON public.assignments TO service_role;
GRANT ALL ON public.lab_tasks TO service_role;

-- Provide convenient secure views omitting answer keys
CREATE OR REPLACE VIEW public.quizzes_safe AS
  SELECT id, module_id, question, options, sort_order, created_at
  FROM public.quizzes;
GRANT SELECT ON public.quizzes_safe TO anon, authenticated;

CREATE OR REPLACE VIEW public.assignments_safe AS
  SELECT id, module_id, title, instructions, task_type, sort_order, created_at
  FROM public.assignments;
GRANT SELECT ON public.assignments_safe TO anon, authenticated;

CREATE OR REPLACE VIEW public.lab_tasks_safe AS
  SELECT id, lab_id, title, description, task_type, sort_order, created_at
  FROM public.lab_tasks;
GRANT SELECT ON public.lab_tasks_safe TO anon, authenticated;

-- ------------------------------------------------------------
-- 3. COMPLAINTS: Allow anonymous citizen cyber intake
-- ------------------------------------------------------------
-- Allow anonymous users to submit complaints with user_id IS NULL
GRANT INSERT ON public.complaints TO anon, authenticated;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public insert anonymous complaints" ON public.complaints;
  CREATE POLICY "Public insert anonymous complaints" ON public.complaints
    FOR INSERT TO anon, authenticated
    WITH CHECK (user_id IS NULL OR user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 4. CONSULTATIONS: Secure Enterprise Briefing Intake
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  representative_name text NOT NULL,
  email text NOT NULL,
  organization_name text NOT NULL,
  area_of_interest text NOT NULL,
  operational_context text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.consultations TO anon, authenticated;
GRANT SELECT ON public.consultations TO authenticated;

DROP POLICY IF EXISTS "Public insert consultations" ON public.consultations;
CREATE POLICY "Public insert consultations" ON public.consultations
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users view own consultations or admin view all" ON public.consultations;
CREATE POLICY "Users view own consultations or admin view all" ON public.consultations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
