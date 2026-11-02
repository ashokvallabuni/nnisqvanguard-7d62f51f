-- ============================================================
-- Migration: Add Citations, Sources, and Threading to Chat History
-- ============================================================

ALTER TABLE public.chat_history 
  ADD COLUMN IF NOT EXISTS citations JSONB,
  ADD COLUMN IF NOT EXISTS sources JSONB,
  ADD COLUMN IF NOT EXISTS conversation_id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS is_web_verified BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_chat_history_conversation 
  ON public.chat_history(user_id, conversation_id, created_at ASC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chat_history' AND policyname = 'own chat delete'
  ) THEN
    CREATE POLICY "own chat delete" ON public.chat_history FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;
