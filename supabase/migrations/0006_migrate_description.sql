-- Rework the description column to hold markdown
alter table public.listings drop column description_md;
alter table public.listings add column description_md text;

-- Second pricing column for integer cents.
alter table public.listings add column price_cents_v2 int;
update public.listings set price_cents_v2 = round(price_cents);
