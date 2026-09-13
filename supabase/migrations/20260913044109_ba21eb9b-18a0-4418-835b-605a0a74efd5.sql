DROP TRIGGER IF EXISTS update_ai_analyses_updated_at ON public.ai_analyses;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon;

CREATE TRIGGER update_ai_analyses_updated_at
  BEFORE UPDATE ON public.ai_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();