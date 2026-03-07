create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
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
  "Related_Pins" text not null default '',
  "Published_To_Public_At" text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

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
  "Related_Pins" text not null default '',
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
alter table public.emails_evergreen enable row level security;
alter table public.customers_evergreen enable row level security;
alter table public.products_evergreen enable row level security;
alter table public.leads enable row level security;
