create policy "pilot_leads_deny_client_select" on public.pilot_leads
for select to anon, authenticated using (false);

create policy "pilot_leads_deny_client_insert" on public.pilot_leads
for insert to anon, authenticated with check (false);

create policy "pilot_events_deny_client_select" on public.pilot_events
for select to anon, authenticated using (false);

create policy "pilot_events_deny_client_insert" on public.pilot_events
for insert to anon, authenticated with check (false);
