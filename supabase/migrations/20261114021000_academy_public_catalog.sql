-- Keep the catalog discoverable before sign-in while lesson/progress writes remain authenticated.
CREATE POLICY "Published academy courses are publicly discoverable"
  ON public.academy_courses
  FOR SELECT TO anon
  USING (is_published AND is_available);

CREATE POLICY "Published academy modules are publicly discoverable"
  ON public.academy_modules
  FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1
    FROM public.academy_courses c
    WHERE c.id = course_id AND c.is_published AND c.is_available
  ));
