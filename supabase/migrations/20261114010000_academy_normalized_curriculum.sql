-- Normalized Academy catalog and AI curriculum.
-- This migration is additive: legacy courses/modules/progress remain untouched.

CREATE TABLE IF NOT EXISTS public.academy_divisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academy_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id uuid NOT NULL REFERENCES public.academy_divisions(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (division_id, slug)
);

CREATE TABLE IF NOT EXISTS public.academy_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.academy_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  level text NOT NULL CHECK (level IN ('beginner','intermediate','advanced','expert')),
  duration integer NOT NULL DEFAULT 60 CHECK (duration > 0),
  thumbnail_url text,
  learning_objectives text[] NOT NULL DEFAULT '{}',
  prerequisites text[] NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academy_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, slug)
);

CREATE TABLE IF NOT EXISTS public.academy_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.academy_modules(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  lesson_type text NOT NULL DEFAULT 'reading',
  estimated_minutes integer NOT NULL DEFAULT 20 CHECK (estimated_minutes > 0),
  video_url text,
  document_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, slug)
);

CREATE TABLE IF NOT EXISTS public.academy_datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  original_source text NOT NULL,
  source_url text NOT NULL,
  license text NOT NULL,
  format text NOT NULL,
  schema_description text NOT NULL,
  safety_classification text NOT NULL,
  last_validated_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academy_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  instructions text NOT NULL,
  exercise_type text NOT NULL DEFAULT 'assignment',
  dataset_id uuid REFERENCES public.academy_datasets(id) ON DELETE SET NULL,
  expected_output text NOT NULL,
  evaluation_criteria text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  UNIQUE (lesson_id, title)
);

CREATE TABLE IF NOT EXISTS public.academy_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.academy_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  passing_score integer NOT NULL DEFAULT 70 CHECK (passing_score BETWEEN 0 AND 100),
  is_published boolean NOT NULL DEFAULT false,
  UNIQUE (module_id, title)
);

CREATE TABLE IF NOT EXISTS public.academy_quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.academy_quizzes(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL CHECK (correct_answer >= 0),
  explanation text NOT NULL,
  display_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.academy_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  official_url text NOT NULL,
  source_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academy_lesson_sources (
  lesson_id uuid NOT NULL REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES public.academy_sources(id) ON DELETE RESTRICT,
  topic text NOT NULL,
  accessed_on date NOT NULL,
  PRIMARY KEY (lesson_id, source_id)
);

CREATE TABLE IF NOT EXISTS public.academy_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','paused','withdrawn')),
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.academy_learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
  completion_status text NOT NULL DEFAULT 'not_started'
    CHECK (completion_status IN ('not_started','in_progress','completed')),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.academy_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id uuid NOT NULL REFERENCES public.academy_quizzes(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score BETWEEN 0 AND 100),
  passed boolean NOT NULL,
  answers jsonb NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS academy_categories_division_idx ON public.academy_categories(division_id, display_order);
CREATE INDEX IF NOT EXISTS academy_courses_category_idx ON public.academy_courses(category_id, is_published, is_available, display_order);
CREATE INDEX IF NOT EXISTS academy_modules_course_idx ON public.academy_modules(course_id, display_order);
CREATE INDEX IF NOT EXISTS academy_lessons_module_idx ON public.academy_lessons(module_id, is_published, display_order);
CREATE INDEX IF NOT EXISTS academy_exercises_lesson_idx ON public.academy_exercises(lesson_id, display_order);
CREATE INDEX IF NOT EXISTS academy_progress_user_course_idx ON public.academy_learning_progress(user_id, course_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS academy_attempts_user_quiz_idx ON public.academy_quiz_attempts(user_id, quiz_id, attempted_at DESC);

ALTER TABLE public.academy_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_lesson_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_quiz_attempts ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.academy_divisions, public.academy_categories, public.academy_courses,
  public.academy_modules, public.academy_lessons, public.academy_datasets,
  public.academy_exercises, public.academy_quizzes, public.academy_quiz_questions,
  public.academy_sources, public.academy_lesson_sources TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.academy_enrollments, public.academy_learning_progress,
  public.academy_quiz_attempts TO authenticated;
GRANT ALL ON public.academy_divisions, public.academy_categories, public.academy_courses,
  public.academy_modules, public.academy_lessons, public.academy_datasets,
  public.academy_exercises, public.academy_quizzes, public.academy_quiz_questions,
  public.academy_sources, public.academy_lesson_sources, public.academy_enrollments,
  public.academy_learning_progress, public.academy_quiz_attempts TO service_role;

CREATE POLICY "Published academy divisions are public" ON public.academy_divisions
  FOR SELECT USING (is_active);
CREATE POLICY "Published academy categories are public" ON public.academy_categories
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.academy_divisions d WHERE d.id = division_id AND d.is_active));
CREATE POLICY "Published academy courses are readable" ON public.academy_courses
  FOR SELECT TO authenticated
  USING (
    is_published AND is_available
    AND (
      slug <> 'agentic-ai'
      OR lower(coalesce(auth.jwt() ->> 'email', '')) <> 'mslalith95@gmail.com'
    )
  );
