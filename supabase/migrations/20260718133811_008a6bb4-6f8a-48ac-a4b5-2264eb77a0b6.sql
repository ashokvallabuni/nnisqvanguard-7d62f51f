
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.promote_admin_on_verify() FROM PUBLIC, anon, authenticated;

-- Storage RLS: authenticated users can upload/read own files in evidence/team/content; admins full access
CREATE POLICY "auth upload evidence" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('evidence','team','content'));
CREATE POLICY "auth read evidence" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('evidence','team','content'));
CREATE POLICY "admins update storage" ON storage.objects FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete storage" ON storage.objects FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
