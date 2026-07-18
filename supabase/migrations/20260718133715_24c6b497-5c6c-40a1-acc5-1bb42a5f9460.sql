
-- ROLES
CREATE TYPE public.app_role AS ENUM ('user','admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- has_role helper (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, anon;

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Auto-create profile + admin allowlist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    CASE WHEN lower(coalesce(NEW.email,'')) = 'ashokvallabhuni28@gmail.com'
         AND NEW.email_confirmed_at IS NOT NULL
      THEN 'admin'::public.app_role ELSE 'user'::public.app_role END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.promote_admin_on_verify()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND lower(coalesce(NEW.email,'')) = 'ashokvallabhuni28@gmail.com' THEN
    UPDATE public.profiles SET role = 'admin' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_confirmed
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.promote_admin_on_verify();

-- COLLEGES (public read)
CREATE TABLE public.colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  type TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.colleges (lower(name));
GRANT SELECT ON public.colleges TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.colleges TO authenticated;
GRANT ALL ON public.colleges TO service_role;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read colleges" ON public.colleges FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage colleges ins" ON public.colleges FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage colleges upd" ON public.colleges FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage colleges del" ON public.colleges FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- BOOKINGS
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  program_type TEXT NOT NULL,
  topic TEXT NOT NULL,
  preferred_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own bookings" ON public.bookings FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own bookings" ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins update bookings" ON public.bookings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete bookings" ON public.bookings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- COMPLAINTS
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  complaint_text TEXT NOT NULL,
  evidence_url TEXT,
  fraud_score INT,
  verdict TEXT,
  ai_result JSONB,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own complaints" ON public.complaints FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own complaints" ON public.complaints FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins update complaints" ON public.complaints FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete complaints" ON public.complaints FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- TEAM (public read)
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team_members TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read team" ON public.team_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert team" ON public.team_members FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update team" ON public.team_members FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete team" ON public.team_members FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- SITE CONTENT (CMS)
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  image_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert content" ON public.site_content FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update content" ON public.site_content FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete content" ON public.site_content FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Seed content + a few colleges
INSERT INTO public.site_content (section_name, title, description) VALUES
 ('home_hero','Cyber Awareness, Fraud Detection & College Outreach','A national platform protecting citizens from digital fraud and empowering colleges across India with cybersecurity awareness programs.'),
 ('home_about','Our Mission','We combine AI-powered fraud detection with grassroots cyber awareness outreach to Indian colleges — building a safer digital India.'),
 ('home_programs','Awareness Programs','Webinars, seminars, and workshops delivered to colleges across India by cybersecurity experts.');

INSERT INTO public.colleges (name, city, state, type, website) VALUES
 ('Indian Institute of Technology Bombay','Mumbai','Maharashtra','Government','https://www.iitb.ac.in'),
 ('Indian Institute of Technology Delhi','New Delhi','Delhi','Government','https://home.iitd.ac.in'),
 ('Indian Institute of Technology Madras','Chennai','Tamil Nadu','Government','https://www.iitm.ac.in'),
 ('Delhi University','New Delhi','Delhi','Government','https://www.du.ac.in'),
 ('Jawaharlal Nehru University','New Delhi','Delhi','Government','https://www.jnu.ac.in'),
 ('Anna University','Chennai','Tamil Nadu','Government','https://www.annauniv.edu'),
 ('BITS Pilani','Pilani','Rajasthan','Deemed','https://www.bits-pilani.ac.in'),
 ('VIT Vellore','Vellore','Tamil Nadu','Deemed','https://vit.ac.in'),
 ('SRM Institute of Science and Technology','Chennai','Tamil Nadu','Deemed','https://www.srmist.edu.in'),
 ('Manipal Institute of Technology','Manipal','Karnataka','Deemed','https://manipal.edu'),
 ('Amity University','Noida','Uttar Pradesh','Private','https://www.amity.edu'),
 ('Christ University','Bengaluru','Karnataka','Deemed','https://christuniversity.in'),
 ('Osmania University','Hyderabad','Telangana','Government','https://www.osmania.ac.in'),
 ('Andhra University','Visakhapatnam','Andhra Pradesh','Government','https://www.andhrauniversity.edu.in'),
 ('Jamia Millia Islamia','New Delhi','Delhi','Government','https://www.jmi.ac.in'),
 ('Aligarh Muslim University','Aligarh','Uttar Pradesh','Government','https://www.amu.ac.in'),
 ('Banaras Hindu University','Varanasi','Uttar Pradesh','Government','https://www.bhu.ac.in'),
 ('University of Calcutta','Kolkata','West Bengal','Government','https://www.caluniv.ac.in'),
 ('University of Mumbai','Mumbai','Maharashtra','Government','https://mu.ac.in'),
 ('Savitribai Phule Pune University','Pune','Maharashtra','Government','http://www.unipune.ac.in');
