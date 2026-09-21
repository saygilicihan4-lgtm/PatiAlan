-- PatiAlan V0.1 Data API grants for Supabase 2026 opt-in exposure.

grant usage on schema public to anon, authenticated;

grant select on table public.listings to anon;
grant select on table public.availability_windows to anon;
grant select on table public.reviews to anon;

grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.dogs to authenticated;
grant select, insert, update on table public.listings to authenticated;
grant select, insert, update, delete on table public.availability_windows to authenticated;
grant select on table public.bookings to authenticated;
grant select on table public.listing_verifications to authenticated;
grant select, insert on table public.reviews to authenticated;

grant select, insert, update, delete on table
  public.profiles,
  public.dogs,
  public.listings,
  public.availability_windows,
  public.bookings,
  public.listing_verifications,
  public.reviews
to service_role;
