create table public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  sender_id uuid not null references public.profiles (id),
  body text not null,
  seq int not null,
  created_at timestamptz not null default now(),
  unique (booking_id, seq)
);

alter table public.messages enable row level security;

create policy messages_select on public.messages
  for select
  using (auth.role() = 'authenticated');

create policy messages_insert on public.messages
  for insert
  with check (auth.uid() = sender_id);
