-- ============================================================
-- Migration: Add status column to courses, set initial locked status,
--            create storage buckets (evidence, team, content),
--            and configure storage RLS policies.
-- ============================================================

-- 1. Ensure status column exists on courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'locked';

-- 2. Make all courses initially locked
UPDATE public.courses SET status = 'locked' WHERE status IS NULL OR status = '';

-- 3. Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', false)
ON CONFLICT (id) DO UPDATE SET public = false;

INSERT INTO storage.buckets (id, name, public)
VALUES ('team', 'team', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('content', 'content', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage RLS policies for evidence bucket
DO $$ BEGIN
  CREATE POLICY "Authenticated users upload evidence" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'evidence' AND (auth.uid() IS NOT NULL));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users read own evidence objects" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'evidence' AND (owner = auth.uid() OR public.has_role(auth.uid(), 'admin')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins manage evidence bucket objects" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'evidence' AND public.has_role(auth.uid(), 'admin'))
    WITH CHECK (bucket_id = 'evidence' AND public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Public read for team and content buckets
DO $$ BEGIN
  CREATE POLICY "Public read team bucket" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id IN ('team', 'content'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
