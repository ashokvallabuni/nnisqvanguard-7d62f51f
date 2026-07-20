
CREATE TABLE public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('chat','url','file','text','score')),
  input TEXT,
  result JSONB,
  risk_level TEXT CHECK (risk_level IN ('Low','Medium','High','Unknown')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.logs TO authenticated;
GRANT ALL ON public.logs TO service_role;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own logs read"   ON public.logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own logs insert" ON public.logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX logs_user_created_idx ON public.logs(user_id, created_at DESC);

CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  message TEXT NOT NULL,
  reply TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.chat_history TO authenticated;
GRANT ALL ON public.chat_history TO service_role;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chat read"   ON public.chat_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own chat insert" ON public.chat_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX chat_history_user_created_idx ON public.chat_history(user_id, created_at DESC);
