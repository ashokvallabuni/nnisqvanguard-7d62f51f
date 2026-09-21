CREATE TABLE IF NOT EXISTS public.lab_environment_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  image_ref text NOT NULL,
  cpu_limit numeric NOT NULL DEFAULT 1 CHECK (cpu_limit > 0 AND cpu_limit <= 8),
  memory_limit_mb integer NOT NULL DEFAULT 512 CHECK (memory_limit_mb > 0 AND memory_limit_mb <= 8192),
  disk_limit_mb integer NOT NULL DEFAULT 1024 CHECK (disk_limit_mb > 0 AND disk_limit_mb <= 20480),
  time_limit_minutes integer NOT NULL DEFAULT 60 CHECK (time_limit_minutes > 0 AND time_limit_minutes <= 1440),
  network_mode text NOT NULL DEFAULT 'none' CHECK (network_mode IN ('none','isolated')),
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lab_session_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.lab_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('lab_started','lab_reset','lab_stopped','task_submitted','flag_submitted','lab_completed','session_expired','session_failed')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lab_task_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.lab_sessions(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.lab_tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer text,
  is_correct boolean NOT NULL DEFAULT false,
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0),
  hints_used integer NOT NULL DEFAULT 0 CHECK (hints_used >= 0),
  attempt_number integer NOT NULL DEFAULT 1 CHECK (attempt_number > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lab_flag_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.lab_sessions(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.lab_tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_correct boolean NOT NULL DEFAULT false,
  attempt_number integer NOT NULL DEFAULT 1 CHECK (attempt_number > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lab_runner_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE REFERENCES public.lab_sessions(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.lab_environment_templates(id),
  provider_instance_id text,
  status text NOT NULL DEFAULT 'CREATING' CHECK (status IN ('CREATING','READY','RUNNING','STOPPING','STOPPED','FAILED')),
  cleanup_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lab_execution_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.lab_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation text NOT NULL CHECK (operation IN ('CREATE','START','RESET','STOP','SUBMIT')),
  status text NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED','RUNNING','SUCCEEDED','FAILED','CANCELLED')),
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.lab_skill_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_skills (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.lab_skill_definitions(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.badge_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  rule_type text NOT NULL CHECK (rule_type IN ('LAB_COUNT','CATEGORY_COUNT','SKILL_POINTS','CTF_SOLVES')),
  threshold integer NOT NULL CHECK (threshold > 0),
  category_id uuid REFERENCES public.lab_categories(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES public.lab_skill_definitions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.ctfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  competition_type text NOT NULL CHECK (competition_type IN ('INDIVIDUAL','COLLEGE','CORPORATE','NISQ_HOSTED')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','UPCOMING','ACTIVE','ENDED','ARCHIVED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS public.ctf_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ctf_id uuid NOT NULL REFERENCES public.ctfs(id) ON DELETE CASCADE,
  lab_id uuid REFERENCES public.labs(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ctf_participants (
  ctf_id uuid NOT NULL REFERENCES public.ctfs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (ctf_id, user_id)
);

CREATE INDEX IF NOT EXISTS lab_session_events_session_idx ON public.lab_session_events(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lab_task_attempts_session_idx ON public.lab_task_attempts(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lab_flag_attempts_session_idx ON public.lab_flag_attempts(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ctf_challenges_ctf_idx ON public.ctf_challenges(ctf_id, published);
CREATE INDEX IF NOT EXISTS ctf_participants_score_idx ON public.ctf_participants(ctf_id, score DESC);

ALTER TABLE public.lab_environment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_task_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_flag_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_runner_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_execution_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_skill_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ctfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ctf_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ctf_participants ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.lab_skill_definitions, public.badges, public.ctfs TO anon, authenticated;
GRANT SELECT ON public.ctf_challenges TO anon, authenticated;
GRANT SELECT ON public.user_skills, public.user_badges TO authenticated;
GRANT SELECT, INSERT ON public.ctf_participants TO authenticated;

CREATE POLICY "Admins manage environment templates" ON public.lab_environment_templates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users read own session events" ON public.lab_session_events FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users read own task attempts" ON public.lab_task_attempts FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users read own flag attempts" ON public.lab_flag_attempts FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read runner instances" ON public.lab_runner_instances FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read execution jobs" ON public.lab_execution_jobs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users read own skills" ON public.user_skills FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users read own badges" ON public.user_badges FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Published CTFs are public" ON public.ctfs FOR SELECT
  USING (status IN ('UPCOMING','ACTIVE','ENDED') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Published CTF challenges are public" ON public.ctf_challenges FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users read own CTF participation" ON public.ctf_participants FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users join active CTFs" ON public.ctf_participants FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.ctfs c WHERE c.id = ctf_id AND c.status IN ('UPCOMING','ACTIVE')
  ));

CREATE POLICY "Admins manage skills" ON public.lab_skill_definitions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage badges" ON public.badges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage badge rules" ON public.badge_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage CTFs" ON public.ctfs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage CTF challenges" ON public.ctf_challenges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
