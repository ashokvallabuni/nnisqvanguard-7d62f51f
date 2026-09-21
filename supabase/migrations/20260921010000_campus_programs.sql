CREATE TABLE IF NOT EXISTS public.campus_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_name text NOT NULL,
  country text NOT NULL DEFAULT 'India',
  state text NOT NULL,
  city text NOT NULL,
  program_type text NOT NULL CHECK (program_type IN ('Webinar', 'Seminar', 'Workshop', 'Cyber Range')),
  security_level text NOT NULL CHECK (security_level IN ('Foundation', 'Professional', 'Advanced')),
  dynamic_tier text NOT NULL CHECK (dynamic_tier IN ('Tier 1', 'Tier 2', 'Tier 3', 'Global')),
  seats integer NOT NULL DEFAULT 50 CHECK (seats > 0),
  enrolled_students integer NOT NULL DEFAULT 0 CHECK (enrolled_students >= 0),
  application_deadline date NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.campus_consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id uuid NOT NULL REFERENCES public.campus_programs(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  organization_role text,
  requested_program_type text NOT NULL,
  student_count integer CHECK (student_count IS NULL OR student_count > 0),
  message text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'enrolled', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campus_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_consultations ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.campus_programs TO anon, authenticated;
GRANT SELECT, INSERT ON public.campus_consultations TO authenticated;

CREATE POLICY "Anyone can view active campus programs"
  ON public.campus_programs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can create their own campus consultations"
  ON public.campus_consultations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own campus consultations"
  ON public.campus_consultations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS campus_programs_filters_idx
  ON public.campus_programs (is_active, state, city, program_type, security_level);
CREATE INDEX IF NOT EXISTS campus_consultations_user_idx
  ON public.campus_consultations (user_id, created_at DESC);

DROP TRIGGER IF EXISTS campus_programs_updated_at ON public.campus_programs;
CREATE TRIGGER campus_programs_updated_at
  BEFORE UPDATE ON public.campus_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS campus_consultations_updated_at ON public.campus_consultations;
CREATE TRIGGER campus_consultations_updated_at
  BEFORE UPDATE ON public.campus_consultations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.campus_programs
  (college_name, country, state, city, program_type, security_level, dynamic_tier, seats, enrolled_students, application_deadline, description)
VALUES
  ('Indian Institute of Technology Hyderabad', 'India', 'Telangana', 'Hyderabad', 'Workshop', 'Advanced', 'Tier 1', 120, 68, '2026-11-30', 'Hands-on application security and incident response workshop.'),
  ('Amity University', 'India', 'Uttar Pradesh', 'Noida', 'Seminar', 'Professional', 'Tier 1', 250, 142, '2026-12-15', 'Campus-wide cyber awareness and safe digital practices.'),
  ('Vellore Institute of Technology', 'India', 'Tamil Nadu', 'Vellore', 'Cyber Range', 'Advanced', 'Tier 1', 100, 74, '2027-01-20', 'Guided cyber range exercises for student security clubs.'),
  ('University of Delhi', 'India', 'Delhi', 'New Delhi', 'Webinar', 'Foundation', 'Tier 1', 500, 318, '2026-10-31', 'Phishing, identity protection and online safety for students.'),
  ('Manipal Academy of Higher Education', 'India', 'Karnataka', 'Manipal', 'Workshop', 'Professional', 'Tier 1', 150, 91, '2026-12-05', 'Practical threat modelling and secure development fundamentals.'),
  ('University of Cape Town', 'South Africa', 'Western Cape', 'Cape Town', 'Seminar', 'Professional', 'Global', 180, 103, '2027-02-12', 'Cross-campus cyber resilience and digital trust program.'),
  ('National University of Singapore', 'Singapore', 'Singapore', 'Singapore', 'Cyber Range', 'Advanced', 'Global', 90, 56, '2027-01-10', 'Applied defensive security lab and response simulation.')
ON CONFLICT DO NOTHING;
