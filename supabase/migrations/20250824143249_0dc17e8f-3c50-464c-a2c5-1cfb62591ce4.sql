-- Ensure required extension for UUID generation
create extension if not exists pgcrypto;

-- 1) Contracts table: links Tenant and PropertyOwner for a specific Asset
create table if not exists public.contract (
  contractid uuid primary key default gen_random_uuid(),
  assetid uuid not null references public.asset(assetid) on delete restrict,
  tenantid uuid not null references public.tenant(tenantid) on delete restrict,
  propertyownerid uuid not null references public.propertyowner(propertyownerid) on delete restrict,
  start_date date,
  end_date date,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger if it doesn't exist
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_contract_updated_at'
  ) then
    create trigger trg_contract_updated_at
    before update on public.contract
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- 2) Add FK from asset.activecontractid -> contract.contractid (if not already present)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'asset_activecontractid_fkey'
  ) then
    alter table public.asset
      add constraint asset_activecontractid_fkey
      foreign key (activecontractid)
      references public.contract(contractid)
      on delete set null;
  end if;
end $$;

-- 3) Contacts table: related to Asset only (no direct links to PropertyOwner or AssetsManager)
create table if not exists public.contact (
  contactid uuid primary key default gen_random_uuid(),
  assetid uuid not null references public.asset(assetid) on delete cascade,
  name text not null,
  contact_type text, -- e.g., handyman, electrician, tenant, etc.
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger for contact.updated_at
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_contact_updated_at'
  ) then
    create trigger trg_contact_updated_at
    before update on public.contact
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- 4) Indexes for performance
create index if not exists idx_contract_assetid on public.contract(assetid);
create index if not exists idx_contract_tenantid on public.contract(tenantid);
create index if not exists idx_contract_propertyownerid on public.contract(propertyownerid);
create index if not exists idx_contact_assetid on public.contact(assetid);

-- 5) Enable Row Level Security
alter table public.contract enable row level security;
alter table public.contact enable row level security;

-- Drop existing policies if they exist to avoid conflicts
drop policy if exists "Public can read contracts" on public.contract;
drop policy if exists "Public can insert contracts" on public.contract;
drop policy if exists "Public can update contracts" on public.contract;
drop policy if exists "Public can delete contracts" on public.contract;
drop policy if exists "Public can read contacts" on public.contact;
drop policy if exists "Public can insert contacts" on public.contact;
drop policy if exists "Public can update contacts" on public.contact;
drop policy if exists "Public can delete contacts" on public.contact;

-- Contracts policies
create policy "Public can read contracts"
  on public.contract for select
  using (true);

create policy "Public can insert contracts"
  on public.contract for insert
  with check (true);

create policy "Public can update contracts"
  on public.contract for update
  using (true)
  with check (true);

create policy "Public can delete contracts"
  on public.contract for delete
  using (true);

-- Contacts policies
create policy "Public can read contacts"
  on public.contact for select
  using (true);

create policy "Public can insert contacts"
  on public.contact for insert
  with check (true);

create policy "Public can update contacts"
  on public.contact for update
  using (true)
  with check (true);

create policy "Public can delete contacts"
  on public.contact for delete
  using (true);