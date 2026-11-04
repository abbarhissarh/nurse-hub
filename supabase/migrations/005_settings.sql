-- Editable site content (about text, contact details, hero text). Run in Supabase SQL Editor.
create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings for select using (true);
-- Writes happen only through the admin dashboard (server side).
