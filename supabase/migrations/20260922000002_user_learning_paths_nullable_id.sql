-- Migration: make learning_path_id nullable in user_learning_paths
-- and update primary key to support path_slug or uuid id.

DO $$
BEGIN
  -- Check if learning_path_id is NOT NULL and drop the constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_learning_paths'
      AND column_name = 'learning_path_id'
      AND is_nullable = 'NO'
  ) THEN
    -- Drop existing PK constraint
    ALTER TABLE public.user_learning_paths DROP CONSTRAINT IF EXISTS user_learning_paths_pkey;
    
    -- Alter column to allow NULL
    ALTER TABLE public.user_learning_paths ALTER COLUMN learning_path_id DROP NOT NULL;
    
    -- Add id column as surrogate PK if not present
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'user_learning_paths'
        AND column_name = 'id'
    ) THEN
      ALTER TABLE public.user_learning_paths ADD COLUMN id uuid PRIMARY KEY DEFAULT gen_random_uuid();
    END IF;
  END IF;
END $$;
