-- Make user_id nullable on bookings table so public consultation & workshop bookings work gracefully
ALTER TABLE public.bookings ALTER COLUMN user_id DROP NOT NULL;

-- Allow anonymous or authenticated booking inserts
DO $$ BEGIN
  CREATE POLICY "Public insert bookings" ON public.bookings
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
