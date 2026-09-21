alter extension btree_gist set schema extensions;

create index if not exists bookings_dog_idx
  on public.bookings(dog_id);

create index if not exists listing_verifications_listing_idx
  on public.listing_verifications(listing_id);

create index if not exists reviews_author_idx
  on public.reviews(author_id);

create index if not exists reviews_listing_idx
  on public.reviews(listing_id);
