-- Enable RLS on asset and add permissive policies needed for the UI to work without auth
ALTER TABLE public.asset ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='asset' AND policyname='Public can read assets'
  ) THEN
    CREATE POLICY "Public can read assets"
      ON public.asset
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='asset' AND policyname='Public can insert assets'
  ) THEN
    CREATE POLICY "Public can insert assets"
      ON public.asset
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;