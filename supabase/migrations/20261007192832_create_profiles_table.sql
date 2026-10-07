-- Update handle_new_user to handle account_type and organization from new signup page
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, auth_user_id, email, phone, full_name, avatar_url, role, organization)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    CASE WHEN lower(coalesce(NEW.email,'')) = 'ashokvallabhuni28@gmail.com'
      THEN 'admin'::public.app_role ELSE 'user'::public.app_role END,
    NEW.raw_user_meta_data->>'organization'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    organization = COALESCE(EXCLUDED.organization, public.profiles.organization),
    updated_at = now();

  -- If account_type was set (e.g. STUDENT, ORGANIZATION), we can also insert it into user_roles if needed
  -- But for now we just handle the core profile
  
  RETURN NEW;
END; $$;
