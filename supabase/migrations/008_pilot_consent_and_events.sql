alter table public.pilot_leads
  add column if not exists consent_at timestamptz,
  add column if not exists privacy_version text;

create table if not exists public.pilot_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (event_name in ('page_view','cta_click','form_submit_success','form_submit_error')),
  kind text check (kind is null or kind in ('guest','host')),
  source text not null default 'github_pages',
  created_at timestamptz not null default now()
);

alter table public.pilot_events enable row level security;
revoke all on table public.pilot_events from anon, authenticated;
grant select, insert, update, delete on table public.pilot_events to service_role;

create index if not exists pilot_events_created_idx on public.pilot_events(created_at desc);
create index if not exists pilot_events_name_idx on public.pilot_events(event_name);
