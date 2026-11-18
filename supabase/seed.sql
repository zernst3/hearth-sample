-- Local development data
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'ada@hearth.example', crypt('hearth-dev-1', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Ada Seller"}', now(), now()),
  ('22222222-2222-4222-8222-222222222222', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'ben@hearth.example', crypt('hearth-dev-1', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Ben Buyer"}', now(), now()),
  ('33333333-3333-4333-8333-333333333333', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'root@hearth.example', crypt('hearth-dev-1', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Hearth Admin"}', now(), now());

update public.profiles set role = 'seller' where id = '11111111-1111-4111-8111-111111111111';
update public.profiles set role = 'admin' where id = '33333333-3333-4333-8333-333333333333';

insert into public.listings (id, seller_id, title, description_md, price_cents, category, metadata, status)
values
  ('aaaaaaaa-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111',
   'Piano lessons', 'One-hour lessons for **beginners**.', 4500, 'music',
   '{"price":4500,"currency":"usd","category":"music"}', 'active'),
  ('aaaaaaaa-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111',
   'Garden cleanup', 'Weeding, pruning and haul-away.', 6000, 'home',
   '{"price":6000,"currency":"usd","category":"home"}', 'active'),
  ('aaaaaaaa-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111',
   'Bike tune-up', 'Full drivetrain service.', 3500, 'repair',
   '{"price":3500,"currency":"usd","category":"repair"}', 'draft');

insert into public.listing_photos (listing_id, url, position)
values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'https://images.hearth.example/piano-1.jpg', 0),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'https://images.hearth.example/garden-1.jpg', 0);

insert into public.slots (id, listing_id, slot_start, slot_end, is_booked)
values
  ('bbbbbbbb-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001',
   now() + interval '2 days', now() + interval '2 days 1 hour', true),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'aaaaaaaa-0000-4000-8000-000000000001',
   now() + interval '3 days', now() + interval '3 days 1 hour', false),
  ('bbbbbbbb-0000-4000-8000-000000000003', 'aaaaaaaa-0000-4000-8000-000000000002',
   now() + interval '4 days', now() + interval '4 days 2 hours', false);

insert into public.bookings (id, buyer_id, listing_id, slot_id, hours, status)
values
  ('cccccccc-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222',
   'aaaaaaaa-0000-4000-8000-000000000001', 'bbbbbbbb-0000-4000-8000-000000000001', 1, 'confirmed');

insert into public.messages (booking_id, sender_id, body, seq)
values
  ('cccccccc-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Hi, is the piano in tune?', 1),
  ('cccccccc-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Yes, see you then.', 2);

insert into reporting.payouts (seller_id, bank_last4, iban_masked, amount_cents)
values ('11111111-1111-4111-8111-111111111111', '4417', 'DE89 **** **** **** **** 00', 39600);
