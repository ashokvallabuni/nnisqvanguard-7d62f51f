-- Courses schema for NISQ Vanguard learning platform
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  level text NOT NULL DEFAULT 'beginner',
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free','paid')),
  cover_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admins manage courses" ON public.courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  video_url text,
  notes_md text,
  quiz jsonb,
  sort_order int NOT NULL DEFAULT 0,
  locked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(course_id, slug)
);
GRANT SELECT ON public.modules TO anon, authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules are viewable by everyone" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Admins manage modules" ON public.modules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.module_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  quiz_score int,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.module_progress TO authenticated;
GRANT ALL ON public.module_progress TO service_role;
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own progress" ON public.module_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.module_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.module_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all progress" ON public.module_progress FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Seed free courses
INSERT INTO public.courses (slug,title,description,level,tier,sort_order) VALUES
('cyber-awareness','Cyber Awareness','Recognize and defend against scams, phishing, and everyday cyber threats.','beginner','free',1),
('cybersecurity-foundations','Cybersecurity Foundations','Core concepts every defender needs: CIA triad, networks, hackers, malware.','beginner','free',2),
('cybersecurity-fundamentals','Cybersecurity Fundamentals','Hands-on offensive security: Kali, ethical hacking, SQLi, and real attack labs.','intermediate','paid',3)
ON CONFLICT (slug) DO NOTHING;

-- Seed modules for cyber-awareness
INSERT INTO public.modules (course_id,slug,title,notes_md,sort_order)
SELECT c.id, m.slug, m.title, m.notes, m.ord FROM public.courses c
JOIN (VALUES
  ('phishing','Phishing Attacks','Learn how attackers craft phishing emails, SMS, and calls to steal credentials.',1),
  ('password-security','Password Security','Strong passwords, password managers, and multi-factor authentication.',2),
  ('social-engineering','Social Engineering','Human-hacking tactics: pretexting, baiting, tailgating, and defense.',3),
  ('safe-browsing','Safe Browsing','HTTPS, suspicious downloads, browser hygiene, and safe search habits.',4),
  ('mobile-security','Mobile Security','App permissions, sideloading risks, and securing your Android/iOS device.',5)
) AS m(slug,title,notes,ord) ON c.slug='cyber-awareness'
ON CONFLICT (course_id,slug) DO NOTHING;

INSERT INTO public.modules (course_id,slug,title,notes_md,sort_order)
SELECT c.id, m.slug, m.title, m.notes, m.ord FROM public.courses c
JOIN (VALUES
  ('intro','Intro to Cybersecurity','What cybersecurity is, why it matters, and career paths.',1),
  ('cia-triad','CIA Triad','Confidentiality, Integrity, Availability — the foundation of security.',2),
  ('hacker-types','Types of Hackers','White, grey, black hats, script kiddies, and nation-state actors.',3),
  ('network-basics','Network Basics','IP, TCP/UDP, DNS, firewalls, and how packets travel.',4),
  ('malware-basics','Malware Basics','Viruses, worms, trojans, ransomware, and how they spread.',5)
) AS m(slug,title,notes,ord) ON c.slug='cybersecurity-foundations'
ON CONFLICT (course_id,slug) DO NOTHING;

INSERT INTO public.modules (course_id,slug,title,notes_md,sort_order,locked)
SELECT c.id, m.slug, m.title, m.notes, m.ord, true FROM public.courses c
JOIN (VALUES
  ('kali-setup','Kali Linux Setup','Install and configure Kali for ethical hacking labs.',1),
  ('ethical-hacking','Ethical Hacking Basics','Reconnaissance, scanning, exploitation, and reporting.',2),
  ('sql-injection','SQL Injection','Detect and exploit SQLi safely in lab environments.',3),
  ('vuln-scanning','Vulnerability Scanning','Nmap, Nikto, and OpenVAS in practice.',4),
  ('auth-systems','Authentication Systems','JWT, OAuth, sessions, and common auth attacks.',5),
  ('attack-sims','Real Attack Simulations','End-to-end guided attack scenarios in a safe lab.',6)
) AS m(slug,title,notes,ord) ON c.slug='cybersecurity-fundamentals'
ON CONFLICT (course_id,slug) DO NOTHING;