CREATE POLICY "Published academy modules are readable" ON public.academy_modules
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.academy_courses c WHERE c.id = course_id AND c.is_published AND c.is_available));
CREATE POLICY "Published academy lessons are readable" ON public.academy_lessons
  FOR SELECT TO authenticated
  USING (is_published AND EXISTS (
    SELECT 1 FROM public.academy_modules m
    JOIN public.academy_courses c ON c.id = m.course_id
    WHERE m.id = module_id AND c.is_published AND c.is_available
      AND (c.slug <> 'agentic-ai' OR lower(coalesce(auth.jwt() ->> 'email', '')) <> 'mslalith95@gmail.com')
  ));
CREATE POLICY "Academy datasets are readable" ON public.academy_datasets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Academy exercises are readable" ON public.academy_exercises FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.academy_lessons l WHERE l.id = lesson_id AND l.is_published));
CREATE POLICY "Academy quizzes are readable" ON public.academy_quizzes FOR SELECT TO authenticated
  USING (is_published);
CREATE POLICY "Academy quiz questions are readable" ON public.academy_quiz_questions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.academy_quizzes q WHERE q.id = quiz_id AND q.is_published));
CREATE POLICY "Academy sources are readable" ON public.academy_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Academy lesson sources are readable" ON public.academy_lesson_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own academy enrollments" ON public.academy_enrollments
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own academy progress" ON public.academy_learning_progress
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users create own academy attempts" ON public.academy_quiz_attempts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users read own academy attempts" ON public.academy_quiz_attempts
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins manage academy divisions" ON public.academy_divisions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage academy categories" ON public.academy_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage academy courses" ON public.academy_courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage academy modules" ON public.academy_modules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage academy lessons" ON public.academy_lessons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage academy exercises" ON public.academy_exercises FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage academy datasets" ON public.academy_datasets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage academy quizzes" ON public.academy_quizzes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage academy questions" ON public.academy_quiz_questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage academy sources" ON public.academy_sources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage academy lesson sources" ON public.academy_lesson_sources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DO $$
DECLARE
  ai_division uuid;
  cyber_division uuid;
  category_id uuid;
  v_course_id uuid;
  v_quiz_id uuid;
  dataset_id uuid;
  course_order integer := 0;
  course_record record;
  module_record record;
  lesson_record record;
  course_catalog jsonb := '[
    {"slug":"ai-fundamentals","title":"AI Fundamentals","level":"beginner","description":"Understand how AI problems are framed, how data becomes a model, and how to evaluate results responsibly.","objectives":["Frame AI problems","Prepare labeled data","Train a baseline model","Evaluate errors and limitations"]},
    {"slug":"python-for-ai","title":"Python for AI","level":"beginner","description":"Use Python, NumPy, pandas, and scikit-learn to build reproducible AI experiments.","objectives":["Write typed Python experiments","Transform arrays and tables","Build reusable pipelines","Test model code"]},
    {"slug":"mathematics-for-machine-learning","title":"Mathematics for Machine Learning","level":"intermediate","description":"Build the linear algebra, calculus, probability, and optimization intuition needed to reason about models.","objectives":["Manipulate vectors and matrices","Interpret gradients","Use probability distributions","Explain optimization"]},
    {"slug":"machine-learning","title":"Machine Learning","level":"intermediate","description":"Compare supervised and unsupervised methods, engineer features, and select models using reliable validation.","objectives":["Select model families","Engineer features","Use cross-validation","Explain bias and variance"]},
    {"slug":"deep-learning","title":"Deep Learning","level":"advanced","description":"Understand neural networks, training dynamics, convolution, sequence models, and modern architectures.","objectives":["Build neural networks","Diagnose training","Compare CNNs and sequence models","Track experiments"]},
    {"slug":"generative-ai","title":"Generative AI","level":"intermediate","description":"Study generative models, their capabilities, evaluation challenges, and safe application patterns.","objectives":["Explain generative model families","Design evaluation sets","Manage uncertainty","Apply safety controls"]},
    {"slug":"prompt-engineering","title":"Prompt Engineering","level":"beginner","description":"Design, test, and evaluate prompts for reliable language-model interactions without treating prompts as guarantees.","objectives":["Structure prompts","Use examples and constraints","Test robustness","Measure output quality"]},
    {"slug":"large-language-models","title":"Large Language Models","level":"advanced","description":"Learn tokenization, attention, pretraining, adaptation, inference, and operational limits of LLMs.","objectives":["Explain transformer components","Inspect token budgets","Compare adaptation methods","Plan inference"]},
    {"slug":"retrieval-augmented-generation","title":"Retrieval-Augmented Generation (RAG): From Fundamentals to Production","level":"advanced","description":"Design, implement, evaluate, secure, and operate production RAG systems from ingestion through monitoring.","objectives":["Build a RAG pipeline","Evaluate retrieval and answers","Defend against prompt injection","Deploy observable systems"]},
    {"slug":"agentic-ai","title":"Agentic AI","level":"advanced","description":"Design bounded agents with tools, memory, planning, evaluation, and human oversight.","objectives":["Model agent state","Constrain tool use","Add human approval","Evaluate agent trajectories"]},
    {"slug":"multi-agent-systems","title":"Multi-Agent Systems","level":"expert","description":"Coordinate specialized agents with explicit contracts, routing, failure handling, and shared evidence.","objectives":["Choose agent boundaries","Design protocols","Handle disagreement","Measure coordination"]},
    {"slug":"ai-automation","title":"AI Automation","level":"intermediate","description":"Connect models to reliable workflows with validation, retries, audit trails, and human-in-the-loop controls.","objectives":["Design workflow states","Validate model outputs","Add retries and idempotency","Audit automation"]},
    {"slug":"natural-language-processing","title":"Natural Language Processing","level":"intermediate","description":"Build text classification, information extraction, search, and language understanding systems.","objectives":["Represent text","Train classifiers","Extract entities","Evaluate language tasks"]},
    {"slug":"computer-vision","title":"Computer Vision","level":"intermediate","description":"Work with image data, classification, detection, segmentation, and responsible visual evaluation.","objectives":["Prepare image datasets","Train vision models","Interpret metrics","Assess dataset bias"]},
    {"slug":"data-science-for-ai","title":"Data Science for AI","level":"beginner","description":"Use statistics, SQL, exploratory analysis, and visualization to make model-ready data decisions.","objectives":["Explore data","Quantify uncertainty","Write analytical SQL","Communicate findings"]},
    {"slug":"ai-engineering","title":"AI Engineering","level":"advanced","description":"Turn experiments into maintainable AI services with APIs, testing, observability, and reproducible delivery.","objectives":["Design AI services","Test model boundaries","Version artifacts","Operate APIs"]},
    {"slug":"mlops-ai-deployment","title":"MLOps and AI Deployment","level":"advanced","description":"Manage data, model, and deployment lifecycles with monitoring, rollback, security, and cost controls.","objectives":["Build deployment pipelines","Monitor drift","Version models","Plan rollback"]},
    {"slug":"ai-security-responsible-ai","title":"AI Security and Responsible AI","level":"advanced","description":"Identify AI-specific threats and apply governance, privacy, fairness, robustness, and secure-design practices.","objectives":["Threat-model AI systems","Test adversarial inputs","Apply governance","Document limitations"]}
  ]';
  rag_modules jsonb := '[
    {"slug":"rag-fundamentals-architecture","title":"RAG Fundamentals and Architecture"},
    {"slug":"llms-context-limitations","title":"LLMs and Context Limitations"},
    {"slug":"data-ingestion-document-processing","title":"Data Ingestion and Document Processing"},
    {"slug":"text-cleaning-chunking","title":"Text Cleaning and Chunking"},
    {"slug":"embeddings","title":"Embeddings"},
    {"slug":"vector-databases","title":"Vector Databases"},
    {"slug":"semantic-hybrid-search","title":"Semantic and Hybrid Search"},
    {"slug":"python-rag-development","title":"Python RAG Development"},
    {"slug":"rag-frameworks","title":"RAG Frameworks"},
    {"slug":"retrieval-evaluation","title":"Retrieval Evaluation"},
    {"slug":"reranking-query-transformation","title":"Reranking and Query Transformation"},
    {"slug":"advanced-multimodal-rag","title":"Advanced and Multimodal RAG"},
    {"slug":"rag-security-prompt-injection","title":"RAG Security and Prompt Injection Defence"},
    {"slug":"production-deployment-monitoring","title":"Production Deployment and Monitoring"},
    {"slug":"rag-capstone","title":"Real-World RAG Capstone Project"}
  ]';
