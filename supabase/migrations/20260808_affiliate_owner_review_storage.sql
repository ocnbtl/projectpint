-- Private, server-mediated storage for Diyesu Decor affiliate owner review.
-- Browser roles receive no table grants or bucket policies from this migration.

create table if not exists public.app_storage_tabs (
  tab_name text primary key,
  rows jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint app_storage_tabs_rows_array check (jsonb_typeof(rows) = 'array')
);

create or replace function public.set_app_storage_tabs_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_app_storage_tabs_updated_at on public.app_storage_tabs;
create trigger trg_app_storage_tabs_updated_at
before update on public.app_storage_tabs
for each row
execute function public.set_app_storage_tabs_updated_at();

alter table public.app_storage_tabs enable row level security;
revoke all privileges on table public.app_storage_tabs from anon, authenticated;
revoke all on function public.set_app_storage_tabs_updated_at() from public, anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'affiliate-owner-review',
  'affiliate-owner-review',
  false,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
