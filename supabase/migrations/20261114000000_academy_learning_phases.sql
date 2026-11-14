CREATE TABLE IF NOT EXISTS public.learning_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  sort_order integer NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.course_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id uuid NOT NULL REFERENCES public.learning_phases(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (phase_id, slug),
  UNIQUE (phase_id, id)
);

INSERT INTO public.learning_phases (slug, name, description, sort_order)
VALUES
  ('ai', 'Artificial Intelligence & Emerging Technologies',
   'Build foundations in AI, machine learning, data, and emerging technologies.', 1),
  ('cybersecurity', 'Cybersecurity & Defence Technologies',
   'Learn security foundations, defensive operations, investigations, and safe practical skills.', 2)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.course_categories (phase_id, slug, name, description, sort_order)
SELECT p.id, c.slug, c.name, c.description, c.sort_order
FROM public.learning_phases p
JOIN (VALUES
  ('ai', 'ai-fundamentals', 'AI Fundamentals', 'Core concepts and practical foundations for artificial intelligence.', 1),
  ('cybersecurity', 'cybersecurity-foundations', 'Cybersecurity Foundations', 'Existing cybersecurity courses and the defensive fundamentals pathway.', 1)
) AS c(phase_slug, slug, name, description, sort_order) ON p.slug = c.phase_slug
ON CONFLICT (phase_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS phase_id uuid,
  ADD COLUMN IF NOT EXISTS category_id uuid;

CREATE OR REPLACE FUNCTION public.set_course_catalog_defaults()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.phase_id IS NULL THEN
    SELECT id INTO NEW.phase_id FROM public.learning_phases WHERE slug = 'cybersecurity';
  END IF;
  IF NEW.category_id IS NULL THEN
    SELECT id INTO NEW.category_id
    FROM public.course_categories
    WHERE phase_id = NEW.phase_id
    ORDER BY sort_order
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS courses_catalog_defaults ON public.courses;
CREATE TRIGGER courses_catalog_defaults
  BEFORE INSERT OR UPDATE OF phase_id, category_id ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_course_catalog_defaults();

UPDATE public.courses
SET phase_id = p.id,
    category_id = c.id
FROM public.learning_phases p
JOIN public.course_categories c ON c.phase_id = p.id
WHERE p.slug = 'cybersecurity'
  AND c.slug = 'cybersecurity-foundations'
  AND (public.courses.phase_id IS NULL OR public.courses.category_id IS NULL);

ALTER TABLE public.courses
  ALTER COLUMN phase_id SET NOT NULL,
  ALTER COLUMN category_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_phase_id_fkey'
  ) THEN
    ALTER TABLE public.courses
      ADD CONSTRAINT courses_phase_id_fkey
      FOREIGN KEY (phase_id) REFERENCES public.learning_phases(id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_phase_category_fkey'
  ) THEN
    ALTER TABLE public.courses
      ADD CONSTRAINT courses_phase_category_fkey
      FOREIGN KEY (phase_id, category_id)
      REFERENCES public.course_categories(phase_id, id);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS courses_phase_category_order_idx
  ON public.courses (phase_id, category_id, sort_order);

CREATE TABLE IF NOT EXISTS public.source_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  official_url text NOT NULL,
  source_type text NOT NULL CHECK (
    source_type IN ('educational_resource', 'official_documentation', 'research_paper', 'standard')
  ),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.module_sources (
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES public.source_registry(id) ON DELETE RESTRICT,
  relevant_topic text NOT NULL,
  accessed_on date NOT NULL,
  PRIMARY KEY (module_id, source_id)
);

CREATE INDEX IF NOT EXISTS module_sources_source_idx ON public.module_sources (source_id);

ALTER TABLE public.learning_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_sources ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.learning_phases, public.course_categories,
  public.source_registry, public.module_sources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.learning_phases, public.course_categories,
  public.source_registry, public.module_sources TO authenticated;
GRANT ALL ON public.learning_phases, public.course_categories,
  public.source_registry, public.module_sources TO service_role;

CREATE POLICY "Learning phases are public" ON public.learning_phases
  FOR SELECT USING (true);
CREATE POLICY "Admins manage learning phases" ON public.learning_phases
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Course categories are public" ON public.course_categories
  FOR SELECT USING (true);
CREATE POLICY "Admins manage course categories" ON public.course_categories
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Sources are public" ON public.source_registry
  FOR SELECT USING (true);
CREATE POLICY "Admins manage sources" ON public.source_registry
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Lesson sources are public" ON public.module_sources
  FOR SELECT USING (true);
