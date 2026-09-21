create table public.pilot_leads (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('guest','host')),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (position('@' in email) > 1),
  phone text,
  district text,
  area_m2 integer check (area_m2 is null or area_m2 > 0),
  source text not null default 'edge_pilot',
  created_at timestamptz not null default now()
);

alter table public.pilot_leads enable row level security;
revoke all on table public.pilot_leads from anon, authenticated;
grant select, insert, update, delete on table public.pilot_leads to service_role;

create index pilot_leads_created_idx on public.pilot_leads(created_at desc);
create index pilot_leads_kind_idx on public.pilot_leads(kind);
