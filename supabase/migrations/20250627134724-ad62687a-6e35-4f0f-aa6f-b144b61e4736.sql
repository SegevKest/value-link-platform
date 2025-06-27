
-- Create asset types table
CREATE TABLE public.asset_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assets table
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  asset_type_id UUID REFERENCES public.asset_types(id) NOT NULL,
  value DECIMAL(15,2),
  status TEXT NOT NULL DEFAULT 'active',
  location TEXT,
  description TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bank accounts table
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  routing_number TEXT,
  account_type TEXT NOT NULL DEFAULT 'checking',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create asset bank account linking table
CREATE TABLE public.asset_bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(asset_id, bank_account_id)
);

-- Enable Row Level Security
ALTER TABLE public.asset_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these based on your auth requirements)
CREATE POLICY "Allow all operations on asset_types" ON public.asset_types FOR ALL USING (true);
CREATE POLICY "Allow all operations on assets" ON public.assets FOR ALL USING (true);
CREATE POLICY "Allow all operations on bank_accounts" ON public.bank_accounts FOR ALL USING (true);
CREATE POLICY "Allow all operations on asset_bank_accounts" ON public.asset_bank_accounts FOR ALL USING (true);

-- Insert some sample asset types
INSERT INTO public.asset_types (name, description) VALUES 
('Real Estate', 'Properties and real estate investments'),
('Vehicles', 'Cars, trucks, and other vehicles'),
('Equipment', 'Machinery and equipment assets'),
('Financial', 'Stocks, bonds, and financial instruments');

-- Insert some sample assets
INSERT INTO public.assets (name, asset_type_id, value, status, location, contact_name, contact_email) 
SELECT 
  'Downtown Office Complex',
  (SELECT id FROM public.asset_types WHERE name = 'Real Estate'),
  2500000.00,
  'active',
  'New York, NY',
  'John Smith',
  'john.smith@example.com'
UNION ALL
SELECT 
  'Fleet Vehicle #247',
  (SELECT id FROM public.asset_types WHERE name = 'Vehicles'),
  45000.00,
  'maintenance',
  'Los Angeles, CA',
  'Sarah Johnson',
  'sarah.johnson@example.com'
UNION ALL
SELECT 
  'Server Infrastructure',
  (SELECT id FROM public.asset_types WHERE name = 'Equipment'),
  125000.00,
  'active',
  'Data Center A',
  'Mike Wilson',
  'mike.wilson@example.com';
