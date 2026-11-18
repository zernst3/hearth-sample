create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description_md text,
  price_cents float8 not null,
  category text,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create index listings_seller_id_idx on public.listings (seller_id);

alter table public.listings enable row level security;

create policy listings_select on public.listings
  for select
  using (status = 'active' or auth.uid() = seller_id);

create policy listings_insert_own on public.listings
  for insert
  with check (auth.uid() = seller_id);

create policy listings_update_own on public.listings
  for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  url text not null,
  position int not null default 0
);

alter table public.listing_photos enable row level security;

create policy listing_photos_select on public.listing_photos
  for select
  using (true);

create policy listing_photos_insert_owner on public.listing_photos
  for insert
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

create table public.slots (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  slot_start timestamptz not null,
  slot_end timestamptz not null,
  is_booked boolean not null default false
);

create index slots_listing_id_idx on public.slots (listing_id, slot_start);

alter table public.slots enable row level security;

create policy slots_select on public.slots
  for select
  using (true);

create policy slots_insert_owner on public.slots
  for insert
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

create schema if not exists internal;

create table internal.job_runs (
  id bigserial primary key,
  job text not null,
  ran_at timestamptz not null default now()
);

create schema if not exists reporting;

create table reporting.payouts (
  seller_id uuid not null,
  bank_last4 text,
  iban_masked text,
  amount_cents int not null
);

grant usage on schema reporting to anon, authenticated, service_role;
grant select on all tables in schema reporting to anon, authenticated, service_role;