CREATE POLICY "Admins manage lesson sources" ON public.module_sources
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.source_registry (name, official_url, source_type)
VALUES
  ('Google Machine Learning Crash Course', 'https://developers.google.com/machine-learning/crash-course', 'educational_resource'),
  ('Stanford CS229: Machine Learning', 'https://cs229.stanford.edu/', 'educational_resource'),
  ('scikit-learn Supervised Learning', 'https://scikit-learn.org/stable/supervised_learning.html', 'official_documentation'),
  ('scikit-learn Model Evaluation', 'https://scikit-learn.org/stable/modules/model_evaluation.html', 'official_documentation')
ON CONFLICT (name) DO UPDATE SET
  official_url = EXCLUDED.official_url,
  source_type = EXCLUDED.source_type;

INSERT INTO public.courses
  (slug, title, description, level, tier, sort_order, phase_id, category_id)
SELECT
  'ai-fundamentals',
  'AI Fundamentals: From Data to a Baseline Model',
  'A beginner-friendly, hands-on introduction to AI problem framing, data, a first supervised model, and honest evaluation.',
  'beginner',
  'free',
  1,
  p.id,
  c.id
FROM public.learning_phases p
JOIN public.course_categories c ON c.phase_id = p.id
WHERE p.slug = 'ai' AND c.slug = 'ai-fundamentals'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  tier = EXCLUDED.tier,
  phase_id = EXCLUDED.phase_id,
  category_id = EXCLUDED.category_id;

INSERT INTO public.modules
  (course_id, slug, title, notes_md, practice_md, quiz, tags, difficulty, duration_minutes, sort_order)
