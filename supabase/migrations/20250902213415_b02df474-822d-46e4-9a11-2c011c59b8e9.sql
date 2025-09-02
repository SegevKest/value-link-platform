-- 1) Profiles table for authenticated users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Basic RLS for profiles
drop policy if exists "Users can select own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Users can select own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''), null)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) Add user_id ownership columns
alter table public.asset add column if not exists user_id uuid;
alter table public.propertyowner add column if not exists user_id uuid;
alter table public.tenant add column if not exists user_id uuid;
alter table public.contract add column if not exists user_id uuid;
alter table public.contact add column if not exists user_id uuid;
alter table public.contract_terms add column if not exists user_id uuid;

-- Helpful indexes
create index if not exists idx_asset_user_id on public.asset(user_id);
create index if not exists idx_propertyowner_user_id on public.propertyowner(user_id);
create index if not exists idx_tenant_user_id on public.tenant(user_id);
create index if not exists idx_contract_user_id on public.contract(user_id);
create index if not exists idx_contact_user_id on public.contact(user_id);
create index if not exists idx_contract_terms_user_id on public.contract_terms(user_id);

-- 3) Trigger to auto-fill user_id from auth.uid()
create or replace function public.set_owner_user_id()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    if new.user_id is null then
      new.user_id = auth.uid();
    end if;
  end if;
  return new;
end;
$$;

-- Attach triggers
drop trigger if exists set_asset_user_id on public.asset;
create trigger set_asset_user_id before insert on public.asset
for each row execute function public.set_owner_user_id();

drop trigger if exists set_propertyowner_user_id on public.propertyowner;
create trigger set_propertyowner_user_id before insert on public.propertyowner
for each row execute function public.set_owner_user_id();

drop trigger if exists set_tenant_user_id on public.tenant;
create trigger set_tenant_user_id before insert on public.tenant
for each row execute function public.set_owner_user_id();

drop trigger if exists set_contract_user_id on public.contract;
create trigger set_contract_user_id before insert on public.contract
for each row execute function public.set_owner_user_id();

drop trigger if exists set_contact_user_id on public.contact;
create trigger set_contact_user_id before insert on public.contact
for each row execute function public.set_owner_user_id();

drop trigger if exists set_contract_terms_user_id on public.contract_terms;
create trigger set_contract_terms_user_id before insert on public.contract_terms
for each row execute function public.set_owner_user_id();

-- 4) Update updated_at triggers for tables that have the column
-- contact
drop trigger if exists set_contact_updated_at on public.contact;
create trigger set_contact_updated_at before update on public.contact
for each row execute function public.set_updated_at();
-- contract
drop trigger if exists set_contract_updated_at on public.contract;
create trigger set_contract_updated_at before update on public.contract
for each row execute function public.set_updated_at();
-- contract_terms
drop trigger if exists set_contract_terms_updated_at on public.contract_terms;
create trigger set_contract_terms_updated_at before update on public.contract_terms
for each row execute function public.set_updated_at();

-- 5) Harden RLS across tables by dropping permissive policies and adding owner-based ones
-- asset
alter table public.asset enable row level security;
drop policy if exists "Public can insert assets" on public.asset;
drop policy if exists "Public can read assets" on public.asset;
create policy "Users can select their assets" on public.asset for select using (auth.uid() = user_id);
create policy "Users can insert their assets" on public.asset for insert with check (auth.uid() = user_id);
create policy "Users can update their assets" on public.asset for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their assets" on public.asset for delete using (auth.uid() = user_id);

-- propertyowner
alter table public.propertyowner enable row level security;
drop policy if exists "Public can delete property owners" on public.propertyowner;
drop policy if exists "Public can insert property owners" on public.propertyowner;
drop policy if exists "Public can read property owners" on public.propertyowner;
drop policy if exists "Public can update property owners" on public.propertyowner;
create policy "Users can select their property owners" on public.propertyowner for select using (auth.uid() = user_id);
create policy "Users can insert their property owners" on public.propertyowner for insert with check (auth.uid() = user_id);
create policy "Users can update their property owners" on public.propertyowner for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their property owners" on public.propertyowner for delete using (auth.uid() = user_id);

-- tenant
alter table public.tenant enable row level security;
drop policy if exists "Public can delete tenants" on public.tenant;
drop policy if exists "Public can insert tenants" on public.tenant;
drop policy if exists "Public can read tenants" on public.tenant;
drop policy if exists "Public can update tenants" on public.tenant;
create policy "Users can select their tenants" on public.tenant for select using (auth.uid() = user_id);
create policy "Users can insert their tenants" on public.tenant for insert with check (auth.uid() = user_id);
create policy "Users can update their tenants" on public.tenant for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their tenants" on public.tenant for delete using (auth.uid() = user_id);

-- contract
alter table public.contract enable row level security;
drop policy if exists "Public can delete contracts" on public.contract;
drop policy if exists "Public can insert contracts" on public.contract;
drop policy if exists "Public can read contracts" on public.contract;
drop policy if exists "Public can update contracts" on public.contract;
create policy "Users can select their contracts" on public.contract for select using (auth.uid() = user_id);
create policy "Users can insert their contracts" on public.contract for insert with check (auth.uid() = user_id);
create policy "Users can update their contracts" on public.contract for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their contracts" on public.contract for delete using (auth.uid() = user_id);

-- contact
alter table public.contact enable row level security;
drop policy if exists "Public can delete contacts" on public.contact;
drop policy if exists "Public can insert contacts" on public.contact;
drop policy if exists "Public can read contacts" on public.contact;
drop policy if exists "Public can update contacts" on public.contact;
create policy "Users can select their contacts" on public.contact for select using (auth.uid() = user_id);
create policy "Users can insert their contacts" on public.contact for insert with check (auth.uid() = user_id);
create policy "Users can update their contacts" on public.contact for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their contacts" on public.contact for delete using (auth.uid() = user_id);

-- contract_terms
alter table public.contract_terms enable row level security;
drop policy if exists "Public can delete contract terms" on public.contract_terms;
drop policy if exists "Public can insert contract terms" on public.contract_terms;
drop policy if exists "Public can read contract terms" on public.contract_terms;
drop policy if exists "Public can update contract terms" on public.contract_terms;
create policy "Users can select their contract terms" on public.contract_terms for select using (auth.uid() = user_id);
create policy "Users can insert their contract terms" on public.contract_terms for insert with check (auth.uid() = user_id);
create policy "Users can update their contract terms" on public.contract_terms for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their contract terms" on public.contract_terms for delete using (auth.uid() = user_id);

-- assettype: keep public read as is (no change)