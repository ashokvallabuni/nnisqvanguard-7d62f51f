CREATE TABLE IF NOT EXISTS public.datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  source text NOT NULL,
  source_url text,
  license text NOT NULL,
  version text NOT NULL,
  dataset_type text NOT NULL,
  file_format text NOT NULL,
  record_count bigint NOT NULL DEFAULT 0 CHECK (record_count >= 0),
  schema_version text NOT NULL DEFAULT '1.0',
  status text NOT NULL DEFAULT 'AVAILABLE'
    CHECK (status IN ('AVAILABLE','IMPORTING','VALIDATING','CONNECTED','FAILED','ARCHIVED')),
  storage_path text,
  checksum text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dataset_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  version text NOT NULL,
  record_count bigint NOT NULL DEFAULT 0 CHECK (record_count >= 0),
  checksum text,
  storage_path text,
  status text NOT NULL DEFAULT 'AVAILABLE'
    CHECK (status IN ('AVAILABLE','IMPORTING','VALIDATING','CONNECTED','FAILED','ARCHIVED')),
  imported_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(dataset_id, version)
);

CREATE TABLE IF NOT EXISTS public.lab_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.labs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.lab_categories(id) ON DELETE SET NULL,
  dataset_id uuid REFERENCES public.datasets(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  difficulty text NOT NULL DEFAULT 'BEGINNER'
    CHECK (difficulty IN ('BEGINNER','INTERMEDIATE','ADVANCED')),
  lab_type text NOT NULL DEFAULT 'NETWORK_ANALYSIS',
  learning_objectives text[] NOT NULL DEFAULT '{}',
  prerequisites text[] NOT NULL DEFAULT '{}',
  skills_gained text[] NOT NULL DEFAULT '{}',
  estimated_time_minutes integer NOT NULL DEFAULT 30 CHECK (estimated_time_minutes > 0),
  tools text[] NOT NULL DEFAULT '{}',
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  completion_criteria text,
  status text NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','REVIEW','PUBLISHED','ARCHIVED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lab_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id uuid NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  task_type text NOT NULL CHECK (task_type IN ('QUESTION','FLAG','INVESTIGATION','MULTIPLE_CHOICE','SHORT_ANSWER','EVIDENCE','DEFENSIVE_ACTION')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lab_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.lab_tasks(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  explanation text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lab_hints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.lab_tasks(id) ON DELETE CASCADE,
  hint text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lab_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.lab_tasks(id) ON DELETE CASCADE,
  validation_digest text NOT NULL,
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lab_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id uuid NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
  instance_id text,
  status text NOT NULL DEFAULT 'CREATING'
    CHECK (status IN ('CREATING','READY','RUNNING','EXPIRED','COMPLETED','TERMINATED','FAILED')),
  started_at timestamptz,
  expires_at timestamptz,
  completed_at timestamptz,
  score integer CHECK (score IS NULL OR score >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lab_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id uuid NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
  tasks_completed integer NOT NULL DEFAULT 0 CHECK (tasks_completed >= 0),
  total_tasks integer NOT NULL DEFAULT 0 CHECK (total_tasks >= 0),
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lab_id)
);

CREATE TABLE IF NOT EXISTS public.learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','REVIEW','PUBLISHED','ARCHIVED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_path_labs (
  learning_path_id uuid NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  lab_id uuid NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  PRIMARY KEY (learning_path_id, lab_id)
);

CREATE INDEX IF NOT EXISTS datasets_status_idx ON public.datasets(status);
CREATE INDEX IF NOT EXISTS labs_catalog_idx ON public.labs(status, difficulty, category_id);
CREATE INDEX IF NOT EXISTS labs_dataset_idx ON public.labs(dataset_id);
CREATE INDEX IF NOT EXISTS lab_tasks_lab_idx ON public.lab_tasks(lab_id, sort_order);
CREATE INDEX IF NOT EXISTS lab_sessions_user_idx ON public.lab_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lab_progress_user_idx ON public.lab_progress(user_id, updated_at DESC);

ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_labs ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.datasets, public.dataset_versions, public.lab_categories,
  public.labs, public.lab_tasks, public.lab_questions, public.lab_hints,
  public.learning_paths, public.learning_path_labs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.lab_sessions, public.lab_progress TO authenticated;

CREATE POLICY "Published datasets are public" ON public.datasets FOR SELECT
  USING (status = 'CONNECTED' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Published dataset versions are public" ON public.dataset_versions FOR SELECT
  USING (status = 'CONNECTED' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Lab categories are public" ON public.lab_categories FOR SELECT USING (true);
CREATE POLICY "Published labs are public" ON public.labs FOR SELECT
  USING (status = 'PUBLISHED' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Published lab tasks are public" ON public.lab_tasks FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.labs l WHERE l.id = lab_id AND (l.status = 'PUBLISHED' OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "Published lab questions are public" ON public.lab_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.lab_tasks t JOIN public.labs l ON l.id = t.lab_id
    WHERE t.id = task_id AND (l.status = 'PUBLISHED' OR public.has_role(auth.uid(), 'admin'))
  ));
CREATE POLICY "Published lab hints are public" ON public.lab_hints FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.lab_tasks t JOIN public.labs l ON l.id = t.lab_id
    WHERE t.id = task_id AND (l.status = 'PUBLISHED' OR public.has_role(auth.uid(), 'admin'))
  ));
CREATE POLICY "Users cannot read flag validation data" ON public.lab_flags FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users read own lab sessions" ON public.lab_sessions FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own lab sessions" ON public.lab_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own lab sessions" ON public.lab_sessions FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users read own lab progress" ON public.lab_progress FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own lab progress" ON public.lab_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own lab progress" ON public.lab_progress FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Published learning paths are public" ON public.learning_paths FOR SELECT
  USING (status = 'PUBLISHED' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Published path labs are public" ON public.learning_path_labs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.learning_paths p
    WHERE p.id = learning_path_id AND (p.status = 'PUBLISHED' OR public.has_role(auth.uid(), 'admin'))
  ));

CREATE POLICY "Admins manage datasets" ON public.datasets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage dataset versions" ON public.dataset_versions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage labs" ON public.labs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage lab content" ON public.lab_tasks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage learning paths" ON public.learning_paths FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