SELECT c.id, m.slug, m.title, m.notes, m.practice, m.quiz, m.tags, m.difficulty, m.duration, m.sort_order
FROM public.courses c
JOIN (VALUES
  (
    'framing-ai-problems',
    'Frame a Problem as an AI Task',
    $notes$## Start with the problem, not the model

Artificial intelligence is a broad name for systems that perform tasks associated with capabilities such as perception, prediction, language, or decision support. Machine learning is one approach: a program uses examples to estimate a rule instead of relying only on hand-written rules.

Before choosing a technique, define the user-facing decision. A spam filter, for example, estimates whether a message should be reviewed; it does not establish that a sender is malicious. Specify the input, the output, who acts on it, the cost of mistakes, and a simple non-AI baseline.

In supervised learning, examples include inputs and target labels. Classification predicts a category; regression predicts a numeric quantity. In unsupervised learning, examples have no target labels and the goal may be to discover structure. These are task descriptions, not guarantees that a model is appropriate.

**Why this matters:** a measurable, bounded task makes it possible to choose relevant data and evaluate errors. A high score is not useful if it optimizes the wrong outcome.$notes$,
    $practice$Write a one-paragraph problem statement for a message-priority classifier. Name its input, output, intended user, a simple baseline, and one harmful false positive and false negative. Do not treat the output as proof of intent.$practice$,
    '[{"question":"A team has examples labeled as urgent or routine and wants to predict one of those two labels. Which task is this?","options":["Classification","Regression","Clustering"],"answer":0,"explanation":"The target is one of a finite set of categories, so this is classification."}]'::jsonb,
    ARRAY['problem framing','classification','regression','supervised learning'],
    'Easy', 30, 1
  ),
  (
    'data-and-splits',
    'Represent Data and Prevent Leakage',
    $notes$## Examples, features, and targets

A dataset is a collection of examples. A feature is an input field used by a model; a target (or label) is the value the model is trained to predict. For a house-price example, floor area may be a feature and sale price the target. Identifiers are not automatically useful features: a row number can accidentally encode collection order.

For a supervised task, split examples into training and test sets. Fit model parameters using the training set; reserve the test set for a final estimate on examples not used during fitting. If decisions such as feature selection, imputation, or scaling are learned from data, fit those steps only on training data.

**Data leakage** occurs when information unavailable at prediction time influences training or evaluation. Examples include using a post-outcome field as a feature or preprocessing the full dataset before the split. Leakage can make test scores look convincing while real-world performance is poor.

For time-dependent or grouped records, a random split may also leak information across time or between records from the same entity. Choose a split that matches how predictions will be made.$notes$,
    $practice$Given a table with `account_id`, `message_text`, `created_at`, and `review_outcome`, identify a plausible target, two candidate features, and one field that should not be used without further justification. Explain how you would split records if future messages are the deployment target.$practice$,
    '[{"question":"Why should a test set remain separate from preprocessing decisions that learn statistics from the data?","options":["To prevent information from the test examples leaking into the fitted workflow","To increase the number of training features","To guarantee every class has identical examples"],"answer":0,"explanation":"Using test-set information during fitting makes the evaluation less independent and can overstate generalization."}]'::jsonb,
    ARRAY['features','labels','train-test split','data leakage'],
    'Easy', 35, 2
  ),
  (
    'first-classifier',
    'Build a Reproducible Classification Baseline',
    $notes$## A baseline is a measurement, not a finish line

Start with a simple model and a reproducible split. A baseline can be a majority-class rule or a small classifier. Compare later work against it so that complexity is justified by measurable improvement.

This example uses scikit-learn's built-in breast-cancer dataset for local practice; it does not download data. The dataset contains features computed from digitized images of breast masses and a binary target. Treat it as a teaching dataset, not a clinical tool.

```python
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
model.fit(X_train, y_train)
print("Held-out accuracy:", model.score(X_test, y_test))
```

The pipeline fits scaling on the training data and then applies the same learned transformation to test data. `stratify=y` preserves class proportions in this split; the fixed seed makes this example reproducible. Accuracy alone is not enough to judge a high-stakes classifier.$notes$,
    $practice$Run the example in a local Python environment with scikit-learn installed. Record the held-out accuracy and compare it with a majority-class baseline on the same split. State why this dataset is unsuitable for medical decisions.$practice$,
    '[{"question":"What does placing StandardScaler inside the fitted pipeline help ensure?","options":["The scaler is fitted using training data and consistently applied to held-out data","The model always reaches 100% accuracy","The target labels are removed from the dataset"],"answer":0,"explanation":"A pipeline keeps learned preprocessing inside the training workflow and applies the fitted transform consistently."}]'::jsonb,
    ARRAY['scikit-learn','classification','baseline','reproducibility'],
    'Medium', 45, 3
  ),
  (
    'evaluate-classifiers',
    'Evaluate Errors, Not Just Accuracy',
    $notes$## Measure the errors that matter

For binary classification, a confusion matrix counts true positives, false positives, true negatives, and false negatives. Precision asks, among positive predictions, what fraction were correct. Recall asks, among actual positives, what fraction were found. Accuracy is the fraction of all predictions that were correct.

When classes are imbalanced, a classifier can achieve high accuracy by predicting the common class while missing most of the rare class. The preferred threshold depends on the costs of false positives and false negatives, the available follow-up process, and the intended use. No single metric settles those decisions.

Use the held-out set only for evaluation after model choices are made using training data or validation data. Report the metric, split design, and important limitations together. For a real deployment, monitor changes in data and outcomes and involve the people responsible for decisions.$notes$,
    $practice$Using the classifier from the previous lesson, report accuracy, precision, recall, and the confusion matrix on the held-out set. Identify which class is considered positive in your report and describe a plausible consequence of each error type.$practice$,
    '[{"question":"A model has high accuracy on an imbalanced dataset but misses many examples of the rare positive class. Which metric most directly describes the fraction of actual positives it finds?","options":["Recall","Precision","Accuracy"],"answer":0,"explanation":"Recall is true positives divided by all actual positives, so it reflects how many positives were found."}]'::jsonb,
    ARRAY['accuracy','precision','recall','confusion matrix','evaluation'],
    'Medium', 40, 4
  )
) AS m(slug, title, notes, practice, quiz, tags, difficulty, duration, sort_order)
  ON c.slug = 'ai-fundamentals'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  notes_md = EXCLUDED.notes_md,
  practice_md = EXCLUDED.practice_md,
  quiz = EXCLUDED.quiz,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  duration_minutes = EXCLUDED.duration_minutes,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.module_sources (module_id, source_id, relevant_topic, accessed_on)
SELECT m.id, s.id, links.relevant_topic, DATE '2026-11-14'
FROM (VALUES
  ('framing-ai-problems', 'Google Machine Learning Crash Course', 'Problem framing, supervised and unsupervised learning'),
  ('framing-ai-problems', 'Stanford CS229: Machine Learning', 'Machine-learning foundations and task formulation'),
  ('data-and-splits', 'Google Machine Learning Crash Course', 'Features, labels, data preparation, and dataset splitting'),
  ('first-classifier', 'scikit-learn Supervised Learning', 'Classification estimators and supervised-learning workflow'),
  ('evaluate-classifiers', 'scikit-learn Model Evaluation', 'Classification metrics and model evaluation')
) AS links(module_slug, source_name, relevant_topic)
JOIN public.modules m ON m.slug = links.module_slug
JOIN public.courses c ON c.id = m.course_id AND c.slug = 'ai-fundamentals'
JOIN public.source_registry s ON s.name = links.source_name
ON CONFLICT (module_id, source_id) DO UPDATE SET
  relevant_topic = EXCLUDED.relevant_topic,
  accessed_on = EXCLUDED.accessed_on;
