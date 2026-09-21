-- PatiAlan V0.1 hardening: profile bootstrap, protected moderation fields,
-- review integrity, media buckets/policies, and active-hold indexes.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.protect_listing_moderation_fields()
returns trigger
language plpgsql
security invoker
set search_path = public
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

drop trigger if exists listings_protect_moderation_fields on public.listings;
create trigger listings_protect_moderation_fields
before update on public.listings
for each row execute function private.protect_listing_moderation_fields();

drop policy if exists "hosts_insert_listing" on public.listings;
create policy "hosts_insert_listing" on public.listings
for insert to authenticated
with check (
  (select auth.uid()) = host_id
  and status = 'draft'
  and verification_status = 'not_started'
);

drop policy if exists "reviews_author_insert" on public.reviews;
create policy "reviews_author_insert" on public.reviews
for insert to authenticated
with check (
  (select auth.uid()) = author_id
  and exists (
    select 1
    from public.bookings b
    where b.id = booking_id
      and b.guest_id = (select auth.uid())
      and b.listing_id = listing_id
      and b.status = 'completed'
  )
);

create index if not exists bookings_active_hold_expiry_idx
on public.bookings(listing_id, hold_expires_at)
where status = 'held';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('listing-media', 'listing-media', false, 10485760, array['image/jpeg','image/png','image/webp']),
  ('verification-media', 'verification-media', false, 52428800, array['image/jpeg','image/png','image/webp','video/mp4','video/quicktime'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "listing_media_read" on storage.objects;
create policy "listing_media_read" on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'listing-media'
  and exists (
    select 1 from public.listings l
    where l.id::text = split_part(name, '/', 1)
      and (l.status = 'published' or l.host_id = (select auth.uid()))
  )
);

drop policy if exists "listing_media_host_insert" on storage.objects;
create policy "listing_media_host_insert" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'listing-media'
  and exists (
    select 1 from public.listings l
    where l.id::text = split_part(name, '/', 1)
      and l.host_id = (select auth.uid())
  )
);

drop policy if exists "listing_media_host_update" on storage.objects;
create policy "listing_media_host_update" on storage.objects
for update to authenticated
using (
  bucket_id = 'listing-media'
  and exists (
    select 1 from public.listings l
    where l.id::text = split_part(name, '/', 1)
      and l.host_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'listing-media'
  and exists (
    select 1 from public.listings l
    where l.id::text = split_part(name, '/', 1)
      and l.host_id = (select auth.uid())
  )
);

drop policy if exists "listing_media_host_delete" on storage.objects;
create policy "listing_media_host_delete" on storage.objects
for delete to authenticated
using (
  bucket_id = 'listing-media'
  and exists (
    select 1 from public.listings l
    where l.id::text = split_part(name, '/', 1)
      and l.host_id = (select auth.uid())
  )
);

drop policy if exists "verification_media_host_read" on storage.objects;
create policy "verification_media_host_read" on storage.objects
for select to authenticated
using (
  bucket_id = 'verification-media'
  and exists (
    select 1 from public.listings l
    where l.id::text = split_part(name, '/', 1)
      and l.host_id = (select auth.uid())
  )
);

drop policy if exists "verification_media_host_insert" on storage.objects;
create policy "verification_media_host_insert" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'verification-media'
  and exists (
    select 1 from public.listings l
    where l.id::text = split_part(name, '/', 1)
      and l.host_id = (select auth.uid())
  )
);

drop policy if exists "verification_media_host_update" on storage.objects;
create policy "verification_media_host_update" on storage.objects
for update to authenticated
using (
  bucket_id = 'verification-media'
  and exists (
    select 1 from public.listings l
    where l.id::text = split_part(name, '/', 1)
      and l.host_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'verification-media'
  and exists (
    select 1 from public.listings l
    where l.id::text = split_part(name, '/', 1)
      and l.host_id = (select auth.uid())
  )
);

drop policy if exists "verification_media_host_delete" on storage.objects;
create policy "verification_media_host_delete" on storage.objects
for delete to authenticated
using (
  bucket_id = 'verification-media'
  and exists (
    select 1 from public.listings l
    where l.id::text = split_part(name, '/', 1)
      and l.host_id = (select auth.uid())
  )
);
