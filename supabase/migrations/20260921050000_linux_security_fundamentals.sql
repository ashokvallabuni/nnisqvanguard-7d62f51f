DO $$
DECLARE
  v_category_id uuid;
  v_lab_id uuid;
  v_task_id uuid;
BEGIN
  INSERT INTO public.lab_categories (name, slug, description)
  VALUES (
    'Linux',
    'linux',
    'Authorized Linux security fundamentals in isolated training environments.'
  )
  ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_category_id;

  IF v_category_id IS NULL THEN
    SELECT id INTO v_category_id FROM public.lab_categories WHERE slug = 'linux';
  END IF;

  INSERT INTO public.lab_environment_templates (
    name, image_ref, cpu_limit, memory_limit_mb, disk_limit_mb,
    time_limit_minutes, network_mode, enabled
  )
  VALUES (
    'nisq-linux-security-fundamentals',
    'nisq-linux-security-fundamentals:local',
    1,
    512,
    1024,
    60,
    'none',
    false
  )
  ON CONFLICT (name) DO NOTHING;

  INSERT INTO public.labs (
    category_id, title, slug, description, difficulty, lab_type,
    learning_objectives, prerequisites, skills_gained, estimated_time_minutes,
    tools, points, completion_criteria, status
  )
  VALUES (
    v_category_id,
    'NISQ Linux Security Fundamentals',
    'nisq-linux-security-fundamentals',
    'Practice safe Linux filesystem inspection, permissions review, and security artifact analysis inside an isolated disposable container.',
    'BEGINNER',
    'GUIDED',
    ARRAY[
      'Navigate the training filesystem.',
      'Inspect supplied security evidence.',
      'Identify unusual file permissions.',
      'Analyze a harmless incident artifact.',
      'Locate and submit the training flag.'
    ],
    ARRAY[]::text[],
    ARRAY['Linux', 'Filesystem Analysis', 'Security Fundamentals'],
    30,
    ARRAY['shell', 'coreutils'],
    100,
    'Complete all six tasks and submit the training flag.',
    'PUBLISHED'
  )
  ON CONFLICT (slug) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_lab_id;

  IF v_lab_id IS NULL THEN
    SELECT id INTO v_lab_id FROM public.labs WHERE slug = 'nisq-linux-security-fundamentals';
  END IF;

  INSERT INTO public.lab_tasks (lab_id, title, description, task_type, sort_order)
  VALUES
    (v_lab_id, 'Navigate to the training directory', 'Use the terminal to reach /opt/nisq-lab.', 'INVESTIGATION', 1),
    (v_lab_id, 'Inspect the evidence files', 'List and read the supplied files in /opt/nisq-lab/evidence.', 'EVIDENCE', 2),
    (v_lab_id, 'Identify unusual permissions', 'Use a filesystem inspection command to identify the artifact with unusual permissions.', 'QUESTION', 3),
    (v_lab_id, 'Analyze the security artifact', 'Use the evidence to identify the repeated suspicious source address.', 'QUESTION', 4),
    (v_lab_id, 'Find the training flag', 'Locate the training flag file in the disposable lab filesystem.', 'FLAG', 5),
    (v_lab_id, 'Submit the training flag', 'Submit the flag through the authenticated lab interface.', 'FLAG', 6)
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_task_id
  FROM public.lab_tasks
  WHERE public.lab_tasks.lab_id = v_lab_id AND task_type = 'FLAG'
  ORDER BY sort_order DESC
  LIMIT 1;

  IF v_task_id IS NOT NULL THEN
    INSERT INTO public.lab_flags (task_id, validation_digest, points)
    VALUES (v_task_id, '8487c30b5a5fa991728a24c160fc0fba0ec1e14e673ba177bc8b5db4bf4ba68c', 20)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
