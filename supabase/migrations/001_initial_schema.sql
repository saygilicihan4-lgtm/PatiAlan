-- PatiAlan V0.1 schema. Review in a development project before production.
create extension if not exists btree_gist;

create type public.user_kind as enum ('guest','host');
create type public.listing_status as enum ('draft','pending_review','published','suspended');
create type public.booking_status as enum ('held','confirmed','completed','cancelled','refunded','expired');
create type public.verification_status as enum ('not_started','pending','approved','rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  user_kind public.user_kind not null default 'guest',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dogs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  birth_year int check (birth_year between 1990 and 2100),
  size_class text check (size_class in ('small','medium','large','giant')),
  microchip_last4 text check (microchip_last4 is null or microchip_last4 ~ '^[0-9]{4}$'),
  vaccination_declared boolean not null default false,
  behavior_notes text,
  created_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text not null,
  city text not null,
  district text not null,
  latitude numeric(9,6),
  longitude numeric(9,6),
  area_m2 int not null check (area_m2 > 0),
  fence_height_cm int check (fence_height_cm >= 0),
  fully_fenced boolean not null default false,
  hourly_price_kurus int not null check (hourly_price_kurus >= 0),
  status public.listing_status not null default 'draft',
  verification_status public.verification_status not null default 'not_started',
  amenities text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.availability_windows (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_local time not null,
  end_local time not null,
  check (end_local > start_local)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete restrict,
  guest_id uuid not null references public.profiles(id) on delete restrict,
  dog_id uuid references public.dogs(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status public.booking_status not null default 'held',
  hold_expires_at timestamptz,
  subtotal_kurus int not null check (subtotal_kurus >= 0),
  platform_fee_kurus int not null check (platform_fee_kurus >= 0),
  host_gross_kurus int not null check (host_gross_kurus >= 0),
  payment_provider text,
  payment_reference text,
  created_at timestamptz not null default now(),
  check (end_at > start_at),
  check (subtotal_kurus = platform_fee_kurus + host_gross_kurus)
);

alter table public.bookings add constraint bookings_no_overlap
exclude using gist (
  listing_id with =,
  tstzrange(start_at, end_at, '[)') with &&
) where (status in ('held','confirmed'));

create table public.listing_verifications (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  check_type text not null check (check_type in ('identity','usage_right','fence_video','photos','emergency_info')),
  status public.verification_status not null default 'pending',
  reviewer_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.dogs enable row level security;
alter table public.listings enable row level security;
alter table public.availability_windows enable row level security;
alter table public.bookings enable row level security;
alter table public.listing_verifications enable row level security;
alter table public.reviews enable row level security;

create policy "profiles_read_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "dogs_owner_all_select" on public.dogs for select to authenticated using ((select auth.uid()) = owner_id);
create policy "dogs_owner_insert" on public.dogs for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "dogs_owner_update" on public.dogs for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "dogs_owner_delete" on public.dogs for delete to authenticated using ((select auth.uid()) = owner_id);

create policy "published_listings_public_read" on public.listings for select to anon, authenticated using (status = 'published' or (select auth.uid()) = host_id);
create policy "hosts_insert_listing" on public.listings for insert to authenticated with check ((select auth.uid()) = host_id);
create policy "hosts_update_listing" on public.listings for update to authenticated using ((select auth.uid()) = host_id) with check ((select auth.uid()) = host_id and status <> 'published');

create policy "availability_public_for_published" on public.availability_windows for select to anon, authenticated using (exists (select 1 from public.listings l where l.id = listing_id and (l.status = 'published' or l.host_id = (select auth.uid()))));
create policy "availability_host_insert" on public.availability_windows for insert to authenticated with check (exists (select 1 from public.listings l where l.id = listing_id and l.host_id = (select auth.uid())));
create policy "availability_host_update" on public.availability_windows for update to authenticated using (exists (select 1 from public.listings l where l.id = listing_id and l.host_id = (select auth.uid()))) with check (exists (select 1 from public.listings l where l.id = listing_id and l.host_id = (select auth.uid())));
create policy "availability_host_delete" on public.availability_windows for delete to authenticated using (exists (select 1 from public.listings l where l.id = listing_id and l.host_id = (select auth.uid())));

create policy "booking_guest_or_host_read" on public.bookings for select to authenticated using ((select auth.uid()) = guest_id or exists (select 1 from public.listings l where l.id = listing_id and l.host_id = (select auth.uid())));

create policy "verification_host_read" on public.listing_verifications for select to authenticated using (exists (select 1 from public.listings l where l.id = listing_id and l.host_id = (select auth.uid())));

create policy "reviews_public_read" on public.reviews for select to anon, authenticated using (true);
create policy "reviews_author_insert" on public.reviews for insert to authenticated with check ((select auth.uid()) = author_id and exists (select 1 from public.bookings b where b.id = booking_id and b.guest_id = (select auth.uid()) and b.status = 'completed'));

create index listings_city_district_status_idx on public.listings(city, district, status);
create index listings_host_idx on public.listings(host_id);
create index bookings_guest_idx on public.bookings(guest_id, start_at desc);
create index bookings_listing_idx on public.bookings(listing_id, start_at);
create index dogs_owner_idx on public.dogs(owner_id);
