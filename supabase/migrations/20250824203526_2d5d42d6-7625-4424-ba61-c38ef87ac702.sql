-- Enable RLS and allow public read access to asset types so the UI can load them

-- Enable Row Level Security on assettype (safe if already enabled)
ALTER TABLE public.assettype ENABLE ROW LEVEL SECURITY;

-- Create a SELECT policy allowing public (anon) reads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'assettype'
      AND policyname = 'Public can read asset types'
  ) THEN
    CREATE POLICY "Public can read asset types"
      ON public.assettype
      FOR SELECT
      USING (true);
  END IF;
END $$;