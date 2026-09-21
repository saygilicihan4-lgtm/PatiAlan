create or replace function public.create_booking_hold(
  p_listing_id uuid,
  p_dog_id uuid,
  p_start_at timestamptz,
  p_duration_minutes integer
)
returns table (
  id uuid,
  status public.booking_status,
  hold_expires_at timestamptz,
  subtotal_kurus integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_host_id uuid;
  v_hourly_price integer;
  v_end_at timestamptz;
  v_start_local timestamp;
  v_end_local timestamp;
  v_weekday smallint;
  v_subtotal integer;
  v_platform_fee integer;
  v_booking public.bookings%rowtype;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if p_duration_minutes not in (30, 60, 90) then raise exception 'invalid_duration'; end if;
  if p_start_at < now() + interval '5 minutes' then raise exception 'start_time_too_soon'; end if;

  if p_dog_id is not null and not exists (
    select 1 from public.dogs d where d.id = p_dog_id and d.owner_id = v_user_id
  ) then raise exception 'dog_not_owned'; end if;

  select l.host_id, l.hourly_price_kurus into v_host_id, v_hourly_price
  from public.listings l where l.id = p_listing_id and l.status = 'published';

  if not found then raise exception 'listing_unavailable'; end if;
  if v_host_id = v_user_id then raise exception 'cannot_book_own_listing'; end if;

  v_end_at := p_start_at + make_interval(mins => p_duration_minutes);
  v_start_local := p_start_at at time zone 'Europe/Istanbul';
  v_end_local := v_end_at at time zone 'Europe/Istanbul';
  if v_start_local::date <> v_end_local::date then raise exception 'booking_must_stay_same_day'; end if;
  v_weekday := extract(dow from v_start_local)::smallint;

  if not exists (
    select 1 from public.availability_windows aw
    where aw.listing_id = p_listing_id and aw.weekday = v_weekday
      and v_start_local::time >= aw.start_local and v_end_local::time <= aw.end_local
  ) then raise exception 'outside_availability'; end if;

  update public.bookings set status = 'expired'
  where listing_id = p_listing_id and status = 'held' and hold_expires_at < now();

  v_subtotal := round(v_hourly_price * (p_duration_minutes::numeric / 60.0))::integer;
  v_platform_fee := round(v_subtotal * 0.18)::integer;

  insert into public.bookings (
    listing_id, guest_id, dog_id, start_at, end_at, status, hold_expires_at,
    subtotal_kurus, platform_fee_kurus, host_gross_kurus
  ) values (
    p_listing_id, v_user_id, p_dog_id, p_start_at, v_end_at, 'held',
    now() + interval '10 minutes', v_subtotal, v_platform_fee, v_subtotal - v_platform_fee
  ) returning * into v_booking;

  return query select v_booking.id, v_booking.status, v_booking.hold_expires_at, v_booking.subtotal_kurus;

exception when exclusion_violation then
  raise exception 'slot_already_held';
end;
$$;

revoke all on function public.create_booking_hold(uuid, uuid, timestamptz, integer) from public, anon;
grant execute on function public.create_booking_hold(uuid, uuid, timestamptz, integer) to authenticated;
