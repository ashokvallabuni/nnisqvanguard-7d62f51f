-- Ensure course status column exists
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'LOCKED' 
CHECK (status IN ('PUBLISHED', 'LOCKED', 'DRAFT'));

-- Ensure approved courses are PUBLISHED
UPDATE public.courses 
SET status = 'PUBLISHED' 
WHERE slug IN (
  'cybersecurity-foundations',
  'basics-of-networking',
  'basics-in-networking',
  'linux-command-quest',
  'cyber-security-master-curriculum',
  'cybersecurity-fundamentals'
);

-- RLS: Public learners only read PUBLISHED courses
DROP POLICY IF EXISTS "Learners read published courses" ON public.courses;
CREATE POLICY "Learners read published courses" ON public.courses
FOR SELECT 
USING (status = 'PUBLISHED' OR auth.jwt() ->> 'role' = 'admin' OR auth.email() = 'ashoknani0705@gmail.com' OR public.has_role(auth.uid(), 'admin'));

-- RLS: Admin has full CRUD rights
DROP POLICY IF EXISTS "Admin master courses" ON public.courses;
CREATE POLICY "Admin master courses" ON public.courses
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin' OR auth.email() = 'ashoknani0705@gmail.com' OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR auth.email() = 'ashoknani0705@gmail.com' OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin master modules" ON public.modules;
CREATE POLICY "Admin master modules" ON public.modules
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin' OR auth.email() = 'ashoknani0705@gmail.com' OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR auth.email() = 'ashoknani0705@gmail.com' OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin master lessons" ON public.lessons;
CREATE POLICY "Admin master lessons" ON public.lessons
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin' OR auth.email() = 'ashoknani0705@gmail.com' OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR auth.email() = 'ashoknani0705@gmail.com' OR public.has_role(auth.uid(), 'admin'));
