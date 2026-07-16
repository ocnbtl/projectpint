create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.pins_evergreen (
  "Pin_ID" text primary key,
  "Pin_Publish_Date" text not null default '',
  "Pin_Publish_Time" text not null default '',
  "Content_Area" text not null default '',
  "Workflow_Status" text not null default '',
  "Destination" text not null default '',
  "Blog_ID" text not null default '',
  "Media_Prompt" text not null default '',
  "Media_URL" text not null default '',
  "Pin_Overlay" text not null default '',
  "Pin_Caption" text not null default '',
  "Pin_CTA" text not null default '',
  "Pin_URL" text not null default '',
  "UTM_URL" text not null default '',
  "Prepared_For_Export_At" text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.pins_evergreen add column if not exists "Prepared_For_Export_At" text not null default '';

create table if not exists public.blogs_evergreen (
  "Blog_ID" text primary key,
  "Blog_Publish_Date" text not null default '',
  "Blog_Publish_Time" text not null default '',
  "Content_Area" text not null default '',
  "Workflow_Status" text not null default '',
  "Blog_URL" text not null default '',
  "Blog_Title" text not null default '',
  "Blog_Keywords" text not null default '',
  "Blog_Content" text not null default '',
  "Writer_Brief" text not null default '',
  "CTA_Target" text not null default '',
  "Quality_Score" text not null default '',
  "Quality_Checks" text not null default '',
  "Related_Pins" text not null default '',
  "Published_To_Public_At" text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.blogs_evergreen add column if not exists "Writer_Brief" text not null default '';
alter table public.blogs_evergreen add column if not exists "CTA_Target" text not null default '';
alter table public.blogs_evergreen add column if not exists "Quality_Score" text not null default '';
alter table public.blogs_evergreen add column if not exists "Quality_Checks" text not null default '';

create table if not exists public.guides_evergreen (
  "Guide_ID" text primary key,
  "Guide_Publish_Date" text not null default '',
  "Guide_Publish_Time" text not null default '',
  "Content_Area" text not null default '',
  "Workflow_Status" text not null default '',
  "Blog_ID" text not null default '',
  "Guide_URL" text not null default '',
  "Guide_Title" text not null default '',
  "Guide_Keywords" text not null default '',
  "Guide_Content" text not null default '',
  "Writer_Brief" text not null default '',
  "CTA_Target" text not null default '',
  "Quality_Score" text not null default '',
  "Quality_Checks" text not null default '',
  "Related_Pins" text not null default '',
  "Published_To_Public_At" text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.guides_evergreen add column if not exists "Writer_Brief" text not null default '';
alter table public.guides_evergreen add column if not exists "CTA_Target" text not null default '';
alter table public.guides_evergreen add column if not exists "Quality_Score" text not null default '';
alter table public.guides_evergreen add column if not exists "Quality_Checks" text not null default '';

create table if not exists public.inspiration_evergreen (
  "Inspiration_ID" text primary key,
  "Inspiration_Publish_Date" text not null default '',
  "Inspiration_Publish_Time" text not null default '',
  "Content_Area" text not null default '',
  "Workflow_Status" text not null default '',
  "Inspiration_URL" text not null default '',
  "Inspiration_Title" text not null default '',
  "Inspiration_Style" text not null default '',
  "Inspiration_Tags" text not null default '',
  "Inspiration_Description" text not null default '',
  "Inspiration_Body" text not null default '',
  "Hero_Image_URL" text not null default '',
  "Hero_Alt_Text" text not null default '',
  "Hero_Caption" text not null default '',
  "Hero_Credit" text not null default '',
  "Hero_Rights_Status" text not null default 'unverified',
  "SEO_Title" text not null default '',
  "SEO_Description" text not null default '',
  "Canonical_URL" text not null default '',
  "Social_Image_URL" text not null default '',
  "Indexable" text not null default 'true',
  "Published_To_Public_At" text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.emails_evergreen (
  "Email_ID" text primary key,
  "Email_Publish_Date" text not null default '',
  "Email_Publish_Time" text not null default '',
  "Content_Area" text not null default '',
  "Blog_ID" text not null default '',
  "Email_Subject" text not null default '',
  "Email_Content" text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.customers_evergreen (
  "User_ID" text primary key,
  "User_Email" text not null default '',
  "User_Date_Email" text not null default '',
  "User_Time_Email" text not null default '',
  "Content_Area" text not null default '',
  "Purchases" text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products_evergreen (
  "Product_ID" text primary key,
  "Product_Date" text not null default '',
  "Product_Sales" text not null default '',
  "Product_Revenue" text not null default '',
  "Product_Link" text not null default '',
  "Blog_ID" text not null default '',
  "Guide_ID" text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.leads (
  "Lead_ID" text primary key,
  "Email" text not null default '',
  "Created_At" text not null default '',
  "Source_URL" text not null default '',
  "Pillar_Interest" text not null default '',
  "Plant_Light" text not null default '',
  "Plant_Humidity" text not null default '',
  "Plant_Space" text not null default '',
  "Klaviyo_Profile_ID" text not null default '',
  "Consent_Text" text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_pins_evergreen_updated_at on public.pins_evergreen;
create trigger trg_pins_evergreen_updated_at
before update on public.pins_evergreen
for each row
execute function public.set_row_updated_at();

drop trigger if exists trg_blogs_evergreen_updated_at on public.blogs_evergreen;
create trigger trg_blogs_evergreen_updated_at
before update on public.blogs_evergreen
for each row
execute function public.set_row_updated_at();

drop trigger if exists trg_guides_evergreen_updated_at on public.guides_evergreen;
create trigger trg_guides_evergreen_updated_at
before update on public.guides_evergreen
for each row
execute function public.set_row_updated_at();

drop trigger if exists trg_inspiration_evergreen_updated_at on public.inspiration_evergreen;
create trigger trg_inspiration_evergreen_updated_at
before update on public.inspiration_evergreen
for each row
execute function public.set_row_updated_at();

drop trigger if exists trg_emails_evergreen_updated_at on public.emails_evergreen;
create trigger trg_emails_evergreen_updated_at
before update on public.emails_evergreen
for each row
execute function public.set_row_updated_at();

drop trigger if exists trg_customers_evergreen_updated_at on public.customers_evergreen;
create trigger trg_customers_evergreen_updated_at
before update on public.customers_evergreen
for each row
execute function public.set_row_updated_at();

drop trigger if exists trg_products_evergreen_updated_at on public.products_evergreen;
create trigger trg_products_evergreen_updated_at
before update on public.products_evergreen
for each row
execute function public.set_row_updated_at();

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
before update on public.leads
for each row
execute function public.set_row_updated_at();

alter table public.pins_evergreen enable row level security;
alter table public.blogs_evergreen enable row level security;
alter table public.guides_evergreen enable row level security;
alter table public.inspiration_evergreen enable row level security;
alter table public.emails_evergreen enable row level security;
alter table public.customers_evergreen enable row level security;
alter table public.products_evergreen enable row level security;
alter table public.leads enable row level security;

-- The application reaches these tables only from authenticated server routes
-- using the service-role key. Remove browser-role grants as a second boundary
-- in addition to RLS; no public or Supabase Auth client reads these tables.
revoke all privileges on table
  public.pins_evergreen,
  public.blogs_evergreen,
  public.guides_evergreen,
  public.inspiration_evergreen,
  public.emails_evergreen,
  public.customers_evergreen,
  public.products_evergreen,
  public.leads
from anon, authenticated;

-- Retire browser access to the legacy storage table when upgrading an existing
-- project. The active runtime no longer reads or writes this table.
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
