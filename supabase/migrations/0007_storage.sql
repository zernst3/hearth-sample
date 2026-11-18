insert into storage.buckets (id, name, public)
values
  ('listing-photos', 'listing-photos', true),
  ('booking-docs', 'booking-docs', false)
on conflict (id) do nothing;

create policy "listing photos are readable"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

create policy "listing photos upload"
  on storage.objects for insert
  with check (bucket_id = 'listing-photos' and owner = auth.uid());

create policy "booking docs read own"
  on storage.objects for select
  using (bucket_id = 'booking-docs' and owner = auth.uid());

create policy "booking docs upload"
  on storage.objects for insert
  with check (bucket_id = 'booking-docs' and owner = auth.uid());
