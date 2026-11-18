create table internal.audit_log (
  id bigserial primary key,
  actor_id uuid,
  action text not null,
  target_id uuid,
  created_at timestamptz not null default now()
);

create index audit_log_target_idx on internal.audit_log (target_id);

create or replace function public.admin_refund(booking uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce((select role from profiles where id = auth.uid()), '') <> 'admin' then
    raise exception 'admin role required';
  end if;

  update bookings set status = 'cancelled' where id = booking;
end;
$$;

grant execute on function public.admin_refund(uuid) to authenticated;
