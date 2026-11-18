create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id),
  slot_id uuid not null references public.slots (id),
  hours int not null default 1,
  price_cents int not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'confirmed', 'cancelled')),
  document_url text,
  created_at timestamptz not null default now()
);

create index bookings_buyer_id_idx on public.bookings (buyer_id);

alter table public.bookings enable row level security;

create policy bookings_select on public.bookings
  for select
  using (
    auth.uid() = buyer_id
    or auth.uid() = (select seller_id from public.listings where id = listing_id)
  );

create policy bookings_insert on public.bookings
  for insert
  with check (true);

create policy bookings_update on public.bookings
  for update
  using (
    auth.uid() = buyer_id
    or auth.uid() = (select seller_id from public.listings where id = listing_id)
  )
  with check (
    auth.uid() = buyer_id
    or auth.uid() = (select seller_id from public.listings where id = listing_id)
  );

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  stripe_session_id text,
  amount_cents float8 not null,
  card_last4 text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create unique index payments_stripe_session_id_key on public.payments (stripe_session_id);

alter table public.payments enable row level security;

create policy payments_select on public.payments
  for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.buyer_id = auth.uid()
    )
  );

create policy payments_insert on public.payments
  for insert
  with check (false);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete restrict,
  author_id uuid not null references public.profiles (id),
  rating int not null check (rating between 1 and 5),
  body_md text
);

alter table public.reviews enable row level security;

create policy reviews_select on public.reviews
  for select
  using (true);

create policy reviews_insert on public.reviews
  for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and b.buyer_id = auth.uid()
        and b.status = 'confirmed'
    )
  );

create table internal.webhook_events (
  id text primary key,
  received_at timestamptz not null default now()
);
