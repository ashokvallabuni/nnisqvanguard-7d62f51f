-- Forward-only security hardening for the normalized Academy.
-- Do not edit previously applied migrations.

CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS profile
    WHERE profile.id = has_role.user_id
      AND profile.role::text = has_role.role
  );
$function$;

REVOKE SELECT ON TABLE public.academy_quiz_questions FROM anon, authenticated;

GRANT SELECT (
  id,
  quiz_id,
  question,
  options,
  explanation,
  display_order
)
ON TABLE public.academy_quiz_questions
TO anon, authenticated;