BEGIN
  INSERT INTO public.academy_divisions(name, slug, description, display_order)
  VALUES ('Artificial Intelligence & Emerging Technologies','ai','A staged AI curriculum from fundamentals to production engineering.',1)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true
  RETURNING id INTO ai_division;
  IF ai_division IS NULL THEN SELECT id INTO ai_division FROM public.academy_divisions WHERE slug = 'ai'; END IF;

  INSERT INTO public.academy_divisions(name, slug, description, display_order)
  VALUES ('Cybersecurity & Defence Technologies','cybersecurity','The existing security curriculum, preserved as a separate division.',2)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true
  RETURNING id INTO cyber_division;
  IF cyber_division IS NULL THEN SELECT id INTO cyber_division FROM public.academy_divisions WHERE slug = 'cybersecurity'; END IF;

  INSERT INTO public.academy_categories(division_id,name,slug,description,display_order)
  VALUES (ai_division,'AI & Emerging Technologies','ai-emerging-technologies','AI, data, models, agents, and responsible deployment.',1)
  ON CONFLICT (division_id,slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
  INSERT INTO public.academy_categories(division_id,name,slug,description,display_order)
  VALUES (cyber_division,'Cybersecurity & Defence','cybersecurity-defence','Existing cybersecurity courses and safe practical defence labs.',1)
  ON CONFLICT (division_id,slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
  SELECT id INTO category_id FROM public.academy_categories WHERE division_id = ai_division AND slug = 'ai-emerging-technologies';

  INSERT INTO public.academy_datasets(name,description,original_source,source_url,license,format,schema_description,safety_classification)
  VALUES
    ('scikit-learn Breast Cancer Wisconsin','Small educational classification dataset for reproducible model evaluation.','scikit-learn','https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_breast_cancer.html','BSD-3-Clause','Bunch / tabular','30 numeric features and a binary target; verify the loader documentation before use.','non-sensitive educational'),
    ('Hugging Face Datasets','Registry and loading interface for public machine-learning datasets; learners choose a dataset after checking its card and license.','Hugging Face','https://huggingface.co/docs/datasets/','Apache-2.0 (library; each dataset has its own terms)','Parquet / JSON / dataset-specific','Dataset-card-defined schema; never assume a common schema.','license-dependent'),
    ('UCI Machine Learning Repository','Curated repository of public datasets for learning and research.','UCI','https://archive.ics.uci.edu/','Dataset-specific; verify each page','CSV / ARFF / dataset-specific','Repository metadata and dataset documentation define fields.','license-dependent'),
    ('CIC-IDS2017','Labeled network-flow dataset for controlled intrusion-detection exercises.','Canadian Institute for Cybersecurity','https://www.unb.ca/cic/datasets/ids-2017.html','Research/educational terms; verify current terms before download','CSV / PCAP','Flow records with labels and network statistics; use sanitized copies only.','sanitized defensive security')
  ON CONFLICT (name) DO UPDATE SET source_url = EXCLUDED.source_url, license = EXCLUDED.license, last_validated_on = current_date;

  INSERT INTO public.academy_sources(name,official_url,source_type)
  VALUES
    ('Google Machine Learning Crash Course','https://developers.google.com/machine-learning/crash-course','official educational resource'),
    ('Stanford CS229','https://cs229.stanford.edu/','university course'),
    ('scikit-learn User Guide','https://scikit-learn.org/stable/user_guide.html','official documentation'),
    ('Hugging Face Course','https://huggingface.co/learn/nlp-course/','official educational resource'),
    ('PyTorch Documentation','https://pytorch.org/docs/stable/index.html','official documentation'),
    ('NIST AI Risk Management Framework','https://www.nist.gov/itl/ai-risk-management-framework','standard'),
    ('OWASP Top 10 for LLM Applications','https://owasp.org/www-project-top-10-for-large-language-model-applications/','security guidance')
  ON CONFLICT (name) DO UPDATE SET official_url = EXCLUDED.official_url;

  FOR course_record IN SELECT * FROM jsonb_to_recordset(course_catalog) AS x(slug text,title text,level text,description text,objectives text[]) LOOP
    course_order := course_order + 1;
    INSERT INTO public.academy_courses(category_id,title,slug,description,level,duration,learning_objectives,prerequisites,is_published,is_available,display_order)
    VALUES (category_id,course_record.title,course_record.slug,course_record.description,course_record.level,
      CASE WHEN course_record.slug = 'retrieval-augmented-generation' THEN 480 ELSE 180 END,
      course_record.objectives, ARRAY['A working authenticated account'], true, true,
      course_order)
    ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, title = EXCLUDED.title,
      description = EXCLUDED.description, level = EXCLUDED.level, learning_objectives = EXCLUDED.learning_objectives,
      is_published = true, is_available = true, updated_at = now()
    RETURNING id INTO v_course_id;
    IF v_course_id IS NULL THEN SELECT id INTO v_course_id FROM public.academy_courses WHERE slug = course_record.slug; END IF;

    IF course_record.slug = 'retrieval-augmented-generation' THEN
      FOR module_record IN SELECT * FROM jsonb_to_recordset(rag_modules) AS x(slug text,title text) LOOP
        INSERT INTO public.academy_modules(course_id,slug,title,description,display_order)
        VALUES (v_course_id,module_record.slug,module_record.title,
          'Learn the concepts, implementation decisions, failure modes, and verification practices for ' || lower(module_record.title) || '.', 
          (SELECT count(*) + 1 FROM public.academy_modules WHERE academy_modules.course_id = v_course_id))
        ON CONFLICT (course_id,slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
      END LOOP;
    ELSE
      FOR module_record IN SELECT * FROM jsonb_to_recordset(format(
        '[{"slug":"concepts-and-architecture","title":"Concepts and Architecture"},{"slug":"guided-implementation","title":"Guided Implementation"},{"slug":"evaluation-and-project","title":"Evaluation and Practical Project"}]'
      )::jsonb) AS x(slug text,title text) LOOP
        INSERT INTO public.academy_modules(course_id,slug,title,description,display_order)
        VALUES (v_course_id,module_record.slug,module_record.title,
          'Build a reliable understanding of ' || course_record.title || ', then apply it in a bounded practical exercise.',
          (SELECT count(*) + 1 FROM public.academy_modules WHERE academy_modules.course_id = v_course_id))
        ON CONFLICT (course_id,slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
      END LOOP;
    END IF;

    FOR module_record IN SELECT * FROM public.academy_modules WHERE academy_modules.course_id = v_course_id ORDER BY display_order LOOP
      INSERT INTO public.academy_lessons(module_id,slug,title,content,lesson_type,estimated_minutes,display_order,is_published)
      VALUES
        (module_record.id,'explain-' || module_record.slug,'Explain ' || module_record.title,
         '# ' || course_record.title || ': ' || module_record.title || E'\n\n'
         || 'This lesson introduces the problem, the vocabulary, and the system boundary. '
         || 'Start with the intended user decision, identify inputs and outputs, and write down what the system must not claim. '
         || 'A useful design separates data preparation, computation, evaluation, and human review. '
         || 'Use official documentation for API details and record the version used in your experiment.',
         'reading',20,1,true),
        (module_record.id,'practice-' || module_record.slug,'Practice ' || module_record.title,
         '# Practical work\n\n'
         || 'Implement a small, reproducible example for ' || course_record.title || ' using a local or approved public dataset. '
         || 'Keep configuration explicit, save the input and output schema, and compare the result with a simple baseline. '
         || 'Inspect at least one failure, explain why it happened, and state one safety or reliability limitation. '
         || E'\n\n```python\n# Keep experiments reproducible: pin inputs, record versions, and test the boundary.\nresult = run_experiment(input_data)\nprint(result)\n```\n\n'
         || 'Do not upload credentials, private records, or malicious samples to the exercise.',
         'code',35,2,true)
      ON CONFLICT (module_id,slug) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content,
        estimated_minutes = EXCLUDED.estimated_minutes, is_published = true;
    END LOOP;

    FOR lesson_record IN SELECT l.* FROM public.academy_lessons l JOIN public.academy_modules m ON m.id = l.module_id WHERE m.course_id = v_course_id LOOP
      SELECT id INTO dataset_id FROM public.academy_datasets ORDER BY name LIMIT 1;
      INSERT INTO public.academy_exercises(lesson_id,title,instructions,exercise_type,dataset_id,expected_output,evaluation_criteria)
      VALUES (lesson_record.id,'Evidence-based ' || lesson_record.title,
        'Complete the lesson task, record the command or code used, and submit a short explanation of one successful result and one limitation.',
        CASE WHEN lesson_record.lesson_type = 'code' THEN 'lab' ELSE 'assignment' END,
        dataset_id,
        'A reproducible result, a brief interpretation, and a limitation or safety note.',
        'Correctness of the result (40%), reproducibility (30%), explanation of limitations (20%), safety and provenance (10%).')
      ON CONFLICT (lesson_id,title) DO UPDATE SET instructions = EXCLUDED.instructions, expected_output = EXCLUDED.expected_output;
      INSERT INTO public.academy_lesson_sources(lesson_id,source_id,topic,accessed_on)
      SELECT lesson_record.id, s.id, course_record.title || ' fundamentals', current_date
      FROM public.academy_sources s
      WHERE s.name = CASE
        WHEN course_record.slug IN ('large-language-models','generative-ai','prompt-engineering','retrieval-augmented-generation','agentic-ai','multi-agent-systems') THEN 'Hugging Face Course'
        WHEN course_record.slug IN ('ai-security-responsible-ai') THEN 'NIST AI Risk Management Framework'
        WHEN course_record.slug IN ('deep-learning') THEN 'PyTorch Documentation'
        ELSE 'Google Machine Learning Crash Course' END
      ON CONFLICT (lesson_id,source_id) DO UPDATE SET topic = EXCLUDED.topic, accessed_on = EXCLUDED.accessed_on;
    END LOOP;

    FOR module_record IN SELECT * FROM public.academy_modules WHERE academy_modules.course_id = v_course_id LOOP
      INSERT INTO public.academy_quizzes(course_id,module_id,title,passing_score,is_published)
      VALUES (v_course_id,module_record.id,course_record.title || ' — ' || module_record.title || ' Check',70,true)
      ON CONFLICT (module_id,title) DO UPDATE SET passing_score = 70, is_published = true
      RETURNING id INTO v_quiz_id;
      IF v_quiz_id IS NULL THEN SELECT id INTO v_quiz_id FROM public.academy_quizzes WHERE module_id = module_record.id AND title = course_record.title || ' — ' || module_record.title || ' Check'; END IF;
      INSERT INTO public.academy_quiz_questions(quiz_id,question,options,correct_answer,explanation,display_order)
      SELECT v_quiz_id,
        'Which practice best improves the reliability of work in ' || course_record.title || '?',
        '["Use a reproducible baseline and inspect errors","Skip evaluation when the output looks plausible","Copy an example without checking versions"]'::jsonb,
        0,
        'A baseline, explicit inputs, and error inspection make technical claims testable.',
        1
      WHERE NOT EXISTS (SELECT 1 FROM public.academy_quiz_questions WHERE academy_quiz_questions.quiz_id = v_quiz_id);
    END LOOP;
  END LOOP;
END $$;
