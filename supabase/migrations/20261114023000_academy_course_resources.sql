-- Forward-only Academy course-material resources.
-- This migration is intentionally not applied automatically.

CREATE TABLE IF NOT EXISTS public.academy_course_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  module_id uuid REFERENCES public.academy_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('pdf', 'markdown', 'code', 'link')),
  storage_path text NOT NULL,
  file_size_bytes bigint CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT academy_course_resources_storage_path_key UNIQUE (storage_path)
);

CREATE INDEX IF NOT EXISTS academy_course_resources_course_idx
  ON public.academy_course_resources(course_id, is_published);

CREATE INDEX IF NOT EXISTS academy_course_resources_module_idx
  ON public.academy_course_resources(module_id, is_published);

ALTER TABLE public.academy_course_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published Academy resources are readable" ON public.academy_course_resources;
CREATE POLICY "Published Academy resources are readable"
  ON public.academy_course_resources
  FOR SELECT
  TO authenticated
  USING (
    is_published
    AND EXISTS (
      SELECT 1
      FROM public.academy_courses AS course
      WHERE course.id = academy_course_resources.course_id
        AND course.is_published
        AND course.is_available
    )
  );

DROP POLICY IF EXISTS "Admins manage Academy resources" ON public.academy_course_resources;
CREATE POLICY "Admins manage Academy resources"
  ON public.academy_course_resources
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::text))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::text));

INSERT INTO storage.buckets (id, name, public)
VALUES ('academy-course-materials', 'academy-course-materials', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Published Academy files are readable" ON storage.objects;
CREATE POLICY "Published Academy files are readable"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'academy-course-materials'
    AND EXISTS (
      SELECT 1
      FROM public.academy_course_resources AS resource
      JOIN public.academy_courses AS course ON course.id = resource.course_id
      WHERE resource.storage_path = name
        AND resource.is_published
        AND course.is_published
        AND course.is_available
    )
  );

DROP POLICY IF EXISTS "Admins manage Academy files" ON storage.objects;
CREATE POLICY "Admins manage Academy files"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'academy-course-materials'
    AND public.has_role(auth.uid(), 'admin'::text)
  )
  WITH CHECK (
    bucket_id = 'academy-course-materials'
    AND public.has_role(auth.uid(), 'admin'::text)
  );
