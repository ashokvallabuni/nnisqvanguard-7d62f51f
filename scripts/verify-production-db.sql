-- NISQ Vanguard Database Verification Script
-- Target Project: cbyoozhtubavksiolgxz (https://cbyoozhtubavksiolgxz.supabase.co)

SELECT '=== NISQ VANGUARD PRODUCTION DATABASE STATUS ===' AS section;

-- 1. Core Curriculum Counts
SELECT 'profiles' AS table_name, count(*) AS total_count FROM public.profiles
UNION ALL
SELECT 'courses' AS table_name, count(*) AS total_count FROM public.courses
UNION ALL
SELECT 'modules' AS table_name, count(*) AS total_count FROM public.modules
UNION ALL
SELECT 'learning_paths' AS table_name, count(*) AS total_count FROM public.learning_paths
UNION ALL
SELECT 'quizzes' AS table_name, count(*) AS total_count FROM public.quizzes
UNION ALL
SELECT 'assignments' AS table_name, count(*) AS total_count FROM public.assignments
UNION ALL
SELECT 'datasets' AS table_name, count(*) AS total_count FROM public.datasets
UNION ALL
SELECT 'labs' AS table_name, count(*) AS total_count FROM public.labs
UNION ALL
SELECT 'lab_tasks' AS table_name, count(*) AS total_count FROM public.lab_tasks
UNION ALL
SELECT 'lab_flags' AS table_name, count(*) AS total_count FROM public.lab_flags
UNION ALL
SELECT 'badges' AS table_name, count(*) AS total_count FROM public.badges
UNION ALL
SELECT 'certificates' AS table_name, count(*) AS total_count FROM public.certificates
UNION ALL
SELECT 'user_learning_paths' AS table_name, count(*) AS total_count FROM public.user_learning_paths
UNION ALL
SELECT 'module_progress' AS table_name, count(*) AS total_count FROM public.module_progress
UNION ALL
SELECT 'user_course_progress' AS table_name, count(*) AS total_count FROM public.user_course_progress
UNION ALL
SELECT 'lab_progress' AS table_name, count(*) AS total_count FROM public.lab_progress
UNION ALL
SELECT 'lab_task_attempts' AS table_name, count(*) AS total_count FROM public.lab_task_attempts
UNION ALL
SELECT 'lab_flag_attempts' AS table_name, count(*) AS total_count FROM public.lab_flag_attempts
UNION ALL
SELECT 'user_badges' AS table_name, count(*) AS total_count FROM public.user_badges;

-- 2. Published Curriculum Verification
SELECT 
  lp.name AS learning_path,
  lp.slug,
  lp.status,
  count(c.id) AS course_count
FROM public.learning_paths lp
LEFT JOIN public.courses c ON c.slug = ANY(
  CASE lp.slug
    WHEN 'absolute-beginner-cyber-awareness' THEN ARRAY['digital-safety-hygiene','social-engineering-phishing-defense','financial-upi-fraud-prevention','mobile-smartphone-security','wifi-public-network-safety','opsec-basics','hardware-device-security','password-managers-mfa-setup','social-media-account-recovery','cyber-ethics-legal-frameworks']
    WHEN 'computer-networking-web-infrastructure' THEN ARRAY['networking-fundamentals-part-1','networking-fundamentals-part-2','transport-protocols-tcp-udp','domain-name-system-dns','subnetting-ip-addressing','web-protocols-http-https','network-ports-standard-services','dhcp-protocol','firewalls-network-traffic-control','network-address-translation-nat']
    ELSE ARRAY[c.slug]
  END
)
GROUP BY lp.id, lp.name, lp.slug, lp.status
ORDER BY lp.name;

-- 3. Verify Linux Security Fundamentals Lab & Validation Integrity
SELECT 
  l.slug AS lab_slug,
  l.title,
  l.difficulty,
  count(DISTINCT t.id) AS total_tasks,
  count(DISTINCT f.id) AS total_flags
FROM public.labs l
LEFT JOIN public.lab_tasks t ON t.lab_id = l.id
LEFT JOIN public.lab_flags f ON f.lab_id = l.id
WHERE l.slug = 'linux-security-fundamentals'
GROUP BY l.id, l.slug, l.title, l.difficulty;

-- 4. Verify RLS Configuration
SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'courses', 'modules', 'quizzes', 'assignments',
    'learning_paths', 'datasets', 'labs', 'lab_tasks', 'lab_flags',
    'lab_progress', 'lab_task_attempts', 'lab_flag_attempts',
    'user_learning_paths', 'user_course_progress', 'module_progress',
    'badges', 'user_badges', 'certificates'
  )
ORDER BY tablename;
