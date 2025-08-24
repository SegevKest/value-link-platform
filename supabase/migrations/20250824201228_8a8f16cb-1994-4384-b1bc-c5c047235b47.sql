-- Create ContractTerms table
CREATE TABLE public.contract_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contract(contractid) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  follow_index INTEGER NOT NULL DEFAULT 1,
  date_to_charge DATE NOT NULL,
  base_rent DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contract_terms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can read contract terms" 
ON public.contract_terms 
FOR SELECT 
USING (true);

CREATE POLICY "Public can insert contract terms" 
ON public.contract_terms 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update contract terms" 
ON public.contract_terms 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete contract terms" 
ON public.contract_terms 
FOR DELETE 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_contract_terms_updated_at
BEFORE UPDATE ON public.contract_terms
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();