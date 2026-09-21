-- PatiAlan V0.1 integrity hardening.
-- Safe to run after 001_initial_schema.sql and 002_security_storage_and_auth.sql.

alter table public.listings
  add constraint listings_latitude_range
  check (latitude is null or latitude between -90 and 90),
  add constraint listings_longitude_range
  check (longitude is null or longitude between -180 and 180);

alter table public.bookings
  add constraint bookings_held_requires_expiry
  check (status <> 'held' or hold_expires_at is not null);

create unique index if not exists availability_unique_window_idx
  on public.availability_windows(listing_id, weekday, start_local, end_local);

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', pg_catalog.split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create or replace function private.protect_listing_moderation_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user not in ('postgres', 'service_role') then
    if new.status is distinct from old.status
       or new.verification_status is distinct from old.verification_status then
      raise exception 'listing moderation fields are server-managed';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.protect_listing_moderation_fields() from public, anon, authenticated;
