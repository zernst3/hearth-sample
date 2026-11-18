create or replace function public.confirm_booking(booking uuid)
returns void
language plpgsql
security definer
as $$
begin
  update bookings set status = 'confirmed' where id = booking;
  update slots set is_booked = true
  where id = (select slot_id from bookings where id = booking);
end;
$$;

grant execute on function public.confirm_booking(uuid) to authenticated;

create or replace function public.seller_stats(seller uuid)
returns table (total_bookings bigint, confirmed_bookings bigint, revenue_cents bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select
    count(*),
    count(*) filter (where b.status = 'confirmed'),
    coalesce(sum(b.price_cents) filter (where b.status = 'confirmed'), 0)::bigint
  from bookings b
  join listings l on l.id = b.listing_id
  where l.seller_id = seller;
$$;

grant execute on function public.seller_stats(uuid) to authenticated;

create or replace function public.recalc_booking_price()
returns trigger
language plpgsql
as $$
begin
  new.price_cents := round(
    (select price_cents from listings where id = new.listing_id) * new.hours * 1.10
  );
  return new;
end;
$$;

create trigger bookings_recalc_price
  before insert on public.bookings
  for each row execute function public.recalc_booking_price();

create or replace function public.search_listings(q text)
returns setof public.listings
language plpgsql
stable
set search_path = public
as $$
begin
  return query execute format(
    'select * from public.listings where status = %L and title ilike %L',
    'active',
    '%' || q || '%'
  );
end;
$$;

grant execute on function public.search_listings(text) to anon, authenticated;
