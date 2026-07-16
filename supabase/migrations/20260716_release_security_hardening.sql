-- Project Pint release hardening: server-only storage boundaries.
-- No rows are created, updated, or deleted by this migration.

alter function public.set_row_updated_at() set search_path = pg_catalog, public;

alter table public.pins_evergreen enable row level security;
alter table public.blogs_evergreen enable row level security;
alter table public.guides_evergreen enable row level security;
alter table public.emails_evergreen enable row level security;
alter table public.customers_evergreen enable row level security;
alter table public.products_evergreen enable row level security;
alter table public.leads enable row level security;

revoke all privileges on table
  public.pins_evergreen,
  public.blogs_evergreen,
  public.guides_evergreen,
  public.emails_evergreen,
  public.customers_evergreen,
  public.products_evergreen,
  public.leads
from anon, authenticated;

do $$
begin
  if to_regclass('public.app_storage_tabs') is not null then
    alter table public.app_storage_tabs enable row level security;
    revoke all privileges on table public.app_storage_tabs from anon, authenticated;
  end if;

  if to_regprocedure('public.set_app_storage_tabs_updated_at()') is not null then
    alter function public.set_app_storage_tabs_updated_at() set search_path = pg_catalog, public;
  end if;
end;
$$;
