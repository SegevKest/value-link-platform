-- Fix RLS policies for propertyowner table
ALTER TABLE public.propertyowner ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read property owners" 
ON public.propertyowner 
FOR SELECT 
USING (true);

CREATE POLICY "Public can insert property owners" 
ON public.propertyowner 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update property owners" 
ON public.propertyowner 
FOR UPDATE 
USING (true);

CREATE POLICY "Public can delete property owners" 
ON public.propertyowner 
FOR DELETE 
USING (true);

-- Fix RLS policies for tenant table
ALTER TABLE public.tenant ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read tenants" 
ON public.tenant 
FOR SELECT 
USING (true);

CREATE POLICY "Public can insert tenants" 
ON public.tenant 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update tenants" 
ON public.tenant 
FOR UPDATE 
USING (true);

CREATE POLICY "Public can delete tenants" 
ON public.tenant 
FOR DELETE 
USING (true);

-- Add foreign key constraint from contact to asset table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'contact_assetid_fkey'
    ) THEN
        ALTER TABLE public.contact 
        ADD CONSTRAINT contact_assetid_fkey 
        FOREIGN KEY (assetid) REFERENCES public.asset(assetid);
    END IF;
END $$;