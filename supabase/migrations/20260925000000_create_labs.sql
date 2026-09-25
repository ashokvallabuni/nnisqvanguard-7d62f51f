-- Create labs table
CREATE TABLE IF NOT EXISTS public.labs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT,
    lab_type TEXT,
    estimated_duration INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lab_datasets table
CREATE TABLE IF NOT EXISTS public.lab_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES public.labs(id) ON DELETE CASCADE,
    dataset_name TEXT NOT NULL,
    dataset_content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lab_attempts table
CREATE TABLE IF NOT EXISTS public.lab_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lab_id UUID REFERENCES public.labs(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    result_data JSONB,
    score INTEGER,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_attempts ENABLE ROW LEVEL SECURITY;

-- Labs and datasets are readable by authenticated users
CREATE POLICY "Labs are readable by authenticated users." ON public.labs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Lab datasets are readable by authenticated users." ON public.lab_datasets
    FOR SELECT TO authenticated USING (true);

-- Lab attempts are readable/writable by the owner
CREATE POLICY "Users can read own attempts." ON public.lab_attempts
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts." ON public.lab_attempts
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts." ON public.lab_attempts
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);
