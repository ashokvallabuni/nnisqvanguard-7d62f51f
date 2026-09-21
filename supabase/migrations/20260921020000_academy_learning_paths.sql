ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS difficulty text NOT NULL DEFAULT 'Easy'
    CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  ADD COLUMN IF NOT EXISTS duration_minutes integer NOT NULL DEFAULT 30
    CHECK (duration_minutes > 0),
  ADD COLUMN IF NOT EXISTS practice_labs text[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_option integer NOT NULL CHECK (correct_option >= 0),
  explanation text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  instructions text NOT NULL,
  task_type text NOT NULL DEFAULT 'walkthrough'
    CHECK (task_type IN ('walkthrough', 'read_and_answer', 'lab')),
  expected_answer text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE,
  assignment_id uuid REFERENCES public.assignments(id) ON DELETE CASCADE,
  progress_type text NOT NULL CHECK (progress_type IN ('module', 'quiz', 'assignment')),
  completed boolean NOT NULL DEFAULT false,
  score integer CHECK (score IS NULL OR score BETWEEN 0 AND 100),
  response text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id, quiz_id, assignment_id, progress_type)
);

GRANT SELECT ON public.quizzes, public.assignments TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_course_progress TO authenticated;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quizzes are viewable by everyone" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Assignments are viewable by everyone" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Users view their academy progress" ON public.user_course_progress
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert their academy progress" ON public.user_course_progress
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update their academy progress" ON public.user_course_progress
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS quizzes_module_idx ON public.quizzes(module_id, sort_order);
CREATE INDEX IF NOT EXISTS assignments_module_idx ON public.assignments(module_id, sort_order);
CREATE INDEX IF NOT EXISTS academy_progress_user_course_idx
  ON public.user_course_progress(user_id, course_id, module_id);

INSERT INTO public.modules (course_id, slug, title, notes_md, tags, difficulty, duration_minutes, practice_labs, sort_order)
SELECT c.id, m.slug, m.title, m.notes, m.tags, m.difficulty, m.duration, m.labs, m.ord
FROM public.courses c
JOIN (VALUES
  ('phishing','Phishing Attacks','Identify malicious messages before they become incidents.',ARRAY['Web Exploitation','Social Engineering'],'Easy',35,ARRAY['Phishing email triage'],1),
  ('password-security','Password Security','Build resilient identity and authentication habits.',ARRAY['Identity Security','Cryptography'],'Easy',30,ARRAY['Credential hygiene lab'],2),
  ('social-engineering','Social Engineering','Recognize manipulation patterns used against people.',ARRAY['Social Engineering','Incident Response'],'Medium',40,ARRAY['Pretext analysis lab'],3),
  ('safe-browsing','Safe Browsing','Evaluate links, downloads and browser trust signals.',ARRAY['Web Exploitation','Network Security'],'Easy',25,ARRAY['Browser safety lab'],4),
  ('mobile-security','Mobile Security','Reduce mobile attack surface and protect personal data.',ARRAY['Mobile Security','Privacy'],'Medium',35,ARRAY['Mobile permissions lab'],5)
) AS m(slug,title,notes,tags,difficulty,duration,labs,ord) ON c.slug='cyber-awareness'
ON CONFLICT (course_id, slug) DO UPDATE SET
  tags = EXCLUDED.tags, difficulty = EXCLUDED.difficulty,
  duration_minutes = EXCLUDED.duration_minutes, practice_labs = EXCLUDED.practice_labs;

INSERT INTO public.modules (course_id, slug, title, notes_md, tags, difficulty, duration_minutes, practice_labs, sort_order)
SELECT c.id, m.slug, m.title, m.notes, m.tags, m.difficulty, m.duration, m.labs, m.ord
FROM public.courses c
JOIN (VALUES
  ('intro','Intro to Cybersecurity','Understand the security landscape and defender mindset.',ARRAY['Security Fundamentals','Threat Intelligence'],'Easy',30,ARRAY['Threat mapping lab'],1),
  ('cia-triad','CIA Triad','Apply confidentiality, integrity and availability to real systems.',ARRAY['Security Fundamentals','Risk Management'],'Easy',25,ARRAY['CIA impact lab'],2),
  ('hacker-types','Types of Hackers','Compare attacker motivations and defensive priorities.',ARRAY['Threat Intelligence','Security Fundamentals'],'Easy',25,ARRAY['Actor profiling lab'],3),
  ('network-basics','Network Basics','Trace how packets, DNS and firewalls shape a network.',ARRAY['Network Security','Infrastructure'],'Medium',45,ARRAY['Packet analysis lab'],4),
  ('malware-basics','Malware Basics','Classify common malware and map containment actions.',ARRAY['Malware Analysis','Incident Response'],'Medium',40,ARRAY['Malware triage lab'],5)
) AS m(slug,title,notes,tags,difficulty,duration,labs,ord) ON c.slug='cybersecurity-foundations'
ON CONFLICT (course_id, slug) DO UPDATE SET
  tags = EXCLUDED.tags, difficulty = EXCLUDED.difficulty,
  duration_minutes = EXCLUDED.duration_minutes, practice_labs = EXCLUDED.practice_labs;

INSERT INTO public.assignments (module_id, title, instructions, task_type, expected_answer, sort_order)
SELECT m.id, 'Walkthrough: classify the signal', 'Read the module notes and list the first defensive action you would take.', 'walkthrough', NULL, 1
FROM public.modules m WHERE m.slug IN ('phishing','intro','cia-triad')
  AND NOT EXISTS (SELECT 1 FROM public.assignments a WHERE a.module_id = m.id);

INSERT INTO public.assignments (module_id, title, instructions, task_type, expected_answer, sort_order)
SELECT m.id, 'Read and answer: defender decision', 'Which security principle or signal from this room would you apply first? Answer with the keyword security.', 'read_and_answer', 'security', 2
FROM public.modules m WHERE m.slug IN ('phishing','intro','cia-triad')
  AND NOT EXISTS (SELECT 1 FROM public.assignments a WHERE a.module_id = m.id AND a.task_type = 'read_and_answer');

INSERT INTO public.quizzes (module_id, question, options, correct_option, explanation, sort_order)
SELECT m.id, 'Which action is the safest first response to a suspicious link?', '["Open it in a private window","Report it and verify through a trusted channel","Forward it to colleagues","Reply asking for identity"]'::jsonb, 1, 'Verify without interacting with the suspicious link.', 1
FROM public.modules m WHERE m.slug = 'phishing'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.module_id = m.id);

INSERT INTO public.quizzes (module_id, question, options, correct_option, explanation, sort_order)
SELECT m.id, 'What does the C in CIA represent?', '["Control","Confidentiality","Continuity","Compliance"]'::jsonb, 1, 'Confidentiality protects information from unauthorized disclosure.', 1
FROM public.modules m WHERE m.slug = 'cia-triad'
  AND NOT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.module_id = m.id);
